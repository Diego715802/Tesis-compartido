"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import type { CustomerContract } from "../clientes/customer-types";
import type { ContractFormErrors, ContractFormOptions } from "./contract-form-data";

export const formGrid = { display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2,minmax(0,1fr))" }, gap: 1.75 };
export const fieldSx = { minWidth: 0, "& .MuiInputBase-input": { minWidth: 0, textOverflow: "ellipsis" }, "& .MuiFormHelperText-root": { mx: 0, overflowWrap: "anywhere" } };
export type ContractFieldsProps = { contract: CustomerContract; errors: ContractFormErrors; options: ContractFormOptions; onChange: (patch: Partial<CustomerContract>) => void };
type FieldProps = Omit<ContractFieldsProps, "options"> & { name: keyof CustomerContract; label: string; required?: boolean; choices?: readonly (string | number)[]; type?: "text" | "number" | "date" | "password"; multiline?: boolean; disabled?: boolean; min?: number; max?: number; helperText?: string };

export function ContractField({ contract, errors, onChange, name, label, required, choices, type = "text", multiline, disabled, min, max, helperText }: FieldProps) {
  const [revealed, setRevealed] = useState(false);
  const value = contract[name] ?? "";
  return <TextField
    id={`contract-field-${name}`} fullWidth size="small" label={label} required={required} disabled={disabled} select={Boolean(choices)}
    value={value} type={type === "password" && revealed ? "text" : type} autoComplete={type === "password" ? "new-password" : undefined} multiline={multiline} minRows={multiline ? 3 : undefined}
    error={Boolean(errors[name])} helperText={errors[name] || helperText} sx={fieldSx}
    onChange={(event) => onChange({ [name]: type === "number" ? event.target.value === "" ? undefined : Number(event.target.value) : event.target.value })}
    slotProps={{ htmlInput: { min, max }, inputLabel: type === "date" ? { shrink: true } : undefined, input: type === "password" ? { endAdornment: <InputAdornment position="end"><Tooltip title={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}><IconButton type="button" size="small" aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setRevealed(!revealed)}>{revealed ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}</IconButton></Tooltip></InputAdornment> } : undefined }}
  >{choices?.map((choice) => <MenuItem key={choice} value={choice}>{choice}</MenuItem>)}</TextField>;
}

export function ContractOptionField({ contract, errors, onChange, name, label, options, required = false }: Omit<FieldProps, "choices"> & { options: string[] }) {
  const value = String(contract[name] ?? "");
  return <Autocomplete id={`contract-field-${name}`} freeSolo size="small" options={options} value={value} inputValue={value} onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") onChange({ [name]: next }); }} onChange={(_, next) => onChange({ [name]: next ?? "" })} renderInput={(params) => <TextField {...params} label={label} required={required} error={Boolean(errors[name])} helperText={errors[name]} sx={fieldSx} />} />;
}
