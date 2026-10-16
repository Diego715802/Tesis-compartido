import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import type { WorkspaceDependencies } from './workspace-routes.js';
import { requireWorkspaceIdentity, WorkspaceError } from './workspace-permissions.js';

const speed = z.number().int().min(0).max(1_000_000_000);
export const planInput = z.strictObject({
  name: z.string().trim().min(1).max(160), price: z.number().finite().min(0).max(999_999_999_999.99).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < .01),
  uploadKbps: speed, downloadKbps: speed, visible: z.boolean(), burstEnabled: z.boolean(),
  mikrotikStrategy: z.enum(['simple_queue','queue_tree','ppp_profile','none','pcq_queue_tree','pcq_simple_queue','cake_simple_queue']),
  productCodes: z.strictObject({ service: z.string().trim().max(120), interest_first: z.string().trim().max(120), interest_second: z.string().trim().max(120), reconnection: z.string().trim().max(120), installation: z.string().trim().max(120) }),
});

export function registerPlanRoutes(server: FastifyInstance, deps: WorkspaceDependencies) {
  server.get('/erp/plans', { logLevel: 'silent' }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    try {
      const identity = await deps.resolveIdentity(req.headers); requireWorkspaceIdentity(identity);
      if (!identity.permissions.includes('planes:read')) throw new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para consultar planes.');
      return await deps.withOrganizationTransaction(identity, async client => {
        const result = await client.query(`SELECT p.id,p.name,p.upload_kbps::float8 AS "uploadKbps",p.download_kbps::float8 AS "downloadKbps",p.price::float8 AS price,p.visible,p.burst_enabled AS "burstEnabled",p.mikrotik_strategy AS "mikrotikStrategy",p.frequency,p.version,
          (SELECT count(*)::int FROM service.contracts c WHERE c.organization_id=p.organization_id AND c.plan_id=p.id AND c.deleted_at IS NULL) AS contracts,
          (SELECT count(*)::int FROM service.contracts c WHERE c.organization_id=p.organization_id AND c.plan_id=p.id AND c.deleted_at IS NULL AND c.status='suspended') AS suspended,
          COALESCE((SELECT jsonb_object_agg(pc.charge_kind,pc.product_code) FROM catalog.plan_product_codes pc WHERE pc.organization_id=p.organization_id AND pc.plan_id=p.id AND pc.deleted_at IS NULL),'{}'::jsonb) AS "productCodes"
          FROM catalog.service_plans p WHERE p.organization_id=$1 AND p.deleted_at IS NULL AND p.status='active' ORDER BY p.name,p.id`, [identity.organization.id]);
        return { plans: result.rows };
      });
    } catch (error) {
      if (error instanceof WorkspaceError) return reply.code(error.statusCode).send({ code: error.code, message: error.message });
      return reply.code(503).send({ message: 'No se pudieron cargar los planes.' });
    }
  });
  server.post('/erp/plans', { logLevel: 'silent', bodyLimit: 16_384 }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    try {
      const identity = await deps.resolveIdentity(req.headers); requireWorkspaceIdentity(identity);
      if (!['owner','admin'].includes(identity.role) || !identity.permissions.includes('planes:write')) throw new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para crear planes.');
      const parsed = planInput.safeParse(req.body);
      if (!parsed.success) throw new WorkspaceError(400, 'INVALID_PLAN', 'Revisa nombre, precio, velocidades y códigos del plan.');
      const plan = parsed.data;
      const result = await deps.withOrganizationTransaction(identity, async client => {
        const inserted = await client.query(`INSERT INTO catalog.service_plans (organization_id,name,price,upload_kbps,download_kbps,visible,burst_enabled,mikrotik_strategy)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,version`, [identity.organization.id,plan.name,plan.price,plan.uploadKbps,plan.downloadKbps,plan.visible,plan.burstEnabled,plan.mikrotikStrategy]);
        const saved = inserted.rows[0] as { id: string; version: number };
        for (const [kind,code] of Object.entries(plan.productCodes)) if (code) {
          await client.query('INSERT INTO catalog.plan_product_codes(organization_id,plan_id,charge_kind,product_code) VALUES($1,$2,$3,$4)', [identity.organization.id,saved.id,kind,code]);
        }
        return saved;
      });
      return reply.code(201).send(result);
    } catch (error) {
      if (error instanceof WorkspaceError) return reply.code(error.statusCode).send({ code: error.code, message: error.message });
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') return reply.code(409).send({ code: 'PLAN_CONFLICT', message: 'Ya existe un plan con ese nombre. Recarga el catálogo.' });
      return reply.code(503).send({ message: 'No se pudo guardar el plan. No se confirmó ningún cambio.' });
    }
  });
}
