"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import type { Customer, CustomerContract, CustomerTicket } from "./customer-types";

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const panelSx = { p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: "2px", backgroundColor: "#FFFFFF" } as const;

function DialogHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, pb: 1 }}><Box><Typography component="span" sx={{ fontSize: "1rem", fontWeight: 760 }}>{title}</Typography><Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.69rem", fontWeight: 400 }}>{subtitle}</Typography></Box><IconButton aria-label="Cerrar" onClick={onClose} sx={{ borderRadius: "2px" }}><CloseRoundedIcon /></IconButton></DialogTitle>;
}

export function AccountDialog({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const debt = customer.account.balance > 0;
  const transactions = customer.account.transactions ?? [];
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogHeader title={`Cuenta corriente · ${customer.name}`} subtitle={customer.customId} onClose={onClose} />
      <DialogContent sx={{ pt: 1.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.25 }}>
          {[{ label: "Balance C/C", value: currency.format(customer.account.balance), tone: debt ? "#A13A3A" : "#14705E" }, { label: "Crédito disponible", value: currency.format(customer.account.credit), tone: "text.primary" }, { label: "Facturas impagas", value: String(customer.account.unpaidInvoices ?? 0), tone: debt ? "#A13A3A" : "text.primary" }].map((item) => <Box key={item.label} sx={{ p: 2, textAlign: "center", backgroundColor: "#F7FAFC", borderRadius: "2px" }}><Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>{item.label}</Typography><Typography sx={{ mt: 0.45, color: item.tone, fontSize: "1.25rem", fontWeight: 760, fontVariantNumeric: "tabular-nums" }}>{item.value}</Typography></Box>)}
        </Box>
        <Typography component="h3" sx={{ mt: 2.5, mb: 1, fontSize: "0.78rem", fontWeight: 760 }}>Movimientos</Typography>
        {transactions.length === 0 ? <Box sx={{ display: "grid", minHeight: 230, placeItems: "center", backgroundColor: "#F8FAFC", borderRadius: "2px", textAlign: "center" }}><Box><WarningAmberRoundedIcon sx={{ color: "text.disabled", fontSize: 30 }} /><Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: "0.82rem", fontWeight: 700 }}>Sin transacciones</Typography></Box></Box> : <Box sx={{ overflowX: "auto", border: "1px solid", borderColor: "divider", borderRadius: "2px" }}><Table size="small"><TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Concepto</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Importe</TableCell></TableRow></TableHead><TableBody>{transactions.map((transaction) => <TableRow key={transaction.id}><TableCell>{transaction.date}</TableCell><TableCell>{transaction.concept}</TableCell><TableCell>{transaction.type}</TableCell><TableCell align="right">{currency.format(transaction.amount)}</TableCell></TableRow>)}</TableBody></Table></Box>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onClose}>Cerrar</Button></DialogActions>
    </Dialog>
  );
}

