"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
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
  type?: "text" | "number" | "date" | "textarea" | "file";
  options?: readonly string[];
  required?: boolean;
  helperText?: string;
  tab?: string;
  fullWidth?: boolean;
};

export type WorkbenchView = {
  value: string;
  label: string;
};

type ArticleDraft = {
  id: number;
  productCode: string;
  serialNumber: string;
  macAddress: string;
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
  detailKind?: "summary" | "map" | "network" | "billing" | "inventory";
  createLabel?: string;
  emptyLabel?: string;
  collectionLabel?: string;
  createDefaults?: Record<string, string | number | boolean>;
  createDialogTitle?: string;
  editDialogTitle?: string;
  createSubmitLabel?: string;
  updateSubmitLabel?: string;
  formLayout?: "grid" | "labelled";
  addItemsLabel?: string;
};

const surface = {
  minWidth: 0,
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

function InventoryDetailPanel({
  record,
  onEdit,
  onAddItems,
  addItemsLabel,
}: {
  record: DemoRecord;
  onEdit: () => void;
  onAddItems: () => void;
  addItemsLabel: string;
}) {
  const quantity = Number(record.cantidad ?? 0);
  const detailRows = [
    ["Marca", record.marca],
    ["Modelo", record.modelo],
    ["Tipo", record.unidad ?? "Unitario"],
    ["Stock mínimo", record.minimo ?? "—"],
    ["Stock máximo", record.maximo ?? "—"],
  ];

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 650, overflowWrap: "anywhere" }}>
            {String(record.marca ?? "Stock")} {String(record.modelo ?? "")}
          </Typography>
          <Typography sx={{ mt: 0.4, color: "#676A6C", fontSize: 12 }}>
            {String(record.tipo ?? "Equipo")}
          </Typography>
        </Box>
        <Chip
          label={String(record.estado ?? "Activo")}
          size="small"
          color={String(record.estado).toLocaleLowerCase("es-MX").includes("bajo") ? "warning" : "primary"}
          sx={{ height: 24, borderRadius: "2px", fontSize: 10 }}
        />
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Typography sx={{ color: "#4B4E51", fontSize: 13, fontWeight: 700 }}>
        Descripción de producto
      </Typography>
      {record.descripcion && (
        <Typography sx={{ mt: 0.6, color: "#676A6C", fontSize: 11.5, lineHeight: 1.5 }}>
          {String(record.descripcion)}
        </Typography>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1.5, mt: 1 }}>
        {detailRows.map(([label, value]) => (
          <Box key={String(label)} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.8, borderBottom: "1px solid #ECEEEF" }}>
            <Typography sx={{ color: "#676A6C", fontSize: 10.5, fontWeight: 600 }}>{String(label)}</Typography>
            <Typography sx={{ color: "#4B4E51", fontSize: 10.5, textAlign: "right", overflowWrap: "anywhere" }}>{String(value ?? "—")}</Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={{ mt: 2, color: "#4B4E51", fontSize: 13, fontWeight: 700 }}>
        Artículos
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 0.75, mt: 1 }}>
        <Chip label={`${quantity} Libres`} size="small" variant="outlined" sx={{ justifyContent: "flex-start", borderRadius: "2px" }} />
        <Chip label="0 Asignados" size="small" color="primary" variant="outlined" sx={{ justifyContent: "flex-start", borderRadius: "2px" }} />
        <Chip label="0 En mantenimiento" size="small" color="warning" variant="outlined" sx={{ justifyContent: "flex-start", borderRadius: "2px" }} />
        <Chip label="0 Inactivos" size="small" color="error" variant="outlined" sx={{ justifyContent: "flex-start", borderRadius: "2px" }} />
      </Box>

      <Typography sx={{ mt: 2, color: "#4B4E51", fontSize: 13, fontWeight: 700 }}>
        Auditorías
      </Typography>
      <Box sx={{ mt: 1, p: 1.25, backgroundColor: "#F5F5F5" }}>
        <Typography sx={{ color: "#676A6C", fontSize: 10.5 }}>
          Stock configurado para {String(record.marca ?? "el producto")} {String(record.modelo ?? "")}.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2 }}>
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
          Editar
        </Button>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAddItems} sx={{ boxShadow: "none" }}>
          {addItemsLabel}
        </Button>
      </Box>
    </>
  );
}

