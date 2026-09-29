"use client";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { GoogleMap } from "@/components/maps/google-map";
import { CustomerConsumptionChart } from "./customer-consumption-chart";
import type { Customer, CustomerDetailTab, ServiceStatus } from "./customer-types";

type CustomerDetailPanelProps = {
  customer: Customer | null;
  tab: CustomerDetailTab;
  mobile?: boolean;
  onTabChange: (tab: CustomerDetailTab) => void;
  onClose?: () => void;
  onEdit: (customer: Customer) => void;
  onOpenProfile?: (customer: Customer) => void;
  onOpenAccount?: (customer: Customer) => void;
};

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

const tabItems: { value: CustomerDetailTab; label: string; icon: React.ReactElement }[] = [
  { value: "detalle", label: "Detalle", icon: <RouterOutlinedIcon /> },
  { value: "consumo", label: "Consumo", icon: <AnalyticsOutlinedIcon /> },
  { value: "mapa", label: "Mapa", icon: <MapOutlinedIcon /> },
  { value: "pagos", label: "Pagos", icon: <PaymentsOutlinedIcon /> },
  { value: "app", label: "App", icon: <SmartphoneOutlinedIcon /> },
  { value: "auditoria", label: "Auditoría", icon: <FactCheckOutlinedIcon /> },
];

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.4 }}>
      <Typography component="h3" sx={{ color: "text.primary", fontSize: "0.72rem", fontWeight: 780, letterSpacing: "0.055em", textTransform: "uppercase" }}>{children}</Typography>
      {action}
    </Box>
  );
}

function Field({ label, value, full = false }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <Box sx={{ minWidth: 0, gridColumn: full ? "1 / -1" : undefined }}>
      <Typography sx={{ color: "text.secondary", fontSize: "0.65rem", lineHeight: 1.2 }}>{label}</Typography>
      <Typography component="div" sx={{ mt: 0.32, overflowWrap: "anywhere", fontSize: "0.78rem", fontWeight: 650, lineHeight: 1.42 }}>{value}</Typography>
    </Box>
  );
}

function statusColors(status: ServiceStatus) {
  if (status === "Suspendido") return { color: "#9D3434", backgroundColor: "#FFF0F0" };
  if (status === "Degradado") return { color: "#8A5A12", backgroundColor: "#FFF6E5" };
  if (status === "Alertado") return { color: "#7D5F08", backgroundColor: "#FFF9DB" };
  return { color: "#14705E", backgroundColor: "#EAF8F4" };
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Box sx={{ display: "grid", minHeight: 260, placeItems: "center", px: 2.5, textAlign: "center" }}>
      <Box>
        <Box sx={{ display: "grid", width: 48, height: 48, placeItems: "center", mx: "auto", color: "primary.main", backgroundColor: "#EAF3FC", borderRadius: "2px", "& svg": { fontSize: 24 } }}>{icon}</Box>
        <Typography sx={{ mt: 1.5, fontSize: "0.86rem", fontWeight: 750 }}>{title}</Typography>
        <Typography sx={{ maxWidth: 290, mt: 0.6, color: "text.secondary", fontSize: "0.72rem", lineHeight: 1.55 }}>{body}</Typography>
      </Box>
    </Box>
  );
}

function CustomerDetail({ customer, onOpenAccount }: { customer: Customer; onOpenAccount?: (customer: Customer) => void }) {
  return (
    <Box sx={{ py: 2 }}>
      <SectionTitle>Información del cliente</SectionTitle>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.55, p: 1.5, backgroundColor: "#F7FAFC", borderRadius: "2px" }}>
        <Field label="Identificación" value={customer.document} />
        <Field label="ID personalizable" value={customer.customId} />
        <Field label="Teléfono" value={customer.contact.mobile} />
        <Field label="Correo" value={customer.contact.email} />
        <Field label="Dirección" value={`${customer.address.street}, ${customer.address.neighborhood}`} full />
      </Box>

      <Divider sx={{ my: 2 }} />
      <SectionTitle action={<Chip label={`${customer.contracts.length} ${customer.contracts.length === 1 ? "contrato" : "contratos"}`} size="small" sx={{ height: 23, fontSize: "0.62rem", fontWeight: 700 }} />}>Contratos</SectionTitle>
      <Box sx={{ display: "grid", gap: 1 }}>
        {customer.contracts.map((contract) => {
          const colors = statusColors(contract.status);
          return (
            <Box key={contract.id} sx={{ p: 1.35, border: "1px solid", borderColor: "divider", borderRadius: "2px" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: "0.79rem", fontWeight: 750 }}>{contract.plan}</Typography><Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.66rem" }}>{contract.id} · {contract.node}</Typography></Box>
                <Chip label={contract.status} size="small" sx={{ height: 22, color: colors.color, backgroundColor: colors.backgroundColor, fontSize: "0.59rem", fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.2, mt: 1.3 }}><Field label="Dirección IP" value={contract.ipAddress} /><Field label="Servidor" value={contract.server} /></Box>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />
      <SectionTitle>Cuenta corriente</SectionTitle>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, p: 1.4, backgroundColor: "#F7FAFC", borderRadius: "2px" }}><Field label="Balance" value={currency.format(customer.account.balance)} /><Field label="Crédito" value={currency.format(customer.account.credit)} /><Field label="Impagas" value={customer.account.unpaidInvoices ?? 0} /></Box>
      {onOpenAccount && <Button fullWidth variant="outlined" startIcon={<AccountBalanceWalletOutlinedIcon />} onClick={() => onOpenAccount(customer)} sx={{ mt: 1.25 }}>Ver movimientos</Button>}
    </Box>
  );
}

