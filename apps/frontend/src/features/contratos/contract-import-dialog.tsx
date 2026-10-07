"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useRef, useState } from "react";
import type { ServiceStatus } from "../clientes/customer-types";
import { contractImportMaxBytes, parseContractImport } from "./contract-import-data";
import type { ContractRow } from "./contract-model";

export type ContractImportDialogProps = { open: boolean; onClose: () => void; rows: ContractRow[]; onApply: (updates: { key: string; status: ServiceStatus }[]) => void | boolean };

function ContractImportContent({ onClose, rows, onApply }: Omit<ContractImportDialogProps, "open">) {
  const input = useRef<HTMLInputElement | null>(null);
  const readVersion = useRef(0);
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const result = useMemo(() => content === null ? null : parseContractImport(content, format, rows), [content, format, rows]);
  async function readFile(file?: File) {
    if (!file) return;
    const version = ++readVersion.current;
    setFileName(file.name); setContent(null); setFileError(""); setConfirmed(false); setReading(false);
    if (file.size > contractImportMaxBytes) { setFileError("El archivo excede el máximo de 1 MB."); return; }
    const extension = file.name.toLocaleLowerCase().split(".").pop();
    if (extension !== "csv" && extension !== "json") { setFileError("Selecciona un archivo CSV o JSON."); return; }
    setFormat(extension); setReading(true);
    try { const text = await file.text(); if (readVersion.current === version) setContent(text); }
    catch { if (readVersion.current === version) setFileError("No se pudo leer el archivo seleccionado."); }
    finally { if (readVersion.current === version) setReading(false); }
  }
  const valid = result && result.errors.length === 0 && result.updates.length > 0 && !reading;
  function downloadFormat() {
    const cell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const text = ["ID,Estado", ...rows.map((row) => `${cell(row.contract.id)},${cell(row.contract.status)}`)].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", text], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "actualizar-estados-contratos.csv"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function applyImport() {
    if (content === null || !confirmed) return;
    const verified = parseContractImport(content, format, rows);
    if (verified.errors.length || !verified.updates.length) return;
    if (onApply(verified.updates) !== false) onClose();
  }
  return <Dialog open onClose={onClose} fullWidth maxWidth="md" aria-labelledby="contract-import-title" slotProps={{ paper: { sx: { borderRadius: "2px" } } }}>
    <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 2, sm: 3 } }}><Typography id="contract-import-title" component="h2" sx={{ flex: 1, fontSize: 18 }}>{confirmed ? "Confirmar actualización" : "Actualizar contratos desde archivo"}</Typography><Tooltip title="Cerrar"><IconButton size="small" aria-label="Cerrar importación de contratos" onClick={onClose}><CloseRoundedIcon /></IconButton></Tooltip></DialogTitle>
    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
      {!confirmed && <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}><Button variant="outlined" startIcon={<UploadFileOutlinedIcon />} disabled={reading} onClick={() => input.current?.click()}>Seleccionar archivo</Button><Button startIcon={<DownloadRoundedIcon />} onClick={downloadFormat}>Formato CSV</Button><Typography sx={{ color: "text.secondary", fontSize: 13, overflowWrap: "anywhere" }}>{fileName || "CSV o JSON · Máximo 1 MB"}</Typography><input ref={input} hidden type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => { void readFile(event.target.files?.[0]); event.target.value = ""; }} /></Box>}
      {reading && <Typography role="status" sx={{ py: 2, fontSize: 13 }}>Leyendo archivo...</Typography>}
      {fileError && <Alert severity="error" sx={{ mb: 2 }}>{fileError}</Alert>}
      {result && result.errors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}><Typography sx={{ fontSize: 13, fontWeight: 600 }}>Archivo rechazado. No se aplicará ningún cambio.</Typography><Box component="ul" sx={{ m: 0, mt: 1, pl: 2 }}>{result.errors.slice(0, 20).map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</Box>{result.errors.length > 20 && <Typography sx={{ mt: 1, fontSize: 13 }}>{result.errors.length - 20} errores adicionales.</Typography>}</Alert>}
      {valid && <Alert severity={confirmed ? "warning" : "info"} sx={{ mb: 2 }}>{confirmed ? "Se actualizará el estado de" : "Vista previa:"} {result.updates.length} contrato{result.updates.length === 1 ? "" : "s"}.</Alert>}
      {result && result.preview.length > 0 && <Box sx={{ overflowX: "auto", maxHeight: 360 }}><Table size="small" stickyHeader aria-label="Vista previa de actualización"><TableHead><TableRow>{["Contrato", "Cliente", "Estado actual", "Nuevo estado"].map((label) => <TableCell key={label} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{result.preview.slice(0, 100).map((record) => <TableRow key={record.key}><TableCell sx={{ whiteSpace: "nowrap" }}>{record.contractId}</TableCell><TableCell>{record.customerName}</TableCell><TableCell>{record.previousStatus}</TableCell><TableCell>{record.status}</TableCell></TableRow>)}</TableBody></Table></Box>}
      {result && result.preview.length > 100 && <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>Mostrando 100 de {result.preview.length} contratos.</Typography>}
      {!result && !reading && !fileError && <Typography sx={{ py: 2, color: "text.secondary", fontSize: 13 }}>Sin archivo seleccionado.</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1 }}><Button color="inherit" onClick={confirmed ? () => setConfirmed(false) : onClose}>{confirmed ? "Volver" : "Cancelar"}</Button><Button variant="contained" disabled={!valid} onClick={confirmed ? applyImport : () => setConfirmed(true)}>{confirmed ? `Actualizar ${result?.updates.length ?? 0}` : "Revisar actualización"}</Button></DialogActions>
  </Dialog>;
}

export function ContractImportDialog({ open, ...props }: ContractImportDialogProps) {
  return open ? <ContractImportContent {...props} /> : null;
}
