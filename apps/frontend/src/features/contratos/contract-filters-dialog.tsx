"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  contractFieldValues,
  contractFilterFields,
  emptyFilterGroup,
  normalizeText,
  ruleCount,
  type ContractRow,
  type FilterGroup,
  type FilterOperator,
  type FilterRule,
} from "./contract-model";

type ContractFiltersDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (group: FilterGroup) => void;
  value: FilterGroup;
  rows: ContractRow[];
};

type SavedFilter = { id: string; name: string; group: FilterGroup };
type SavedState = { filters: SavedFilter[]; warning: string };
// Filter criteria can contain customer identifiers; retain them only in memory.
let sessionFilters: SavedFilter[] = [];
const operatorLabels: Record<FilterOperator, string> = {
  contains: "Contiene",
  eq: "Igual a",
  neq: "Distinto de",
  gte: "Mayor o igual a",
  lte: "Menor o igual a",
  empty: "Está vacío",
  notEmpty: "No está vacío",
};
const operators = Object.keys(operatorLabels) as FilterOperator[];
const categories = ["Contrato", "OLT", "Facturación", "Cliente"] as const;

function createId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newRule(): FilterRule {
  return { id: createId(), field: "status", operator: "eq", value: "" };
}

function cloneGroup(group: FilterGroup): FilterGroup {
  return { ...group, rules: group.rules.map((rule) => "rules" in rule ? cloneGroup(rule) : { ...rule }) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validGroup(value: unknown, depth = 0, ids = new Set<string>()): value is FilterGroup {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id || value.id.length > 100 || ids.has(value.id)) return false;
  ids.add(value.id);
  if (depth > 2 || (value.logic !== "and" && value.logic !== "or") || !Array.isArray(value.rules) || value.rules.length > 100) return false;
  return value.rules.every((rule: unknown) => {
    if (!isRecord(rule)) return false;
    if ("rules" in rule) return validGroup(rule, depth + 1, ids);
    if (typeof rule.id !== "string" || !rule.id || rule.id.length > 100 || ids.has(rule.id)) return false;
    ids.add(rule.id);
    return typeof rule.field === "string" && contractFilterFields.some((field) => field.value === rule.field) && operators.includes(rule.operator as FilterOperator) && typeof rule.value === "string" && rule.value.length <= 10000;
  });
}

function readSavedFilters(): SavedState {
  return { filters: sessionFilters.map((filter) => ({ ...filter, group: cloneGroup(filter.group) })), warning: "Los filtros se conservan mientras esta página permanezca abierta." };
}

function RuleEditor({ rule, rows, onChange, onDelete }: { rule: FilterRule; rows: ContractRow[]; onChange: (rule: FilterRule) => void; onDelete: () => void }) {
  const field = contractFilterFields.find((item) => item.value === rule.field) ?? contractFilterFields[0];
  const availableOperators: FilterOperator[] = field.type === "boolean" ? ["eq", "neq", "empty", "notEmpty"] : field.type === "number" || field.type === "date" ? ["eq", "neq", "gte", "lte", "empty", "notEmpty"] : ["contains", "eq", "neq", "empty", "notEmpty"];
  const noValue = rule.operator === "empty" || rule.operator === "notEmpty";
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) 36px", sm: "minmax(0, 1.15fr) minmax(0, .85fr) minmax(0, 1fr) 36px" }, gap: 1, alignItems: "start" }}>
      <TextField select size="small" label="Identificador" value={rule.field} onChange={(event) => {
        const selected = contractFilterFields.find((item) => item.value === event.target.value);
        onChange({ ...rule, field: event.target.value, operator: selected?.type === "text" ? "contains" : "eq", value: "" });
      }} sx={{ gridColumn: { xs: "1", sm: "auto" } }}>
        {categories.flatMap((category) => [
          <ListSubheader key={category} sx={{ fontWeight: 700, color: "primary.main", lineHeight: "32px" }}>{category}</ListSubheader>,
          ...contractFilterFields.filter((item) => item.category === category).map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>),
        ])}
      </TextField>
      <TextField select size="small" label="Condición" value={rule.operator} onChange={(event) => onChange({ ...rule, operator: event.target.value as FilterOperator })} sx={{ gridColumn: { xs: "1", sm: "auto" }, gridRow: { xs: 2, sm: "auto" } }}>
        {availableOperators.map((operator) => <MenuItem key={operator} value={operator}>{operatorLabels[operator]}</MenuItem>)}
      </TextField>
      <Box sx={{ minWidth: 0, gridColumn: { xs: "1", sm: "auto" }, gridRow: { xs: 3, sm: "auto" } }}>
        {noValue ? <TextField fullWidth disabled size="small" label="Valor" value="" /> : field.type === "boolean" ? (
          <TextField select fullWidth size="small" label="Valor" value={rule.value} onChange={(event) => onChange({ ...rule, value: event.target.value })}><MenuItem value="">Todos</MenuItem><MenuItem value="true">Sí</MenuItem><MenuItem value="false">No</MenuItem></TextField>
        ) : field.type === "option" ? (
          <Autocomplete freeSolo size="small" options={contractFieldValues(rows, rule.field)} inputValue={rule.value} onInputChange={(_, value) => onChange({ ...rule, value })} renderInput={(params) => <TextField {...params} label="Valor" />} />
        ) : (
          <TextField fullWidth size="small" label="Valor" type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"} value={rule.value} onChange={(event) => onChange({ ...rule, value: event.target.value })} slotProps={{ inputLabel: field.type === "date" ? { shrink: true } : undefined }} />
        )}
      </Box>
      <Tooltip title="Eliminar filtro"><IconButton aria-label="Eliminar filtro" onClick={onDelete} size="small" sx={{ width: 36, height: 36, gridColumn: { xs: 2, sm: "auto" }, gridRow: { xs: 1, sm: "auto" } }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
    </Box>
  );
}

