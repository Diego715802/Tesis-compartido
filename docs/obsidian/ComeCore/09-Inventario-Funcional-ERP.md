---
tipo: inventario-funcional
proyecto: ComeCore
fecha: 2026-10-11
estado: revision-de-fuentes
---

> Actualización del 14 de octubre de 2026: esta nota conserva el análisis histórico. El modelo 007–011 ya se aplicó y probó; las cifras y pantallas vigentes están en [[11-Modelo-ERP-Completo]], [[12-Seguridad-y-Verificacion]] y [[13-Cobertura-de-Acciones]]. La existencia de tablas sigue sin equivaler a integración de todas las pantallas.


# Inventario funcional del ERP y modelo relacional

[[00-Indice|Volver al índice]] · [[05-Mapa-General|Mapa general]] · [[06-Dominios-Planeados|Dominios]]

## Alcance y evidencia

Revisión de los ocho módulos configurados en `apps/frontend/src/config/modules.ts`, todas las páginas App Router, sus formularios, diálogos, menús, handlers, stores, modelos de datos y los controladores Nest existentes. Las acciones repetidas por fila se agrupan por su handler; cada entidad/registro repite ese mismo comportamiento.

**Esta matriz es evidencia de revisión de código, no de haber pulsado cada control en el navegador.** El recorrido visual y la verificación con sesión real se registran aparte en la bitácora. Ningún mensaje de éxito de una demostración prueba escritura en PostgreSQL, envío de correo, emisión fiscal o cambio del router.

Durante esta implementación el store de clientes/contratos pasó a `/api/erp/workspace` (migración `006_secure_workspace.sql`), para dejar de leer/escribir el almacenamiento local heredado. Ese snapshot compatible con la UI y el modelo normalizado de `007_erp_domains.sql` son capas distintas: **crear las tablas de 007 no conecta automáticamente los formularios a ellas**. La normalización/migración del snapshot y los repositorios por dominio siguen pendientes.

Estado de 007 al redactar esta nota: propuesta completa, comprobación SQL y aplicación pendientes de la tarea principal. Actualizar este estado únicamente cuando existan resultados reales. No se copian fixtures del navegador ni se crean usuarios con contraseñas de ejemplo.

## Mapa de rutas y origen de datos

| Ruta | Superficie | Origen observado | Persistencia/capacidad real |
|---|---|---|---|
| `/` | Paneles de Control: Básico, Facturación, Servidores | Constantes de `dashboard-module.tsx` | Indicadores de demostración; no consultas agregadas de BD |
| `/clientes` | Directorio, expediente, cuenta, contratos/tickets relacionados | `useCustomers` / `/api/erp/workspace` | Snapshot servidor en esta etapa; tablas CRM originales disponibles, adaptación normalizada pendiente |
| `/clientes?cliente=…` | Ficha integral por ID | Mismo store de clientes | Solo abre una ficha; la autorización servidor no puede depender del parámetro de URL |
| `/contratos` | Contratos, filtros, edición, acciones por fila/lote | Mismo store compartido con Clientes | Persistencia snapshot; no aprovisionamiento de equipos |
| `/planes` | Listado y nuevo plan | Seis planes iniciales + `useState` | Crear modifica memoria React; se pierde al recargar |
| `/facturacion` | Borradores por defecto | `facturacion-data.ts` + `useState` | Datos y emisión simulados en memoria |
| `/facturacion/borradores` | Borradores | Estado React | Crear/emitir/eliminar solo demostración |
| `/facturacion/emitidas` | Facturas emitidas | Estado React | Consultas y previsualización demo; no timbrado |
| `/facturacion/notas` | Notas de crédito | Array de fixture | Filtros/selección/previsualización locales |
| `/facturacion/pagos` | Pagos | Array de fixture | Filtros/selección/previsualización locales |
| `/facturacion/promesas` | Promesas de pago | Array de fixture | Filtros/selección; descarga por selección solo aviso |
| `/facturacion/comprobantes` | Comprobantes de pago | Array de fixture | Visualización local; sin carga de archivo conectada |
| `/facturacion/arqueos` | Arqueos de caja | Array de fixture | Filtros/previsualización y exportación CSV locales |
| `/inventario` | Stock, Artículos, Almacenes, Distribuidores | Configuración de `WisproModuleWorkbench` | CRUD genérico solo estado React de la sesión |
| `/servidores` | MikroTik / BMU | MikroTik fetch + BMU workbench | MikroTik consulta backend; configuración BMU simulada |
| `/nodos` | Nodos, mapa, coberturas | 30 nodos de `node-data.ts` | Consulta/paginación de fixtures; no CRUD conectado |
| `/login`, `/recuperar`, `/restablecer`, `/seguridad`, `/sin-permiso` | Acceso y seguridad añadidos | Integración de autenticación en curso | La evidencia de sesiones/MFA/recuperación corresponde a las pruebas de seguridad, no a esta matriz funcional |

