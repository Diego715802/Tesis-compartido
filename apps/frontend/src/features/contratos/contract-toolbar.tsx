"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { Badge, Box, Checkbox, Chip, IconButton, InputAdornment, Menu, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { contractColumns, type ContractColumn } from "./contract-list";

export type ContractSearchMode = "all" | "name" | "ip" | "serial" | "phone";
export type ContractSort = "id" | "name" | "ip" | "date";

type Props = {
  query: string; onQuery: (query: string) => void;
  searchMode: ContractSearchMode; onSearchMode: (mode: ContractSearchMode) => void;
  total: number; filters: number; onFilters: () => void; onClear: () => void;
  onCreate: () => void; onImport: () => void;
  sort: ContractSort; onSort: (sort: ContractSort) => void;
  descending: boolean; onDirection: () => void;
  columns: ContractColumn[]; onColumns: (columns: ContractColumn[]) => void;
};

export function ContractToolbar(props: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [menu, setMenu] = useState<"sort" | "columns">("sort");
  const searchLabels: Record<ContractSearchMode, string> = { all: "Buscar contratos", name: "Buscar por nombre", ip: "Buscar por dirección IP", serial: "Buscar por número de serie", phone: "Buscar por teléfono" };
  function openMenu(event: React.MouseEvent<HTMLElement>, value: "sort" | "columns") { setMenu(value); setAnchor(event.currentTarget); }
  return <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
    <TextField select size="small" label="Buscar por" value={props.searchMode} onChange={e => props.onSearchMode(e.target.value as ContractSearchMode)} sx={{ width: 160, flexShrink: 0 }}>
      {Object.entries({ all: "Todos los datos", name: "Nombre", ip: "Dirección IP", serial: "Serie / ID", phone: "Teléfono" }).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
    </TextField>
    <TextField size="small" value={props.query} onChange={e => props.onQuery(e.target.value)} placeholder={searchLabels[props.searchMode]} slotProps={{ htmlInput: { "aria-label": searchLabels[props.searchMode] }, input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} sx={{ flex: { xs: "1 1 190px", sm: "1 1 220px" }, minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: "24px", height: 42 } }} />
    <Tooltip title="Búsqueda avanzada"><IconButton aria-label="Búsqueda avanzada" onClick={props.onFilters} color={props.filters ? "primary" : "default"} sx={{ width: 42, height: 42 }}><Badge badgeContent={props.filters} color="primary"><FilterAltOutlinedIcon /></Badge></IconButton></Tooltip>
    <Typography sx={{ color: "text.secondary", fontSize: 12, whiteSpace: "nowrap", mr: "auto" }}><strong>{props.total}</strong> contratos</Typography>
    {props.filters > 0 && <Chip label="Limpiar filtros" size="small" onDelete={props.onClear} onClick={props.onClear} />}
    <Tooltip title="Ordenar por"><IconButton aria-label="Ordenar por" onClick={e => openMenu(e, "sort")}><SortRoundedIcon /></IconButton></Tooltip>
    <Tooltip title={props.descending ? "Orden descendente" : "Orden ascendente"}><IconButton aria-label={props.descending ? "Orden descendente" : "Orden ascendente"} onClick={props.onDirection}>{props.descending ? <ArrowDownwardRoundedIcon /> : <ArrowUpwardRoundedIcon />}</IconButton></Tooltip>
    <Tooltip title="Mostrar/Ocultar columnas"><IconButton aria-label="Mostrar/Ocultar columnas" onClick={e => openMenu(e, "columns")}><ViewColumnOutlinedIcon /></IconButton></Tooltip>
    <Tooltip title="Importar estados"><IconButton aria-label="Importar estados" onClick={props.onImport} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 0, width: 42, height: 42 }}><UploadFileRoundedIcon /></IconButton></Tooltip>
    <Tooltip title="Crear nuevo contrato"><IconButton aria-label="Crear nuevo contrato" onClick={props.onCreate} sx={{ bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 0, width: 42, height: 42, "&:hover": { bgcolor: "primary.dark" } }}><AddRoundedIcon /></IconButton></Tooltip>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      {menu === "sort" ? Object.entries({ id: "ID / número de serie", name: "Nombre", ip: "Dirección IP", date: "Fecha de alta" }).map(([key, label]) => <MenuItem key={key} selected={props.sort === key} onClick={() => { props.onSort(key as ContractSort); setAnchor(null); }}>{label}</MenuItem>) : contractColumns.map(column => <MenuItem key={column.key} onClick={() => props.onColumns(props.columns.includes(column.key) ? props.columns.filter(key => key !== column.key) : [...props.columns, column.key])}><Checkbox checked={props.columns.includes(column.key)} size="small" />{column.label}</MenuItem>)}
    </Menu>
  </Box>;
}
