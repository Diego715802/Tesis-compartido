"use client";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Customer } from "./customer-types";

type Point = [number, number];
type ChartInstance = ReturnType<(typeof import("echarts"))["init"]>;

function seedFrom(value: string) {
  return Array.from(value).reduce((seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0, 2166136261);
}

function createConsumptionSeries(customer: Customer) {
  const download: Point[] = [];
  const upload: Point[] = [];
  const anchor = new Date("2026-09-27T12:00:00-06:00").getTime();
  let seed = seedFrom(customer.id);

  for (let index = 143; index >= 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const activity = seed / 4294967295;
    const hourFactor = index > 84 && index < 132 ? 0.32 : 0.88;
    const timestamp = anchor - index * 10 * 60 * 1000;
    const burst = activity > 0.91 ? 8 + activity * 11 : 0;
    const baseDownload = Math.max(0.12, (2.2 + activity * 4.6 + burst) * hourFactor);
    const baseUpload = Math.max(0.04, (0.2 + activity * 0.9 + (activity > 0.96 ? 3.8 : 0)) * hourFactor);
    download.push([timestamp, Number(baseDownload.toFixed(2))]);
    upload.push([timestamp, Number(baseUpload.toFixed(2))]);
  }

  return { download, upload };
}

export function CustomerConsumptionChart({ customer }: { customer: Customer }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const series = useMemo(() => createConsumptionSeries(customer), [customer]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    async function renderChart() {
      const echarts = await import("echarts");
      if (disposed || !containerRef.current) return;
      const chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
      chartRef.current = chart;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      chart.setOption({
        animation: !reduceMotion,
        animationDuration: reduceMotion ? 0 : 480,
        animationEasing: "cubicOut",
        color: ["#1B8F3A", "#E03A3E"],
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(44, 48, 52, 0.94)",
          borderWidth: 0,
          textStyle: { color: "#FFFFFF", fontFamily: "Roboto, Arial, sans-serif", fontSize: 12 },
          valueFormatter: (value: number) => `${value.toFixed(2)} Mbps`,
        },
        legend: {
          bottom: 2,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: { color: "#676A6C", fontFamily: "Roboto, Arial, sans-serif", fontSize: 11 },
        },
        toolbox: {
          right: 4,
          top: 0,
          itemSize: 14,
          feature: {
            dataZoom: { yAxisIndex: "none", title: { zoom: "Acercar", back: "Restablecer zoom" } },
            restore: { title: "Restablecer" },
            saveAsImage: { title: "Guardar PNG", name: `consumo-${customer.customId}` },
          },
        },
        grid: { top: 42, right: 16, bottom: 82, left: 48 },
        xAxis: {
          type: "time",
          boundaryGap: false,
          axisLabel: { color: "#7A7D80", fontSize: 10, hideOverlap: true },
          axisLine: { lineStyle: { color: "#DCE3E8" } },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          min: 0,
          boundaryGap: [0, "15%"],
          axisLabel: { color: "#7A7D80", fontSize: 10, formatter: "{value} Mb" },
          splitLine: { lineStyle: { color: "#EDF0F2" } },
        },
        dataZoom: [
          { type: "inside", start: 0, end: 100, filterMode: "none" },
          { type: "slider", start: 0, end: 100, bottom: 30, height: 18, borderColor: "#D7E0E7", fillerColor: "rgba(28,132,198,.12)", handleStyle: { color: "#1C84C6" }, textStyle: { color: "#7A7D80", fontSize: 9 } },
        ],
        series: [
          {
            name: "Bajada",
            type: "line",
            smooth: true,
            symbol: "none",
            showSymbol: false,
            lineStyle: { width: 1.4, color: "#1B8F3A" },
            areaStyle: { color: "rgba(27,143,58,.24)" },
            emphasis: { focus: "series" },
            data: series.download,
          },
          {
            name: "Subida",
            type: "line",
            smooth: true,
            symbol: "none",
            showSymbol: false,
            lineStyle: { width: 1.3, color: "#E03A3E" },
            areaStyle: { color: "rgba(224,58,62,.10)" },
            emphasis: { focus: "series" },
            data: series.upload,
          },
        ],
        aria: {
          enabled: true,
          description: `Gráfica demostrativa del consumo de red de ${customer.name} durante las últimas 24 horas.`,
        },
      });

      const resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(containerRef.current);
      setChartReady(true);
      cleanup = () => {
        resizeObserver.disconnect();
        chart.dispose();
        chartRef.current = null;
      };
    }

    void renderChart();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [customer, series]);

  function zoomChart() {
    chartRef.current?.dispatchAction({ type: "dataZoom", start: 20, end: 80 });
  }

  function resetChart() {
    chartRef.current?.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
  }

  function downloadChart() {
    const chart = chartRef.current;
    if (!chart) return;
    const anchor = document.createElement("a");
    anchor.href = chart.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#FFFFFF" });
    anchor.download = `consumo-${customer.customId}.png`;
    anchor.click();
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <ButtonGroup size="small" aria-label="Controles de la gráfica de consumo" sx={{ mb: 0.5 }}>
        <Button startIcon={<ZoomInRoundedIcon />} onClick={zoomChart} disabled={!chartReady}>Acercar</Button>
        <Button startIcon={<RestartAltRoundedIcon />} onClick={resetChart} disabled={!chartReady}>Restablecer</Button>
        <Button startIcon={<DownloadRoundedIcon />} onClick={downloadChart} disabled={!chartReady}>Guardar PNG</Button>
      </ButtonGroup>
      <Box
        ref={containerRef}
        role="img"
        aria-label={`Consumo demostrativo de subida y bajada de ${customer.name}`}
        sx={{ width: "100%", minHeight: 350 }}
      />
    </Box>
  );
}
