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
    const detectedUnit = rawValue
      .replace(String(value), '')
      .replace('°', '')
      .trim();
    return { value, unit: detectedUnit || defaultUnit };
  }
  return null;
}

@Injectable()
export class MikrotikService {
  private previousSnapshot: RawSnapshot | null = null;
  private cachedTelemetry: { expiresAt: number; value: MikrotikTelemetry } | null = null;

  async getTelemetry(): Promise<MikrotikTelemetry> {
    if (this.cachedTelemetry && this.cachedTelemetry.expiresAt > Date.now()) {
      return this.cachedTelemetry.value;
    }

    const host = process.env.MIKROTIK_HOST?.trim();
    const username = process.env.MIKROTIK_USERNAME?.trim();
    const password = process.env.MIKROTIK_PASSWORD;
    const privateKeyPath = process.env.MIKROTIK_PRIVATE_KEY_PATH?.trim();
    const port = Number(process.env.MIKROTIK_SSH_PORT ?? 22);
    const endpoint = host ? `${host}:${port}` : 'sin configurar';

    if (!host || !username || (!password && !privateKeyPath)) {
      return this.emptyTelemetry(
        'configuration_required',
        'Configura host, usuario y una credencial de solo lectura en apps/backend/.env.',
        endpoint,
      );
    }
    const hostHash = process.env.MIKROTIK_SSH_HOST_HASH?.trim().toLowerCase();
    if (!hostHash || !/^[a-f0-9]{64}$/.test(hostHash) || !Number.isInteger(port) || port < 1 || port > 65535) {
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
      this.cachedTelemetry = { expiresAt: Date.now() + 4_000, value: telemetry };
      return telemetry;
    } catch (error) {
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

      const finishWithError = (error: Error) => {
        if (settled) return;
        settled = true;
        connection.end();
        reject(error);
      };

      connection
        .once('ready', async () => {
          try {
            const [identity, resource, health, interfaces] = await Promise.all([
              this.execute(connection, ':put [/system identity get name]'),
              this.execute(connection, '/system resource print as-value'),
              this.execute(connection, '/system health print as-value'),
              this.execute(connection, '/interface print stats as-value'),
            ]);
            if (settled) return;
            settled = true;
            connection.end();
            resolve({ identity, resource, health, interfaces });
          } catch (error) {
            finishWithError(error instanceof Error ? error : new Error('Falló la consulta SSH.'));
          }
        })
        .once('error', finishWithError)
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
        });
        stream.stderr.on('data', (chunk: Buffer) => {
          stderr += chunk.toString('utf8');
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
        temperature: sensor(health, ['temperature'], 'C'),
        cpuTemperature: sensor(health, ['cpu-temperature'], 'C'),
        boardTemperature: sensor(health, ['board-temperature'], 'C'),
        voltage: sensor(health, ['voltage'], 'V'),
        current: sensor(health, ['current'], 'A'),
        powerConsumption: sensor(health, ['power-consumption', 'power'], 'W'),
        fanSpeed: sensor(health, ['fan1-speed', 'fan-speed', 'fan2-speed'], 'RPM'),
      },
      traffic: {
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
      const rxBitsPerSecond = previous && elapsedSeconds
        ? Math.max(0, ((current.rxBytes - previous.rxBytes) * 8) / elapsedSeconds)
        : 0;
      const txBitsPerSecond = previous && elapsedSeconds
        ? Math.max(0, ((current.txBytes - previous.txBytes) * 8) / elapsedSeconds)
        : 0;
      return {
        ...current,
        rxBitsPerSecond: Math.round(rxBitsPerSecond),
        txBitsPerSecond: Math.round(txBitsPerSecond),
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
      traffic: { rxBitsPerSecond: 0, txBitsPerSecond: 0, interfaces: [] },
    };
  }
}
