"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

type Plan = {
  id: number;
  name: string;
  contracts: number;
  suspended: number;
  upload: string;
  download: string;
  burst: boolean;
  schedule: boolean;
  price: string;
  frequency: string;
};

const initialPlans: readonly Plan[] = [
  { id: 1, name: "Hidalgo · 10 Mbps", contracts: 0, suspended: 0, upload: "10mbps", download: "10mbps", burst: false, schedule: false, price: "$299.00", frequency: "Mensual" },
  { id: 2, name: "Hidalgo · 25 Mbps", contracts: 0, suspended: 0, upload: "25mbps", download: "25mbps", burst: false, schedule: false, price: "$399.00", frequency: "Mensual" },
  { id: 3, name: "Hidalgo · 40 Mbps", contracts: 0, suspended: 0, upload: "40mbps", download: "40mbps", burst: false, schedule: false, price: "$559.00", frequency: "Mensual" },
  { id: 4, name: "Teotihuacán · 25 Mbps", contracts: 0, suspended: 0, upload: "25mbps", download: "25mbps", burst: false, schedule: false, price: "$289.00", frequency: "Mensual" },
  { id: 5, name: "Teotihuacán · 40 Mbps", contracts: 0, suspended: 0, upload: "40mbps", download: "40mbps", burst: false, schedule: false, price: "$389.00", frequency: "Mensual" },
  { id: 6, name: "Teotihuacán · 60 Mbps", contracts: 0, suspended: 0, upload: "60mbps", download: "60mbps", burst: false, schedule: false, price: "$549.00", frequency: "Mensual" },
] as const;

const columnOptions = [
  { key: "contracts", label: "Contratos" },
  { key: "burst", label: "Explosión" },
  { key: "schedule", label: "Control del tiempo" },
  { key: "price", label: "Precio" },
  { key: "frequency", label: "Frecuencia" },
] as const;

type PlanColumnKey = (typeof columnOptions)[number]["key"];

const thStyles = {
  height: 52,
  px: 1,
  py: 0.75,
  color: "#676A6C",
  backgroundColor: "#FDFDFD",
  borderBottom: "1px solid #E4E4E4",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
} as const;

const tdStyles = {
  height: 98,
  px: 1,
  py: 0.75,
  color: "#676A6C",
  borderBottom: "1px solid #E8E8E8",
  fontSize: 12,
  lineHeight: 1.35,
} as const;

