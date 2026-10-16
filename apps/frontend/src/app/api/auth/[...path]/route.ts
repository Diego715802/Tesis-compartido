import { bridge, safeJson } from "@/lib/auth/bridge";

export const dynamic = "force-dynamic";
const actions = new Set([
  "sign-in/email", "sign-out", "two-factor/verify-totp", "two-factor/verify-backup-code", "two-factor/enable", "two-factor/generate-backup-codes",
  "change-password", "request-password-reset", "reset-password",
]);
export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join("/");
  if (!actions.has(path) || new URL(request.url).search) return safeJson({ message: "Recurso no disponible." }, 404);
  return bridge(request, `/api/auth/${path}`, "POST");
}
