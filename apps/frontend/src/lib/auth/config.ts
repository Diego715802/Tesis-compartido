export type Identity = {
  user: { id: string; email: string; name: string };
  organization: { id: string; name: string };
  role: string;
  permissions: string[];
  mfaRequired: boolean;
  passwordChangeRequired: boolean;
};

export function permissionForPath(path: string): string | undefined {
  if (path === "/") return "dashboard:read";
  const segment = path.split("/")[1];
  if (segment === "sitio-web") return "sitio-web:read";
  if (segment === "servidores" || segment === "nodos") return "red:read";
  if (["clientes", "contratos", "planes", "facturacion", "inventario"].includes(segment)) return `${segment}:read`;
}

export function backendConfig() {
  const origin = process.env.AUTH_PUBLIC_ORIGIN;
  const backend = process.env.COMECORE_BACKEND_URL;
  const gateway = process.env.AUTH_GATEWAY_SECRET;
  if (!origin || !backend || !gateway) throw new Error("Autenticación sin configurar.");
  const publicUrl = new URL(origin);
  const backendUrl = new URL(backend);
  if (publicUrl.origin !== origin || publicUrl.username || publicUrl.password || !["http:", "https:"].includes(publicUrl.protocol)) throw new Error("Origen de autenticación inválido.");
  if (!["http:", "https:"].includes(backendUrl.protocol) || backendUrl.username || backendUrl.password) throw new Error("Backend de autenticación inválido.");
  if (process.env.NODE_ENV === "production" && publicUrl.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(publicUrl.hostname)) throw new Error("HTTPS es obligatorio.");
  return { origin, backend: backendUrl.origin, gateway };
}

export function requestHostAllowed(source: Headers) {
  const { origin } = backendConfig();
  const host = source.get("host");
  return Boolean(host && host.toLowerCase() === new URL(origin).host.toLowerCase());
}

export function backendHeaders(source: Headers) {
  const { gateway } = backendConfig();
  const headers = new Headers({ "x-comecore-gateway": gateway });
  const cookie = source.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const origin = source.get("origin");
  if (origin) headers.set("origin", origin);
  // Forward a client IP only behind an ingress that strips user-supplied headers.
  if (process.env.AUTH_TRUST_PROXY_HEADER === "x-real-ip") {
    const ip = source.get("x-real-ip");
    if (ip && /^[\da-fA-F:.]{3,45}$/.test(ip)) headers.set("x-real-ip", ip);
  }
  return headers;
}

export async function identityFromHeaders(source: Headers): Promise<{ status: number; identity?: Identity }> {
  const { backend } = backendConfig();
  if (!requestHostAllowed(source)) return { status: 400 };
  const response = await fetch(`${backend}/auth/context`, { headers: backendHeaders(source), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return { status: response.status };
  const body = await response.json();
  if (!body.user?.id || !body.organization?.id || !Array.isArray(body.permissions) || typeof body.mfaRequired !== "boolean") return { status: 503 };
  return { status: 200, identity: {
    user: { id: String(body.user.id), email: String(body.user.email), name: String(body.user.name) },
    organization: { id: String(body.organization.id), name: String(body.organization.name) },
    role: String(body.role), permissions: body.permissions.filter((p: unknown) => typeof p === "string"), mfaRequired: body.mfaRequired, passwordChangeRequired: body.passwordChangeRequired === true,
  } };
}
