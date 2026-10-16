import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import 'dotenv/config';
import helmet from '@fastify/helmet';
import { securityConfig } from './security/config.js';
import { createSecurityRuntime } from './security/runtime.js';
import { registerWorkspaceRoutes } from './workspace/workspace-routes.js';
import { registerPlanRoutes } from './workspace/plan-routes.js';
import { fromNodeHeaders } from 'better-auth/node';
import { cmcConnection } from './cmc/cmc-config.js';
import { registerCmcRoutes } from './cmc/cmc-routes.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 2 * 1024 * 1024, trustProxy: false }),
  );
  const config = securityConfig();
  const security = createSecurityRuntime(config);
  const server = app.getHttpAdapter().getInstance();
  await server.register(helmet, { contentSecurityPolicy: false,
    hsts: config.deployment === 'public' ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'no-referrer' }, frameguard: { action: 'deny' } });
  await security.register(server);
  registerWorkspaceRoutes(server, { resolveIdentity: incoming => security.resolveIdentity(fromNodeHeaders(incoming)),
    withOrganizationTransaction: security.withOrganizationTransaction, workspaceKey: config.workspaceKey, relational: true });
  registerPlanRoutes(server, { resolveIdentity: incoming => security.resolveIdentity(fromNodeHeaders(incoming)),
    withOrganizationTransaction: security.withOrganizationTransaction, workspaceKey: config.workspaceKey });
  registerCmcRoutes(server, { resolveIdentity: incoming => security.resolveIdentity(fromNodeHeaders(incoming)),
    origin: config.origin, connection: cmcConnection() });
  server.addHook('onClose', async () => { await security.close(); });
  // API privada. Solo el BFF recibe tráfico público y aporta el secreto de gateway.
  await app.listen(process.env.PORT ?? 3001, '127.0.0.1');
}
await bootstrap();
