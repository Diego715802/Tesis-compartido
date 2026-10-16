#!/usr/bin/env node
'use strict';
// Alta fuera del navegador. Contraseña exclusivamente por stdin (nunca argumentos).
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const os = require('node:os'); const { Pool } = require('pg'); const { hash } = require('@node-rs/argon2');
const root = path.resolve(__dirname, '..'); require('dotenv').config({ path: path.join(root, 'apps/backend/.env'), quiet: true });
async function main() {
  const email = process.argv[2]?.toLowerCase(); const temporary = process.argv.includes('--temporary');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Usar correo y contraseña por stdin; --temporary solo para alta local.');
  if (process.env.AUTH_DEPLOYMENT !== 'local') throw new Error('Este comando es exclusivamente de desarrollo local.');
  const password = fs.readFileSync(0, 'utf8').replace(/\r?\n$/, '');
  if (!password || password.length > 128 || (!temporary && password.length < 15)) throw new Error('Contraseña no válida.');
  if (!temporary) { const { isPasswordCompromised } = await import('better-auth/plugins/haveibeenpwned'); if (await isPasswordCompromised(password)) throw new Error('Elige una contraseña sin filtraciones conocidas.'); }
  const stored = await hash(password, { algorithm: 2, memoryCost: 65536, timeCost: 3, parallelism: 1, outputLen: 32 });
  const pool = new Pool({ host: path.join(os.homedir(), 'Library/Application Support/ComeCore/PostgreSQL18/socket'), user: os.userInfo().username, database: 'comecore' });
  const client = await pool.connect();
  try { await client.query('BEGIN');
    if ((await client.query('SELECT id FROM authn."user" WHERE lower(email)=$1', [email])).rowCount) throw new Error('La cuenta ya existe; no se cambió su contraseña.');
    const organization = await client.query('INSERT INTO iam.organizations(code,name) VALUES(\'COMECORE\',\'ComeCore\') ON CONFLICT(lower(code)) DO UPDATE SET name=iam.organizations.name RETURNING id');
    const id = crypto.randomUUID();
    await client.query('INSERT INTO authn."user"(id,name,email,"emailVerified","twoFactorEnabled") VALUES($1,$2,$3,false,false)', [id, email.split('@')[0], email]);
    await client.query('INSERT INTO authn.account("accountId","providerId","userId",password,"updatedAt") VALUES($1::text,\'credential\',$1::uuid,$2,now())', [id, stored]);
    await client.query('INSERT INTO iam.app_users(id,external_auth_id,email,display_name) VALUES($1,$1,$2,$3)', [id, email, email.split('@')[0]]);
    await client.query('INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES($1,$2,\'owner\')', [organization.rows[0].id, id]);
    await client.query('INSERT INTO security.account_flags(user_id,must_change_password,temporary_expires_at) VALUES($1,$2,CASE WHEN $2 THEN now()+interval \'24 hours\' ELSE NULL END)', [id, temporary]);
    await client.query('COMMIT'); console.log('Cuenta administradora creada. Debe completar MFA; alta temporal exige cambio y no permite ERP hasta completarlo.');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); await pool.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
