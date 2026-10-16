import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash, generateKeyPairSync, randomBytes } from 'node:crypto';
import { Server, utils } from 'ssh2';
import { MikrotikService } from './mikrotik.service.js';
import { counterRate, healthSensors } from './telemetry-metrics.js';

describe('MikroTik read-only telemetry', () => {
  let server: Server;
  let bytes: number;
  let commands: string[];
  let now: number;
  beforeEach(async () => {
    bytes = 1000; commands = []; now = Date.now();
    const key = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
    const parsed = utils.parseKey(key);
    if (parsed instanceof Error || Array.isArray(parsed)) throw new Error('Invalid fixture SSH key');
    const password = randomBytes(24).toString('hex');
    server = new Server({ hostKeys: [key] }, (client) => {
      // Host-key rejection intentionally disconnects during key exchange.
      client.on('error', () => {});
      client.on('authentication', (context) => {
        if (context.method === 'password' && context.username === 'qa-readonly' && context.password === password) context.accept();
        else context.reject();
      }).on('ready', () => client.on('session', (accept) => {
        accept().on('exec', (acceptExec, _rejectExec, info) => {
          commands.push(info.command);
          const stream = acceptExec();
          const data = info.command === ':put [/system identity get name]' ? 'Router QA sintético'
            : info.command === '/system resource print as-value' ? 'cpu-load=24;total-memory=256MiB;free-memory=128MiB;board-name=QA;version=7.test;uptime=1h'
            : info.command === '/system health print as-value' ? 'name=cpu-temperature;value=42;type=C\nname=board-temperature1;value=36.5;type=C\nname=fan1-speed;value=1200;type=RPM\nname=fan2-speed;value=1300;type=RPM\nname=voltage;value=24;type=V\nname=power-consumption;value=8.4;type=W'
            : info.command === '/interface print stats as-value' ? `name=ether1;running=true;disabled=false;rx-byte=${bytes};tx-byte=${bytes * 2}` : '';
          stream.write(data); stream.exit(0); stream.end();
        });
      }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (typeof address === 'string' || !address) throw new Error('No fixture port');
    vi.stubEnv('MIKROTIK_HOST', '127.0.0.1');
    vi.stubEnv('MIKROTIK_SSH_PORT', String(address.port));
    vi.stubEnv('MIKROTIK_USERNAME', 'qa-readonly');
    vi.stubEnv('MIKROTIK_PASSWORD', password);
    vi.stubEnv('MIKROTIK_PRIVATE_KEY_PATH', '');
    vi.stubEnv('MIKROTIK_SSH_HOST_HASH', createHash('sha256').update(parsed.getPublicSSH()).digest('hex'));
    vi.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(async () => {
    vi.restoreAllMocks(); vi.unstubAllEnvs();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  it('collects all real SSH fixture sensors and shares concurrent reads', async () => {
    const service = new MikrotikService();
    const [first, second] = await Promise.all([service.getTelemetry(), service.getTelemetry()]);
    expect(first).toEqual(second);
    expect(first.state).toBe('connected');
    expect(first.health.sensors).toHaveLength(6);
    expect(first.health.boardTemperature?.value).toBe(36.5);
    expect(first.traffic.ratesReady).toBe(false);
    expect(commands).toHaveLength(4);
    await service.getTelemetry(); expect(commands).toHaveLength(4);
    now += 15_000; bytes = 1600;
    const next = await service.getTelemetry();
    expect(next.traffic.ratesReady).toBe(true);
    expect(next.traffic.rxBitsPerSecond).toBe(320);
    expect(next.traffic.txBitsPerSecond).toBe(640);
    expect(commands.every((command) => command.includes(' print ') || command.startsWith(':put'))).toBe(true);
    now += 15_000; bytes = 5;
    expect((await service.getTelemetry()).traffic.ratesReady).toBe(false);
  });
  it('rejects an untrusted SSH host key without returning metrics', async () => {
    vi.stubEnv('MIKROTIK_SSH_HOST_HASH', '0'.repeat(64));
    const result = await new MikrotikService().getTelemetry();
    expect(result.state).toBe('unreachable'); expect(commands).toHaveLength(0);
    expect(result.health.sensors).toEqual([]);
  });
  it('fails closed on absent credentials', async () => {
    vi.stubEnv('MIKROTIK_PASSWORD', '');
    const result = await new MikrotikService().getTelemetry();
    expect(result.state).toBe('configuration_required'); expect(commands).toHaveLength(0);
  });
});

describe('measurement semantics', () => {
  it('does not invent rates on first sample, reset, or excessive gap', () => {
    expect(counterRate(100, undefined, 15)).toBeNull();
    expect(counterRate(10, 100, 15)).toBeNull();
    expect(counterRate(1000, 100, 90)).toBeNull();
    expect(counterRate(1000, 100, 0)).toBeNull();
    expect(counterRate(100, 100, 15)).toBe(0);
  });
  it('preserves native CLI units and ignores nonnumeric or unrelated health fields', () => {
    expect(healthSensors({ 'cpu-temperature': '42C', 'board-temperature2': '38.5C', 'fan2-speed': '0RPM', 'psu1-voltage': '24V', 'psu2-current': '2A', 'power-consumption': '8.4W', name: '42', value: '42', type: 'C', 'fan3-speed': 'unknown' })).toHaveLength(6);
  });
});