## Navegación y controles comunes

| Control | Handler/efecto observado | Relación o pendiente |
|---|---|---|
| Logo / enlaces de módulos | Navega a página existente | Conserva rutas y diseño |
| Contraer/expandir navegación | Estado de `ErpShell`; versión móvil abre/cierra navegación | Preferencia UI, no requiere una tabla de negocio |
| Submenú Facturación | Siete enlaces `/facturacion/{vista}` | Mismas facturas/pagos y relaciones; no crear siete BD independientes |
| Vista móvil y Notificaciones de la barra superior | Iconos originales sin handler operativo | No afirmar que cambian el dispositivo o cargan notificaciones |
| Selector de usuario / seguridad / salir añadidos | Dependen del sistema de acceso actual | Ver documentación y pruebas de autenticación |
| Cerrar, Cancelar, Escape, backdrop de diálogos | Cierra editor/detalle; comportamiento MUI según diálogo | No implican eliminación ni guardar |
| Alertas/snackbars | Mensaje del handler | Un aviso de demostración no confirma servidor |

## Clientes: acciones, validaciones y relaciones

Fuentes: `features/clientes/clientes-module.tsx`, `customer-list.tsx`, `customer-toolbar.tsx`, `customer-form-dialog.tsx`, `customer-detail-panel.tsx`, `customer-operational-dialogs.tsx`, `customer-dialogs.tsx`, `customer-store.ts` y `customer-types.ts`.

| Acción/control | Comportamiento observado | Datos/tablas necesarios |
|---|---|---|
| Buscar | Normaliza minúsculas y acentos; nombre/ID/documento/contacto/domicilio/datos fiscales | `crm.customers`, contactos, direcciones, perfiles |
| Abrir/cerrar filtros | Formulario local; cuenta filtros activos | Preferencia local UI |
| Filtrar nombre, correo, teléfonos, documento, dirección, ID personalizable | Coincidencias parciales sobre store | Campos CRM existentes |
| Filtrar IP/plan/servidor | Comprueba contratos anidados del cliente | `service.contracts`, conexiones, planes/servidores |
| Filtrar tipo, facturación, cuenta | Igualdad de tipo/flags/status | Clientes, perfil fiscal y cuenta |
| Limpiar filtros/búsqueda | Reinicia valores y página | No escribe BD |
| Paginación y tamaño | Cortes sobre array filtrado | Posteriormente paginación servidor con orden estable |
| Seleccionar fila | Muestra panel; en compacto abre drawer | Lectura del cliente autorizado |
| Ver detalle / ficha integral | Dialog de expediente y relaciones | Contratos, facturas, tickets, gateways, dispositivos |
| Ver cuenta corriente / movimientos | Dialog con balance, crédito, impagas, movimientos | Cuenta CRM + `billing.ledger_entries`; cálculo consistente pendiente |
| Editar cliente / Nuevo cliente | Formulario de datos personales, dirección, contacto, fiscales, asignación, comunicaciones y portal | Ocho tablas CRM originales; mapper servidor pendiente |
| Guardar formulario | `saveCustomerDetails`; conserva relaciones, registra auditoría UI y envía store | Snapshot compatible; no equivale a transaction de las ocho tablas CRM |
| Nuevo contrato desde expediente | Reutiliza `ContractFormDialog`, cliente preseleccionado | Mismas tablas de servicio del módulo Contratos |
| Nuevo ticket desde expediente | Exige contrato existente y título de al menos 3 caracteres; categoría/prioridad/descripción | `support.tickets`; FK contrato/cliente/organización |
| Importar clientes | Elige archivo y confirma que queda listo para validación | Importación al backend sin conectar; no incorpora registros reales |
| Exportar CSV / CSV con enlace de acceso | Crea Blob/archivo desde clientes filtrados | Exportación navegador; revisar permisos y fórmulas al conectar datos reales |
| Revisar móviles inválidos | Mensaje fijo de que no hay números inválidos | No valida exhaustivamente el directorio |
| Cambiar contraseña de portal (diálogo heredado) | Validación local y callback/mensaje; no identidad portal conectada | Debe reutilizar recuperación real, no almacenar claves en CRM |
| Panel: Detalle | Muestra identidad, domicilio, asignación y facturación | CRM existentes |
| Panel: Consumo | Resumen/gráfico de datos del contrato o estado pendiente de telemetría | `service.contract_usage_samples`; sin poblar con curvas sintéticas |
| Panel: Mapa | Coordenadas del expediente / componente GoogleMap | Direcciones y contrato; validez -90..90 / -180..180 |
| Panel: Pagos | Gateways y cuenta del expediente | Gateways CRM; pagos y asignaciones relacionados |
| Panel: App | Dispositivos, enlace portal y QR decorativo | `crm.customer_devices`; portal externo pendiente |
| Copiar enlace portal | Clipboard si `portalLink` existe | Nunca convertir enlace en token de sesión en URL |
| Panel: Auditoría | Eventos almacenados en el objeto del cliente | `audit.customer_events` y `audit.erp_events`; adaptar salida servidor |

