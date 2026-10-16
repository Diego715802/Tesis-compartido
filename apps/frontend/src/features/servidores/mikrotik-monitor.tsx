"use client";

import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NetworkChart } from "./mikrotik-charts";
import { networkCharts, type NetworkChartKind } from "./mikrotik-chart-options";
import { MikrotikDevicePanel, MikrotikInterfacesTable, MikrotikMetricStrip } from "./mikrotik-summary";
import type { MikrotikHistoryPoint, MikrotikTelemetry } from "./mikrotik-types";
import { appendHistory, gapPoint, historyPoint, POLL_INTERVAL_MS } from "./telemetry-history";

const statePresentation: Record<MikrotikTelemetry["state"], { label: string; color: "success" | "warning" | "error" | "default" }> = {
  connected: { label: "Conectado", color: "success" },
  configuration_required: { label: "Pendiente de conexión", color: "warning" },
  unreachable: { label: "Sin comunicación", color: "error" },
  authentication_failed: { label: "Acceso rechazado", color: "error" },
  error: { label: "Error de lectura", color: "error" },
};
const chartKinds = Object.keys(networkCharts) as NetworkChartKind[];

export function MikrotikMonitor({ embedded = false }: { embedded?: boolean }) {
  const [telemetry, setTelemetry] = useState<MikrotikTelemetry | null>(null);
  const [history, setHistory] = useState<MikrotikHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [paused, setPaused] = useState(false);
  const [windowMinutes, setWindowMinutes] = useState(90);
  const requestRef = useRef<AbortController | null>(null);
  const deviceRef = useRef<string | null>(null);
  const aliveRef = useRef(true);

  const loadTelemetry = useCallback(async () => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/mikrotik/telemetry", { cache: "no-store", signal: controller.signal });
      if (response.status === 401 || response.status === 403) {
        if (aliveRef.current) { setTelemetry(null); setHistory([]); }
        throw new Error(response.status === 401 ? "Tu sesión terminó. Vuelve a iniciar sesión para consultar la red." : "Tu cuenta no tiene acceso a este equipo. Consulta con el administrador.");
      }
      const body = await response.json() as MikrotikTelemetry | { message?: string };
      if (!response.ok || !("state" in body)) throw new Error(body.message || "No fue posible consultar el equipo. Intenta actualizar de nuevo.");
      if (!aliveRef.current || controller.signal.aborted) return;
      if (body.state === "connected") {
        const device = `${body.endpoint}:${body.identity}:${body.resource.boardName}`;
        if (deviceRef.current && deviceRef.current !== device) setHistory([]);
        deviceRef.current = device;
      }
      setTelemetry(body);
      setRequestError("");
      setHistory((current) => appendHistory(current, historyPoint(body)));
    } catch (error) {
      if (!aliveRef.current) return;
      setRequestError(controller.signal.aborted ? "La lectura tardó demasiado. Comprueba la conexión y vuelve a actualizar." : error instanceof Error ? error.message : "No fue posible consultar el equipo.");
      setHistory((current) => appendHistory(current, gapPoint(Date.now())));
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; requestRef.current?.abort(); };
  }, []);
  useEffect(() => {
    if (paused) return;
    let active = true;
    let timer: number;
    async function poll() {
      if (!document.hidden) await loadTelemetry();
      if (active) timer = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }
    timer = window.setTimeout(() => void poll(), 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [loadTelemetry, paused]);

  const points = useMemo(() => {
    const latest = history.at(-1)?.timestamp ?? 0;
    return history.filter((point) => point.timestamp >= latest - windowMinutes * 60_000);
  }, [history, windowMinutes]);
  const presentation = requestError ? { label: "Sin actualización", color: "error" as const }
    : telemetry ? statePresentation[telemetry.state] : { label: "Consultando", color: "default" as const };
  const connected = !requestError && telemetry?.state === "connected";

  return <Box component="section" aria-label="Monitor MikroTik" sx={{ minWidth: 0, px: embedded ? 0 : { xs: 1.5, sm: 2.5 }, py: embedded ? 0 : 2.5 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          <Typography component={embedded ? "h2" : "h1"} sx={{ color: "#4B4E51", fontSize: embedded ? 22 : 26, fontWeight: 500 }}>Monitor MikroTik</Typography>
          <Chip label={presentation.label} color={presentation.color} size="small" />
          {paused && <Chip label="Actualización pausada" size="small" variant="outlined" />}
        </Box>
        <Typography sx={{ mt: 0.75, fontSize: 13, color: "#60666B", lineHeight: 1.5 }}>
          {connected ? `${telemetry.identity ?? "Equipo conectado"} · ${telemetry.resource.boardName ?? "RouterOS"} · consulta de solo lectura` : "Salud del equipo y tráfico de red. Las gráficas se llenan con lecturas del router."}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Button variant="outlined" startIcon={paused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />} onClick={() => setPaused((current) => !current)}>{paused ? "Reanudar" : "Pausar"}</Button>
        <Button variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />} disabled={loading} onClick={() => void loadTelemetry()} sx={{ boxShadow: "none" }}>{loading ? "Consultando…" : "Actualizar"}</Button>
      </Box>
    </Box>

    {(!connected || requestError) && <Alert severity={requestError || (telemetry && !["connected", "configuration_required"].includes(telemetry.state)) ? "warning" : "info"} sx={{ mb: 2 }}>
      {requestError || (telemetry?.state === "configuration_required" ? "Aún no hay un MikroTik configurado. Al vincularlo, aquí aparecerán sus mediciones reales." : telemetry?.message) || "Consultando la conexión del equipo…"}
      {history.some((point) => point.connected) && " El historial conserva las lecturas anteriores; las interrupciones aparecen como huecos."}
    </Alert>}
    {connected && telemetry && <MikrotikMetricStrip telemetry={telemetry} />}

    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, my: 2 }}>
      <Box>
        <Typography sx={{ fontSize: 12, color: "#60666B" }}>{points.filter((point) => point.connected).length} lecturas en la ventana · consulta cada 15 s mientras esta pestaña esté visible</Typography>
        <Typography sx={{ mt: 0.4, fontSize: 12, color: "#60666B" }}>Historial de esta vista, hasta 360 muestras; se reinicia al salir. Ctrl + rueda o deslizador para ampliar.</Typography>
      </Box>
      <TextField select size="small" label="Ventana de tiempo" value={windowMinutes} onChange={(event) => setWindowMinutes(Number(event.target.value))} sx={{ minWidth: 180 }}>
        <MenuItem value={15}>Últimos 15 minutos</MenuItem><MenuItem value={30}>Últimos 30 minutos</MenuItem><MenuItem value={90}>Últimos 90 minutos</MenuItem>
      </TextField>
    </Box>
    <Typography sx={{ fontSize: 12, mb: 2, color: "#60666B" }}>El tráfico agregado suma interfaces y puede contar un mismo flujo en varios puertos. No representa por sí solo el consumo del enlace de Internet.</Typography>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2,minmax(0,1fr))" }, gap: 2.5 }}>
      {chartKinds.map((kind) => <NetworkChart key={kind} kind={kind} points={points} />)}
    </Box>
    {telemetry && <Box component="details" sx={{ mt: 2.5, borderTop: "1px solid #E7EAEC", pt: 1.5 }}>
      <Box component="summary" sx={{ cursor: "pointer", py: 1.25, color: "#166B9F", fontSize: 14, fontWeight: 600 }}>Ver equipo e interfaces</Box>
      <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", xl: "minmax(280px,1fr) minmax(0,2fr)" }, gap: 2.5 }}>
        <MikrotikDevicePanel telemetry={telemetry} /><MikrotikInterfacesTable telemetry={telemetry} />
      </Box>
    </Box>}
    <Box component="details" sx={{ mt: 2, borderTop: "1px solid #E7EAEC", pt: 1.5 }}>
      <Box component="summary" sx={{ cursor: "pointer", py: 1.25, color: "#166B9F", fontSize: 14, fontWeight: 600 }}>Requisitos para conectar el equipo</Box>
      <Typography sx={{ mt: 1, maxWidth: "75ch", fontSize: 13, color: "#60666B", lineHeight: 1.65 }}>El administrador debe vincular el MikroTik a la organización y configurar una cuenta de lectura con huella SSH verificada en el servidor. El equipo debe ser accesible desde ese servidor. La disponibilidad de temperatura, potencia y ventiladores depende del hardware. No se aplican cambios al router desde este monitor.</Typography>
    </Box>
  </Box>;
}
