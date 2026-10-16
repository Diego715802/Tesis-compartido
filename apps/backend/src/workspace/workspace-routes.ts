import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { PoolClient } from 'pg';
import {
  authorizeWorkspaceUpdate, redactWorkspaceCustomers, requireWorkspaceIdentity,
  WorkspaceError, type WorkspaceIdentity,
} from './workspace-permissions.js';
import { WORKSPACE_BODY_LIMIT, workspaceEnvelopeSchema, workspaceUpdateSchema, type WorkspaceCustomer } from './workspace-schema.js';
import { lockRelationalWorkspace, readRelationalWorkspace, writeRelationalWorkspace } from './relational-workspace.js';

export type { WorkspaceIdentity } from './workspace-permissions.js';
export interface WorkspaceDependencies {
  resolveIdentity(headers: FastifyRequest['headers']): Promise<WorkspaceIdentity | null>;
  withOrganizationTransaction<T>(identity: WorkspaceIdentity, operation: (client: PoolClient) => Promise<T>): Promise<T>;
  workspaceKey: string;
  relational?: boolean;
}
type WorkspaceRow = { payload_ciphertext: string; version: number };
type WorkspaceSnapshot = { customers: WorkspaceCustomer[]; version: number };

async function decryptSnapshot(row: WorkspaceRow | undefined, identity: WorkspaceIdentity, key: string): Promise<WorkspaceSnapshot> {
  if (!row) return { customers: [], version: 0 };
  const plaintext = await symmetricDecrypt({ key, data: row.payload_ciphertext });
  if (Buffer.byteLength(plaintext, 'utf8') > WORKSPACE_BODY_LIMIT) throw new Error('Invalid stored workspace size');
  const envelope = workspaceEnvelopeSchema.parse(JSON.parse(plaintext));
  // Authenticated encryption binds data to the tenant and to its optimistic version.
  if (envelope.organizationId !== identity.organization.id || envelope.version !== row.version) throw new Error('Invalid stored workspace context');
  return { customers: envelope.customers, version: row.version };
}

function respondError(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply, error: unknown) {
  reply.header('Cache-Control', 'no-store');
  if (error instanceof WorkspaceError) return reply.code(error.statusCode).send({ code: error.code, message: error.message });
  if (error && typeof error === 'object' && 'code' in error) {
    if (error.code === '23505') return reply.code(409).send({ code: 'RECORD_CONFLICT', message: 'Ya existe un registro con esos identificadores. Revisa los datos antes de guardar.' });
    if (['23503','23514','22001','22003','22007','22008','22P02'].includes(String(error.code))) return reply.code(400).send({ code: 'INVALID_RELATED_RECORD', message: 'Revisa las relaciones, fechas y datos del cliente o contrato.' });
    if (error.code === '42501') return reply.code(403).send({ code: 'FORBIDDEN', message: 'No tienes permiso para modificar estos datos.' });
  }
  // Identity services may reject before returning an identity. Preserve only status,
  // never an exception message that could expose tokens, SQL or connection details.
  if (error && typeof error === 'object') {
    const status = 'statusCode' in error ? Number(error.statusCode) : 'status' in error ? Number(error.status) : 0;
    if ([401, 403].includes(status)) {
      const code = 'code' in error && ['MFA_REQUIRED', 'PASSWORD_CHANGE_REQUIRED'].includes(String(error.code)) ? String(error.code) : status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN';
      return reply.code(status).send({ code, message: status === 401 ? 'Inicia sesión para continuar.' : 'No tienes permiso para acceder a estos datos.' });
    }
  }
  server.log.error({ event: 'workspace_operation_failed', requestId: request.id }, 'No se pudo completar la operación de datos.');
  return reply.code(503).send({ code: 'WORKSPACE_UNAVAILABLE', message: 'No se pudieron cargar o guardar los datos. Inténtalo de nuevo.' });
}

/** Mounted inside the existing Fastify backend. Its global hook enforces trusted
 * origin/CSRF and resolves verified sessions; this handler rechecks account/MFA
 * state and roles. The body cannot choose its actor, organization or DB context.
 */
