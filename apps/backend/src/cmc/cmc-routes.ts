import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Identity } from '../security/runtime.js';
import type { CmcConnection } from './cmc-config.js';

const BODY_LIMIT = 300_000;
const update = z.object({ site: z.record(z.string(), z.unknown()), revision: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
const snapshot = z.object({ site: z.object({ settings: z.record(z.string(), z.unknown()), plans: z.array(z.unknown()), towers: z.array(z.unknown()), faqs: z.array(z.unknown()), source: z.literal('cometalink-web') }).passthrough(),
  revision: z.string().regex(/^[a-f0-9]{64}$/), publishedAt: z.string().optional(), environment: z.literal('local') }).strict();
export type CmcDependencies = { resolveIdentity(headers: FastifyRequest['headers']): Promise<Identity>;
  connection?: CmcConnection; origin: string; fetch?: typeof globalThis.fetch };

function denied(reply: FastifyReply, status: number, message: string, code = 'CMC_UNAVAILABLE') {
  return reply.code(status).send({ code, message });
}

export function registerCmcRoutes(server: FastifyInstance, deps: CmcDependencies) {
  const transport = deps.fetch ?? globalThis.fetch;
  async function handle(request: FastifyRequest, reply: FastifyReply, write: boolean) {
    reply.header('Cache-Control', 'private, no-store');
    try {
      const identity = await deps.resolveIdentity(request.headers);
      if (!identity) return denied(reply, 401, 'Inicia sesión para continuar.', 'UNAUTHORIZED');
      const permission = write ? 'sitio-web:write' : 'sitio-web:read';
      if (identity.mfaRequired || identity.passwordChangeRequired || !['owner', 'admin'].includes(identity.role) || !identity.permissions.includes(permission)) {
        return denied(reply, 403, 'No tienes permiso para administrar este sitio.', 'FORBIDDEN');
      }
      if (write && (request.headers.origin !== deps.origin || request.headers['sec-fetch-site'] === 'cross-site')) {
        return denied(reply, 403, 'La solicitud debe enviarse desde el ERP.', 'ORIGIN_REJECTED');
      }
      if (Object.keys(request.query as object ?? {}).length) return denied(reply, 400, 'La solicitud no admite parámetros adicionales.', 'INVALID_REQUEST');
      let changes: z.infer<typeof update> | undefined;
      if (write) {
        if (!request.headers['content-type']?.startsWith('application/json')) return denied(reply, 415, 'Envía los cambios como JSON.', 'JSON_REQUIRED');
        const input = update.safeParse(request.body);
        if (!input.success) return denied(reply, 400, 'Revisa el contenido y vuelve a cargar su versión antes de publicar.', 'INVALID_CONTENT');
        changes = input.data;
      }
      if (!deps.connection) return denied(reply, 503, 'La conexión del sitio está pendiente. Contacta al administrador.');
      const response = await transport(deps.connection.endpoint, { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${deps.connection.secret}` },
        body: JSON.stringify({ operation: write ? 'publish' : 'read', organizationId: identity.organization.id,
          actor: { id: identity.user.id, email: identity.user.email, name: identity.user.name, role: identity.role }, ...changes }),
        redirect: 'error', signal: AbortSignal.timeout(15_000) });
      const raw = await response.text();
      if (Buffer.byteLength(raw, 'utf8') > BODY_LIMIT) throw new Error('Invalid bridge response');
      const data: unknown = JSON.parse(raw);
      if (!response.ok) {
        if (response.status === 409) return denied(reply, 409, 'Otra sesión actualizó la página. Conservamos tus cambios; recarga el contenido y revísalos antes de publicar.', 'CONTENT_CONFLICT');
        if (response.status === 403) return denied(reply, 403, 'Este sitio no está vinculado a tu organización.', 'FORBIDDEN');
        if (response.status === 400 && data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
          return denied(reply, 400, data.message.slice(0, 500), 'INVALID_CONTENT');
        }
        throw new Error('CMC bridge unavailable');
      }
      const result = snapshot.parse(data);
      if (write) server.log.info({ event: 'cmc_content_published_local', userId: identity.user.id, organizationId: identity.organization.id, requestId: request.id }, 'Contenido local publicado.');
      return { ...result, publicUrl: deps.connection.publicUrl };
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
      if ([401, 403].includes(status)) return denied(reply, status, status === 401 ? 'Inicia sesión para continuar.' : 'No tienes permiso para acceder al sitio.', status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN');
      server.log.error({ event: 'cmc_bridge_unavailable', requestId: request.id }, 'La conexión con el sitio no está disponible.');
      return denied(reply, 503, 'No se pudo conectar con el sitio. Tus cambios no se publicaron; inténtalo de nuevo.');
    }
  }
  server.get('/cmc/content', { logLevel: 'silent' }, (request, reply) => handle(request, reply, false));
  server.put('/cmc/content', { bodyLimit: BODY_LIMIT, logLevel: 'silent' }, (request, reply) => handle(request, reply, true));
}
