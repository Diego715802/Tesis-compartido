import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { hash } from '@node-rs/argon2';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { createSecurityRuntime, argonOptions } from '../apps/backend/dist/security/runtime.js';
import { securityConfig } from '../apps/backend/dist/security/config.js';

// Fixture propia y efímera: no consume códigos de una cuenta existente.
dotenv.config({ path: 'apps/backend/.env', quiet: true });
const config = securityConfig();
const admin = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore', max: 1 });
const userId = randomUUID(), organizationId = randomUUID();
const email = `qa-network-${randomBytes(10).toString('hex')}@example.invalid`;
const password = randomBytes(32).toString('base64url');
const runtime = createSecurityRuntime({ ...config, mikrotikEnabled: true, mikrotikOrganizationId: organizationId });
const server = Fastify({ logger: false });
const cookies = new Map();
async function request(url, body) {
  const response = await server.inject({ url, method: body ? 'POST' : 'GET', remoteAddress: '127.0.0.243', headers: {
    host: 'localhost:3001', origin: config.origin, 'x-comecore-gateway': config.gateway,
    cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; '), 'content-type': 'application/json',
  }, ...(body ? { payload: body } : {}) });
  for (const cookie of response.cookies) {
    if (cookie.maxAge === 0 || !cookie.value) cookies.delete(cookie.name);
    else cookies.set(cookie.name, cookie.value);
  }
  return response;
}
try {
  await admin.query('BEGIN');
  await admin.query('INSERT INTO iam.organizations(id,code,name) VALUES($1,$2,\'Prueba aislada de red\')', [organizationId, 'QA_NETWORK_' + randomBytes(8).toString('hex').toUpperCase()]);
  await admin.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,\'Prueba temporal\',$2,true,false)', [userId, email]);
  await admin.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [userId, await hash(password, argonOptions)]);
  await admin.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,\'Prueba temporal\')', [userId, email]);
  await admin.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,\'owner\')', [organizationId, userId]);
  await admin.query('COMMIT');
  await runtime.register(server);
  let serviceCalls = 0;
  server.get('/mikrotik/telemetry', () => { serviceCalls++; return { authorized: true }; });
  await server.ready();
  assert.equal((await request('/api/auth/sign-in/email', { email, password, rememberMe: false })).statusCode, 200);
  const enrollment = await request('/api/auth/two-factor/enable', { password, method: 'totp' });
  assert.equal(enrollment.statusCode, 200);
  const secret = new TextDecoder().decode(base32.decode(new URL(enrollment.json().totpURI).searchParams.get('secret')));
  assert.equal((await request('/api/auth/two-factor/verify-totp', { code: await createOTP(secret).totp(), trustDevice: false })).statusCode, 200);
  assert.equal((await request('/mikrotik/telemetry')).statusCode, 200);
  console.log('PASS MFA y organización propietaria autorizan telemetría');
  runtime.config.mikrotikOrganizationId = randomUUID();
  assert.equal((await request('/mikrotik/telemetry')).statusCode, 403);
  assert.equal(serviceCalls, 1);
  console.log('PASS otra organización se rechaza antes de ejecutar el servicio de red');
} catch (error) {
  console.error('Fallo de prueba de red: ' + error.message); process.exitCode = 1;
} finally {
  await admin.query('ROLLBACK');
  await server.close();
  await runtime.close();
  await admin.query('DELETE FROM iam.organization_memberships WHERE user_id=$1', [userId]);
  await admin.query('DELETE FROM iam.app_users WHERE id=$1 AND email=$2', [userId, email]);
  await admin.query('DELETE FROM authn."user" WHERE id=$1 AND email=$2', [userId, email]);
  await admin.query('DELETE FROM iam.organizations WHERE id=$1', [organizationId]);
  await admin.end();
}
