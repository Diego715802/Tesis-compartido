"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SensorsOffRoundedIcon from "@mui/icons-material/SensorsOffRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { MikrotikTelemetry, SensorValue } from "./mikrotik-types";

const panelSx = { backgroundColor: "#FDFDFD", border: "1px solid #E7EAEC", borderRadius: "2px", boxShadow: "3px 3px 8px rgba(0,0,0,.14)" };

function sensorText(sensor: SensorValue | null, digits = 1) {
  return sensor ? `${sensor.value.toFixed(digits)} ${sensor.unit}` : "No expuesto";
}

function formatRate(bits: number, ready = true) {
  if (!ready) return "Esperando lectura";
  if (bits >= 1_000_000_000) return `${(bits / 1_000_000_000).toFixed(2)} Gbps`;
  if (bits >= 1_000_000) return `${(bits / 1_000_000).toFixed(2)} Mbps`;
  if (bits >= 1_000) return `${(bits / 1_000).toFixed(1)} Kbps`;
  return `${Math.round(bits)} bps`;
}

export function MikrotikMetricStrip({ telemetry }: { telemetry: MikrotikTelemetry }) {
  const temperature = telemetry.health.cpuTemperature ?? telemetry.health.temperature ?? telemetry.health.boardTemperature;
  const metrics = [
    { label: "CPU", value: telemetry.resource.cpuLoadPercent === null ? "No expuesto" : `${telemetry.resource.cpuLoadPercent.toFixed(1)} %` },
    { label: "Memoria", value: telemetry.resource.memoryUsedPercent === null ? "No expuesto" : `${telemetry.resource.memoryUsedPercent.toFixed(1)} %` },
    { label: "Temperatura", value: sensorText(temperature) },
    { label: "Voltaje", value: sensorText(telemetry.health.voltage, 2) },
    { label: "Potencia", value: sensorText(telemetry.health.powerConsumption, 2) },
    { label: "Ventilador", value: telemetry.health.fanSpeed ? sensorText(telemetry.health.fanSpeed, 0) : "No expuesto" },
    { label: "Recepción", value: formatRate(telemetry.traffic.rxBitsPerSecond, telemetry.traffic.ratesReady) },
    { label: "Transmisión", value: formatRate(telemetry.traffic.txBitsPerSecond, telemetry.traffic.ratesReady) },
  ];
  return <Box component="dl" sx={{ ...panelSx, display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", sm: "repeat(4,minmax(0,1fr))", xl: "repeat(8,minmax(0,1fr))" }, m: 0, overflow: "hidden" }}>{metrics.map((metric, index) => <Box key={metric.label} sx={{ minWidth: 0, px: 1.75, py: 1.5, borderRight: { xs: index % 2 === 0 ? "1px solid #E7EAEC" : 0, sm: index % 4 === 3 ? 0 : "1px solid #E7EAEC", xl: index === metrics.length - 1 ? 0 : "1px solid #E7EAEC" }, borderBottom: { xs: index < 6 ? "1px solid #E7EAEC" : 0, sm: index < 4 ? "1px solid #E7EAEC" : 0, xl: 0 } }}><Typography component="dt" sx={{ color: "#60666B", fontSize: 10.5 }}>{metric.label}</Typography><Typography component="dd" sx={{ m: 0, mt: 0.4, overflow: "hidden", color: metric.value.includes("No ") || metric.value.includes("Sin ") ? "#8A8C8E" : "#4B4E51", fontSize: 15, fontWeight: 650, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{metric.value}</Typography></Box>)}</Box>;
}

export function MikrotikDevicePanel({ telemetry }: { telemetry: MikrotikTelemetry }) {
  const rows = [["Identidad", telemetry.identity ?? "—"], ["Modelo", telemetry.resource.boardName ?? "—"], ["Plataforma", telemetry.resource.platform ?? "—"], ["RouterOS", telemetry.resource.version ?? "—"], ["Tiempo activo", telemetry.resource.uptime ?? "—"], ["Transporte", telemetry.transport.toUpperCase()], ["Endpoint", telemetry.endpoint]];
  return <Box component="aside" sx={{ ...panelSx, p: 2 }}><Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pb: 1.5, borderBottom: "1px solid #E7EAEC" }}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MemoryRoundedIcon sx={{ color: "#1C84C6", fontSize: 20 }} /><Typography component="h2" sx={{ fontSize: 15, fontWeight: 650 }}>Equipo detectado</Typography></Box><Chip icon={<CheckCircleOutlineRoundedIcon />} label="Solo lectura" size="small" color="success" sx={{ height: 24, fontSize: 10 }} /></Box><Box component="dl" sx={{ m: 0, mt: 0.5 }}>{rows.map(([label, value]) => <Box key={label} sx={{ display: "grid", gridTemplateColumns: "100px minmax(0,1fr)", gap: 1, py: 1, borderBottom: "1px solid #ECEEEF" }}><Typography component="dt" sx={{ color: "#7A7D80", fontSize: 11.5, fontWeight: 600 }}>{label}</Typography><Typography component="dd" sx={{ m: 0, minWidth: 0, color: "#4B4E51", fontSize: 11.5, textAlign: "right", overflowWrap: "anywhere" }}>{value}</Typography></Box>)}</Box><Box sx={{ display: "flex", gap: 1, mt: 1.5, p: 1.25, backgroundColor: "#F4F6F7" }}><SensorsOffRoundedIcon sx={{ flex: "0 0 auto", color: "#7A7D80", fontSize: 18 }} /><Typography sx={{ color: "#676A6C", fontSize: 11.5, lineHeight: 1.45 }}>{telemetry.health.acousticNoise.reason}</Typography></Box></Box>;
}

export function MikrotikInterfacesTable({ telemetry }: { telemetry: MikrotikTelemetry }) {
  return <Box component="section" aria-labelledby="mikrotik-interfaces-title" sx={panelSx}><Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E7EAEC" }}><Typography id="mikrotik-interfaces-title" component="h2" sx={{ fontSize: 15, fontWeight: 650 }}>Interfaces observadas</Typography></Box><TableContainer><Table size="small" sx={{ minWidth: 680 }}><TableHead><TableRow>{["Interfaz", "Estado", "Recepción", "Transmisión", "Bytes RX", "Bytes TX"].map((label) => <TableCell key={label} sx={{ color: "#5B5E61", fontSize: 11.5, fontWeight: 700 }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{telemetry.traffic.interfaces.map((item) => <TableRow key={item.name} hover><TableCell sx={{ color: "#1C84C6", fontSize: 12, fontWeight: 600 }}>{item.name}</TableCell><TableCell><Chip label={item.disabled ? "Deshabilitada" : item.running ? "Activa" : "Sin enlace"} size="small" color={item.disabled ? "default" : item.running ? "success" : "warning"} sx={{ height: 22, fontSize: 9.5 }} /></TableCell><TableCell sx={{ fontSize: 11.5 }}>{formatRate(item.rxBitsPerSecond, item.ratesReady)}</TableCell><TableCell sx={{ fontSize: 11.5 }}>{formatRate(item.txBitsPerSecond, item.ratesReady)}</TableCell><TableCell sx={{ fontSize: 11.5 }}>{new Intl.NumberFormat("es-MX").format(item.rxBytes)}</TableCell><TableCell sx={{ fontSize: 11.5 }}>{new Intl.NumberFormat("es-MX").format(item.txBytes)}</TableCell></TableRow>)}{telemetry.traffic.interfaces.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: "#60666B", fontSize: 12.5 }}>RouterOS no devolvió interfaces todavía.</TableCell></TableRow>}</TableBody></Table></TableContainer></Box>;
}
