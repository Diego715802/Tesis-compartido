'use strict';
// Test the actual CMC BFF and identity/config source with isolated upstreams.
// These fixtures contain no real users, browser sessions or bridge credentials.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const originalLoader = Module._extensions['.ts'];
Module._extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const originalRequire = module.require.bind(module);
  module.require = (id) => id === 'server-only' ? {} : originalRequire(id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id);
  module._compile(compiled, filename);
};
const origin = 'http://localhost:3000';
const backend = 'http://127.0.0.1:3001';
process.env.AUTH_PUBLIC_ORIGIN = origin;
process.env.COMECORE_BACKEND_URL = backend;
process.env.AUTH_GATEWAY_SECRET = 'fixture-server-gateway-key-not-a-real-secret';
delete process.env.AUTH_TRUST_PROXY_HEADER;
const { GET, PUT } = require('../src/app/api/cmc/content/route.ts');
const { permissionForPath } = require('../src/lib/auth/config.ts');
const originalFetch = global.fetch;
const revision = 'a'.repeat(64);
const site = { settings: { brandName: 'Sitio de prueba' }, plans: [], towers: [], faqs: [], source: 'cometalink-web' };
const snapshot = { site, revision, environment: 'local', publicUrl: 'http://localhost:3010' };
const fixtureIdentity = () => ({ user: { id: 'verified-user', name: 'Editor', email: 'editor@example.test' }, organization: { id: 'verified-organization', name: 'Empresa' }, role: 'owner', permissions: ['sitio-web:read', 'sitio-web:write'], mfaRequired: false, passwordChangeRequired: false });
let identity;
let identityStatus;
let calls;
let upstream;
let identityFailure;
let checked = 0;
global.fetch = async (url, options) => {
  calls.push({ url: String(url), options });
  if (String(url) === `${backend}/auth/context`) {
    if (identityFailure) throw new Error('private identity network detail');
    return Response.json(identity, { status: identityStatus });
  }
  assert.equal(String(url), `${backend}/cmc/content`);
  return upstream();
};
function request(method = 'GET', headers = {}, body = JSON.stringify({ site, revision }), query = '') {
  return new Request(`${origin}/api/cmc/content${query}`, {
    method, headers: { host: 'localhost:3000', cookie: 'erp-session=fixture-opaque', ...(method === 'PUT' ? { origin, 'content-type': 'application/json' } : {}), ...headers }, ...(method === 'PUT' ? { body } : {}),
  });
}
const contentCalls = () => calls.filter(({ url }) => url === `${backend}/cmc/content`);
async function check(name, run) {
  identity = fixtureIdentity(); identityStatus = 200; calls = []; upstream = () => Response.json(snapshot); identityFailure = false;
  await run(); checked += 1; console.log(`PASS: ${name}`);
}
async function run() {
  await check('owner/admin can read and publish; the page maps to the site permission', async () => {
    assert.equal(permissionForPath('/sitio-web'), 'sitio-web:read');
    assert.equal(permissionForPath('/sitio-web/ajustes'), 'sitio-web:read');
    assert.equal(permissionForPath('/sitio-web-ajeno'), undefined);
    for (const role of ['owner', 'admin']) {
      identity.role = role;
      const read = await GET(request()); assert.equal(read.status, 200); assert.deepEqual(await read.json(), snapshot);
      assert.equal(read.headers.get('cache-control'), 'private, no-store');
      const write = await PUT(request('PUT')); assert.equal(write.status, 200);
    }
    assert.equal(contentCalls().length, 4);
  });
  await check('anonymous sessions and incomplete security cannot reach CMC resources', async () => {
    identityStatus = 401; identity = { message: 'No session' };
    assert.equal((await GET(request())).status, 401); assert.equal((await PUT(request('PUT'))).status, 401);
    identityStatus = 200; identity = fixtureIdentity(); identity.mfaRequired = true;
    assert.equal((await GET(request())).status, 403); assert.equal((await PUT(request('PUT'))).status, 403);
    identity.mfaRequired = false; identity.passwordChangeRequired = true;
    assert.equal((await GET(request())).status, 403); assert.equal((await PUT(request('PUT'))).status, 403);
    assert.equal(contentCalls().length, 0);
  });
  await check('non-administrators cannot gain access through a forged role/header/body', async () => {
    for (const role of ['viewer', 'support', 'billing', 'attacker']) {
      identity.role = role;
      const headers = { 'x-role': 'owner', 'x-organization-id': 'foreign', authorization: 'Bearer attacker' };
      assert.equal((await GET(request('GET', headers))).status, 403);
      assert.equal((await PUT(request('PUT', headers, JSON.stringify({ site, revision, actor: { role: 'owner' }, organizationId: 'foreign' })))).status, 403);
    }
    assert.equal(contentCalls().length, 0);
  });
  await check('read/write permissions are independent and checked server-side', async () => {
    identity.permissions = ['sitio-web:read'];
    assert.equal((await GET(request())).status, 200); assert.equal((await PUT(request('PUT'))).status, 403);
    identity.permissions = ['sitio-web:write'];
    assert.equal((await GET(request())).status, 403); assert.equal((await PUT(request('PUT'))).status, 200);
    identity.permissions = [];
    assert.equal((await GET(request())).status, 403); assert.equal((await PUT(request('PUT'))).status, 403);
    assert.equal(contentCalls().length, 2);
  });
  await check('forged hosts, query parameters and cross-origin mutations are denied', async () => {
    assert.equal((await GET(request('GET', { host: '192.168.1.10:3000' }))).status, 400);
    assert.equal((await PUT(request('PUT', { origin: 'https://attacker.invalid' }))).status, 403);
    assert.equal((await PUT(request('PUT', { origin: '' }))).status, 403);
    assert.equal((await PUT(request('PUT', { 'sec-fetch-site': 'cross-site' }))).status, 403);
    const count = calls.length;
    assert.equal((await GET(request('GET', {}, undefined, '?organizationId=foreign'))).status, 400);
    assert.equal((await PUT(request('PUT', {}, undefined, '?role=owner'))).status, 400);
    assert.equal(calls.length, count); assert.equal(contentCalls().length, 0);
  });
  await check('invalid JSON, non-JSON and oversized updates never reach the content backend', async () => {
    assert.equal((await PUT(request('PUT', { 'content-type': 'text/plain' }))).status, 415);
    for (const body of ['[]', 'null', '{invalid']) assert.equal((await PUT(request('PUT', {}, body))).status, 400);
    assert.equal((await PUT(request('PUT', {}, JSON.stringify({ site: { padding: 'x'.repeat(300_000) }, revision })))).status, 413);
    assert.equal((await PUT(request('PUT', { 'content-length': '300001' }, '{}'))).status, 413);
    assert.equal(contentCalls().length, 0);
  });
  await check('only allowed ERP session/origin/gateway headers reach the backend; no client secrets are trusted', async () => {
    const forged = { authorization: 'Bearer attacker', 'x-comecore-gateway': 'attacker', 'x-cmc-bridge-secret': 'attacker', 'x-forwarded-for': 'attacker', 'x-real-ip': '1.2.3.4', 'x-role': 'owner' };
    const result = await PUT(request('PUT', forged)); assert.equal(result.status, 200);
    const forwarded = contentCalls()[0].options;
    assert.equal(forwarded.method, 'PUT'); assert.equal(forwarded.redirect, 'manual'); assert.equal(forwarded.cache, 'no-store');
    assert.deepEqual(JSON.parse(forwarded.body), { site, revision });
    assert.equal(forwarded.headers.get('cookie'), 'erp-session=fixture-opaque');
    assert.equal(forwarded.headers.get('origin'), origin);
    assert.equal(forwarded.headers.get('x-comecore-gateway'), process.env.AUTH_GATEWAY_SECRET);
    for (const header of ['authorization', 'x-cmc-bridge-secret', 'x-forwarded-for', 'x-real-ip', 'x-role']) assert.equal(forwarded.headers.get(header), null);
    assert.doesNotMatch(JSON.stringify(await result.json()), /fixture-server-gateway-key/);
    // The subsequent backend test separately proves ERP cookies do not reach the CMC bridge.
  });
  await check('version conflicts are returned unchanged without retrying or discarding the draft', async () => {
    upstream = () => Response.json({ code: 'CONTENT_CONFLICT', message: 'Recarga y revisa los cambios.' }, { status: 409 });
    const result = await PUT(request('PUT')); assert.equal(result.status, 409); assert.equal((await result.json()).code, 'CONTENT_CONFLICT');
    assert.equal(contentCalls().length, 1); assert.equal(JSON.parse(contentCalls()[0].options.body).revision, revision);
  });
  await check('upstream redirects, transport failures and invalid identity fail closed without internal details', async () => {
    upstream = () => new Response(null, { status: 302, headers: { location: 'https://attacker.invalid' } });
    let result = await PUT(request('PUT')); assert.equal(result.status, 502); assert.equal(result.headers.get('location'), null);
    upstream = () => { throw new Error('private CMC transport detail'); };
    result = await PUT(request('PUT')); assert.equal(result.status, 503); assert.doesNotMatch(JSON.stringify(await result.json()), /private CMC/);
    identityFailure = true; result = await GET(request()); assert.equal(result.status, 503); assert.doesNotMatch(JSON.stringify(await result.json()), /private identity/);
    identityFailure = false; identity = { user: { id: 'user' }, permissions: ['sitio-web:read'], mfaRequired: false };
    const count = contentCalls().length; assert.equal((await GET(request())).status, 503); assert.equal(contentCalls().length, count);
  });
  await check('session identifiers are stripped from backend JSON responses', async () => {
    upstream = () => Response.json({ ...snapshot, token: 'never expose', session: { token: 'never expose' }, sessionToken: 'never expose' });
    const result = await GET(request()); assert.equal(result.status, 200); assert.deepEqual(await result.json(), snapshot);
  });
  console.log(`PASS: ${checked} CMC BFF boundary scenarios using the real route source and mocked upstreams.`);
}
run().finally(() => { global.fetch = originalFetch; if (originalLoader) Module._extensions['.ts'] = originalLoader; else delete Module._extensions['.ts']; }).catch(error => { console.error(error); process.exitCode = 1; });
