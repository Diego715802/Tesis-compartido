"use client";

import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";
import { WisproModuleWorkbench, type WisproModuleConfig } from "@/components/modules/wispro-module-workbench";
import { MikrotikMonitor } from "./mikrotik-monitor";

const bmuConfig: WisproModuleConfig = {
  label: "Servidores BMU",
  singular: "servidor BMU",
  description: "Configura vinculación, respaldo y controles de tráfico de servidores BMU.",
  icon: DnsOutlinedIcon,
  searchPlaceholder: "Buscar por nombre, host o puerto API",
  createLabel: "Crear servidor BMU",
  columns: [
    { key: "nombre", label: "Nombre", width: "24%" },
    { key: "contratos", label: "Contratos" },
    { key: "vinculacion", label: "Vinculación" },
    { key: "backup", label: "Backup" },
    { key: "estado", label: "Estado" },
  ],
  records: [
    { id: "SV-01", nombre: "BMU Principal", contratos: "67 / 70", vinculacion: "Vinculado", backup: "Sincronizado", estado: "Conectado", host: "10.0.0.2", puerto: "8728", api: "Token demo" },
  ],
  fields: [
    { key: "nombre", label: "Nombre", required: true, tab: "Básico" },
    { key: "host", label: "Host", required: true, tab: "Básico" },
    { key: "puerto", label: "Puerto API", tab: "Básico" },
    { key: "estado", label: "Estado", options: ["Conectado", "Desconectado", "Mantenimiento"], tab: "Básico" },
    { key: "api", label: "API token / usuario", tab: "Conexión" },
    { key: "clave", label: "Clave de acceso", tab: "Conexión" },
    { key: "ssl", label: "Conexión segura", options: ["Habilitada", "Deshabilitada"], tab: "Conexión" },
    { key: "trafico", label: "Control de tráfico", options: ["Habilitado", "Deshabilitado"], tab: "Avanzado" },
    { key: "dns", label: "DNS", options: ["Habilitado", "Deshabilitado"], tab: "Avanzado" },
    { key: "notas", label: "Notas operativas", type: "textarea", tab: "Avanzado" },
  ],
  formTabs: ["Básico", "Conexión", "Avanzado"],
  detailFields: ["host", "puerto", "contratos", "vinculacion", "backup", "estado"],
  detailKind: "network",
};

export function ServidoresModule() {
  const [view, setView] = useState<"mikrotik" | "bmu">("mikrotik");

  return (
    <Box>
      <Tabs
        value={view}
        onChange={(_, value) => setView(value)}
        aria-label="Tipo de servidor"
        sx={{
          px: { xs: 1.5, sm: 2.5, xl: 3 },
          pt: 1,
          minHeight: 44,
          borderBottom: "1px solid #E7EAEC",
          "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontSize: 12.5 },
        }}
      >
        <Tab value="mikrotik" icon={<RouterOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="MikroTik" />
        <Tab value="bmu" icon={<DnsOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="BMU" />
      </Tabs>
      {view === "mikrotik" ? <MikrotikMonitor /> : <WisproModuleWorkbench config={bmuConfig} />}
    </Box>
  );
}