const articleStatusOptions = ["Libre", "Asignado", "Ocupado", "Mantenimiento", "Inactivo", "Robado"] as const;

function articleStatusColor(status: string): "default" | "primary" | "info" | "warning" | "error" | "success" {
  switch (status) {
    case "Libre": return "success";
    case "Asignado": return "primary";
    case "Ocupado": return "info";
    case "Mantenimiento": return "warning";
    case "Inactivo":
    case "Robado": return "error";
    default: return "default";
  }
}

function InventoryArticlesView({
  records,
  pageSize,
  onPageSizeChange,
  onEdit,
  onStatusChange,
  onNotify,
}: {
  records: readonly DemoRecord[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onEdit: (record: DemoRecord) => void;
  onStatusChange: (ids: readonly string[], status: string) => void;
  onNotify: (message: string) => void;
}) {
  const articleRecords = useMemo(() => records.filter((record) => record.view === "articulos"), [records]);
  const [searchMode, setSearchMode] = useState<"quick" | "bulk">("quick");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [articleStatus, setArticleStatus] = useState("Todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("Asignado");
  const [page, setPage] = useState(1);

  const filteredArticles = useMemo(() => articleRecords.filter((record) => {
    const equipmentHaystack = [record.codigo, record.serie, record.mac, record.marca, record.modelo]
      .join(" ")
      .toLocaleLowerCase("es-MX");
    const locationHaystack = [record.distribuidor, record.nodo, record.empleado, record.almacen, record.cliente, record.ubicacion]
      .join(" ")
      .toLocaleLowerCase("es-MX");
    const matchesEquipment = equipmentHaystack.includes(equipmentQuery.trim().toLocaleLowerCase("es-MX"));
    const matchesLocation = locationHaystack.includes(locationQuery.trim().toLocaleLowerCase("es-MX"));
    const matchesStatus = articleStatus === "Todos" || String(record.estado) === articleStatus;
    return matchesEquipment && matchesLocation && matchesStatus;
  }), [articleRecords, articleStatus, equipmentQuery, locationQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const firstVisibleIndex = (activePage - 1) * pageSize;
  const visibleArticles = filteredArticles.slice(firstVisibleIndex, firstVisibleIndex + pageSize);
  const visibleIds = visibleArticles.map((record) => record.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  function clearFilters() {
    setEquipmentQuery("");
    setLocationQuery("");
    setArticleStatus("Todos");
    setPage(1);
  }

  function toggleAllVisible() {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds])));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function applyBulkStatus() {
    if (selectedIds.length === 0) {
      onNotify("Selecciona al menos un artículo para actualizarlo.");
      return;
    }
    onStatusChange(selectedIds, bulkStatus);
    setSelectedIds([]);
  }

  const rangeStart = filteredArticles.length === 0 ? 0 : firstVisibleIndex + 1;
  const rangeEnd = Math.min(firstVisibleIndex + pageSize, filteredArticles.length);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", minWidth: 0, gap: 2 }}>
      <Box sx={surface}>
        <Tabs
          value={searchMode}
          onChange={(_, value) => setSearchMode(value)}
          aria-label="Modo de búsqueda de artículos"
          sx={{ minHeight: 48, px: { xs: 1, sm: 2 }, borderBottom: "1px solid #E7EAEC", "& .MuiTab-root": { minHeight: 48, px: 2, fontSize: 12, fontWeight: 650, textTransform: "none" } }}
        >
          <Tab value="quick" label="Búsqueda rápida" />
          <Tab value="bulk" label="Actualización masiva" />
        </Tabs>

        {searchMode === "quick" ? (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) minmax(0,1fr) auto" }, minWidth: 0, gap: 1 }}>
              <TextField
                size="small"
                value={equipmentQuery}
                onChange={(event) => { setEquipmentQuery(event.target.value); setPage(1); }}
                placeholder="Código, serie, MAC, marca o modelo"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#8A8C8E", fontSize: 19 }} /></InputAdornment> }, htmlInput: { "aria-label": "Buscar por datos del equipo" } }}
              />
              <TextField
                size="small"
                value={locationQuery}
                onChange={(event) => { setLocationQuery(event.target.value); setPage(1); }}
                placeholder="Distribuidor, nodo, empleado, almacén o cliente"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#8A8C8E", fontSize: 19 }} /></InputAdornment> }, htmlInput: { "aria-label": "Buscar por ubicación o responsable" } }}
              />
              <Button variant="text" onClick={clearFilters} disabled={!equipmentQuery && !locationQuery && articleStatus === "Todos"} sx={{ whiteSpace: "nowrap" }}>
                Limpiar filtros
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, overflowX: "auto", pb: 0.25 }}>
              {articleStatusOptions.map((status) => (
                <Button
                  key={status}
                  size="small"
                  variant={articleStatus === status ? "contained" : "outlined"}
                  aria-pressed={articleStatus === status}
                  onClick={() => { setArticleStatus((current) => current === status ? "Todos" : status); setPage(1); }}
                  sx={{ minWidth: "max-content", boxShadow: "none" }}
                >
                  {status}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(220px,340px) auto" }, alignItems: "center", gap: 1, p: { xs: 1.5, sm: 2 } }}>
            <TextField select size="small" label="Cambiar estado a" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
              {articleStatusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={applyBulkStatus} disabled={selectedIds.length === 0} sx={{ boxShadow: "none" }}>
                Aplicar a {selectedIds.length} {selectedIds.length === 1 ? "artículo" : "artículos"}
              </Button>
              <Typography sx={{ color: "#676A6C", fontSize: 12 }}>
                Marca las filas que deseas modificar.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={surface}>
        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 1, px: 1.75, py: 1.25, borderBottom: "1px solid #E7EAEC", flexWrap: "wrap" }}>
          <Typography sx={{ color: "#676A6C", fontSize: 12.5 }}>
            Mostrando artículos {rangeStart} - {rangeEnd} de {filteredArticles.length} en total
          </Typography>
          {selectedIds.length > 0 && <Chip label={`${selectedIds.length} seleccionados`} size="small" color="primary" sx={{ height: 24, borderRadius: "2px", fontSize: 10.5 }} />}
        </Box>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" aria-label="Listado de artículos de inventario" sx={{ minWidth: 1120 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={toggleAllVisible} slotProps={{ input: { "aria-label": "Seleccionar artículos visibles" } }} /></TableCell>
                <TableCell sx={{ width: 48, color: "#4B4E51", fontSize: 12, fontWeight: 700 }}>#</TableCell>
                {["Código de producto", "Número de serie", "MAC address", "Marca", "Modelo", "Ubicación", "Estado"].map((label) => <TableCell key={label} sx={{ color: "#4B4E51", fontSize: 12, fontWeight: 700 }}>{label}</TableCell>)}
                <TableCell align="right" sx={{ width: 112, color: "#4B4E51", fontSize: 12, fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleArticles.map((record, index) => (
                <TableRow key={record.id} hover selected={selectedIds.includes(record.id)} sx={{ "&.Mui-selected": { backgroundColor: "#BCE4F3" }, "&.Mui-selected:hover": { backgroundColor: "#ACD9EA" } }}>
                  <TableCell padding="checkbox"><Checkbox size="small" checked={selectedIds.includes(record.id)} onChange={() => toggleSelected(record.id)} slotProps={{ input: { "aria-label": `Seleccionar artículo ${String(record.codigo ?? record.id)}` } }} /></TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12 }}>{firstVisibleIndex + index + 1}</TableCell>
                  <TableCell sx={{ color: "#1C84C6", fontSize: 12, fontWeight: 650 }}>{String(record.codigo ?? "—")}</TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12 }}>{String(record.serie ?? "—")}</TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{String(record.mac ?? "—")}</TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12 }}>{String(record.marca ?? "—")}</TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12 }}>{String(record.modelo ?? "—")}</TableCell>
                  <TableCell sx={{ color: "#676A6C", fontSize: 12, lineHeight: 1.35 }}>
                    <Chip label={String(record.tipoUbicacion ?? "Almacén")} size="small" sx={{ height: 20, borderRadius: "2px", color: "#676A6C", backgroundColor: "#E7EAEC", fontSize: 9.5 }} />
                    <Typography component="span" sx={{ display: "block", mt: 0.25, color: "inherit", fontSize: "inherit" }}>{String(record.ubicacion ?? record.almacen ?? "—")}</Typography>
                  </TableCell>
                  <TableCell><Chip label={String(record.estado ?? "Libre")} size="small" color={articleStatusColor(String(record.estado ?? ""))} variant="outlined" sx={{ height: 23, borderRadius: "2px", fontSize: 10 }} /></TableCell>
                  <TableCell align="right">
                    <Tooltip title={String(record.estado) === "Inactivo" ? "Marcar como libre" : "Marcar como inactivo"}><IconButton size="small" color={String(record.estado) === "Inactivo" ? "primary" : "default"} aria-label={`Cambiar disponibilidad de ${String(record.codigo ?? record.id)}`} onClick={() => onStatusChange([record.id], String(record.estado) === "Inactivo" ? "Libre" : "Inactivo")} sx={{ width: 34, height: 34 }}><BlockOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Ver y editar información"><IconButton size="small" aria-label={`Ver información del artículo ${String(record.codigo ?? record.id)}`} onClick={() => onEdit(record)} sx={{ width: 34, height: 34 }}><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {visibleArticles.length === 0 && (
                <TableRow><TableCell colSpan={10}><Box sx={{ display: "grid", minHeight: 190, placeItems: "center", textAlign: "center" }}><Box><HelpOutlineRoundedIcon sx={{ color: "#8A8C8E", fontSize: 34 }} /><Typography sx={{ mt: 0.5, color: "#676A6C", fontSize: 14, fontWeight: 650 }}>No hay artículos que coincidan con los filtros.</Typography><Button sx={{ mt: 0.75 }} onClick={clearFilters}>Limpiar filtros</Button></Box></Box></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.25, borderTop: "1px solid #E7EAEC", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 5).map((pageNumber) => <Button key={pageNumber} size="small" variant={pageNumber === activePage ? "contained" : "outlined"} onClick={() => setPage(pageNumber)} sx={{ minWidth: 34, px: 0.5, boxShadow: "none" }}>{pageNumber}</Button>)}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, overflowX: "auto" }}>
            <Typography sx={{ mr: 0.5, color: "#676A6C", fontSize: 11 }}>Paginar de a</Typography>
            {[10, 20, 50, 100].map((size) => <Button key={size} size="small" variant={size === pageSize ? "contained" : "outlined"} aria-pressed={size === pageSize} onClick={() => { onPageSizeChange(size); setPage(1); }} sx={{ minWidth: 38, px: 0.5, boxShadow: "none" }}>{size}</Button>)}
          </Box>
        </Box>
      </Box>
    </Box>
  );
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
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [articleWarehouse, setArticleWarehouse] = useState("Central");
  const [articleDistributor, setArticleDistributor] = useState("RMA");
  const [articleRows, setArticleRows] = useState<ArticleDraft[]>([
    { id: 1, productCode: "", serialNumber: "", macAddress: "" },
  ]);
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
    setDraft({ ...config.createDefaults, ...emptyFromFields(config.fields) });
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

  function openAddItems() {
    setArticleWarehouse(String(selected?.almacen ?? "Central"));
    setArticleDistributor("RMA");
    setArticleRows([{ id: Date.now(), productCode: "", serialNumber: "", macAddress: "" }]);
    setAddItemsOpen(true);
  }

  function addArticleRow() {
    setArticleRows((current) => [
      ...current,
      { id: Date.now(), productCode: "", serialNumber: "", macAddress: "" },
    ]);
  }

  function saveArticles() {
    if (!selected) return;
    const completedRows = articleRows.filter((row) => row.productCode.trim());
    if (completedRows.length === 0) {
      setMessage("Agrega al menos un código de producto.");
      return;
    }
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== selected.id) return record;
        const quantity = Number(record.cantidad ?? 0) + completedRows.length;
        return {
          ...record,
          cantidad: quantity,
          disponibilidad: `${quantity} disponibles`,
          estado: "En stock",
          almacen: articleWarehouse,
          distribuidor: articleDistributor,
        };
      }),
    );
    setAddItemsOpen(false);
    setMessage(
      `${completedRows.length} ${completedRows.length === 1 ? "artículo agregado" : "artículos agregados"} al stock.`,
    );
  }

  function updateArticleStatuses(ids: readonly string[], status: string) {
    setRecords((current) => current.map((record) => ids.includes(record.id) ? { ...record, estado: status, disponibilidad: status } : record));
    setMessage(`${ids.length} ${ids.length === 1 ? "artículo actualizado" : "artículos actualizados"} a ${status}.`);
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
          {!(config.detailKind === "inventory" && view === "articulos") && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate} sx={{ flex: { xs: 1, sm: "initial" }, boxShadow: "none" }}>{config.createLabel ?? `Crear ${config.singular}`}</Button>
          )}
        </Box>
      </Box>

      {config.views && (
        <Tabs value={view} onChange={(_, value) => setView(value)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 42, mb: 1.5, borderBottom: "1px solid #DDE2E6", "& .MuiTab-root": { minHeight: 42, px: 2, py: 1, fontSize: 12, textTransform: "none" } }}>
          {config.views.map((item) => <Tab key={item.value} value={item.value} label={item.label} />)}
        </Tabs>
      )}

      {config.detailKind === "inventory" && view === "articulos" ? (
        <InventoryArticlesView
          records={records}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onEdit={openEdit}
          onStatusChange={updateArticleStatuses}
          onNotify={setMessage}
        />
      ) : <>
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
          {selected ? (
            config.detailKind === "inventory" && view === "stock" ? (
              <InventoryDetailPanel
                record={selected}
                onEdit={() => openEdit()}
                onAddItems={openAddItems}
                addItemsLabel={config.addItemsLabel ?? "Agregar artículos"}
              />
            ) : (
              <>
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
              </>
            )
          ) : (
            <Box sx={{ display: "grid", minHeight: 250, placeItems: "center", textAlign: "center" }}><Typography sx={{ color: "#8A8C8E", fontSize: 13 }}>Selecciona un registro para ver sus detalles.</Typography></Box>
          )}
        </Box>
      </Box>
      </>}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}><MenuItem onClick={exportDemo}>Exportar CSV de demostración</MenuItem><MenuItem onClick={() => { setMenuAnchor(null); setMessage("Vista de impresión preparada para demostración."); }}>Preparar vista de impresión</MenuItem></Menu>

      <Dialog open={Boolean(dialogMode)} onClose={() => setDialogMode(null)} fullScreen={mobileDialog} fullWidth maxWidth="lg" scroll="paper" slotProps={{ paper: { sx: { borderRadius: mobileDialog ? 0 : "2px" } } }}>
        <DialogTitle sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 600 }}>{dialogMode === "create" ? (config.createDialogTitle ?? `Crear ${config.singular}`) : (config.editDialogTitle ?? `Editar ${config.singular}`)}<Typography sx={{ mt: 0.35, color: "#8A8C8E", fontSize: 11.5 }}>Los cambios solo existen en esta demostración local.</Typography></DialogTitle>
        {config.formTabs && <Tabs value={formTab} onChange={(_, value) => setFormTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderTop: "1px solid #E7EAEC", borderBottom: "1px solid #E7EAEC", "& .MuiTab-root": { minHeight: 46, textTransform: "none", fontSize: 12 } }}>{config.formTabs.map((tab) => <Tab key={tab} value={tab} label={tab} />)}</Tabs>}
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: config.formLayout === "labelled" ? "1fr" : { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2 }}>
            {visibleFields.map((field) => {
              const fieldId = `workbench-field-${field.key}`;
              const label = config.formLayout === "labelled" ? undefined : field.label;
              const commonChange = (value: string) => {
                setDraft((current) => ({ ...current, [field.key]: value }));
                setFieldErrors((current) => ({ ...current, [field.key]: "" }));
              };
              let control;

              if (field.type === "file") {
                control = (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                    <Button component="label" variant="outlined" startIcon={<ImageOutlinedIcon />}>
                      Seleccionar imagen
                      <input hidden type="file" accept="image/*" onChange={(event) => commonChange(event.target.files?.[0]?.name ?? "")} />
                    </Button>
                    <Typography sx={{ color: "#8A8C8E", fontSize: 11.5 }}>
                      {String(draft[field.key] || "Ninguna imagen seleccionada")}
                    </Typography>
                  </Box>
                );
              } else if (field.options) {
                control = (
                  <TextField id={fieldId} label={label} required={field.required} error={Boolean(fieldErrors[field.key])} select fullWidth size="small" value={String(draft[field.key] ?? field.options[0])} onChange={(event) => commonChange(event.target.value)} helperText={fieldErrors[field.key] || field.helperText}>
                    {field.options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                  </TextField>
                );
              } else {
                control = (
                  <TextField id={fieldId} label={label} required={field.required} error={Boolean(fieldErrors[field.key])} fullWidth size="small" type={field.type === "textarea" ? "text" : field.type ?? "text"} multiline={field.type === "textarea"} minRows={field.type === "textarea" ? 3 : undefined} value={String(draft[field.key] ?? "")} onChange={(event) => commonChange(event.target.value)} helperText={fieldErrors[field.key] || field.helperText} slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined} />
                );
              }

              return (
                <Box
                  key={field.key}
                  sx={
                    config.formLayout === "labelled"
                      ? { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "170px minmax(0,1fr)" }, alignItems: field.type === "textarea" ? "start" : "center", gap: { xs: 0.75, sm: 2 } }
                      : { gridColumn: field.fullWidth || field.type === "textarea" || field.type === "file" ? { sm: "1 / -1" } : undefined }
                  }
                >
                  {config.formLayout === "labelled" && (
                    <Typography component="label" htmlFor={fieldId} sx={{ pt: field.type === "textarea" ? 1 : 0, color: "#676A6C", fontSize: 12, fontWeight: 600, textAlign: { sm: "right" } }}>
                      {field.required ? "* " : ""}{field.label}
                    </Typography>
                  )}
                  {control}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E7EAEC" }}>
          {dialogMode === "edit" && config.detailKind === "inventory" && (
            <Button color="error" onClick={() => { setDialogMode(null); setDeleteOpen(true); }} sx={{ mr: "auto" }}>
              Eliminar
            </Button>
          )}
          <Button onClick={() => setDialogMode(null)}>Cerrar</Button>
          <Button variant="contained" onClick={saveDraft} sx={{ boxShadow: "none" }}>
            {dialogMode === "create" ? (config.createSubmitLabel ?? "Crear") : (config.updateSubmitLabel ?? "Actualizar")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addItemsOpen} onClose={() => setAddItemsOpen(false)} fullScreen={mobileDialog} fullWidth maxWidth="md" scroll="paper" slotProps={{ paper: { sx: { borderRadius: mobileDialog ? 0 : "2px" } } }}>
        <DialogTitle sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 600 }}>
          Agregar artículos
          <Typography sx={{ mt: 0.35, color: "#8A8C8E", fontSize: 11.5 }}>
            {selected ? `${String(selected.marca ?? "")} ${String(selected.modelo ?? "")}` : "Stock seleccionado"} · datos de demostración
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField select size="small" label="Almacén" required value={articleWarehouse} onChange={(event) => setArticleWarehouse(event.target.value)}>
              {['Central', 'Técnicos', 'Devoluciones'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Distribuidor" required value={articleDistributor} onChange={(event) => setArticleDistributor(event.target.value)}>
              {['RMA', 'Proveedor local', 'Importación'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ mt: 2.5 }}>
            {articleRows.map((row, index) => (
              <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr auto" }, alignItems: "start", gap: 1, mb: 1 }}>
                <TextField autoFocus={index === 0} size="small" required label="Código de producto" value={row.productCode} onChange={(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, productCode: event.target.value } : item))} />
                <TextField size="small" label="Número de serie" value={row.serialNumber} onChange={(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, serialNumber: event.target.value } : item))} />
                <TextField size="small" label="MAC address" value={row.macAddress} onChange={(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, macAddress: event.target.value } : item))} />
                <Tooltip title="Eliminar fila">
                  <span>
                    <IconButton aria-label={`Eliminar artículo ${index + 1}`} color="error" disabled={articleRows.length === 1} onClick={() => setArticleRows((current) => current.filter((item) => item.id !== row.id))}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
            <Button startIcon={<AddRoundedIcon />} onClick={addArticleRow}>
              Agregar otro artículo
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E7EAEC" }}>
          <Button onClick={() => setAddItemsOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={saveArticles} sx={{ boxShadow: "none" }}>
            {config.addItemsLabel ?? "Agregar artículos"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "2px" } } }}><DialogTitle sx={{ fontSize: 18 }}>¿Eliminar {config.singular}?</DialogTitle><DialogContent><Typography sx={{ color: "text.secondary", fontSize: 13 }}>Esta acción solo modifica los datos de demostración de la sesión actual.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="contained" color="error" onClick={removeSelected}>Eliminar</Button></DialogActions></Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage("")} message={message} />
    </Box>
  );
}
