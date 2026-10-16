"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useIdentity } from "@/components/auth/identity-provider";
import { CmcPublicThemeEditor } from "./vendor/CmcPublicThemeEditor";
import { ContentEditor } from "./vendor/ContentEditor";
import type { SiteResponse } from "./vendor/shared/site";
import { sanitizePublicTheme } from "./vendor/shared/public-theme.mjs";
import "./sitio-web.css";
import "./vendor/palette.css";

type PublishedSite = { site: SiteResponse; revision: string; environment: "local"; publicUrl: string };
type DialogAction = "publish" | "reload" | { leave: string } | null;
type ContentFailure = { stage: "load" | "publish"; status: number } | null;

class ContentError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function requestContent(init?: RequestInit): Promise<PublishedSite> {
  let response: Response;
  try {
    response = await fetch("/api/cmc/content", {
      credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(20_000),
      ...init, headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch { throw new ContentError(503, "No se pudo conectar con el contenido. Reintenta cuando el servicio esté disponible."); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "Hay datos que el sitio no puede publicar. Revisa identificadores, direcciones, colores y campos antes de reintentar.",
      401: "Tu sesión ha terminado. Vuelve a iniciar sesión para continuar.",
      403: "Tu cuenta no tiene permiso para realizar esta acción.",
      409: "Otra persona publicó cambios después de que abriste el editor. Tu borrador se conserva; recarga el contenido publicado para evitar sobrescribirlo.",
      413: "El contenido supera el tamaño permitido. Reduce los textos antes de reintentar.",
      429: "Hay demasiadas solicitudes recientes. Espera un momento antes de reintentar.",
    };
    const message = response.status === 400 && typeof result.message === "string" ? result.message.slice(0, 500) : messages[response.status];
    throw new ContentError(response.status, message || "No se pudo completar la operación. Tu borrador se conserva; vuelve a intentarlo.");
  }
  if (!result.site?.settings?.company || !Array.isArray(result.site.plans) || typeof result.revision !== "string" || !/^[a-f0-9]{64}$/.test(result.revision) || result.environment !== "local") {
    throw new ContentError(503, "El servicio devolvió un contenido incompleto. Vuelve a cargarlo antes de editar.");
  }
  const url = new URL(result.publicUrl);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) {
    throw new ContentError(503, "La dirección del sitio local requiere configuración del administrador.");
  }
  return result as PublishedSite;
}

export function SitioWebModule() {
  const identity = useIdentity();
  const canWrite = identity.permissions.includes("sitio-web:write");
  const [published, setPublished] = useState<PublishedSite | null>(null);
  const [draft, setDraft] = useState<SiteResponse | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState<ContentFailure>(null);
  const [success, setSuccess] = useState("");
  const [conflict, setConflict] = useState(false);
  const [dialog, setDialog] = useState<DialogAction>(null);
  const dirty = Boolean(draft && published && JSON.stringify(draft) !== JSON.stringify(published.site));
  const leaving = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const next = await requestContent({ signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000) });
      if (signal?.aborted) return;
      setPublished(next); setDraft(structuredClone(next.site)); setConflict(false); setSuccess(""); setFailure(null);
    } catch (error) {
      if (!signal?.aborted) {
        setMessage(error instanceof Error ? error.message : "No se pudo cargar el sitio. Vuelve a intentarlo.");
        setFailure({ stage: "load", status: error instanceof ContentError ? error.status : 503 });
      }
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void requestContent({ signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]) })
      .then(next => { if (!controller.signal.aborted) { setPublished(next); setDraft(structuredClone(next.site)); } })
      .catch(error => { if (!controller.signal.aborted) { setMessage(error instanceof Error ? error.message : "No se pudo cargar el sitio. Vuelve a intentarlo."); setFailure({ stage: "load", status: error instanceof ContentError ? error.status : 503 }); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { if (!leaving.current) { event.preventDefault(); event.returnValue = ""; } };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") as HTMLAnchorElement | null : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      event.preventDefault(); event.stopPropagation(); setDialog({ leave: url.href });
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); };
  }, [dirty]);

  const mutateSite = useCallback((change: (next: SiteResponse) => void) => {
    if (!canWrite || busy) return;
    setDraft(current => { if (!current) return current; const next = structuredClone(current); change(next); return next; });
    setSuccess("");
  }, [canWrite, busy]);

  function askToPublish() {
    if (!draft || !dirty || !canWrite || busy || conflict) return;
    try { sanitizePublicTheme(draft.settings.theme); setMessage(""); setFailure(null); setDialog("publish"); }
    catch (error) { setFailure({ stage: "publish", status: 400 }); setMessage(error instanceof Error ? error.message : "Revisa la paleta antes de publicar."); }
  }
  async function publish() {
    if (!draft || !published || busy || !canWrite) return;
    setDialog(null); setBusy(true); setMessage(""); setSuccess(""); setFailure(null);
    try {
      const next = await requestContent({ method: "PUT", body: JSON.stringify({ site: draft, revision: published.revision }) });
      setPublished(next); setDraft(structuredClone(next.site)); setConflict(false);
      setSuccess("Los cambios están publicados en el sitio local. Puedes abrirlo para comprobar el resultado.");
    } catch (error) {
      setConflict(error instanceof ContentError && error.status === 409);
      setFailure({ stage: "publish", status: error instanceof ContentError ? error.status : 503 });
      setMessage(error instanceof Error ? error.message : "No se pudo publicar. Tu borrador se conserva.");
    } finally { setBusy(false); }
  }
  function startReload() { setLoading(true); setMessage(""); setFailure(null); void load(); }
  function reload() { if (dirty) setDialog("reload"); else startReload(); }
  function confirm() {
    const action = dialog; setDialog(null);
    if (action === "publish") void publish();
    else if (action === "reload") startReload();
    else if (action && typeof action === "object") { leaving.current = true; window.location.assign(action.leave); }
  }
  const recoveryAction = failure && [401, 403].includes(failure.status)
    ? <Button color="inherit" component="a" href="/login">Revisar acceso</Button>
    : failure?.stage === "publish" && (failure.status >= 500 || failure.status === 429)
      ? <Button color="inherit" onClick={askToPublish} disabled={loading || busy || conflict}>Reintentar publicación</Button>
      : failure?.status === 409 || failure?.stage === "load"
        ? <Button color="inherit" onClick={reload} disabled={loading || busy}>{conflict ? "Recargar contenido" : "Reintentar carga"}</Button>
        : undefined;

  return <Box className="erp-cmc" sx={{ p: { xs: 2, md: "30px 20px 40px" }, minWidth: 0 }}>
    <header className="cmc-module-heading">
      <div><Typography component="h1" sx={{ fontSize: 24, fontWeight: 400, color: "#4B4E51" }}>Sitio web y contenido (CMC)</Typography><Typography sx={{ mt: 1, color: "#526578", fontSize: 13, maxWidth: "70ch" }}>Administra el contenido público de CometaLink desde ComeCore.</Typography></div>
      <div className="cmc-module-links">
        {published && <Button component="a" href={published.publicUrl} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon/>}>Ver sitio local</Button>}
        <Button component="a" href="https://cometalink.net/admin" target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon/>}>CMC original</Button>
      </div>
    </header>
    <Alert severity="info" sx={{ mb: 2, color: "#214D66", backgroundColor: "#EEF8FB" }}>
      <strong>Entorno local.</strong> La publicación actualiza únicamente la copia local. <a href="https://cometalink.net/" target="_blank" rel="noopener noreferrer">cometalink.net</a> mantiene su publicación independiente. La contestadora, servicios, usuarios y analítica se consultan en el CMC original.
    </Alert>
    {!canWrite && <Alert severity="info" sx={{ mb: 2 }}>Tu cuenta permite consultar el contenido. Se necesita permiso de edición para publicar cambios.</Alert>}
    {message && <Alert severity="error" sx={{ mb: 2 }} action={recoveryAction}>{message}</Alert>}
    {success && <Alert severity="success" sx={{ mb: 2 }} closeText="Cerrar aviso" onClose={() => setSuccess("")}>{success}</Alert>}
    {loading && <Box role="status" sx={{ p: 4, display: "flex", alignItems: "center", gap: 2 }}><CircularProgress size={24}/><span>Cargando contenido publicado…</span></Box>}
    {draft && published && <>
      <div className="cmc-workbar">
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} aria-label="Editor del sitio" sx={{ minHeight: 44 }}>
          <Tab label="Contenido" id="cmc-tab-content" aria-controls="cmc-panel-content"/>
          <Tab label="Apariencia" id="cmc-tab-appearance" aria-controls="cmc-panel-appearance"/>
        </Tabs>
        <div className="cmc-workbar-actions"><span role="status">{busy ? "Publicando…" : dirty ? "Borrador sin publicar" : "Contenido publicado"}</span><Button startIcon={<RefreshIcon/>} onClick={reload} disabled={loading || busy}>{dirty ? "Descartar y recargar" : "Recargar"}</Button>{canWrite && <Button variant="contained" onClick={askToPublish} disabled={!dirty || loading || busy || conflict}>{busy ? "Publicando…" : "Publicar en sitio local"}</Button>}</div>
      </div>
      <section role="tabpanel" id="cmc-panel-content" aria-labelledby="cmc-tab-content" hidden={tab !== 0} aria-busy={busy || loading}>
        <ContentEditor site={draft} mutateSite={mutateSite} canWrite={canWrite} busy={busy || loading}/>
        <section className="cmc-content-footer" aria-label="Publicación del contenido">
          <div><strong>{busy ? "Publicando…" : dirty ? "Borrador sin publicar" : "Contenido publicado"}</strong><p>Los cambios se publican en la copia local de CometaLink.</p></div>
          {canWrite && <Button variant="contained" onClick={askToPublish} disabled={!dirty || loading || busy || conflict}>{busy ? "Publicando…" : "Publicar contenido en sitio local"}</Button>}
        </section>
      </section>
      <section role="tabpanel" id="cmc-panel-appearance" aria-labelledby="cmc-tab-appearance" hidden={tab !== 1} aria-busy={busy || loading}>
        <CmcPublicThemeEditor site={draft} mutateSite={mutateSite} canWrite={canWrite} busy={busy || loading} publishDisabled={!dirty || conflict} onPublish={askToPublish} publicUrl={published.publicUrl}/>
      </section>
    </>}
    <Dialog open={dialog !== null} onClose={() => setDialog(null)} aria-labelledby="cmc-confirm-title" aria-describedby="cmc-confirm-description">
      <DialogTitle id="cmc-confirm-title">{dialog === "publish" ? "Publicar en el sitio local" : "Descartar el borrador"}</DialogTitle>
      <DialogContent><DialogContentText id="cmc-confirm-description">{dialog === "publish" ? "El contenido y la apariencia de esta copia local quedarán visibles al guardar. El sitio cometalink.net conserva su publicación independiente." : "Los cambios sin publicar se perderán. Puedes cancelar para continuar editando."}</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setDialog(null)} autoFocus>Cancelar</Button><Button variant="contained" onClick={confirm}>{dialog === "publish" ? "Publicar en sitio local" : "Descartar cambios"}</Button></DialogActions>
    </Dialog>
  </Box>;
}