Validaciones de cliente heredadas y store: identificadores/tipos y arrays válidos, teléfonos/correos/formato fiscal según formulario; creación/edición no equivale a la validación servidor. La API debe devolver errores sin confiar en campos de autoría, actor, organización o auditoría suministrados por el navegador.

## Contratos: acciones y formulario completo

Fuentes: `features/contratos/*`, `CustomerContract`, `use-contract-workbench.ts`, `contract-mutations.ts`, `contract-form-data.ts`, `contract-import-data.ts`.

| Acción/control | Comportamiento observado | Relación o pendiente |
|---|---|---|
| Buscar por todos/nombre/IP/serie/teléfono | Filtro normalizado con equivalencia de dígitos de teléfono | Contrato + cliente + conexión |
| Ordenar ID/nombre/IP/fecha; ascendente/descendente | Ordena array y reinicia página | Preferencia UI; índices según consultas futuras |
| Mostrar/ocultar columnas | Estado local de columnas | No necesita tabla de negocio |
| Búsqueda avanzada | Grupos AND/OR y reglas contains/eq/neq/gte/lte/empty/notEmpty | Operadores permitidos y parámetros SQL al implementar consulta servidor |
| Agregar/eliminar regla/grupo, Aplicar/Limpiar | Modifica modelo de filtros | No ejecuta SQL arbitrario |
| Panel de Control expandir | Indicadores OLT sin lectura y cuenta contratos configurados | No son mediciones de potencia/online/sincronización |
| Estado Todos/Habilitado/Deshabilitado/Alertado/Degradado/Suspendido | Filtra contratos y muestra conteos | `service.contracts.status` |
| Crear contrato | Formulario para cliente registrado | Requiere cliente/plan/servidor/nodo/interfaz reales |
| Editar contrato | Prohíbe cambiar ID o reasignar cliente; preserva facturas/tickets/consumo | FK y trigger de identidad de 007 |
| Detalle de fila | Dialog: Detalle, Facturación, Consumo, Mapa, Auditoría | Relaciones servicio/CRM/cobros/tickets |
| Abrir cliente desde detalle | URL codificada `?cliente=…` | Lectura autorizada independiente del frontend |
| Estado rápido o desde menú/detalle | Confirmación; cambia estado en store | No habilita/deshabilita router o PPPoE |
| Menú: habilitar/deshabilitar/marcar alertado/degradado | Cambia estado guardado | Aprovisionamiento red pendiente |
| Eliminar contrato / Confirmar | Lo quita del store del cliente; conserva otros contratos | Modelo normalizado usa archivo; borrado físico no concedido a runtime |
| Deshacer eliminación | Restaura objeto y valida identidad/colisiones | Historial persistente de restauración pendiente |
| Seleccionar filas / seleccionar página | Set de IDs de filas | Estado local UI |
| Descargar listado/selección | CSV con encabezados, escape y protección inicial de fórmulas | No se exportan claves PPPoE/WiFi |
| Actualización por lote | Revisión de cambios estado/plan/servidor/nodo/interfaz; valida dependencias y colisiones | Transaction servidor por lote pendiente para modelo normalizado |
| Importar estados | Archivo CSV, preview/errores; estados de contratos ya existentes | No crea clientes/contratos ni cambia cualquier campo |
| Notificar por correo/SMS/WhatsApp | Lista destinatarios elegibles y redacta mensaje; Enviar deshabilitado | Proveedor no conectado; no se envía nada |
| Menú: Acceso CPE | Valida IP/protocolo/puerto; copiar y abrir enlace con noopener/noreferrer | No prueba disponibilidad ni autentica equipo |
| Menú: Ping | Configuración registrada + aviso de servicio no conectado | No ejecuta ping |
| Menú: PPPoE Status | Configuración y aviso de servicio no conectado | No consulta sesión PPPoE |
| Menú: Resincronizar | Aviso de integración no conectada | No envía comandos al router |
| Menú: Auditorías / Consumo | Dialog de registros/consumo existente | No consulta router nuevo |
| Paginación, tamaño, cancelar, cerrar | Vista/editor de array | Paginación de servidor pendiente |

