#!/usr/bin/env node
// Real HTTP/BFF/backend/PostgreSQL test. Only disposable, isolated fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { hash } from '@node-rs/argon2';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { securityConfig } from '../apps/backend/dist/security/config.js';
import { argonOptions } from '../apps/backend/dist/security/runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'apps/backend/.env'), quiet: true });
const config = securityConfig();
assert.equal(config.deployment, 'local', 'Este recorrido solo se permite en desarrollo local.');
const origin = new URL(config.origin);
assert.ok(['localhost', '127.0.0.1'].includes(origin.hostname), 'El destino debe ser local.');
const admin = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore' });
const organizations = [], users = [], results = [];
const cleanupOnly = process.argv.includes('--cleanup-only');
const journalPath = path.join(os.homedir(), 'Library/Application Support/ComeCore/ERP-Analysis/customer-flow-fixture.json');
function persistJournal() {
  fs.mkdirSync(path.dirname(journalPath), { recursive:true,mode:0o700 });
  fs.writeFileSync(journalPath, JSON.stringify({ organizations,users:users.map(({id,email,org})=>({id,email,org})) }), {mode:0o600});
}
if (fs.existsSync(journalPath)) {
  if (!cleanupOnly) { console.error('Existe una prueba temporal pendiente de limpieza. Ejecuta este script con --cleanup-only antes de repetir.'); process.exit(1); }
  const saved = JSON.parse(fs.readFileSync(journalPath,'utf8'));
  const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
  assert.ok(Array.isArray(saved.organizations) && saved.organizations.every(id=>uuid.test(id)));
  assert.ok(Array.isArray(saved.users) && saved.users.every(user=>uuid.test(user.id) && uuid.test(user.org) && saved.organizations.includes(user.org) && /^qa-flow-[0-9a-f]{24}@example\.invalid$/.test(user.email)));
  organizations.push(...saved.organizations);users.push(...saved.users);
}
const report = { timestamp: new Date().toISOString(), environment: 'local', transport: 'HTTP real → Next BFF → backend → PostgreSQL', results, cleanup: false,
  limitations: ['Campos técnicos y operativos complementarios permanecen en la extensión cifrada; este recorrido conecta el núcleo de clientes, planes y contratos.', 'Asignación y aprovisionamiento de equipos de red no se simulan ni se activan.', 'No es un recorrido de clicks en navegador ni una aceptación de producción.'] };
