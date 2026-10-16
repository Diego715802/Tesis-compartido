import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Identity } from '../security/runtime.js';
import { registerCmcRoutes, type CmcDependencies } from './cmc-routes.js';

const origin = 'http://localhost:3000';
const revision = 'a'.repeat(64);
const nextRevision = 'b'.repeat(64);
const organization = '40000000-0000-4000-8000-000000000001';
const connection = { endpoint: 'http://127.0.0.1:3012/bridge', secret: 'private-fixture-bridge-key-never-exposed-to-client', publicUrl: 'http://localhost:3010' };
const site = () => ({ settings: { brandName: 'Página de prueba' }, plans: [], towers: [], faqs: [], source: 'cometalink-web' });
const snapshot = () => ({ site: site(), revision, environment: 'local' });
const authorized = (): Identity => ({ user: { id: '50000000-0000-4000-8000-000000000001', email: 'editor@example.test', name: 'Editor verificado' }, organization: { id: organization, name: 'Organización verificada' }, role: 'owner', permissions: ['sitio-web:read', 'sitio-web:write'], mfaRequired: false, passwordChangeRequired: false });
function transportBody(options: RequestInit | undefined) {
  expect(typeof options?.body).toBe('string');
  if (typeof options?.body !== 'string') throw new Error('Expected a serialized bridge envelope');
  return JSON.parse(options.body);
}