### Campos y reglas del contrato

| Sección | Campos reales observados | Modelo 007 |
|---|---|---|
| Básico / Cliente | Cliente, serie/ID, plan, servidor, nodo, interfaz, estado | `service.contracts`; catálogos y red por UUID |
| Conexión | Estática/PPPoE/DHCP, host/subred, IP, MAC, red, máscara, gateway, DNS, usuario/perfil/servidor PPP, ancho de banda | `service.contract_connections`; inet/cidr/macaddr, FK servidor/interfaz consistente |
| OLT / Cable módem | Modo, OLT, ID/serie/puerto ONU, NAP/puerto, precinto, VLAN/adicionales, control OLT/CATV, WAN; ID cable módem | `contract_olt_connections`, OLT/NAP y sus puertos; campos cable módem en contrato |
| Facturación | Precio, frecuencia, perfil, estado, inicio, día, período; entidad legal | Contratos + perfiles/entidades billing |
| Descuentos | Nombre, porcentaje/importe, valor | `service.contract_discounts` |
| Ítems recurrentes | Nombre, importe unitario, cantidad | `service.contract_recurring_items` |
| Ítems relacionados | Nombres de equipos/servicios y futuras asignaciones | `service.contract_items`, assets opcionales |
| Avanzado | FULL-NAT, tolerancia %, puerto/protocolo CPE, cola padre, prioridades, fecha alta, notas | Conexión + contrato |
| Claves de acceso/PPPoE/WiFi | Inputs de contraseña heredados | **Solo referencias** `vault:`, `kms:` o `secret:`. Resolución/rotación de secretos requieren backend y almacén externo; no plaintext |

Reglas observadas: cliente registrado; serie única; plan/servidor/nodo/interfaz requeridos; IP IPv4 válida y única por servidor, máscara contigua, MAC válida/requerida para DHCP; PPPoE usuario/clave/perfil requeridos y usuario único por servidor; OLT requiere OLT/serie/puerto ONU y puerto NAP si se usa NAP; VLAN 1..4094; fechas reales y períodos ordenados; importes no negativos, porcentajes 0..100, cantidades enteras positivas; puertos 1..65535 y prioridades 1..8. En 007 se trasladan tipos/intervalos/FK/uniques al servidor SQL; las reglas de comandos/disponibilidad/secretos corresponden al backend.

## Planes

Fuente: `features/planes/planes-module.tsx`.

| Acción/control | Comportamiento observado | Modelo |
|---|---|---|
| Buscar / búsqueda avanzada nombre y precio | Filtro local sobre nombre/precio formateado | `catalog.service_plans` |
| Crear nuevo Plan | Dialog de Básico, MikroTik y Código de producto | Tres tablas catálogo |
| Básico | Nombre, máximas subida/bajada + kbps/mbps, visibilidad, precio | Velocidades normalizadas a kbps; numeric para importes |
| MikroTik | Estrategia y activar ráfaga | `service_plans` y `plan_bursts` para parámetros del detalle |
| Código de producto | Servicio, primer/segundo interés, reconexión, instalación | `catalog.plan_product_codes` por tipo de cargo |
| Crear | Exige nombre/precio; agrega fila React; algunos campos solo se mantienen en draft y no pasan a la fila | Guardar todos los campos de catálogo en servidor pendiente |
| Seleccionar fila / mostrar detalles | Panel de estrategia/CIR y ráfagas de subida/bajada | El detalle heredado contiene valores constantes |
| Colapsar secciones del detalle | Collapse por sección | Preferencia UI |
| Contratos activos/suspendidos | Anillo con conteos iniciales cero | Contar `service.contracts`, no duplicar números en plan |
| Ocultar/mostrar panel; elegir columnas | Estado UI | No tabla de negocio nueva |
| Primera/anterior/siguiente/última/tamaño | Paginación local; anterior/siguiente originales saltan al extremo | Revisar UX antes de afirmar paginación convencional |
| Ayuda / ayuda crear | Snackbar o regreso al tab Básico | No servicio de soporte externo |

