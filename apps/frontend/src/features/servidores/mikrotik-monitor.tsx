"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { HealthHistoryChart, InterfaceHeatmapChart, TrafficHistoryChart } from "./mikrotik-charts";
import { MikrotikDevicePanel, MikrotikInterfacesTable, MikrotikMetricStrip } from "./mikrotik-summary";
import type { MikrotikHistoryPoint, MikrotikTelemetry } from "./mikrotik-types";

function historyPoint(telemetry: MikrotikTelemetry): MikrotikHistoryPoint {
  const temperature = telemetry.health.cpuTemperature ?? telemetry.health.temperature ?? telemetry.health.boardTemperature;
  return { timestamp: new Date(telemetry.capturedAt).getTime(), cpuLoadPercent: telemetry.resource.cpuLoadPercent, memoryUsedPercent: telemetry.resource.memoryUsedPercent, temperatureCelsius: temperature?.value ?? null, powerWatts: telemetry.health.powerConsumption?.value ?? null, fanRpm: telemetry.health.fanSpeed?.value ?? null, rxMegabitsPerSecond: telemetry.traffic.rxBitsPerSecond / 1_000_000, txMegabitsPerSecond: telemetry.traffic.txBitsPerSecond / 1_000_000, interfaces: telemetry.traffic.interfaces.map((item) => ({ name: item.name, megabitsPerSecond: (item.rxBitsPerSecond + item.txBitsPerSecond) / 1_000_000 })) };
}

const statePresentation: Record<MikrotikTelemetry["state"], { label: string; color: "success" | "warning" | "error" | "default" }> = {
  connected: { label: "Conectado", color: "success" },
  configuration_required: { label: "Falta configuración", color: "warning" },
  unreachable: { label: "Sin comunicación", color: "error" },
  authentication_failed: { label: "Acceso rechazado", color: "error" },
  error: { label: "Error", color: "error" },
};

