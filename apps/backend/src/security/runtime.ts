import { betterAuth } from 'better-auth';
import { twoFactor, haveIBeenPwned } from 'better-auth/plugins';
import { isPasswordCompromised } from 'better-auth/plugins/haveibeenpwned';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import { symmetricDecrypt } from 'better-auth/crypto';
import { createOTP } from '@better-auth/utils/otp';
import { hash, verify } from '@node-rs/argon2';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { Pool, type PoolClient } from 'pg';
import { z } from 'zod';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { SecurityConfig } from './config.js';
import { verifyDatabaseBoundary } from './database-boundaries.js';

export type Identity = { user: { id: string; email: string; name: string }; organization: { id: string; name: string };
  role: 'owner' | 'admin' | 'billing' | 'support' | 'viewer'; permissions: string[]; mfaRequired: boolean; passwordChangeRequired: boolean };
const permissions = {
  owner: ['dashboard:read', 'clientes:read', 'clientes:write', 'contratos:read', 'contratos:write', 'planes:read', 'planes:write', 'facturacion:read', 'facturacion:write', 'inventario:read', 'inventario:write', 'red:read', 'red:secrets', 'usuarios:manage', 'sitio-web:read', 'sitio-web:write'],
  admin: ['dashboard:read', 'clientes:read', 'clientes:write', 'contratos:read', 'contratos:write', 'planes:read', 'planes:write', 'facturacion:read', 'facturacion:write', 'inventario:read', 'inventario:write', 'red:read', 'red:secrets', 'usuarios:manage', 'sitio-web:read', 'sitio-web:write'],
  support: ['dashboard:read', 'clientes:read', 'clientes:write', 'contratos:read', 'contratos:write', 'planes:read', 'inventario:read', 'red:read', 'red:secrets'],
  billing: ['dashboard:read', 'clientes:read', 'clientes:write', 'contratos:read', 'planes:read', 'facturacion:read', 'facturacion:write'],
  viewer: ['dashboard:read', 'clientes:read', 'contratos:read', 'planes:read'],
} satisfies Record<Identity['role'], string[]>;

export class AccessDenied extends Error {
  constructor(public status = 401, public code = 'ACCESS_DENIED') { super('No se pudo autorizar la solicitud.'); }
}
const bodies: Record<string, z.ZodType> = {
  '/sign-in/email': z.object({ email: z.email().max(254), password: z.string().min(1).max(128), rememberMe: z.literal(false).optional(), callbackURL: z.string().optional() }).strict(),
  '/sign-out': z.object({}).strict(),
  '/two-factor/verify-totp': z.object({ code: z.string().regex(/^\d{6}$/), trustDevice: z.literal(false).optional() }).strict(),
  '/two-factor/verify-backup-code': z.object({ code: z.string().min(1).max(64), trustDevice: z.literal(false).optional(), disableSession: z.literal(false).optional() }).strict(),
  '/two-factor/enable': z.object({ password: z.string().min(1).max(128), method: z.literal('totp').optional(), issuer: z.literal('ComeCore').optional() }).strict(),
  '/two-factor/generate-backup-codes': z.object({ password: z.string().min(1).max(128) }).strict(),
  '/two-factor/get-totp-uri': z.object({ password: z.string().min(1).max(128) }).strict(),
  '/change-password': z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(15).max(128), revokeOtherSessions: z.literal(true).optional() }).strict(),
  '/request-password-reset': z.object({ email: z.email().max(254), redirectTo: z.string().optional() }).strict(),
  '/reset-password': z.object({ token: z.string().min(20).max(256), newPassword: z.string().min(15).max(128) }).strict(),
};
// Algorithm.Argon2id = 2; const enum externo no es compatible con isolatedModules.
export const argonOptions = { algorithm: 2 as const, memoryCost: 65536, timeCost: 3, parallelism: 1, outputLen: 32 };