## Facturación: siete vistas

Fuentes: `features/facturacion/facturacion-data.ts` y `facturacion-module.tsx`. Existen componentes heredados no renderizados (`CreditNotesView`, `PaymentsView`, `PaymentPromisesView`, `CashAuditsView`) y versiones `OperationalView` que sí usa el módulo. El inventario sigue las versiones renderizadas.

| Vista/acción | Efecto observado | Tablas relacionadas / pendiente |
|---|---|---|
| Encabezado de vista, menú Exportar | Navegación por las siete rutas y menú CSV/impresión | Mismo dominio billing |
| Todas: búsqueda y limpiar | Filtro local sobre objetos | Consultas servidor con permisos pendientes |
| Todas: selección de fila/preview | Dialog de resumen | No descarga de documento fiscal real |
| Todas: tamaño de página | `slice(0,pageSize)` en varias vistas | No paginación completa de API |
| Borradores: crear factura | Tabs Factura/Items/Avanzado; exige cliente y monto > 0; crea ID Date.now y objeto demo | `invoices`, `invoice_items`; campos secundarios de form no siempre son controlados/guardados |
| Borradores: seleccionar filas/todos, emitir | Mueve objetos a emitidas con status Impaga y fecha fija demo | Emisión/timbrado/folios atómicos/SAT pendientes |
| Borradores: eliminar seleccionados | Quita objetos React | Solo borradores deberían eliminarse/archivarse en flujo financiero real |
| Borradores/Emitidas: filtros avanzados | Nombre y estado sí afectan; número/documento/fechas originales sin value/handler no filtran | Corregir al conectar API |
| Borradores/Emitidas: Últimos 3 meses/Último mes/Mes actual | Cambia botón seleccionado, no aplica un rango a `filtered` | Filtro temporal aún simulado |
| Emitidas: Factura, Nota de crédito, Cliente, ID Pago, Pasarela, Auditorías | Paneles de objeto/relaciones de demostración | Relaciones normalizadas con clientes/pagos/notas |
| Emitidas: Previsualizar / Imprimir PDF | Abre preview; impresión del navegador desde preview | No genera PDF fiscal oficial |
| Emitidas: Enviar por email | Mensaje con dirección de ejemplo; no llamada de proveedor | Correo de facturación sin conectar |
| Notas: búsqueda cliente/factura/estado | Filtros efectivos del array | `billing.credit_notes` FK factura |
| Notas: fila y tabs Nota/Cliente/Auditorías | Panel/previsualización | Sin crear/anular nota real desde backend |
| Pagos: filtros método/cobrador/registrado por | Filtros del array; limpiar reinicia | `payments`, membresías operadores |
| Pagos: tabs Pago/Cliente/Auditorías, transacciones | Panel con invoice ID | `payment_allocations`, no atribuir pago por nombre cliente |
| Pagos: Previsualizar/Imprimir/Imprimir POS | Preview y aviso POS | No registra cobro ni comunica impresora POS |
| Promesas: filtros tipo/deuda, selección múltiple | Filtros efectivos, selección/cancelar | `payment_promises` |
| Promesas: descargar seleccionadas | Solo mensaje “preparados para descarga” | No existe archivo descargado en ese handler |
| Promesas: ver/previsualizar | Dialog de detalle | No suspende/restablece contratos por promesa |
| Comprobantes: búsqueda, fila/previsualizar | Consulta de fixture de nombre/estado/fecha | `payment_receipts`, referencia privada a archivo; upload no conectado |
| Arqueos: filtros ID/creador | Filtro efectivo | `cash_audits`, pagos incluidos |
| Arqueos: resumen cash/transfer/card, preview/descarga | Preview y CSV de array | Conciliación y cierre financiero pendientes |
| Exportar listado / items / arqueo CSV | Blob de registros de la vista, descarga navegador | No consulta nueva BD; CSV debe respetar autorización |
| Preparar vista de impresión / Imprimir preview | `window.print()` | Impresión local; no evidencia de pago |
| Cliente desde paneles | Información demo resumida | Debe consultar ID y datos autorizados del mismo cliente |
| Auditorías de facturación | Timeline preparado con eventos demo | Reemplazar por `audit.erp_events` reales al conectar dominio |

