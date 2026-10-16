---
proyecto: ComeCore
tipo: cambio técnico
fecha: 2026-10-12
estado: reemplazo local verificado
---

# Reemplazo de Inventario y Facturación desde el ZIP entregado

**Fecha:** 12 de octubre de 2026, America/Mexico_City.

**Solicitud:** sustituir exclusivamente los módulos existentes de Inventario y
Facturación por las versiones del archivo `Modulos_Inventario_y_Facturacion_ComeCore.zip`.
La solicitud vuelve a autorizar trabajo sobre estos dos módulos, previamente pausados.

**SHA-256 del ZIP:** `e50d85943b2ebbaf7a7c77cd2331e3c0f85baeda609b30c1363ec27e377c0270`.

## Alcance resultante

- Inventario: Stock y Artículos, formularios de creación/edición, detalle de stock,
  incorporación de artículos al contador de demostración, búsqueda y estado de equipos.
- Facturación: Comprobantes de Pago, búsqueda por cliente/factura, filtros y detalle.
- Facturación abre Comprobantes de Pago por defecto. Sus subrutas anteriores
  redirigen a `/facturacion/comprobantes` después de validar la identidad y permiso.
- La información es de demostración, como declara el paquete. Los cambios de
  inventario viven en memoria de la pantalla y se reinician al recargar. No se
  emiten comprobantes fiscales ni se realizan cobros reales.
- El formulario de agregar artículos del paquete actualiza el contador del
  stock de demostración; no guarda artículos, series ni MAC en PostgreSQL.

## Integración y conservación

| Archivo | Acción |
| --- | --- |
| `features/inventario/inventario-module.tsx` | Reemplazado con el archivo del ZIP; import del workbench adaptado a su carpeta local. |
| `features/inventario/inventory-workbench.tsx` | Copia aislada del workbench nuevo para Inventario; contención del panel de filtros de Artículos en móvil. |
| `features/facturacion/facturacion-module.tsx` | Reemplazado por el componente del ZIP, normalizando saltos de línea. |
| `features/facturacion/facturacion-data.ts` | Reemplazado por sus datos de demostración. |
| `components/navigation/sidebar-navigation.tsx` | Fusionada únicamente la lista de submódulos de Facturación y su selección inicial. |
| `app/(erp)/facturacion/[submodule]/page.tsx` | Conserva permiso servidor; redirige subrutas antiguas al módulo entregado. |

No se copió la configuración antigua `modules.ts`, que habría retirado el CMC.
No se sustituyeron el sidebar ni las páginas del ZIP de forma completa: carecen
de los guardas actuales de autenticación. El menú conserva su filtro por permisos.
El workbench común original usado por Servidores no se modificó.

Se guardó respaldo de los archivos anteriores y manifest de hashes en el
directorio privado de ComeCore `module-backups/20261012T155308Z-inventario-facturacion`.
No se movieron archivos originales ni se modificaron credenciales de usuario.

**Migraciones y diagramas:** no aplica. El paquete no trae tablas, migraciones,
APIs ni almacenamiento backend y la integración no cambia el modelo relacional.
Las tablas y ERD PostgreSQL existentes se conservan. La conexión operativa de
estos módulos a la base de datos continúa pendiente.

## Comprobaciones

| Prueba ejecutada | Resultado |
| --- | --- |
| Compilación Next.js y TypeScript | Aprobada con rutas Inventario, Facturación, CMC y módulos existentes. |
| ESLint de los archivos afectados | Cero errores; cinco advertencias heredadas del componente entregado (cuatro funciones no utilizadas y una navegación interna con window.location.assign). |
| Comparación contra ZIP | Componentes y datos Facturación coinciden normalizando CRLF/LF; Inventario conserva el contenido con import local aislado. |
| HTTP con identidad/MFA reales | Inventario, Facturación, Comprobantes y rutas de Servidores/CMC responden 200. |
| HTTP sin sesión | Inventario y Comprobantes redirigen al login. |
| HTTP con rol sin permiso | Usuario temporal con rol viewer redirige a sin-permiso para ambos módulos; rol restaurado después de la prueba. |
| Subruta anterior | Facturación/pagos redirige a Facturación/comprobantes con sesión autorizada. |
| Navegador: Inventario | Campos obligatorios, creación y edición de stock demo, incremento del contador de artículos y búsqueda por serie comprobados. |
| Navegador: Comprobantes | Búsqueda vacía, filtro Pendiente sin resultados, limpieza del filtro y apertura/cierre del detalle comprobados. |
| Capturas | Escritorio 1440 px y móvil 390 px: Stock, Artículos, Comprobantes y detalle; `.impeccable/review/imported-modules`. |
| Detector de diseño | Cero hallazgos primarios; 22 advertencias informativas del estilo existente/entregado. |
| Corrección móvil Artículos | Campos y botón Limpiar filtros dentro de 390 px; ancho global 390 px. Estados desplazables en su región 340/442 px, tabla en región 364/1120 px. Seleccionar Robado devuelve un registro; limpiar devuelve los seis registros. |
| Revisión visual independiente | Ocho capturas válidas. Único defecto material de ancho móvil corregido y aprobado; disposición final ship. |
| Retirada de prueba | Cuenta sintética, membresía, sesiones y archivo privado retirados. Al recargar Comprobantes, la sesión retirada vuelve al login. No se modificó la cuenta del usuario. |
| Documentación final | Registro de la extensión en `.impeccable/review/imported-modules/documentation.md`; documentos globales de producto/diseño conservados. Esta bitácora y el índice se sincronizan mediante el script conservador de Obsidian. |

## Pendientes y límites

- Los módulos no están conectados a las tablas del ERP; requieren integración
  backend independiente antes de representar operaciones reales.
- La representación del comprobante conserva el diseño del ZIP y está marcada
  como demostración. No equivale a generación de CFDI, PDF fiscal ni pagos reales.