function Consumption({ customer }: { customer: Customer }) {
  const hasContracts = customer.contracts.length > 0;

  return (
    <Box sx={{ py: 2 }}>
      <SectionTitle action={<Chip label="Datos demostrativos" size="small" sx={{ height: 23, color: "#8F5700", backgroundColor: "#FFF1D4", fontSize: "0.59rem", fontWeight: 700 }} />}>Consumo del último día</SectionTitle>
      <Typography sx={{ mb: 1.35, color: "text.secondary", fontSize: "0.69rem", lineHeight: 1.5 }}>
        Vista de referencia para validar zoom, lectura y exportación. Se reemplazará por telemetría real al conectar el contrato con su servidor.
      </Typography>
      <Box sx={{ display: "flex", gap: 0.75, mb: 1.5, overflowX: "auto" }}>{customer.contracts.map((contract, index) => <Chip key={contract.id} label={`${contract.plan} · ${contract.ipAddress}`} color={index === 0 ? "primary" : "default"} variant={index === 0 ? "filled" : "outlined"} size="small" sx={{ flexShrink: 0, height: 27, fontSize: "0.63rem" }} />)}</Box>
      {hasContracts ? (
        <Box sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: "2px", backgroundColor: "#FFFFFF" }}>
          <CustomerConsumptionChart customer={customer} />
        </Box>
      ) : (
        <Box sx={{ border: "1px dashed #BDD0E2", borderRadius: "2px", backgroundColor: "#FAFCFE" }}><EmptyState icon={<TimelineRoundedIcon />} title="Sin contrato para graficar" body="Asigna un contrato de servicio para preparar esta vista de consumo." /></Box>
      )}
    </Box>
  );
}

function CustomerMap({ customer }: { customer: Customer }) {
  const marker = {
    id: customer.id,
    label: "C",
    title: customer.name,
    position: { lat: customer.address.latitude, lng: customer.address.longitude },
    radiusMeters: 420,
  };

  return (
    <Box sx={{ py: 2 }}>
      <SectionTitle>Ubicación del servicio</SectionTitle>
      <Box sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: "2px" }}>
        <GoogleMap
          ariaLabel={`Mapa de ubicación de ${customer.name}`}
          center={marker.position}
          markers={[marker]}
          selectedMarkerId={marker.id}
          zoom={15}
          minHeight={310}
        />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.35, mt: 1.5 }}><Field label="Dirección" value={`${customer.address.street}, ${customer.address.neighborhood}`} full /><Field label="Latitud" value={customer.address.latitude.toFixed(6)} /><Field label="Longitud" value={customer.address.longitude.toFixed(6)} /></Box>
    </Box>
  );
}

