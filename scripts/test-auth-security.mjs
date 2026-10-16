import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { hash } from '@node-rs/argon2';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { createSecurityRuntime, argonOptions } from '../apps/backend/dist/security/runtime.js';
import { securityConfig } from '../apps/backend/dist/security/config.js';
import { registerWorkspaceRoutes } from '../apps/backend/dist/workspace/workspace-routes.js';
import { fromNodeHeaders } from 'better-auth/node';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'apps/backend/.env'), quiet: true });
const cfg = securityConfig();
const keep = process.argv.includes('--keep-ui-fixture');
const base = path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18');
const admin = new Pool({ host: path.join(base, 'socket'), user: os.userInfo().username, database: 'comecore' });
const mail = [];
const runtime = createSecurityRuntime({ ...cfg, mail: { async send(to, subject, text) { mail.push({ to, subject, text }); } } });
const server = Fastify({ logger: false, trustProxy: false, bodyLimit: 2 * 1024 * 1024 });
await runtime.register(server);
registerWorkspaceRoutes(server, { resolveIdentity: h => runtime.resolveIdentity(fromNodeHeaders(h)), withOrganizationTransaction: runtime.withOrganizationTransaction, workspaceKey: cfg.workspaceKey });
server.get('/mikrotik/telemetry', () => ({ protected: true }));
await server.ready();
const users = []; const organizations = [];
let count = 0;
const testIp = `127.0.0.${2 + randomBytes(1)[0] % 250}`;
function pass(label) { count++; console.log('PASS ' + label); }
class Jar {
  map = new Map();
  update(response) { for (const cookie of response.cookies) { if (cookie.maxAge === 0 || cookie.value === '') this.map.delete(cookie.name); else this.map.set(cookie.name, cookie.value); } }
  value() { return [...this.map].map(([key, value]) => `${key}=${value}`).join('; '); }
}
async function request(url, body, jar = new Jar(), method = body === undefined ? 'GET' : 'POST', extra = {}) {
  const response = await server.inject({ url, method, remoteAddress: testIp, headers: {
    host: 'localhost:3001', origin: cfg.origin, 'x-comecore-gateway': cfg.gateway, 'content-type': 'application/json', cookie: jar.value(), ...extra,
  }, ...(body !== undefined ? { payload: JSON.stringify(body) } : {}) });
  jar.update(response); return response;
}
async function fixture(role, organization) {
  const org = organization || randomUUID();
  if (!organization) { await admin.query('INSERT INTO iam.organizations(id,code,name) VALUES($1,$2,$3)', [org, 'QA_' + randomBytes(8).toString('hex').toUpperCase(), 'Prueba de seguridad']); organizations.push(org); }
  const id = randomUUID(); const email = `qa-${randomBytes(10).toString('hex')}@example.invalid`;
  const password = randomBytes(32).toString('base64url'); const stored = await hash(password, argonOptions);
  await admin.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,\'Prueba temporal\',$2,true,false)', [id, email]);
  await admin.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [id, stored]);
  await admin.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,\'Prueba temporal\')', [id, email]);
  await admin.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,$3)', [org, id, role]);
  const user = { id, email, password, org, jar: new Jar() }; users.push(user); return user;
}
async function enroll(user) {
  const login = await request('/api/auth/sign-in/email', { email: user.email, password: user.password, rememberMe: false }, user.jar);
  assert.equal(login.statusCode, 200, 'Credenciales válidas deben crear sesión para inscribir MFA');
  const enabled = await request('/api/auth/two-factor/enable', { password: user.password, method: 'totp' }, user.jar);
  assert.equal(enabled.statusCode, 200, 'Inscripción requiere contraseña válida');
  const data = enabled.json(); user.secret = new TextDecoder().decode(base32.decode(new URL(data.totpURI).searchParams.get('secret'))); user.codes = data.backupCodes;
  user.lastCode = await createOTP(user.secret).totp();
  const verified = await request('/api/auth/two-factor/verify-totp', { code: user.lastCode, trustDevice: false }, user.jar);
  assert.equal(verified.statusCode, 200, 'El TOTP vigente debe completar inscripción');
  assert.ok(!('token' in verified.json()) && !('session' in verified.json()), 'Ningún token puede llegar a JSON');
  return user;
}
async function cleanup() {
  for (const user of users) {
    if (keep && user.keep) continue;
    await admin.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [user.id]);
    await admin.query('DELETE FROM iam.app_users WHERE id=$1', [user.id]);
    await admin.query('DELETE FROM authn."user" WHERE id=$1', [user.id]);
  }
  for (const org of organizations) {
    if (keep && users.some(u => u.keep && u.org === org)) continue;
    await admin.query('DELETE FROM erp.customer_workspaces WHERE organization_id=$1', [org]);
    await admin.query('DELETE FROM iam.organizations WHERE id=$1', [org]);
  }
  await server.close(); await runtime.close(); await admin.end();
}
try {
  const owner = await fixture('owner'); const viewer = await fixture('viewer');
  let response = await server.inject({ url: '/mikrotik/telemetry' }); assert.equal(response.statusCode, 401); pass('API directa sin gateway y sin sesión rechazada');
  response = await request('/mikrotik/telemetry'); assert.equal(response.statusCode, 401); pass('API sin sesión rechazada incluso con gateway');
  response = await request('/api/auth/sign-in/email', { email: owner.email, password: 'incorrecta' }); const knownFailure = response.json(); assert.equal(response.statusCode, 401);
  response = await request('/api/auth/sign-in/email', { email: 'no-existe@example.invalid', password: 'incorrecta' }); assert.equal(response.statusCode, 401); assert.deepEqual(response.json(), knownFailure); pass('Credenciales erróneas y cuenta inexistente tienen respuesta igual');
  response = await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, new Jar(), 'POST', { origin: 'https://malicioso.example' }); assert.equal(response.statusCode, 403); pass('CSRF/origen externo rechazado');
  response = await request('/api/auth/sign-up/email', { email: owner.email, password: owner.password }); assert.equal(response.statusCode, 404); pass('Registro público deshabilitado');
  response = await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password, callbackURL: 'https://malicioso.example' }); assert.equal(response.statusCode, 400); pass('Redirección externa y parámetros no autorizados rechazados');
  await enroll(owner); pass('Contraseña, inscripción TOTP y código válido completan MFA');
  assert.ok(owner.jar.map.size > 0); const context = await request('/auth/context', undefined, owner.jar); assert.equal(context.statusCode, 200); assert.equal(context.json().mfaRequired, false); pass('Identidad real y membresía activa permiten ERP');
  const cookies = (await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, new Jar())).headers['set-cookie'];
  assert.ok([cookies].flat().some(c => c.includes('HttpOnly') && c.includes('SameSite=Strict'))); pass('Cookies locales HttpOnly y SameSite Strict');
  response = await request('/api/auth/two-factor/disable', { password: owner.password }, owner.jar); assert.equal(response.statusCode, 404); pass('No se puede desactivar MFA obligatorio');
  response = await request('/api/auth/change-password', { currentPassword: owner.password, newPassword: randomBytes(32).toString('base64url'), revokeOtherSessions: true }, owner.jar); assert.equal(response.statusCode, 403); pass('Cambio sensible requiere reautenticación reciente');
  const freshChallenge = new Jar(); response = await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, freshChallenge); assert.equal(response.json().twoFactorRedirect, true);
  response = await request('/mikrotik/telemetry', undefined, freshChallenge); assert.equal(response.statusCode, 401); pass('Contraseña sin segundo factor no obtiene ERP');
  response = await request('/api/auth/two-factor/verify-totp', { code: owner.lastCode, trustDevice: true }, freshChallenge); assert.equal(response.statusCode, 400); pass('No se permite recordar dispositivo para omitir MFA');
  response = await request('/api/auth/two-factor/verify-totp', { code: owner.lastCode, trustDevice: false }, freshChallenge); assert.equal(response.statusCode, 401); pass('Código TOTP aceptado no puede repetirse en otro desafío');
  const backupJar = new Jar(); await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, backupJar);
  response = await request('/api/auth/two-factor/verify-backup-code', { code: owner.codes[0], trustDevice: false }, backupJar); assert.equal(response.statusCode, 200); pass('Código de recuperación MFA válido concede sesión');
  const replayJar = new Jar(); await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, replayJar);
  response = await request('/api/auth/two-factor/verify-backup-code', { code: owner.codes[0], trustDevice: false }, replayJar); assert.ok(response.statusCode >= 400); pass('Código de recuperación MFA usado se rechaza');
  await enroll(viewer); response = await request('/mikrotik/telemetry', undefined, viewer.jar); assert.equal(response.statusCode, 403); pass('Viewer no puede consultar telemetría de red');
  response = await request('/erp/workspace', undefined, viewer.jar); assert.equal(response.statusCode, 200); assert.equal(response.json().customers.length, 0); pass('Organización distinta no ve clientes de otra');
  response = await request('/erp/workspace', { customers: [], version: 0 }, viewer.jar, 'PUT'); assert.equal(response.statusCode, 403); pass('Viewer no puede modificar clientes');
  const customer = { id: 'qa-customer', customId: 'CCQA', kind: 'Otro', name: 'Cliente de prueba', document: '', createdAt: new Date().toISOString(),
    address: { street: '', neighborhood: '', city: '', state: '', postalCode: '', latitude: 0, longitude: 0 }, contact: { email: '', mobile: '', landline: '' },
    billing: { enabled: false, taxId: '', legalName: '', legalEntity: '' }, assignment: { zone: '', seller: '', collector: '' }, account: { status: 'Al corriente', balance: 0, credit: 0 },
    communication: { email: false, sms: false, whatsapp: false }, portalAccess: false, paymentGateway: '', devices: 0, notes: '', contracts: [], audit: [] };
  response = await request('/erp/workspace', { customers: [customer], version: 0 }, owner.jar, 'PUT'); assert.equal(response.statusCode, 200); pass('Cliente legítimo se guarda en PostgreSQL');
  const stored = await admin.query('SELECT payload_ciphertext FROM erp.customer_workspaces WHERE organization_id=$1', [owner.org]); assert.ok(!stored.rows[0].payload_ciphertext.includes(customer.name)); pass('Snapshot persistido cifrado y contexto enlazado');
  response = await request('/erp/workspace?organizationId=' + owner.org, undefined, viewer.jar); assert.equal(response.json().customers.length, 0); pass('Modificar parámetro de organización no rompe aislamiento');
  response = await request('/erp/workspace', { customers: [customer], version: 0 }, owner.jar, 'PUT'); assert.equal(response.statusCode, 409); pass('Actualización con versión antigua rechazada');
  const reset = await request('/api/auth/request-password-reset', { email: owner.email, redirectTo: cfg.origin + '/restablecer' }); assert.equal(reset.statusCode, 200);
  const nonexistentReset = await request('/api/auth/request-password-reset', { email: 'no-existe@example.invalid', redirectTo: cfg.origin + '/restablecer' }); assert.deepEqual(nonexistentReset.json(), reset.json()); pass('Recuperación no revela existencia de cuentas');
  const resetToken = new URL(mail.find(m => m.to === owner.email).text.split('\n').find(line => line.startsWith('http'))).searchParams.get('token');
  response = await request('/api/auth/reset-password', { token: resetToken, newPassword: 'passwordpasswordpassword' }); assert.equal(response.json().code, 'PASSWORD_COMPROMISED'); pass('Contraseña comprometida rechazada mediante HIBP real');
  const nextPassword = randomBytes(32).toString('base64url'); response = await request('/api/auth/reset-password', { token: resetToken, newPassword: nextPassword }); assert.equal(response.statusCode, 200); owner.password = nextPassword; pass('Token válido permite restablecer contraseña');
  response = await request('/auth/context', undefined, owner.jar); assert.equal(response.statusCode, 401); response = await request('/auth/context', undefined, backupJar); assert.equal(response.statusCode, 401); pass('Recuperación revoca todas las sesiones existentes');
  response = await request('/api/auth/reset-password', { token: resetToken, newPassword: randomBytes(32).toString('base64url') }); assert.ok(response.statusCode >= 400); pass('Token de recuperación de uso único');
  await request('/api/auth/request-password-reset', { email: owner.email, redirectTo: cfg.origin + '/restablecer' });
  const expiredToken = new URL(mail.filter(m => m.to === owner.email).at(-1).text.split('\n').find(line => line.startsWith('http'))).searchParams.get('token');
  await admin.query('UPDATE authn.verification SET "expiresAt"=now()-interval \'1 minute\' WHERE value=$1', [owner.id]);
  response = await request('/api/auth/reset-password', { token: expiredToken, newPassword: randomBytes(32).toString('base64url') }); assert.ok(response.statusCode >= 400); pass('Token vencido rechazado');
  await admin.query('UPDATE authn.session SET "expiresAt"=now()-interval \'1 minute\' WHERE "userId"=$1', [viewer.id]);
  response = await request('/auth/context', undefined, viewer.jar); assert.equal(response.statusCode, 401); pass('Sesión expirada pierde acceso');
  const restoredJar = new Jar(); await request('/api/auth/sign-in/email', { email: owner.email, password: owner.password }, restoredJar);
  await request('/api/auth/two-factor/verify-backup-code', { code: owner.codes[1], trustDevice: false }, restoredJar);
  await admin.query('UPDATE iam.organization_memberships SET status=\'revoked\' WHERE user_id=$1', [owner.id]); response = await request('/erp/workspace', undefined, restoredJar); assert.equal(response.statusCode, 403); pass('Revocación de permisos afecta sesión ya abierta');
  await admin.query('UPDATE iam.organization_memberships SET status=\'active\' WHERE user_id=$1', [owner.id]);
  response = await request('/auth/logout-all', {}, restoredJar); assert.equal(response.statusCode, 200); response = await request('/auth/context', undefined, restoredJar); assert.equal(response.statusCode, 401); pass('Cierre de todas las sesiones invalida cookies');
  let limited = false; for (let i = 0; i < 10; i++) { response = await request('/api/auth/sign-in/email', { email: `rate-${owner.email}`, password: 'incorrecta' }, new Jar(), 'POST', { 'x-forwarded-for': `10.0.0.${i}` }); if (response.statusCode === 429) { limited = true; break; } }
  assert.ok(limited); pass('Límite persistente cuenta/origen ignora IP forjada');
  if (keep) {
    const ui = await fixture('owner'); await enroll(ui); ui.keep = true;
    fs.writeFileSync(path.join(base, 'qa-access.json'), JSON.stringify({ id: ui.id, organizationId: ui.org, email: ui.email, password: ui.password, secret: ui.secret, backupCodes: ui.codes }), { mode: 0o600 });
    console.log('Fixture de recorrido UI preparada en archivo privado; no se imprimieron credenciales.');
  }
  console.log(`${count} controles positivos y negativos verificados contra PostgreSQL y Better Auth reales. Correo probado con receptor de prueba en memoria; SMTP externo pendiente.`);
} catch (error) {
  console.error('Falló la prueba: ' + (error.message || 'error sin detalle'));
  process.exitCode = 1;
} finally { await cleanup(); }
