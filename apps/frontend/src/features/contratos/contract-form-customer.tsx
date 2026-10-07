"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { GoogleMap } from "@/components/maps/google-map";
import type { Customer } from "../clientes/customer-types";
import { fieldSx, formGrid } from "./contract-form-fields";

const money = (amount: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);

export function ContractCustomerInformation({ customer }: { customer?: Customer }) {
  if (!customer) return <Alert severity="info">Selecciona un cliente registrado para consultar sus datos.</Alert>;
  const address = [customer.address.street, customer.address.number, customer.address.neighborhood, customer.address.city, customer.address.state, customer.address.postalCode].filter(Boolean).join(", ");
  const fields = [
    ["Nombre completo", customer.name], ["ID cliente", customer.customId], ["Documento", customer.document],
    ["Teléfono móvil", customer.contact.mobile], ["Teléfono fijo", customer.contact.landline], ["Correo electrónico", customer.contact.email],
  ];
  return <Box sx={{ minWidth: 0 }}>
    <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1.75 }}>Información del cliente</Typography>
    <Box sx={formGrid}>{fields.map(([label, value]) => <TextField key={label} size="small" label={label} value={value || "Sin registrar"} slotProps={{ input: { readOnly: true } }} sx={fieldSx} />)}</Box>
    <TextField fullWidth size="small" label="Ubicación" value={address} multiline slotProps={{ input: { readOnly: true } }} sx={{ ...fieldSx, mt: 1.75 }} />
    <Box sx={{ ...formGrid, mt: 1.75 }}>
      <TextField size="small" label="Latitud" value={customer.address.latitude} slotProps={{ input: { readOnly: true } }} sx={fieldSx} />
      <TextField size="small" label="Longitud" value={customer.address.longitude} slotProps={{ input: { readOnly: true } }} sx={fieldSx} />
    </Box>
    <Box sx={{ my: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}><GoogleMap ariaLabel="Ubicación del cliente del contrato" center={{ lat: customer.address.latitude, lng: customer.address.longitude }} markers={[{ id: customer.id, title: customer.name, label: "C", position: { lat: customer.address.latitude, lng: customer.address.longitude } }]} selectedMarkerId={customer.id} zoom={15} minHeight={260} /></Box>
    <Divider sx={{ mb: 1.5 }} />
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>Cuenta corriente</Typography>
      <Chip size="small" label={customer.account.status} color={customer.account.status === "Con deuda" ? "error" : "success"} />
    </Box>
    <Box sx={formGrid}>
      <TextField size="small" label="Saldo" value={money(customer.account.balance)} slotProps={{ input: { readOnly: true } }} />
      <TextField size="small" label="Facturas pendientes" value={customer.account.unpaidInvoices ?? customer.contracts.flatMap((contract) => contract.invoices ?? []).filter((invoice) => invoice.status === "Pendiente").length} slotProps={{ input: { readOnly: true } }} />
      <TextField size="small" label="Facturación" value={customer.billing.enabled ? "Habilitada" : "No habilitada"} slotProps={{ input: { readOnly: true } }} />
      <TextField size="small" label="Contratos del cliente" value={customer.contracts.length} slotProps={{ input: { readOnly: true } }} />
    </Box>
  </Box>;
}
