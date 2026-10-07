"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Customer, CustomerContract } from "../clientes/customer-types";
import { contractFormOptions } from "./contract-form-data";
import { statuses, type ContractRow } from "./contract-model";

export type ContractBulkChanges = Partial<Pick<CustomerContract, "status" | "plan" | "server" | "node" | "interfaceName">>;
export type ContractBulkDialogProps = { open: boolean; onClose: () => void; rows: ContractRow[]; onApply: (changes: ContractBulkChanges) => void | boolean; customers: Customer[] };
type BulkField = keyof ContractBulkChanges;
const fields: { name: BulkField; label: string }[] = [{ name: "status", label: "Estado" }, { name: "plan", label: "Plan" }, { name: "server", label: "Servidor" }, { name: "node", label: "Nodo" }, { name: "interfaceName", label: "Interfaz" }];

function ContractBulkContent({ onClose, rows, onApply, customers }: Omit<ContractBulkDialogProps, "open">) {
  const [enabled, setEnabled] = useState<Partial<Record<BulkField, boolean>>>({});
  const [values, setValues] = useState<Record<BulkField, string>>({ status: "Habilitado", plan: "", server: "", node: "", interfaceName: "" });
  const [review, setReview] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const commonServer = rows.every((row) => row.contract.server === rows[0]?.contract.server) ? rows[0]?.contract.server ?? "" : "";
  const targetServer = enabled.server ? values.server : commonServer;
  const options = contractFormOptions(customers, targetServer);
  const servers = enabled.server ? [values.server] : [...new Set(rows.map((row) => row.contract.server))];
  const errors: Partial<Record<BulkField, string>> = {};
  for (const field of fields) if (enabled[field.name] && !values[field.name].trim()) errors[field.name] = "Ingresa un valor; este campo no puede quedar vacío.";
  const changingServer = enabled.server && rows.some((row) => row.contract.server !== values.server.trim());
  if (changingServer) for (const field of ["node", "interfaceName"] as const) if (!enabled[field] || !values[field].trim()) errors[field] = "Selecciona un valor para la conexión al nuevo servidor.";
  if (enabled.interfaceName && values.interfaceName.trim()) {
    const incompatible = servers.some((server) => { const interfaces = contractFormOptions(customers, server).interfaces; return interfaces.length > 0 && !interfaces.includes(values.interfaceName.trim()); });
    if (incompatible) errors.interfaceName = "La interfaz debe estar registrada en cada servidor seleccionado.";
  }
  if (enabled.node && values.node.trim() && !options.nodes.includes(values.node.trim())) errors.node = "Selecciona un nodo registrado.";
  const active = fields.filter((field) => enabled[field.name]);
  function changeValue(name: BulkField, value: string) {
    setValues((current) => ({ ...current, [name]: value, ...(name === "server" ? { node: "", interfaceName: "" } : {}) }));
    if (name === "server") setEnabled((current) => ({ ...current, node: true, interfaceName: true }));
  }
  function applyChanges() {
    if (rows.length === 0 || active.length === 0 || Object.keys(errors).length) return;
    const changes = Object.fromEntries(active.map((field) => [field.name, values[field.name].trim()])) as ContractBulkChanges;
    if (onApply(changes) !== false) onClose();
  }
  return <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="contract-bulk-title" slotProps={{ paper: { sx: { borderRadius: "2px" } } }}>
    <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1, px: 3 }}><Typography id="contract-bulk-title" component="h2" sx={{ flex: 1, fontSize: 18 }}>{review ? "Confirmar modificación" : "Modificar contratos en lote"}</Typography><Tooltip title="Cerrar"><IconButton size="small" aria-label="Cerrar modificación en lote" onClick={onClose}><CloseRoundedIcon /></IconButton></Tooltip></DialogTitle>
    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography sx={{ mb: 2, fontSize: 13 }}>{rows.length} contrato{rows.length === 1 ? " seleccionado" : "s seleccionados"}.</Typography>
      {rows.length === 0 && <Alert severity="info">Selecciona contratos para realizar una modificación en lote.</Alert>}
      {review ? <><Alert severity="warning" sx={{ mb: 2 }}>Se aplicarán estos cambios a {rows.length} contrato{rows.length === 1 ? "" : "s"}.</Alert><Box component="dl" sx={{ m: 0 }}>{active.map((field) => <Box key={field.name} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}><Typography component="dt" sx={{ fontSize: 13 }}>{field.label}</Typography><Typography component="dd" sx={{ m: 0, fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>{values[field.name]}</Typography></Box>)}</Box></> : <Box sx={{ display: "grid", gap: 1.5 }}>{fields.map((field) => {
        const choices = field.name === "plan" ? options.plans : field.name === "server" ? options.servers : field.name === "node" ? options.nodes : options.interfaces;
        return <Box key={field.name} sx={{ minWidth: 0 }}>
          <FormControlLabel control={<Checkbox size="small" checked={Boolean(enabled[field.name])} onChange={(_, checked) => setEnabled((current) => ({ ...current, [field.name]: checked }))} />} label={`Modificar ${field.label.toLowerCase()}`} />
          {field.name === "status" ? <TextField fullWidth select size="small" label={field.label} disabled={!enabled.status} value={values.status} onChange={(event) => changeValue("status", event.target.value)}>{statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField> : <Autocomplete freeSolo={field.name === "plan" || field.name === "server" || field.name === "interfaceName"} size="small" disabled={!enabled[field.name]} options={choices} value={values[field.name] || null} inputValue={values[field.name]} onInputChange={(_, value, reason) => { if (reason === "input" || reason === "clear") changeValue(field.name, value); }} onChange={(_, value) => changeValue(field.name, value ?? "")} renderInput={(params) => <TextField {...params} label={field.label} error={attempted && Boolean(errors[field.name])} helperText={attempted ? errors[field.name] : undefined} />} />}
        </Box>;
      })}</Box>}
    </DialogContent>
    <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}><Button color="inherit" onClick={review ? () => setReview(false) : onClose}>{review ? "Volver" : "Cancelar"}</Button><Button variant="contained" disabled={rows.length === 0 || active.length === 0} onClick={review ? applyChanges : () => { setAttempted(true); if (!Object.keys(errors).length) setReview(true); }}>{review ? `Aplicar a ${rows.length}` : "Revisar cambios"}</Button></DialogActions>
  </Dialog>;
}

export function ContractBulkDialog({ open, ...props }: ContractBulkDialogProps) {
  return open ? <ContractBulkContent {...props} /> : null;
}
