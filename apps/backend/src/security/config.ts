import { z } from 'zod';
import nodemailer from 'nodemailer';

export type SecurityConfig = {
  origin: string; deployment: 'local' | 'public'; secret: string; gateway: string;
  authDatabaseUrl: string; databaseUrl: string; workspaceKey: string;
  trustClientIp: boolean; mail?: { send(to: string, subject: string, text: string): Promise<void> };
  mikrotikEnabled?: boolean; mikrotikOrganizationId?: string;
};

export function securityConfig(env = process.env): SecurityConfig {
  const source = z.object({
    AUTH_PUBLIC_ORIGIN: z.url(), AUTH_DEPLOYMENT: z.enum(['local', 'public']).default('public'),
    BETTER_AUTH_SECRET: z.string().min(43), AUTH_GATEWAY_SECRET: z.string().min(43),
    AUTH_DATABASE_URL: z.string().startsWith('postgresql://'), DATABASE_URL: z.string().startsWith('postgresql://'),
    WORKSPACE_ENCRYPTION_KEY: z.string().min(43), AUTH_TRUST_PROXY_HEADER: z.enum(['x-real-ip']).optional(),
    SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: z.string().optional(), SMTP_PASSWORD: z.string().optional(), SMTP_FROM: z.email().optional(),
    MIKROTIK_ORGANIZATION_ID: z.uuid().optional(), MIKROTIK_SSH_HOST_HASH: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
  }).safeParse(env);
  if (!source.success) throw new Error('Falta configurar autenticación; revisar security/.env.example. No se inicia un ERP sin protección.');
  const v = source.data; const origin = new URL(v.AUTH_PUBLIC_ORIGIN);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  if (origin.origin !== v.AUTH_PUBLIC_ORIGIN || origin.username || origin.password) throw new Error('Origen público inválido.');
  if (v.AUTH_DEPLOYMENT === 'local' && (!loopback || origin.protocol !== 'http:')) throw new Error('El modo local exige HTTP y loopback.');
  if (v.AUTH_DEPLOYMENT === 'public' && origin.protocol !== 'https:') throw new Error('HTTPS es obligatorio para publicar.');
  if (v.AUTH_DEPLOYMENT === 'public' && (!v.SMTP_HOST || !v.SMTP_USER || !v.SMTP_PASSWORD || !v.SMTP_FROM)) throw new Error('Configurar correo SMTP antes de publicar.');
  if (v.AUTH_DEPLOYMENT === 'public' && v.AUTH_TRUST_PROXY_HEADER !== 'x-real-ip') throw new Error('Configurar un ingreso que elimine cabeceras IP del cliente y aporte x-real-ip antes de publicar.');
  if (v.AUTH_DEPLOYMENT === 'public') {
    for (const value of [v.DATABASE_URL, v.AUTH_DATABASE_URL]) {
      if (new URL(value).searchParams.get('sslmode') !== 'verify-full') throw new Error('PostgreSQL público requiere TLS verify-full y certificado de confianza.');
    }
  }
  const mikrotikEnabled = Boolean(env.MIKROTIK_HOST?.trim());
  if (mikrotikEnabled && (!v.MIKROTIK_ORGANIZATION_ID || !v.MIKROTIK_SSH_HOST_HASH)) throw new Error('El MikroTik requiere organización propietaria y huella SSH verificada antes de conectar.');
  let mail: SecurityConfig['mail'];
  if (v.SMTP_HOST && v.SMTP_FROM) {
    const transport = nodemailer.createTransport({ host: v.SMTP_HOST, port: v.SMTP_PORT,
      secure: v.SMTP_PORT === 465, requireTLS: true, tls: { rejectUnauthorized: true },
      connectionTimeout: 8000, socketTimeout: 10000,
      auth: v.SMTP_USER && v.SMTP_PASSWORD ? { user: v.SMTP_USER, pass: v.SMTP_PASSWORD } : undefined,
      logger: false, debug: false,
    });
    mail = { async send(to, subject, text) { await transport.sendMail({ from: v.SMTP_FROM, to, subject, text }); } };
  }
  return { origin: origin.origin, deployment: v.AUTH_DEPLOYMENT, secret: v.BETTER_AUTH_SECRET,
    gateway: v.AUTH_GATEWAY_SECRET, authDatabaseUrl: v.AUTH_DATABASE_URL, databaseUrl: v.DATABASE_URL,
    workspaceKey: v.WORKSPACE_ENCRYPTION_KEY, trustClientIp: v.AUTH_TRUST_PROXY_HEADER === 'x-real-ip', mail,
    mikrotikEnabled, mikrotikOrganizationId: v.MIKROTIK_ORGANIZATION_ID };
}
