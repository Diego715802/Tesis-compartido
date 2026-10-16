import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { Client, type ConnectConfig } from 'ssh2';
import {
  parseBoolean,
  parseRouterOsBytes,
  parseRouterOsHealth,
  parseRouterOsKeyValues,
  parseRouterOsNumber,
  parseRouterOsRecords,
} from './routeros-parser.js';
import type {
  MikrotikInterfaceTelemetry,
  MikrotikSensorValue,
  MikrotikTelemetry,
} from './mikrotik.types.js';
import { counterRate, healthSensors } from './telemetry-metrics.js';

type RawSnapshot = {
  capturedAt: number;
  interfaces: Array<{
    name: string;
    running: boolean;
    disabled: boolean;
    rxBytes: number;
    txBytes: number;
  }>;
};

type SshOutputs = {
  identity: string;
  resource: string;
  health: string;
  interfaces: string;
};

const emptyResource: MikrotikTelemetry['resource'] = {
  boardName: null,
  platform: null,
  version: null,
  uptime: null,
  cpuLoadPercent: null,
  memoryUsedPercent: null,
  freeMemoryBytes: null,
  totalMemoryBytes: null,
};

const emptyHealth: MikrotikTelemetry['health'] = {
  sensors: [],
  temperature: null,
  cpuTemperature: null,
  boardTemperature: null,
  voltage: null,
  current: null,
  powerConsumption: null,
  fanSpeed: null,
  acousticNoise: {
    available: false,
    reason: 'RouterOS no mide presión sonora. Se muestra la velocidad del ventilador cuando el equipo expone ese sensor.',
  },
};

function sensor(
  source: Record<string, string>,
  keys: string[],
  defaultUnit: string,
): MikrotikSensorValue | null {
  for (const key of keys) {
    const rawValue = source[key];
    const value = parseRouterOsNumber(rawValue);
    if (value === null) continue;
    return { value, unit: defaultUnit };
  }
  return null;
}

@Injectable()
export class MikrotikService {
  private previousSnapshot: RawSnapshot | null = null;
  private cachedTelemetry: { expiresAt: number; value: MikrotikTelemetry } | null = null;
  private pending: Promise<MikrotikTelemetry> | null = null;

  async getTelemetry(): Promise<MikrotikTelemetry> {
    if (this.cachedTelemetry && this.cachedTelemetry.expiresAt > Date.now()) {
      return this.cachedTelemetry.value;
    }
    // Share one read across dashboards/tabs. Avoid polling the router per viewer.
    if (this.pending) return this.pending;
    this.pending = this.readTelemetry().then((value) => {
      this.cachedTelemetry = { expiresAt: Date.now() + 10_000, value };
      return value;
    }).finally(() => { this.pending = null; });
    return this.pending;
  }

  private async readTelemetry(): Promise<MikrotikTelemetry> {

    const host = process.env.MIKROTIK_HOST?.trim();
    const username = process.env.MIKROTIK_USERNAME?.trim();
    const password = process.env.MIKROTIK_PASSWORD;
    const privateKeyPath = process.env.MIKROTIK_PRIVATE_KEY_PATH?.trim();
    const port = Number(process.env.MIKROTIK_SSH_PORT ?? 22);
    const endpoint = host ? `${host}:${port}` : 'sin configurar';

    if (!host || !username || (!password && !privateKeyPath)) {
      this.previousSnapshot = null;
      return this.emptyTelemetry(
        'configuration_required',
        'Configura host, usuario y una credencial de solo lectura en apps/backend/.env.',
        endpoint,
      );
    }
    const hostHash = process.env.MIKROTIK_SSH_HOST_HASH?.trim().toLowerCase();
    if (!hostHash || !/^[a-f0-9]{64}$/.test(hostHash) || !Number.isInteger(port) || port < 1 || port > 65535) {
      this.previousSnapshot = null;
      return this.emptyTelemetry('configuration_required', 'Configura y verifica la huella SSH del equipo antes de conectar.', endpoint);
    }

    try {
      const outputs = await this.collectOverSsh({
        host,
        port,
        username,
        password,
        privateKey: privateKeyPath ? readFileSync(privateKeyPath) : undefined,
        readyTimeout: 8_000,
        keepaliveInterval: 4_000,
        hostHash: 'sha256',
        hostVerifier: (hash: string) => hash === hostHash,
      });
      const telemetry = this.normalizeSshOutputs(outputs, endpoint);
      return telemetry;
    } catch (error) {
      this.previousSnapshot = null;
      const message = error instanceof Error ? error.message : 'Error desconocido';
      const normalizedMessage = message.toLowerCase();
      const authenticationFailed = normalizedMessage.includes('authentication');
      return this.emptyTelemetry(
        authenticationFailed ? 'authentication_failed' : 'unreachable',
        authenticationFailed
          ? 'El MikroTik rechazó la credencial de lectura.'
          : 'No fue posible consultar el MikroTik. Verifica el enlace, la dirección y el servicio SSH.',
        endpoint,
      );
    }
  }

  private collectOverSsh(config: ConnectConfig): Promise<SshOutputs> {
    return new Promise((resolve, reject) => {
      const connection = new Client();
      let settled = false;
      const timeout = setTimeout(() => finishWithError(new Error('Tiempo de consulta agotado.')), 12_000);

      const finishWithError = (error: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        connection.end();
        reject(error);
      };

      connection
        .once('ready', async () => {
          try {
            const [identity, resource, health, interfaces] = await Promise.all([
              this.execute(connection, ':put [/system identity get name]'),
              this.execute(connection, '/system resource print as-value'),
              // Some models do not expose /system health. Other metrics remain usable.
              this.execute(connection, '/system health print as-value').catch(() => ''),
              this.execute(connection, '/interface print stats as-value'),
            ]);
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            connection.end();
            resolve({ identity, resource, health, interfaces });
          } catch (error) {
            finishWithError(error instanceof Error ? error : new Error('Falló la consulta SSH.'));
          }
        })
        .once('error', finishWithError)
        .once('close', () => { if (!settled) finishWithError(new Error('Conexión cerrada.')); })
        .connect(config);
    });
  }

