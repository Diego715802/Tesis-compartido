"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, ButtonBase, Checkbox, Chip, IconButton, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ServiceStatus } from "../clientes/customer-types";
import { contractDate, contractSerial, customerAddress, formatContractDate, type ContractRow } from "./contract-model";
import { ContractStatusSelect } from "./contract-status-select";

export const contractColumns = [
  { key: "billing", label: "Facturación" }, { key: "tickets", label: "Tickets" },
  { key: "onu", label: "ONU" }, { key: "nap", label: "NAP" }, { key: "acs", label: "ACS" },
  { key: "connection", label: "Conectividad" }, { key: "serial", label: "Puerto / SN" },
  { key: "network", label: "Networking" }, { key: "server", label: "Servidor / OLT" }, { key: "plan", label: "Plan" },
] as const;
export type ContractColumn = typeof contractColumns[number]["key"];

export function ContractStatus({ status }: { status: ServiceStatus }) {
  const off = status === "Deshabilitado" || status === "Suspendido";
  return <Chip label={status} size="small" icon={status === "Habilitado" ? <CheckCircleOutlineRoundedIcon /> : off ? <CancelOutlinedIcon /> : <ErrorOutlineRoundedIcon />} color={status === "Habilitado" ? "success" : off ? "default" : "warning"} variant="outlined" sx={{ fontSize: 11, height: 24, borderRadius: "2px" }} />;
}

type Props = {
  rows: ContractRow[]; selected: Set<string>; onToggle: (key: string) => void; onToggleAll: () => void;
  columns: ContractColumn[]; onDetail: (row: ContractRow) => void; onEdit: (row: ContractRow) => void;
  onMenu: (row: ContractRow, element: HTMLElement) => void;
  onStatusChange: (row: ContractRow, status: ServiceStatus) => void;
  page: number; pageSize: number; count: number; onPage: (page: number) => void; onPageSize: (size: number) => void;
};

function ContractIdentity({ row, onDetail, onStatusChange }: Pick<Props, "onDetail" | "onStatusChange"> & { row: ContractRow }) {
  return <Stack sx={{ gap: 0.55, width: { xs: 205, sm: 270 }, maxWidth: "100%" }}>
    <Stack sx={{ gap: 0.5, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "start", sm: "baseline" } }}>
      <Typography color="text.secondary" sx={{ fontSize: 11, overflowWrap: "anywhere", minWidth: 0 }}>#{contractSerial(row.contract)}</Typography>
      <ButtonBase onClick={() => onDetail(row)} sx={{ color: "primary.main", fontWeight: 600, textAlign: "left", justifyContent: "start", fontSize: 13, lineHeight: 1.35, minWidth: 0, overflowWrap: "anywhere" }}>{row.customer.name}</ButtonBase>
    </Stack>
    <Tooltip title={customerAddress(row.customer)}><Link href={`https://www.google.com/maps/search/?api=1&query=${row.customer.address.latitude},${row.customer.address.longitude}`} target="_blank" rel="noopener noreferrer" color="text.secondary" sx={{ display: "flex", gap: 0.4, fontSize: 11, lineHeight: 1.35, textDecoration: "none", overflowWrap: "anywhere" }}><LocationOnOutlinedIcon sx={{ fontSize: 14, flexShrink: 0 }} />{customerAddress(row.customer)}</Link></Tooltip>
    <Typography color="text.secondary" sx={{ fontSize: 11, overflowWrap: "anywhere" }}>{row.customer.contact.mobile}{row.customer.contact.landline && row.customer.contact.landline !== "Sin teléfono fijo" ? ` · ${row.customer.contact.landline}` : ""}</Typography>
    <Stack direction="row" sx={{ gap: 0.75, alignItems: "center", flexWrap: "wrap", pt: 0.75 }}><ContractStatusSelect status={row.contract.status} contractId={contractSerial(row.contract)} onChange={(status) => onStatusChange(row, status)} /><Typography sx={{ fontSize: 11 }}>{formatContractDate(contractDate(row))}</Typography></Stack>
  </Stack>;
}