export function MikrotikMonitor() {
  const [telemetry, setTelemetry] = useState<MikrotikTelemetry | null>(null);
  const [history, setHistory] = useState<MikrotikHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const loadTelemetry = useCallback(async () => {
    try {
      const response = await fetch("/api/mikrotik/telemetry", { cache: "no-store" });
      const body = await response.json() as MikrotikTelemetry | { message?: string };
      if (!response.ok || !("state" in body)) throw new Error(body.message || "No fue posible consultar la telemetría.");
      setTelemetry(body);
      setRequestError("");
      if (body.state === "connected") {
        const point = historyPoint(body);
        setHistory((current) => current.at(-1)?.timestamp === point.timestamp ? current : [...current, point].slice(-360));
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "No fue posible consultar la telemetría.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void loadTelemetry(), 0);
    const polling = window.setInterval(() => void loadTelemetry(), 5_000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(polling);
    };
  }, [loadTelemetry]);

  const presentation = telemetry ? statePresentation[telemetry.state] : null;
  const alertIsError = Boolean(requestError || telemetry?.state === "authentication_failed" || telemetry?.state === "unreachable");
  return <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5, xl: 3 }, py: { xs: 2, md: 2.5 } }}>
    <Breadcrumbs separator={<ChevronRightRoundedIcon sx={{ fontSize: 14 }} />} aria-label="Ruta de navegación" sx={{ mb: 1, "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}><Link href="/" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>Inicio</Link><Link href="/servidores" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>Servidores</Link><Typography color="text.primary" sx={{ fontSize: 12, fontWeight: 650 }}>MikroTik</Typography></Breadcrumbs>
    <Box component="header" sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ display: "grid", width: 42, height: 42, placeItems: "center", color: "#1C84C6", backgroundColor: "#EAF3FC" }}><DnsOutlinedIcon sx={{ fontSize: 23 }} /></Box><Box><Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}><Typography component="h1" sx={{ color: "#4B4E51", fontSize: { xs: 24, sm: 28 }, fontWeight: 700, lineHeight: 1.12 }}>Monitor MikroTik</Typography>{presentation && <Chip label={presentation.label} color={presentation.color} size="small" sx={{ height: 24, fontSize: 10.5 }} />}</Box><Typography sx={{ mt: 0.35, color: "#7A7D80", fontSize: 13 }}>Diagnóstico de salud, energía, ventilación y tráfico en modo de solo lectura.</Typography></Box></Box><Box sx={{ display: "flex", width: { xs: "100%", sm: "auto" }, gap: 1 }}><Button variant="outlined" startIcon={<LockOutlinedIcon />} onClick={() => setGuideOpen(true)} sx={{ flex: { xs: 1, sm: "initial" } }}>Configuración segura</Button><Button variant="contained" startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <RefreshRoundedIcon />} onClick={() => void loadTelemetry()} disabled={loading} sx={{ flex: { xs: 1, sm: "initial" }, boxShadow: "none" }}>Actualizar ahora</Button></Box></Box>
    {(requestError || telemetry?.state !== "connected") && <Box role="status" sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 2, p: 1.5, color: alertIsError ? "#7A2E2E" : "#6E571B", backgroundColor: alertIsError ? "#FBECEC" : "#FFF7DF", border: `1px solid ${alertIsError ? "#ECCACA" : "#EADDAF"}` }}><Typography sx={{ fontSize: 12.5, lineHeight: 1.5 }}>{requestError || telemetry?.message || "Preparando conexión…"}</Typography></Box>}
    {telemetry ? <><MikrotikMetricStrip telemetry={telemetry} /><Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.7fr) 360px" }, gap: 2.5, alignItems: "stretch", mt: 2.5 }}><HealthHistoryChart points={history} /><MikrotikDevicePanel telemetry={telemetry} /></Box><Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", xl: "repeat(2,minmax(0,1fr))" }, gap: 2.5, mt: 2.5 }}><TrafficHistoryChart points={history} /><InterfaceHeatmapChart points={history} /></Box><Box sx={{ mt: 2.5 }}><MikrotikInterfacesTable telemetry={telemetry} /></Box></> : <Box aria-busy="true" aria-label="Cargando monitor MikroTik" sx={{ display: "grid", minHeight: 420, placeItems: "center", border: "1px solid #E7EAEC" }}><Box sx={{ textAlign: "center" }}><CircularProgress size={26} /><Typography sx={{ mt: 1.5, color: "#7A7D80", fontSize: 12.5 }}>Consultando el equipo conectado…</Typography></Box></Box>}
    <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "2px" } } }}><DialogTitle sx={{ fontSize: 18, fontWeight: 650 }}>Conexión segura de solo lectura</DialogTitle><DialogContent dividers><Typography sx={{ color: "#676A6C", fontSize: 13, lineHeight: 1.55 }}>Para consultar un equipo debes configurar su conexión en el servidor. Las credenciales nunca deben viajar al navegador. Configura estas variables únicamente en <strong>apps/backend/.env</strong>:</Typography><Box component="pre" sx={{ mt: 1.5, mb: 0, p: 1.5, overflowX: "auto", color: "#4B4E51", backgroundColor: "#F3F5F6", fontSize: 11.5, lineHeight: 1.55 }}>{`MIKROTIK_HOST=\nMIKROTIK_ORGANIZATION_ID=\nMIKROTIK_SSH_PORT=22\nMIKROTIK_USERNAME=\nMIKROTIK_PASSWORD=\nMIKROTIK_SSH_HOST_HASH=`}</Box><Typography sx={{ mt: 1.5, color: "#676A6C", fontSize: 12.5, lineHeight: 1.5 }}>Usa una credencial limitada a lectura, la organización propietaria y una huella SSH verificada por otro canal. El monitor no modifica reglas, contratos ni usuarios PPPoE.</Typography></DialogContent><DialogActions><Button variant="contained" onClick={() => setGuideOpen(false)}>Entendido</Button></DialogActions></Dialog>
  </Box>;
}
