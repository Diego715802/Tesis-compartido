import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { backendConfig, identityFromHeaders, permissionForPath, requestHostAllowed } from "@/lib/auth/config";

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(18).toString("base64");
  const development = process.env.NODE_ENV === "development";
  // Maps also appear in dialogs reached through client-side navigation. Keep one
  // document policy, with Google limited to frames, tiles, fonts and API traffic.
  // Scripts still require the per-response nonce; no script host allowlist.
  const csp = ["default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`, "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com", "font-src 'self' https://fonts.gstatic.com", `connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://*.google.com${development ? " ws: wss:" : ""}`, "frame-src https://www.google.com https://maps.google.com", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"].join("; ");
  const deny = (message: string, status: number) => new NextResponse(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Security-Policy": csp, "Cache-Control": "private, no-store" } });
  try {
    if (!requestHostAllowed(request.headers)) return deny("Dirección de acceso no permitida.", 400);
  } catch { return deny("El servicio de acceso no está configurado. Contacta al administrador.", 503); }
  const forwarded = new Headers(request.headers);
  forwarded.set("x-nonce", nonce);
  forwarded.set("content-security-policy", csp);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const path = request.nextUrl.pathname;
  const publicPage = ["/login", "/recuperar", "/restablecer", "/verificar-correo"].includes(path);
  if (!path.startsWith("/api/") && !publicPage) {
    try {
      const { origin } = backendConfig();
      const result = await identityFromHeaders(request.headers);
      if (!result.identity) response = NextResponse.redirect(new URL("/login", origin));
      else if ((result.identity.mfaRequired || result.identity.passwordChangeRequired) && path !== "/seguridad") response = NextResponse.redirect(new URL("/seguridad", origin));
      else {
        const permission = permissionForPath(path);
        if (permission && !result.identity.permissions.includes(permission)) response = NextResponse.redirect(new URL("/sin-permiso", origin));
      }
    } catch {
      response = new NextResponse("El servicio de acceso no está disponible. Inténtalo de nuevo en unos minutos.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
  }
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico).*)"] };
