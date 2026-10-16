import { bridge, safeJson } from "@/lib/auth/bridge";
import { identityFromHeaders } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { identity, status } = await identityFromHeaders(request.headers);
    if (!identity) return safeJson({ message: "Inicia sesión para consultar la red." }, status);
    if (identity.mfaRequired || identity.passwordChangeRequired || !identity.permissions.includes("red:read")) return safeJson({ message: "No tienes permiso para consultar la red." }, 403);
    return bridge(request, "/mikrotik/telemetry", "GET");
  } catch { return safeJson({ message: "El servicio de red no está disponible." }, 503); }
}
