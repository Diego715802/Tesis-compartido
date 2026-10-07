"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import type { Customer } from "../clientes/customer-types";
import { ContractConnectionForm } from "./contract-form-connection";
import { ContractCustomerInformation } from "./contract-form-customer";
import { contractFormOptions } from "./contract-form-data";
import { ContractField, ContractOptionField, fieldSx, formGrid, type ContractFieldsProps } from "./contract-form-fields";
import { ContractOltForm } from "./contract-form-olt";

type Props = ContractFieldsProps & { customers: Customer[]; customerId: string; editing: boolean; onSelectCustomer: (customer: Customer | null) => void };

export function ContractBasicForm(props: Props) {
  const { customers, customerId, editing, contract, errors, options, onChange, onSelectCustomer } = props;
  const selected = customers.find((customer) => customer.id === customerId);
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.25fr) minmax(0,1fr)" }, gap: { xs: 2.5, lg: 3 } }}>
    <Box sx={{ minWidth: 0 }}>
      <Autocomplete id="contract-field-customerId" size="small" options={customers} value={selected ?? null} disabled={editing} getOptionLabel={(customer) => `${customer.name} · ${customer.customId}`} isOptionEqualToValue={(a, b) => a.id === b.id} filterOptions={(items, state) => { const query = state.inputValue.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); return items.filter((item) => [item.name, item.customId, item.document, item.contact.mobile].join(" ").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)); }} onChange={(_, customer) => onSelectCustomer(customer)} noOptionsText="No hay clientes registrados que coincidan" renderInput={(params) => <TextField {...params} label="Cliente" required error={Boolean(errors.customerId)} helperText={errors.customerId} sx={fieldSx} />} />
      <Box sx={{ ...formGrid, mt: 1.75 }}>
        <ContractField {...props} name="serialNumber" label="Número de serie del contrato" required />
        <ContractField {...props} name="status" label="Estado" choices={["Habilitado", "Deshabilitado", "Alertado", "Degradado", ...(contract.status === "Suspendido" ? ["Suspendido"] : [])]} />
        <ContractField {...props} name="plan" label="Plan" required choices={options.plans} onChange={(patch) => { const existing = customers.flatMap((customer) => customer.contracts).find((item) => item.plan === patch.plan); onChange({ ...patch, ...(existing?.price !== undefined ? { price: existing.price } : {}) }); }} />
        <ContractField {...props} name="server" label="Servidor" required choices={options.servers} onChange={(patch) => { const nextOptions = contractFormOptions(customers, patch.server ?? ""); onChange({ ...patch, ...(nextOptions.interfaces.includes(contract.interfaceName ?? "") ? {} : { interfaceName: "" }) }); }} />
        <ContractField {...props} name="node" label="Nodo Wireless" required choices={options.nodes} />
        <ContractOptionField {...props} name="interfaceName" label="Interfaz" required options={options.interfaces} />
      </Box>
      <Autocomplete multiple size="small" options={options.items} value={contract.items ?? []} onChange={(_, items) => onChange({ items })} renderInput={(params) => <TextField {...params} label="Artículos" sx={fieldSx} />} sx={{ mt: 1.75 }} />
      <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={contract.bandwidthControl ?? false} onChange={(event) => onChange({ bandwidthControl: event.target.checked })} />} label="Control de ancho de banda Mikrotik" />
      <ContractConnectionForm {...props} />
      <ContractOltForm {...props} />
    </Box>
    <Box sx={{ minWidth: 0, pl: { lg: 3 }, borderLeft: { lg: "1px solid" }, borderColor: "divider" }}><ContractCustomerInformation customer={selected} /></Box>
  </Box>;
}
