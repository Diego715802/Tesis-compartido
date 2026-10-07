"use client";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@mui/material";
import type { ServiceStatus } from "../clientes/customer-types";
import { statuses, type ContractRow } from "./contract-model";

export function ContractControlPanel({ rows, status, onStatus }: { rows: ContractRow[]; status: ServiceStatus | "Todos"; onStatus: (status: ServiceStatus | "Todos") => void }) {
  const configured = rows.filter((row) => row.contract.oltEnabled).length;
  return <Accordion disableGutters elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: 40, px: 0 }}><Typography sx={{ fontSize: 13 }}>Panel de Control</Typography></AccordionSummary>
    <AccordionDetails sx={{ p: 0, pb: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, border: "1px solid", borderColor: "divider" }}>
        {["Alertas de potencias", "Offline", "Desincronizadas", "Cambios pendientes"].map((title) => <Box key={title} sx={{ p: 2, borderRight: "1px solid", borderColor: "divider" }}><Typography sx={{ fontSize: 13 }}>{title}</Typography><Typography sx={{ fontSize: 17, mt: 1, color: "text.secondary" }}>Sin lectura</Typography><Typography sx={{ fontSize: 12, color: "text.secondary" }}>OLT no conectada</Typography></Box>)}
      </Box>
      <Typography sx={{ my: 1.5, fontSize: 12, color: "text.secondary" }}>{configured} contratos con configuración OLT</Typography>
      <Box role="group" aria-label="Filtrar por estado del contrato" sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {(["Todos", ...statuses] as const).map((value) => <Button key={value} size="small" variant={status === value ? "contained" : "text"} aria-pressed={status === value} onClick={() => onStatus(value)} sx={{ boxShadow: "none" }}>{value} ({value === "Todos" ? rows.length : rows.filter((row) => row.contract.status === value).length})</Button>)}
      </Box>
    </AccordionDetails>
  </Accordion>;
}
