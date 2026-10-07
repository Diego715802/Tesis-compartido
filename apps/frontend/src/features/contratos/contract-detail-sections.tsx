"use client";

import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState, type ReactNode } from "react";
import type { Customer, CustomerContract, ServiceStatus } from "../clientes/customer-types";

export const contractCurrency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const consumptionNumber = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

export function ContractSection({ title, children }: { title: string; children: ReactNode }) {
  return <Box component="section" sx={{ mb: 3 }}><Typography component="h3" sx={{ mb: 1.5, pb: 1, borderBottom: "1px solid", borderColor: "divider", fontSize: 14, fontWeight: 600 }}>{title}</Typography>{children}</Box>;
}

export function ContractFields({ fields }: { fields: { label: string; value?: ReactNode }[] }) {
  return <Box component="dl" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 2, m: 0 }}>
    {fields.map(({ label, value }) => <Box key={label} sx={{ minWidth: 0 }}><Typography component="dt" sx={{ color: "text.secondary", fontSize: 12 }}>{label}</Typography><Typography component="dd" sx={{ m: 0, mt: 0.5, fontSize: 13, overflowWrap: "anywhere" }}>{value === undefined || value === null || value === "" ? "Sin registrar" : value}</Typography></Box>)}
  </Box>;
}

export function ContractStatus({ status }: { status: ServiceStatus }) {
  const color = status === "Habilitado" ? "success" : status === "Suspendido" ? "error" : status === "Alertado" || status === "Degradado" ? "warning" : "default";
  return <Chip size="small" label={status} color={color} variant="outlined" />;
}