function GroupEditor({ group, depth, rows, onChange, onDelete }: { group: FilterGroup; depth: number; rows: ContractRow[]; onChange: (group: FilterGroup) => void; onDelete?: () => void }) {
  function replaceRule(index: number, updated: FilterRule | FilterGroup) {
    onChange({ ...group, rules: group.rules.map((rule, position) => position === index ? updated : rule) });
  }
  function deleteRule(index: number) {
    onChange({ ...group, rules: group.rules.filter((_, position) => position !== index) });
  }
  return (
    <Box sx={{ pl: depth === 0 ? 0 : { xs: 1, sm: 1.5 }, py: depth === 0 ? 0 : 1.5, borderLeft: depth === 0 ? "none" : "3px solid", borderColor: "divider" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 650 }}>{depth === 0 ? "Dónde" : "Grupo"}</Typography>
        <ToggleButtonGroup value={group.logic} exclusive size="small" onChange={(_, logic: "and" | "or" | null) => { if (logic) onChange({ ...group, logic }); }} aria-label={depth === 0 ? "Relación entre filtros" : "Relación del grupo"} sx={{ "& .MuiToggleButton-root": { py: 0.4, px: 1.25, fontSize: "0.7rem" } }}><ToggleButton value="and">Y (AND)</ToggleButton><ToggleButton value="or">O (OR)</ToggleButton></ToggleButtonGroup>
        {onDelete && <Tooltip title="Eliminar grupo"><IconButton aria-label="Eliminar grupo" size="small" onClick={onDelete}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      <Box sx={{ display: "grid", gap: 1.25 }}>
        {group.rules.map((rule, index) => "rules" in rule ? <GroupEditor key={rule.id} group={rule} depth={depth + 1} rows={rows} onChange={(updated) => replaceRule(index, updated)} onDelete={() => deleteRule(index)} /> : <RuleEditor key={rule.id} rule={rule} rows={rows} onChange={(updated) => replaceRule(index, updated)} onDelete={() => deleteRule(index)} />)}
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onChange({ ...group, rules: [...group.rules, newRule()] })}>Añadir filtro</Button>
        {depth < 2 && <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onChange({ ...group, rules: [...group.rules, { id: createId(), logic: "and", rules: [newRule()] }] })}>Añadir grupo</Button>}
      </Box>
    </Box>
  );
}

function invalidValue(group: FilterGroup): boolean {
  return group.rules.some((rule) => {
    if ("rules" in rule) return invalidValue(rule);
    if (!rule.value.trim() || rule.operator === "empty" || rule.operator === "notEmpty") return false;
    const type = contractFilterFields.find((field) => field.value === rule.field)?.type;
    return (type === "number" && !Number.isFinite(Number(rule.value))) || (type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(rule.value));
  });
}

