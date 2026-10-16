"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AccessFrame } from "./access-frame";
import { accessMessage, authPost } from "@/lib/auth/client";
import styles from "./access-screen.module.css";

export function VerifyEmailScreen() {
  const token = useRef("");
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!initialized.current) {
      const value = new URLSearchParams(window.location.search).get("token") || "";
      window.history.replaceState(null, "", "/verificar-correo");
      token.current = value.length >= 20 && value.length <= 4096 ? value : "";
      initialized.current = true;
    }
    const frame = requestAnimationFrame(() => setReady(Boolean(token.current)));
    return () => cancelAnimationFrame(frame);
  }, []);
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token.current || busy) return;
    setBusy(true);
    try { await authPost("/api/security/verify-email", { token: token.current }); token.current = ""; setDone(true); setMessage("Tu correo quedó verificado. Inicia sesión para continuar."); }
    catch (error) { setMessage(accessMessage(error, "El enlace no es válido o venció. Solicita una nueva verificación al iniciar sesión.")); }
    finally { setBusy(false); }
  }
  return <AccessFrame>
    <h1 id="titulo-acceso">Verifica tu correo.</h1><p className={styles.intro}>Confirma el correo asociado a tu cuenta de ComeCore.</p>
    {message && <div className={styles.feedback} role="status">{message}</div>}
    {!done && <form id="formulario-acceso" className={styles.form} onSubmit={confirm}><button type="submit" className={styles.submitButton} disabled={!ready || busy}>{busy ? "Verificando…" : "Confirmar mi correo"}</button>{!ready && <p>Abre el enlace de verificación que recibiste por correo.</p>}</form>}
    <Link className={styles.recoveryButton} href="/login">Volver al acceso</Link>
  </AccessFrame>;
}
