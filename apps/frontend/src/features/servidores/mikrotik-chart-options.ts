import type { EChartsOption, LineSeriesOption } from "echarts";
import type { MikrotikHistoryPoint } from "./mikrotik-types";
import { sensorLabel, sensorNames, thermalCells } from "./telemetry-history";

export type NetworkChartKind = "resources" | "traffic" | "temperature" | "thermal" | "interfaces" | "interfaceHeatmap" | "energy" | "fans";
export const networkCharts: Record<NetworkChartKind, { title: string; description: string; empty: string }> = {
  resources: { title: "CPU y memoria", description: "Ocupación en %. CPU por bandas de 50 y 80 %; colores orientativos.", empty: "Esperando lecturas de CPU y memoria desde RouterOS." },
  traffic: { title: "Tráfico de recepción y transmisión", description: "Mbps entre lecturas. Los huecos conservan las interrupciones de medición.", empty: "Se necesitan dos lecturas consecutivas para calcular RX y TX." },
  temperature: { title: "Evolución de temperatura", description: "Cada sensor mantiene su propia serie en °C, sin mezclar magnitudes.", empty: "Todavía no hay lecturas de temperatura. Su disponibilidad depende del modelo." },
  thermal: { title: "Mapa de calor del equipo", description: "Sensores × tiempo en °C. La escala de color no establece umbrales de alarma.", empty: "El mapa aparecerá cuando el MikroTik devuelva sensores de temperatura." },
  interfaces: { title: "Tráfico por interfaz", description: "Última lectura válida, hasta 12 interfaces ordenadas por RX + TX.", empty: "Esperando estadísticas consecutivas de las interfaces." },
  interfaceHeatmap: { title: "Intensidad de tráfico por interfaz", description: "Interfaces × tiempo en Mbps. Hasta 12 interfaces; las demás siguen en la tabla.", empty: "Esperando muestras de tráfico por interfaz." },
  energy: { title: "Consumo y alimentación", description: "Potencia en W y voltaje en V, con escalas independientes.", empty: "Este equipo aún no expone mediciones de potencia o voltaje." },
  fans: { title: "Velocidad de ventiladores", description: "Revoluciones por minuto de cada ventilador disponible; no mide ruido acústico.", empty: "Sin lecturas de ventiladores. Algunos equipos usan refrigeración pasiva." },
};

const colors = ["#1C84C6", "#008F91", "#9B6518", "#8E5296", "#A33C3C", "#4D6575"];
const thermalColors = ["#313695", "#4575B4", "#74ADD1", "#ABD9E9", "#E0F3F8", "#FFFFBF", "#FEE090", "#FDAE61", "#F46D43", "#D73027", "#A50026"];
const textStyle = { color: "#60666B", fontSize: 11, fontFamily: "Roboto, Arial, sans-serif" };
const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
function base(kind: NetworkChartKind, unit: string): EChartsOption {
  return {
    animation: false, color: colors, textStyle,
    tooltip: { trigger: "axis", renderMode: "richText", confine: true, textStyle },
    legend: { type: "scroll", top: 8, left: 12, right: 16, textStyle, itemWidth: 14, itemHeight: 8 },
    grid: { top: 64, right: 32, bottom: 80, left: 58, containLabel: false },
    xAxis: { type: "time", axisLabel: { ...textStyle, hideOverlap: true }, splitLine: { show: false } },
    yAxis: { type: "value", name: unit, min: 0, nameTextStyle: textStyle, axisLabel: textStyle,
      splitLine: { lineStyle: { color: "#E7EAEC" } } },
    dataZoom: [
      { type: "inside", filterMode: "none", zoomOnMouseWheel: "ctrl", moveOnMouseWheel: false },
      { type: "slider", bottom: 24, height: 20, filterMode: "none", textStyle, borderColor: "#CBD4DA" },
    ],
    aria: { enabled: true, description: `${networkCharts[kind].title}. ${networkCharts[kind].description}` },
  };
}
function line(name: string, data: Array<Array<number | null>>, extra: Partial<LineSeriesOption> = {}): LineSeriesOption {
  return { name, type: "line", smooth: false, connectNulls: false, showSymbol: data.length < 3,
    symbolSize: 5, lineStyle: { width: 1.8 }, data, ...extra };
}
function sensorLines(points: MikrotikHistoryPoint[], unit: string, yAxisIndex = 0) {
  return sensorNames(points, unit).map((name) => line(sensorLabel(name), points.map((point) =>
    [point.timestamp, point.sensors.find((sensor) => sensor.name === name && sensor.unit === unit)?.value ?? null]), { yAxisIndex }));
}
export function chartHasData(kind: NetworkChartKind, points: MikrotikHistoryPoint[]) {
  if (kind === "resources") return points.some((point) => point.cpuLoadPercent !== null || point.memoryUsedPercent !== null);
  if (kind === "interfaces") return points.at(-1)?.interfaces.some((item) => item.megabitsPerSecond !== null) ?? false;
  if (kind === "traffic") return points.some((point) => point.rxMegabitsPerSecond !== null);
  if (kind === "thermal" || kind === "temperature") return sensorNames(points, "C").length > 0;
  if (kind === "fans") return sensorNames(points, "RPM").length > 0;
  if (kind === "energy") return sensorNames(points, "W").length > 0 || sensorNames(points, "V").length > 0;
  return points.some((point) => point.interfaces.some((item) => item.megabitsPerSecond !== null));
}

