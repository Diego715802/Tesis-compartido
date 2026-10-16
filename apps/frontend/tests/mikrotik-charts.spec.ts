import { describe, expect, it } from "vitest";
import * as echarts from "echarts";
import { appendHistory, gapPoint, MAX_HISTORY_POINTS, thermalCells } from "../src/features/servidores/telemetry-history";
import { chartHasData, networkChartOption, networkCharts, type NetworkChartKind } from "../src/features/servidores/mikrotik-chart-options";
import type { MikrotikHistoryPoint } from "../src/features/servidores/mikrotik-types";

const point: MikrotikHistoryPoint = { ...gapPoint(1_700_000_000_000), connected: true, cpuLoadPercent: 30, memoryUsedPercent: 50,
  sensors: [{ name: "cpu-temperature", value: 42, unit: "C" }, { name: "board-temperature1", value: 35, unit: "C" },
    { name: "power-consumption", value: 8, unit: "W" }, { name: "voltage", value: 24, unit: "V" }, { name: "fan1-speed", value: 1200, unit: "RPM" }],
  rxMegabitsPerSecond: 2, txMegabitsPerSecond: 1, interfaces: [{ name: "ether1", megabitsPerSecond: 3 }] };
const points = [point, { ...point, timestamp: point.timestamp + 15_000 }, gapPoint(point.timestamp + 30_000), { ...point, timestamp: point.timestamp + 45_000 }];

describe("history without fabricated readings", () => {
  it("deduplicates cached captures, rejects out-of-order points and bounds memory", () => {
    expect(appendHistory([point], point)).toHaveLength(1);
    expect(appendHistory([point], { ...point, timestamp: 1 })).toHaveLength(1);
    let history: MikrotikHistoryPoint[] = [];
    for (let index = 0; index < 500; index++) history = appendHistory(history, { ...point, timestamp: point.timestamp + index * 15_000 });
    expect(history).toHaveLength(MAX_HISTORY_POINTS);
  });
  it("inserts a null gap after a hidden tab or failed connection", () => {
    const history = appendHistory([point], { ...point, timestamp: point.timestamp + 90_000 });
    expect(history).toHaveLength(3); expect(history[1].rxMegabitsPerSecond).toBeNull(); expect(history[1].sensors).toEqual([]);
  });
  it("maps actual temperature cells and leaves absent sensors empty", () => {
    const heatmap = thermalCells([point, gapPoint(point.timestamp + 15_000)]);
    expect(heatmap.names).toEqual(["cpu-temperature", "board-temperature1"]);
    expect(heatmap.values).toEqual([[0, 0, 42], [0, 1, 35]]);
  });
  it("does not report an empty or unavailable sensor as zero", () => {
    for (const kind of Object.keys(networkCharts) as NetworkChartKind[]) expect(chartHasData(kind, [gapPoint(1)])).toBe(false);
  });
});

describe("Apache ECharts integration", () => {
  for (const kind of Object.keys(networkCharts) as NetworkChartKind[]) {
    it(`renders ${kind} with samples, a gap and a subsequent update`, () => {
      const chart = echarts.init(null, undefined, { renderer: "svg", ssr: true, width: 640, height: 360 });
      try {
        const option = networkChartOption(kind, points);
        chart.setOption(option);
        const svg = chart.renderToSVGString();
        expect(svg).toContain("<svg"); expect(svg.length).toBeGreaterThan(1500);
        chart.setOption(networkChartOption(kind, [...points, { ...point, timestamp: point.timestamp + 60_000 }]), { replaceMerge: ["series"] });
        expect(chart.renderToSVGString()).toContain("<svg");
      } finally { chart.dispose(); }
    });
  }
  it("keeps manual zoom when a new sample arrives", () => {
    const chart = echarts.init(null, undefined, { renderer: "svg", ssr: true, width: 640, height: 360 });
    try {
      chart.setOption(networkChartOption("traffic", points));
      chart.dispatchAction({ type: "dataZoom", start: 20, end: 80 });
      chart.setOption(networkChartOption("traffic", [...points, { ...point, timestamp: point.timestamp + 60_000 }]), { replaceMerge: ["series"] });
      const zoom = chart.getOption().dataZoom as Array<{ start: number; end: number }>;
      expect(zoom[0].start).toBe(20); expect(zoom[0].end).toBe(80);
    } finally { chart.dispose(); }
  });
});