export function ImportCustomersDialog({ onClose, onImport }: { onClose: () => void; onImport: (fileName: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeader title="Actualizar desde archivo" subtitle="Importa altas o actualizaciones masivas en formato CSV." onClose={onClose} />
      <DialogContent>
        <Box component="button" type="button" aria-label="Seleccionar archivo CSV" onClick={() => inputRef.current?.click()} sx={{ display: "grid", width: "100%", minHeight: 220, placeItems: "center", px: 3, cursor: "pointer", color: "text.primary", font: "inherit", textAlign: "center", border: "1px dashed #AFC5D9", borderRadius: "2px", backgroundColor: "#F8FBFD", "&:hover": { borderColor: "primary.main", backgroundColor: "#F3F8FD" }, "&:focus-visible": { outline: "3px solid rgba(11,107,220,.24)", outlineOffset: 2 } }}>
          <Box><CloudUploadOutlinedIcon sx={{ color: "primary.main", fontSize: 36 }} /><Typography sx={{ mt: 1, fontSize: "0.86rem", fontWeight: 750 }}>{file ? file.name : "Selecciona un archivo CSV"}</Typography><Typography sx={{ mt: 0.55, color: "text.secondary", fontSize: "0.7rem" }}>El archivo se validará antes de aplicar cambios.</Typography></Box>
        </Box>
        <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <Typography sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.68rem", lineHeight: 1.5 }}>Columnas sugeridas: ID, nombre, documento, correo, teléfono, dirección, zona y plan.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}><Button color="inherit" onClick={onClose}>Cancelar</Button><Button variant="contained" disabled={!file} onClick={() => file && onImport(file.name)} sx={{ boxShadow: "none" }}>Validar archivo</Button></DialogActions>
    </Dialog>
  );
}

function ContractDialog({ customer, onClose, onSave }: { customer: Customer; onClose: () => void; onSave: (contract: CustomerContract) => void }) {
  const [tab, setTab] = useState("servicio");
  const [plan, setPlan] = useState("Fibra 100");
  const [server, setServer] = useState("Core Centro");
  const [node, setNode] = useState("Nodo Centro");
  const [ip, setIp] = useState("");
  const [price, setPrice] = useState("499");
  const [accessMode, setAccessMode] = useState<CustomerContract["accessMode"]>("Estática");
  const [interfaceName, setInterfaceName] = useState("");
  function save() {
    onSave({ id: `CTR-${Date.now()}`, plan, server, node, ipAddress: ip || "Pendiente de asignación", status: "Habilitado", downstreamGb: 0, upstreamGb: 0, price: Number(price), frequency: "Mensual", accessMode, hostType: "Host", interfaceName, netmask: "255.255.255.0", invoices: [], items: [], tickets: [] });
  }
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md"><DialogHeader title="Crear contrato" subtitle={`Servicio nuevo para ${customer.name}`} onClose={onClose} /><Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 3, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}><Tab value="servicio" label="Servicio" /><Tab value="red" label="Red" /><Tab value="facturacion" label="Facturación" /></Tabs><DialogContent sx={{ pt: 2 }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>{tab === "servicio" && <><TextField disabled label="Cliente" value={customer.name} /><TextField select label="Estado" value="Habilitado"><MenuItem value="Habilitado">Habilitado</MenuItem></TextField><TextField label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} /><TextField label="Servidor" value={server} onChange={(e) => setServer(e.target.value)} /><TextField label="Nodo / cobertura" value={node} onChange={(e) => setNode(e.target.value)} /></>}{tab === "red" && <><TextField select label="Modo" value={accessMode} onChange={(e) => setAccessMode(e.target.value as CustomerContract["accessMode"])}><MenuItem value="Estática">Estática</MenuItem><MenuItem value="PPPoE">PPPoE</MenuItem><MenuItem value="DHCP">DHCP</MenuItem></TextField><TextField label="Dirección IP" value={ip} onChange={(e) => setIp(e.target.value)} /><TextField label="Interfaz" value={interfaceName} onChange={(e) => setInterfaceName(e.target.value)} /><TextField label="Máscara de red" value="255.255.255.0" /><TextField label="Puerta de enlace" /><TextField label="Dirección MAC" /><TextField label="DNS primario" /><TextField label="DNS secundario" /></>}{tab === "facturacion" && <><TextField type="number" label="Precio mensual" value={price} onChange={(e) => setPrice(e.target.value)} /><TextField select label="Frecuencia" value="Mensual"><MenuItem value="Mensual">Mensual</MenuItem></TextField><TextField label="Perfil de facturación" value="Básico" /><TextField label="Día de vencimiento" value="4" /></>}</Box></DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button color="inherit" onClick={onClose}>Cancelar</Button><Button variant="contained" onClick={save} disabled={!plan.trim()} sx={{ boxShadow: "none" }}>Crear contrato</Button></DialogActions></Dialog>
  );
}

