"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { ElementType } from "react";
import { useMemo, useState } from "react";

export type DemoRecord = {
  id: string;
  [key: string]: string | number | boolean;
};

export type WorkbenchColumn = {
  key: string;
  label: string;
  width?: number | string;
};

export type WorkbenchField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  options?: readonly string[];
  required?: boolean;
  helperText?: string;
  tab?: string;
};

export type WorkbenchView = {
  value: string;
  label: string;
};

export type WisproModuleConfig = {
  label: string;
  singular: string;
  description: string;
  icon: ElementType;
  searchPlaceholder: string;
  columns: readonly WorkbenchColumn[];
  fields: readonly WorkbenchField[];
  records: readonly DemoRecord[];
  views?: readonly WorkbenchView[];
  formTabs?: readonly string[];
  detailFields?: readonly string[];
  detailKind?: "summary" | "map" | "network" | "billing";
  createLabel?: string;
  emptyLabel?: string;
  collectionLabel?: string;
};

const surface = {
  backgroundColor: "#FDFDFD",
  border: "1px solid #E7EAEC",
  borderRadius: "2px",
  boxShadow: "3px 3px 8px rgba(0,0,0,.18)",
};

function recordText(record: DemoRecord) {
  return Object.values(record).join(" ").toLocaleLowerCase("es-MX");
}

function emptyFromFields(fields: readonly WorkbenchField[]): DemoRecord {
  return fields.reduce<DemoRecord>((record, field) => {
    record[field.key] = field.options?.[0] ?? "";
    return record;
  }, { id: `demo-${Date.now()}` });
}

function recordIsoDate(record: DemoRecord) {
  const raw = String(record.createdAt ?? record.fecha ?? record.emitido ?? record.creado ?? "");
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : raw.match(/^\d{4}-\d{2}-\d{2}$/)?.[0] ?? "";
}

function DetailVisual({ kind }: { kind: WisproModuleConfig["detailKind"] }) {
  if (kind === "map") {
    return (
      <Box sx={{ position: "relative", height: 190, overflow: "hidden", border: "1px solid #D9DEE2", background: "linear-gradient(135deg,#E7EDF1 0 24%,#F6F6F3 24% 54%,#DCE8D8 54% 72%,#E9E3D8 72%)" }}>
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(30deg,transparent 47%,rgba(126,151,166,.35) 48% 50%,transparent 51%),linear-gradient(120deg,transparent 46%,rgba(126,151,166,.22) 47% 49%,transparent 50%)", backgroundSize: "90px 90px" }} />
        <Box sx={{ position: "absolute", left: "54%", top: "48%", width: 18, height: 18, transform: "translate(-50%,-50%) rotate(45deg)", backgroundColor: "#1C84C6", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
        <Typography sx={{ position: "absolute", left: 10, bottom: 8, px: 0.75, py: 0.25, color: "#676A6C", backgroundColor: "rgba(255,255,255,.88)", fontSize: 10 }}>Vista cartográfica de demostración</Typography>
      </Box>
    );
  }

  if (kind === "network") {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", alignItems: "end", gap: 0.5, height: 110, px: 1.5, pt: 2, pb: 1, border: "1px solid #E1E5E8", backgroundColor: "#FAFAFA" }}>
        {[32, 48, 23, 66, 44, 82, 38, 58, 28, 72, 45, 62].map((height, index) => <Box key={index} sx={{ height: `${height}%`, backgroundColor: index % 3 === 0 ? "#F05A68" : "#46A44B" }} />)}
      </Box>
    );
  }

  if (kind === "billing") {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, p: 1.5, border: "1px solid #E1E5E8", backgroundColor: "#FAFAFA" }}>
        <Box><Typography sx={{ color: "text.secondary", fontSize: 11 }}>Saldo demo</Typography><Typography sx={{ color: "#24B7BE", fontSize: 24, fontWeight: 300 }}>$ 0,00</Typography></Box>
        <Box><Typography sx={{ color: "text.secondary", fontSize: 11 }}>Estado</Typography><Chip label="Sin adeudo" size="small" color="success" sx={{ mt: 0.7, height: 24 }} /></Box>
      </Box>
    );
  }

  return null;
}