function CellContent({ row, column }: { row: ContractRow; column: ContractColumn }) {
  const { contract, customer } = row;
  const activeTickets = (contract.tickets ?? []).filter(ticket => ticket.status !== "Cerrado").length;
  const fields: Record<ContractColumn, ReactNode> = {
    billing: <Stack sx={{ gap: 0.35 }}><Chip label={customer.account.status} size="small" variant="outlined" color={customer.account.status === "Con deuda" ? "error" : "success"} sx={{ fontSize: 10, height: 22 }} /><Typography sx={{ fontSize: 11 }}>${customer.account.balance.toFixed(2)}</Typography><Tooltip title={customer.billing.enabled ? "Facturación habilitada" : "Facturación deshabilitada"}><ReceiptLongOutlinedIcon color={customer.billing.enabled ? "primary" : "disabled"} fontSize="small" /></Tooltip></Stack>,
    tickets: <Tooltip title={activeTickets ? `${activeTickets} tickets pendientes` : "Sin tickets pendientes"}><Typography sx={{ fontSize: 12 }}>{activeTickets || "—"}</Typography></Tooltip>,
    onu: <Typography sx={{ fontSize: 11 }}>{contract.oltEnabled ? (contract.onuId || "Sin ID ONU") : "—"}</Typography>,
    nap: <Typography sx={{ fontSize: 11 }}>{contract.nap || "—"}{contract.napPort ? ` / ${contract.napPort}` : ""}</Typography>,
    acs: <Typography color="text.disabled" sx={{ fontSize: 11 }}>—</Typography>,
    connection: <Stack sx={{ gap: 0.4 }}><Typography sx={{ fontSize: 11, fontWeight: 600 }}>{contract.accessMode || "Estática"}</Typography><Typography sx={{ fontSize: 12 }}>{contract.ipAddress || "IP dinámica"}</Typography>{contract.accessMode === "PPPoE" ? <Typography sx={{ fontSize: 11 }}>{contract.username || "Usuario sin configurar"}</Typography> : <Typography color="text.secondary" sx={{ fontSize: 11 }}>{contract.netmask || "—"}</Typography>}</Stack>,
    serial: <Stack sx={{ gap: 0.3 }}><Typography sx={{ fontSize: 11 }}>{contract.onuSerial || contract.serialNumber || contract.id}</Typography><Typography color="text.secondary" sx={{ fontSize: 11 }}>{contract.onuPort || contract.interfaceName || "Sin interfaz"}</Typography></Stack>,
    network: <Stack sx={{ gap: 0.3 }}><Typography sx={{ fontSize: 11 }}>{contract.node || "Sin nodo"}</Typography><Typography color="text.secondary" sx={{ fontSize: 11 }}>{contract.interfaceName || "Sin interfaz"}</Typography></Stack>,
    server: <Stack sx={{ gap: 0.3 }}><Typography sx={{ fontSize: 12 }}>{contract.server}</Typography>{contract.oltEnabled && <Typography color="text.secondary" sx={{ fontSize: 11 }}>OLT · {contract.olt || "Sin asignar"}</Typography>}</Stack>,
    plan: <Stack sx={{ gap: 0.3 }}><Typography sx={{ fontSize: 12, fontWeight: 600 }}>{contract.plan}</Typography><Typography color="text.secondary" sx={{ fontSize: 11 }}>${(contract.price ?? 0).toFixed(2)} · {contract.frequency || "Mensual"}</Typography></Stack>,
  };
  return fields[column];
}

export function ContractList(props: Props) {
  const chosen = props.rows.filter(row => props.selected.has(row.key)).length;
  return <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", minWidth: 0 }}>
    <TableContainer sx={{ overflowX: "auto", maxHeight: "65vh", "& th:last-of-type, & td:last-of-type": { position: "sticky", right: 0, bgcolor: "background.paper", borderLeft: "1px solid", borderColor: "divider", zIndex: 2 }, "& th:last-of-type": { zIndex: 4 }, "& .Mui-selected td:last-of-type": { bgcolor: "#B7DFEE" } }}>
      <Table size="small" stickyHeader aria-label="Contratos de clientes" sx={{ minWidth: Math.max(620, 410 + props.columns.length * 112), "& td": { py: 1.2, px: 1, fontSize: 12, verticalAlign: "top", borderColor: "divider" }, "& th": { bgcolor: "#F5F5F5", fontSize: 12, whiteSpace: "nowrap", py: 1, px: 1 } }}>
        <TableHead><TableRow><TableCell padding="checkbox"><Checkbox size="small" checked={Boolean(props.rows.length) && chosen === props.rows.length} indeterminate={chosen > 0 && chosen < props.rows.length} onChange={props.onToggleAll} slotProps={{ input: { "aria-label": "Seleccionar contratos de esta página" } }} /></TableCell><TableCell sx={{ width: 260 }}>Nombre</TableCell>{contractColumns.filter(column => props.columns.includes(column.key)).map(column => <TableCell key={column.key}>{column.label}</TableCell>)}<TableCell sx={{ width: 100 }}>Acciones</TableCell></TableRow></TableHead>
        <TableBody>{props.rows.map(row => <TableRow key={row.key} selected={props.selected.has(row.key)} hover sx={{ "&.Mui-selected": { bgcolor: "#B7DFEE" } }}>
          <TableCell padding="checkbox"><Checkbox size="small" checked={props.selected.has(row.key)} onChange={() => props.onToggle(row.key)} slotProps={{ input: { "aria-label": `Seleccionar contrato ${contractSerial(row.contract)}` } }} /></TableCell>
          <TableCell><ContractIdentity row={row} onDetail={props.onDetail} onStatusChange={props.onStatusChange} /></TableCell>
          {contractColumns.filter(column => props.columns.includes(column.key)).map(column => <TableCell key={column.key}><CellContent row={row} column={column.key} /></TableCell>)}
          <TableCell><Box sx={{ display: "flex" }}><Tooltip title="Ver"><IconButton size="small" aria-label={`Ver contrato ${contractSerial(row.contract)}`} onClick={() => props.onDetail(row)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Editar"><IconButton size="small" aria-label={`Editar contrato ${contractSerial(row.contract)}`} onClick={() => props.onEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Más acciones"><IconButton size="small" aria-label={`Más acciones contrato ${contractSerial(row.contract)}`} onClick={e => props.onMenu(row, e.currentTarget)}><MoreHorizRoundedIcon fontSize="small" /></IconButton></Tooltip></Box></TableCell>
        </TableRow>)}{props.rows.length === 0 && <TableRow><TableCell colSpan={props.columns.length + 3} sx={{ textAlign: "center", py: "48px !important" }}><Typography sx={{ fontSize: 14 }}>No hay contratos que coincidan con la búsqueda.</Typography></TableCell></TableRow>}</TableBody>
      </Table>
    </TableContainer>
    <TablePagination component="div" count={props.count} page={props.page} rowsPerPage={props.pageSize} rowsPerPageOptions={[20, 50, 100]} onPageChange={(_, page) => props.onPage(page)} onRowsPerPageChange={e => props.onPageSize(Number(e.target.value))} labelRowsPerPage="Contratos por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} sx={{ ".MuiTablePagination-toolbar": { flexWrap: "wrap", justifyContent: "end", pl: 1 }, ".MuiTablePagination-spacer": { flex: "0 1 0" } }} />
  </Box>;
}