function ContractsRing({ active, suspended }: { active: number; suspended: number }) {
  const hasContracts = active + suspended > 0;
  const total = Math.max(active + suspended, 1);
  const suspendedShare = Math.max(4, Math.round((suspended / total) * 100));

  return (
    <Tooltip title={`${active} contratos activos · ${suspended} suspendidos`}>
      <Box
        aria-label={`${active} contratos activos y ${suspended} suspendidos`}
        sx={{
          position: "relative",
          display: "grid",
          width: 64,
          height: 64,
          mx: "auto",
          placeItems: "center",
          borderRadius: "50%",
          background: hasContracts ? `conic-gradient(#8178DD 0 ${100 - suspendedShare}%, #43C5CF ${100 - suspendedShare}% 100%)` : "#D7D9DB",
          "&::after": {
            position: "absolute",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#FDFDFD",
            content: '""',
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Typography sx={{ color: "#8178DD", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{active}</Typography>
          <Typography sx={{ mt: 0.35, color: "#43C5CF", fontSize: 9, fontWeight: 700, lineHeight: 1 }}>{suspended}</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

function SpeedBadge({ direction, value }: { direction: "up" | "down"; value: string }) {
  const up = direction === "up";
  const Icon = up ? NorthRoundedIcon : SouthRoundedIcon;

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.5, py: 0.35, border: "1px solid #E0E0E0", borderRadius: "3px", backgroundColor: "#FFFFFF", whiteSpace: "nowrap" }}>
      <Box sx={{ display: "grid", width: 16, height: 16, placeItems: "center", color: up ? "#F16A73" : "#72BA79", border: `1px solid ${up ? "#F3A5AA" : "#9FD1A4"}`, borderRadius: "50%" }}>
        <Icon sx={{ fontSize: 12 }} />
      </Box>
      <Typography component="span" sx={{ color: "#6B6D70", fontSize: 12, fontWeight: 600, lineHeight: 1 }}>{value}</Typography>
    </Box>
  );
}

function DetailSection({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{ mb: 2.5, overflow: "hidden", border: "1px solid #DCDCDC", borderRadius: "3px" }}>
      <Button
        fullWidth
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        sx={{ minHeight: 39, justifyContent: "flex-start", gap: 0.6, px: 1, color: "#676A6C", backgroundColor: "#F5F5F5", borderRadius: 0, fontSize: 13, fontWeight: 500, "&:hover": { backgroundColor: "#EFEFEF" } }}
      >
        {icon}<span>{title}</span>
        <KeyboardArrowDownRoundedIcon sx={{ ml: "auto", fontSize: 18, transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 160ms ease" }} />
      </Button>
      <Collapse in={open}><Box sx={{ px: 1, py: 0.8, backgroundColor: "#FFFFFF" }}>{children}</Box></Collapse>
    </Box>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, py: 0.35 }}>
      <Typography sx={{ maxWidth: "68%", color: "#7A7C7E", fontSize: 12.5, lineHeight: 1.35 }}>{label}</Typography>
      <Typography sx={{ color: "#676A6C", fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}

function PlanDetail({ plan }: { plan: Plan }) {
  return (
    <Box component="aside" aria-label={`Detalle de ${plan.name}`} sx={{ minWidth: 0, height: { lg: "calc(100dvh - 170px)" }, minHeight: 520, overflowY: "auto", border: "1px solid #DCDCDC", borderRadius: "8px", backgroundColor: "#FDFDFD" }}>
      <Box sx={{ px: 1.25, pt: 1.15, pb: 1.25 }}>
        <Typography component="h2" sx={{ color: "#676A6C", fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{plan.name}</Typography>
        <Box sx={{ mt: 0.7, borderBottom: "1px solid #E4E4E4" }} />
      </Box>
      <Box sx={{ px: 1.25 }}>
        <DetailSection title="Mikrotik" icon={<RouterOutlinedIcon sx={{ fontSize: 17 }} />}><DetailLine label="Estrategia de ancho de banda garantizado" value="Colas simples" /><DetailLine label="CIR" value="1:1" /></DetailSection>
        <DetailSection title="Ráfaga Máx. subida" icon={<BoltRoundedIcon sx={{ fontSize: 18 }} />}><DetailLine label="Ráfaga Máx. subida" value="28000 kbps" /><DetailLine label="Límite subida (threshold)" value="24000 kbps" /><DetailLine label="Chequeo activación de Ráfaga de subida" value="60 Seg" /><DetailLine label="Duración de Ráfaga" value="51.43 Seg" /></DetailSection>
        <DetailSection title="Ráfaga Máx. Bajada" icon={<BoltRoundedIcon sx={{ fontSize: 18 }} />}><DetailLine label="Ráfaga Máx. Bajada" value="28000 kbps" /><DetailLine label="Límite bajada (threshold)" value="24000 kbps" /><DetailLine label="Chequeo activación de Ráfaga de bajada" value="60 Seg" /><DetailLine label="Duración de Ráfaga" value="51.43 Seg" /></DetailSection>
      </Box>
    </Box>
  );
}

type CreatePlanDraft = {
  name: string;
  maxUpload: string;
  uploadUnit: string;
  maxDownload: string;
  downloadUnit: string;
  visible: boolean;
  price: string;
  mikrotikStrategy: string;
  burstEnabled: boolean;
  productCode: string;
  firstInterestCode: string;
  secondInterestCode: string;
  reconnectionCode: string;
  installationCode: string;
};

const emptyPlanDraft: CreatePlanDraft = {
  name: "",
  maxUpload: "0",
  uploadUnit: "kbps",
  maxDownload: "0",
  downloadUnit: "kbps",
  visible: true,
  price: "",
  mikrotikStrategy: "Colas simples",
  burstEnabled: false,
  productCode: "",
  firstInterestCode: "",
  secondInterestCode: "",
  reconnectionCode: "",
  installationCode: "",
};

const wisproInputSx = {
  "& .MuiOutlinedInput-root": { height: 39, borderRadius: 0, color: "#4B4E51", backgroundColor: "#FFFFFF", fontSize: 14 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D8DDE1" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#B8BEC3" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1, borderColor: "#1C84C6" },
} as const;

const strategyMenuItemSx = {
  color: "#4B4E51",
  fontSize: 13,
  "&.Mui-selected, &.Mui-selected:hover": { color: "#FFFFFF", backgroundColor: "#2F80ED" },
} as const;

function WisproField({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="label" sx={{ display: "block", mb: 0.65, color: "#4B4E51", fontSize: 13, fontWeight: 700 }}>
        {required && <Box component="span" aria-hidden="true">*:</Box>}{label}
      </Typography>
      {children}
    </Box>
  );
}

function CreatePlanDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (draft: CreatePlanDraft) => void }) {
  const [tab, setTab] = useState<"basic" | "mikrotik" | "product">("basic");
  const [draft, setDraft] = useState<CreatePlanDraft>(emptyPlanDraft);
  const [submitted, setSubmitted] = useState(false);
  const updateDraft = <Key extends keyof CreatePlanDraft>(key: Key, value: CreatePlanDraft[Key]) => setDraft((current) => ({ ...current, [key]: value }));
  const close = () => { setTab("basic"); setSubmitted(false); onClose(); };
  const create = () => {
    setSubmitted(true);
    if (!draft.name.trim() || !draft.price.trim()) { setTab("basic"); return; }
    onCreate(draft);
    setDraft(emptyPlanDraft);
    setSubmitted(false);
    setTab("basic");
  };

  const tabs = [
    { id: "basic" as const, label: "Básico", icon: <SettingsRoundedIcon sx={{ fontSize: 18 }} /> },
    { id: "mikrotik" as const, label: "Mikrotik", icon: <RouterOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "product" as const, label: "Código de producto", icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
  ];

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth={false}
      fullWidth
      aria-labelledby="create-plan-title"
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" }, "& .MuiBackdrop-root": { backgroundColor: "rgba(0,0,0,.55)" } }}
      slotProps={{ paper: { sx: { width: { xs: "100%", md: 980 }, maxWidth: 980, height: "100dvh", maxHeight: "none", m: 0, borderRadius: 0, backgroundColor: "#FDFDFD", boxShadow: "0 8px 30px rgba(0,0,0,.28)" } } }}
    >
      <DialogTitle id="create-plan-title" sx={{ display: "flex", minHeight: 30, alignItems: "center", py: 0, pr: 2.5, pl: { xs: 2, md: 5 }, color: "#4B4E51", borderBottom: "1px solid #E3E5E7", fontSize: 16, fontWeight: 700 }}>
        Crear nuevo Plan
        <IconButton aria-label="Cerrar" onClick={close} sx={{ width: 28, height: 28, ml: "auto", color: "#C7C9CB" }}><CloseRoundedIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>

      <Box role="tablist" aria-label="Secciones del nuevo plan" sx={{ display: "flex", minHeight: 70, alignItems: "flex-end", gap: 0.5, px: { xs: 1.5, md: 5 }, overflowX: "auto", borderBottom: "1px solid #DFE3E6" }}>
        {tabs.map((item) => {
          const active = tab === item.id;
          return <Button key={item.id} role="tab" aria-selected={active} onClick={() => setTab(item.id)} startIcon={item.icon} sx={{ position: "relative", minWidth: "max-content", minHeight: 51, px: { xs: 1.5, md: 3.5 }, color: active ? "#4B4E51" : "#5F6265", border: active ? "1px solid #DFE3E6" : "1px solid transparent", borderBottomColor: active ? "#FDFDFD" : "transparent", borderRadius: 0, boxShadow: active && item.id !== "basic" ? "inset 0 0 0 2px #161616" : "none", transform: "translateY(1px)", fontSize: 14, fontWeight: active ? 700 : 400, textTransform: "none", "&::before": active ? { position: "absolute", top: -1, bottom: -1, left: -1, width: 4, backgroundColor: "#1C84C6", content: '""' } : undefined, "&:hover": { backgroundColor: "#F6F7F8" } }}>{item.label}</Button>;
        })}
      </Box>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        <Box sx={{ minHeight: tab === "mikrotik" ? 202 : tab === "product" ? 292 : "auto", mx: { xs: 1.5, md: 5 }, p: { xs: 2, md: "32px 49px 40px" }, borderRight: "1px solid #DFE3E6", borderBottom: "1px solid #DFE3E6", borderLeft: "1px solid #DFE3E6", backgroundColor: "#FFFFFF" }}>
          {tab === "basic" && <Box role="tabpanel" aria-label="Básico">
            <WisproField label="Nombre" required><TextField value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} error={submitted && !draft.name.trim()} helperText={submitted && !draft.name.trim() ? "El nombre es obligatorio." : ""} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Nombre alfanumérico", inputMode: "text", autoComplete: "off" } }} sx={{ ...wisproInputSx, "& .MuiFormHelperText-root": { mx: 0, mt: 0.5 } }} /></WisproField>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: { xs: 2, md: 6 }, mt: 2 }}>
              <WisproField label="Máx. Subida" required><TextField value={draft.maxUpload} onChange={(event) => updateDraft("maxUpload", event.target.value)} type="number" fullWidth size="small" slotProps={{ htmlInput: { min: 0, "aria-label": "Máxima subida" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Unidad de subida" required><TextField select value={draft.uploadUnit} onChange={(event) => updateDraft("uploadUnit", event.target.value)} fullWidth size="small" slotProps={{ select: { "aria-label": "Unidad de subida" } }} sx={wisproInputSx}><MenuItem value="kbps">kbps</MenuItem><MenuItem value="mbps">mbps</MenuItem></TextField></WisproField>
              <WisproField label="Máx. Bajada" required><TextField value={draft.maxDownload} onChange={(event) => updateDraft("maxDownload", event.target.value)} type="number" fullWidth size="small" slotProps={{ htmlInput: { min: 0, "aria-label": "Máxima bajada" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Unidad de bajada" required><TextField select value={draft.downloadUnit} onChange={(event) => updateDraft("downloadUnit", event.target.value)} fullWidth size="small" slotProps={{ select: { "aria-label": "Unidad de bajada" } }} sx={wisproInputSx}><MenuItem value="kbps">kbps</MenuItem><MenuItem value="mbps">mbps</MenuItem></TextField></WisproField>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 0.25, color: "#4B4E51", fontSize: 13, fontWeight: 700 }}>Público</Typography>
              <FormControlLabel control={<Checkbox checked={draft.visible} onChange={(event) => updateDraft("visible", event.target.checked)} size="small" sx={{ color: "#1C84C6", "&.Mui-checked": { color: "#1C84C6" } }} />} label="Visible para los clientes desde la aplicación móvil" sx={{ m: 0, color: "#5F6265", "& .MuiFormControlLabel-label": { fontSize: 14 } }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 2.5, mb: 2.5, pb: 0.75, color: "#5B5E61", borderBottom: "1px solid #E0E3E5" }}><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Facturación</Typography></Box>
            <WisproField label="Precio" required><TextField value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} error={submitted && !draft.price.trim()} fullWidth size="small" type="number" slotProps={{ htmlInput: { min: 0, step: "0.01", "aria-label": "Precio" } }} sx={wisproInputSx} /></WisproField>
            <Typography sx={{ mt: 0.35, color: "#5F6265", fontSize: 12.5 }}><Box component="span" sx={{ fontWeight: 700 }}>IMPORTANTE:</Box> El valor es precio final, por lo que incluye cualquier tipo de impuesto en el monto.</Typography>
          </Box>}

          {tab === "mikrotik" && <Box role="tabpanel" aria-label="Mikrotik">
            <Box sx={{ maxWidth: 368 }}>
              <WisproField label="Estrategia de ancho de banda"><TextField select value={draft.mikrotikStrategy} onChange={(event) => updateDraft("mikrotikStrategy", event.target.value)} fullWidth size="small" slotProps={{ select: { "aria-label": "Estrategia de ancho de banda" } }} sx={wisproInputSx}><MenuItem value="Colas simples" sx={strategyMenuItemSx}>Colas simples</MenuItem><MenuItem value="pcq_w_queue_tree" sx={strategyMenuItemSx}>pcq_w_queue_tree</MenuItem><MenuItem value="pcq_w_simple_queue" sx={strategyMenuItemSx}>pcq_w_simple_queue</MenuItem><MenuItem value="Colas simples con cake" sx={strategyMenuItemSx}>Colas simples con cake</MenuItem></TextField></WisproField>
              <Box sx={{ mt: 2 }}><WisproField label="Ráfagas habilitadas"><Button role="switch" aria-label="Ráfagas habilitadas" aria-checked={draft.burstEnabled} onClick={() => updateDraft("burstEnabled", !draft.burstEnabled)} sx={{ position: "relative", minWidth: 60, width: 60, height: 26, justifyContent: draft.burstEnabled ? "flex-start" : "flex-end", px: 1, color: draft.burstEnabled ? "#FFFFFF" : "#676A6C", border: "1px solid #1C84C6", borderRadius: "2px", backgroundColor: draft.burstEnabled ? "#1C84C6" : "#EFF1F2", fontSize: 10, lineHeight: 1, "&::before": { position: "absolute", top: 0, bottom: 0, left: draft.burstEnabled ? 44 : 0, width: 14, backgroundColor: "#FFFFFF", content: '""', transition: "left 160ms ease-out" }, "&:hover": { backgroundColor: draft.burstEnabled ? "#166B9F" : "#E6E8EA" } }}>{draft.burstEnabled ? "ON" : "OFF"}</Button></WisproField></Box>
            </Box>
          </Box>}

          {tab === "product" && <Box role="tabpanel" aria-label="Código de producto">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: { md: 7.5 }, rowGap: 2 }}>
              <WisproField label="Código de producto"><TextField value={draft.productCode} onChange={(event) => updateDraft("productCode", event.target.value)} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Código de producto" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Código de producto interes primer vencimiento"><TextField value={draft.firstInterestCode} onChange={(event) => updateDraft("firstInterestCode", event.target.value)} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Código de producto interés primer vencimiento" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Código de producto interés segundo vencimiento"><TextField value={draft.secondInterestCode} onChange={(event) => updateDraft("secondInterestCode", event.target.value)} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Código de producto interés segundo vencimiento" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Código de producto cargo por reconexión"><TextField value={draft.reconnectionCode} onChange={(event) => updateDraft("reconnectionCode", event.target.value)} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Código de producto cargo por reconexión" } }} sx={wisproInputSx} /></WisproField>
              <WisproField label="Código de producto de instalación"><TextField value={draft.installationCode} onChange={(event) => updateDraft("installationCode", event.target.value)} fullWidth size="small" slotProps={{ htmlInput: { "aria-label": "Código de producto de instalación" } }} sx={wisproInputSx} /></WisproField>
            </Box>
          </Box>}
        </Box>
        <DialogActions sx={{ mx: { xs: 1.5, md: 5 }, mt: 2.5, px: 0, py: 2.5, borderTop: "1px solid #E3E5E7" }}><Button onClick={close} sx={{ minHeight: { xs: 44, sm: 28 }, px: 1.25, color: "#676A6C", borderRadius: "2px", backgroundColor: "#F2F2F2", fontSize: 12 }}>Cancelar</Button><Tooltip title="Ayuda para crear un plan"><IconButton aria-label="Ayuda para crear un plan" onClick={() => setTab("basic")} sx={{ width: { xs: 44, sm: 28 }, height: { xs: 44, sm: 28 }, color: "#1C84C6" }}><HelpOutlineRoundedIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip><Button variant="contained" onClick={create} sx={{ minHeight: { xs: 44, sm: 28 }, px: 1.25, borderRadius: "2px", boxShadow: "none", fontSize: 12 }}>Crear</Button></DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export function PlanesModule() {
  const [planList, setPlanList] = useState<Plan[]>(() => [...initialPlans]);
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [priceQuery, setPriceQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [detailVisible, setDetailVisible] = useState(true);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<PlanColumnKey, boolean>>({ contracts: true, burst: true, schedule: true, price: true, frequency: true });
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState("");
  const filteredPlans = useMemo(() => {
    const normalizedName = query.trim().toLocaleLowerCase("es-MX");
    const normalizedPrice = priceQuery.trim().replace(/[$,\s]/g, "");
    return planList.filter((plan) => {
      const matchesName = !normalizedName || plan.name.toLocaleLowerCase("es-MX").includes(normalizedName);
      const matchesPrice = !normalizedPrice || plan.price.replace(/[$,\s]/g, "").includes(normalizedPrice);
      return matchesName && matchesPrice;
    });
  }, [planList, priceQuery, query]);
  const selected = planList.find((plan) => plan.id === selectedId) ?? planList[0];
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const pageStart = filteredPlans.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredPlans.length);
  const visiblePlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);
  const visibleColumnCount = columnOptions.filter(({ key }) => visibleColumns[key]).length;
  const openColumnMenu = (event: ReactMouseEvent<HTMLElement>) => setColumnMenuAnchor(event.currentTarget);
  const toggleColumn = (key: PlanColumnKey) => setVisibleColumns((current) => ({ ...current, [key]: !current[key] }));
  const createPlan = (draft: CreatePlanDraft) => {
    const nextId = Math.max(0, ...planList.map((plan) => plan.id)) + 1;
    const numericPrice = Number(draft.price);
    const newPlan: Plan = { id: nextId, name: draft.name.trim(), contracts: 0, suspended: 0, upload: `${draft.maxUpload}${draft.uploadUnit}`, download: `${draft.maxDownload}${draft.downloadUnit}`, burst: draft.burstEnabled, schedule: false, price: Number.isFinite(numericPrice) ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(numericPrice) : draft.price, frequency: "Mensual" };
    setPlanList((current) => [...current, newPlan]);
    setSelectedId(nextId);
    setCreateOpen(false);
    setMessage(`Plan “${newPlan.name}” creado localmente.`);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "calc(100dvh - 54px)", pb: 5, backgroundColor: "#FFFFFF" }}>
      <Box component="header" sx={{ display: "flex", minHeight: 56, alignItems: "center", gap: { xs: 0.75, sm: 1.2 }, px: { xs: 1.5, md: 2.5 }, borderBottom: "1px solid #E7EAEC" }}>
        <HelpOutlineRoundedIcon sx={{ color: "#1C84C6", fontSize: 26 }} />
        <Typography component="h1" sx={{ color: "#676A6C", fontSize: { xs: 20, sm: 22 }, fontWeight: 400, lineHeight: 1 }}>Planes</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, ml: 0.4, color: "#1C84C6", fontSize: 12 }}>Inicio</Typography><Typography sx={{ display: { xs: "none", sm: "block" }, color: "#A2A4A6", fontSize: 12 }}>/</Typography><Typography sx={{ display: { xs: "none", sm: "block" }, color: "#676A6C", fontSize: 12 }}>Planes</Typography>
        <Button variant="contained" size="small" startIcon={<AddRoundedIcon sx={{ fontSize: "17px !important" }} />} onClick={() => setCreateOpen(true)} sx={{ ml: "auto", minHeight: { xs: 44, sm: 28 }, px: 1.25, borderRadius: "3px", boxShadow: "none", fontSize: 12, whiteSpace: "nowrap" }}><Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Crear nuevo Plan</Box><Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Crear</Box></Button>
      </Box>

      <Box sx={{ px: { xs: 1.25, md: 2 }, pt: 1.25 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr) 44px", sm: "minmax(0,1fr) 175px" }, alignItems: "center", gap: { xs: 0.75, md: 3.5 }, mb: 2, pl: { lg: "10%" } }}>
          <TextField value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Puedes buscar por: Nombre, Precio" size="small" fullWidth slotProps={{ htmlInput: { "aria-label": "Buscar planes por nombre o precio" }, input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#676A6C", fontSize: 20 }} /></InputAdornment> } }} sx={{ flex: 1, "& .MuiOutlinedInput-root": { height: { xs: 44, sm: 33 }, borderRadius: "30px", backgroundColor: "#FDFDFD", fontSize: 15 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#C1C3C4" }, "& input::placeholder": { color: "#676A6C", opacity: 1 } }} />
          <Button variant="outlined" startIcon={<SearchRoundedIcon sx={{ fontSize: "18px !important" }} />} onClick={() => setAdvancedOpen((current) => !current)} aria-expanded={advancedOpen} aria-label="Búsqueda avanzada" sx={{ minWidth: 0, width: "100%", height: { xs: 44, sm: 33 }, px: { xs: 0, sm: 2 }, color: "#676A6C", borderColor: "#C8CACC", borderRadius: "30px", fontSize: 12, whiteSpace: "nowrap", "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } } }}><Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Búsqueda Avanzada</Box></Button>
        </Box>

        <Collapse in={advancedOpen}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, alignItems: "center", gap: 1, mb: 2, p: 1.25, border: "1px solid #DCDCDC", borderRadius: 0, backgroundColor: "#FAFAFA" }}><TextField size="small" placeholder="Nombre" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} fullWidth slotProps={{ htmlInput: { "aria-label": "Filtrar por nombre" } }} sx={{ "& .MuiOutlinedInput-root": { height: 38, borderRadius: 0, backgroundColor: "#FFFFFF" }, "& input": { py: 0, color: "#4B4E51", fontSize: 14 }, "& input::placeholder": { color: "#676A6C", opacity: 1 } }} /><TextField size="small" placeholder="Precio" value={priceQuery} onChange={(event) => { setPriceQuery(event.target.value); setPage(1); }} fullWidth slotProps={{ htmlInput: { "aria-label": "Filtrar por precio", inputMode: "decimal" } }} sx={{ "& .MuiOutlinedInput-root": { height: 38, borderRadius: 0, backgroundColor: "#FFFFFF" }, "& input": { py: 0, color: "#4B4E51", fontSize: 14 }, "& input::placeholder": { color: "#676A6C", opacity: 1 } }} /></Box>
        </Collapse>

        <Box sx={{ display: "grid", gridTemplateColumns: detailVisible ? { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 305px" } : "minmax(0,1fr)", gap: 0.5, alignItems: "start" }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", minHeight: 60, alignItems: "center", gap: 0.75, px: 1.25, mb: 0.75, border: "1px solid #DCDCDC", borderRadius: "8px", backgroundColor: "#FDFDFD" }}>
              <Typography sx={{ color: "#676A6C", fontSize: 12 }}>Paginar de a</Typography>
              <Select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} size="small" variant="standard" disableUnderline aria-label="Cantidad de planes por página" sx={{ minWidth: { xs: 44, sm: 42 }, minHeight: { xs: 44, sm: 32 }, color: "#676A6C", fontSize: 12, fontWeight: 700 }}>{[10, 20, 50, 100].map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</Select>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.45, ml: 0.5 }}>
                <IconButton size="small" aria-label="Primera página" onClick={() => setPage(1)} sx={{ display: { xs: "none", sm: "inline-flex" }, width: 30, height: 30, border: "1px solid #DDDFE0" }}><FirstPageRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" aria-label="Página anterior" onClick={() => setPage(1)} sx={{ display: { xs: "none", sm: "inline-flex" }, width: 30, height: 30 }}><ChevronLeftRoundedIcon sx={{ fontSize: 17 }} /></IconButton>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <Button key={item} aria-label={`Página ${item}`} aria-current={page === item ? "page" : undefined} onClick={() => setPage(item)} sx={{ minWidth: { xs: 44, sm: 30 }, width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 }, p: 0, color: page === item ? "#FFFFFF" : "#676A6C", backgroundColor: page === item ? "#A9ABAD" : "#FFFFFF", border: "1px solid #D9DBDC", borderRadius: "50%", "&:hover": { backgroundColor: page === item ? "#919396" : "#F3F3F3" } }}>{item}</Button>)}
                <IconButton size="small" aria-label="Página siguiente" onClick={() => setPage(totalPages)} sx={{ display: { xs: "none", sm: "inline-flex" }, width: 30, height: 30 }}><ChevronRightRoundedIcon sx={{ fontSize: 17 }} /></IconButton>
                <IconButton size="small" aria-label="Última página" onClick={() => setPage(totalPages)} sx={{ display: { xs: "none", sm: "inline-flex" }, width: 30, height: 30, border: "1px solid #DDDFE0" }}><LastPageRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Typography sx={{ display: { xs: "none", sm: "block" }, ml: 0.4, color: "#676A6C", fontSize: 12, whiteSpace: "nowrap" }}>{pageStart} - {pageEnd} de {filteredPlans.length} en total</Typography><Box sx={{ flex: 1 }} />
              <Tooltip title={detailVisible ? "Ocultar panel de detalle" : "Mostrar panel de detalle"}><IconButton size="small" aria-label={detailVisible ? "Ocultar panel de detalle" : "Mostrar panel de detalle"} aria-pressed={detailVisible} onClick={() => setDetailVisible((current) => !current)} sx={{ width: { xs: 44, sm: 34 }, height: { xs: 44, sm: 34 } }}><CodeRoundedIcon sx={{ color: "#676A6C", fontSize: 20 }} /></IconButton></Tooltip>
              <Tooltip title="Elegir columnas"><IconButton size="small" aria-label="Elegir columnas" aria-haspopup="menu" aria-expanded={Boolean(columnMenuAnchor)} onClick={openColumnMenu} sx={{ width: { xs: 44, sm: 34 }, height: { xs: 44, sm: 34 }, color: columnMenuAnchor ? "#1C84C6" : "#676A6C" }}><ViewColumnOutlinedIcon sx={{ fontSize: 20 }} /></IconButton></Tooltip>
              <Popover
                open={Boolean(columnMenuAnchor)}
                anchorEl={columnMenuAnchor}
                onClose={() => setColumnMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { width: 145, mt: 0.5, overflow: "hidden", border: "1px solid #E7EAEC", borderRadius: "2px", boxShadow: "0 3px 8px rgba(0,0,0,.18)" } } }}
              >
                <Box role="menu" aria-label="Columnas visibles" sx={{ py: 0.35, backgroundColor: "#FFFFFF" }}>
                  {columnOptions.map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      role="menuitemcheckbox"
                      aria-checked={visibleColumns[key]}
                      control={<Switch checked={visibleColumns[key]} onChange={() => toggleColumn(key)} size="small" slotProps={{ input: { "aria-label": label } }} sx={{ mr: 0.3, "& .MuiSwitch-switchBase.Mui-checked": { color: "#FFFFFF" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#1C84C6", opacity: 1 }, "& .MuiSwitch-track": { backgroundColor: "#8A8C8E", opacity: 1 } }} />}
                      label={label}
                      sx={{ width: "100%", minHeight: 43, m: 0, px: 0.8, color: "#4B4E51", "& .MuiFormControlLabel-label": { fontSize: 12, lineHeight: 1.2 }, "&:hover": { backgroundColor: "#F5F7F8" } }}
                    />
                  ))}
                </Box>
              </Popover>
            </Box>

            <Box sx={{ height: { xs: 590, lg: "calc(100dvh - 237px)" }, minHeight: 410, overflow: "auto", border: "1px solid #DCDCDC", borderRadius: "8px", backgroundColor: "#FFFFFF" }}>
              <Table stickyHeader size="small" aria-label="Listado de planes" sx={{ minWidth: 980, tableLayout: "fixed" }}>
                <TableHead><TableRow>
                  <TableCell sx={{ ...thStyles, left: 0, zIndex: 5, width: 45, position: "sticky" }}># <SwapVertRoundedIcon sx={{ ml: 0.25, fontSize: 13, verticalAlign: "middle" }} /></TableCell>
                  <TableCell sx={{ ...thStyles, left: 45, zIndex: 5, width: 171, position: "sticky", boxShadow: "4px 0 8px rgba(120,130,136,.10)" }}>Nombre <SwapVertRoundedIcon sx={{ ml: 0.25, fontSize: 13, verticalAlign: "middle" }} /></TableCell>
                  {visibleColumns.contracts && <TableCell align="center" sx={{ ...thStyles, width: 116 }}>Contratos <HelpOutlineRoundedIcon sx={{ ml: 0.25, color: "#1C84C6", fontSize: 15, verticalAlign: "middle" }} /></TableCell>}
                  <TableCell align="center" sx={{ ...thStyles, width: 208 }}>Máx. Subida / Máx. Bajada</TableCell>{visibleColumns.burst && <TableCell align="center" sx={{ ...thStyles, width: 58 }}>Ráfaga</TableCell>}{visibleColumns.schedule && <TableCell align="center" sx={{ ...thStyles, width: 64, whiteSpace: "normal" }}>Control horario</TableCell>}{visibleColumns.price && <TableCell align="right" sx={{ ...thStyles, width: 80 }}>Precio <SwapVertRoundedIcon sx={{ ml: 0.25, fontSize: 13, verticalAlign: "middle" }} /></TableCell>}{visibleColumns.frequency && <TableCell sx={{ ...thStyles, width: 82 }}>Frecuencia</TableCell>}<TableCell align="center" sx={{ ...thStyles, display: { xs: "none", sm: "table-cell" }, right: 0, zIndex: 5, width: 42, position: "sticky" }} />
                </TableRow></TableHead>
                <TableBody>
                  {visiblePlans.map((plan) => { const selectedRow = selected.id === plan.id; return (
                    <TableRow key={plan.id} hover selected={selectedRow} onClick={() => setSelectedId(plan.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(plan.id); } }} tabIndex={0} aria-selected={selectedRow} sx={{ cursor: "pointer", "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "#F5F5F5" }, "&:hover": { backgroundColor: "#FAFAFA" }, "&:focus-visible": { outline: "2px solid #1C84C6", outlineOffset: -2 } }}>
                      <TableCell sx={{ ...tdStyles, left: 0, zIndex: 2, position: "sticky", backgroundColor: selectedRow ? "#F5F5F5" : "#FFFFFF", fontWeight: 600 }}>#{plan.id}</TableCell>
                      <TableCell component="th" scope="row" sx={{ ...tdStyles, left: 45, zIndex: 2, position: "sticky", backgroundColor: selectedRow ? "#F5F5F5" : "#FFFFFF", boxShadow: "4px 0 8px rgba(120,130,136,.10)", fontWeight: 600 }}>{plan.name}</TableCell>
                      {visibleColumns.contracts && <TableCell align="center" sx={tdStyles}><ContractsRing active={plan.contracts} suspended={plan.suspended} /></TableCell>}
                      <TableCell align="center" sx={tdStyles}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.65 }}><SpeedBadge direction="up" value={plan.upload} /><SpeedBadge direction="down" value={plan.download} /></Box></TableCell>
                      {visibleColumns.burst && <TableCell align="center" sx={tdStyles}><Tooltip title={plan.burst ? "Ráfaga habilitada" : "Ráfaga deshabilitada"}><BoltRoundedIcon sx={{ color: plan.burst ? "#1C84C6" : "#B7B8BA", fontSize: 23 }} /></Tooltip></TableCell>}
                      {visibleColumns.schedule && <TableCell align="center" sx={tdStyles}><Tooltip title={plan.schedule ? "Control horario habilitado" : "Control horario deshabilitado"}><ScheduleRoundedIcon sx={{ color: plan.schedule ? "#1C84C6" : "#96989A", fontSize: 22, opacity: plan.schedule ? 1 : 0.75 }} /></Tooltip></TableCell>}
                      {visibleColumns.price && <TableCell align="right" sx={{ ...tdStyles, fontWeight: 500 }}>{plan.price}</TableCell>}{visibleColumns.frequency && <TableCell sx={tdStyles}>{plan.frequency}</TableCell>}
                      <TableCell align="center" sx={{ ...tdStyles, display: { xs: "none", sm: "table-cell" }, right: 0, zIndex: 3, p: 0, position: "sticky", backgroundColor: selectedRow ? "#1C84C6" : "#FDFDFD", boxShadow: "-5px 0 13px rgba(139,149,156,.25)" }}><Tooltip title="Mostrar detalles"><IconButton aria-label={`Mostrar detalles de ${plan.name}`} size="small" onClick={(event) => { event.stopPropagation(); setSelectedId(plan.id); }} sx={{ width: 44, height: 44, color: selectedRow ? "#FFFFFF" : "#1C84C6" }}><OpenInNewRoundedIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip></TableCell>
                    </TableRow>
                  ); })}
                  {visiblePlans.length === 0 && <TableRow><TableCell colSpan={4 + visibleColumnCount} sx={{ height: 220, textAlign: "center", color: "#8A8C8E" }}>No se encontraron planes con esa búsqueda.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Box>
          </Box>
          {detailVisible && <PlanDetail plan={selected} />}
        </Box>
      </Box>

      <CreatePlanDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createPlan} />

      <Box sx={{ position: "fixed", right: 22, bottom: 18, zIndex: 10 }}><Tooltip title="Ayuda"><IconButton aria-label="Abrir ayuda" onClick={() => setMessage("Ayuda de Planes en la demostración local.")} sx={{ width: 48, height: 48, color: "#FFFFFF", backgroundColor: "#1C84C6", boxShadow: "0 3px 10px rgba(0,0,0,.20)", "&:hover": { backgroundColor: "#166B9F" } }}><HelpOutlineRoundedIcon /></IconButton></Tooltip></Box>
      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage("")} message={message} />
    </Box>
  );
}
