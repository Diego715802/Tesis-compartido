import { randomBytes } from 'node:crypto';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { PoolClient, QueryResult } from 'pg';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerWorkspaceRoutes } from './workspace-routes.js';
import type { WorkspaceIdentity } from './workspace-permissions.js';
import { safePortalLink, type WorkspaceCustomer } from './workspace-schema.js';

const organizationA = '40000000-0000-4000-8000-000000000001';
const organizationB = '40000000-0000-4000-8000-000000000002';
const fixture = (): WorkspaceCustomer => ({
  id: 'CUS-1', customId: 'CC0001', kind: 'Persona física', name: 'Cliente de prueba', document: '', createdAt: '2026-10-11',
  address: { street: '', neighborhood: '', city: '', state: '', postalCode: '', latitude: 0, longitude: 0 },
  contact: { email: 'cliente@example.test', mobile: '', landline: '' },
  billing: { enabled: false, taxId: '', legalName: '', legalEntity: 'ComeCore Telecom' },
  assignment: { zone: '', seller: '', collector: '' }, account: { status: 'Al corriente', balance: 0, credit: 0 },
  communication: { email: true, sms: false, whatsapp: false }, portalAccess: false, paymentGateway: 'Sin pasarela', devices: 1,
  deviceRecords: [{ id: 'DEV-1', name: 'Prueba', pushToken: 'secret-push', createdAt: '2026-10-11' }],
  notes: '', contracts: [{ id: 'CTR-1', plan: 'Plan', server: 'Servidor', node: 'Nodo', ipAddress: '10.0.0.2', status: 'Habilitado', downstreamGb: 0, upstreamGb: 0, password: 'secret-pppoe', wifiPassword: 'secret-wifi', price: 0 }],
  audit: [{ id: 'AUD-forged', actor: 'Falsificado', action: 'Texto no confiable', date: '2026-10-11', detail: 'secret-pppoe' }],
});

