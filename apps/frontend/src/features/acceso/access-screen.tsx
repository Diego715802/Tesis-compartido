"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { AccessFrame } from "./access-frame";
import { accessMessage, authPost, enterErp } from "@/lib/auth/client";
import styles from "./access-screen.module.css";

type FieldErrors = { email?: string; password?: string };
export function AccessScreen() {
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const messageRegion = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfa, setMfa] = useState(false);
  const [backup, setBackup] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    if (!mfa) {
      const email = emailInput.current;
      const password = passwordInput.current;
      const nextErrors: FieldErrors = {};
      if (!email?.value.trim()) nextErrors.email = "Ingresa tu correo electrónico.";
      else if (!email.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) nextErrors.email = "Escribe un correo válido, por ejemplo, nombre@empresa.com.";
      if (!password?.value) nextErrors.password = "Ingresa tu contraseña.";
      setErrors(nextErrors);
      if (nextErrors.email) { email?.focus(); return; }
      if (nextErrors.password) { password?.focus(); return; }
      setLoading(true);
      try {
        const result = await authPost<{ twoFactorRedirect?: boolean }>("/api/auth/sign-in/email", { email: email!.value.trim(), password: password!.value, rememberMe: false });
        password!.value = "";
        setShowPassword(false);
        if (result.twoFactorRedirect) { setMfa(true); return; }
        await enterErp();
      } catch (error) { setMessage(accessMessage(error, "No pudimos iniciar sesión. Revisa tus credenciales o consulta al administrador si el problema continúa.")); }
      finally { setLoading(false); }
    } else {
      const code = codeInput.current?.value.trim() ?? "";
      if (!code || (!backup && !/^\d{6}$/.test(code))) { setMessage(backup ? "Ingresa uno de tus códigos de recuperación." : "Ingresa el código de seis dígitos de tu aplicación."); codeInput.current?.focus(); return; }
      setLoading(true);
      try {
        await authPost(`/api/auth/two-factor/${backup ? "verify-backup-code" : "verify-totp"}`, { code, trustDevice: false, ...(backup ? { disableSession: false } : {}) });
        if (codeInput.current) codeInput.current.value = "";
        await enterErp();
      } catch (error) { setMessage(accessMessage(error, "No pudimos verificar el código. Revisa que sea correcto y que no haya expirado.")); }
      finally { setLoading(false); }
    }
    messageRegion.current?.focus();
  }

  return <AccessFrame>
    <h1 id="titulo-acceso">{mfa ? "Verifica tu acceso." : "Bienvenido a ComeCore."}</h1>
    <p className={styles.intro}>{mfa ? (backup ? "Usa un código de recuperación que no hayas utilizado antes." : "Ingresa el código de tu aplicación de autenticación.") : "Tu espacio para gestionar la operación diaria."}</p>
    <form id="formulario-acceso" className={styles.form} method="post" onSubmit={submit} noValidate aria-busy={loading}>
      {!mfa ? <>
        <div className={styles.field}><label htmlFor="access-email">Correo electrónico</label><input ref={emailInput} id="access-email" name="username" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="nombre@empresa.com" maxLength={254} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} onChange={() => { setErrors(current => ({ ...current, email: undefined })); setMessage(""); }} />{errors.email && <p id="email-error" className={styles.fieldError} role="alert">{errors.email}</p>}</div>
        <div className={styles.field}><label htmlFor="access-password">Contraseña</label><div className={styles.passwordField}><input ref={passwordInput} id="access-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Ingresa tu contraseña" maxLength={128} required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} onChange={() => { setErrors(current => ({ ...current, password: undefined })); setMessage(""); }} /><button type="button" className={styles.visibilityButton} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-controls="access-password" aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}>{showPassword ? <VisibilityOffOutlinedIcon aria-hidden="true" /> : <VisibilityOutlinedIcon aria-hidden="true" />}</button></div>{errors.password && <p id="password-error" className={styles.fieldError} role="alert">{errors.password}</p>}</div>
        <Link href="/recuperar" className={styles.recoveryButton}>¿Olvidaste tu contraseña?</Link>
      </> : <>
        <div className={styles.field}><label htmlFor="access-code">{backup ? "Código de recuperación" : "Código de autenticación"}</label><input ref={codeInput} key={backup ? "backup" : "totp"} id="access-code" name="code" type="text" autoComplete={backup ? "off" : "one-time-code"} inputMode={backup ? "text" : "numeric"} autoCapitalize="none" spellCheck={false} maxLength={backup ? 64 : 6} placeholder={backup ? "Tu código de un solo uso" : "000000"} autoFocus required /></div>
        <button type="button" className={styles.recoveryButton} disabled={loading} onClick={() => { setBackup(current => !current); setMessage(""); }}>{backup ? "Usar aplicación de autenticación" : "Usar un código de recuperación"}</button>
      </>}
      <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? "Verificando…" : mfa ? "Verificar acceso" : "Iniciar sesión"}<ArrowForwardRoundedIcon aria-hidden="true" /></button>
      <div ref={messageRegion} className={message ? styles.feedback : styles.emptyFeedback} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>{message}</div>
      {mfa && <button type="button" className={styles.secondaryButton} disabled={loading} onClick={async () => { setLoading(true); try { await authPost("/api/auth/sign-out", {}); window.location.replace("/login"); } catch (error) { setMessage(accessMessage(error, "No se pudo reiniciar el acceso. Inténtalo de nuevo.")); setLoading(false); } }}>Volver al inicio de sesión</button>}
    </form>
    <aside className={styles.previewNote} aria-label="Verificación de acceso"><ShieldOutlinedIcon aria-hidden="true" /><div><p className={styles.previewTitle}>Verificación en dos pasos</p><p>Tu contraseña y tu aplicación de autenticación protegen el acceso a la operación.</p></div></aside>
  </AccessFrame>;
}
