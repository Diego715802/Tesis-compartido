"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo, type ReactNode } from "react";
import type { EChartsOption } from "echarts";
import { MikrotikEChart } from "./mikrotik-echart";
import type { MikrotikHistoryPoint } from "./mikrotik-types";

const panelSx = { minWidth: 0, backgroundColor: "#FDFDFD", border: "1px solid #E7EAEC", borderRadius: "2px", boxShadow: "3px 3px 8px rgba(0,0,0,.14)" };
const commonTooltip = { trigger: "axis" as const, backgroundColor: "rgba(44,48,52,.95)", borderWidth: 0, textStyle: { color: "#FFFFFF", fontFamily: "Roboto, Arial, sans-serif", fontSize: 11 } };

type NumericHistoryKey = Exclude<keyof MikrotikHistoryPoint, "timestamp" | "interfaces">;

function seriesData(points: MikrotikHistoryPoint[], key: NumericHistoryKey) {
  return points.map((point) => [point.timestamp, point[key]]);
}

function EmptyChart({ message }: { message: string }) {
  return <Box role="status" sx={{ display: "grid", minHeight: 280, placeItems: "center", px: 3, textAlign: "center" }}><Typography sx={{ maxWidth: 520, color: "#7A7D80", fontSize: 13 }}>{message}</Typography></Box>;
}

function ChartPanel({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <Box component="section" aria-labelledby={id} sx={panelSx}><Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E7EAEC" }}><Typography id={id} component="h2" sx={{ color: "#4B4E51", fontSize: 15, fontWeight: 650 }}>{title}</Typography><Typography sx={{ mt: 0.25, color: "#8A8C8E", fontSize: 11.5 }}>{description}</Typography></Box>{children}</Box>;
}

export function HealthHistoryChart({ points }: { points: MikrotikHistoryPoint[] }) {
  const option = useMemo<EChartsOption>(() => ({
    animation: false,
    color: ["#1C84C6", "#23C6C8", "#E3A029", "#5E6770", "#A33C3C"],
    tooltip: commonTooltip,
    legend: { top: 4, left: 8, itemWidth: 14, itemHeight: 8, textStyle: { color: "#676A6C", fontSize: 10 } },
    toolbox: { right: 8, top: 0, itemSize: 14, feature: { dataZoom: { yAxisIndex: "none", title: { zoom: "Acercar", back: "Regresar" } }, restore: { title: "Restablecer" }, saveAsImage: { title: "Guardar PNG", name: "mikrotik-salud" } } },
    grid: { top: 54, right: 62, bottom: 72, left: 52 },
    xAxis: { type: "time", axisLabel: { color: "#7A7D80", fontSize: 10, hideOverlap: true }, axisLine: { lineStyle: { color: "#DCE3E8" } }, splitLine: { show: false } },
    yAxis: [
      { type: "value", name: "% / °C / W", min: 0, nameTextStyle: { color: "#7A7D80", fontSize: 10 }, axisLabel: { color: "#7A7D80", fontSize: 10 }, splitLine: { lineStyle: { color: "#EDF0F2" } } },
      { type: "value", name: "RPM", min: 0, nameTextStyle: { color: "#7A7D80", fontSize: 10 }, axisLabel: { color: "#7A7D80", fontSize: 10 }, splitLine: { show: false } },
    ],
    dataZoom: [
      { type: "inside", minValueSpan: 30_000, filterMode: "none" },
      { type: "slider", minValueSpan: 30_000, bottom: 24, height: 18, borderColor: "#D7E0E7", fillerColor: "rgba(28,132,198,.12)", handleStyle: { color: "#1C84C6" }, textStyle: { color: "#7A7D80", fontSize: 9 } },
    ],
    series: [
      { name: "CPU", type: "line", smooth: true, symbol: "none", connectNulls: false, data: seriesData(points, "cpuLoadPercent") },
      { name: "Memoria", type: "line", smooth: true, symbol: "none", connectNulls: false, data: seriesData(points, "memoryUsedPercent") },
      { name: "Temperatura", type: "line", smooth: true, symbol: "none", connectNulls: false, areaStyle: { opacity: 0.08 }, data: seriesData(points, "temperatureCelsius") },
      { name: "Potencia", type: "line", smooth: true, symbol: "none", connectNulls: false, data: seriesData(points, "powerWatts") },
      { name: "Ventilador", type: "line", yAxisIndex: 1, smooth: true, symbol: "none", connectNulls: false, data: seriesData(points, "fanRpm") },
    ],
    aria: { enabled: true, description: "Historial en tiempo real de CPU, memoria, temperatura, potencia y velocidad de ventilador del MikroTik." },
  }), [points]);

  return <ChartPanel id="mikrotik-health-chart-title" title="Salud y consumo del equipo" description="Datos que RouterOS expone; las series sin sensor permanecen vacías.">{points.length > 1 ? <MikrotikEChart option={option} ariaLabel="Historial de salud del MikroTik" /> : <EmptyChart message="Se necesitan al menos dos lecturas reales para dibujar el historial. La segunda muestra llegará automáticamente." />}</ChartPanel>;
}

export function TrafficHistoryChart({ points }: { points: MikrotikHistoryPoint[] }) {
  const option = useMemo<EChartsOption>(() => ({
    animation: false,
    color: ["#1B8F3A", "#E03A3E"],
    tooltip: commonTooltip,
    legend: { top: 4, left: 8, itemWidth: 14, itemHeight: 8, textStyle: { color: "#676A6C", fontSize: 10 } },
    toolbox: { right: 8, top: 0, itemSize: 14, feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: { name: "mikrotik-trafico" } } },
    grid: { top: 50, right: 20, bottom: 72, left: 58 },
    xAxis: { type: "time", axisLabel: { color: "#7A7D80", fontSize: 10, hideOverlap: true }, axisLine: { lineStyle: { color: "#DCE3E8" } }, splitLine: { show: false } },
    yAxis: { type: "value", min: 0, name: "Mbps", axisLabel: { color: "#7A7D80", fontSize: 10 }, nameTextStyle: { color: "#7A7D80", fontSize: 10 }, splitLine: { lineStyle: { color: "#EDF0F2" } } },
    dataZoom: [
      { type: "inside", minValueSpan: 30_000, filterMode: "none" },
      { type: "slider", minValueSpan: 30_000, bottom: 24, height: 18, borderColor: "#D7E0E7", fillerColor: "rgba(28,132,198,.12)", handleStyle: { color: "#1C84C6" }, textStyle: { color: "#7A7D80", fontSize: 9 } },
    ],
    series: [
      { name: "Recepción", type: "line", smooth: true, symbol: "none", lineStyle: { width: 1.4 }, areaStyle: { opacity: 0.22 }, data: seriesData(points, "rxMegabitsPerSecond") },
      { name: "Transmisión", type: "line", smooth: true, symbol: "none", lineStyle: { width: 1.3 }, areaStyle: { opacity: 0.1 }, data: seriesData(points, "txMegabitsPerSecond") },
    ],
    aria: { enabled: true, description: "Tráfico agregado de recepción y transmisión del MikroTik en megabits por segundo." },
  }), [points]);

  return <ChartPanel id="mikrotik-traffic-chart-title" title="Tráfico agregado" description="Recepción y transmisión calculadas entre lecturas consecutivas.">{points.length > 1 ? <MikrotikEChart option={option} ariaLabel="Historial de tráfico del MikroTik" /> : <EmptyChart message="Esperando dos lecturas para calcular la velocidad del tráfico." />}</ChartPanel>;
}

