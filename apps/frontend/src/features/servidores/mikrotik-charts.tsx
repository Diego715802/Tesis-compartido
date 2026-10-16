"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { MikrotikEChart } from "./mikrotik-echart";
import { chartHasData, networkChartOption, networkCharts, type NetworkChartKind } from "./mikrotik-chart-options";
import type { MikrotikHistoryPoint } from "./mikrotik-types";

export function NetworkChart({ kind, points }: { kind: NetworkChartKind; points: MikrotikHistoryPoint[] }) {
  const option = useMemo(() => networkChartOption(kind, points), [kind, points]);
  const content = networkCharts[kind];
  const hasData = chartHasData(kind, points);
  return <Box component="section" aria-labelledby={`network-chart-${kind}`} sx={{ minWidth: 0, backgroundColor: "#FDFDFD", border: "1px solid #E7EAEC" }}>
    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E7EAEC" }}>
      <Typography id={`network-chart-${kind}`} component="h3" sx={{ color: "#4B4E51", fontSize: 15, fontWeight: 600 }}>{content.title}</Typography>
      <Typography sx={{ mt: 0.5, color: "#60666B", fontSize: 12, lineHeight: 1.5 }}>{content.description}</Typography>
    </Box>
    {hasData ? <MikrotikEChart option={option} title={content.title} canZoom={kind !== "interfaces"} ariaLabel={`${content.title}. ${content.description}`} height={330} />
      : <Box sx={{ display: "grid", minHeight: { xs: 180, md: 260 }, placeItems: "center", px: 3, py: 4 }}>
        <Typography sx={{ maxWidth: "48ch", color: "#60666B", fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>{content.empty}</Typography>
      </Box>}
  </Box>;
}
