"use client";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { ContractField, ContractOptionField, formGrid, type ContractFieldsProps } from "./contract-form-fields";

export function ContractOltForm(props: ContractFieldsProps) {
  const { contract, options, onChange } = props;
  return <Box sx={{ mt: 2 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <FormControlLabel control={<Switch checked={contract.oltEnabled ?? false} onChange={(event) => onChange({ oltEnabled: event.target.checked })} />} label="OLT" />
      <FormControlLabel control={<Switch checked={contract.cableModemEnabled ?? false} onChange={(event) => onChange({ cableModemEnabled: event.target.checked })} />} label="Cable módem" />
    </Box>
    {contract.oltEnabled && <Box sx={{ ...formGrid, mt: 1.5 }}>
      <ContractField {...props} name="oltMode" label="Modo OLT" choices={["Router", "Bridge"]} />
      <ContractOptionField {...props} name="olt" label="OLT" options={options.olts} required onChange={(patch) => onChange({ ...patch, nap: "", napPort: "" })} />
      <ContractField {...props} name="onuId" label="ID ONU" />
      <ContractField {...props} name="onuSerial" label="Número de serie ONU" required />
      <ContractField {...props} name="onuPort" label="Puerto ONU" required />
      <ContractOptionField {...props} name="nap" label="NAP" options={options.naps} onChange={(patch) => onChange({ ...patch, napPort: "" })} />
      <ContractField {...props} name="napPort" label="Puerto NAP" />
      <ContractField {...props} name="sealCode" label="Precinto" />
      <ContractField {...props} name="vlan" label="VLAN" type="number" min={1} max={4094} />
      <ContractField {...props} name="extraVlans" label="VLAN adicionales" />
      <FormControlLabel control={<Switch checked={contract.oltBandwidthControl ?? false} onChange={(event) => onChange({ oltBandwidthControl: event.target.checked })} />} label="Control de ancho de banda OLT" />
      <FormControlLabel control={<Switch checked={contract.catvControl ?? false} onChange={(event) => onChange({ catvControl: event.target.checked })} />} label="Control CATV" />
      <FormControlLabel control={<Switch checked={contract.provisionWan ?? false} onChange={(event) => onChange({ provisionWan: event.target.checked })} />} label="Aprovisionar WAN" />
    </Box>}
    {contract.cableModemEnabled && <Box sx={{ mt: 1.75 }}><ContractField {...props} name="cableModemId" label="ID del cable módem" required /></Box>}
  </Box>;
}