export function registerWorkspaceRoutes(server: FastifyInstance, deps: WorkspaceDependencies): void {
  if (typeof deps.workspaceKey !== 'string' || deps.workspaceKey.length < 32) throw new Error('A dedicated workspace encryption key is required');

  server.get('/erp/workspace', { logLevel: 'silent' }, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    try {
      const identity = await deps.resolveIdentity(request.headers);
      requireWorkspaceIdentity(identity);
      if (!identity.permissions.includes('clientes:read')) throw new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para consultar estos datos.');
      const snapshot = await deps.withOrganizationTransaction(identity, async (client) => {
        if (deps.relational) await lockRelationalWorkspace(client, identity);
        const result = await client.query<WorkspaceRow>('SELECT payload_ciphertext, version FROM erp.customer_workspaces WHERE organization_id = $1', [identity.organization.id]);
        const snapshot = await decryptSnapshot(result.rows[0], identity, deps.workspaceKey);
        if (deps.relational) snapshot.customers = await readRelationalWorkspace(client, identity, snapshot.customers);
        return snapshot;
      });
      return { customers: redactWorkspaceCustomers(snapshot.customers, identity), version: snapshot.version };
    } catch (error) { return respondError(server, request, reply, error); }
  });

  server.put('/erp/workspace', { bodyLimit: WORKSPACE_BODY_LIMIT, logLevel: 'silent' }, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    try {
      const identity = await deps.resolveIdentity(request.headers);
      requireWorkspaceIdentity(identity);
      if (identity.role === 'viewer' || !identity.permissions.includes('clientes:write')) throw new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para modificar estos datos.');
      if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) throw new WorkspaceError(415, 'JSON_REQUIRED', 'Envía los cambios en formato JSON.');
      const input = workspaceUpdateSchema.safeParse(request.body);
      if (!input.success) throw new WorkspaceError(400, 'INVALID_WORKSPACE', 'Revisa los datos, los identificadores y los límites admitidos.');
      const snapshot = await deps.withOrganizationTransaction(identity, async (client) => {
        if (deps.relational) await lockRelationalWorkspace(client, identity);
        const existing = await client.query<WorkspaceRow>('SELECT payload_ciphertext, version FROM erp.customer_workspaces WHERE organization_id = $1 FOR UPDATE', [identity.organization.id]);
        const previous = await decryptSnapshot(existing.rows[0], identity, deps.workspaceKey);
        if (deps.relational) previous.customers = await readRelationalWorkspace(client, identity, previous.customers);
        if (previous.version !== input.data.version) throw new WorkspaceError(409, 'WORKSPACE_CONFLICT', 'Otra sesión actualizó los datos. Recarga y revisa los cambios antes de guardar.');
        let customers = authorizeWorkspaceUpdate(previous.customers, input.data.customers, identity);
        if (deps.relational) customers = await writeRelationalWorkspace(client, identity, customers, previous.customers);
        const version = previous.version + 1;
        const envelope = JSON.stringify({ schemaVersion: 1, organizationId: identity.organization.id, version, customers });
        if (Buffer.byteLength(envelope, 'utf8') > WORKSPACE_BODY_LIMIT) throw new WorkspaceError(413, 'WORKSPACE_TOO_LARGE', 'Los datos superan el tamaño admitido.');
        const ciphertext = await symmetricEncrypt({ key: deps.workspaceKey, data: envelope });
        const updated = previous.version === 0
          ? await client.query('INSERT INTO erp.customer_workspaces (organization_id, payload_ciphertext, version) VALUES ($1, $2, $3) ON CONFLICT (organization_id) DO NOTHING RETURNING version', [identity.organization.id, ciphertext, version])
          : await client.query('UPDATE erp.customer_workspaces SET payload_ciphertext = $2, version = $3 WHERE organization_id = $1 AND version = $4 RETURNING version', [identity.organization.id, ciphertext, version, previous.version]);
        if (updated.rowCount !== 1) throw new WorkspaceError(409, 'WORKSPACE_CONFLICT', 'Otra sesión actualizó los datos. Recarga y revisa los cambios antes de guardar.');
        if (deps.relational) customers = await readRelationalWorkspace(client, identity, customers);
        return { customers: redactWorkspaceCustomers(customers, identity), version };
      });
      server.log.info({ event: 'workspace_saved', userId: identity.user.id, organizationId: identity.organization.id, version: snapshot.version, requestId: request.id }, 'Datos del ERP guardados.');
      return snapshot;
    } catch (error) { return respondError(server, request, reply, error); }
  });
}
