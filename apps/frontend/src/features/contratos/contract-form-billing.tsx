"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Customer } from "../clientes/customer-types";
import { ContractChargesForm } from "./contract-form-charges";
import { ContractField, fieldSx, formGrid, type ContractFieldsProps } from "./contract-form-fields";

export function ContractBillingForm(props: ContractFieldsProps & { customer?: Customer }) {
  const { customer, options } = props;
  const disabled = !customer?.billing.enabled;
  const fields = [
    ["Nombre / Razón social", customer?.billing.legalName], ["RFC / Identificación fiscal", customer?.billing.taxId],
    ["Razón social emisora", customer?.billing.legalEntity], ["Régimen", customer?.billing.regime],
    ["Tipo de factura", customer?.billing.invoiceType], ["Método de pago", customer?.billing.paymentMethod],
    ["Recaudador", customer?.assignment.collector], ["Vendedor", customer?.assignment.seller],
  ];
  return <Box>
    {disabled && <Alert severity="warning" sx={{ mb: 2 }}>{customer ? "El cliente tiene la facturación deshabilitada. Habilítala en su ficha para configurar el cobro del contrato." : "Selecciona un cliente para configurar la facturación."}</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2,minmax(0,1fr))" }, gap: 3 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h3" sx={{ mb: 1.75, fontSize: 14, fontWeight: 600 }}>Facturación del contrato</Typography>
        <Box sx={formGrid}>
          <ContractField {...props} disabled={disabled} name="price" label="Precio" type="number" min={0} required />
          <ContractField {...props} disabled={disabled} name="frequency" label="Frecuencia" choices={["Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"]} />
          <ContractField {...props} disabled={disabled} name="billingProfile" label="Perfil de facturación" required choices={options.billingProfiles} />
          <ContractField {...props} disabled={disabled} name="billingStatus" label="Estado de facturación" choices={["Activo", "Suspendido", "Exento", ...(props.contract.billingStatus && !["Activo", "Suspendido", "Exento"].includes(props.contract.billingStatus) ? [props.contract.billingStatus] : [])]} />
          <ContractField {...props} disabled={disabled} name="startBillingAt" label="Comienza a facturar" type="date" />
          <ContractField {...props} disabled={disabled} name="billingDay" label="Día del ciclo de facturación" type="number" min={1} max={31} />
          <ContractField {...props} disabled={disabled} name="billingPeriodStart" label="Inicio del período" type="date" />
          <ContractField {...props} disabled={disabled} name="billingPeriodEnd" label="Fin del período" type="date" />
        </Box>
        <ContractChargesForm {...props} disabled={disabled} />
      </Box>
      <Box sx={{ minWidth: 0, pl: { lg: 3 }, borderLeft: { lg: "1px solid" }, borderColor: "divider" }}>
        <Typography component="h3" sx={{ mb: 1.75, fontSize: 14, fontWeight: 600 }}>Datos fiscales del cliente</Typography>
        <Box sx={formGrid}>{fields.map(([label, value]) => <TextField key={label} size="small" label={label} value={value || "Sin registrar"} slotProps={{ input: { readOnly: true } }} sx={fieldSx} />)}</Box>
      </Box>
    </Box>
  </Box>;
}
