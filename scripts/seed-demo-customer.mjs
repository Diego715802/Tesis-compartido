#!/usr/bin/env node
// Mantenimiento local explícito. No crea cuentas, sesiones, ni rutas de bypass.
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { securityConfig } from '../apps/backend/dist/security/config.js';
import { customerSchema, workspaceEnvelopeSchema } from '../apps/backend/dist/workspace/workspace-schema.js';
import { authorizeWorkspaceUpdate } from '../apps/backend/dist/workspace/workspace-permissions.js';
import { lockRelationalWorkspace, readRelationalWorkspace, writeRelationalWorkspace } from '../apps/backend/dist/workspace/relational-workspace.js';
import { DEMO_CUSTOMER_KEY, DEMO_CUSTOMER_CODE, DEMO_PLANS, makeDemoCustomer } from './fixtures/demo-customer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'apps/backend/.env'), quiet: true });
const config = securityConfig();
assert.equal(config.deployment, 'local', 'La semilla está prohibida en despliegues públicos.');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(config.databaseUrl).hostname), 'La base debe ser local.');
function argument(name) { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; }
const organization = argument('--organization'), operator = argument('--operator-id');
assert.ok(organization && /^[0-9a-f-]{36}$/i.test(operator || ''), 'Indica --organization CODIGO --operator-id UUID de un propietario activo.');
const admin = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore', max: 1 });
const runtime = new Pool({ connectionString: config.databaseUrl, max: 1 });
let client;
try {
  // El usuario del SO ya debe administrar esta base. Solo se admite un propietario
  // real, activo y con MFA configurado; nunca se inventa una identidad de cliente HTTP.
  const actor = await admin.query(`SELECT u.id,u.email,u.display_name,o.id organization_id,o.name organization_name
    FROM iam.organizations o JOIN iam.organization_memberships m ON m.organization_id=o.id
    JOIN iam.app_users u ON u.id=m.user_id
    WHERE o.code=$1 AND u.id=$2 AND o.status='active' AND m.status='active' AND u.status='active' AND m.role='owner'
      AND EXISTS(SELECT 1 FROM authn."twoFactor" f WHERE f."userId"=u.id AND f.verified)
      AND NOT EXISTS(SELECT 1 FROM security.account_flags f WHERE f.user_id=u.id AND f.must_change_password)`, [organization, operator]);
  assert.equal(actor.rowCount, 1, 'No hay un propietario autorizado con MFA en la organización indicada.');
  const a = actor.rows[0];
  const identity = { user: { id: a.id, email: a.email, name: a.display_name }, organization: { id: a.organization_id, name: a.organization_name }, role: 'owner', permissions: ['clientes:read','clientes:write','contratos:read','contratos:write','planes:read','planes:write','facturacion:read','facturacion:write','red:secrets'], mfaRequired: false, passwordChangeRequired: false };
  client = await runtime.connect();
  await client.query('BEGIN');
  const boundary = await client.query('SELECT current_user AS role,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user');
  assert.equal(boundary.rows[0].role, 'comecore_runtime'); assert.equal(boundary.rows[0].rolsuper, false); assert.equal(boundary.rows[0].rolbypassrls, false);
  await client.query("SELECT set_config('app.user_id',$1,true),set_config('app.organization_id',$2,true),set_config('app.request_id',gen_random_uuid()::text,true)", [a.id, a.organization_id]);
  await lockRelationalWorkspace(client, identity);
  const stored = (await client.query('SELECT version,payload_ciphertext FROM erp.customer_workspaces WHERE organization_id=$1 FOR UPDATE', [a.organization_id])).rows[0];
  let customers = [], version = stored?.version ?? 0;
  if (stored) {
    const envelope = workspaceEnvelopeSchema.parse(JSON.parse(await symmetricDecrypt({ key: config.workspaceKey, data: stored.payload_ciphertext })));
    assert.equal(envelope.organizationId, a.organization_id); assert.equal(envelope.version, version); customers = envelope.customers;
  }
  customers = await readRelationalWorkspace(client, identity, customers);
  const existing = customers.find(c => c.id === DEMO_CUSTOMER_KEY);
  if (existing) {
    assert.equal(existing.customId, DEMO_CUSTOMER_CODE);
    await client.query('COMMIT');
    console.log('El cliente CCPRUEBA001 ya existe. Se conservan sus cambios y no se duplica.');
  } else {
    assert.ok(!customers.some(c => c.customId.toUpperCase() === DEMO_CUSTOMER_CODE), 'El código está ocupado; no se sobrescribe.');
    const plans = [];
    for (const p of DEMO_PLANS) {
      const found = await client.query('SELECT id,price::float8 AS price,upload_kbps::int AS speed FROM catalog.service_plans WHERE organization_id=$1 AND name=$2 AND deleted_at IS NULL', [a.organization_id,p.name]);
      if (found.rowCount) { assert.equal(found.rowCount, 1); assert.equal(found.rows[0].price,p.price); assert.equal(found.rows[0].speed,p.speed); plans.push(found.rows[0].id); }
      else plans.push((await client.query("INSERT INTO catalog.service_plans(organization_id,name,price,upload_kbps,download_kbps,visible,burst_enabled,mikrotik_strategy) VALUES($1,$2,$3,$4,$4,false,false,'none') RETURNING id", [a.organization_id,p.name,p.price,p.speed])).rows[0].id);
    }
    const demo = customerSchema.parse(makeDemoCustomer(plans));
    const proposed = authorizeWorkspaceUpdate(customers, [...customers, demo], identity);
    const saved = await writeRelationalWorkspace(client, identity, proposed, customers);
    version += 1;
    const payload = await symmetricEncrypt({key: config.workspaceKey,data: JSON.stringify({schemaVersion:1,organizationId:a.organization_id,version,customers:saved})});
    await client.query('INSERT INTO erp.customer_workspaces(organization_id,payload_ciphertext,version) VALUES($1,$2,$3) ON CONFLICT(organization_id) DO UPDATE SET payload_ciphertext=EXCLUDED.payload_ciphertext,version=EXCLUDED.version', [a.organization_id,payload,version]);
    const verified = (await readRelationalWorkspace(client, identity, saved)).find(c => c.id === DEMO_CUSTOMER_KEY);
    assert.equal(verified.contracts.length, 2); assert.equal(verified.account.balance, 548); assert.equal(verified.contact.email, 'cliente.comecore@example.invalid');
    assert.equal(verified.contracts.reduce((sum,c)=>sum+(c.invoices || []).reduce((s,i)=>s+i.balance,0),0),548);
    assert.ok(verified.contracts.every(c=>c.planId && !c.password && !c.wifiPassword));
    await client.query('COMMIT');
    console.log('Creado CCPRUEBA001: 2 planes, 2 contratos, 3 comprobantes ficticios, 4 movimientos, 2 tickets y 1 referencia Android sin vincular. Saldo: $548 MXN. Sin comunicaciones, CFDI, cobros ni provisión real.');
  }
} catch (error) {
  if (client) await client.query('ROLLBACK').catch(()=>{});
  console.error(error instanceof assert.AssertionError ? error.message : 'No se pudo crear el expediente de prueba. No se confirmó ningún cambio.');
  process.exitCode = 1;
} finally { client?.release(); await Promise.all([admin.end(),runtime.end()]); }