function TicketDialog({ customer, onClose, onSave }: { customer: Customer; onClose: () => void; onSave: (contractId: string, ticket: CustomerTicket) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Soporte técnico");
  const [priority, setPriority] = useState<CustomerTicket["priority"]>("Baja");
  const [description, setDescription] = useState("");
  const [contractId, setContractId] = useState(customer.contracts[0]?.id ?? "");
  const [attempted, setAttempted] = useState(false);
  const titleError = attempted && title.trim().length < 3;

  function saveTicket() {
    if (title.trim().length < 3) {
      setAttempted(true);
      window.setTimeout(() => document.getElementById("ticket-field-title")?.focus(), 0);
      return;
    }
    onSave(contractId, { id: `TKT-${Date.now()}`, title: title.trim(), category, priority, status: "Abierto", createdAt: new Date().toISOString().slice(0, 10) });
  }

  return <Dialog open onClose={onClose} fullWidth maxWidth="md"><DialogHeader title="Crear ticket" subtitle={`Atención para ${customer.name}`} onClose={onClose} /><DialogContent sx={{ pt: 1.5 }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}><TextField id="ticket-field-title" required label="Título" value={title} error={titleError} helperText={titleError ? "Escribe un título de al menos 3 caracteres." : ""} onChange={(e) => setTitle(e.target.value)} /><TextField select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}><MenuItem value="Soporte técnico">Soporte técnico</MenuItem><MenuItem value="Facturación">Facturación</MenuItem><MenuItem value="Instalación">Instalación</MenuItem></TextField><TextField select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value as CustomerTicket["priority"])}><MenuItem value="Baja">Baja</MenuItem><MenuItem value="Media">Media</MenuItem><MenuItem value="Alta">Alta</MenuItem></TextField><TextField select label="Contrato" value={contractId} onChange={(event) => setContractId(event.target.value)}>{customer.contracts.map((contract) => <MenuItem key={contract.id} value={contract.id}>{contract.plan} · {contract.id}</MenuItem>)}</TextField><TextField multiline minRows={4} label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ gridColumn: { sm: "1 / -1" } }} /></Box></DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button color="inherit" onClick={onClose}>Cancelar</Button><Button variant="contained" onClick={saveTicket} disabled={!contractId} sx={{ boxShadow: "none" }}>Crear ticket</Button></DialogActions></Dialog>;
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.25 }}><Typography component="h3" sx={{ fontSize: "0.9rem", fontWeight: 770 }}>{title}</Typography>{action}</Box>;
}

