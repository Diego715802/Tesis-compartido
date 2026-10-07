"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import type { CustomerContract } from "../clientes/customer-types";
import { ContractField, ContractOptionField, formGrid, type ContractFieldsProps } from "./contract-form-fields";

export function ContractConnectionForm(props: ContractFieldsProps) {
  const { contract, onChange, options } = props;
  const mode = contract.accessMode ?? "Estática";
  return <Box sx={{ mt: 2.5 }}>
    <Typography component="h3" sx={{ mb: 1.5, fontSize: 14, fontWeight: 600 }}>Conectividad</Typography>
    <Box sx={{ ...formGrid, mb: 1.5 }}>
      <FormControl><FormLabel sx={{ fontSize: 13 }}>Tipo</FormLabel><RadioGroup row value={contract.hostType ?? "Host"} onChange={(event) => onChange({ hostType: event.target.value as CustomerContract["hostType"] })}>{["Host", "Subred"].map((item) => <FormControlLabel key={item} value={item} control={<Radio size="small" />} label={item} />)}</RadioGroup></FormControl>
      <FormControl><FormLabel sx={{ fontSize: 13 }}>Modo</FormLabel><RadioGroup row value={mode} onChange={(event) => onChange({ accessMode: event.target.value as CustomerContract["accessMode"] })}>{["Estática", "PPPoE", "DHCP"].map((item) => <FormControlLabel key={item} value={item} control={<Radio size="small" />} label={item} />)}</RadioGroup></FormControl>
    </Box>
    <Box sx={formGrid}>
      <ContractOptionField {...props} name="network" label="Red" options={options.networks} />
      <ContractField {...props} name="macAddress" label="Dirección MAC" required={mode === "DHCP"} />
      <ContractField {...props} name="ipAddress" label="Dirección IP" required={mode === "Estática"} />
      {mode === "Estática" && <ContractField {...props} name="netmask" label="Máscara de red" required />}
      {mode === "PPPoE" && <>
        <ContractField {...props} name="username" label="Usuario PPPoE" required />
        <ContractField {...props} name="password" label="Contraseña PPPoE" type="password" required />
        <ContractOptionField {...props} name="pppProfile" label="Perfil PPP" options={options.pppProfiles} required />
        <ContractOptionField {...props} name="pppoeServer" label="PPPoE Server" options={options.pppoeServers} />
      </>}
      {mode === "Estática" && <>
        <ContractField {...props} name="gateway" label="Gateway" required={contract.oltEnabled} />
        <ContractField {...props} name="dnsPrimary" label="DNS 1" required={contract.oltEnabled} />
        <ContractField {...props} name="dnsSecondary" label="DNS 2" />
      </>}
    </Box>
  </Box>;
}