function ContractSecret({ value, label }: { value?: string; label: string }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <>Sin registrar</>;
  return <Box sx={{ display: "flex", gap: 1, alignItems: "center", minHeight: 32 }}><Box component="span" sx={{ overflowWrap: "anywhere" }}>{visible ? value : "********"}</Box><Tooltip title={visible ? `Ocultar ${label}` : `Mostrar ${label}`}><IconButton size="small" aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`} onClick={() => setVisible(!visible)}>{visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}</IconButton></Tooltip></Box>;
}

export function CustomerIdentitySection({ customer }: { customer: Customer }) {
  const address = [customer.address.street, customer.address.number, customer.address.neighborhood, customer.address.city, customer.address.state, customer.address.postalCode].filter(Boolean).join(", ");
  return <>
    <ContractSection title="Cliente"><ContractFields fields={[
      { label: "Nombre completo", value: customer.name }, { label: "ID de cliente", value: customer.id },
      { label: "ID personalizado", value: customer.customId }, { label: "Tipo de cliente", value: customer.kind },
      { label: "Documento", value: customer.document }, { label: "Correo", value: customer.contact.email },
      { label: "Teléfono móvil", value: customer.contact.mobile }, { label: "Teléfono fijo", value: customer.contact.landline },
      { label: "Dirección", value: address }, { label: "Datos adicionales de dirección", value: customer.address.additionalData },
      { label: "Zona", value: customer.assignment.zone }, { label: "Vendedor", value: customer.assignment.seller },
      { label: "Recaudador", value: customer.assignment.collector }, { label: "Fecha de alta", value: customer.createdAt },
      { label: "Observaciones del cliente", value: customer.notes },
    ]} /></ContractSection>
    <ContractSection title="Cuenta del cliente"><ContractFields fields={[
      { label: "Estado de pagos", value: customer.account.status },
      { label: "Saldo pendiente", value: contractCurrency.format(customer.account.balance) },
      { label: "Saldo a favor", value: contractCurrency.format(customer.account.credit) },
      { label: "Facturas impagas", value: customer.account.unpaidInvoices },
    ]} /></ContractSection>
  </>;
}

export function ContractConfigurationSection({ contract }: { contract: CustomerContract }) {
  return <>
    <ContractSection title="Contrato"><ContractFields fields={[
      { label: "Número de contrato", value: contract.id }, { label: "Número de serie", value: contract.serialNumber },
      { label: "Plan", value: contract.plan }, { label: "Estado", value: <ContractStatus status={contract.status} /> },
      { label: "Precio", value: contract.price === undefined ? undefined : contractCurrency.format(contract.price) },
      { label: "Frecuencia", value: contract.frequency }, { label: "Fecha de creación", value: contract.createdAt },
      { label: "Fecha de inicio", value: contract.startsAt }, { label: "Última actualización", value: contract.updatedAt },
      { label: "Observaciones del contrato", value: contract.notes },
    ]} /></ContractSection>
    <ContractSection title="Conexión y acceso"><ContractFields fields={[
      { label: "Servidor", value: contract.server }, { label: "Nodo", value: contract.node },
      { label: "Interfaz", value: contract.interfaceName }, { label: "Modo de conexión", value: contract.accessMode },
      { label: "Tipo de host", value: contract.hostType }, { label: "Dirección IP", value: contract.ipAddress },
      { label: "Dirección MAC", value: contract.macAddress }, { label: "Máscara", value: contract.netmask },
      { label: "Puerta de enlace", value: contract.gateway }, { label: "DNS primario", value: contract.dnsPrimary },
      { label: "DNS secundario", value: contract.dnsSecondary }, { label: "Usuario", value: contract.username },
      { label: "Contraseña de acceso", value: <ContractSecret value={contract.password} label="contraseña de acceso" /> },
      { label: "Contraseña WiFi", value: <ContractSecret value={contract.wifiPassword} label="contraseña WiFi" /> },
      { label: "Cola padre", value: contract.parentQueue }, { label: "Prioridad", value: contract.priority },
      { label: "Control de ancho de banda", value: contract.bandwidthControl === undefined ? undefined : contract.bandwidthControl ? "Habilitado" : "Deshabilitado" },
      { label: "Perfil PPP", value: contract.pppProfile }, { label: "Servidor PPPoE", value: contract.pppoeServer },
      { label: "Red", value: contract.network }, { label: "Dirección Full NAT", value: contract.fullNatAddress },
    ]} /></ContractSection>
    {(contract.oltEnabled || contract.cableModemEnabled) && <ContractSection title="Equipamiento"><ContractFields fields={[
      { label: "OLT", value: contract.olt }, { label: "Serial ONU", value: contract.onuSerial },
      { label: "Puerto ONU", value: contract.onuPort }, { label: "NAP", value: contract.nap },
      { label: "Cable módem", value: contract.cableModemId },
    ]} /></ContractSection>}
  </>;
}

export function ContractConsumptionSection({ contract }: { contract: CustomerContract }) {
  const download = Number.isFinite(contract.downstreamGb) ? Math.max(0, contract.downstreamGb) : 0;
  const upload = Number.isFinite(contract.upstreamGb) ? Math.max(0, contract.upstreamGb) : 0;
  const total = download + upload;
  return <ContractSection title="Resumen de consumo">
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
      {[{ label: "Bajada", value: download }, { label: "Subida", value: upload }, { label: "Total", value: total }].map((item) => <Box key={item.label}><Typography sx={{ color: "text.secondary", fontSize: 12 }}>{item.label}</Typography><Typography sx={{ mt: 1, fontSize: 24, fontVariantNumeric: "tabular-nums" }}>{consumptionNumber.format(item.value)} GB</Typography>{item.label !== "Total" && <LinearProgress aria-label={`Proporción de ${item.label.toLowerCase()}`} variant="determinate" value={total > 0 ? item.value / total * 100 : 0} color={item.label === "Bajada" ? "primary" : "secondary"} sx={{ mt: 1, height: 6 }} />}</Box>)}
    </Box>
    <Typography sx={{ mt: 3, color: "text.secondary", fontSize: 13 }}>Valores acumulados registrados en el contrato. Período de medición no informado.</Typography>
    <Typography role="status" sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>Sin muestras de tráfico disponibles para mostrar una gráfica por fecha.</Typography>
  </ContractSection>;
}
