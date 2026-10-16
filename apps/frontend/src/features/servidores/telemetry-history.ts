import type { HealthSensor, MikrotikHistoryPoint, MikrotikTelemetry } from "./mikrotik-types";

export const POLL_INTERVAL_MS = 15_000;
export const MAX_HISTORY_POINTS = 360;

export function historyPoint(telemetry: MikrotikTelemetry): MikrotikHistoryPoint {
  const connected = telemetry.state === "connected";
  const temperature = telemetry.health.cpuTemperature ?? telemetry.health.temperature ?? telemetry.health.boardTemperature;
  const sensors: HealthSensor[] = telemetry.health.sensors ?? [];
  return {
    timestamp: Date.parse(telemetry.capturedAt), connected, sensors: connected ? sensors : [],
    cpuLoadPercent: connected ? telemetry.resource.cpuLoadPercent : null,
    memoryUsedPercent: connected ? telemetry.resource.memoryUsedPercent : null,
    temperatureCelsius: connected ? temperature?.value ?? null : null,
    powerWatts: connected ? telemetry.health.powerConsumption?.value ?? null : null,
    fanRpm: connected ? telemetry.health.fanSpeed?.value ?? null : null,
    rxMegabitsPerSecond: connected && telemetry.traffic.ratesReady ? telemetry.traffic.rxBitsPerSecond / 1_000_000 : null,
    txMegabitsPerSecond: connected && telemetry.traffic.ratesReady ? telemetry.traffic.txBitsPerSecond / 1_000_000 : null,
    interfaces: connected ? telemetry.traffic.interfaces.map((item) => ({ name: item.name,
      megabitsPerSecond: item.ratesReady ? (item.rxBitsPerSecond + item.txBitsPerSecond) / 1_000_000 : null })) : [],
  };
}

export function gapPoint(timestamp: number): MikrotikHistoryPoint {
  return { timestamp, connected: false, sensors: [], cpuLoadPercent: null, memoryUsedPercent: null,
    temperatureCelsius: null, powerWatts: null, fanRpm: null,
    rxMegabitsPerSecond: null, txMegabitsPerSecond: null, interfaces: [] };
}

export function appendHistory(current: MikrotikHistoryPoint[], point: MikrotikHistoryPoint) {
  if (!Number.isFinite(point.timestamp)) return current;
  const previous = current.at(-1);
  if (previous && point.timestamp <= previous.timestamp) return current;
  const gap = previous && point.timestamp - previous.timestamp > POLL_INTERVAL_MS * 2.5
    ? [gapPoint(previous.timestamp + POLL_INTERVAL_MS)] : [];
  return [...current, ...gap, point].slice(-MAX_HISTORY_POINTS);
}

export function sensorNames(points: MikrotikHistoryPoint[], unit: string) {
  return Array.from(new Set(points.flatMap((point) => point.sensors.filter((sensor) => sensor.unit === unit).map((sensor) => sensor.name))));
}

export function sensorLabel(name: string) {
  return name.replace("cpu-temperature", "CPU").replace(/board-temperature(\d*)/, "Placa $1")
    .replace("pcb-temperature", "Placa PCB").replace(/^temperature$/, "Equipo")
    .replace(/fan(\d*)-speed/, "Ventilador $1").replace("power-consumption", "Consumo")
    .replace("voltage", "Voltaje").replace("current", "Corriente").trim();
}

export function thermalCells(points: MikrotikHistoryPoint[]) {
  const names = sensorNames(points, "C");
  return { names, values: points.flatMap((point, x) => point.sensors
    .filter((sensor) => sensor.unit === "C" && Number.isFinite(sensor.value))
    .map((sensor) => [x, names.indexOf(sensor.name), sensor.value])) };
}