export function WisproModuleWorkbench({ config }: { config: WisproModuleConfig }) {
  const ModuleIcon = config.icon;
  const theme = useTheme();
  const mobileDialog = useMediaQuery(theme.breakpoints.down("sm"));
  const [records, setRecords] = useState<DemoRecord[]>([...config.records]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState(config.views?.[0]?.value ?? "todos");
  const [selectedId, setSelectedId] = useState(config.records[0]?.id ?? "");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [draft, setDraft] = useState<DemoRecord>(() => emptyFromFields(config.fields));
  const [formTab, setFormTab] = useState(config.formTabs?.[0] ?? "Básico");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [pendingStatusFilter, setPendingStatusFilter] = useState("Todos");
  const [createdFrom, setCreatedFrom] = useState("");
  const [pendingCreatedFrom, setPendingCreatedFrom] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState("");

  const statusOptions = useMemo(() => Array.from(new Set(records.map((record) => String(record.estado ?? record.status ?? "")).filter(Boolean))), [records]);
  const hasDateData = useMemo(() => records.some((record) => Boolean(recordIsoDate(record))), [records]);
  const filtered = useMemo(() => records.filter((record) => {
    const matchesView = view === "todos" || record.view === view;
    const matchesStatus = statusFilter === "Todos" || String(record.estado ?? record.status ?? "") === statusFilter;
    const matchesDate = !createdFrom || recordIsoDate(record) >= createdFrom;
    return matchesView && matchesStatus && matchesDate && recordText(record).includes(query.toLocaleLowerCase("es-MX").trim());
  }), [createdFrom, query, records, statusFilter, view]);
  const visibleRecords = filtered.slice(0, pageSize);
  const selected = filtered.find((record) => record.id === selectedId) ?? filtered[0] ?? null;

  function openCreate() {
    setDraft(emptyFromFields(config.fields));
    setFieldErrors({});
    setFormTab(config.formTabs?.[0] ?? "Básico");
    setDialogMode("create");
  }

  function openEdit(record = selected) {
    if (!record) return;
    setDraft({ ...record });
    setFieldErrors({});
    setFormTab(config.formTabs?.[0] ?? "Básico");
    setDialogMode("edit");
  }

  function saveDraft() {
    const missingFields = config.fields.filter((field) => field.required && !String(draft[field.key] ?? "").trim());
    if (missingFields.length > 0) {
      const errors = Object.fromEntries(missingFields.map((field) => [field.key, `${field.label} es obligatorio.`]));
      const firstMissing = missingFields[0];
      setFieldErrors(errors);
      if (firstMissing.tab) setFormTab(firstMissing.tab);
      window.setTimeout(() => document.getElementById(`workbench-field-${firstMissing.key}`)?.focus(), 0);
      setMessage(`Completa ${missingFields.length === 1 ? "el campo obligatorio" : "los campos obligatorios"}.`);
      return;
    }
    setRecords((current) => dialogMode === "edit"
      ? current.map((record) => record.id === draft.id ? draft : record)
      : [{ ...draft, view: view === "todos" ? (config.views?.[0]?.value ?? "todos") : view }, ...current]);
    setSelectedId(draft.id);
    setFieldErrors({});
    setDialogMode(null);
    setMessage(`${config.singular} guardado en esta sesión de demostración.`);
  }

  function removeSelected() {
    if (!selected) return;
    setRecords((current) => current.filter((record) => record.id !== selected.id));
    setSelectedId("");
    setDeleteOpen(false);
    setMessage(`${config.singular} eliminado de la demostración.`);
  }

  function exportDemo() {
    const headers = config.columns.map((column) => column.label);
    const rows = filtered.map((record) => config.columns.map((column) => String(record[column.key] ?? "")));
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.label.toLocaleLowerCase("es-MX")}-demo.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMenuAnchor(null);
    setMessage("Archivo CSV de demostración generado.");
  }

  const visibleFields = config.fields.filter((field) => !field.tab || field.tab === formTab);

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5, xl: 3 }, py: { xs: 2, md: 2.5 } }}>
      <Breadcrumbs separator={<ChevronRightRoundedIcon sx={{ fontSize: 14 }} />} aria-label="Ruta de navegación" sx={{ mb: 1, "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
        <Link href="/" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>Inicio</Link>
        <Typography color="text.primary" sx={{ fontSize: 12, fontWeight: 650 }}>{config.label}</Typography>
      </Breadcrumbs>

      <Box component="header" sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "grid", width: 42, height: 42, placeItems: "center", color: "#1C84C6", backgroundColor: "#EAF3FC" }}><ModuleIcon sx={{ fontSize: 23 }} /></Box>
          <Box>
            <Typography component="h1" sx={{ color: "#4B4E51", fontSize: { xs: 24, sm: 28 }, fontWeight: 700, lineHeight: 1.12 }}>{config.label}</Typography>
            <Typography sx={{ mt: 0.35, color: "#7A7D80", fontSize: 13 }}>{config.description}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", width: { xs: "100%", sm: "auto" }, gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadRoundedIcon />} endIcon={<MoreVertRoundedIcon />} onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ flex: { xs: 1, sm: "initial" } }}>Exportar</Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate} sx={{ flex: { xs: 1, sm: "initial" }, boxShadow: "none" }}>{config.createLabel ?? `Crear ${config.singular}`}</Button>
        </Box>
      </Box>

      {config.views && (
        <Tabs value={view} onChange={(_, value) => setView(value)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 42, mb: 1.5, borderBottom: "1px solid #DDE2E6", "& .MuiTab-root": { minHeight: 42, px: 2, py: 1, fontSize: 12, textTransform: "none" } }}>
          {config.views.map((item) => <Tab key={item.value} value={item.value} label={item.label} />)}
        </Tabs>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) auto" }, gap: 1, mb: 1.5 }}>
        <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} size="small" fullWidth slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#8A8C8E", fontSize: 20 }} /></InputAdornment> }, htmlInput: { "aria-label": `Buscar en ${config.label.toLocaleLowerCase("es-MX")}` } }} />
        <Button variant="outlined" startIcon={<FilterAltOutlinedIcon />} onClick={() => setAdvancedOpen((current) => !current)}>Búsqueda avanzada</Button>
      </Box>

      {advancedOpen && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${hasDateData ? 3 : 2},1fr)` }, gap: 1.5, mb: 1.5, p: 1.5, border: "1px solid #DDE2E6", backgroundColor: "#FAFAFA" }}>
          <TextField label="Estado" select size="small" value={pendingStatusFilter} onChange={(event) => setPendingStatusFilter(event.target.value)}><MenuItem value="Todos">Todos</MenuItem>{statusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
          {hasDateData && <TextField label="Creado desde" type="date" size="small" value={pendingCreatedFrom} onChange={(event) => setPendingCreatedFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />}
          <Button onClick={() => { setStatusFilter(pendingStatusFilter); setCreatedFrom(pendingCreatedFrom); setSelectedId(""); setAdvancedOpen(false); setMessage("Filtros de demostración aplicados."); }}>Aplicar filtros de demostración</Button>
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 360px" }, gap: 2.5, alignItems: "start" }}>
        <Box sx={surface}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.75, py: 1.25, borderBottom: "1px solid #E7EAEC" }}>
            <Typography sx={{ color: "#676A6C", fontSize: 13 }}>Mostrando {filtered.length} {filtered.length === 1 ? config.singular : (config.collectionLabel ?? config.label.toLocaleLowerCase("es-MX"))}</Typography>
            <Chip label="Datos demo" size="small" sx={{ height: 24, color: "#676A6C", backgroundColor: "#F0F1F2", fontSize: 10.5 }} />
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead><TableRow>{config.columns.map((column) => <TableCell key={column.key} sx={{ width: column.width, color: "#5B5E61", fontSize: 12, fontWeight: 700 }}>{column.label}</TableCell>)}<TableCell align="right" sx={{ width: 132, fontSize: 12, fontWeight: 700 }}>Acciones</TableCell></TableRow></TableHead>
              <TableBody>
                {visibleRecords.map((record) => (
                  <TableRow key={record.id} hover selected={record.id === selected?.id} sx={{ "&.Mui-selected": { backgroundColor: "#BCE4F3" }, "&.Mui-selected:hover": { backgroundColor: "#AEDDEE" } }}>
                    {config.columns.map((column, index) => <TableCell key={column.key} sx={{ py: 1.25, color: index === 0 ? "#1C84C6" : "#676A6C", fontSize: 12.5, fontWeight: index === 0 ? 600 : 400 }}>{index === 0 ? <ButtonBase onClick={() => setSelectedId(record.id)} aria-label={`Seleccionar ${config.singular} ${String(record[column.key] ?? record.id)}`} sx={{ justifyContent: "flex-start", color: "inherit", font: "inherit", textAlign: "left", "&:focus-visible": { outline: "3px solid rgba(28,132,198,.3)", outlineOffset: 2 } }}>{String(record[column.key] ?? "—")}</ButtonBase> : String(record[column.key] ?? "—")}</TableCell>)}
                    <TableCell align="right">
                      <Tooltip title="Ver detalle"><IconButton aria-label={`Ver detalle de ${String(record[config.columns[0]?.key] ?? record.id)}`} size="small" onClick={() => setSelectedId(record.id)} sx={{ width: { xs: 44, sm: 34 }, height: { xs: 44, sm: 34 } }}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Editar"><IconButton aria-label={`Editar ${String(record[config.columns[0]?.key] ?? record.id)}`} size="small" onClick={() => openEdit(record)} sx={{ width: { xs: 44, sm: 34 }, height: { xs: 44, sm: 34 } }}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton aria-label={`Eliminar ${String(record[config.columns[0]?.key] ?? record.id)}`} size="small" color="error" onClick={() => { setSelectedId(record.id); setDeleteOpen(true); }} sx={{ width: { xs: 44, sm: 34 }, height: { xs: 44, sm: 34 } }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={config.columns.length + 1}><Box sx={{ display: "grid", minHeight: 220, placeItems: "center", textAlign: "center" }}><Box><HelpOutlineRoundedIcon sx={{ color: "#A0A2A4", fontSize: 34 }} /><Typography sx={{ mt: 0.5, color: "#676A6C", fontSize: 14, fontWeight: 600 }}>{config.emptyLabel ?? `No hay ${config.label.toLocaleLowerCase("es-MX")} para mostrar`}</Typography><Button sx={{ mt: 0.75 }} onClick={openCreate}>Crear uno aquí</Button></Box></Box></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, px: 1.5, py: 1.25, borderTop: "1px solid #E7EAEC" }}><Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: 11 }}>Paginar de a</Typography>{[10,20,50,100].map((size) => <Button key={size} size="small" variant={size === pageSize ? "contained" : "outlined"} aria-pressed={size === pageSize} onClick={() => setPageSize(size)} sx={{ minWidth: 38, px: 0.5 }}>{size}</Button>)}</Box>
        </Box>

        <Box component="aside" sx={{ ...surface, minHeight: 290, p: 2 }}>
          {selected ? <>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}><Box><Typography sx={{ color: "#4B4E51", fontSize: 17, fontWeight: 600 }}>{String(selected[config.columns[0]?.key] ?? config.singular)}</Typography><Typography sx={{ mt: 0.35, color: "#8A8C8E", fontSize: 11 }}>Detalle de demostración · ID {selected.id}</Typography></Box><Chip label={String(selected.status ?? selected.estado ?? "Activo")} size="small" color={String(selected.status ?? selected.estado).toLocaleLowerCase("es-MX").includes("des") ? "default" : "primary"} sx={{ height: 24, fontSize: 10 }} /></Box>
            <Divider sx={{ my: 1.5 }} />
            <DetailVisual kind={config.detailKind} />
            <Box sx={{ mt: config.detailKind ? 1.5 : 0 }}>
              {(config.detailFields ?? config.columns.map((column) => column.key)).map((key) => {
                const label = config.columns.find((column) => column.key === key)?.label ?? config.fields.find((field) => field.key === key)?.label ?? key;
                return <Box key={key} sx={{ display: "grid", gridTemplateColumns: "minmax(90px,.7fr) 1fr", gap: 1, py: 1, borderBottom: "1px solid #ECEEEF" }}><Typography sx={{ color: "#676A6C", fontSize: 11.5, fontWeight: 600 }}>{label}</Typography><Typography sx={{ color: "#4B4E51", fontSize: 11.5, textAlign: "right", overflowWrap: "anywhere" }}>{String(selected[key] ?? "—")}</Typography></Box>;
              })}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2 }}><Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => openEdit()}>Editar</Button><Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setDeleteOpen(true)}>Eliminar</Button></Box>
          </> : <Box sx={{ display: "grid", minHeight: 250, placeItems: "center", textAlign: "center" }}><Typography sx={{ color: "#8A8C8E", fontSize: 13 }}>Selecciona un registro para ver sus detalles.</Typography></Box>}
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}><MenuItem onClick={exportDemo}>Exportar CSV de demostración</MenuItem><MenuItem onClick={() => { setMenuAnchor(null); setMessage("Vista de impresión preparada para demostración."); }}>Preparar vista de impresión</MenuItem></Menu>

      <Dialog open={Boolean(dialogMode)} onClose={() => setDialogMode(null)} fullScreen={mobileDialog} fullWidth maxWidth="lg" scroll="paper" slotProps={{ paper: { sx: { borderRadius: mobileDialog ? 0 : "2px" } } }}>
        <DialogTitle sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 600 }}>{dialogMode === "create" ? `Crear ${config.singular}` : `Editar ${config.singular}`}<Typography sx={{ mt: 0.35, color: "#8A8C8E", fontSize: 11.5 }}>Los cambios solo existen en esta demostración local.</Typography></DialogTitle>
        {config.formTabs && <Tabs value={formTab} onChange={(_, value) => setFormTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderTop: "1px solid #E7EAEC", borderBottom: "1px solid #E7EAEC", "& .MuiTab-root": { minHeight: 46, textTransform: "none", fontSize: 12 } }}>{config.formTabs.map((tab) => <Tab key={tab} value={tab} label={tab} />)}</Tabs>}
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2 }}>
            {visibleFields.map((field) => field.options ? (
              <TextField id={`workbench-field-${field.key}`} key={field.key} label={field.label} required={field.required} error={Boolean(fieldErrors[field.key])} select fullWidth size="small" value={String(draft[field.key] ?? field.options[0])} onChange={(event) => { setDraft((current) => ({ ...current, [field.key]: event.target.value })); setFieldErrors((current) => ({ ...current, [field.key]: "" })); }} helperText={fieldErrors[field.key] || field.helperText}>{field.options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField>
            ) : (
              <TextField id={`workbench-field-${field.key}`} key={field.key} label={field.label} required={field.required} error={Boolean(fieldErrors[field.key])} fullWidth size="small" type={field.type === "textarea" ? "text" : field.type ?? "text"} multiline={field.type === "textarea"} minRows={field.type === "textarea" ? 4 : undefined} value={String(draft[field.key] ?? "")} onChange={(event) => { setDraft((current) => ({ ...current, [field.key]: event.target.value })); setFieldErrors((current) => ({ ...current, [field.key]: "" })); }} helperText={fieldErrors[field.key] || field.helperText} slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined} sx={{ gridColumn: field.type === "textarea" ? { sm: "1 / -1" } : undefined }} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E7EAEC" }}><Button onClick={() => setDialogMode(null)}>Cancelar</Button><Button variant="contained" onClick={saveDraft}>{dialogMode === "create" ? "Crear" : "Actualizar"}</Button></DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "2px" } } }}><DialogTitle sx={{ fontSize: 18 }}>¿Eliminar {config.singular}?</DialogTitle><DialogContent><Typography sx={{ color: "text.secondary", fontSize: 13 }}>Esta acción solo modifica los datos de demostración de la sesión actual.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="contained" color="error" onClick={removeSelected}>Eliminar</Button></DialogActions></Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage("")} message={message} />
    </Box>
  );
}