type Row = { payload_ciphertext: string; version: number };
describe('Secure workspace API', () => {
  let server: FastifyInstance;
  let key: string;
  let identity: WorkspaceIdentity | null;
  let rows: Map<string, Row>;

  function clientFor(organization: string): PoolClient {
    const query = async (sql: string, args: unknown[] = []): Promise<QueryResult> => {
      // A narrow DB adapter tests parameterization and tenant context, not PostgreSQL
      // RLS. That database behavior is covered by the real integration suite.
      expect(args[0]).toBe(organization);
      expect(sql).not.toContain('Cliente de prueba');
      const existing = rows.get(organization);
      if (sql.startsWith('SELECT')) return { rows: existing ? [existing] : [], rowCount: existing ? 1 : 0, command: 'SELECT', oid: 0, fields: [] };
      if (sql.startsWith('INSERT') && !existing) { rows.set(organization, { payload_ciphertext: String(args[1]), version: Number(args[2]) }); return { rows: [{ version: args[2] }], rowCount: 1, command: 'INSERT', oid: 0, fields: [] }; }
      if (sql.startsWith('UPDATE') && existing?.version === args[3]) { rows.set(organization, { payload_ciphertext: String(args[1]), version: Number(args[2]) }); return { rows: [{ version: args[2] }], rowCount: 1, command: 'UPDATE', oid: 0, fields: [] }; }
      return { rows: [], rowCount: 0, command: 'UPDATE', oid: 0, fields: [] };
    };
    return { query } as unknown as PoolClient;
  }

  const read = async () => { const response = await server.inject({ method: 'GET', url: '/erp/workspace' }); expect(response.statusCode).toBe(200); return response.json<{ customers: WorkspaceCustomer[]; version: number }>(); };
  const write = (customers: WorkspaceCustomer[], version = 0) => server.inject({ method: 'PUT', url: '/erp/workspace', payload: { customers, version } });

  beforeEach(() => {
    rows = new Map(); key = randomBytes(32).toString('base64url');
    identity = { user: { id: '50000000-0000-4000-8000-000000000001', email: 'operador@example.test', name: 'Operador verificado' }, organization: { id: organizationA, name: 'Organización A' }, role: 'owner', permissions: ['clientes:read', 'clientes:write', 'contratos:write', 'facturacion:write', 'red:secrets'], mfaRequired: false };
    server = Fastify();
    registerWorkspaceRoutes(server, {
      workspaceKey: key, resolveIdentity: async () => identity,
      withOrganizationTransaction: async (resolved, operation) => operation(clientFor(resolved.organization.id)),
    });
  });
  afterEach(async () => { await server.close(); });

  it('starts empty; persists authenticated ciphertext and server authorship', async () => {
    expect(await read()).toEqual({ customers: [], version: 0 });
    const response = await write([fixture()]);
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    const saved = await read();
    expect(saved.version).toBe(1);
    expect(saved.customers[0].contracts[0].password).toBe('secret-pppoe');
    expect(saved.customers[0].audit[0].actor).toBe('Operador verificado');
    expect(saved.customers[0].audit.some((event) => event.actor === 'Falsificado')).toBe(false);
    const ciphertext = rows.get(organizationA)!.payload_ciphertext;
    expect(ciphertext).not.toContain('secret');
    expect(ciphertext).not.toContain('Cliente');
    const plaintext = JSON.parse(await symmetricDecrypt({ key, data: ciphertext }));
    expect(plaintext.organizationId).toBe(organizationA);
    expect(plaintext.customers[0].audit[0].detail).toBeUndefined();
  });

  it('requires a session, MFA and required password change for both methods', async () => {
    identity = null;
    expect((await server.inject({ method: 'GET', url: '/erp/workspace' })).statusCode).toBe(401);
    expect((await write([])).statusCode).toBe(401);
    identity = { user: { id: 'user', email: '', name: '' }, organization: { id: organizationA, name: '' }, role: 'admin', permissions: [], mfaRequired: true };
    expect((await write([])).json().code).toBe('MFA_REQUIRED');
    identity.mfaRequired = false; identity.passwordChangeRequired = true;
    expect((await server.inject({ method: 'GET', url: '/erp/workspace' })).json().code).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('isolates organizations, rejects copied ciphertext and tampering', async () => {
    expect((await write([fixture()])).statusCode).toBe(200);
    identity!.organization.id = organizationB;
    expect(await read()).toEqual({ customers: [], version: 0 });
    rows.set(organizationB, rows.get(organizationA)!);
    const copied = await server.inject({ method: 'GET', url: '/erp/workspace' });
    expect(copied.statusCode).toBe(503); expect(copied.body).not.toContain('secret');
    identity!.organization.id = organizationA;
    rows.get(organizationA)!.payload_ciphertext = '00'.repeat(100);
    expect((await server.inject({ method: 'GET', url: '/erp/workspace' })).statusCode).toBe(503);
  });

  it('rejects stale versions and accepts the current version', async () => {
    expect((await write([fixture()])).statusCode).toBe(200);
    const saved = await read(); saved.customers[0].notes = 'Cambio';
    expect((await write(saved.customers, 0)).statusCode).toBe(409);
    expect((await read()).customers[0].notes).toBe('');
    expect((await write(saved.customers, 1)).statusCode).toBe(200);
    expect((await read()).version).toBe(2);
  });

  it('masks network secrets for viewer/billing and denies viewer mutations', async () => {
    await write([fixture()]);
    identity!.role = 'viewer';
    const saved = await read();
    expect(saved.customers[0].contracts[0].password).toBe('');
    expect(saved.customers[0].contracts[0].wifiPassword).toBe('');
    expect(saved.customers[0].deviceRecords![0].pushToken).toBe('');
    expect((await write(saved.customers, 1)).statusCode).toBe(403);
    identity!.role = 'billing';
    expect((await read()).customers[0].contracts[0].password).toBe('');
  });

  it('allows billing amounts, preserves hidden secrets and denies contact/network/identity changes', async () => {
    await write([fixture()]); identity!.role = 'billing';
    let saved = await read(); saved.customers[0].account.balance = 123;
    expect((await write(saved.customers, saved.version)).statusCode).toBe(200);
    saved = await read(); saved.customers[0].contact.mobile = 'Changed';
    expect((await write(saved.customers, saved.version)).statusCode).toBe(403);
    saved = await read(); saved.customers[0].contracts[0].password = 'new-secret';
    expect((await write(saved.customers, saved.version)).statusCode).toBe(403);
    identity!.role = 'owner';
    expect((await read()).customers[0].contracts[0].password).toBe('secret-pppoe');
  });

  it('allows support contact/network changes but refuses financial changes and tenant resource reassignment', async () => {
    await write([fixture()]); identity!.role = 'support';
    let saved = await read(); saved.customers[0].contact.mobile = '555'; saved.customers[0].contracts[0].wifiPassword = 'updated-wifi';
    expect((await write(saved.customers, saved.version)).statusCode).toBe(200);
    saved = await read(); saved.customers[0].contracts[0].price = 1;
    expect((await write(saved.customers, saved.version)).statusCode).toBe(403);
    saved = await read(); saved.customers[0].account.balance = 1;
    expect((await write(saved.customers, saved.version)).statusCode).toBe(403);
    saved = await read(); saved.customers[0].createdAt = 'Forged';
    expect((await write(saved.customers, saved.version)).statusCode).toBe(403);
  });

  it('permits billing updates when a contract never had secret fields', async () => {
    const customer = fixture(); delete customer.contracts[0].password; delete customer.contracts[0].wifiPassword;
    await write([customer]); identity!.role = 'billing';
    const saved = await read(); saved.customers[0].account.balance = 15;
    expect((await write(saved.customers, saved.version)).statusCode).toBe(200);
  });

  it('validates strict shape, duplicates, ranges, unknown keys and safe URLs on the server', async () => {
    const invalid = fixture(); invalid.portalLink = 'javascript:alert(1)';
    expect((await write([invalid])).statusCode).toBe(400);
    expect((await write([fixture(), fixture()])).statusCode).toBe(400);
    const badCoordinate = fixture(); badCoordinate.address.latitude = 100;
    expect((await write([badCoordinate])).statusCode).toBe(400);
    const unknown = await server.inject({ method: 'PUT', url: '/erp/workspace', payload: { customers: [fixture()], version: 0, organization_id: organizationB } });
    expect(unknown.statusCode).toBe(400);
    const nestedUnknown = fixture() as WorkspaceCustomer & { owner: string }; nestedUnknown.owner = 'attacker';
    expect((await write([nestedUnknown])).statusCode).toBe(400);
    expect((await server.inject({ method: 'PUT', url: '/erp/workspace', headers: { 'content-type': 'text/plain' }, payload: 'text' })).statusCode).toBe(415);
    for (const uri of ['javascript:alert(1)', '//evil.test', '/%2fevil.test', 'https://user:password@evil.test', '/\\evil.test']) expect(safePortalLink(uri)).toBe(false);
    expect(safePortalLink('/portal/clientes/CC0001')).toBe(true); expect(safePortalLink('https://clientes.example.test/acceso/CC0001')).toBe(true);
  });

  it('refuses data above the route body limit without saving', async () => {
    const response = await server.inject({ method: 'PUT', url: '/erp/workspace', payload: { customers: [], version: 0, padding: 'x'.repeat(2 * 1024 * 1024) } });
    expect(response.statusCode).toBe(413); expect(rows.size).toBe(0);
  });

  it('refuses a forged version inside authenticated ciphertext', async () => {
    rows.set(organizationA, { payload_ciphertext: await symmetricEncrypt({ key, data: JSON.stringify({ schemaVersion: 1, organizationId: organizationA, version: 2, customers: [] }) }), version: 1 });
    expect((await server.inject({ method: 'GET', url: '/erp/workspace' })).statusCode).toBe(503);
  });
});
