import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import { WisproModuleWorkbench, type WisproModuleConfig } from "@/components/modules/wispro-module-workbench";

const config: WisproModuleConfig = {
  label: "Servidores",
  singular: "servidor",
  description: "Configura BMU y Mikrotik, vinculación, respaldo y controles de tráfico.",
  icon: DnsOutlinedIcon,
  searchPlaceholder: "Buscar por nombre, host o puerto API",
  createLabel: "Crear nuevo servidor",
  views: [{ value: "bmu", label: "BMU" }, { value: "mikrotik", label: "Mikrotik" }],
  columns: [
    { key: "nombre", label: "Nombre", width: "24%" },
    { key: "contratos", label: "Contratos" },
    { key: "vinculacion", label: "Vinculación" },
    { key: "backup", label: "Backup" },
    { key: "estado", label: "Estado" },
  ],
  records: [
    { id: "SV-01", view: "bmu", nombre: "BMU Principal", contratos: "67 / 70", vinculacion: "Vinculado", backup: "Sincronizado", estado: "Conectado", host: "10.0.0.2", puerto: "8728", api: "Token demo" },
    { id: "SV-02", view: "mikrotik", nombre: "Mikrotik Norte", contratos: "24 / 50", vinculacion: "Vinculado", backup: "Hace 2 h", estado: "Conectado", host: "10.0.1.2", puerto: "8728", api: "Usuario demo" },
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
  return <WisproModuleWorkbench config={config} />;
}
