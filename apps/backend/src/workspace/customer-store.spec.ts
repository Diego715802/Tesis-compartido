import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer } from '../../../frontend/src/features/clientes/customer-types.js';

// Exercise persistence sequencing without a DOM renderer. Rendering itself is
// tested by the frontend/browser suite; this callback exposes committed state.
vi.mock('react', () => ({ useSyncExternalStore: (_subscribe: unknown, snapshot: () => unknown) => snapshot() }));

const fixture = (): Customer => ({
  id: 'CUS-1', customId: 'CC0001', kind: 'Otro', name: 'Prueba', document: '', createdAt: '2026-10-11',
  address: { street: '', neighborhood: '', city: '', state: '', postalCode: '', latitude: 0, longitude: 0 },
  contact: { email: '', mobile: '', landline: '' }, billing: { enabled: false, taxId: '', legalName: '', legalEntity: '' },
  assignment: { zone: '', seller: '', collector: '' }, account: { status: 'Al corriente', balance: 0, credit: 0 },
  communication: { email: false, sms: false, whatsapp: false }, portalAccess: false, paymentGateway: '', devices: 0, notes: '', contracts: [], audit: [],
});

describe('Customer server persistence', () => {
  let remote: { customers: Customer[]; version: number };
  let forcedPutStatus: number;
  let putBarrier: Promise<void> | undefined;
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    remote = { customers: [fixture()], version: 1 }; forcedPutStatus = 0; putBarrier = undefined;
    // Any accidental use of either storage API fails the test immediately.
    const noStorage = new Proxy({}, { get: (_target, key) => { if (key === 'localStorage' || key === 'sessionStorage') throw new Error('Browser storage forbidden'); return undefined; } });
    vi.stubGlobal('window', noStorage);
    fetchMock = vi.fn(async (_url: string, options: RequestInit) => {
      expect(options.credentials).toBe('same-origin'); expect(options.cache).toBe('no-store');
      if (options.method === 'GET') return Response.json(remote);
      await putBarrier;
      if (forcedPutStatus) return Response.json({ code: 'FORBIDDEN', message: 'Denied' }, { status: forcedPutStatus });
      const input = JSON.parse(String(options.body));
      if (input.version !== remote.version) return Response.json({ code: 'WORKSPACE_CONFLICT' }, { status: 409 });
      remote = { customers: input.customers, version: remote.version + 1 };
      return Response.json(remote);
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('uses only the server and exposes changes after the PUT response', async () => {
    const store = await import('../../../frontend/src/features/clientes/customer-store.js');
    await store.retryCustomerWorkspace();
    let unblock!: () => void;
    putBarrier = new Promise<void>((resolve) => { unblock = resolve; });
    const saving = store.commitCustomers((current) => current.map((customer) => ({ ...customer, name: 'Confirmado' })));
    await vi.waitFor(() => expect(fetchMock.mock.calls.some((call) => call[1].method === 'PUT')).toBe(true));
    expect(store.useCustomers()[0][0].name).toBe('Prueba');
    expect(store.useCustomerPersistenceStatus().status).toBe('loading');
    unblock(); await saving;
    expect(store.useCustomers()[0][0].name).toBe('Confirmado');
    expect(store.useCustomerPersistenceStatus().status).toBe('saved');
  });

  it('serializes updates against the last committed state and version', async () => {
    const store = await import('../../../frontend/src/features/clientes/customer-store.js');
    await store.retryCustomerWorkspace();
    const first = store.commitCustomers((current) => current.map((customer) => ({ ...customer, notes: 'Primero' })));
    const second = store.commitCustomers((current) => current.map((customer) => ({ ...customer, notes: `${customer.notes} y segundo` })));
    await Promise.all([first, second]);
    const puts = fetchMock.mock.calls.filter((call) => call[1].method === 'PUT').map((call) => JSON.parse(String(call[1].body)));
    expect(puts.map((input) => input.version)).toEqual([1, 2]);
    expect(remote.customers[0].notes).toBe('Primero y segundo');
    expect(remote.version).toBe(3);
  });

  it('rejects denied saves and retains confirmed server state', async () => {
    const store = await import('../../../frontend/src/features/clientes/customer-store.js');
    await store.retryCustomerWorkspace(); forcedPutStatus = 403;
    await expect(store.commitCustomers((current) => current.map((customer) => ({ ...customer, name: 'No autorizado' })))).rejects.toThrow('No tienes permiso');
    expect(store.useCustomers()[0][0].name).toBe('Prueba');
    expect(store.useCustomerPersistenceStatus().status).toBe('unavailable');
  });

  it('recovers the newer server state after a conflict and does not blindly retry', async () => {
    const store = await import('../../../frontend/src/features/clientes/customer-store.js');
    await store.retryCustomerWorkspace(); remote = { customers: [{ ...fixture(), name: 'Otra sesión' }], version: 2 };
    await expect(store.commitCustomers((current) => current.map((customer) => ({ ...customer, name: 'Antiguo' })))).rejects.toThrow('Otra sesión');
    expect(store.useCustomers()[0][0].name).toBe('Otra sesión');
    expect(fetchMock.mock.calls.filter((call) => call[1].method === 'PUT')).toHaveLength(1);
  });

  it('discards data on logout and re-reads under the next verified session', async () => {
    const store = await import('../../../frontend/src/features/clientes/customer-store.js');
    await store.retryCustomerWorkspace(); store.resetCustomerWorkspace();
    expect(store.useCustomers()[0]).toEqual([]);
    remote = { customers: [], version: 0 }; await store.retryCustomerWorkspace();
    expect(store.useCustomers()[0]).toEqual([]);
  });
});
