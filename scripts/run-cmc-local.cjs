#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const file = path.join(os.homedir(), 'Library/Application Support/ComeCore/CMC/local-connection.json');
try {
  const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
  const mode = process.argv[2];
  if (!['bridge', 'site'].includes(mode)) throw new Error('Usa: node scripts/run-cmc-local.cjs bridge|site');
  const command = mode === 'bridge' ? ['backend/integrations/erp-server.mjs']
    : ['node_modules/vinext/dist/cli.js', 'dev', '--host', '127.0.0.1', '--port', '3100', '--strictPort'];
  const env = { ...process.env, ...settings.environment };
  // Keep generated development keys in process environment, never command arguments.
  delete env.CMC_ALLOW_PLAINTEXT_MIGRATION;
  const child = spawn(process.execPath, command, { cwd: settings.projectRoot, env, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', () => { process.stderr.write('No se pudo iniciar el CMC local.\n'); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 0; });
} catch {
  process.stderr.write('Configura primero el CMC con setup-cmc-local.cjs y elige bridge o site.\n');
  process.exitCode = 1;
}