  private execute(connection: Client, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      connection.exec(command, (error, stream) => {
        if (error) {
          reject(error);
          return;
        }

        let stdout = '';
        let stderr = '';
        stream.on('data', (chunk: Buffer) => {
          stdout += chunk.toString('utf8');
          if (stdout.length > 1_048_576) { stream.close(); reject(new Error('Respuesta demasiado grande.')); }
        });
        stream.stderr.on('data', (chunk: Buffer) => {
          stderr += chunk.toString('utf8');
          if (stderr.length > 8192) { stream.close(); reject(new Error('Respuesta de error demasiado grande.')); }
        });
        stream.once('close', (code: number | null) => {
          if (code && code !== 0) {
            reject(new Error(stderr.trim() || `RouterOS devolvió el código ${code}.`));
            return;
          }
          resolve(stdout.trim());
        });
      });
    });
  }

  private normalizeSshOutputs(outputs: SshOutputs, endpoint: string): MikrotikTelemetry {
    const capturedAt = Date.now();
    const resource = parseRouterOsKeyValues(outputs.resource);
    const health = parseRouterOsHealth(outputs.health);
    const interfaceRecords = parseRouterOsRecords(outputs.interfaces);
    const totalMemoryBytes = parseRouterOsBytes(resource['total-memory']);
    const freeMemoryBytes = parseRouterOsBytes(resource['free-memory']);
    const currentSnapshot: RawSnapshot = {
      capturedAt,
      interfaces: interfaceRecords.map((record) => ({
        name: record.name ?? 'sin-nombre',
        running: parseBoolean(record.running),
        disabled: parseBoolean(record.disabled),
        rxBytes: parseRouterOsBytes(record['rx-byte'] ?? record['rx-bytes']),
        txBytes: parseRouterOsBytes(record['tx-byte'] ?? record['tx-bytes']),
      })),
    };
    const interfaces = this.calculateInterfaceRates(currentSnapshot);
    this.previousSnapshot = currentSnapshot;

    return {
      state: 'connected',
      message: 'Telemetría de solo lectura recibida desde RouterOS.',
      capturedAt: new Date(capturedAt).toISOString(),
      transport: 'ssh',
      endpoint,
      identity: outputs.identity.trim() || null,
      resource: {
        boardName: resource['board-name'] ?? null,
        platform: resource.platform ?? resource['architecture-name'] ?? null,
        version: resource.version ?? null,
        uptime: resource.uptime ?? null,
        cpuLoadPercent: parseRouterOsNumber(resource['cpu-load']),
        memoryUsedPercent: totalMemoryBytes > 0
          ? Number((((totalMemoryBytes - freeMemoryBytes) / totalMemoryBytes) * 100).toFixed(2))
          : null,
        freeMemoryBytes,
        totalMemoryBytes,
      },
      health: {
        ...emptyHealth,
        sensors: healthSensors(health),
        temperature: sensor(health, ['temperature'], 'C'),
        cpuTemperature: sensor(health, ['cpu-temperature'], 'C'),
        boardTemperature: sensor(health, ['board-temperature', 'board-temperature1', 'pcb-temperature'], 'C'),
        voltage: sensor(health, ['voltage'], 'V'),
        current: sensor(health, ['current'], 'A'),
        powerConsumption: sensor(health, ['power-consumption', 'power'], 'W'),
        fanSpeed: sensor(health, ['fan1-speed', 'fan-speed', 'fan2-speed'], 'RPM'),
      },
      traffic: {
        ratesReady: interfaces.length > 0 && interfaces.every((item) => item.ratesReady),
        rxBitsPerSecond: interfaces.reduce((total, item) => total + item.rxBitsPerSecond, 0),
        txBitsPerSecond: interfaces.reduce((total, item) => total + item.txBitsPerSecond, 0),
        interfaces,
      },
    };
  }

  private calculateInterfaceRates(snapshot: RawSnapshot): MikrotikInterfaceTelemetry[] {
    const elapsedSeconds = this.previousSnapshot
      ? Math.max((snapshot.capturedAt - this.previousSnapshot.capturedAt) / 1000, 0.001)
      : 0;

    return snapshot.interfaces.map((current) => {
      const previous = this.previousSnapshot?.interfaces.find((item) => item.name === current.name);
      const rxBitsPerSecond = counterRate(current.rxBytes, previous?.rxBytes, elapsedSeconds);
      const txBitsPerSecond = counterRate(current.txBytes, previous?.txBytes, elapsedSeconds);
      return {
        ...current,
        ratesReady: rxBitsPerSecond !== null && txBitsPerSecond !== null,
        rxBitsPerSecond: rxBitsPerSecond ?? 0,
        txBitsPerSecond: txBitsPerSecond ?? 0,
      };
    });
  }

  private emptyTelemetry(
    state: MikrotikTelemetry['state'],
    message: string,
    endpoint: string,
  ): MikrotikTelemetry {
    return {
      state,
      message,
      capturedAt: new Date().toISOString(),
      transport: 'ssh',
      endpoint,
      identity: null,
      resource: { ...emptyResource },
      health: { ...emptyHealth },
      traffic: { ratesReady: false, rxBitsPerSecond: 0, txBitsPerSecond: 0, interfaces: [] },
    };
  }
}
