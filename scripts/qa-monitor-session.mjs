// Disposable local-only browser QA account. Never prints credentials or sessions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { hash } from '@node-rs/argon2';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';
import { argonOptions } from '../apps/backend/dist/security/runtime.js';
import { securityConfig } from '../apps/backend/dist/security/config.js';
dotenv.config({ path: 'apps/backend/.env', quiet: true });
const config = securityConfig();
assert.equal(config.deployment, 'local');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(config.origin).hostname));
const file = path.join(os.homedir(), 'Library/Application Support/ComeCore/ERP-Analysis/monitor-qa.json');
const admin = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore', max: 1 });
try {
  if (process.argv[2] === 'cleanup') {
    const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.match(fixture.email, /^qa-monitor-[0-9a-f]{24}@example\.invalid$/);
    const match = await admin.query('SELECT 1 FROM iam.organizations WHERE id=$1 AND code=$2', [fixture.org, fixture.code]);
    assert.equal(match.rowCount, 1);
    await admin.query('BEGIN');
    await admin.query('DELETE FROM iam.organization_memberships WHERE organization_id=$1 AND user_id=$2', [fixture.org, fixture.id]);
    await admin.query('DELETE FROM iam.app_users WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
    await admin.query('DELETE FROM authn."user" WHERE id=$1 AND email=$2', [fixture.id, fixture.email]);
    await admin.query('DELETE FROM iam.organizations WHERE id=$1 AND code=$2', [fixture.org, fixture.code]);
    await admin.query('COMMIT');
    const leftovers = await admin.query('SELECT (SELECT count(*) FROM authn.session WHERE "userId"=$1) + (SELECT count(*) FROM authn."user" WHERE id=$1) + (SELECT count(*) FROM iam.organizations WHERE id=$2) AS count', [fixture.id, fixture.org]);
    assert.equal(Number(leftovers.rows[0].count), 0);
    fs.unlinkSync(file);
    console.log('QA account, organization and sessions removed; absence verified.');
  } else {
    assert.equal(process.argv[2], 'prepare');
    assert.ok(!fs.existsSync(file), 'Clean the previous QA account first.');
    const fixture = { id: randomUUID(), org: randomUUID(), code: 'QA_MONITOR_' + randomBytes(10).toString('hex').toUpperCase(), email: `qa-monitor-${randomBytes(12).toString('hex')}@example.invalid`, password: randomBytes(32).toString('base64url') };
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    fs.writeFileSync(file, JSON.stringify(fixture), { mode: 0o600 });
    await admin.query('BEGIN');
    await admin.query('INSERT INTO iam.organizations(id,code,name) VALUES($1,$2,$3)', [fixture.org, fixture.code, 'Organización temporal QA del monitor']);
    await admin.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,$2,$3,true,false)', [fixture.id, 'Operador temporal de pruebas', fixture.email]);
    await admin.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [fixture.id, await hash(fixture.password, argonOptions)]);
    await admin.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,$3)', [fixture.id, fixture.email, 'Operador temporal de pruebas']);
    await admin.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,\'support\')', [fixture.org, fixture.id]);
    await admin.query('COMMIT');
    const cookies = new Map();
    async function request(endpoint, body) {
      const response = await fetch(config.origin + endpoint, { method: 'POST', headers: { origin: config.origin, 'content-type': 'application/json', cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; ') }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
      for (const item of response.headers.getSetCookie()) { const pair = item.split(';')[0], at = pair.indexOf('='); cookies.set(pair.slice(0, at), pair.slice(at + 1)); }
      assert.equal(response.status, 200, 'QA authentication request failed');
      return response.json();
    }
    await request('/api/auth/sign-in/email', { email: fixture.email, password: fixture.password, rememberMe: false });
    const factor = await request('/api/auth/two-factor/enable', { password: fixture.password, method: 'totp' });
    const secret = new TextDecoder().decode(base32.decode(new URL(factor.totpURI).searchParams.get('secret')));
    await request('/api/auth/two-factor/verify-totp', { code: await createOTP(secret).totp(), trustDevice: false });
    fs.writeFileSync(file, JSON.stringify({ ...fixture, secret }), { mode: 0o600 });
    console.log('Local temporary QA account prepared with MFA. Private file mode 0600; no secrets printed.');
  }
} catch (error) { await admin.query('ROLLBACK'); console.error('Monitor QA failed: ' + error.message); process.exitCode = 1; }
finally { await admin.end(); }