Modelo financiero creado: identidad y moneda explícitas; FK contrato/cliente/organización; pagos/asignaciones al mismo cliente y moneda; saldo/cargos numéricos; idempotencia de cuenta corriente y registros append-only. **Faltan transacciones de negocio** para sumar partidas, limitar aplicaciones agregadas, bloquear concurrencia, emitir/anular, conciliar y actualizar saldos coherentemente. La existencia de tablas no acredita contabilidad ni cumplimiento fiscal.

## Inventario: cuatro vistas y workbench compartido

Fuentes: `features/inventario/inventario-module.tsx`, `components/modules/wispro-module-workbench.tsx`.

| Acción/control | Efecto observado | Modelo |
|---|---|---|
| Stock / Artículos / Almacenes / Distribuidores | Selector filtra `record.view` | `stock_levels`, `assets`, `warehouses`, `suppliers` |
| Buscar marca/modelo/serie/almacén | `recordText` incluye valores del objeto | Modelo/asset/warehouse |
| Búsqueda avanzada / aplicar estado/fecha | Filtro de demostración | Los fixtures actuales no siempre contienen fecha |
| Crear nuevo stock / Crear uno aquí | Formulario genérico: Básico y Control | No cambia estructura de formulario según vista |
| Básico | Marca, modelo, tipo, cantidad, unidad | `equipment_models`, cantidades de stock |
| Control | Mínimo/máximo, almacén, descripción | `stock_levels`, warehouse |
| Guardar crear/editar | Requeridos no vacíos; estado React | No realiza movimientos reales ni persiste BD |
| Seleccionar / Ver detalle | Panel de registro | Lectura local |
| Editar | Draft del registro | CRUD genérico no distingue todos los campos de supplier/warehouse |
| Eliminar / Confirmar | Borra fila de estado React; dialog explica demostración | Archivo/ajustes de inventario reales pendientes |
| Exportar CSV | Archivo con columnas visibles | Exportación local |
| Preparar impresión | Mensaje, sin `window.print` en workbench | No afirmar impresión realizada |
| Tamaño 10/20/50/100 | Corta primeras N filas | No hay paginación multi-página de servidor |

`stock_movements` conserva entradas/salidas/ajustes/devoluciones/transferencias para auditar cantidades: es fundamento de persistencia, todavía no existe botón de transferencia ni workflow servidor conectado. Asset puede vincularse a un cliente; no se considera que un cambio local haya instalado físicamente un equipo.

## Servidores y Nodos

Fuentes: `features/servidores/*`, `features/nodos/*`, `components/maps/google-map.tsx`, `apps/backend/src/mikrotik/*`.

