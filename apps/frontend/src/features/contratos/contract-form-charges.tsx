"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { ContractFieldsProps } from "./contract-form-fields";

export function ContractChargesForm({ contract, errors, onChange, disabled }: ContractFieldsProps & { disabled: boolean }) {
  const discounts = contract.discounts ?? [];
  const items = contract.recurringItems ?? [];
  return <Box>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 2.5, mb: 1 }}>
      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>Descuentos del plan</Typography>
      <Button disabled={disabled} startIcon={<AddRoundedIcon />} onClick={() => onChange({ discounts: [...discounts, { id: crypto.randomUUID(), name: "", amount: 0, type: "Porcentaje" }] })}>Agregar</Button>
    </Box>
    {errors.discounts && <Alert severity="error" sx={{ mb: 1 }}>{errors.discounts}</Alert>}
    {discounts.length === 0 && <Typography sx={{ fontSize: 13, color: "text.secondary", py: 1 }}>Sin descuentos</Typography>}
    {discounts.map((discount, index) => {
      const patch = (values: Partial<typeof discount>) => onChange({ discounts: discounts.map((item) => item.id === discount.id ? { ...item, ...values } : item) });
      return <Box key={discount.id} sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr) minmax(0,1fr) 36px", sm: "minmax(0,1.5fr) minmax(0,1fr) minmax(0,.8fr) 36px" }, gap: 1, mb: 1 }}>
        <TextField required disabled={disabled} size="small" label="Descripción" value={discount.name} onChange={(event) => patch({ name: event.target.value })} sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }} />
        <TextField select disabled={disabled} size="small" label="Tipo" value={discount.type} onChange={(event) => patch({ type: event.target.value as typeof discount.type })}>{["Porcentaje", "Importe"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
        <TextField required disabled={disabled} size="small" type="number" label={discount.type === "Porcentaje" ? "Porcentaje" : "Importe"} value={discount.amount} onChange={(event) => patch({ amount: Number(event.target.value) })} slotProps={{ htmlInput: { min: 0, max: discount.type === "Porcentaje" ? 100 : undefined } }} />
        <Tooltip title="Quitar descuento"><span><IconButton disabled={disabled} aria-label={`Quitar descuento ${index + 1}`} onClick={() => onChange({ discounts: discounts.filter((item) => item.id !== discount.id) })}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
      </Box>;
    })}
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 2.5, mb: 1 }}>
      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>Artículos recurrentes</Typography>
      <Button disabled={disabled} startIcon={<AddRoundedIcon />} onClick={() => onChange({ recurringItems: [...items, { id: crypto.randomUUID(), name: "", amount: 0, quantity: 1 }] })}>Agregar</Button>
    </Box>
    {errors.recurringItems && <Alert severity="error" sx={{ mb: 1 }}>{errors.recurringItems}</Alert>}
    {items.length === 0 && <Typography sx={{ fontSize: 13, color: "text.secondary", py: 1 }}>Sin artículos recurrentes</Typography>}
    {items.map((item, index) => {
      const patch = (values: Partial<typeof item>) => onChange({ recurringItems: items.map((entry) => entry.id === item.id ? { ...entry, ...values } : entry) });
      return <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr) minmax(0,1fr) 36px", sm: "minmax(0,1.5fr) minmax(0,.8fr) minmax(0,1fr) 36px" }, gap: 1, mb: 1 }}>
        <TextField required disabled={disabled} size="small" label="Artículo" value={item.name} onChange={(event) => patch({ name: event.target.value })} sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }} />
        <TextField required disabled={disabled} size="small" type="number" label="Cantidad" value={item.quantity} onChange={(event) => patch({ quantity: Number(event.target.value) })} slotProps={{ htmlInput: { min: 1 } }} />
        <TextField required disabled={disabled} size="small" type="number" label="Importe unitario" value={item.amount} onChange={(event) => patch({ amount: Number(event.target.value) })} slotProps={{ htmlInput: { min: 0 } }} />
        <Tooltip title="Quitar artículo recurrente"><span><IconButton disabled={disabled} aria-label={`Quitar artículo recurrente ${index + 1}`} onClick={() => onChange({ recurringItems: items.filter((entry) => entry.id !== item.id) })}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
      </Box>;
    })}
  </Box>;
}
