"use client";

import { MenuItem, TextField } from "@mui/material";
import type { ServiceStatus } from "../clientes/customer-types";
import { statuses } from "./contract-model";

export function ContractStatusSelect({ status, contractId, onChange }: {
  status: ServiceStatus;
  contractId: string;
  onChange: (status: ServiceStatus) => void;
}) {
  return <TextField
    select size="small" label="Estado" value={status}
    onChange={(event) => {
      const next = event.target.value as ServiceStatus;
      if (next !== status && statuses.includes(next)) onChange(next);
    }}
    slotProps={{ select: { SelectDisplayProps: { "aria-label": `Estado del contrato ${contractId}`, "aria-labelledby": undefined } } }}
    sx={{ width: 168, maxWidth: "100%", ".MuiInputBase-root": { fontSize: 12, borderRadius: "2px" }, ".MuiSelect-select": { py: 1 }, ".MuiInputLabel-root": { fontSize: 12 } }}
  >
    {statuses.filter((value) => value !== "Suspendido" || status === "Suspendido").map((value) => <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>{value}</MenuItem>)}
  </TextField>;
}