function CustomerPayments({ customer }: { customer: Customer }) {
  const gateways = customer.gatewayAccounts ?? [];
  return (
    <Box sx={{ py: 2 }}>
      <SectionTitle>Pasarelas de pago</SectionTitle>
      {gateways.length === 0 ? <EmptyState icon={<PaymentsOutlinedIcon />} title="Sin pasarelas asignadas" body="Las cuentas de cobro digital vinculadas a este cliente se mostrarán aquí." /> : <Box sx={{ display: "grid", gap: 1 }}>{gateways.map((gateway) => <Box key={gateway.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "2px" }}><Box><Typography sx={{ fontSize: "0.81rem", fontWeight: 750 }}>{gateway.name}</Typography><Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.66rem" }}>{gateway.notifyInvoices ? "Recibe nuevas facturas" : "Sin notificación automática"}</Typography></Box><Chip label={gateway.enabled ? "Habilitada" : "Deshabilitada"} color={gateway.enabled ? "primary" : "default"} size="small" sx={{ height: 23, fontSize: "0.61rem", fontWeight: 700 }} /></Box>)}</Box>}
    </Box>
  );
}

function CustomerApp({ customer }: { customer: Customer }) {
  const devices = customer.deviceRecords ?? [];
  return (
    <Box sx={{ py: 2 }}>
      <SectionTitle>App del cliente</SectionTitle>
      <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "2px" }}><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ display: "grid", width: 76, height: 76, flex: "0 0 76px", placeItems: "center", color: "primary.main", backgroundColor: "#F5F9FD", borderRadius: "2px" }}><QrCode2RoundedIcon sx={{ fontSize: 58 }} /></Box><Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 750 }}>Enlace de acceso</Typography><Typography sx={{ mt: 0.35, overflow: "hidden", color: "text.secondary", fontSize: "0.66rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.portalLink ?? "No disponible"}</Typography><Button size="small" startIcon={<ContentCopyRoundedIcon />} disabled={!customer.portalLink} onClick={() => customer.portalLink && navigator.clipboard?.writeText(customer.portalLink)} sx={{ mt: 0.7 }}>Copiar enlace</Button></Box></Box></Box>
      <Divider sx={{ my: 2 }} /><SectionTitle>Dispositivos</SectionTitle>
      {devices.length === 0 ? <EmptyState icon={<DevicesOtherOutlinedIcon />} title="Sin dispositivos vinculados" body="Los teléfonos registrados para notificaciones aparecerán en esta sección." /> : devices.map((device) => <Box key={device.id} sx={{ minWidth: 0, p: 1.4, border: "1px solid", borderColor: "divider", borderRadius: "2px" }}><Typography sx={{ fontSize: "0.78rem", fontWeight: 750 }}>{device.name}</Typography><Typography sx={{ mt: 0.35, overflowWrap: "anywhere", color: "text.secondary", fontSize: "0.65rem" }}>{device.pushToken}</Typography><Typography sx={{ mt: 0.6, color: "text.secondary", fontSize: "0.63rem" }}>Creado el {device.createdAt}</Typography></Box>)}
    </Box>
  );
}

