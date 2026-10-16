---
version: 1
primary_target: "src/app/(erp)/inventario/page.tsx"
related_targets:
  - "src/app/(erp)/facturacion/page.tsx"
  - "src/app/(erp)/facturacion/[submodule]/page.tsx"
  - "src/features/inventario/inventario-module.tsx"
  - "src/features/inventario/inventory-workbench.tsx"
  - "src/features/facturacion/facturacion-module.tsx"
---

# Inventario y Facturación importados

Mode: Operate

Job: reemplazar únicamente los dos módulos por las versiones aportadas en el ZIP.

## Direction contract

**THESIS:** Inventario presenta Stock y Artículos; Facturación presenta únicamente
Comprobantes de Pago, sus búsquedas, filtros y vista detallada, como en la entrega.

**OWN-WORLD:** Conservar la composición y controles MUI del paquete y el shell
de ComeCore. El comprobante de demostración conserva su representación visual;
no es un documento fiscal real. No introducir una identidad nueva.

**STORY:** Consultar registros de demostración, abrir los formularios de stock,
editar en memoria, buscar artículos y consultar el comprobante. Los datos del ZIP
son demo y no se conectan al backend ni se vuelven persistentes al integrar.

**FIRST VIEWPORT:** Encabezado de módulo, búsqueda o filtros, listado y acciones
del paquete, con navegación y protección de acceso existentes.

**FORM:** Sustitución concreta según archivos del usuario. Isolar el workbench
nuevo dentro de Inventario para mantener Servidores; fusionar solo la lista de
submódulos de Facturación en el menú, conservando CMC y filtro por permisos.

**QUALITY BAR:** Compilación correcta, sesión/MFA y permisos conservados,
formularios y búsqueda utilizables, tablas con desplazamiento local en móvil,
datos identificados como demostración, sin cambios en módulos ajenos.

**FINISH:** Evidencia de escritorio y móvil, revisión de integración delimitada
al paquete, respaldo privado y registro técnico en Obsidian.