const reportPath = path.join(root, 'docs/testing/customer-contract-flow.json');
let lastRequest;
function pass(label) { results.push({ label, passed: true }); console.log('PASS ' + label); }
class Jar {
  map = new Map();
  update(response) {
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';', 1)[0], at = pair.indexOf('='), name = pair.slice(0, at), value = pair.slice(at + 1);
      if (!value || /Max-Age=0(?:;|$)/i.test(cookie)) this.map.delete(name); else this.map.set(name, value);
    }
  }
  header() { return [...this.map].map(([key, value]) => `${key}=${value}`).join('; '); }
}
async function request(endpoint, user, body, method = body === undefined ? 'GET' : 'POST', extra = {}) {
  const response = await fetch(new URL(endpoint, origin), { method, redirect: 'manual', signal: AbortSignal.timeout(20_000),
    headers: { origin: config.origin, 'content-type': 'application/json', ...(user ? { cookie: user.jar.header() } : {}), ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  user?.jar.update(response);
  let data = null;
  try { data = await response.json(); } catch { /* Error responses must not be printed. */ }
  lastRequest = { method, endpoint: new URL(endpoint, origin).pathname, status: response.status, code: typeof data?.code === 'string' ? data.code : undefined };
  return { status: response.status, data, headers: response.headers };
}
async function fixture(role, organizationId) {
  const org = organizationId || randomUUID();
  if (!organizationId) {
    const code = 'QA_FLOW_' + randomBytes(10).toString('hex').toUpperCase();
    organizations.push(org);persistJournal();
    await admin.query('INSERT INTO iam.organizations(id,code,name) VALUES($1,$2,$3)', [org, code, 'Organización ficticia de pruebas']);
  }
  const id = randomUUID(), email = `qa-flow-${randomBytes(12).toString('hex')}@example.invalid`, password = randomBytes(32).toString('base64url');
  const user = { id, email, password, org, jar: new Jar() };
  // Track before inserting, so a partially created fixture is cleaned on failure.
  users.push(user);
  persistJournal();
  await admin.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,$2,$3,true,false)', [id, 'Operador ficticio QA', email]);
  await admin.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [id, await hash(password, argonOptions)]);
  await admin.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,$3)', [id, email, 'Operador ficticio QA']);
  await admin.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,$3)', [org, id, role]);
  return user;
}
async function enroll(user) {
  let r = await request('/api/auth/sign-in/email', user, { email: user.email, password: user.password, rememberMe: false });
  assert.equal(r.status, 200, 'Login de fixture');
  r = await request('/api/auth/two-factor/enable', user, { password: user.password, method: 'totp' });
  assert.equal(r.status, 200, 'Alta de MFA de fixture');
  user.backupCodes = r.data.backupCodes;
  const secret = new TextDecoder().decode(base32.decode(new URL(r.data.totpURI).searchParams.get('secret')));
  r = await request('/api/auth/two-factor/verify-totp', user, { code: await createOTP(secret).totp(), trustDevice: false });
  assert.equal(r.status, 200, 'Verificación de MFA');
}
async function read(user) {
  const r = await request('/api/erp/workspace', user);
  assert.equal(r.status, 200, 'Lectura autorizada del workspace');
  return r.data;
}
async function save(user, snapshot) { return request('/api/erp/workspace', user, snapshot, 'PUT'); }
async function cleanup() {
  const client = await admin.connect();
  try {
    await client.query('BEGIN');
    for (const org of organizations) {
      const row = await client.query('SELECT code FROM iam.organizations WHERE id=$1 FOR UPDATE', [org]);
      assert.ok(row.rowCount === 0 || /^QA_FLOW_[0-9A-F]{20}$/.test(row.rows[0].code));
      const members = await client.query('SELECT user_id FROM iam.organization_memberships WHERE organization_id=$1', [org]);
      assert.ok(members.rows.every(row => users.some(user => user.id === row.user_id && user.org === org)));
      await client.query('DELETE FROM erp.customer_workspaces WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM service.contracts WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM catalog.plan_product_codes WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM catalog.service_plans WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM crm.customers WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM audit.customer_events WHERE organization_id=$1', [org]);
      await client.query('DELETE FROM audit.erp_events WHERE organization_id=$1', [org]);
    }
    for (const user of users) {
      await client.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [user.id]);
      await client.query('DELETE FROM iam.app_users WHERE id=$1 AND email=$2', [user.id, user.email]);
      await client.query('DELETE FROM authn."user" WHERE id=$1 AND email=$2', [user.id, user.email]);
    }
    for (const org of organizations) await client.query('DELETE FROM iam.organizations WHERE id=$1 AND code LIKE \'QA_FLOW_%\'', [org]);
    await client.query('COMMIT');
    const count = await admin.query('SELECT (SELECT count(*) FROM iam.organizations WHERE id=ANY($1::uuid[])) + (SELECT count(*) FROM authn."user" WHERE id=ANY($2::uuid[])) + (SELECT count(*) FROM erp.customer_workspaces WHERE organization_id=ANY($1::uuid[])) + (SELECT count(*) FROM iam.app_users WHERE id=ANY($2::uuid[])) + (SELECT count(*) FROM iam.organization_memberships WHERE user_id=ANY($2::uuid[])) + (SELECT count(*) FROM authn.session WHERE "userId"=ANY($2::uuid[])) AS count', [organizations, users.map(user => user.id)]);
    assert.equal(Number(count.rows[0].count), 0);
    report.cleanup = true;
    if (fs.existsSync(journalPath)) fs.unlinkSync(journalPath);
    pass('Organizaciones, cuentas, sesiones y datos ficticios retirados y ausencia comprobada');
  } catch (error) { await client.query('ROLLBACK'); console.error(JSON.stringify({ cleanupCode:error.code,table:error.table,constraint:error.constraint })); throw error; }
  finally { client.release(); }
}
try {
  if (cleanupOnly) {
    report.status = 'cleanup_only';
  } else {
  let r = await request('/api/erp/workspace');
  assert.equal(r.status, 401); pass('API pública sin sesión devuelve 401');
  const owner = await fixture('owner');
  const viewer = await fixture('viewer', owner.org);
  const outsider = await fixture('owner');
  const support = await fixture('support', owner.org);
  const billing = await fixture('billing', owner.org);
  await enroll(owner); await enroll(viewer); await enroll(outsider); await enroll(support); await enroll(billing);
  pass('Cinco operadores ficticios completan contraseña y MFA reales sin imprimir secretos');
  let snapshot = await read(owner);
  assert.equal(snapshot.customers.length, 0);
  const customer = { id: 'qa-flow-customer', customId: 'CCQA_FLOW', kind: 'Otro', name: 'Cliente Ficticio - Prueba ComeCore', document: '', createdAt: new Date().toISOString(),
    address: { street: 'Domicilio ficticio', neighborhood: '', city: 'Ciudad de prueba', state: '', postalCode: '', latitude: 0, longitude: 0 },
    contact: { email: 'cliente-ficticio@example.invalid', mobile: '', landline: '' },
    billing: { enabled: false, taxId: '', legalName: '', legalEntity: '' }, assignment: { zone: '', seller: '', collector: '' },
    account: { status: 'Al corriente', balance: 0, credit: 0 }, communication: { email: false, sms: false, whatsapp: false },
    portalAccess: false, paymentGateway: '', devices: 0, notes: 'Prueba aislada, sin avisos ni aprovisionamiento de red.', contracts: [], audit: [] };
  r = await save(owner, { customers: [customer], version: snapshot.version });
  assert.equal(r.status, 200);
  snapshot = await read(owner); assert.equal(snapshot.customers[0].name, customer.name); assert.equal(snapshot.version, 1);
  pass('Alta del cliente ficticio por HTTP y nueva consulta conservan sus datos');
  const planInput = { name:'QA Ficticio 50 Mbps',price:349,uploadKbps:50000,downloadKbps:50000,visible:true,burstEnabled:false,mikrotikStrategy:'simple_queue',
    productCodes:{service:'QA-INTERNET',interest_first:'',interest_second:'',reconnection:'',installation:''} };
  r = await request('/api/erp/plans', owner, planInput); assert.equal(r.status,201);
  const planId = r.data.id;
  r = await request('/api/erp/plans',owner);
  assert.equal(r.status,200);assert.equal(r.data.plans[0].id,planId);assert.equal(r.data.plans[0].productCodes.service,'QA-INTERNET');
  pass('Plan y código de producto creados y recuperados desde PostgreSQL');
  r = await request('/api/erp/plans',owner,{...planInput,name:'qa ficticio 50 mbps'});assert.equal(r.status,409);pass('Nombre de plan duplicado, incluso cambiando mayúsculas, rechazado');
  r = await request('/api/erp/plans',owner,{...planInput,name:'Plan inválido',uploadKbps:-1});assert.equal(r.status,400);pass('Velocidad negativa rechazada');
  for (const actor of [viewer,support,billing]) {
    r = await request('/api/erp/plans',actor,planInput);assert.equal(r.status,403);
  }
  pass('Viewer, soporte y facturación no crean planes');
  r = await request('/api/erp/plans',outsider);assert.equal(r.status,200);assert.equal(r.data.plans.length,0);pass('Catálogo aislado por organización');
  r = await request('/api/erp/plans',outsider,{...planInput,name:'Plan de otra organización'});assert.equal(r.status,201);
  const foreignPlanId = r.data.id;
  snapshot.customers[0].contracts.push({ id: 'qa-flow-contract', planId, serialNumber: 'QA-FLOW-CTR-1', plan: 'QA Ficticio 50 Mbps', server: 'Servidor ficticio sin conexión', node: 'Nodo ficticio',
    ipAddress: '192.0.2.50', status: 'Habilitado', downstreamGb: 0, upstreamGb: 0, price: 349, frequency: 'Mensual', accessMode: 'Estática',
    interfaceName: 'ether-qa', netmask: '255.255.255.0', startsAt: new Date().toISOString().slice(0, 10), billingDay: 15, audit: [] });
  r = await save(owner, snapshot); assert.equal(r.status, 200);
  snapshot = await read(owner);
  assert.equal(snapshot.version, 2); assert.equal(snapshot.customers[0].contracts[0].plan, 'QA Ficticio 50 Mbps');
  assert.equal(snapshot.customers[0].contracts[0].price, 349); assert.equal(snapshot.customers[0].contracts[0].billingDay, 15);
  assert.equal(snapshot.customers[0].contracts[0].audit[0].actor, 'Operador ficticio QA');
  pass('Contrato asociado al cliente conserva ID de plan, precio ficticio, día de pago y auditoría servidor');
  const persisted = await admin.query('SELECT payload_ciphertext,version FROM erp.customer_workspaces WHERE organization_id=$1', [owner.org]);
  assert.equal(persisted.rowCount, 1); assert.equal(persisted.rows[0].version, 2);
  assert.equal(persisted.rows[0].payload_ciphertext.includes(customer.name), false);
  const decrypted = JSON.parse(await symmetricDecrypt({ key: config.workspaceKey, data: persisted.rows[0].payload_ciphertext }));
  assert.equal(decrypted.organizationId, owner.org); assert.equal(decrypted.customers[0].contracts[0].id, 'qa-flow-contract');
  pass('Lectura independiente en PostgreSQL confirma snapshot cifrado y vínculo con la organización');
  r = await save(owner, { ...snapshot, version: 1 }); assert.equal(r.status, 409);
  pass('Una escritura con versión obsoleta se rechaza con 409');
  const invalid = structuredClone(snapshot); invalid.customers[0].contracts[0].price = -1;
  r = await save(owner, invalid); assert.equal(r.status, 400); pass('Precio negativo manipulado se rechaza en servidor');
  const duplicate = structuredClone(snapshot); duplicate.customers[0].contracts.push(structuredClone(duplicate.customers[0].contracts[0]));
  r = await save(owner, duplicate); assert.equal(r.status, 400); pass('Contrato duplicado manipulado se rechaza en servidor');
  r = await save(viewer, snapshot); assert.equal(r.status, 403); pass('Cuenta de solo lectura no modifica cliente ni contrato');
  assert.equal((await read(viewer)).customers[0].id, customer.id); pass('Cuenta de solo lectura sí consulta su organización');
  r = await request('/api/erp/workspace?organizationId=' + owner.org, outsider);
  assert.equal(r.status, 200); assert.equal(r.data.customers.length, 0); pass('Otra organización no ve el cliente al manipular el parámetro de organización');
  r = await request('/api/erp/workspace', owner, snapshot, 'PUT', { origin: 'https://malicioso.example.invalid' });
  assert.equal(r.status, 403); pass('Cambio desde origen ajeno se rechaza');
  assert.equal((await read(owner)).version, 2); pass('Los intentos rechazados no alteran la versión ni el estado guardado');
  const copiedCookie = owner.jar.header();
  r = await request('/api/auth/sign-out', owner, {}); assert.equal(r.status, 200);
  r = await request('/api/erp/workspace', null, undefined, 'GET', { cookie: copiedCookie }); assert.equal(r.status, 401);
  pass('Cerrar sesión invalida incluso la cookie copiada antes del cierre');
  owner.jar = new Jar();
  r = await request('/api/auth/sign-in/email', owner, { email: owner.email, password: owner.password, rememberMe: false });
  assert.equal(r.status, 200); assert.equal(r.data.twoFactorRedirect, true);
  r = await request('/api/auth/two-factor/verify-backup-code', owner, { code: owner.backupCodes[0], trustDevice: false });
  assert.equal(r.status, 200);
  const reopened = await read(owner); assert.equal(reopened.version, 2); assert.equal(reopened.customers[0].contracts[0].plan, 'QA Ficticio 50 Mbps');
  pass('Una sesión nueva con MFA recupera cliente y contrato desde PostgreSQL');
  const normalized = await admin.query(`SELECT c.custom_id,p.name,k.price::float8 AS price,k.plan_id,k.server_id,k.node_id
    FROM crm.customers c JOIN service.contracts k ON (k.organization_id,k.customer_id)=(c.organization_id,c.id)
    JOIN catalog.service_plans p ON (p.organization_id,p.id)=(k.organization_id,k.plan_id)
    WHERE c.organization_id=$1 AND c.workspace_key=$2`,[owner.org,customer.id]);
  assert.equal(normalized.rowCount,1);assert.equal(normalized.rows[0].plan_id,planId);assert.equal(normalized.rows[0].price,349);
  assert.equal(normalized.rows[0].server_id,null);assert.equal(normalized.rows[0].node_id,null);
  pass('JOIN real confirma cliente → contrato → plan, sin inventar asignación de router o nodo');
  r=await request('/api/erp/plans',owner);assert.equal(r.data.plans[0].contracts,1);pass('Contador de contratos del plan procede de su relación SQL');
  const wrongPlan=structuredClone(reopened);wrongPlan.customers[0].name='Cambio que debe revertirse';wrongPlan.customers[0].contracts[0].planId=foreignPlanId;
  r=await save(owner,wrongPlan);assert.equal(r.status,409);
  assert.equal((await read(owner)).customers[0].name,customer.name);
  const unchanged=await admin.query('SELECT display_name FROM crm.customers WHERE organization_id=$1 AND workspace_key=$2',[owner.org,customer.id]);
  assert.equal(unchanged.rows[0].display_name,customer.name);pass('Plan ajeno rechazado y transacción revertida también en las tablas normalizadas');
  const billingChange=await read(billing);billingChange.customers[0].contracts[0].price=359;
  r=await save(billing,billingChange);assert.equal(r.status,200);assert.equal((await read(owner)).customers[0].contracts[0].price,359);pass('Facturación modifica precio autorizado sin privilegios de crear cliente o contrato');
  const billingPeriod=await read(billing);billingPeriod.customers[0].contracts[0].frequency='Bimestral';billingPeriod.customers[0].contracts[0].billingStatus='Exento';
  r=await save(billing,billingPeriod);assert.equal(r.status,200);
  const persistedPeriod=await admin.query('SELECT frequency,billing_status FROM service.contracts WHERE organization_id=$1 AND workspace_key=$2',[owner.org,'qa-flow-contract']);
  assert.equal(persistedPeriod.rows[0].frequency,'bimonthly');assert.equal(persistedPeriod.rows[0].billing_status,'exempt');
  assert.equal((await read(owner)).customers[0].contracts[0].frequency,'Bimestral');pass('Periodo bimestral y estado Exento se conservan al guardar y consultar');
  const supportChange=await read(support);supportChange.customers[0].contracts[0].notes='Nota técnica de prueba';
  r=await save(support,supportChange);assert.equal(r.status,200);
  const forbiddenPrice=await read(support);forbiddenPrice.customers[0].contracts[0].price=1;
  r=await save(support,forbiddenPrice);assert.equal(r.status,403);pass('Soporte actualiza notas, pero no modifica el precio');
  const concurrent=await read(owner);
  const first=structuredClone(concurrent), second=structuredClone(concurrent);
  first.customers[0].notes='Cambio concurrente A';second.customers[0].notes='Cambio concurrente B';
  const outcomes=await Promise.all([save(owner,first),save(owner,second)]);
  assert.deepEqual(outcomes.map(outcome=>outcome.status).sort(),[200,409]);pass('Dos escrituras simultáneas: una confirma y la obsoleta se rechaza sin pérdida silenciosa');
  await admin.query('UPDATE catalog.service_plans SET name=$2 WHERE organization_id=$1 AND id=$3',[owner.org,'QA Plan actualizado en catálogo',planId]);
  assert.equal((await read(owner)).customers[0].contracts[0].plan,'QA Plan actualizado en catálogo');pass('La consulta usa el catálogo relacionado y no la etiqueta antigua de la extensión cifrada');
  const toArchive=await read(owner);
  r=await save(owner,{customers:[],version:toArchive.version});assert.equal(r.status,200);assert.equal((await read(owner)).customers.length,0);
  const archived=await admin.query('SELECT deleted_at IS NOT NULL AS archived FROM crm.customers WHERE organization_id=$1 AND workspace_key=$2',[owner.org,customer.id]);
  assert.equal(archived.rows[0].archived,true);
  r=await request('/api/erp/plans',owner);assert.equal(r.data.plans[0].contracts,0);pass('Archivar conserva filas e historial, retira el expediente y recalcula el contador de contratos');
  const empty=await read(owner);r=await save(owner,{customers:toArchive.customers,version:empty.version});assert.equal(r.status,409);pass('Un alta no puede reutilizar silenciosamente el identificador de un cliente archivado');
  const legacyCustomer={...structuredClone(customer),id:'qa-legacy-customer',customId:'CCQA_LEGACY',contact:{email:'legado-ficticio@example.invalid',mobile:'',landline:''},
    contracts:[{id:'qa-legacy-contract',plan:'QA Plan legado',server:'Sin configurar',node:'Sin configurar',ipAddress:'192.0.2.60',status:'Habilitado',downstreamGb:0,upstreamGb:0,price:349}]};
  const legacyCiphertext=await symmetricEncrypt({key:config.workspaceKey,data:JSON.stringify({schemaVersion:1,organizationId:outsider.org,version:1,customers:[legacyCustomer]})});
  await admin.query('INSERT INTO erp.customer_workspaces(organization_id,payload_ciphertext,version)VALUES($1,$2,1)',[outsider.org,legacyCiphertext]);
  const legacyRead=await read(outsider);assert.equal(legacyRead.customers[0].id,legacyCustomer.id);pass('Un expediente cifrado anterior sigue siendo consultable sin importación implícita');
  r=await save(outsider,legacyRead);assert.equal(r.status,409);
  const retained=await admin.query('SELECT payload_ciphertext FROM erp.customer_workspaces WHERE organization_id=$1',[outsider.org]);
  assert.equal(retained.rows[0].payload_ciphertext,legacyCiphertext);pass('Sin un plan registrado se conserva intacto el expediente anterior');
  r=await request('/api/erp/plans',outsider,{...planInput,name:'QA Plan legado'});assert.equal(r.status,201);
  r=await save(outsider,legacyRead);assert.equal(r.status,200);
  const imported=await admin.query('SELECT count(*)::int AS count FROM crm.customers c JOIN service.contracts k ON(k.organization_id,k.customer_id)=(c.organization_id,c.id) JOIN catalog.service_plans p ON(p.organization_id,p.id)=(k.organization_id,k.plan_id) WHERE c.organization_id=$1 AND c.workspace_key=$2',[outsider.org,legacyCustomer.id]);
  assert.equal(imported.rows[0].count,1);pass('Un guardado explícito conecta el expediente anterior al plan registrado sin cambiar su identificador');
  report.normalized_linkage = 'verified_customer_contract_plan';
  report.status = 'passed';
  }
} catch (error) {
  report.status = 'failed';
  report.failed_request = lastRequest;
  if (error instanceof assert.AssertionError && typeof error.actual === 'number' && typeof error.expected === 'number') report.failed_assertion = { actual:error.actual,expected:error.expected };
  // Do not log assertion bodies, cookies, hashes, credentials, or SQL values.
  console.error('Falló el recorrido; revisar el último control aprobado y el estado local sin imprimir secretos.');
  console.error(JSON.stringify({ request:lastRequest,...(report.failed_assertion ? { assertion:report.failed_assertion } : {}) }));
  process.exitCode = 1;
} finally {
  try { await cleanup(); } catch { report.cleanup = false; process.exitCode = 1; console.error('No se completó la limpieza; las fixtures aisladas requieren revisión local.'); }
  await admin.end();
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`${results.length} controles aprobados. Informe: docs/testing/customer-contract-flow.json`);
}
