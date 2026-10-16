"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useEffect, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";

export function MikrotikEChart({
  option,
  title,
  canZoom = true,
  ariaLabel,
  height = 330,
}: {
  option: EChartsOption;
  title: string;
  canZoom?: boolean;
  ariaLabel: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const optionRef = useRef(option);
  const [ready, setReady] = useState(false);
  const [chartError, setChartError] = useState(false);

  function zoom() {
    const chart = chartRef.current;
    if (!chart) return;
    const current = (chart.getOption().dataZoom as Array<{ start?: number; end?: number }> | undefined)?.[0];
    const start = current?.start ?? 0, end = current?.end ?? 100;
    const margin = (end - start) * 0.2;
    chart.dispatchAction({ type: "dataZoom", start: start + margin, end: end - margin });
  }
  function exportImage() {
    const chart = chartRef.current;
    if (!chart) return;
    const link = document.createElement("a");
    link.download = `comecore-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = chart.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#FFFFFF" });
    link.click();
  }

  useEffect(() => {
    optionRef.current = option;
    chartRef.current?.setOption(option, { replaceMerge: ["series"], lazyUpdate: true });
  }, [option]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    async function mountChart() {
      const { initNetworkChart } = await import("./echarts-runtime");
      if (disposed || !containerRef.current) return;
      const chart = initNetworkChart(containerRef.current);
      chartRef.current = chart;
      chart.setOption(optionRef.current);
      setReady(true);
      const observer = new ResizeObserver(() => chart.resize());
      observer.observe(containerRef.current);
      cleanup = () => {
        observer.disconnect();
        chart.dispose();
        chartRef.current = null;
      };
    }

    void mountChart().catch(() => { if (!disposed) setChartError(true); });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <>
    <Box role="group" aria-label={`Controles de ${title}`} sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 0.5, px: 1, pt: 0.5 }}>
      {canZoom && <Button size="small" disabled={!ready} startIcon={<ZoomInRoundedIcon />} onClick={zoom} aria-label={`Ampliar gráfica ${title}`}>Ampliar</Button>}
      {canZoom && <Button size="small" disabled={!ready} startIcon={<RestartAltRoundedIcon />} onClick={() => chartRef.current?.dispatchAction({ type: "restore" })} aria-label={`Restablecer gráfica ${title}`}>Restablecer</Button>}
      <Button size="small" disabled={!ready} startIcon={<DownloadRoundedIcon />} onClick={exportImage} aria-label={`Guardar imagen de ${title}`}>PNG</Button>
    </Box>
    {chartError && <Typography role="alert" sx={{ px: 2, py: 1, fontSize: 13 }}>No se pudo cargar la gráfica. Vuelve a cargar el panel.</Typography>}
    <Box ref={containerRef} role="img" aria-label={ariaLabel} sx={{ width: "100%", height, minWidth: 0 }} />
  </>;
}
