import { bridge, safeJson } from "@/lib/auth/bridge";

export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!["reauthenticate", "logout-all", "complete-bootstrap", "verify-email"].includes(action) || new URL(request.url).search) return safeJson({ message: "Recurso no disponible." }, 404);
  return bridge(request, `/auth/${action}`, "POST");
}
