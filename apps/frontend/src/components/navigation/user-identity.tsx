"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useIdentity } from "@/components/auth/identity-provider";
import { accessMessage, authPost } from "@/lib/auth/client";

const roles: Record<string, string> = { owner: "Propietario", admin: "Administrador", billing: "Facturación", support: "Soporte", viewer: "Consulta" };
export function UserIdentity() {
  const identity = useIdentity();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const initials = identity.user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  async function logout() {
    if (busy) return;
    setBusy(true); setMessage("");
    try { await authPost("/api/auth/sign-out", {}); window.location.replace("/login"); }
    catch (error) { setMessage(accessMessage(error, "No se pudo cerrar la sesión. Inténtalo de nuevo.")); setBusy(false); }
  }
  return <>
    <Button color="inherit" onClick={event => setAnchor(event.currentTarget)} aria-label={`Cuenta de ${identity.user.name}`} aria-controls={anchor ? "account-menu" : undefined} aria-haspopup="true" aria-expanded={Boolean(anchor)} sx={{ minWidth: 44, minHeight: 44, px: 1, gap: 1.15, textTransform: "none", borderRadius: 0 }}>
      <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0, maxWidth: 150, textAlign: "right" }}>
        <Typography noWrap sx={{ color: "text.primary", fontSize: "0.82rem", fontWeight: 650, lineHeight: 1.2 }}>{identity.user.name}</Typography>
        <Typography noWrap sx={{ mt: 0.35, color: "text.secondary", fontSize: "0.69rem", lineHeight: 1.1 }}>{roles[identity.role] ?? "Cuenta del ERP"}</Typography>
      </Box>
      <Avatar sx={{ width: 34, height: 34, color: "#0756B5", backgroundColor: "#E8F2FC", border: "1px solid #D3E4F6", fontSize: "0.78rem", fontWeight: 700 }}>{initials || "CC"}</Avatar>
    </Button>
    <Menu id="account-menu" anchorEl={anchor} open={Boolean(anchor)} onClose={() => { if (!busy) setAnchor(null); }} slotProps={{ paper: { sx: { maxWidth: "min(340px, calc(100vw - 32px))" } } }}>
      <Box sx={{ px: 2, py: 1.2 }}><Typography sx={{ fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>{identity.user.email}</Typography><Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary", overflowWrap: "anywhere" }}>{identity.organization.name}</Typography></Box>
      <MenuItem component={Link} href="/seguridad" onClick={() => setAnchor(null)}>Seguridad de mi cuenta</MenuItem>
      <MenuItem onClick={logout} disabled={busy}>{busy ? "Cerrando sesión…" : "Cerrar sesión"}</MenuItem>
      {message && <Box role="alert" sx={{ px: 2, py: 1, maxWidth: 300, color: "#A33C3C", fontSize: 13, lineHeight: 1.5 }}>{message}</Box>}
    </Menu>
  </>;
}