export function CustomerProfileDialog({ customer, onClose, onEdit, onOpenAccount, onUpdate }: { customer: Customer; onClose: () => void; onEdit: () => void; onOpenAccount: () => void; onUpdate: (customer: Customer) => void }) {
  const [contractOpen, setContractOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const allTickets = customer.contracts.flatMap((contract) => contract.tickets ?? []);
  const allInvoices = customer.contracts.flatMap((contract) => contract.invoices ?? []);
  return (
    <>
      <Dialog open onClose={onClose} fullScreen slotProps={{ paper: { sx: { backgroundColor: "#F5F8FB" } } }}>
        <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 1.25, px: { xs: 1.5, md: 3 }, py: 1.4, backgroundColor: "rgba(255,255,255,.96)", borderBottom: "1px solid", borderColor: "divider" }}><IconButton aria-label="Volver al directorio" onClick={onClose} sx={{ borderRadius: "2px" }}><ArrowBackRoundedIcon /></IconButton><Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontSize: { xs: "1rem", md: "1.16rem" }, fontWeight: 770 }}>{customer.name}</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>{customer.customId} · Ficha integral del cliente</Typography></Box><Button startIcon={<EditOutlinedIcon />} onClick={onEdit} sx={{ display: { xs: "none", sm: "inline-flex" } }}>Editar</Button><Button variant="contained" onClick={onOpenAccount} sx={{ boxShadow: "none" }}>Cuenta corriente</Button></Box>
        <DialogContent sx={{ width: "100%", maxWidth: 1500, mx: "auto", p: { xs: 1.5, md: 3 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.45fr) minmax(320px, .55fr)" }, gap: 2 }}>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={panelSx}><SectionHeader title="Información general" /><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>{[{ l: "Documento", v: customer.document }, { l: "Teléfono", v: customer.contact.mobile }, { l: "Correo", v: customer.contact.email }, { l: "Dirección", v: `${customer.address.street}, ${customer.address.neighborhood}` }, { l: "Zona", v: customer.assignment.zone }, { l: "Creado", v: customer.createdAt }].map((item) => <Box key={item.l} sx={{ minWidth: 0 }}><Typography sx={{ color: "text.secondary", fontSize: "0.65rem" }}>{item.l}</Typography><Typography sx={{ mt: 0.3, overflowWrap: "anywhere", fontSize: "0.77rem", fontWeight: 650 }}>{item.v}</Typography></Box>)}</Box>{customer.notes && <Typography sx={{ mt: 1.6, p: 1.25, overflowWrap: "anywhere", color: "text.secondary", backgroundColor: "#F7FAFC", borderRadius: "2px", fontSize: "0.71rem" }}>{customer.notes}</Typography>}</Box>
              <Box sx={panelSx}><SectionHeader title="Facturación y cuenta" action={<Button size="small" onClick={onOpenAccount}>Ver movimientos</Button>} /><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" }, gap: 1.25 }}>{[{ l: "Régimen", v: customer.billing.regime ?? "Sin definir" }, { l: "Tipo", v: customer.billing.invoiceType ?? "Sin definir" }, { l: "Impagas", v: currency.format(customer.account.balance) }, { l: "Crédito", v: currency.format(customer.account.credit) }].map((item) => <Box key={item.l} sx={{ p: 1.25, backgroundColor: "#F7FAFC", borderRadius: "2px" }}><Typography sx={{ color: "text.secondary", fontSize: "0.63rem" }}>{item.l}</Typography><Typography sx={{ mt: 0.35, fontSize: "0.77rem", fontWeight: 700 }}>{item.v}</Typography></Box>)}</Box></Box>
              <Box sx={panelSx}><SectionHeader title="Contratos" action={<Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setContractOpen(true)}>Nuevo contrato</Button>} />{customer.contracts.length === 0 ? <Typography sx={{ py: 4, color: "text.secondary", textAlign: "center", fontSize: "0.76rem" }}>Aún no hay contratos relacionados.</Typography> : <Box sx={{ display: "grid", gap: 1 }}>{customer.contracts.map((contract) => <Box key={contract.id} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.2fr .8fr .8fr auto" }, gap: 1.2, alignItems: "center", p: 1.4, backgroundColor: "#F1F7FD", borderRadius: "2px" }}><Box><Typography sx={{ fontSize: "0.8rem", fontWeight: 750 }}>{contract.plan}</Typography><Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.65rem" }}>{contract.id} · {contract.server}</Typography></Box><Box><Typography sx={{ color: "text.secondary", fontSize: "0.62rem" }}>Dirección IP</Typography><Typography sx={{ mt: 0.25, fontSize: "0.72rem", fontWeight: 650 }}>{contract.ipAddress}</Typography></Box><Box><Typography sx={{ color: "text.secondary", fontSize: "0.62rem" }}>Precio</Typography><Typography sx={{ mt: 0.25, fontSize: "0.72rem", fontWeight: 650 }}>{currency.format(contract.price ?? 0)}</Typography></Box><Chip label={contract.status} size="small" color={contract.status === "Habilitado" ? "primary" : "default"} /></Box>)}</Box>}</Box>
              <Box sx={panelSx}><SectionHeader title="Facturas" />{allInvoices.length === 0 ? <Typography sx={{ py: 3, color: "text.secondary", textAlign: "center", fontSize: "0.75rem" }}>Sin facturas relacionadas.</Typography> : <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Folio</TableCell><TableCell>Emisión</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Monto</TableCell><TableCell>Estado</TableCell></TableRow></TableHead><TableBody>{allInvoices.map((invoice) => <TableRow key={invoice.id}><TableCell>{invoice.id}</TableCell><TableCell>{invoice.issuedAt}</TableCell><TableCell>{invoice.type}</TableCell><TableCell align="right">{currency.format(invoice.amount)}</TableCell><TableCell><Chip label={invoice.status} size="small" color={invoice.status === "Pendiente" ? "warning" : "default"} /></TableCell></TableRow>)}</TableBody></Table></Box>}</Box>
              <Box sx={panelSx}><SectionHeader title="Tickets" action={<Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setTicketOpen(true)} disabled={customer.contracts.length === 0}>Nuevo ticket</Button>} />{allTickets.length === 0 ? <Typography sx={{ py: 3, color: "text.secondary", textAlign: "center", fontSize: "0.75rem" }}>El cliente no tiene tickets relacionados.</Typography> : allTickets.map((ticket) => <Box key={ticket.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 1, borderTop: "1px solid", borderColor: "divider" }}><Box><Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{ticket.title}</Typography><Typography sx={{ mt: 0.2, color: "text.secondary", fontSize: "0.64rem" }}>{ticket.category} · {ticket.createdAt}</Typography></Box><Chip label={ticket.status} size="small" /></Box>)}</Box>
            </Box>
            <Box sx={{ display: "grid", alignContent: "start", gap: 2 }}>
              <Box sx={panelSx}><SectionHeader title="Consumo del último día" /><Box sx={{ display: "grid", minHeight: 250, placeItems: "center", textAlign: "center", border: "1px dashed #BDD0E2", borderRadius: "2px", backgroundColor: "#FAFCFE" }}><Box><AnalyticsOutlinedIcon sx={{ color: "primary.main", fontSize: 30 }} /><Typography sx={{ mt: 1, fontSize: "0.78rem", fontWeight: 740 }}>Pendiente de telemetría</Typography><Typography sx={{ maxWidth: 260, mt: 0.45, color: "text.secondary", fontSize: "0.68rem", lineHeight: 1.5 }}>La gráfica se habilitará al configurar la fuente de red del contrato.</Typography></Box></Box></Box>
              <Box sx={panelSx}><SectionHeader title="App Login" /><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ display: "grid", width: 88, height: 88, flex: "0 0 88px", placeItems: "center", color: "primary.main", backgroundColor: "#F5F9FD", borderRadius: "2px" }}><QrCode2RoundedIcon sx={{ fontSize: 68 }} /></Box><Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>{customer.portalAccess ? "Acceso habilitado" : "Acceso deshabilitado"}</Typography><Button size="small" startIcon={<ContentCopyRoundedIcon />} disabled={!customer.portalLink} onClick={() => customer.portalLink && navigator.clipboard?.writeText(customer.portalLink)} sx={{ mt: 0.6 }}>Copiar enlace</Button></Box></Box><Divider sx={{ my: 1.5 }} /><Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>{customer.devices} dispositivo{customer.devices === 1 ? "" : "s"} vinculado{customer.devices === 1 ? "" : "s"}</Typography></Box>
              <Box sx={panelSx}><SectionHeader title="Pasarelas de pago" />{(customer.gatewayAccounts ?? []).length === 0 ? <Typography sx={{ py: 2.5, color: "text.secondary", textAlign: "center", fontSize: "0.72rem" }}>Sin pasarelas asociadas.</Typography> : customer.gatewayAccounts?.map((gateway) => <Box key={gateway.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}><Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{gateway.name}</Typography><Chip label={gateway.enabled ? "Habilitada" : "Deshabilitada"} size="small" /></Box>)}</Box>
              <Box sx={panelSx}><SectionHeader title="Perfil de facturación" /><Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>{customer.billing.legalEntity}</Typography><Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: "0.68rem", lineHeight: 1.55 }}>Ciclo: día {customer.billing.billingDay ?? 1}<br />Método: {customer.billing.paymentMethod ?? "Por definir"}<br />CFDI: {customer.billing.cfdiUse ?? "Sin definir"}</Typography></Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {contractOpen && <ContractDialog customer={customer} onClose={() => setContractOpen(false)} onSave={(contract) => { onUpdate({ ...customer, contracts: [...customer.contracts, contract] }); setContractOpen(false); }} />}
      {ticketOpen && <TicketDialog customer={customer} onClose={() => setTicketOpen(false)} onSave={(contractId, ticket) => { onUpdate({ ...customer, contracts: customer.contracts.map((contract) => contract.id === contractId ? { ...contract, tickets: [...(contract.tickets ?? []), ticket] } : contract) }); setTicketOpen(false); }} />}
    </>
  );
}
