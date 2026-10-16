import assert from 'node:assert/strict';
// Comprueba el ingreso HTTP local real, sin cookies ni credenciales.
const origin = 'http://localhost:3000';
const pages = ['/','/clientes','/contratos','/planes','/nodos','/servidores','/inventario','/facturacion','/facturacion/comprobantes','/sitio-web','/seguridad'];
for (const route of pages) {
  const response = await fetch(origin + route, { redirect: 'manual' });
  assert.ok([302,303,307,308].includes(response.status), `Ruta sin sesión: ${route}`);
  assert.equal(new URL(response.headers.get('location'), origin).pathname, '/login');
  console.log('PASS página protegida ' + route);
}
for (const route of ['/api/identity','/api/erp/workspace','/api/cmc/content','/api/mikrotik/telemetry']) {
  const response = await fetch(origin + route, { redirect: 'manual' });
  assert.equal(response.status, 401, `API sin sesión: ${route}`);
  console.log('PASS API sin sesión rechazada ' + route);
}
const rejected = await fetch(origin + '/api/auth/sign-in/email', {
  method: 'POST', headers: { origin: 'https://malicioso.example', 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'qa-no-existe@example.invalid', password: 'incorrecta' }),
});
assert.equal(rejected.status, 403);
console.log('PASS origen externo rechazado por el ingreso frontend');
const login = await fetch(origin + '/login');
assert.equal(login.status, 200);
assert.equal(login.headers.get('x-content-type-options'), 'nosniff');
assert.ok(login.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
assert.equal(login.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
const csp = login.headers.get('content-security-policy');
assert.ok(csp.includes("script-src 'self' 'nonce-") && csp.includes("'strict-dynamic'"));
assert.ok(!csp.includes("'unsafe-eval'") && !/script-src[^;]*'unsafe-inline'/.test(csp));
assert.ok(csp.includes('frame-src https://www.google.com https://maps.google.com'));
assert.ok(csp.includes("object-src 'none'") && csp.includes("form-action 'self'"));
console.log('PASS login accesible y cabeceras de seguridad locales');
const direct = await fetch('http://127.0.0.1:3001/mikrotik/telemetry');
assert.equal(direct.status, 401);
console.log('PASS backend directo sin gateway rechazado');
console.log('18 comprobaciones HTTP locales aprobadas; no prueba HTTPS ni proxy público.');
