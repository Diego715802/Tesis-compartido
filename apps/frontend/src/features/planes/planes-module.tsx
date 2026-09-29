import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { WisproModuleWorkbench, type WisproModuleConfig } from "@/components/modules/wispro-module-workbench";

const config: WisproModuleConfig = {
  label: "Planes",
  singular: "plan",
  description: "Configura velocidad, facturación y estrategias de gestión del servicio.",
  icon: LayersOutlinedIcon,
  searchPlaceholder: "Puedes buscar por: Nombre, Precio",
  createLabel: "Crear nuevo plan",
  columns: [
    { key: "nombre", label: "Nombre", width: "24%" },
    { key: "contratos", label: "Contratos" },
    { key: "velocidad", label: "Máx. subida / bajada" },
    { key: "rafaga", label: "Ráfaga" },
    { key: "precio", label: "Precio" },
    { key: "frecuencia", label: "Frecuencia" },
  ],
  records: [
    { id: "PL-01", nombre: "Fibra 100", contratos: 18, velocidad: "50 / 100 Mbps", rafaga: "No", precio: "$499.00", frecuencia: "Mensual", estado: "Público", estrategia: "Equitativa" },
    { id: "PL-02", nombre: "PyME 200", contratos: 7, velocidad: "100 / 200 Mbps", rafaga: "Sí", precio: "$899.00", frecuencia: "Mensual", estado: "Público", estrategia: "Prioridad" },
    { id: "PL-03", nombre: "Residencial 50", contratos: 42, velocidad: "20 / 50 Mbps", rafaga: "No", precio: "$349.00", frecuencia: "Mensual", estado: "Privado", estrategia: "Equitativa" },
  ],
  fields: [
    { key: "nombre", label: "Nombre", required: true, tab: "Básico" },
    { key: "subida", label: "Máx. subida (kbps)", type: "number", tab: "Básico" },
    { key: "bajada", label: "Máx. bajada (kbps)", type: "number", tab: "Básico" },
    { key: "degradado", label: "Porcentaje de degradado", type: "number", tab: "Básico" },
    { key: "estado", label: "Visibilidad", options: ["Público", "Privado"], tab: "Básico" },
    { key: "precio", label: "Precio", required: true, tab: "Básico" },
    { key: "frecuencia", label: "Frecuencia", options: ["Mensual", "Bimestral", "Anual"], tab: "Básico" },
    { key: "cir", label: "CIR", type: "number", tab: "BMU" },
    { key: "estrategia", label: "Estrategia", options: ["Equitativa", "Prioridad", "Burst"], tab: "BMU" },
    { key: "rafaga", label: "Ráfaga", options: ["No", "Sí"], tab: "Mikrotik" },
    { key: "codigo", label: "Código de producto", tab: "Código de producto" },
    { key: "codigoInstalacion", label: "Código de instalación", tab: "Código de producto" },
  ],
  formTabs: ["Básico", "BMU", "Mikrotik", "Código de producto"],
  detailFields: ["velocidad", "precio", "frecuencia", "contratos", "estrategia", "estado"],
  detailKind: "network",
};

export function PlanesModule() {
  return <WisproModuleWorkbench config={config} />;
}
