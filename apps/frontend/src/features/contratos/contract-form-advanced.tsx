"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ContractField, ContractOptionField, formGrid, type ContractFieldsProps } from "./contract-form-fields";

export function ContractAdvancedForm(props: ContractFieldsProps) {
  return <Box sx={{ maxWidth: 1040 }}>
    <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, mb: 1.75 }}>Configuración avanzada</Typography>
    <Box sx={formGrid}>
      <ContractField {...props} name="fullNatAddress" label="FULL-NAT" />
      <ContractField {...props} name="trafficTolerancePercent" label="Ceil DFL (%)" type="number" min={0} max={100} />
      <ContractField {...props} name="cpePort" label="Puerto CPE" type="number" min={1} max={65535} />
      <ContractField {...props} name="cpeProtocol" label="Protocolo CPE" choices={["http", "https"]} />
      <ContractField {...props} name="wifiPassword" label="Contraseña WiFi" type="password" />
      <ContractField {...props} name="startsAt" label="Fecha de alta" type="date" required />
      {props.contract.accessMode !== "PPPoE" && <ContractField {...props} name="password" label="Contraseña de acceso" type="password" />}
      <ContractOptionField {...props} name="parentQueue" label="Cola padre" options={props.options.queues} />
      <ContractField {...props} name="uploadPriority" label="Prioridad de subida" choices={[1, 2, 3, 4, 5, 6, 7, 8]} type="number" />
      <ContractField {...props} name="downloadPriority" label="Prioridad de bajada" choices={[1, 2, 3, 4, 5, 6, 7, 8]} type="number" />
    </Box>
    <Box sx={{ mt: 1.75 }}><ContractField {...props} name="notes" label="Detalles" multiline /></Box>
  </Box>;
}
