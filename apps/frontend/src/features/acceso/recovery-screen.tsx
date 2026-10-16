"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AccessFrame } from "./access-frame";
import { accessMessage, authPost } from "@/lib/auth/client";
import styles from "./access-screen.module.css";

export function RecoveryScreen({ reset = false }: { reset?: boolean }) {
  const token = useRef("");
  const initialized = useRef(false);
  const [validToken, setValidToken] = useState(false);
  const [ready, setReady] = useState(!reset);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!reset) return;
    if (!initialized.current) {
      const candidate = new URLSearchParams(window.location.search).get("token") ?? "";
      // Erase the token from history immediately; retain it only in this mounted view.
      window.history.replaceState(null, "", "/restablecer");
      token.current = /^[A-Za-z0-9_-]{20,512}$/.test(candidate) ? candidate : "";
      initialized.current = true;
    }
    const hasToken = Boolean(token.current);
    const frame = requestAnimationFrame(() => { setValidToken(hasToken); setReady(true); });
    return () => cancelAnimationFrame(frame);
  }, [reset]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setMessage("");
    const password = String(data.get("password") ?? "");
    if (reset && (password.length < 15 || password.length > 128 || password !== data.get("confirmation"))) { setMessage("Usa de 15 a 128 caracteres y confirma la misma contraseña."); return; }
    setLoading(true);
    try {
      if (reset) {
        await authPost("/api/auth/reset-password", { token: token.current, newPassword: password });
        token.current = "";
        setMessage("Tu contraseña se actualizó. Inicia sesión de nuevo con tu contraseña y tu aplicación de autenticación.");
      } else {
        await authPost("/api/auth/request-password-reset", { email: String(data.get("email") ?? "").trim(), redirectTo: `${window.location.origin}/restablecer` });
        setMessage("Si la cuenta puede recuperar el acceso, recibirás un correo con los siguientes pasos. Revisa también la carpeta de correo no deseado.");
      }
      form.reset();
      setDone(true);
    } catch (error) { setMessage(accessMessage(error, reset ? "El enlace no es válido o ya expiró. Solicita un enlace nuevo para restablecer tu contraseña." : "No se pudo solicitar la recuperación. Inténtalo de nuevo en unos minutos.")); }
    finally { setLoading(false); }
  }
  const invalid = reset && ready && !validToken && !done;
  return <AccessFrame>
    <h1 id="titulo-acceso">{reset ? "Una nueva contraseña." : "Recupera tu acceso."}</h1>
    <p className={styles.intro}>{reset ? "Elige una contraseña larga y única que no uses en otros servicios." : "Te enviaremos las instrucciones al correo asociado con tu cuenta."}</p>
    {invalid ? <div className={styles.feedback} role="alert">Este enlace no es válido o ya no está disponible. <Link href="/recuperar">Solicita un nuevo enlace.</Link></div> : <form id="formulario-acceso" className={styles.form} onSubmit={submit} aria-busy={loading}>
      {!done && (reset ? <>
        <div className={styles.field}><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} required disabled={!ready} aria-describedby="password-requirements" /><p id="password-requirements" className={styles.hint}>De 15 a 128 caracteres. Puedes usar una frase larga y un gestor de contraseñas.</p></div>
        <div className={styles.field}><label htmlFor="confirm-password">Confirmar nueva contraseña</label><input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={15} maxLength={128} required disabled={!ready} /></div>
      </> : <div className={styles.field}><label htmlFor="recovery-email">Correo electrónico</label><input id="recovery-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} placeholder="nombre@empresa.com" required /></div>)}
      {!done && <button className={styles.submitButton} type="submit" disabled={loading || !ready}>{loading ? "Procesando…" : reset ? "Guardar nueva contraseña" : "Enviar instrucciones"}</button>}
      <div className={message ? styles.feedback : styles.emptyFeedback} role="status" aria-live="polite">{message}</div>
    </form>}
    <Link href="/login" className={styles.erpLink}>Volver al inicio de sesión</Link>
  </AccessFrame>;
}
