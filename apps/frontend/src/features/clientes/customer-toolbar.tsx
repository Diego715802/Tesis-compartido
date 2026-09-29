"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { CustomerFilters } from "./customer-types";

type CustomerToolbarProps = {
  query: string;
  filters: CustomerFilters;
  filtersOpen: boolean;
  activeFilterCount: number;
  plans: string[];
  servers: string[];
  onQueryChange: (value: string) => void;
  onFiltersChange: (filters: CustomerFilters) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
};

const fieldSx = {
  minWidth: 0,
  "& .MuiInputBase-root": { minWidth: 0, backgroundColor: "#FFFFFF" },
  "& .MuiInputBase-input": { minWidth: 0, maxWidth: "100%", textOverflow: "ellipsis" },
} as const;

const clearedFilters: CustomerFilters = {
  name: "", email: "", landline: "", document: "", mobile: "", address: "", customId: "", ip: "",
  kind: "Todos", plan: "Todos", server: "Todos", billing: "Todos", account: "Todos",
};

export function CustomerToolbar({ query, filters, filtersOpen, activeFilterCount, plans, servers, onQueryChange, onFiltersChange, onToggleFilters, onClearFilters }: CustomerToolbarProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  function update<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyAdvancedSearch() {
    onFiltersChange(draftFilters);
    onToggleFilters();
  }

  function clearAdvancedSearch() {
    setDraftFilters(clearedFilters);
    onClearFilters();
  }

  return (
    <>
      <Box component="section" aria-label="Búsqueda de clientes" sx={{ display: "flex", alignItems: "center", gap: 1.25, p: { xs: 1.25, sm: 1.5 }, backgroundColor: "background.paper", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
        <TextField
          fullWidth
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Puedes buscar por: Nombre, E-mail, Teléfono fijo, Documento o Cédula, Teléfono celular, Dirección, ID Cliente personalizable, Dirección IP"
          slotProps={{
            htmlInput: { "aria-label": "Buscar clientes" },
            input: {
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 21 }} /></InputAdornment>,
              endAdornment: query ? <InputAdornment position="end"><IconButton aria-label="Limpiar búsqueda" size="small" onClick={() => onQueryChange("")}><CloseRoundedIcon sx={{ fontSize: 18 }} /></IconButton></InputAdornment> : null,
            },
          }}
          sx={{ minWidth: 0, "& .MuiOutlinedInput-root": { height: 46, minWidth: 0, borderRadius: "24px", backgroundColor: "#FBFCFE" }, "& .MuiInputBase-input": { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" } }}
        />
        <Button variant={activeFilterCount > 0 ? "contained" : "outlined"} startIcon={<TuneRoundedIcon />} aria-label="Búsqueda avanzada" aria-haspopup="dialog" onClick={onToggleFilters} sx={{ minWidth: { xs: 46, sm: 188 }, height: 46, flex: "0 0 auto", borderRadius: "24px", boxShadow: "none", "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } } }}>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Búsqueda avanzada{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}</Box>
        </Button>
      </Box>

      <Dialog open={filtersOpen} onClose={onToggleFilters} fullWidth maxWidth="lg" slotProps={{ paper: { sx: { width: "min(1120px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 32px)", borderRadius: 0 } }, backdrop: { sx: { backgroundColor: "rgba(20,31,43,.56)" } } }}>
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box><Typography component="h2" sx={{ fontSize: "1.05rem", fontWeight: 740 }}>Búsqueda avanzada</Typography><Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: "0.72rem" }}>Combina campos para localizar un expediente específico.</Typography></Box>
          <IconButton aria-label="Cerrar búsqueda avanzada" onClick={onToggleFilters}><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.5, "& > *": { minWidth: 0 } }}>
            <TextField label="Nombre y apellido" value={draftFilters.name} onChange={(e) => update("name", e.target.value)} sx={fieldSx} />
            <TextField label="E-mail de contacto" value={draftFilters.email} onChange={(e) => update("email", e.target.value)} sx={fieldSx} />
            <TextField label="Teléfono fijo" value={draftFilters.landline} onChange={(e) => update("landline", e.target.value)} sx={fieldSx} />
            <TextField label="Documento o Cédula" value={draftFilters.document} onChange={(e) => update("document", e.target.value)} sx={fieldSx} />
            <TextField label="Teléfono celular" value={draftFilters.mobile} onChange={(e) => update("mobile", e.target.value)} sx={fieldSx} />
            <TextField label="Dirección" value={draftFilters.address} onChange={(e) => update("address", e.target.value)} sx={fieldSx} />
            <TextField label="ID Cliente personalizable" value={draftFilters.customId} onChange={(e) => update("customId", e.target.value)} sx={fieldSx} />
            <TextField label="Dirección IP" value={draftFilters.ip} onChange={(e) => update("ip", e.target.value)} sx={fieldSx} />
            <TextField select label="Tipo de persona" value={draftFilters.kind} onChange={(e) => update("kind", e.target.value as CustomerFilters["kind"])} sx={fieldSx}>
              <MenuItem value="Todos">Todos</MenuItem><MenuItem value="Persona física">Persona física</MenuItem><MenuItem value="Persona jurídica">Persona jurídica</MenuItem><MenuItem value="Otro">Otro</MenuItem>
            </TextField>
            <TextField select label="Plan" value={draftFilters.plan} onChange={(e) => update("plan", e.target.value)} sx={fieldSx}><MenuItem value="Todos">Todos</MenuItem>{plans.map((plan) => <MenuItem key={plan} value={plan}>{plan}</MenuItem>)}</TextField>
            <TextField select label="Servidor" value={draftFilters.server} onChange={(e) => update("server", e.target.value)} sx={fieldSx}><MenuItem value="Todos">Todos</MenuItem>{servers.map((server) => <MenuItem key={server} value={server}>{server}</MenuItem>)}</TextField>
            <TextField select label="Facturación" value={draftFilters.billing} onChange={(e) => update("billing", e.target.value as CustomerFilters["billing"])} sx={fieldSx}><MenuItem value="Todos">Todas</MenuItem><MenuItem value="Habilitada">Habilitada</MenuItem><MenuItem value="No habilitada">No habilitada</MenuItem></TextField>
            <TextField select label="Estado de cuenta" value={draftFilters.account} onChange={(e) => update("account", e.target.value as CustomerFilters["account"])} sx={fieldSx}><MenuItem value="Todos">Todos</MenuItem><MenuItem value="Al corriente">Al corriente</MenuItem><MenuItem value="Saldo a favor">Saldo a favor</MenuItem><MenuItem value="Con deuda">Con deuda</MenuItem></TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={clearAdvancedSearch} color="inherit">Limpiar</Button>
          <Button variant="contained" startIcon={<SearchRoundedIcon />} onClick={applyAdvancedSearch} sx={{ boxShadow: "none" }}>Buscar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
