"use client";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useState } from "react";

type MetricCardProps = {
  title: string;
  period?: string;
  children: React.ReactNode;
  column: Record<string, string>;
};

const firstRow = [
  { title: "Contratos", value: ["0 Creado", "0 Eliminado"] },
  { title: "Contratos con facturación habilitada", value: ["0 Hasta el momento"] },
  { title: "Facturas de servicio a generar", value: ["0 Hasta el momento"] },
  { title: "Contratos con error al generar la factura", value: ["0 Hasta el momento"] },
  { title: "Total de facturas de servicio no emitidas", value: ["0 Hasta el momento"] },
  { title: "Contratos sin facturación al estar deshabilitados", value: ["0 Hasta el momento"] },
];

const secondRow = [
  { title: "Total de facturas generadas", period: "Septiembre", value: "0", detail: "Facturas de servicio" },
  { title: "Total de facturas emitidas", period: "Septiembre", value: "0", detail: "Facturas de servicio" },
  { title: "Total de facturas en borrador", period: "Septiembre", value: "0", detail: "Facturas de servicio" },
  { title: "Entradas", period: "Septiembre", value: "0", detail: "Creados / 0 Abiertos" },
];

const serverRow = [
  { title: "Servidores registrados", value: ["2 Configurados", "2 Conectados"] },
  { title: "Nodos operativos", value: ["2 Activos", "0 Con alertas"] },
  { title: "Contratos en línea", value: ["91 Conectados", "0 Suspendidos"] },
];

const serverSummary = [
  { title: "Disponibilidad", period: "Últimas 24 horas", value: "100%", detail: "Entorno de demostración" },
  { title: "Respaldos sincronizados", period: "Hoy", value: "2", detail: "BMU y Mikrotik" },
];

const cardSx = {
  minWidth: 0,
  overflow: "hidden",
  backgroundColor: "#FDFDFD",
  boxShadow: "3px 3px 8px rgba(0,0,0,0.18)",
} as const;

function MetricCard({ title, period = "Hoy", children, column }: MetricCardProps) {
  return (
    <Box sx={{ ...cardSx, gridColumn: column, minHeight: 210 }}>
      <Box sx={{ minHeight: 69, px: 1.9, pt: 1.8, pb: 0.9, borderBottom: "1px solid #E7EAEC" }}>
        <Typography component="h2" sx={{ color: "#4B4E51", fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ mb: 1.75, color: "#676A6C", fontSize: 13 }}>{period}</Typography>
        {children}
      </Box>
    </Box>
  );
}

function ZeroChart() {
  return (
    <Box component="svg" viewBox="0 0 620 215" role="img" aria-label="Gráfica de clientes sin actividad en el período" sx={{ display: "block", width: "100%", height: { xs: 190, md: 215 } }}>
      <g stroke="#E7EAEC" strokeWidth="1">
        <line x1="42" y1="20" x2="600" y2="20" />
        <line x1="42" y1="67" x2="600" y2="67" />
        <line x1="42" y1="114" x2="600" y2="114" />
        <line x1="42" y1="161" x2="600" y2="161" />
        <line x1="42" y1="205" x2="600" y2="205" />
      </g>
      <g fill="#8A8C8E" fontFamily="Roboto, Helvetica Neue, Arial, sans-serif" fontSize="11">
        <text x="8" y="24">4</text>
        <text x="8" y="71">3</text>
        <text x="8" y="118">2</text>
        <text x="8" y="165">1</text>
        <text x="8" y="209">0</text>
        <text x="46" y="213">1 Sep</text>
        <text x="182" y="213">8 Sep</text>
        <text x="315" y="213">15 Sep</text>
        <text x="454" y="213">22 Sep</text>
        <text x="559" y="213">30 Sep</text>
      </g>
      <path d="M42 205 L150 205 L223 204 L304 205 L378 205 L456 204 L525 205 L600 205" fill="none" stroke="#1C84C6" strokeWidth="2" />
      {[42, 150, 223, 304, 378, 456, 525, 600].map((x) => <circle key={x} cx={x} cy={205} r="2.5" fill="#1C84C6" />)}
    </Box>
  );
}

