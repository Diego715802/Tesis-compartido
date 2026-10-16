import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { hash } from '@node-rs/argon2';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { argonOptions } from '../apps/backend/dist/security/runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'apps/backend/.env'), quiet: true });
const privateRoot = path.join(os.homedir(), 'Library/Application Support/ComeCore/CMC');
const settings = JSON.parse(fs.readFileSync(path.join(privateRoot, 'local-connection.json'), 'utf8'));
const qaFile = path.join(privateRoot, 'ui-fixture.json');
const keep = process.argv.includes('--keep-ui-fixture');
const admin = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore' });
const fixtures = []; const extraOrganizations = [];
let original; let lastRevision; let owner;
let count = 0;
const pass = label => { count++; process.stdout.write('PASS ' + label + '\n'); };
class Jar {
  map = new Map();
  update(response) {
    for (const line of response.headers.getSetCookie()) {
      const [item] = line.split(';'); const split = item.indexOf('=');
      const name = item.slice(0, split); const value = item.slice(split + 1);
      if (/max-age=0/i.test(line) || !value) this.map.delete(name); else this.map.set(name, value);
    }
  }
  value() { return [...this.map].map(([key, value]) => `${key}=${value}`).join('; '); }
}
async function request(route, user, body, method = body === undefined ? 'GET' : 'POST', extra = {}) {
  const response = await fetch(`http://localhost:3000${route}`, { method,
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: user?.jar.value() || '', ...extra },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}), redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  user?.jar.update(response); return response;
}
async function fixture(role, org = settings.organizationId) {
  const id = randomUUID(); const email = `qa-cmc-${randomBytes(10).toString('hex')}@example.invalid`;
  const password = randomBytes(32).toString('base64url');
  const user = { id, email, password, org, jar: new Jar() }; fixtures.push(user);
  await admin.query('BEGIN');
  try {
    await admin.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,\'Prueba temporal CMC\',$2,true,false)', [id, email]);
    await admin.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [id, await hash(password, argonOptions)]);
    await admin.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,\'Prueba temporal CMC\')', [id, email]);
    await admin.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,$3)', [org, id, role]);
    await admin.query('COMMIT');
  } catch (error) { await admin.query('ROLLBACK'); throw error; }
  return user;
}
async function enroll(user) {
  let response = await request('/api/auth/sign-in/email', user, { email: user.email, password: user.password, rememberMe: false });
  assert.equal(response.status, 200, 'Login de fixture');
  response = await request('/api/auth/two-factor/enable', user, { password: user.password, method: 'totp' });
  assert.equal(response.status, 200, 'MFA de fixture');
  const data = await response.json();
  user.secret = new TextDecoder().decode(base32.decode(new URL(data.totpURI).searchParams.get('secret')));
  user.backupCodes = data.backupCodes;
  response = await request('/api/auth/two-factor/verify-totp', user, { code: await createOTP(user.secret).totp(), trustDevice: false });
  assert.equal(response.status, 200, 'MFA verificado de fixture');
}
async function cleanup() {
  for (const user of fixtures) {
    if (keep && user.keep) continue;
    await admin.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [user.id]);
    await admin.query('DELETE FROM iam.app_users WHERE id=$1', [user.id]);
    await admin.query('DELETE FROM authn."user" WHERE id=$1', [user.id]);
  }
  for (const id of extraOrganizations) await admin.query('DELETE FROM iam.organizations WHERE id=$1', [id]);
  await admin.end();
}
try {
  let response = await request('/api/cmc/content'); assert.equal(response.status, 401); pass('API CMC sin sesión rechazada');
  owner = await fixture('owner');
  response = await request('/api/auth/sign-in/email', owner, { email: owner.email, password: owner.password, rememberMe: false }); assert.equal(response.status, 200);
  response = await request('/api/cmc/content', owner); assert.equal(response.status, 403); pass('Contraseña sin MFA no permite CMC');
  await enroll(owner);
  response = await request('/api/cmc/content', owner); assert.equal(response.status, 200);
  const initial = await response.json(); original = initial.site; lastRevision = initial.revision;
  assert.equal(initial.environment, 'local'); assert.equal(initial.publicUrl, 'http://localhost:3100');
  assert.ok(!initial.secret && !initial.token && !initial.session); pass('Sesión y MFA reales permiten leer contenido local sin secretos');
  response = await request('/api/cmc/content', owner, { site: original, revision: lastRevision }, 'PUT', { origin: 'https://malicioso.example' });
  assert.equal(response.status, 403); pass('Publicación de origen ajeno rechazada');
  response = await request('/api/cmc/content?organizationId=' + randomUUID(), owner); assert.equal(response.status, 400); pass('Organización por parámetro rechazada');
  response = await request('/api/cmc/content', owner, { site: original, revision: lastRevision, actor: { role: 'owner' } }, 'PUT'); assert.equal(response.status, 400); pass('Identidad o rol en cuerpo no puede alterar autorizaciones');
  const viewer = await fixture('viewer'); await enroll(viewer);
  response = await request('/api/cmc/content', viewer); assert.equal(response.status, 403); pass('Usuario sin permiso de sitio no accede');
  const otherOrg = randomUUID(); extraOrganizations.push(otherOrg);
  await admin.query('INSERT INTO iam.organizations(id,code,name) VALUES($1,$2,\'Prueba aislamiento CMC\')', [otherOrg, 'QA_CMC_' + randomBytes(5).toString('hex').toUpperCase()]);
  const foreign = await fixture('owner', otherOrg); await enroll(foreign);
  response = await request('/api/cmc/content', foreign); assert.equal(response.status, 403); pass('Administrador de otra organización no administra este sitio');
  const changed = structuredClone(original); changed.settings.company.brand = 'CometaLink · comprobación local';
  response = await request('/api/cmc/content', owner, { site: changed, revision: lastRevision }, 'PUT'); assert.equal(response.status, 200);
  const published = await response.json(); lastRevision = published.revision;
  response = await fetch('http://localhost:3100/api/site', { signal: AbortSignal.timeout(20_000) }); assert.equal(response.status, 200);
  assert.equal((await response.json()).settings.company.brand, changed.settings.company.brand); pass('Publicación ERP real se refleja en API de la página local');
  response = await request('/api/cmc/content', owner, { site: original, revision: initial.revision }, 'PUT'); assert.equal(response.status, 409); pass('Versión antigua rechazada sin sobrescribir publicación');
  response = await request('/api/cmc/content', owner, { site: original, revision: lastRevision }, 'PUT'); assert.equal(response.status, 200);
  lastRevision = (await response.json()).revision; original = undefined; pass('Contenido original restaurado después de la prueba');
  response = await fetch('http://127.0.0.1:3101/bridge', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer invalida' }, body: '{}' }); assert.equal(response.status, 401); pass('Puente privado rechaza clave inválida');
  await admin.query('DELETE FROM authn.session WHERE "userId"=$1', [viewer.id]);
  response = await request('/api/cmc/content', viewer); assert.equal(response.status, 401); pass('Sesión revocada pierde acceso a la API');
  response = await request('/sitio-web', viewer); assert.equal(response.status, 307); assert.equal(new URL(response.headers.get('location'), 'http://localhost:3000').pathname, '/login'); pass('URL directa con sesión revocada vuelve al login');
  if (keep) {
    if (fs.existsSync(qaFile)) throw new Error('Existe una fixture anterior; conservar antes de crear otra.');
    owner.keep = true;
    fs.writeFileSync(qaFile, JSON.stringify({ id: owner.id, email: owner.email, password: owner.password, secret: owner.secret, backupCodes: owner.backupCodes, organizationId: owner.org }) + '\n', { mode: 0o600 });
    fs.chmodSync(qaFile, 0o600);
    process.stdout.write('Fixture temporal para verificación visual guardada en archivo privado.\n');
  }
  process.stdout.write(`${count} controles de integración CMC verificados con PostgreSQL, sesiones reales y la página local.\n`);
} finally {
  if (original && owner && lastRevision) {
    try { const response = await request('/api/cmc/content', owner, { site: original, revision: lastRevision }, 'PUT'); if (!response.ok) process.stderr.write('Revisar restauración del contenido local de prueba.\n'); }
    catch { process.stderr.write('Revisar restauración del contenido local de prueba.\n'); }
  }
  await cleanup();
}