describe('CMC content API boundary', () => {
  let server: FastifyInstance;
  let identity: Identity | null;
  let deps: CmcDependencies;
  let resolverError: unknown;
  let upstream: () => Response | Promise<Response>;
  const transport = vi.fn<typeof globalThis.fetch>();
  const read = (url = '/cmc/content', headers: Record<string, string> = {}) => server.inject({ method: 'GET', url, headers });
  const write = (payload: unknown = { site: site(), revision }, headers: Record<string, string> = {}, url = '/cmc/content') => server.inject({ method: 'PUT', url, headers: { origin, 'content-type': 'application/json', ...headers }, payload });

  beforeEach(() => {
    identity = authorized(); resolverError = undefined; upstream = () => Response.json(snapshot()); transport.mockReset();
    transport.mockImplementation(async () => upstream());
    server = Fastify();
    deps = { origin, connection, fetch: transport, resolveIdentity: async () => { if (resolverError) throw resolverError; return identity as Identity; } };
    registerCmcRoutes(server, deps);
  });
  afterEach(async () => { await server.close(); });

  it.each(['owner', 'admin'])('lets an authenticated %s read and publish only through the server bridge', async (role) => {
    identity!.role = role;
    const result = await read();
    expect(result.statusCode).toBe(200); expect(result.headers['cache-control']).toBe('private, no-store');
    expect(result.json()).toEqual({ ...snapshot(), publicUrl: connection.publicUrl });
    expect((await write()).statusCode).toBe(200);
    expect(transport).toHaveBeenCalledTimes(2);
    const [url, options] = transport.mock.calls[1];
    expect(url).toBe(connection.endpoint); expect(options?.method).toBe('POST'); expect(options?.redirect).toBe('error');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(options?.headers).toEqual({ 'content-type': 'application/json', authorization: `Bearer ${connection.secret}` });
    expect(transportBody(options)).toEqual({ operation: 'publish', organizationId: organization, actor: { ...identity!.user, role }, site: site(), revision });
    expect(result.body).not.toContain(connection.secret);
  });

  it('uses verified identity and never forwards browser cookies or forged authorization to the CMC', async () => {
    const result = await read('/cmc/content', { cookie: 'erp-session=opaque', authorization: 'Bearer attacker', 'x-role': 'admin', 'x-organization-id': 'foreign-organization', 'x-cmc-bridge-secret': 'attacker' });
    expect(result.statusCode).toBe(200);
    const options = transport.mock.calls[0][1]!;
    expect(options.headers).toEqual({ 'content-type': 'application/json', authorization: `Bearer ${connection.secret}` });
    expect(transportBody(options)).toEqual({ operation: 'read', organizationId: organization, actor: { ...identity!.user, role: 'owner' } });
    const forged = await write({ site: site(), revision, actor: { id: 'attacker', role: 'owner' }, organizationId: 'foreign-organization' });
    expect(forged.statusCode).toBe(400); expect(transport).toHaveBeenCalledTimes(1);
  });

  it('denies anonymous access and treats resolver 401/403 as access denial', async () => {
    identity = null;
    expect((await read()).statusCode).toBe(401); expect((await write()).statusCode).toBe(401);
    for (const status of [401, 403]) {
      resolverError = { status, message: 'private resolver details' };
      const result = await read(); expect(result.statusCode).toBe(status); expect(result.body).not.toContain('private resolver details');
    }
    expect(transport).not.toHaveBeenCalled();
  });

  it.each(['support', 'billing', 'viewer', 'attacker'])('denies %s even with forged site permissions', async (role) => {
    identity!.role = role;
    expect((await read()).statusCode).toBe(403); expect((await write()).statusCode).toBe(403);
    expect(transport).not.toHaveBeenCalled();
  });

  it('enforces read and write permissions independently', async () => {
    identity!.permissions = ['sitio-web:read'];
    expect((await read()).statusCode).toBe(200); expect((await write()).statusCode).toBe(403);
    identity!.permissions = ['sitio-web:write'];
    expect((await read()).statusCode).toBe(403); expect((await write()).statusCode).toBe(200);
    identity!.permissions = [];
    expect((await read()).statusCode).toBe(403); expect((await write()).statusCode).toBe(403);
    expect(transport).toHaveBeenCalledTimes(2);
  });

  it.each(['mfaRequired', 'passwordChangeRequired'] as const)('blocks both methods when %s is pending', async (flag) => {
    identity![flag] = true;
    expect((await read()).statusCode).toBe(403); expect((await write()).statusCode).toBe(403);
    expect(transport).not.toHaveBeenCalled();
  });

  it('rejects foreign/missing origins and cross-site writes before contacting the bridge', async () => {
    expect((await write(undefined, { origin: 'https://attacker.invalid' })).statusCode).toBe(403);
    expect((await write(undefined, { origin: '' })).statusCode).toBe(403);
    expect((await write(undefined, { 'sec-fetch-site': 'cross-site' })).statusCode).toBe(403);
    expect(transport).not.toHaveBeenCalled();
  });

  it('rejects query parameters, malformed envelopes and oversized content', async () => {
    expect((await read('/cmc/content?organizationId=foreign')).statusCode).toBe(400);
    expect((await write(undefined, {}, '/cmc/content?role=owner')).statusCode).toBe(400);
    for (const payload of [[], {}, { site: site(), revision: 'bad' }, { site: [], revision }, { site: site(), revision, role: 'owner' }]) expect((await write(payload)).statusCode).toBe(400);
    expect((await write('text', { 'content-type': 'text/plain' })).statusCode).toBe(415);
    expect((await write('{not-json')).statusCode).toBe(400);
    expect((await write({ site: { text: 'x'.repeat(300_000) }, revision })).statusCode).toBe(413);
    expect(transport).not.toHaveBeenCalled();
  });

  it('returns an explicit conflict without retrying or overwriting the supplied revision', async () => {
    upstream = () => Response.json({ message: 'upstream private conflict detail' }, { status: 409 });
    const result = await write();
    expect(result.statusCode).toBe(409); expect(result.json().code).toBe('CONTENT_CONFLICT');
    expect(result.body).not.toContain('upstream private conflict detail'); expect(transport).toHaveBeenCalledTimes(1);
    expect(transportBody(transport.mock.calls[0][1]).revision).toBe(revision);
  });

  it('returns a successfully published revision and timestamp', async () => {
    upstream = () => Response.json({ ...snapshot(), revision: nextRevision, publishedAt: '2026-10-11T12:00:00.000Z' });
    const result = await write();
    expect(result.statusCode).toBe(200); expect(result.json().revision).toBe(nextRevision); expect(result.json().publishedAt).toBe('2026-10-11T12:00:00.000Z');
  });

  it('does not publish when the connection is absent or the bridge rejects organization membership', async () => {
    deps.connection = undefined;
    expect((await read()).statusCode).toBe(503); expect(transport).not.toHaveBeenCalled();
    deps.connection = connection; upstream = () => Response.json({ message: 'private organization details' }, { status: 403 });
    const result = await write();
    expect(result.statusCode).toBe(403); expect(result.json().code).toBe('FORBIDDEN'); expect(result.body).not.toContain('private organization details');
  });

  it('fails closed for unavailable, redirected, invalid, oversized and secret-bearing error responses', async () => {
    for (const response of [
      () => { throw new Error(connection.secret); },
      () => new Response(null, { status: 302, headers: { location: 'https://attacker.invalid' } }),
      () => new Response('not JSON', { status: 200 }),
      () => Response.json({ ...snapshot(), revision: 'invalid' }),
      () => Response.json({ ...snapshot(), environment: 'production' }),
      () => Response.json({ ...snapshot(), site: { ...site(), source: 'foreign-site' } }),
      () => Response.json({ ...snapshot(), unexpected: connection.secret }),
      () => Response.json({ ...snapshot(), site: { ...site(), oversized: 'x'.repeat(300_000) } }),
      () => Response.json({ message: connection.secret }, { status: 500 }),
    ]) {
      upstream = response;
      const result = await write();
      expect(result.statusCode).toBe(503); expect(result.headers.location).toBeUndefined(); expect(result.body).not.toContain(connection.secret);
    }
  });
});
