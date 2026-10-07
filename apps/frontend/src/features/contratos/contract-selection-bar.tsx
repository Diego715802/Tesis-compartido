"use client";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { ContractRow } from "./contract-model";

export function ContractSelectionBar({ count, total, onDownload, onUpdate, onNotify }: { count: number; total: number; onDownload: () => void; onUpdate: () => void; onNotify: () => void }) {
  return <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", py: 1.5 }}>
    <Typography sx={{ fontSize: 13, mr: "auto" }}>{count} contratos seleccionados de {total}</Typography>
    <Button disabled={!count} startIcon={<NotificationsOutlinedIcon />} onClick={onNotify}>Notificar</Button>
    <Button disabled={!total} startIcon={<DownloadOutlinedIcon />} onClick={onDownload}>Descargar {count ? "selección" : "listado"}</Button>
    <Button disabled={!count} startIcon={<EditOutlinedIcon />} onClick={onUpdate}>Actualizar</Button>
  </Box>;
}

export function ContractNotificationDialog({ open, onClose, rows }: { open: boolean; onClose: () => void; rows: ContractRow[] }) {
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [message, setMessage] = useState("");
  const customers = [...new Map(rows.map((row) => [row.customer.id, row.customer])).values()];
  const eligible = customers.filter((customer) => customer.communication[channel] && (channel === "email" ? customer.contact.email.includes("@") : /\d{6,}/.test(customer.contact.mobile.replace(/\D/g, ""))));
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="contract-notify-title">
    <DialogTitle id="contract-notify-title">Notificar clientes</DialogTitle>
    <DialogContent sx={{ display: "grid", gap: 2, pt: "12px !important" }}>
      <TextField select label="Canal" size="small" value={channel} onChange={(event) => setChannel(event.target.value as typeof channel)}>{[["email", "Correo"], ["sms", "SMS"], ["whatsapp", "WhatsApp"]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
      <Typography sx={{ fontSize: 13 }}>{rows.length} contratos · {customers.length} clientes únicos · {eligible.length} destinatarios habilitados</Typography>
      <Box sx={{ maxHeight: 180, overflow: "auto", borderBottom: "1px solid", borderColor: "divider" }}>{customers.map((customer) => <Typography key={customer.id} sx={{ fontSize: 13, py: 0.75, overflowWrap: "anywhere" }}>{customer.name}: {channel === "email" ? customer.contact.email : customer.contact.mobile} {!eligible.includes(customer) && "(sin contacto o canal deshabilitado)"}</Typography>)}</Box>
      <TextField label="Mensaje" multiline minRows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
      <Alert severity="info">El proveedor de mensajería no está conectado. No se enviarán notificaciones.</Alert>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Cerrar</Button><Button variant="contained" disabled>Enviar</Button></DialogActions>
  </Dialog>;
}