function FilterSession({ onClose, onApply, value, rows }: Omit<ContractFiltersDialogProps, "open">) {
  const [draft, setDraft] = useState<FilterGroup>(() => value.rules.length > 0 ? cloneGroup(value) : { ...emptyFilterGroup(), rules: [newRule()] });
  const [saved, setSaved] = useState(readSavedFilters);
  const [selectedId, setSelectedId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function persist(filters: SavedFilter[]) {
    sessionFilters = filters.map((filter) => ({ ...filter, group: cloneGroup(filter.group) }));
    setSaved({ filters: sessionFilters, warning: "Los filtros se conservan mientras esta página permanezca abierta." });
  }

  function saveFilter() {
    setNotice("");
    if (!filterName.trim()) { setError("Escribe un nombre para el filtro."); return; }
    if (filterName.trim().length > 100) { setError("El nombre admite hasta 100 caracteres."); return; }
    if (ruleCount(draft) === 0) { setError("Agrega al menos un criterio antes de guardar."); return; }
    if (invalidValue(draft)) { setError("Revisa los valores numéricos y las fechas del filtro."); return; }
    if (!validGroup(draft)) { setError("El filtro supera la cantidad de criterios admitida."); return; }
    const existing = saved.filters.find((filter) => normalizeText(filter.name) === normalizeText(filterName));
    if (!existing && saved.filters.length >= 100) { setError("Se alcanzó el límite de filtros guardados."); return; }
    const next: SavedFilter = { id: existing?.id ?? createId(), name: filterName.trim(), group: cloneGroup(draft) };
    persist(existing ? saved.filters.map((filter) => filter.id === existing.id ? next : filter) : [...saved.filters, next]);
    setSelectedId(next.id);
    setError("");
    setNotice("Filtro guardado para esta página.");
  }

  function loadFilter() {
    const filter = saved.filters.find((item) => item.id === selectedId);
    if (!filter) return;
    setDraft(cloneGroup(filter.group));
    setFilterName(filter.name);
    setError("");
    setNotice("");
  }

  function apply() {
    if (invalidValue(draft)) { setError("Revisa los valores numéricos y las fechas del filtro."); return; }
    onApply(cloneGroup(draft));
    onClose();
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg" slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}><Typography component="h2" sx={{ fontSize: "1.05rem", fontWeight: 650 }}>Filtros avanzados</Typography><IconButton aria-label="Cerrar filtros avanzados" onClick={onClose}><CloseRoundedIcon /></IconButton></DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) auto auto", md: "minmax(180px, 1fr) auto auto minmax(180px, 1fr) auto" }, gap: 1, alignItems: "center", py: 1.5, mb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField select size="small" label="Filtros guardados" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><MenuItem value="">Seleccionar</MenuItem>{saved.filters.map((filter) => <MenuItem key={filter.id} value={filter.id}>{filter.name}</MenuItem>)}</TextField>
          <Tooltip title="Cargar filtro"><span><IconButton aria-label="Cargar filtro guardado" disabled={!selectedId} onClick={loadFilter}><FolderOpenOutlinedIcon /></IconButton></span></Tooltip>
          <Tooltip title="Eliminar filtro guardado"><span><IconButton aria-label="Eliminar filtro guardado" disabled={!selectedId} onClick={() => { persist(saved.filters.filter((filter) => filter.id !== selectedId)); setSelectedId(""); setNotice(""); }}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip>
          <TextField size="small" label="Nombre del filtro" value={filterName} onChange={(event) => setFilterName(event.target.value)} sx={{ gridColumn: { xs: "1 / 3", md: "auto" } }} />
          <Tooltip title="Guardar filtro"><IconButton aria-label="Guardar filtro" color="primary" onClick={saveFilter}><SaveOutlinedIcon /></IconButton></Tooltip>
        </Box>
        {saved.warning && <Alert severity="info" sx={{ mb: 2 }}>{saved.warning}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
        <GroupEditor group={draft} depth={0} rows={rows} onChange={(group) => { setDraft(group); setError(""); setNotice(""); }} />
      </DialogContent>
      <DialogActions sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: "1px solid", borderColor: "divider", flexWrap: "wrap", gap: 0.5 }}><Button color="inherit" onClick={() => { setDraft(emptyFilterGroup()); setError(""); setNotice(""); }}>Limpiar filtros</Button><Box sx={{ flex: 1 }} /><Button color="inherit" onClick={onClose}>Cancelar</Button><Button variant="contained" startIcon={<SearchRoundedIcon />} onClick={apply} sx={{ boxShadow: "none" }}>Buscar</Button></DialogActions>
    </Dialog>
  );
}

export function ContractFiltersDialog({ open, ...props }: ContractFiltersDialogProps) {
  return open ? <FilterSession key={props.value.id} {...props} /> : null;
}
