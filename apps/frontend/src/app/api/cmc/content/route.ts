import { bridge, safeJson } from "@/lib/auth/bridge";
import { identityFromHeaders } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
async function authorized(request: Request, write: boolean) {
  try {
    if (new URL(request.url).search) return safeJson({ message: "La solicitud no admite parámetros adicionales." }, 400);
    const { identity, status } = await identityFromHeaders(request.headers);
    if (!identity) return safeJson({ message: "Inicia sesión para administrar el sitio." }, status);
    if (identity.mfaRequired || identity.passwordChangeRequired || !["owner", "admin"].includes(identity.role)
      || !identity.permissions.includes(write ? "sitio-web:write" : "sitio-web:read")) {
      return safeJson({ message: "No tienes permiso para administrar este sitio." }, 403);
    }
    return bridge(request, "/cmc/content", write ? "PUT" : "GET", 300_000);
  } catch { return safeJson({ message: "No se pudo conectar con el sitio. Inténtalo de nuevo." }, 503); }
}
export async function GET(request: Request) { return authorized(request, false); }
export async function PUT(request: Request) { return authorized(request, true); }
