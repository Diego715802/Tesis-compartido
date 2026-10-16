import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { WisproModuleWorkbench, type WisproModuleConfig } from "./inventory-workbench";

const config: WisproModuleConfig = {
  label: "Inventario",
  singular: "artículo",
  collectionLabel: "registros",
  description: "Controla stock y artículos desde una sola vista.",
  icon: Inventory2OutlinedIcon,
  searchPlaceholder: "Buscar por marca, modelo o serie",
  createLabel: "Crear nuevo stock",
  createDialogTitle: "Crear nuevo stock",
  editDialogTitle: "Editar stock",
  createSubmitLabel: "Crear Stock",
  updateSubmitLabel: "Actualizar Stock",
  addItemsLabel: "Agregar artículos",
  formLayout: "labelled",
  detailKind: "inventory",
  createDefaults: {
    view: "stock",
    cantidad: 0,
    disponibilidad: "0 disponibles",
    estado: "Fuera de stock",
    almacen: "Central",
  },
  views: [
    { value: "stock", label: "Stock" },
    { value: "articulos", label: "Artículos" },
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
    { id: "ST-01", view: "stock", marca: "MikroTik", modelo: "hAP ac²", tipo: "Router", cantidad: 12, disponibilidad: "10 disponibles", estado: "En stock", almacen: "Central", unidad: "Unitario", minimo: 2, maximo: 20, descripcion: "Router inalámbrico de doble banda para instalaciones residenciales." },
    { id: "ST-02", view: "stock", marca: "Ubiquiti", modelo: "LiteBeam 5AC", tipo: "Antena", cantidad: 4, disponibilidad: "3 disponibles", estado: "Stock bajo", almacen: "Central", unidad: "Unitario", minimo: 2, maximo: 10, descripcion: "Antena direccional para enlaces inalámbricos de larga distancia." },
    { id: "AR-01", view: "articulos", codigo: "6C63F8B2DFB4", serie: "LBM5-001843", mac: "A4:2B:B0:18:43:01", marca: "Ubiquiti", modelo: "LiteBeam M5", tipo: "Antena", cantidad: 1, disponibilidad: "Libre", estado: "Libre", almacen: "Central", ubicacion: "Almacén Central", tipoUbicacion: "Almacén", distribuidor: "RMA", unidad: "Unitario", minimo: 1, maximo: 10, descripcion: "Antena inalámbrica disponible para una nueva instalación." },
    { id: "AR-02", view: "articulos", codigo: "6C63F8B2E63F", serie: "LBM5-001844", mac: "A4:2B:B0:18:43:02", marca: "Ubiquiti", modelo: "LiteBeam M5", tipo: "Antena", cantidad: 1, disponibilidad: "Asignado", estado: "Asignado", almacen: "Cuadrilla 01", ubicacion: "Técnico Luis M.", tipoUbicacion: "Empleado", distribuidor: "RMA", empleado: "Luis Martínez", unidad: "Unitario", minimo: 1, maximo: 10, descripcion: "Antena reservada para una orden de instalación." },
    { id: "AR-03", view: "articulos", codigo: "6C63F8B2E495", serie: "HW-DEMO-01", mac: "90:17:AC:5C:10:31", marca: "Huawei", modelo: "HG8145V5", tipo: "ONT", cantidad: 1, disponibilidad: "Ocupado", estado: "Ocupado", almacen: "Cliente demo", ubicacion: "Cliente Arturo Santiago", tipoUbicacion: "Cliente", cliente: "Arturo Santiago", nodo: "Nodo Norte", unidad: "Unitario", minimo: 1, maximo: 10, descripcion: "Terminal óptica instalada en un domicilio de demostración." },
    { id: "AR-04", view: "articulos", codigo: "MKHAPAC2-021", serie: "MK-AC2-00021", mac: "CC:2D:E0:44:21:10", marca: "MikroTik", modelo: "hAP ac²", tipo: "Router", cantidad: 1, disponibilidad: "Mantenimiento", estado: "Mantenimiento", almacen: "Taller", ubicacion: "Almacén Devoluciones", tipoUbicacion: "Almacén", distribuidor: "Proveedor local", unidad: "Unitario", minimo: 2, maximo: 20, descripcion: "Router en revisión técnica preventiva." },
    { id: "AR-05", view: "articulos", codigo: "ZTEF670L-008", serie: "ZTE-F670L-008", mac: "E8:11:32:7A:08:55", marca: "ZTE", modelo: "F670L", tipo: "ONT", cantidad: 1, disponibilidad: "Inactivo", estado: "Inactivo", almacen: "Central", ubicacion: "Almacén Central", tipoUbicacion: "Almacén", distribuidor: "Importación", unidad: "Unitario", minimo: 2, maximo: 15, descripcion: "Equipo inactivo pendiente de diagnóstico." },
    { id: "AR-06", view: "articulos", codigo: "UBI-LAPGPS-017", serie: "LAP-GPS-017", mac: "F0:9F:C2:31:17:08", marca: "Ubiquiti", modelo: "LAP-GPS-R1", tipo: "Punto de acceso", cantidad: 1, disponibilidad: "Robado", estado: "Robado", almacen: "Nodo Sur", ubicacion: "Nodo Sur", tipoUbicacion: "Nodo", distribuidor: "RMA", nodo: "Nodo Sur", unidad: "Unitario", minimo: 2, maximo: 10, descripcion: "Equipo reportado como robado y bloqueado para reasignación." },
  ],
  fields: [
    { key: "marca", label: "Marca", required: true, fullWidth: true },
    { key: "modelo", label: "Modelo", fullWidth: true },
    { key: "tipo", label: "Tipo de equipo", options: ["Antena", "Módem", "OLT", "ONT", "Punto de acceso", "Repetidor", "Router", "Switch", "Otro"], fullWidth: true },
    { key: "descripcion", label: "Descripción", type: "textarea", fullWidth: true },
    { key: "unidad", label: "Tipo", required: true, options: ["Unitario", "Por lote"], fullWidth: true },
    { key: "minimo", label: "Stock mínimo", type: "number", required: true, fullWidth: true },
    { key: "maximo", label: "Stock máximo", type: "number", fullWidth: true },
    { key: "imagen", label: "Imagen", type: "file", fullWidth: true },
  ],
  detailFields: ["marca", "modelo", "tipo", "cantidad", "disponibilidad", "almacen", "estado"],
};

export function InventarioModule() {
  return <WisproModuleWorkbench config={config} />;
}
