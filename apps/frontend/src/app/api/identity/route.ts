import { safeJson } from "@/lib/auth/bridge";
import { identityFromHeaders } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const result = await identityFromHeaders(request.headers);
    return safeJson(result.identity ?? { message: "No hay acceso disponible para esta sesión." }, result.status);
  } catch { return safeJson({ message: "El servicio de acceso no está disponible." }, 503); }
}
