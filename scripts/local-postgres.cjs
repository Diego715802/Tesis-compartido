#!/usr/bin/env node
'use strict';

// Servidor de desarrollo aislado. No borra datos, no abre red pública y no imprime secretos.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const bin = process.env.COMECORE_PG_BIN || '/Applications/Postgres.app/Contents/Versions/18/bin';
const base = path.join(os.homedir(), 'Library', 'Application Support', 'ComeCore', 'PostgreSQL18');
const data = path.join(base, 'data');
const socket = path.join(base, 'socket');
const secretsFile = path.join(base, 'credentials.json');
const admin = os.userInfo().username;
const command = process.argv[2] || 'status';
const sqlLiteral = value => "'" + String(value).replaceAll("'", "''") + "'";
const sqlIdentifier = value => '"' + String(value).replaceAll('"', '""') + '"';

function safeOutput(value) {
  let output = String(value || '');
  if (fs.existsSync(secretsFile)) {
    for (const secret of Object.values(JSON.parse(fs.readFileSync(secretsFile, 'utf8')))) {
      output = output.replaceAll(secret, '[secreto omitido]');
    }
  }
  return output;
}

function run(program, args, input, env = {}) {
  const result = spawnSync(path.join(bin, program), args, {
    input, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 10 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    // Nunca incluir input SQL, entorno, credenciales ni objeto Error de spawn completo.
    throw new Error(`${program} falló: ${safeOutput(result.error?.code || result.stderr?.trim() || result.stdout?.trim() || result.status)}`);
  }
  return result.stdout.trim();
}
function sql(query, database = 'comecore') {
  return run('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-h', socket, '-U', admin, '-d', database, '-At'], query);
}
function running() {
  return spawnSync(path.join(bin, 'pg_ctl'), ['-D', data, 'status'], { stdio: 'ignore' }).status === 0;
}
function initialize() {
  for (const directory of [base, socket]) {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.chmodSync(directory, 0o700);
  }
  if (fs.existsSync(path.join(data, 'PG_VERSION'))) return;
  if (fs.existsSync(data) && fs.readdirSync(data).length) throw new Error('Directorio de datos no vacío: se conserva y se requiere revisión.');
  run('initdb', ['-D', data, '--username', admin, '--auth-local=peer', '--auth-host=scram-sha-256', '--encoding=UTF8', '--locale=en_US.UTF-8', '--data-checksums']);
  fs.appendFileSync(path.join(data, 'postgresql.conf'), `\n# ComeCore: exclusivamente desarrollo en esta Mac\nlisten_addresses = '127.0.0.1'\nport = 5432\nunix_socket_directories = ${sqlLiteral(socket)}\nunix_socket_permissions = 0700\npassword_encryption = 'scram-sha-256'\nmax_connections = 60\nshared_buffers = '128MB'\ntimezone = 'America/Mexico_City'\nssl = off\nlog_statement = 'none'\nlog_min_error_statement = 'panic'\nlog_parameter_max_length_on_error = 0\n`, { mode: 0o600 });
  fs.writeFileSync(path.join(data, 'pg_hba.conf'), `# Administración local por identidad del usuario macOS.\nlocal all ${admin} peer\nlocal all all reject\n# Solo dos cuentas de esta base, autenticadas mediante SCRAM.\nhost comecore comecore_runtime,comecore_designer 127.0.0.1/32 scram-sha-256\nhost all all 0.0.0.0/0 reject\nhost all all ::0/0 reject\n`, { mode: 0o600 });
}
function start() {
  if (!fs.existsSync(path.join(data, 'PG_VERSION'))) throw new Error('Primero ejecutar setup.');
  if (!running()) run('pg_ctl', ['-D', data, '-l', path.join(base, 'server.log'), '-w', '-t', '20', 'start']);
}
function credentials() {
  if (fs.existsSync(secretsFile)) return JSON.parse(fs.readFileSync(secretsFile, 'utf8'));
  const value = {
    comecore_runtime: crypto.randomBytes(32).toString('base64url'),
    comecore_designer: crypto.randomBytes(32).toString('base64url')
  };
  fs.writeFileSync(secretsFile, JSON.stringify(value), { mode: 0o600, flag: 'wx' });
  return value;
}
function setup() {
  initialize();
  start();
  if (sql("SELECT count(*) FROM pg_database WHERE datname='comecore';", 'postgres') === '0') {
    sql(fs.readFileSync(path.join(root, 'database/dbeaver/00_create_database.sql'), 'utf8'), 'postgres');
  }
  // No adoptar una base ajena o a medio migrar sin revisión.
  const ledgerExists = sql("SELECT to_regclass('app_private.schema_migrations') IS NOT NULL;") === 't';
  if (!ledgerExists && sql("SELECT count(*) FROM pg_tables WHERE schemaname IN ('iam','crm','audit');") !== '0') {
    throw new Error('Hay tablas existentes sin historial de migraciones; no se modificaron.');
  }
  sql(`CREATE SCHEMA IF NOT EXISTS app_private; CREATE TABLE IF NOT EXISTS app_private.schema_migrations (
    version text PRIMARY KEY, checksum char(64) NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
  ); REVOKE ALL ON app_private.schema_migrations FROM PUBLIC;`);
  for (const file of ['001_customer_domain.sql', '003_local_security.sql', '004_function_defaults.sql']) {
    const content = fs.readFileSync(path.join(root, 'database/migrations', file), 'utf8');
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const applied = sql(`SELECT checksum FROM app_private.schema_migrations WHERE version=${sqlLiteral(file)};`);
    if (applied && applied !== checksum) throw new Error(`La migración aplicada ${file} cambió; crear otra migración.`);
    if (applied) continue;
    // El historial se confirma en la MISMA transacción que la migración.
    const wrapped = content.replace(/COMMIT;\s*$/i, `INSERT INTO app_private.schema_migrations(version, checksum) VALUES (${sqlLiteral(file)}, ${sqlLiteral(checksum)});\nCOMMIT;`);
    if (wrapped === content) throw new Error(`Migración sin COMMIT final: ${file}`);
    sql(wrapped);
    process.stdout.write(`Migración aplicada: ${file}\n`);
  }
  const creds = credentials();
  const blocks = Object.entries(creds).map(([role, password]) => `
    DO $role$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname=${sqlLiteral(role)}) THEN
      CREATE ROLE ${sqlIdentifier(role)} LOGIN; END IF; END $role$;
    ALTER ROLE ${sqlIdentifier(role)} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
      CONNECTION LIMIT ${role === 'comecore_runtime' ? 20 : 8} PASSWORD ${sqlLiteral(password)};
    ALTER ROLE ${sqlIdentifier(role)} IN DATABASE comecore SET search_path = pg_catalog, crm, iam, audit;
    ALTER ROLE ${sqlIdentifier(role)} IN DATABASE comecore SET statement_timeout = '30s';
    ALTER ROLE ${sqlIdentifier(role)} IN DATABASE comecore SET idle_in_transaction_session_timeout = '30s';
  `).join('\n');
  sql(`BEGIN; SET LOCAL log_statement = 'none'; ${blocks}
    GRANT comecore_app TO comecore_runtime;
    GRANT comecore_owner, comecore_readonly TO comecore_designer;
    ALTER DEFAULT PRIVILEGES FOR ROLE comecore_designer REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
    COMMIT;`);

  const pgpass = path.join(os.homedir(), '.pgpass');
  const oldLines = fs.existsSync(pgpass) ? fs.readFileSync(pgpass, 'utf8').split('\n') : [];
  const kept = oldLines.filter(line => line && !/^127\.0\.0\.1:5432:comecore:comecore_(runtime|designer):/.test(line));
  for (const [role, password] of Object.entries(creds)) kept.push(`127.0.0.1:5432:comecore:${role}:${password}`);
  fs.writeFileSync(pgpass, kept.join('\n') + '\n', { mode: 0o600 });
  fs.chmodSync(pgpass, 0o600);
  const envFile = path.join(root, 'database/.env');
  if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, `# Desarrollo local; solo para el futuro backend, nunca para el navegador.\nDATABASE_URL=postgresql://comecore_runtime:${creds.comecore_runtime}@127.0.0.1:5432/comecore?sslmode=disable\n`, { mode: 0o600, flag: 'wx' });
  }
  process.stdout.write('Base comecore lista en 127.0.0.1:5432. Credenciales privadas guardadas; sin datos ficticios.\n');
}
try {
  if (command === 'setup') setup();
  else if (command === 'start') { start(); process.stdout.write('PostgreSQL local iniciado.\n'); }
  else if (command === 'stop') { if (running()) run('pg_ctl', ['-D', data, '-m', 'fast', '-w', '-t', '20', 'stop']); process.stdout.write('PostgreSQL local detenido sin borrar datos.\n'); }
  else if (command === 'status') {
    process.stdout.write(running() ? 'PostgreSQL local en ejecución.\n' : 'PostgreSQL local detenido.\n');
    if (running()) process.stdout.write(sql("SELECT current_database(), version();") + '\n');
  } else throw new Error('Usar setup, start, stop o status.');
} catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
