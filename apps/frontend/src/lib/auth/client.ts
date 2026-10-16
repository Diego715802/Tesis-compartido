"use client";
import type { Identity } from "./config";

export class AccessError extends Error {
  constructor(public status: number, public code: string) { super("No se pudo completar la operación."); }
}
export async function authPost<T = Record<string, unknown>>(path: string, body: Record<string, unknown>): Promise<T> {
  let response;
  try { response = await fetch(path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(30_000) }); }
  catch { throw new AccessError(503, "AUTH_UNAVAILABLE"); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AccessError(response.status, typeof data.code === "string" ? data.code : "REQUEST_FAILED");
  return data as T;
}
export function accessMessage(error: unknown, fallback: string) {
  if (!(error instanceof AccessError)) return fallback;
  if (error.status === 429) return "Hay demasiados intentos recientes. Espera unos minutos antes de volver a intentarlo.";
  if (error.status === 503) return "Este servicio no está disponible ahora. Inténtalo en unos minutos o contacta al administrador.";
  if (error.code === "PASSWORD_COMPROMISED") return "Esta contraseña aparece en filtraciones conocidas. Elige otra contraseña única.";
  if (error.code === "PASSWORD_CHECK_UNAVAILABLE") return "No se pudo comprobar la seguridad de la contraseña. Inténtalo de nuevo en unos minutos.";
  if (error.code === "REAUTHENTICATION_REQUIRED") return "Confirma de nuevo tu contraseña y tu código de autenticación para realizar este cambio.";
  return fallback;
}
export async function currentIdentity(): Promise<Identity> {
  const response = await fetch("/api/identity", { cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new AccessError(response.status, "IDENTITY_UNAVAILABLE");
  return response.json();
}
export async function enterErp() {
  const identity = await currentIdentity();
  window.location.replace((identity.mfaRequired || identity.passwordChangeRequired) ? "/seguridad" : "/");
}
