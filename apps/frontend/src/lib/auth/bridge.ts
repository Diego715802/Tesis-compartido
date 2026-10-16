import "server-only";
import { NextResponse } from "next/server";
import { backendConfig, backendHeaders, requestHostAllowed } from "./config";

export function safeJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "Pragma": "no-cache", "Referrer-Policy": "no-referrer" } });
}

export async function bridge(request: Request, path: string, method: "GET" | "POST" | "PUT", maxBytes = 16_384) {
  try {
    const { backend, origin } = backendConfig();
    if (!requestHostAllowed(request.headers)) return safeJson({ code: "HOST_REJECTED", message: "Dirección de acceso no permitida." }, 400);
    const headers = backendHeaders(request.headers);
    let body: string | undefined;
    if (method !== "GET") {
      if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") return safeJson({ code: "ORIGIN_REJECTED", message: "Solicitud de origen no permitido." }, 403);
      if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get("content-type") ?? "")) return safeJson({ message: "Envía una solicitud JSON." }, 415);
      const size = Number(request.headers.get("content-length") || 0);
      if (size > maxBytes) return safeJson({ message: "Solicitud demasiado grande." }, 413);
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      if (reader) {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          length += part.value.byteLength;
          if (length > maxBytes) { await reader.cancel(); return safeJson({ message: "Solicitud demasiado grande." }, 413); }
          chunks.push(part.value);
        }
      }
      const buffer = Buffer.concat(chunks);
      body = buffer.toString("utf8");
      try { const value = JSON.parse(body); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid body"); } catch { return safeJson({ message: "Solicitud inválida." }, 400); }
      headers.set("content-type", "application/json");
    }
    const response = await fetch(`${backend}${path}`, { method, body, headers, cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(25_000) });
    if (response.status >= 300 && response.status < 400) return safeJson({ message: "Redirección no permitida." }, 502);
    const data = await response.json().catch(() => ({ message: "No se pudo completar la solicitud." }));
    // Sessions are transmitted only in HttpOnly cookies, never in JSON.
    if (data && typeof data === "object") { delete data.token; delete data.session; delete data.sessionToken; }
    const result = safeJson(data, response.status);
    for (const cookie of response.headers.getSetCookie()) result.headers.append("set-cookie", cookie);
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter && /^\d{1,6}$/.test(retryAfter)) result.headers.set("retry-after", retryAfter);
    return result;
  } catch { return safeJson({ code: "AUTH_UNAVAILABLE", message: "El servicio de acceso no está disponible. Inténtalo de nuevo en unos minutos." }, 503); }
}
