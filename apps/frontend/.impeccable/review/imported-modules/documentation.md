# Entrega: Inventario y Facturación importados

Fecha: 2026-10-12. Resultado de la revisión final: listo para entrega dentro del alcance demo autorizado.

Esta nota documenta una extensión de superficies existentes conforme al contrato `.impeccable/surfaces/src-app-erp-imported-modules.md`. La autoridad de composición es el paquete `Modulos_Inventario_y_Facturacion_ComeCore.zip` aportado por el usuario. El cambio sustituye únicamente Inventario y Facturación; no establece una identidad visual nueva ni actualiza el sistema de diseño global.

## Superficies entregadas

| Superficie | Composición y comportamiento |
| --- | --- |
| Inventario / Stock | Búsqueda por equipo, tabla de registros, selección y panel de detalle. Formularios para crear o editar stock y agregar artículos; los cambios viven en memoria. |
| Inventario / Artículos | Búsqueda rápida por equipo y ubicación/responsable, limpieza de filtros, estados, selección, actualización masiva y paginación. |
| Facturación | Una única entrada operativa: Comprobantes de Pago, con búsqueda, filtros y acceso al detalle. |
| Comprobante | Modal con representación visual del documento, resumen del cliente y factura, estado y vacío explícito de pagos. La vista indica que el documento es de demostración y no representa una operación fiscal real. |

El workbench importado reside dentro de Inventario (`src/features/inventario/inventory-workbench.tsx`) para mantener independiente el workbench compartido utilizado por Servidores. La integración del menú conserva CMC y el filtro por permisos; el cierre de integración informa que sesión/MFA y guardas actuales permanecen conservadas. Esta nota no añade verificación de seguridad independiente.

## Relación con el sistema actual

La extensión reutiliza MUI, Roboto, la base tipográfica compacta, fondos blancos, texto gris, divisores discretos y azul operativo para selección y acción. Las ocho capturas muestran la misma cabecera ComeCore y, en escritorio, el rail existente. Stock conserva la fila seleccionada azul clara y el detalle lateral; en móvil, tabla y detalle se apilan.

Las superficies siguen la geometría rectangular y radios discretos del sistema actual. Inventario reutiliza el panel con radio de 2px y sombra corta de `3px 3px 8px rgba(0,0,0,.18)`. Facturación conserva el panel del paquete, con sombra `2px 3px 8px rgba(31,42,52,.12)`. Sus buscadores compactos y rectangulares son una variante local del módulo, distinta del buscador global en cápsula de 46px descrito en DESIGN.md. La representación inclinada del comprobante sobre fondo oscuro pertenece a la vista documental aportada; no se promueve a patrón global de tarjetas.

## Respuesta móvil y evidencia

El ajuste final de Artículos limita la anchura intrínseca del contenedor y de sus columnas (`minWidth: 0` y `minmax(0,1fr)`). Los dos campos y «Limpiar filtros» permanecen dentro del panel. Los estados mantienen su propia fila desplazable y la tabla conserva desplazamiento horizontal local para acceder a las columnas. Todas las pruebas móviles usaron viewport de 390 × 844 px; las capturas de página completa de Inventario y Artículos tienen 380px de ancho porque excluyen la barra vertical, y mayor altura por el contenido. Facturación y Comprobante tienen 390px. El cierre de revisión informa comprobación DOM de los controles de Artículos con viewport y ancho global de 390px. Una captura estática demuestra composición visible, no por sí sola el funcionamiento del desplazamiento o de cada interacción.

| Evidencia consultada | Dimensiones | Observación |
| --- | --- | --- |
| `inventory-desktop.png` | 1440 × 900 | Stock, selección, detalle y acciones en dos columnas. |
| `articles-desktop.png` | 1440 × 900 | Búsquedas, estados y seis registros con columnas completas. |
| `billing-desktop.png` | 1440 × 900 | Comprobantes de Pago, controles de búsqueda y registro demo. |
| `receipt-desktop.png` | 1440 × 900 | Modal, documento demo y detalle financiero de muestra. |
| `inventory-mobile.png` | 380 × 1240 | Acciones y búsqueda apiladas; tabla y detalle en una columna. |
| `articles-mobile.png` | 380 × 978 | Campos y limpieza dentro del panel; estados y tabla con recorte local. |
| `billing-mobile.png` | 390 × 844 | Cabecera y controles adaptados; tabla dentro de su panel. |
| `receipt-mobile.png` | 390 × 844 | Documento y resumen apilados; acciones de impresión/cierre visibles. |

Las capturas se encuentran junto a esta nota. La inspección documental se realizó sobre archivos y estas imágenes, sin abrir una sesión de navegador.

## Límites y validación

Los registros importados son datos de demostración. Inventario inicializa y modifica su colección mediante estado React; Facturación utiliza las colecciones locales de `facturacion-data.ts`. Esta integración no conecta los módulos a una base de datos ni convierte sus cambios en persistentes. El identificador, importes y estados del comprobante pertenecen a la muestra del paquete.

El cierre técnico recibido informa build y TypeScript aprobados, y lint con cero errores y cinco advertencias heredadas. Esos resultados se consignan como validación del trabajo principal; el pase documental no vuelve a ejecutar los comandos. No se afirma despliegue productivo, persistencia, emisión fiscal real ni una auditoría integral de autenticación a partir de estas comprobaciones.

## Desfase documental preexistente

PRODUCT.md todavía describe una etapa exclusivamente visual, sin datos, CRUD ni formularios, y pide que cada módulo muestre «Próximamente». Ese alcance histórico ya difiere de los módulos operativos demo observados y del contrato actual de importación. La nota registra el desfase sin reescribirlo.

DESIGN.md y `.impeccable/design.json` describen el lenguaje global de ComeCore; el sidecar conserva fecha de generación de 2026-09-26 y primitivas anteriores. Las variantes locales del paquete documentadas aquí no autorizan regenerar esos archivos. Se preservan PRODUCT.md, DESIGN.md y design.json completos; ninguna diferencia observada se corrige globalmente en este pase.

## Fuentes consultadas

- `apps/frontend/AGENTS.md`.
- `apps/frontend/PRODUCT.md` y `apps/frontend/DESIGN.md`.
- `apps/frontend/.impeccable/design.json`.
- `apps/frontend/.impeccable/surfaces/src-app-erp-imported-modules.md`.
- `apps/frontend/src/theme/theme.ts`.
- `apps/frontend/src/features/inventario/inventario-module.tsx` y `inventory-workbench.tsx`.
- `apps/frontend/src/features/facturacion/facturacion-module.tsx` y `facturacion-data.ts`.
- Las ocho capturas enumeradas arriba.
- Referencia del flujo documental: `/Users/dieguin/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/document.md`.

La referencia documental normalmente genera DESIGN.md y su sidecar. Aquí se aplica como registro de la extensión, respetando la solicitud explícita de conservar esos archivos y el límite de escritura de esta única nota nueva.
