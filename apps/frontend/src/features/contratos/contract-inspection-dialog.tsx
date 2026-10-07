"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Customer, CustomerContract } from "../clientes/customer-types";
import { ContractAuditSection } from "./contract-detail-records";
import { ContractConsumptionSection, ContractFields, ContractSection } from "./contract-detail-sections";

export type ContractInspectionKind = "audit" | "consumption" | "ping" | "pppoe" | "cpe" | "sync";
export type ContractInspectionDialogProps = {
  open: boolean;
  onClose: () => void;
  kind: ContractInspectionKind;
  customer: Customer | null;
  contract: CustomerContract | null;
};

const titles: Record<ContractInspectionKind, string> = { audit: "Auditorías", consumption: "Resumen de consumo", ping: "Ping", pppoe: "PPPoE Status", cpe: "Acceso CPE", sync: "Resincronizar contrato" };

function cpeUrl(contract: CustomerContract) {
  const address = contract.ipAddress.trim();
  const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(address) && address.split(".").every((octet) => Number(octet) <= 255);
  const ipv6 = /^[\da-fA-F:]+$/.test(address) && address.includes(":");
  if ((!ipv4 && !ipv6) || address === "0.0.0.0" || address === "255.255.255.255") return null;
  const protocol = contract.cpeProtocol?.toLowerCase().replace(/:$/, "") || "http";
  if (protocol !== "http" && protocol !== "https") return null;
  const port = contract.cpePort;
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) return null;
  try { return new URL(`${protocol}://${ipv6 ? `[${address}]` : address}${port ? `:${port}` : ""}`).href; } catch { return null; }
}

function ContractCpeSection({ contract }: { contract: CustomerContract }) {
  const url = cpeUrl(contract);
  const [copyStatus, setCopyStatus] = useState<"copied" | "error" | null>(null);
  async function copyAddress() {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); setCopyStatus("copied"); } catch { setCopyStatus("error"); }
  }
  return <ContractSection title="Dirección de acceso">
    {url ? <><TextField fullWidth label="Dirección CPE" value={url} slotProps={{ input: { readOnly: true } }} /><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}><Button startIcon={<ContentCopyRoundedIcon />} onClick={() => void copyAddress()}>Copiar dirección</Button><Button component="a" href={url} target="_blank" rel="noopener noreferrer" startIcon={<LaunchRoundedIcon />}>Abrir CPE</Button></Box>{copyStatus && <Alert sx={{ mt: 2 }} severity={copyStatus === "copied" ? "success" : "error"}>{copyStatus === "copied" ? "Dirección copiada." : "No se pudo copiar la dirección."}</Alert>}</> : <Alert severity="info">No hay una dirección IP válida y un protocolo de acceso configurados para este CPE.</Alert>}
    <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 13 }}>Disponibilidad y acceso remoto del equipo sin verificar.</Typography>
  </ContractSection>;
}

function ContractNetworkInspection({ kind, contract }: { kind: ContractInspectionKind; contract: CustomerContract }) {
  const message = kind === "sync" ? "Servicio de sincronización no conectado. El contrato no ha sido enviado al equipo de red." : kind === "pppoe" ? "Consulta de sesión PPPoE no disponible: el servicio de red no está conectado." : "Consulta de ping no disponible: el servicio de diagnóstico de red no está conectado.";
  return <>
    {kind !== "cpe" && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}
    <ContractSection title="Configuración registrada"><ContractFields fields={[
      { label: "Servidor", value: contract.server }, { label: "Nodo", value: contract.node },
      { label: "Interfaz", value: contract.interfaceName }, { label: "Dirección IP", value: contract.ipAddress },
      { label: "Dirección MAC", value: contract.macAddress }, { label: "Modo de conexión", value: contract.accessMode },
      { label: "Estado del contrato", value: contract.status },
      ...(kind === "pppoe" ? [{ label: "Usuario PPPoE", value: contract.username }, { label: "Perfil PPP", value: contract.pppProfile }, { label: "Servidor PPPoE", value: contract.pppoeServer }] : []),
      ...(kind === "cpe" ? [{ label: "Protocolo CPE", value: contract.cpeProtocol || "http" }, { label: "Puerto CPE", value: contract.cpePort }] : []),
    ]} /></ContractSection>
    {kind === "cpe" && <ContractCpeSection contract={contract} />}
    {kind === "pppoe" && contract.accessMode !== "PPPoE" && <Typography role="status" sx={{ color: "text.secondary", fontSize: 13 }}>Este contrato no tiene el modo PPPoE configurado.</Typography>}
  </>;
}

export function ContractInspectionDialog({ open, onClose, kind, customer, contract }: ContractInspectionDialogProps) {
  if (!open || !customer || !contract) return null;
  return <Dialog open onClose={onClose} fullWidth maxWidth={kind === "audit" ? "lg" : "md"} aria-labelledby="contract-inspection-title" slotProps={{ paper: { sx: { borderRadius: "2px" } } }}>
    <DialogTitle component="div" sx={{ display: "flex", gap: 2, alignItems: "start", px: { xs: 2, sm: 3 }, py: 2 }}><Box sx={{ flex: 1, minWidth: 0 }}><Typography id="contract-inspection-title" component="h2" sx={{ fontSize: 18 }}>{titles[kind]}</Typography><Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13, overflowWrap: "anywhere" }}>{contract.id} · {customer.name}</Typography></Box><Tooltip title="Cerrar"><IconButton aria-label={`Cerrar ${titles[kind]}`} size="small" onClick={onClose}><CloseRoundedIcon /></IconButton></Tooltip></DialogTitle>
    <DialogContent sx={{ p: { xs: 2, sm: 3 }, minHeight: 240 }}>
      {kind === "audit" ? <ContractAuditSection customer={customer} contract={contract} /> : kind === "consumption" ? <ContractConsumptionSection contract={contract} /> : <ContractNetworkInspection key={`${contract.id}-${kind}`} kind={kind} contract={contract} />}
    </DialogContent>
    <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: "1px solid", borderColor: "divider" }}><Button onClick={onClose}>Cerrar</Button></DialogActions>
  </Dialog>;
}
