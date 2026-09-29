import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { WisproModuleWorkbench, type WisproModuleConfig } from "@/components/modules/wispro-module-workbench";

const config: WisproModuleConfig = {
  label: "Inventario",
  singular: "artículo",
  collectionLabel: "registros",
  description: "Controla stock, artículos, almacenes y distribuidores desde una sola vista.",
  icon: Inventory2OutlinedIcon,
  searchPlaceholder: "Buscar por marca, modelo, serie o almacén",
  createLabel: "Crear nuevo stock",
  views: [
    { value: "stock", label: "Stock" },
    { value: "articulos", label: "Artículos" },
    { value: "almacenes", label: "Almacenes" },
    { value: "distribuidores", label: "Distribuidores" },
  ],
  columns: [
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo", width: "22%" },
    { key: "tipo", label: "Tipo de equipo" },
    { key: "cantidad", label: "Cantidad" },
    { key: "disponibilidad", label: "Disponibilidad" },
    { key: "estado", label: "Estado" },
  ],
  records: [
    { id: "ST-01", view: "stock", marca: "MikroTik", modelo: "hAP ac²", tipo: "Router", cantidad: 12, disponibilidad: "10 disponibles", estado: "En stock", almacen: "Central", unidad: "Unidades" },
    { id: "ST-02", view: "stock", marca: "Ubiquiti", modelo: "LiteBeam 5AC", tipo: "Antena", cantidad: 4, disponibilidad: "3 disponibles", estado: "Stock bajo", almacen: "Central", unidad: "Unidades" },
    { id: "AR-01", view: "articulos", marca: "Huawei", modelo: "HG8145V5", tipo: "ONT", cantidad: 1, disponibilidad: "Asignado", estado: "Instalado", almacen: "Cliente demo", unidad: "Serie HW-DEMO-01" },
    { id: "AL-01", view: "almacenes", marca: "Almacén", modelo: "Central", tipo: "Bodega", cantidad: 58, disponibilidad: "Operativo", estado: "Activo", almacen: "Oficina principal", unidad: "Artículos" },
    { id: "DI-01", view: "distribuidores", marca: "Distribuidor", modelo: "Proveedor de muestra", tipo: "Proveedor", cantidad: 3, disponibilidad: "Catálogos", estado: "Activo", almacen: "Nacional", unidad: "Marcas" },
  ],
  fields: [
    { key: "marca", label: "Marca", required: true, tab: "Básico" },
    { key: "modelo", label: "Modelo", tab: "Básico" },
    { key: "tipo", label: "Tipo de equipo", options: ["Antena", "Módem", "OLT", "ONT", "Punto de acceso", "Repetidor", "Router", "Switch", "Otro"], tab: "Básico" },
    { key: "cantidad", label: "Cantidad", type: "number", required: true, tab: "Básico" },
    { key: "unidad", label: "Unidad", helperText: "Ejemplo: unidades, metros o cajas", tab: "Básico" },
    { key: "minimo", label: "Stock mínimo", type: "number", tab: "Control" },
    { key: "maximo", label: "Stock máximo", type: "number", tab: "Control" },
    { key: "almacen", label: "Almacén", options: ["Central", "Técnicos", "Devoluciones"], tab: "Control" },
    { key: "descripcion", label: "Descripción", type: "textarea", tab: "Control" },
  ],
  formTabs: ["Básico", "Control"],
  detailFields: ["marca", "modelo", "tipo", "cantidad", "disponibilidad", "almacen", "estado"],
};

export function InventarioModule() {
  return <WisproModuleWorkbench config={config} />;
}
