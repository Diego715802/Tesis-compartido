#!/usr/bin/env node
'use strict';
const fs = require('node:fs'); const path = require('node:path'); const os = require('node:os');
const crypto = require('node:crypto'); const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const base = path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18');
const bin = '/Applications/Postgres.app/Contents/Versions/18/bin';
const literal = value => "'" + value.replaceAll("'", "''") + "'";
const sql = query => execFileSync(path.join(bin, 'psql'), ['-X', '-v', 'ON_ERROR_STOP=1', '-At', '-h', path.join(base, 'socket'), '-U', os.userInfo().username, '-d', 'comecore'], { input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const privateFile = path.join(base, 'auth-credentials.json');
try {
  // Solo migraciones nuevas y con historial: nunca editar/aplicar de nuevo una existente.
  for (const filename of process.argv.includes('--core-only') ? ['005_authentication.sql', '006_secure_workspace.sql'] : ['005_authentication.sql', '006_secure_workspace.sql', '007_erp_domains.sql']) {
    const file = path.join(root, 'database/migrations', filename); if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8'); const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const existing = sql(`SELECT checksum FROM app_private.schema_migrations WHERE version=${literal(filename)};`);
    if (existing) { if (existing !== checksum) throw new Error('Checksum de migración aplicada distinto: ' + filename); continue; }
    const wrapped = content.replace(/COMMIT;\s*$/i, `INSERT INTO app_private.schema_migrations(version,checksum) VALUES (${literal(filename)},${literal(checksum)});\nCOMMIT;`);
    if (wrapped === content) throw new Error('Migración sin COMMIT final: ' + filename);
    sql(wrapped); process.stdout.write(`Aplicada ${filename}\n`);
  }
  const creds = fs.existsSync(privateFile) ? JSON.parse(fs.readFileSync(privateFile, 'utf8')) : {
    authPassword: crypto.randomBytes(32).toString('base64url'), secret: crypto.randomBytes(48).toString('base64url'),
    gateway: crypto.randomBytes(48).toString('base64url'), workspaceKey: crypto.randomBytes(48).toString('base64url')
  };
  fs.writeFileSync(privateFile, JSON.stringify(creds), { mode: 0o600 }); fs.chmodSync(privateFile, 0o600);
  sql(`DO $role$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='comecore_auth_runtime') THEN CREATE ROLE comecore_auth_runtime LOGIN; END IF; END $role$;
    ALTER ROLE comecore_auth_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 12 PASSWORD ${literal(creds.authPassword)};
    GRANT comecore_auth TO comecore_auth_runtime;
    ALTER ROLE comecore_auth_runtime IN DATABASE comecore SET statement_timeout='30s';
    ALTER ROLE comecore_auth_runtime IN DATABASE comecore SET idle_in_transaction_session_timeout='30s';`);
  const hba = path.join(base, 'data/pg_hba.conf'); let rules = fs.readFileSync(hba, 'utf8');
  if (!rules.includes('host comecore comecore_auth_runtime ')) {
    rules = rules.replace('host all all 0.0.0.0/0 reject', 'host comecore comecore_auth_runtime 127.0.0.1/32 scram-sha-256\nhost all all 0.0.0.0/0 reject');
    fs.writeFileSync(hba, rules, { mode: 0o600 }); execFileSync(path.join(bin, 'pg_ctl'), ['-D', path.join(base, 'data'), 'reload'], { stdio: 'ignore' });
  }
  const runtime = JSON.parse(fs.readFileSync(path.join(base, 'credentials.json'), 'utf8')).comecore_runtime;
  const values = { AUTH_PUBLIC_ORIGIN: 'http://localhost:3000', AUTH_DEPLOYMENT: 'local',
    BETTER_AUTH_SECRET: creds.secret, AUTH_GATEWAY_SECRET: creds.gateway,
    AUTH_DATABASE_URL: `postgresql://comecore_auth_runtime:${creds.authPassword}@127.0.0.1:5432/comecore?sslmode=disable`,
    DATABASE_URL: `postgresql://comecore_runtime:${runtime}@127.0.0.1:5432/comecore?sslmode=disable`, WORKSPACE_ENCRYPTION_KEY: creds.workspaceKey };
  function merge(file, keys) {
    const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const lines = existing.split('\n').filter(line => !keys.some(key => line.startsWith(key + '=')));
    for (const key of keys) lines.push(`${key}=${values[key]}`);
    fs.writeFileSync(file, lines.filter(Boolean).join('\n') + '\n', { mode: 0o600 }); fs.chmodSync(file, 0o600);
  }
  merge(path.join(root, 'apps/backend/.env'), Object.keys(values));
  merge(path.join(root, 'apps/frontend/.env.local'), ['AUTH_PUBLIC_ORIGIN', 'AUTH_DEPLOYMENT', 'AUTH_GATEWAY_SECRET']);
  process.stdout.write('Configuración local privada generada. No se imprimieron secretos. SMTP continúa pendiente.\n');
} catch (error) {
  // No imprimir stderr de SQL de cuentas: puede contener fragmentos con secretos.
  process.stderr.write(error.message?.startsWith('Checksum') || error.message?.startsWith('Migración') ? error.message + '\n' : 'No se completó setup-auth. Revisar migraciones y configuración local; no se expusieron secretos.\n'); process.exitCode = 1;
}