export function networkChartOption(kind: NetworkChartKind, points: MikrotikHistoryPoint[]): EChartsOption {
  if (kind === "resources") return {
    ...base(kind, "%"), yAxis: { type: "value", name: "%", min: 0, max: 100, nameTextStyle: textStyle, axisLabel: textStyle, splitLine: { lineStyle: { color: "#E7EAEC" } } },
    visualMap: { show: false, dimension: 1, seriesIndex: 0,
      pieces: [{ lte: 50, color: "#12805C" }, { gt: 50, lte: 80, color: "#BA7B10" }, { gt: 80, color: "#B23C3C" }] },
    series: [line("CPU", points.map((point) => [point.timestamp, point.cpuLoadPercent]), { itemStyle: { color: "#12805C" } }),
      line("Memoria", points.map((point) => [point.timestamp, point.memoryUsedPercent]), { itemStyle: { color: "#1C84C6" } })],
  };
  if (kind === "traffic") return { ...base(kind, "Mbps"), series: [
    line("Recepción (RX)", points.map((point) => [point.timestamp, point.rxMegabitsPerSecond]), { areaStyle: { opacity: 0.12 } }),
    line("Transmisión (TX)", points.map((point) => [point.timestamp, point.txMegabitsPerSecond])),
  ] };
  if (kind === "temperature" || kind === "fans") {
    const unit = kind === "temperature" ? "C" : "RPM";
    return { ...base(kind, unit === "C" ? "°C" : unit), series: sensorLines(points, unit) };
  }
  if (kind === "energy") return {
    ...base(kind, "W"), grid: { top: 64, left: 58, right: 58, bottom: 80 },
    yAxis: [{ type: "value", name: "W", min: 0, nameTextStyle: textStyle, axisLabel: textStyle, splitLine: { lineStyle: { color: "#E7EAEC" } } },
      { type: "value", name: "V", min: 0, nameTextStyle: textStyle, axisLabel: textStyle, splitLine: { show: false } }],
    series: [...sensorLines(points, "W"), ...sensorLines(points, "V", 1)],
  };

  const ranked = Array.from(new Set(points.flatMap((point) => point.interfaces.map((item) => item.name))))
    .map((name) => ({ name, peak: Math.max(0, ...points.map((point) => point.interfaces.find((item) => item.name === name)?.megabitsPerSecond ?? 0)) }))
    .sort((a, b) => b.peak - a.peak).slice(0, 12).map((item) => item.name);
  if (kind === "interfaces") {
    const latest = points.at(-1);
    const entries = [...(latest?.interfaces ?? [])].filter((item) => item.megabitsPerSecond !== null)
      .sort((a, b) => (b.megabitsPerSecond ?? 0) - (a.megabitsPerSecond ?? 0)).slice(0, 12).reverse();
    return { ...base(kind, ""),
      legend: { show: false }, dataZoom: [], grid: { top: 42, bottom: 40, left: 100, right: 34 },
      xAxis: { type: "value", name: "Mbps", nameLocation: "middle", nameGap: 25, axisLabel: textStyle },
      yAxis: { type: "category", data: entries.map((item) => item.name), axisLabel: { ...textStyle, width: 80, overflow: "truncate" } },
      series: [{ type: "bar", name: "RX + TX", data: entries.map((item) => item.megabitsPerSecond), barMaxWidth: 18 }],
    };
  }

  const thermal = thermalCells(points);
  const isThermal = kind === "thermal";
  const names = isThermal ? thermal.names : ranked;
  const values = isThermal ? thermal.values : points.flatMap((point, x) => point.interfaces
    .filter((item) => item.megabitsPerSecond !== null && names.includes(item.name))
    .map((item) => [x, names.indexOf(item.name), item.megabitsPerSecond as number]));
  const minimum = Math.min(0, ...values.map((item) => item[2]));
  const maximum = Math.max(isThermal ? 100 : 1, ...values.map((item) => item[2]));
  return {
    ...base(kind, ""), legend: { show: false },
    grid: { top: 58, bottom: 110, left: 106, right: 26 },
    tooltip: { renderMode: "richText", confine: true, formatter: (params: unknown) => {
      const value = (params as { value?: number[] }).value;
      if (!Array.isArray(value)) return "Sin lectura";
      return `${sensorLabel(names[value[1]])}\n${formatTime(points[value[0]].timestamp)}: ${value[2].toFixed(2)} ${isThermal ? "°C" : "Mbps"}`;
    } },
    xAxis: { type: "category", data: points.map((point) => formatTime(point.timestamp)), axisLabel: { ...textStyle, hideOverlap: true } },
    yAxis: { type: "category", data: names.map(sensorLabel), axisLabel: { ...textStyle, width: 90, overflow: "truncate" } },
    dataZoom: [{ type: "slider", height: 18, bottom: 62, xAxisIndex: 0, filterMode: "none", showDetail: false }],
    visualMap: { type: "continuous", min: minimum, max: maximum, precision: 0, calculable: true,
      orient: "horizontal", left: "center", bottom: 4, itemHeight: 120, itemWidth: 10,
      text: [isThermal ? `${maximum} °C` : `${maximum.toFixed(1)} Mbps`, `${minimum}`], textStyle,
      inRange: { color: isThermal ? thermalColors : ["#EDF4F7", "#A6D7E9", "#1C84C6", "#005A8C"] } },
    series: [{ type: "heatmap", name: isThermal ? "Temperatura" : "Tráfico", data: values,
      progressive: 1000, emphasis: { itemStyle: { borderWidth: 1, borderColor: "#263A4B" } } }],
  };
}
