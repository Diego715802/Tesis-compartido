#!/usr/bin/env node
'use strict';
const fs = require('node:fs'); const path = require('node:path'); const os = require('node:os');
const { Pool } = require('pg');
const file = path.join(os.homedir(), 'Library/Application Support/ComeCore/CMC/ui-fixture.json');
async function main() {
  if (!fs.existsSync(file)) return process.stdout.write('No hay fixture CMC temporal.\n');
  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!/^qa-cmc-[a-f0-9]+@example\.invalid$/.test(fixture.email) || !/^[a-f0-9-]{36}$/.test(fixture.id)) throw new Error('Fixture inválida');
  const pool = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore' });
  try {
    await pool.query('BEGIN');
    const result = await pool.query('SELECT id FROM authn."user" WHERE id=$1 AND email=$2 FOR UPDATE', [fixture.id, fixture.email]);
    if (result.rowCount) {
      await pool.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [fixture.id]);
      await pool.query('DELETE FROM iam.app_users WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
      await pool.query('DELETE FROM authn."user" WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
    }
    await pool.query('COMMIT');
    fs.unlinkSync(file);
    process.stdout.write('Cuenta de prueba, sesiones y archivo privado de fixture retirados.\n');
  } catch (error) { await pool.query('ROLLBACK'); throw error; } finally { await pool.end(); }
}
main().catch(() => { process.stderr.write('No se pudo retirar la fixture CMC temporal; revisar antes de finalizar.\n'); process.exitCode = 1; });
