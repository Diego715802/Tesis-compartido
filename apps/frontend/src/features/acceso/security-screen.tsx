"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Brand } from "@/components/brand/brand";
import type { Identity } from "@/lib/auth/config";
import { accessMessage, authPost, currentIdentity } from "@/lib/auth/client";
import styles from "./security-screen.module.css";

type Enrollment = { totpURI: string; backupCodes: string[] };
export function SecurityScreen({ identity }: { identity: Identity }) {
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const passwordChangeRequired = identity.passwordChangeRequired;
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [mfaReady, setMfaReady] = useState(!identity.mfaRequired);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<"password" | "backup" | null>(null);

  async function run(task: () => Promise<void>, fallback: string) {
    if (busy) return;
    setBusy(true); setMessage("");
    try { await task(); } catch (error) { setMessage(accessMessage(error, fallback)); }
    finally { setBusy(false); }
  }
  async function completeBootstrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword.length < 15 || newPassword.length > 128 || newPassword !== data.get("confirmation")) { setMessage("Usa de 15 a 128 caracteres y confirma la misma contraseña nueva."); return; }
    await run(async () => {
      await authPost("/api/security/complete-bootstrap", { currentPassword, newPassword });
      form.reset(); setBootstrapDone(true);
      setMessage("Tu contraseña se actualizó y la sesión temporal se cerró. Inicia sesión con tu nueva contraseña para configurar la verificación en dos pasos.");
    }, "No se pudo actualizar la contraseña. Comprueba tu contraseña actual y elige una contraseña nueva y única.");
  }
  async function enable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    await run(async () => {
      const result = await authPost<Enrollment>("/api/auth/two-factor/enable", { password, method: "totp" });
      if (!result.totpURI?.startsWith("otpauth://totp/") || !Array.isArray(result.backupCodes)) throw new Error("Respuesta inválida.");
      form.reset(); setEnrollment(result);
    }, "No se pudo activar la verificación. Revisa tu contraseña e inténtalo de nuevo.");
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "").trim();
    await run(async () => {
      await authPost("/api/auth/two-factor/verify-totp", { code, trustDevice: false });
      const context = await currentIdentity();
      if (context.mfaRequired) throw new Error("Activación incompleta.");
      form.reset(); setCodes(enrollment?.backupCodes ?? null); setEnrollment(null); setMfaReady(true); setSaved(false);
      setMessage("Tu verificación en dos pasos está activa. Guarda tus códigos de recuperación antes de continuar.");
    }, "No pudimos verificar el código. Comprueba el código actual de tu aplicación.");
  }
  async function sensitive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("currentPassword") ?? "");
    const code = String(data.get("code") ?? "").trim();
    const next = String(data.get("newPassword") ?? "");
    if (action === "password" && (next.length < 15 || next.length > 128 || next !== data.get("confirmation"))) { setMessage("Usa de 15 a 128 caracteres y confirma la misma contraseña nueva."); return; }
    await run(async () => {
      await authPost("/api/security/reauthenticate", { password, code });
      if (action === "password") {
        await authPost("/api/auth/change-password", { currentPassword: password, newPassword: next, revokeOtherSessions: true });
        form.reset(); setAction(null); window.location.replace("/login");
      } else {
        const result = await authPost<{ backupCodes: string[] }>("/api/auth/two-factor/generate-backup-codes", { password });
        form.reset(); setCodes(result.backupCodes); setSaved(false); setAction(null); setMessage("Se crearon nuevos códigos. Los códigos de recuperación anteriores dejaron de ser válidos.");
      }
    }, "No se pudo confirmar tu identidad o realizar el cambio. Revisa la contraseña y espera un código nuevo de tu aplicación; un código utilizado recientemente no se puede repetir.");
  }
  function downloadCodes() {
    if (!codes) return;
    const url = URL.createObjectURL(new Blob([`ComeCore — Códigos de recuperación\nGuárdalos en un lugar privado. Cada código funciona una sola vez.\n\n${codes.join("\n")}\n`], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "comecore-codigos-recuperacion.txt"; anchor.click(); URL.revokeObjectURL(url);
  }
  const secret = enrollment ? new URL(enrollment.totpURI).searchParams.get("secret") : null;
  return <main className={styles.page}>
    <header className={styles.header}><Brand compact /><button className={styles.link} disabled={busy} onClick={() => run(async () => { await authPost("/api/auth/sign-out", {}); window.location.replace("/login"); }, "No se pudo cerrar la sesión. Inténtalo de nuevo.")}>Cerrar sesión</button></header>
    <div className={styles.content}>
      <h1>{passwordChangeRequired ? "Cambia tu contraseña temporal." : mfaReady ? "Seguridad de tu cuenta." : "Activa la verificación en dos pasos."}</h1>
      <p className={styles.intro}>{identity.user.name} · {identity.organization.name}<br />{passwordChangeRequired ? "Tu cuenta usa una contraseña temporal de alta local. Elige una contraseña privada antes de activar la verificación en dos pasos y acceder al ERP." : mfaReady ? "Protege tu contraseña, tus códigos de recuperación y tus sesiones." : "Antes de acceder al ERP, vincula una aplicación de autenticación. También recibirás códigos para recuperar el acceso si pierdes tu dispositivo."}</p>
      {message && <div className={styles.feedback} role="status" aria-live="polite">{message}</div>}
      {passwordChangeRequired && <section className={styles.section}>
        {bootstrapDone ? <Link className={styles.primary} href="/login">Iniciar sesión de nuevo</Link> : <>
          <h2>Elige una contraseña única</h2><p>Usa de 15 a 128 caracteres. Puedes guardar una frase larga en tu gestor de contraseñas.</p>
          <form className={styles.form} onSubmit={completeBootstrap} aria-busy={busy}>
            <div className={styles.field}><label htmlFor="bootstrap-current">Contraseña temporal actual</label><input id="bootstrap-current" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required /></div>
            <div className={styles.field}><label htmlFor="bootstrap-new">Nueva contraseña</label><input id="bootstrap-new" name="newPassword" type="password" autoComplete="new-password" minLength={15} maxLength={128} required /></div>
            <div className={styles.field}><label htmlFor="bootstrap-confirm">Confirmar nueva contraseña</label><input id="bootstrap-confirm" name="confirmation" type="password" autoComplete="new-password" minLength={15} maxLength={128} required /></div>
            <button type="submit" className={styles.primary} disabled={busy}>{busy ? "Actualizando…" : "Guardar mi contraseña"}</button>
          </form>
        </>}
      </section>}
      {!passwordChangeRequired && !mfaReady && !enrollment && <section className={styles.section}>
        <h2>Vincula tu aplicación</h2><p>Usa una aplicación compatible con TOTP. Confirma tu contraseña para generar el código de configuración.</p>
        <form className={styles.form} onSubmit={enable} aria-busy={busy}><div className={styles.field}><label htmlFor="enrollment-password">Tu contraseña actual</label><input id="enrollment-password" name="password" type="password" autoComplete="current-password" maxLength={128} required /></div><button className={styles.primary} disabled={busy} type="submit">{busy ? "Preparando…" : "Configurar aplicación"}</button></form>
      </section>}
      {!passwordChangeRequired && enrollment && <section className={styles.section}>
        <h2>Escanea el código con tu aplicación</h2><p>Este código configura tu segundo factor. Mantén esta pantalla privada.</p>
        <div className={styles.enrollment}><div className={styles.qr}><QRCode value={enrollment.totpURI} size={200} title="Código QR para configurar la autenticación de ComeCore" /></div><div><p>Si no puedes escanearlo, agrega manualmente esta clave en tu aplicación:</p><p className={styles.secret}>{secret}</p><form className={styles.form} onSubmit={verify} aria-busy={busy}><div className={styles.field}><label htmlFor="enrollment-code">Código de seis dígitos</label><input id="enrollment-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></div><button className={styles.primary} disabled={busy} type="submit">{busy ? "Verificando…" : "Confirmar activación"}</button></form></div></div>
      </section>}
      {!passwordChangeRequired && codes && <section className={styles.section}><h2>Guarda tus códigos de recuperación</h2><p>Cada código sirve una sola vez. Guárdalos en tu gestor de contraseñas o en un lugar privado. Al salir de esta pantalla dejarán de mostrarse.</p><div className={styles.form}><textarea className={styles.codes} rows={Math.min(codes.length, 12)} value={codes.join("\n")} readOnly autoComplete="off" aria-label="Códigos de recuperación de un solo uso" /><button type="button" className={styles.secondary} onClick={downloadCodes}>Descargar códigos</button><label className={styles.check}><input type="checkbox" checked={saved} onChange={event => setSaved(event.target.checked)} />Guardé mis códigos en un lugar privado.</label><button className={styles.primary} type="button" disabled={!saved} onClick={() => { setCodes(null); setSaved(false); setMessage(""); }}>Ya guardé mis códigos</button></div></section>}
      {!passwordChangeRequired && mfaReady && !codes && <>
        <section className={styles.section}><h2>Verificación en dos pasos activa</h2><p>Usarás tu contraseña y un código de tu aplicación para iniciar sesión. La protección se mantiene activa para acceder al ERP.</p><Link className={styles.primary} href="/">Continuar al ERP</Link></section>
        <section className={styles.section}><h2>Contraseña y recuperación</h2><p>Los cambios requieren confirmar tu contraseña y un código nuevo de tu aplicación. Espera a que cambie si acabas de usarlo para iniciar sesión.</p><div className={styles.actions}><button type="button" className={styles.secondary} disabled={busy} onClick={() => { setAction("password"); setMessage(""); }}>Cambiar contraseña</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => { setAction("backup"); setMessage(""); }}>Renovar códigos de recuperación</button></div>
          {action && <form className={styles.form} onSubmit={sensitive} aria-busy={busy} style={{ marginTop: 24 }}>
            <div className={styles.field}><label htmlFor="sensitive-password">Contraseña actual</label><input id="sensitive-password" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required /></div>
            <div className={styles.field}><label htmlFor="sensitive-code">Código de tu aplicación</label><input id="sensitive-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></div>
            {action === "password" && <><div className={styles.field}><label htmlFor="sensitive-new-password">Nueva contraseña</label><input id="sensitive-new-password" name="newPassword" type="password" autoComplete="new-password" minLength={15} maxLength={128} required /></div><div className={styles.field}><label htmlFor="sensitive-confirmation">Confirmar nueva contraseña</label><input id="sensitive-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={15} maxLength={128} required /></div></>}
            <div className={styles.actions}><button type="submit" className={styles.primary} disabled={busy}>{busy ? "Confirmando…" : action === "password" ? "Guardar contraseña" : "Generar nuevos códigos"}</button><button type="button" className={styles.link} disabled={busy} onClick={() => setAction(null)}>Cancelar</button></div>
          </form>}
        </section>
        <section className={styles.section}><h2>Sesiones abiertas</h2><p>Cierra todas tus sesiones, incluida esta, si has usado un equipo compartido o detectas un acceso inesperado.</p><button className={styles.secondary} type="button" disabled={busy} onClick={() => run(async () => { await authPost("/api/security/logout-all", {}); window.location.replace("/login"); }, "No se pudieron cerrar todas las sesiones. Inténtalo de nuevo.")}>Cerrar todas las sesiones</button></section>
      </>}
    </div>
  </main>;
}