| Acción/control | Efecto observado | Modelo / pendiente |
|---|---|---|
| Servidores: pestañas MikroTik/BMU | Cambia vista React | `network.servers.kind` |
| MikroTik: carga/polling cada 15 s | GET `/api/mikrotik/telemetry`; Next consulta Nest; hasta 360 muestras en memoria, huecos sin lectura; pestaña visible | Backend comparte consulta SSH y caché de 10 s; configuración/env y equipo determinan resultado |
| MikroTik: Actualizar / Pausar / Reanudar | Controla consulta de solo lectura; ventanas de 15/30/90 min | No cambia router ni contratos; no fabrica métricas |
| MikroTik: Requisitos para conectar el equipo | Desplegable con vínculo por organización, cuenta de lectura y huella SSH | Variables solo en backend; guía técnica en `docs/MIKROTIK_MONITOR.md` |
| MikroTik: ocho gráficos/interfaces | ECharts, mapa sensores×tiempo, unidades separadas, controles HTML de zoom/restauración/PNG | Historial persistente pendiente; capturas de QA sintética identificada; hardware físico aún no validado |
| BMU: buscar/crear/editar/eliminar/exportar/seleccionar/tamaño/filtros | Mismo workbench de demostración de inventario | Sin SSH/API BMU conectado |
| BMU: Básico | Nombre, host, puerto, estado | Servers |
| BMU: Conexión | Token/usuario, clave, SSL | 007 solo `credential_reference`; backend debe resolver secreto y exigir TLS según entorno |
| BMU: Avanzado | Control tráfico, DNS, notas | Servers; no activa funciones en equipo |
| BMU: contratos/vinculación/backup/status | Textos de fixture | Conteos derivados y comprobación de backup pendientes |
| Nodos: fila/lista | Selecciona nodo y centra/actualiza mapa | `network.nodes` |
| Nodos: mapa/marcadores | Componente mapa y coordenadas | API externa/maps y conexión pueden limitar visualización |
| Nodos: Coberturas | Dialog con nombre/descripción y mapa | `network.node_coverages` |
| Nodos: disponibilidad/capacidad | Usados/capacidad de fixture | Ocupación real se debe contar por contratos asignados |
| Nodos: páginas/tamaño 10/20/50/100/500 | Paginación local real del array | No crea/modifica nodos |

## Modelo adicional 007

Se conserva una sola base `comecore`, con esquemas separados y relaciones SQL. No conviene convertir cada módulo en otra base: las referencias contractuales/financieras perderían integridad FK entre bases.

| Esquema | Tablas nuevas | Conteo | Escritura permitida por rol IAM |
|---|---|---:|---|
| catalog | service_plans, plan_bursts, plan_product_codes | 3 | owner/admin |
| network | servers, server_interfaces, nodes, node_coverages, olts, olt_ports, naps, nap_ports | 8 | servidores/interfaces/OLT/puertos OLT: owner/admin; nodos/cobertura/NAP: owner/admin/support |
| inventory | equipment_models, warehouses, suppliers, stock_levels, assets, stock_movements | 6 | owner/admin/support |
| service | contracts, contract_connections, contract_olt_connections, contract_discounts, contract_recurring_items, contract_items, contract_usage_samples | 7 | operaciones owner/admin/support; descuentos/recurrentes owner/admin/billing; campos financieros del contrato protegidos por trigger |
| billing | legal_entities, service_billing_profiles, invoices, invoice_items, credit_notes, payments, payment_allocations, payment_promises, payment_receipts, cash_audits, cash_audit_payments, ledger_entries | 12 | owner/admin/billing |
| support | tickets | 1 | owner/admin/support |
| audit | erp_events | 1 | Solo trigger con rol interno NOLOGIN; app/readonly solo lectura de su organización |

37 tablas de negocio nuevas + una tabla de auditoría. Ninguna duplica las organizaciones, cuentas IAM o ocho tablas CRM existentes. El control de migraciones y tablas del proveedor de autenticación se documenta aparte.

Controles de todas las tablas de negocio nuevas:

- UUID, `organization_id` y UNIQUE `(organization_id,id)`; FKs compuestas impiden relaciones entre organizaciones.
- RLS habilitado y forzado, lectura solo con usuario/membresía/organización activos. Sin contexto no hay filas.
- Runtime no posee tablas, no es superusuario/BYPASSRLS y no recibe DELETE/TRUNCATE.
- Trigger fija autoría/fechas/versiones; ID y organización inmutables.
- Índices en lado hijo de las FKs, listados por organización y rutas de búsqueda/fechas necesarias.
- Auditoría registra nombres de campos y referencias de identidad, no valores de secretos ni cuerpos completos.
- Registros de ledger, aplicaciones de pago, stock y muestras de consumo son append-only para runtime.
- Sesión y permisos deben validarse antes de `SET LOCAL app.user_id/app.organization_id`: esos parámetros SQL por sí solos no autentican.

Referencia técnica: [Row Level Security de PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) y [restricciones de integridad](https://www.postgresql.org/docs/current/ddl-constraints.html). El administrador del clúster puede saltarse RLS; esta cuenta nunca debe usarse desde la aplicación.

## Diagramas por dominio

Los diagramas siguientes reflejan las FKs de la migración, aunque su existencia física solo se confirma después de aplicar/verificar SQL. En todos los modelos hay relación a organización y autores IAM, omitida repetidamente para legibilidad. No son bases independientes.