export function DashboardModule() {
  const [dashboardSection, setDashboardSection] = useState("Básico");
  const visibleFirstRow = dashboardSection === "Básico" ? [firstRow[0]] : dashboardSection === "Facturación" ? firstRow.slice(1) : serverRow;
  const visibleSecondRow = dashboardSection === "Básico" ? [secondRow[3]] : dashboardSection === "Facturación" ? secondRow.slice(0, 3) : serverSummary;

  return (
    <Box sx={{ minHeight: "calc(100dvh - 54px)", color: "#676A6C", backgroundColor: "#FFFFFF" }}>
      <Box sx={{ display: "flex", height: 56, alignItems: "center", gap: 1.5, px: { xs: 2, md: 2.5 }, borderBottom: "1px solid #E7EAEC", backgroundColor: "#FDFDFD" }}>
        <HelpOutlineRoundedIcon sx={{ color: "#1C84C6", fontSize: 30 }} />
        <Typography component="h1" sx={{ color: "#676A6C", fontSize: { xs: 20, md: 24 }, fontWeight: 400 }}>Paneles de Control</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, ml: 1.5, color: "#1C84C6", fontSize: 13 }}>Inicio</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#9A9C9D", fontSize: 13 }}>/</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#676A6C", fontSize: 13 }}>Paneles de Control</Typography>
      </Box>

      <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 3.75, pb: 5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box component="nav" aria-label="Secciones representadas del panel" sx={{ display: "flex", minHeight: 49, alignItems: "stretch", borderBottom: "1px solid #E7EAEC" }}>
            {["Básico", "Facturación", "Servidores"].map((label) => (
              <ButtonBase key={label} aria-pressed={dashboardSection === label} aria-label={`Ver panel ${label}`} onClick={() => setDashboardSection(label)} sx={{ display: "flex", minWidth: { xs: 94, sm: 126 }, alignItems: "center", justifyContent: "center", px: 2, color: dashboardSection === label ? "#4B4E51" : "#676A6C", backgroundColor: dashboardSection === label ? "#FDFDFD" : "transparent", borderTop: dashboardSection === label ? "1px solid #E7EAEC" : "1px solid transparent", borderRight: dashboardSection === label ? "1px solid #E7EAEC" : "1px solid transparent", borderLeft: dashboardSection === label ? "3px solid #1C84C6" : "1px solid transparent", fontSize: 13, fontWeight: dashboardSection === label ? 600 : 400, "&:focus-visible": { outline: "3px solid rgba(28,132,198,.3)", outlineOffset: -3 } }}>
                {label}
              </ButtonBase>
            ))}
          </Box>

          <Typography aria-live="polite" sx={{ py: 1.25, color: "#8A8C8E", fontSize: 11.5 }}>Vista {dashboardSection} · información de demostración</Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "30px", pt: 0 }}>
            {visibleFirstRow.map((item) => (
              <MetricCard key={item.title} title={item.title} column={{ xs: "span 12", sm: "span 6", md: "span 4", lg: "span 2" }}>
                {item.value.map((line) => <Typography key={line} sx={{ color: "#676A6C", fontSize: 13, lineHeight: 1.75 }}>{line}</Typography>)}
              </MetricCard>
            ))}

            {visibleSecondRow.map((item) => (
              <MetricCard key={item.title} title={item.title} period={item.period} column={{ xs: "span 12", sm: "span 6", lg: "span 3" }}>
                <Typography sx={{ color: "#4B4E51", fontSize: 29, fontWeight: 300, lineHeight: 1 }}>{item.value}</Typography>
                <Typography sx={{ mt: 1.1, color: "#676A6C", fontSize: 13 }}>{item.detail}</Typography>
              </MetricCard>
            ))}

            {dashboardSection !== "Facturación" && <Box sx={{ ...cardSx, gridColumn: { xs: "span 12", sm: "span 6", lg: "1 / span 3" }, minHeight: 192 }}>
              <Box sx={{ px: 1.9, pt: 1.8, pb: 0.9, borderBottom: "1px solid #E7EAEC" }}>
                <Typography component="h2" sx={{ color: "#4B4E51", fontSize: 14, fontWeight: 600 }}>{dashboardSection === "Servidores" ? "Estado de la infraestructura" : "Contratos conectados"}</Typography>
              </Box>
              <Box sx={{ display: "grid", minHeight: 130, placeItems: "center", px: 2.5, textAlign: "center" }}>
                <Box>
                  <KeyboardDoubleArrowUpRoundedIcon sx={{ color: "#1C84C6", fontSize: 32 }} />
                  <Typography sx={{ mt: 1, fontSize: 13, lineHeight: 1.5 }}>{dashboardSection === "Servidores" ? "Todos los servidores demo responden correctamente" : "Aquí puede ver contratos conectados / desconectados"}</Typography>
                </Box>
              </Box>
            </Box>}

            {dashboardSection === "Básico" && <Box sx={{ ...cardSx, gridColumn: { xs: "span 12", lg: "1 / span 6" }, minHeight: 303 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.9, pt: 1.8, pb: 0.9, borderBottom: "1px solid #E7EAEC" }}>
                <AssessmentOutlinedIcon sx={{ color: "#1C84C6", fontSize: 24 }} />
                <Typography component="h2" sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 400 }}>Clientes</Typography>
              </Box>
              <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}><ZeroChart /></Box>
            </Box>}

            {dashboardSection === "Básico" && <Box sx={{ ...cardSx, gridColumn: { xs: "span 12", lg: "7 / span 6" }, minHeight: 166 }}>
              <Box sx={{ px: 1.9, pt: 1.8, pb: 0.9, borderBottom: "1px solid #E7EAEC" }}>
                <Typography component="h2" sx={{ color: "#4B4E51", fontSize: 18, fontWeight: 400 }}>Contratos</Typography>
              </Box>
              <Box sx={{ display: "grid", minHeight: 105, placeItems: "center", px: 2.5, textAlign: "center" }}>
                <Typography sx={{ fontSize: 13 }}>Aquí puede ver el histórico de contratos (Creados / Eliminados)</Typography>
              </Box>
            </Box>}
          </Box>
        </Box>
      </Box>

      <Box component="footer" sx={{ display: "flex", minHeight: 45, alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.25, borderTop: "1px solid #E7EAEC", backgroundColor: "#FDFDFD" }}>
        <Typography sx={{ fontSize: 12 }}><Box component="span" sx={{ fontWeight: 600 }}>ComeCore</Box> © 2026</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 12 }}>Interfaz de demostración</Typography>
      </Box>

      <IconButton aria-label="Abrir ayuda" sx={{ position: "fixed", right: 22, bottom: 22, zIndex: 20, width: 50, height: 50, color: "#FFFFFF", backgroundColor: "#1C98B8", boxShadow: "0 3px 10px rgba(0,0,0,0.2)", "&:hover": { backgroundColor: "#17829E" } }}>
        <HelpOutlineRoundedIcon sx={{ fontSize: 28 }} />
      </IconButton>
    </Box>
  );
}