export function InterfaceHeatmapChart({ points }: { points: MikrotikHistoryPoint[] }) {
  const option = useMemo<EChartsOption>(() => {
    const names = Array.from(new Set(points.flatMap((point) => point.interfaces.map((item) => item.name))));
    const times = points.map((point) => new Date(point.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const values = points.flatMap((point, xIndex) => point.interfaces.map((item) => [xIndex, names.indexOf(item.name), Number(item.megabitsPerSecond.toFixed(3))]));
    const max = Math.max(1, ...values.map((value) => Number(value[2])));
    return {
      animation: false,
      tooltip: { position: "top", formatter: (params: unknown) => {
        const value = (params as { value: [number, number, number] }).value;
        return `${names[value[1]]}<br>${times[value[0]]}: ${value[2]} Mbps`;
      } },
      grid: { top: 18, right: 24, bottom: 72, left: 92 },
      xAxis: { type: "category", data: times, splitArea: { show: true }, axisLabel: { color: "#7A7D80", fontSize: 9, hideOverlap: true } },
      yAxis: { type: "category", data: names, splitArea: { show: true }, axisLabel: { color: "#676A6C", fontSize: 10 } },
      visualMap: { min: 0, max, calculable: true, orient: "horizontal", left: "center", bottom: 12, precision: 2, textStyle: { color: "#676A6C", fontSize: 9 }, inRange: { color: ["#EEF3F5", "#B9E4EE", "#23C6C8", "#1C84C6", "#E3A029", "#A33C3C"] } },
      series: [{ name: "Mbps", type: "heatmap", data: values, progressive: 500, emphasis: { itemStyle: { borderColor: "#4B4E51", borderWidth: 1 } } }],
      aria: { enabled: true, description: "Mapa térmico del tráfico por interfaz y momento de lectura." },
    };
  }, [points]);
  const hasInterfaces = points.some((point) => point.interfaces.length > 0);
  return <ChartPanel id="mikrotik-heatmap-title" title="Intensidad por interfaz" description="Mapa térmico basado en tráfico real; no representa ruido acústico.">{hasInterfaces ? <MikrotikEChart option={option} ariaLabel="Mapa térmico del tráfico por interfaz" height={360} /> : <EmptyChart message="RouterOS aún no devolvió estadísticas de interfaces." />}</ChartPanel>;
}
