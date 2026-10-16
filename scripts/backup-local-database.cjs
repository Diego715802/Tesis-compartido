#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const bin = process.env.COMECORE_PG_BIN || '/Applications/Postgres.app/Contents/Versions/18/bin';
const base = path.join(os.homedir(), 'Library', 'Application Support', 'ComeCore', 'PostgreSQL18');
const directory = path.join(base, 'backups');
const common = ['-h', path.join(base, 'socket'), '-U', os.userInfo().username, '-w'];
const verify = process.argv.includes('--verify');
const identifier = value => '"' + value.replaceAll('"', '""') + '"';
const run = (program, args, input) => execFileSync(path.join(bin, program), args, {
  input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024
});
const sql = (database, query) => run('psql', [...common, '-X', '-v', 'ON_ERROR_STOP=1', '-d', database, '-At'], query).trim();
let temporaryDatabase;
try {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const file = path.join(directory, `comecore-${stamp}.dump`);
  run('pg_dump', [...common, '-d', 'comecore', '-Fc', '-f', file]);
  fs.chmodSync(file, 0o600);
  const manifest = {
    database: 'comecore', created_at: new Date().toISOString(),
    sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    restoration_verified: false
  };
  if (verify) {
    // Crear una base NUEVA y aleatoria; nunca restaurar sobre la base operativa.
    temporaryDatabase = `comecore_restore_${crypto.randomBytes(8).toString('hex')}`;
    sql('postgres', `CREATE DATABASE ${identifier(temporaryDatabase)} TEMPLATE template0;`);
    run('pg_restore', [...common, '-d', temporaryDatabase, '--single-transaction', '--exit-on-error', file]);
    const query = "SELECT string_agg(schemaname || '.' || tablename, ',' ORDER BY schemaname, tablename) FROM pg_tables WHERE schemaname NOT LIKE 'pg_%' AND schemaname <> 'information_schema';";
    if (sql('comecore', query) !== sql(temporaryDatabase, query)) throw new Error('Las tablas restauradas difieren de la fuente.');
    const history = 'SELECT version || \'|\' || checksum FROM app_private.schema_migrations ORDER BY version;';
    if (sql('comecore', history) !== sql(temporaryDatabase, history)) throw new Error('El historial restaurado difiere de la fuente.');
    const structure = "SELECT n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity,count(k.oid) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_constraint k ON k.conrelid=c.oid WHERE c.relkind='r' AND n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' GROUP BY n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity ORDER BY 1,2;";
    if(sql('comecore',structure)!==sql(temporaryDatabase,structure))throw new Error('RLS o restricciones restauradas difieren.');
    const counts = "SELECT format('SELECT %L || count(*) FROM %I.%I;',schemaname||'.'||tablename||'|',schemaname,tablename) FROM pg_tables WHERE schemaname NOT LIKE 'pg_%' AND schemaname<>'information_schema' ORDER BY schemaname,tablename;";
    const countingSql=sql('comecore',counts);
    if(sql('comecore',countingSql)!==sql(temporaryDatabase,countingSql))throw new Error('Cantidad de registros restaurados difiere.');
    manifest.restoration_verified = true;
    manifest.verified_scope = 'Todas las tablas de aplicación, recuentos, RLS, restricciones e historial';
  }
  fs.writeFileSync(file + '.json', JSON.stringify(manifest, null, 2), { mode: 0o600 });
  process.stdout.write(`Respaldo privado creado: ${file}\nRestauración verificada: ${manifest.restoration_verified ? 'sí (tablas e historial)' : 'no; usar --verify'}\n`);
} catch {
  process.stderr.write('Falló el respaldo o su comprobación. Se conserva cualquier archivo generado; revisar PostgreSQL local.\n');
  process.exitCode = 1;
} finally {
  if (temporaryDatabase) {
    try { sql('postgres', `DROP DATABASE ${identifier(temporaryDatabase)};`); }
    catch { process.stderr.write(`Se conserva la base temporal ${temporaryDatabase}; requiere limpieza administrativa.\n`); process.exitCode = 1; }
  }
}
