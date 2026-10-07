"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { GoogleMap } from "@/components/maps/google-map";
import type { Customer, CustomerContract, ServiceStatus } from "../clientes/customer-types";
import { ContractAuditSection, ContractBillingSection, ContractTicketsSection, RelatedContractsSection } from "./contract-detail-records";
import { ContractConfigurationSection, ContractConsumptionSection, ContractFields, ContractSection, ContractStatus, CustomerIdentitySection } from "./contract-detail-sections";
import { ContractStatusSelect } from "./contract-status-select";

export type ContractDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  customer: Customer | null;
  contract: CustomerContract | null;
  onStatusChange: (status: ServiceStatus) => void;
};

type DetailTab = "detalle" | "facturacion" | "consumo" | "mapa" | "auditoria";
const tabs: { value: DetailTab; label: string }[] = [
  { value: "detalle", label: "Detalle" }, { value: "facturacion", label: "Facturación" },
  { value: "consumo", label: "Consumo" }, { value: "mapa", label: "Mapa" }, { value: "auditoria", label: "Auditoría" },
];

function validPosition(latitude?: number, longitude?: number) {
  return latitude !== undefined && longitude !== undefined && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

function ContractMapSection({ customer, contract }: { customer: Customer; contract: CustomerContract }) {
  const ownPosition = validPosition(contract.latitude, contract.longitude);
  const lat = ownPosition ? contract.latitude! : customer.address.latitude;
  const lng = ownPosition ? contract.longitude! : customer.address.longitude;
  const valid = validPosition(lat, lng);
  return <ContractSection title="Ubicación del servicio">
    <ContractFields fields={[{ label: "Dirección del cliente", value: [customer.address.street, customer.address.neighborhood, customer.address.city, customer.address.state].filter(Boolean).join(", ") }, { label: "Latitud", value: valid ? lat : undefined }, { label: "Longitud", value: valid ? lng : undefined }]} />
    <Typography sx={{ my: 2, color: "text.secondary", fontSize: 13 }}>{ownPosition ? "Ubicación registrada en el contrato." : "Ubicación registrada en la ficha del cliente."}</Typography>
    {valid ? <GoogleMap ariaLabel={`Ubicación del contrato ${contract.id} de ${customer.name}`} center={{ lat, lng }} zoom={16} minHeight={360} /> : <Typography role="status" sx={{ py: 3, color: "text.secondary", fontSize: 13 }}>Sin coordenadas válidas registradas.</Typography>}
  </ContractSection>;
}

function ContractDetailContent({ onClose, onEdit, customer, contract, onStatusChange }: Omit<ContractDetailDialogProps, "open" | "customer" | "contract"> & { customer: Customer; contract: CustomerContract }) {
  const [tab, setTab] = useState<DetailTab>("detalle");
  const [confirmStatus, setConfirmStatus] = useState<ServiceStatus | null>(null);
  return <>
    <Dialog open onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="contract-detail-title" slotProps={{ paper: { sx: { borderRadius: "2px" } } }}>
      <DialogTitle component="div" sx={{ display: "flex", alignItems: "start", gap: 2, px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}><Typography id="contract-detail-title" component="h2" sx={{ fontSize: 18, fontWeight: 400, overflowWrap: "anywhere" }}>Contrato {contract.id}</Typography><Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13, overflowWrap: "anywhere" }}>{customer.name} · {contract.plan}</Typography></Box>
        <ContractStatus status={contract.status} /><Tooltip title="Cerrar"><IconButton aria-label="Cerrar detalle del contrato" size="small" onClick={onClose}><CloseRoundedIcon /></IconButton></Tooltip>
      </DialogTitle>
      <Tabs value={tab} onChange={(_, value: DetailTab) => setTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Información del contrato" sx={{ px: { xs: 1, sm: 2 }, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
        {tabs.map((item) => <Tab key={item.value} value={item.value} label={item.label} id={`contract-tab-${item.value}`} aria-controls={`contract-panel-${item.value}`} sx={{ minHeight: 44 }} />)}
      </Tabs>
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, minHeight: 360 }}>
        <Box role="tabpanel" id={`contract-panel-${tab}`} aria-labelledby={`contract-tab-${tab}`}>
          {tab === "detalle" && <><CustomerIdentitySection customer={customer} /><ContractConfigurationSection contract={contract} /><RelatedContractsSection customer={customer} contractId={contract.id} /><ContractTicketsSection contract={contract} /></>}
          {tab === "facturacion" && <ContractBillingSection customer={customer} contract={contract} />}
          {tab === "consumo" && <ContractConsumptionSection contract={contract} />}
          {tab === "mapa" && <ContractMapSection customer={customer} contract={contract} />}
          {tab === "auditoria" && <ContractAuditSection customer={customer} contract={contract} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: "1px solid", borderColor: "divider", flexWrap: "wrap", gap: 1 }}>
        <Button component="a" href={`/clientes?cliente=${encodeURIComponent(customer.id)}`} startIcon={<LaunchRoundedIcon />}>Abrir cliente</Button>
        <Box sx={{ flex: 1 }} />
        <ContractStatusSelect status={contract.status} contractId={contract.id} onChange={setConfirmStatus} />
        <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEdit} sx={{ boxShadow: "none" }}>Editar contrato</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={Boolean(confirmStatus)} onClose={() => setConfirmStatus(null)} fullWidth maxWidth="xs" aria-labelledby="contract-status-title">
      <DialogTitle id="contract-status-title">Cambiar estado del contrato</DialogTitle>
      <DialogContent><Typography sx={{ fontSize: 13 }}>Contrato {contract.id} de {customer.name}.</Typography><Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>Estado actual: {contract.status}. Nuevo estado: {confirmStatus}.</Typography></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}><Button color="inherit" onClick={() => setConfirmStatus(null)}>Cancelar</Button><Button variant="contained" onClick={() => { if (confirmStatus) onStatusChange(confirmStatus); setConfirmStatus(null); }}>Confirmar</Button></DialogActions>
    </Dialog>
  </>;
}

export function ContractDetailDialog({ open, customer, contract, ...props }: ContractDetailDialogProps) {
  if (!open || !customer || !contract) return null;
  return <ContractDetailContent key={`${customer.id}-${contract.id}`} {...props} customer={customer} contract={contract} />;
}
