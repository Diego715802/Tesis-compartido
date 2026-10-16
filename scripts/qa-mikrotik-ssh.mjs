// Isolated, synthetic SSH peer for browser integration QA. No physical router.
// Run only with qa-monitor-session.mjs's disposable account and backend port free.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash, generateKeyPairSync, randomBytes } from 'node:crypto';
import ssh2 from 'ssh2';
import dotenv from 'dotenv';
import { securityConfig } from '../apps/backend/dist/security/config.js';
dotenv.config({ path: 'apps/backend/.env', quiet: true });
const { Server, utils } = ssh2;
assert.equal(securityConfig().deployment, 'local');
const fixture = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'Library/Application Support/ComeCore/ERP-Analysis/monitor-qa.json'), 'utf8'));
assert.match(fixture.email, /^qa-monitor-[0-9a-f]{24}@example\.invalid$/);
const key = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
const parsed = utils.parseKey(key);
assert.ok(!(parsed instanceof Error) && !Array.isArray(parsed));
const password = randomBytes(32).toString('hex');
let sample = 0;
const server = new Server({ hostKeys: [key] }, (client) => {
  client.on('error', () => {});
  client.on('authentication', (context) => {
    if (context.method === 'password' && context.username === 'qa-readonly' && context.password === password) context.accept();
    else context.reject();
  }).on('ready', () => client.on('session', (accept) => {
    accept().on('exec', (acceptExec, _reject, info) => {
      const stream = acceptExec();
      let data;
      if (info.command === ':put [/system identity get name]') data = 'QA SINTÉTICO — NO ES UN ROUTER FÍSICO';
      else if (info.command === '/system resource print as-value') data = `cpu-load=${25 + sample % 40};total-memory=256MiB;free-memory=128MiB;board-name=SIMULADOR QA;version=7.test;uptime=1h`;
      else if (info.command === '/system health print as-value') data = `name=cpu-temperature;value=${40 + sample % 10};type=C\nname=board-temperature1;value=${34 + sample % 5};type=C\nname=fan1-speed;value=1200;type=RPM\nname=fan2-speed;value=1300;type=RPM\nname=voltage;value=24;type=V\nname=power-consumption;value=8.4;type=W`;
      else if (info.command === '/interface print stats as-value') {
        sample++;
        data = ['ether1', 'bridge-local', 'ether2'].map((name, index) => `name=${name};running=true;disabled=false;rx-byte=${(sample + 1) * 2_000_000 * (index + 1)};tx-byte=${(sample + 1) * 1_000_000 * (index + 1)}`).join('\n');
      } else { stream.exit(1); stream.end(); return; }
      stream.write(data); stream.exit(0); stream.end();
    });
  }));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const child = spawn(process.execPath, ['dist/main.js'], { cwd: path.resolve('apps/backend'), stdio: ['ignore', 'ignore', 'inherit'], env: {
  ...process.env, PORT: '3001', MIKROTIK_HOST: '127.0.0.1', MIKROTIK_SSH_PORT: String(server.address().port),
  MIKROTIK_USERNAME: 'qa-readonly', MIKROTIK_PASSWORD: password, MIKROTIK_PRIVATE_KEY_PATH: '',
  MIKROTIK_ORGANIZATION_ID: fixture.org, MIKROTIK_SSH_HOST_HASH: createHash('sha256').update(parsed.getPublicSSH()).digest('hex'),
} });
function stop() { child.kill('SIGTERM'); server.close(); }
process.on('SIGTERM', stop); process.on('SIGINT', stop);
child.on('exit', (code) => { server.close(); process.exitCode = code ?? 0; });
console.log('LOCAL QA ONLY: synthetic SSH telemetry, disposable organization, no physical hardware. Stop with Ctrl+C and restart the normal backend.');
