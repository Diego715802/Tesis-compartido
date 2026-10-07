"use client";

import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";

export function MikrotikEChart({
  option,
  ariaLabel,
  height = 330,
}: {
  option: EChartsOption;
  ariaLabel: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    async function mountChart() {
      const echarts = await import("echarts");
      if (disposed || !containerRef.current) return;
      const chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
      chart.setOption(option, { notMerge: true });
      const observer = new ResizeObserver(() => chart.resize());
      observer.observe(containerRef.current);
      cleanup = () => {
        observer.disconnect();
        chart.dispose();
      };
    }

    void mountChart();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [option]);

  return <Box ref={containerRef} role="img" aria-label={ariaLabel} sx={{ width: "100%", height, minWidth: 0 }} />;
}
