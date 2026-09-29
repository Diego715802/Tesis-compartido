import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { WisproModuleWorkbench, type WisproModuleConfig } from "@/components/modules/wispro-module-workbench";

const config: WisproModuleConfig = {
  label: "Contratos",
  singular: "contrato",
  description: "Administra la conectividad, el plan y la asignación técnica de cada servicio.",
  icon: DescriptionOutlinedIcon,
  searchPlaceholder: "Buscar por cliente, dirección IP, plan, servidor o nodo",
  createLabel: "Crear nuevo contrato",
  columns: [
    { key: "cliente", label: "Cliente", width: "26%" },
    { key: "conectividad", label: "Conectividad" },
    { key: "servidor", label: "Servidor / OLT" },
    { key: "plan", label: "Plan" },
    { key: "estado", label: "Estado" },
  ],
  records: [
    { id: "CT-001", cliente: "Cliente de demostración", conectividad: "172.35.0.29", servidor: "BMU Principal", plan: "Fibra 100", estado: "Habilitado", nodo: "Torre Centro", mac: "00:1B:44:11:3A:B7", mascara: "255.255.255.0" },
    { id: "CT-002", cliente: "Comercio de muestra", conectividad: "PPPoE · demo-02", servidor: "Mikrotik Norte", plan: "PyME 200", estado: "Habilitado", nodo: "Nodo Norte", mac: "00:25:96:FF:10:21", mascara: "255.255.255.0" },
  ],
  fields: [
    { key: "cliente", label: "Cliente", required: true, tab: "Básico" },
    { key: "plan", label: "Plan", required: true, options: ["Fibra 100", "PyME 200", "Residencial 50"], tab: "Básico" },
    { key: "estado", label: "Estado", options: ["Habilitado", "Deshabilitado", "Suspendido"], tab: "Básico" },
    { key: "servidor", label: "Servidor", options: ["BMU Principal", "Mikrotik Norte"], tab: "Básico" },
    { key: "nodo", label: "Nodo Wireless", options: ["Torre Centro", "Nodo Norte", "Sin asignar"], tab: "Básico" },
    { key: "conectividad", label: "Dirección IP o usuario PPPoE", tab: "Básico" },
    { key: "mac", label: "Dirección MAC", tab: "Básico" },
    { key: "mascara", label: "Máscara de red", tab: "Básico" },
    { key: "precio", label: "Precio", type: "number", tab: "Facturación" },
    { key: "frecuencia", label: "Frecuencia", options: ["Mensual", "Bimestral", "Anual"], tab: "Facturación" },
    { key: "perfil", label: "Perfil de facturación", options: ["Básico", "Corporativo", "Sin perfil"], tab: "Facturación" },
    { key: "detalle", label: "Detalles técnicos", type: "textarea", tab: "Avanzado" },
    { key: "cola", label: "Cola padre", tab: "Avanzado" },
  ],
  formTabs: ["Básico", "Facturación", "Avanzado"],
  detailFields: ["plan", "servidor", "nodo", "conectividad", "mac", "estado"],
  detailKind: "network",
};

export function ContratosModule() {
  return <WisproModuleWorkbench config={config} />;
}
