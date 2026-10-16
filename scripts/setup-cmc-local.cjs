#!/usr/bin/env node
'use strict';
// Local-only configuration; no deployment and no default credentials.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomBytes } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const privateRoot = path.join(os.homedir(), 'Library/Application Support/ComeCore/CMC');
const settingsFile = path.join(privateRoot, 'local-connection.json');
function option(name) { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
try {
  const previous = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile, 'utf8')) : undefined;
  const source = path.resolve(option('--cmc-root') || previous?.projectRoot || '');
  if (!fs.existsSync(path.join(source, 'backend/integrations/erp-server.mjs'))) throw new Error('Indica --cmc-root con el proyecto CometaLink que contiene el puente.');
  const socket = path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket');
  const rows = execFileSync('/Applications/Postgres.app/Contents/Versions/18/bin/psql', ['-X', '-At', '-v', 'ON_ERROR_STOP=1', '-h', socket, '-U', os.userInfo().username, '-d', 'comecore', '-c', "SELECT id::text FROM iam.organizations WHERE status='active' ORDER BY created_at;"], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n').filter(Boolean);
  const organizationId = option('--organization') || previous?.organizationId || (rows.length === 1 ? rows[0] : undefined);
  if (!organizationId || !rows.includes(organizationId)) throw new Error('Selecciona una organización activa con --organization; no se vinculan varias empresas al mismo sitio.');
  const settings = previous || {
    environment: {
      CMC_ERP_BRIDGE_SECRET: randomBytes(48).toString('base64url'),
      CMC_DATA_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
      CMC_SESSION_SECRET: randomBytes(48).toString('base64url'),
    },
  };
  settings.projectRoot = source;
  settings.organizationId = organizationId;
  settings.bridgeUrl = 'http://127.0.0.1:3101';
  settings.publicUrl = 'http://localhost:3100';
  Object.assign(settings.environment, { NODE_ENV: 'development', CMC_REQUIRE_MFA: '1',
    CMC_STORAGE_DIR: path.join(privateRoot, 'site-store'), CMC_ERP_ORGANIZATION_ID: organizationId, CMC_ERP_PORT: '3101' });
  fs.mkdirSync(privateRoot, { recursive: true, mode: 0o700 });
  fs.chmodSync(privateRoot, 0o700);
  fs.mkdirSync(settings.environment.CMC_STORAGE_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
  fs.chmodSync(settingsFile, 0o600);
  const file = path.join(root, 'apps/backend/.env');
  const values = { CMC_BRIDGE_URL: settings.bridgeUrl, CMC_BRIDGE_SECRET: settings.environment.CMC_ERP_BRIDGE_SECRET, CMC_PUBLIC_URL: settings.publicUrl };
  const lines = (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '').split('\n').filter(line => !Object.keys(values).some(key => line.startsWith(key + '=')));
  for (const [key, value] of Object.entries(values)) lines.push(`${key}=${value}`);
  fs.writeFileSync(file, lines.filter(Boolean).join('\n') + '\n', { mode: 0o600 });
  fs.chmodSync(file, 0o600);
  process.stdout.write('Conexión CMC local configurada. Secretos en archivos privados; el sitio publicado no se modificó.\n');
} catch (error) {
  process.stderr.write(error.message?.startsWith('Indica') || error.message?.startsWith('Selecciona') ? error.message + '\n' : 'No se pudo preparar la conexión local del CMC. No se imprimieron secretos.\n');
  process.exitCode = 1;
}