export function createSecurityRuntime(config: SecurityConfig) {
  const authPool = new Pool({ connectionString: config.authDatabaseUrl, options: '-c search_path=authn,pg_catalog', max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 8000 });
  const dataPool = new Pool({ connectionString: config.databaseUrl, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 8000 });
  const secure = config.deployment === 'public';
  const auth = betterAuth({
    appName: 'ComeCore', baseURL: config.origin, basePath: '/api/auth', secret: config.secret, database: authPool,
    trustedOrigins: [config.origin], telemetry: { enabled: false }, logger: { disabled: true },
    emailVerification: { sendOnSignIn: true, autoSignInAfterVerification: false, expiresIn: 900,
      async sendVerificationEmail({ user, token }) {
        if (!config.mail) throw new AccessDenied(503, 'RECOVERY_UNAVAILABLE');
        const url = new URL('/verificar-correo', config.origin); url.searchParams.set('token', token);
        try { await config.mail.send(user.email, 'Verifica tu correo de ComeCore', `Confirma tu correo con este enlace durante los próximos 15 minutos:\n${url}`); }
        catch { await audit('verification_delivery_failed', user.id, false); }
      } },
    emailAndPassword: { enabled: true, disableSignUp: true, requireEmailVerification: secure, autoSignIn: false,
      minPasswordLength: 15, maxPasswordLength: 128, resetPasswordTokenExpiresIn: 900, revokeSessionsOnPasswordReset: true,
      password: { hash: (password) => hash(password, argonOptions), verify: ({ hash: stored, password }) => verify(stored, password) },
      async sendResetPassword({ user, token }) {
        if (!config.mail) throw new AccessDenied(503, 'RECOVERY_UNAVAILABLE');
        const url = new URL('/restablecer', config.origin); url.searchParams.set('token', token);
        try { await config.mail.send(user.email, 'Restablecer acceso a ComeCore', `Usa este enlace de un solo uso durante los próximos 15 minutos:\n${url}\nSi no solicitaste este cambio, ignora el correo.`); }
        catch { await audit('recovery_delivery_failed', user.id, false); }
      },
      async onPasswordReset({ user }) {
        await authPool.query('UPDATE security.account_flags SET must_change_password=false, temporary_expires_at=NULL WHERE user_id=$1', [user.id]);
        await authPool.query('DELETE FROM authn.verification WHERE value=$1', [user.id]);
        await audit('password_reset', user.id, true);
      },
    },
    session: { expiresIn: 3600, updateAge: 0, freshAge: 300, cookieCache: { enabled: false } },
    verification: { storeIdentifier: 'hashed' }, account: { accountLinking: { enabled: false }, encryptOAuthTokens: true },
    advanced: { useSecureCookies: secure, cookiePrefix: 'comecore', database: { generateId: 'uuid' },
      defaultCookieAttributes: { httpOnly: true, secure, sameSite: 'strict', path: '/' },
      ipAddress: { ipAddressHeaders: ['x-comecore-client-ip'] },
    },
    databaseHooks: { session: { create: { before: async (session) => ({ data: {
      ...session, expiresAt: new Date(Math.min(new Date(session.expiresAt).getTime(), Date.now() + 3600000)),
      // No almacenar direcciones ni agentes de usuario; auditoría usa huellas HMAC.
      ipAddress: null, userAgent: null,
    } }) } } },
    hooks: { before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/reset-password') return;
      const password = ctx.body?.newPassword;
      if (typeof password !== 'string' || password.length < 15 || password.length > 128) return;
      // Better Auth 1.7.7 consume el token antes de hash(). Comprobar aquí conserva
      // el enlace cuando HIBP rechaza la clave o está indisponible, incluso vía auth.api.
      if (await isPasswordCompromised(password)) throw APIError.from('BAD_REQUEST', {
        code: 'PASSWORD_COMPROMISED', message: 'Elige una contraseña que no figure en filtraciones conocidas.',
      });
    }) },
    // Limiter propio atómico PostgreSQL: cuenta+origen, también APIs server-side sensibles.
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 100,
      customRules: { '/sign-in/email': { window: 60, max: 20 }, '/two-factor/*': { window: 60, max: 20 }, '/request-password-reset': { window: 60, max: 10 } } },
    plugins: [haveIBeenPwned({ paths: ['/sign-up/email','/change-password','/email-otp/reset-password','/phone-number/reset-password','/admin/create-user','/admin/set-user-password'] }), twoFactor({ issuer: 'ComeCore', skipVerificationOnEnable: false, allowPasswordless: false,
      twoFactorCookieMaxAge: 300, accountLockout: { enabled: true, maxFailedAttempts: 10, durationSeconds: 300 },
      backupCodeOptions: { amount: 10, length: 12, storeBackupCodes: 'encrypted' } })],
  });
  const fingerprint = (value: string) => createHmac('sha256', config.secret).update(value).digest('hex');
  async function audit(event: string, actor: string | null, success: boolean, source?: string) {
    await authPool.query('INSERT INTO security.events(event_type,actor_id,success,source_fingerprint) VALUES($1,$2,$3,$4)', [event, actor, success, source ? fingerprint(source) : null]);
  }
  async function limit(key: string, max: number, seconds = 60) {
    const row = await authPool.query<{ count: number }>(`INSERT INTO security.attempt_buckets(key,window_start,count)
      VALUES ($1,to_timestamp(floor(extract(epoch FROM clock_timestamp())/$2)*$2),1)
      ON CONFLICT(key,window_start) DO UPDATE SET count=security.attempt_buckets.count+1 RETURNING count`, [fingerprint(key), seconds]);
    if (row.rows[0].count > max) throw new AccessDenied(429, 'TOO_MANY_ATTEMPTS');
  }
  async function session(headers: Headers) {
    return auth.api.getSession({ headers, query: { disableCookieCache: true, disableRefresh: true } });
  }
  async function resolveIdentity(headers: Headers): Promise<Identity> {
    const current = await session(headers);
    if (!current) throw new AccessDenied();
    const access = await authPool.query<{ organization_id: string; organization_name: string; role: Identity['role']; user_id: string; display_name: string }>('SELECT * FROM app_private.resolve_operator($1::uuid)', [current.user.id]);
    const row = access.rows[0]; if (!row) throw new AccessDenied(403);
    const flags = await authPool.query<{ must_change_password: boolean; temporary_expires_at: Date | null }>('SELECT must_change_password,temporary_expires_at FROM security.account_flags WHERE user_id=$1', [current.user.id]);
    const pending = flags.rows[0]?.must_change_password === true;
    if (pending && (config.deployment !== 'local' || !flags.rows[0].temporary_expires_at || flags.rows[0].temporary_expires_at < new Date())) throw new AccessDenied();
    const factor = await authPool.query('SELECT verified FROM authn."twoFactor" WHERE "userId"=$1 AND verified=true', [current.user.id]);
    return { user: { id: row.user_id, email: current.user.email, name: row.display_name }, organization: { id: row.organization_id, name: row.organization_name },
      role: row.role, permissions: permissions[row.role], mfaRequired: !current.user.twoFactorEnabled || factor.rowCount === 0, passwordChangeRequired: pending };
  }
  async function withOrganizationTransaction<T>(identity: Identity, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (identity.mfaRequired || identity.passwordChangeRequired) throw new AccessDenied(403, 'MFA_REQUIRED');
    const client = await dataPool.connect();
    try { await client.query('BEGIN');
      await client.query("SELECT set_config('app.user_id',$1,true),set_config('app.organization_id',$2,true),set_config('app.request_id',gen_random_uuid()::text,true)", [identity.user.id, identity.organization.id]);
      const result = await fn(client); await client.query('COMMIT'); return result;
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
  async function fresh(headers: Headers) {
    const current = await session(headers); if (!current) throw new AccessDenied();
    const row = await authPool.query('SELECT 1 FROM security.session_assurance WHERE session_id=$1 AND reauthenticated_at > clock_timestamp()-interval \'5 minutes\'', [current.session.id]);
    if (!row.rowCount) throw new AccessDenied(403, 'REAUTHENTICATION_REQUIRED');
    return current;
  }
  async function claimTotp(userId: string, code: string) {
    const claim = await authPool.query(`INSERT INTO security.factor_replays(user_id,code_fingerprint,expires_at) VALUES($1,$2,clock_timestamp()+interval '90 seconds')
      ON CONFLICT(user_id,code_fingerprint) DO UPDATE SET expires_at=EXCLUDED.expires_at WHERE security.factor_replays.expires_at < clock_timestamp() RETURNING user_id`, [userId, fingerprint(userId + ':' + code)]);
    if (!claim.rowCount) throw new AccessDenied(401, 'INVALID_CODE');
  }
  async function reauthenticate(headers: Headers, body: unknown) {
    const data = z.object({ password: z.string().min(1).max(128), code: z.string().regex(/^\d{6}$/) }).strict().parse(body);
    const identity = await resolveIdentity(headers); if (identity.mfaRequired || identity.passwordChangeRequired) throw new AccessDenied(403, 'MFA_REQUIRED');
    const current = await session(headers); if (!current) throw new AccessDenied();
    const credential = await authPool.query('SELECT password FROM authn.account WHERE "userId"=$1 AND "providerId"=\'credential\'', [current.user.id]);
    const factor = await authPool.query('SELECT secret FROM authn."twoFactor" WHERE "userId"=$1 AND verified=true', [current.user.id]);
    if (!credential.rowCount || !factor.rowCount || !await verify(credential.rows[0].password, data.password)) throw new AccessDenied();
    const secret = await symmetricDecrypt({ key: config.secret, data: factor.rows[0].secret });
    if (!await createOTP(secret, { digits: 6, period: 30 }).verify(data.code)) throw new AccessDenied();
    await claimTotp(current.user.id, data.code);
    await authPool.query('INSERT INTO security.session_assurance(session_id,reauthenticated_at) VALUES($1,clock_timestamp()) ON CONFLICT(session_id) DO UPDATE SET reauthenticated_at=EXCLUDED.reauthenticated_at', [current.session.id]);
    await audit('reauthentication', current.user.id, true); return { success: true };
  }
  function gatewayAllowed(headers: FastifyRequest['headers']) {
    const value = headers['x-comecore-gateway']; if (typeof value !== 'string') return false;
    const a = Buffer.from(value); const b = Buffer.from(config.gateway); return a.length === b.length && timingSafeEqual(a, b);
  }
  function webHeaders(request: FastifyRequest) {
    const headers = fromNodeHeaders(request.headers);
    for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'forwarded', 'authorization']) headers.delete(name);
    const passed = request.headers['x-real-ip'];
    headers.set('x-comecore-client-ip', config.trustClientIp && typeof passed === 'string' && isIP(passed) ? passed : request.ip);
    return headers;
  }
  function clearCookies(reply: FastifyReply) {
    const names = ['session_token', 'session_data', 'dont_remember', 'two_factor', 'trust_device'];
    reply.header('set-cookie', names.map((name) => `${secure ? '__Secure-' : ''}comecore.${name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`));
  }
  const sendError = (reply: FastifyReply, error: unknown) => {
    const status = error instanceof AccessDenied ? error.status : error instanceof z.ZodError ? 400 : 503;
    if (status === 429) reply.header('retry-after', '60');
    return reply.code(status).send({ code: error instanceof AccessDenied ? error.code : 'REQUEST_FAILED', message: 'No se pudo completar la solicitud. Comprueba tus datos o inténtalo más tarde.' });
  };
  async function register(server: FastifyInstance) {
    await verifyDatabaseBoundary(dataPool, true);
    await verifyDatabaseBoundary(authPool, false);
    server.addHook('onRequest', async (request, reply) => {
      reply.header('cache-control', 'private, no-store').header('referrer-policy', 'no-referrer');
      if (!gatewayAllowed(request.headers)) return sendError(reply, new AccessDenied());
      if (!['GET', 'HEAD'].includes(request.method) && (request.headers.origin !== config.origin || request.headers['sec-fetch-site'] === 'cross-site')) return sendError(reply, new AccessDenied(403, 'ORIGIN_REJECTED'));
    });
    server.addHook('preHandler', async (request, reply) => {
      const path = request.url.split('?')[0];
      if (path.startsWith('/api/auth/') || ['/auth/context', '/auth/reauthenticate', '/auth/logout-all', '/auth/complete-bootstrap', '/auth/verify-email'].includes(path)) return;
      try {
        const identity = await resolveIdentity(webHeaders(request));
        if (identity.mfaRequired || identity.passwordChangeRequired) throw new AccessDenied(403, 'MFA_REQUIRED');
        if (path.startsWith('/mikrotik') && !identity.permissions.includes('red:read')) throw new AccessDenied(403);
        if (path.startsWith('/mikrotik') && config.mikrotikEnabled && identity.organization.id !== config.mikrotikOrganizationId) throw new AccessDenied(403);
      } catch (error) { return sendError(reply, error); }
    });
    server.get('/auth/context', async (request, reply) => { try { return await resolveIdentity(webHeaders(request)); } catch (error) { return sendError(reply, error); } });
    server.post('/auth/verify-email', async (request, reply) => {
      try { await limit(`verify-email:${request.ip}`, 8); const body = z.object({ token: z.string().min(20).max(4096) }).strict().parse(request.body);
        await auth.api.verifyEmail({ query: { token: body.token } }); return { success: true };
      } catch { return sendError(reply, new AccessDenied(400, 'INVALID_TOKEN')); }
    });
    server.post('/auth/reauthenticate', async (request, reply) => { try { await limit(`reauth:${request.ip}:${fingerprint(request.headers.cookie || '')}`, 5); return await reauthenticate(webHeaders(request), request.body); } catch (error) { return sendError(reply, error); } });
    server.post('/auth/logout-all', async (request, reply) => {
      try { const current = await session(webHeaders(request)); if (!current) throw new AccessDenied();
        await authPool.query('DELETE FROM authn.session WHERE "userId"=$1', [current.user.id]);
        await authPool.query('DELETE FROM authn.verification WHERE value=$1', [current.user.id]);
        clearCookies(reply); await audit('logout_all', current.user.id, true); return { success: true };
      } catch (error) { return sendError(reply, error); }
    });
    server.post('/auth/complete-bootstrap', async (request, reply) => {
      try { const headers = webHeaders(request); const identity = await resolveIdentity(headers);
        if (!identity.passwordChangeRequired || config.deployment !== 'local') throw new AccessDenied(403);
        const body = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(15).max(128) }).strict().parse(request.body);
        await auth.api.changePassword({ headers, body: { ...body, revokeOtherSessions: true } });
        await authPool.query('UPDATE security.account_flags SET must_change_password=false,temporary_expires_at=NULL WHERE user_id=$1', [identity.user.id]);
        await authPool.query('DELETE FROM authn.session WHERE "userId"=$1', [identity.user.id]); clearCookies(reply);
        await audit('bootstrap_password_changed', identity.user.id, true); return { success: true };
      } catch (error) { return sendError(reply, error); }
    });
    server.route({ method: ['GET', 'POST'], url: '/api/auth/*', async handler(request, reply) {
      const path = request.url.split('?')[0].slice('/api/auth'.length);
      try {
        if (request.method !== 'POST' || !bodies[path]) throw new AccessDenied(404);
        const body = bodies[path].parse(request.body) as Record<string, unknown>;
        if (typeof body.email === 'string') body.email = body.email.toLowerCase().trim();
        if (body.callbackURL !== undefined && body.callbackURL !== '/' && body.callbackURL !== config.origin + '/') throw new AccessDenied(400);
        if (body.redirectTo !== undefined && body.redirectTo !== config.origin + '/restablecer') throw new AccessDenied(400);
        const headers = webHeaders(request); const ip = headers.get('x-comecore-client-ip')!;
        await limit(`origin:${ip}`, 80);
        // Solo el par cuenta/origen se limita por credenciales fallidas; no bloquea una cuenta desde otras IP.
        if (path === '/sign-in/email' || path === '/request-password-reset') await limit(`${path}:${ip}:${body.email}`, path === '/sign-in/email' ? 8 : 3);
        if (path.startsWith('/two-factor/')) await limit(`factor:${ip}:${fingerprint(headers.get('cookie') || '')}`, 12);
        if (path === '/request-password-reset' && !config.mail) throw new AccessDenied(503, 'RECOVERY_UNAVAILABLE');
        if (['/change-password', '/two-factor/generate-backup-codes', '/two-factor/get-totp-uri'].includes(path)) await fresh(headers);
        if (path === '/two-factor/enable') { const identity = await resolveIdentity(headers); if (identity.passwordChangeRequired) throw new AccessDenied(403, 'PASSWORD_CHANGE_REQUIRED'); }
        if (path === '/change-password') body.revokeOtherSessions = true;
        const response = await auth.handler(new Request(config.origin + '/api/auth' + path, { method: 'POST', headers: new Headers([...headers, ['content-type', 'application/json']]), body: JSON.stringify(body) }));
        const data = await response.json() as Record<string, unknown>;
        if (!response.ok) {
          await audit(path === '/sign-in/email' ? 'login_failed' : 'auth_rejected', null, false, ip);
          const code = data.code === 'PASSWORD_COMPROMISED' ? 'PASSWORD_COMPROMISED' : response.status >= 500 && ['/change-password', '/reset-password'].includes(path) ? 'PASSWORD_CHECK_UNAVAILABLE' : 'INVALID_CREDENTIALS';
          return reply.code(response.status === 429 ? 429 : response.status >= 500 ? 503 : path === '/sign-in/email' ? 401 : 400).send({ code, message: 'No se pudo completar el acceso. Comprueba tus datos e inténtalo de nuevo.' });
        }
        const resultHeaders = new Headers(headers);
        const responseCookies = response.headers.getSetCookie();
        if (responseCookies.length) {
          const merged = new Map((headers.get('cookie') || '').split(';').filter(Boolean).map((s) => { const [k, ...v] = s.trim().split('='); return [k, v.join('=')]; }));
          for (const cookie of responseCookies) { const [key, ...value] = cookie.split(';')[0].split('='); merged.set(key, value.join('=')); }
          resultHeaders.set('cookie', [...merged].map(([k, v]) => `${k}=${v}`).join('; '));
        }
        const current = await session(resultHeaders);
        if (current && (path === '/sign-in/email' || path.startsWith('/two-factor/verify-'))) {
          try { await resolveIdentity(resultHeaders); if (path === '/two-factor/verify-totp') await claimTotp(current.user.id, String(body.code)); }
          catch (error) { await authPool.query('DELETE FROM authn.session WHERE id=$1', [current.session.id]); clearCookies(reply); throw error; }
          await audit(path === '/sign-in/email' ? 'login_password_verified' : 'mfa_verified', current.user.id, true, ip);
        }
        if (path === '/change-password' && current) {
          await authPool.query('DELETE FROM authn.session WHERE "userId"=$1', [current.user.id]); clearCookies(reply);
          await audit('password_changed', current.user.id, true, ip);
        } else if (responseCookies.length) reply.header('set-cookie', responseCookies);
        if (path === '/request-password-reset') return { success: true, message: 'Si la cuenta puede recuperar el acceso, recibirá instrucciones.' };
        // Nunca devolver tokens, ID de sesión ni verificaciones al navegador.
        delete data.token; delete data.session; delete data.sessionToken;
        return reply.code(response.status).send(data);
      } catch (error) { return sendError(reply, error); }
    } });
  }
  return { auth, authPool, dataPool, config, register, resolveIdentity, withOrganizationTransaction, audit,
    async close() { await Promise.all([authPool.end(), dataPool.end()]); } };
}
