import { bridge, safeJson } from '@/lib/auth/bridge';
import { identityFromHeaders } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
async function authorized(request: Request, write: boolean) {
  try {
    const { identity, status } = await identityFromHeaders(request.headers);
    if (!identity) return safeJson({ message: 'Inicia sesión para acceder a los planes.' }, status);
    if (identity.mfaRequired || identity.passwordChangeRequired || !identity.permissions.includes(write ? 'planes:write' : 'planes:read')) return safeJson({ message: 'No tienes permiso para esta operación.' }, 403);
    return bridge(request, '/erp/plans', write ? 'POST' : 'GET', 16_384);
  } catch { return safeJson({ message: 'No se pudo acceder al catálogo de planes.' }, 503); }
}
export async function GET(request: Request) { return authorized(request, false); }
export async function POST(request: Request) { return authorized(request, true); }
