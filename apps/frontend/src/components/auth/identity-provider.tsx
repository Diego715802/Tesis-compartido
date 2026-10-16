"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Identity } from "@/lib/auth/config";
const IdentityContext = createContext<Identity | null>(null);
export function IdentityProvider({ identity, children }: { identity: Identity; children: React.ReactNode }) {
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    let active = true;
    const requests = new Set<AbortController>();
    async function validate() {
      if (document.hidden) return;
      const controller = new AbortController();
      requests.add(controller);
      const timeout = setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch("/api/identity", { cache: "no-store", credentials: "same-origin", signal: controller.signal });
        if (!active) return;
        if (response.status === 401 || response.status === 403) { setAvailable(false); window.location.replace("/login"); return; }
        if (!response.ok) { setAvailable(false); return; }
        const fresh = await response.json() as Identity;
        if (!active) return;
        if (fresh.mfaRequired || fresh.passwordChangeRequired) { setAvailable(false); window.location.replace("/seguridad"); return; }
        if (fresh.user.id !== identity.user.id || fresh.organization.id !== identity.organization.id || fresh.role !== identity.role || fresh.permissions.join() !== identity.permissions.join()) { setAvailable(false); window.location.reload(); return; }
        setAvailable(true);
      } catch { if (active) setAvailable(false); }
      finally { clearTimeout(timeout); requests.delete(controller); }
    }
    const interval = setInterval(validate, 60_000);
    const visibility = () => { if (!document.hidden) void validate(); };
    const page = (event: PageTransitionEvent) => { if (event.persisted) { setAvailable(false); void validate(); } };
    window.addEventListener("focus", visibility);
    window.addEventListener("pageshow", page);
    document.addEventListener("visibilitychange", visibility);
    return () => { active = false; clearInterval(interval); for (const controller of requests) controller.abort(); window.removeEventListener("focus", visibility); window.removeEventListener("pageshow", page); document.removeEventListener("visibilitychange", visibility); };
  }, [identity]);
  return <IdentityContext.Provider value={identity}>{available ? children : <main role="status" style={{ padding: 32, color: "#26343f", background: "#fff", minHeight: "100svh" }}>Verificando tu sesión. Si el servicio tarda, <button type="button" onClick={() => window.location.reload()}>vuelve a cargar el ERP</button>.</main>}</IdentityContext.Provider>;
}
export function useIdentity() {
  const identity = useContext(IdentityContext);
  if (!identity) throw new Error("La identidad del ERP no está disponible.");
  return identity;
}
