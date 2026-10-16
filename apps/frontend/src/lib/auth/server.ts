import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { identityFromHeaders } from "./config";

// Fresh server validation: never trust browser state, a proxy flag, or cookie presence.
export async function requireIdentity(permission?: string, allowEnrollment = false) {
  let result;
  try { result = await identityFromHeaders(await headers()); }
  catch { redirect("/login"); }
  if (!result.identity) redirect("/login");
  const identity = result.identity;
  if ((identity.mfaRequired || identity.passwordChangeRequired) && !allowEnrollment) redirect("/seguridad");
  if (permission && !identity.permissions.includes(permission)) redirect("/sin-permiso");
  return identity;
}
