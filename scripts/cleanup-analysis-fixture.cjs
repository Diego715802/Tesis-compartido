#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { Pool } = require('pg');
const file = path.join(os.homedir(), 'Library/Application Support/ComeCore/ERP-Analysis/ui-fixture.json');
async function main() {
  if (!fs.existsSync(file)) return console.log('No hay fixture de análisis pendiente.');
  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  if (!/^qa-db-[a-f0-9]+@example\.invalid$/.test(fixture.email) || !uuid.test(fixture.id) || !uuid.test(fixture.organizationId)) throw new Error('Fixture inválida; se conserva.');
  const pool = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const owner = await client.query('SELECT id FROM authn."user" WHERE id=$1 AND email=$2 FOR UPDATE', [fixture.id, fixture.email]);
    const org = await client.query('SELECT code FROM iam.organizations WHERE id=$1 FOR UPDATE', [fixture.organizationId]);
    if (org.rowCount && !/^QA_DB_[A-Fa-f0-9]+$/.test(org.rows[0].code)) throw new Error('Organización ajena al análisis.');
    const others = await client.query('SELECT 1 FROM iam.organization_memberships WHERE organization_id=$1 AND user_id<>$2', [fixture.organizationId, fixture.id]);
    if (others.rowCount) throw new Error('La organización tiene otros miembros; se conserva.');
    if (owner.rowCount) {
      await client.query('DELETE FROM erp.customer_workspaces WHERE organization_id=$1', [fixture.organizationId]);
      await client.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [fixture.id]);
      await client.query('DELETE FROM iam.app_users WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
      await client.query('DELETE FROM authn."user" WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
      await client.query('DELETE FROM iam.organizations WHERE id=$1', [fixture.organizationId]);
    }
    await client.query('COMMIT');
    fs.unlinkSync(file);
    console.log('Fixture de análisis aislada, sesiones y archivo privado retirados.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
main().catch(() => { console.error('No se pudo retirar la fixture; se conservan los datos para revisión.'); process.exitCode = 1; });
