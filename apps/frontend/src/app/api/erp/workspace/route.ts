import { bridge, safeJson } from "@/lib/auth/bridge";
import { identityFromHeaders } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
async function authorized(request: Request, write: boolean) {
  try {
    const { identity, status } = await identityFromHeaders(request.headers);
    if (!identity) return safeJson({ message: "Inicia sesión para acceder a los datos." }, status);
    const permission = write ? "clientes:write" : "clientes:read";
    if (identity.mfaRequired || identity.passwordChangeRequired || !identity.permissions.includes(permission)) return safeJson({ message: "No tienes permiso para esta operación." }, 403);
    return bridge(request, "/erp/workspace", write ? "PUT" : "GET", 2 * 1024 * 1024);
  } catch { return safeJson({ message: "No se pudo acceder a los datos. Inténtalo de nuevo." }, 503); }
}
export async function GET(request: Request) { return authorized(request, false); }
export async function PUT(request: Request) { return authorized(request, true); }