function CustomerAudit({ customer }: { customer: Customer }) {
  return (
    <Box component="section" sx={{ py: 2.25 }}>
      <Typography component="h3" sx={{ pb: 1.15, borderBottom: "1px solid", borderColor: "divider", fontSize: "1.12rem", fontWeight: 520 }}>Auditoría</Typography>
      <Box component="ol" sx={{ position: "relative", m: 0, mt: 1.75, pl: 0, listStyle: "none", "&::before": { content: '""', position: "absolute", top: 16, bottom: 16, left: 16, width: 1, backgroundColor: "#D7DEE5" } }}>
        {customer.audit.map((event, index) => {
          const created = event.action.toLocaleLowerCase("es-MX").includes("cread");
          return (
            <Box key={event.id} component="li" sx={{ position: "relative", display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: 1.1, pb: index < customer.audit.length - 1 ? 1.75 : 0 }}>
              <Box aria-hidden="true" sx={{ position: "relative", zIndex: 1, display: "grid", width: 34, height: 34, placeItems: "center", color: "#FFFFFF", backgroundColor: created ? "primary.main" : "#2EAF62", border: "3px solid #FFFFFF", borderRadius: "50%", boxShadow: "0 0 0 1px #D7DEE5", "& svg": { fontSize: 16 } }}>{created ? <FactCheckOutlinedIcon /> : <EditOutlinedIcon />}</Box>
              <Box sx={{ position: "relative", minWidth: 0, p: 1.6, backgroundColor: "#F5F5F5", boxShadow: "2px 3px 8px rgba(0,0,0,.08)", "&::before": { content: '""', position: "absolute", top: 13, left: -8, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid #F5F5F5" } }}>
                <Typography sx={{ color: "text.primary", fontSize: "0.79rem", fontWeight: 750 }}>{event.action}</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "grid", gap: 0.7 }}>
                  <Typography sx={{ overflowWrap: "anywhere", color: "text.secondary", fontSize: "0.7rem", lineHeight: 1.5 }}><Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>Nombre y apellido:</Box> {customer.name}</Typography>
                  <Typography sx={{ overflowWrap: "anywhere", color: "text.secondary", fontSize: "0.7rem", lineHeight: 1.5 }}><Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>Documento:</Box> {customer.document || "Sin dato"}</Typography>
                  {event.detail && <Typography sx={{ overflowWrap: "anywhere", color: "text.secondary", fontSize: "0.7rem", lineHeight: 1.5 }}>{event.detail}</Typography>}
                </Box>
                <Typography sx={{ mt: 1.25, pt: 0.9, borderTop: "1px solid", borderColor: "divider", color: "text.secondary", fontSize: "0.64rem", textAlign: "right" }}>{event.actor} · {event.date}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function CustomerDetailPanel({ customer, tab, mobile = false, onTabChange, onClose, onEdit, onOpenProfile, onOpenAccount }: CustomerDetailPanelProps) {
  if (!customer) return <EmptyState icon={<DevicesOtherOutlinedIcon />} title="Selecciona un cliente" body="Consulta sus contratos, ubicación, acceso móvil y actividad desde este panel." />;
  return (
    <Box component="aside" aria-label={`Detalle de ${customer.name}`} sx={{ display: "flex", height: mobile ? "100dvh" : "min(calc(100dvh - 112px), 860px)", minHeight: mobile ? 0 : 560, flexDirection: "column", overflow: "hidden", backgroundColor: "background.paper", border: 0, borderRadius: 0, boxShadow: mobile ? "none" : "3px 3px 8px rgba(0,0,0,.18)" }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.45 }}><Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}><Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ color: "text.secondary", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.055em", textTransform: "uppercase" }}>{customer.kind}</Typography><Typography component="h2" sx={{ mt: 0.35, fontSize: "1.04rem", fontWeight: 760, lineHeight: 1.25, letterSpacing: "-0.015em" }}>{customer.name}</Typography><Typography sx={{ mt: 0.35, color: "text.secondary", fontSize: "0.68rem" }}>{customer.customId} · {customer.document}</Typography></Box>{onOpenProfile && <Tooltip title="Abrir ficha completa"><IconButton aria-label={`Abrir ficha completa de ${customer.name}`} onClick={() => onOpenProfile(customer)} sx={{ width: 34, height: 34, borderRadius: "2px" }}><LaunchRoundedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>}<Tooltip title="Editar cliente"><IconButton aria-label={`Editar ${customer.name}`} onClick={() => onEdit(customer)} sx={{ width: 34, height: 34, borderRadius: "2px" }}><EditOutlinedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>{mobile && onClose && <IconButton aria-label="Cerrar detalle" onClick={onClose} sx={{ width: 34, height: 34, borderRadius: "2px" }}><CloseRoundedIcon sx={{ fontSize: 18 }} /></IconButton>}</Box></Box>
      <Tabs value={tab} onChange={(_, value: CustomerDetailTab) => onTabChange(value)} variant="fullWidth" aria-label="Vistas del cliente" sx={{ minHeight: 48, px: 0.5, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", "& .MuiTab-root": { minWidth: 0, minHeight: 48, px: 0.5 }, "& .MuiTab-icon": { m: "0 !important", fontSize: 18 } }}>{tabItems.map((item) => <Tab key={item.value} value={item.value} aria-label={item.label} icon={<Tooltip title={item.label}><Box component="span" sx={{ display: "grid", placeItems: "center" }}>{item.icon}</Box></Tooltip>} />)}</Tabs>
      <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto", px: 2, scrollbarGutter: "stable" }}>{tab === "detalle" && <CustomerDetail customer={customer} onOpenAccount={onOpenAccount} />}{tab === "consumo" && <Consumption customer={customer} />}{tab === "mapa" && <CustomerMap customer={customer} />}{tab === "pagos" && <CustomerPayments customer={customer} />}{tab === "app" && <CustomerApp customer={customer} />}{tab === "auditoria" && <CustomerAudit customer={customer} />}</Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 2, py: 1.15, borderTop: "1px solid", borderColor: "divider", backgroundColor: "#FBFCFE" }}><Typography sx={{ color: "text.secondary", fontSize: "0.64rem" }}>Creado el {customer.createdAt}</Typography><Button size="small" onClick={() => onTabChange("auditoria")} startIcon={<FactCheckOutlinedIcon />} sx={{ fontSize: "0.67rem" }}>Auditoría</Button></Box>
    </Box>
  );
}
