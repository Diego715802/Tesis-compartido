---
proyecto: ComeCore
tipo: modelo-implementado
fecha: 2026-10-14
estado: aplicado-y-probado-localmente
---

# Modelo completo del ERP actual

Se amplió **la base PostgreSQL `comecore` existente**, con 67 tablas en 15 esquemas y 217 claves foráneas. Se conservaron las migraciones anteriores y los módulos originales. No se necesitan bases independientes por pantalla: compartir organización, cliente, contrato y permisos permite mantener la integridad de sus relaciones.

66 tablas tienen RLS y FORCE RLS. La excepción es `app_private.schema_migrations`: es un historial técnico privado sin permisos para el runtime. Las tablas de autenticación tienen políticas de servicio; las de negocio verifican organización y membresía. La cifra de RLS no significa que cualquier cuenta de servicio quede aislada automáticamente: los pools de autenticación y datos tienen funciones y privilegios diferentes.

[[Modelo/00-Relaciones|Diagramas Mermaid por dominio]] · [[Modelo/Diccionario|Columnas, restricciones y todas las cardinalidades]] · [[12-Seguridad-y-Verificacion|Seguridad y evidencia]] · [[13-Cobertura-de-Acciones|Cobertura de acciones]]

| Esquema | Tablas reales |
|---|---:|
| `app_private` | 1 |
| `audit` | 2 |
| `authn` | 6 |
| `billing` | 12 |
| `catalog` | 3 |
| `cms` | 3 |
| `crm` | 8 |
| `documents` | 1 |
| `erp` | 1 |
| `iam` | 3 |
| `inventory` | 6 |
| `network` | 8 |
| `security` | 5 |
| `service` | 7 |
| `support` | 1 |

## Relaciones principales

- Organización 1:N membresías; operador 1:N membresías: organización N:M operador mediante `iam.organization_memberships`.
- Cliente 1:1 cuenta; cliente 1:N contactos, direcciones y contratos. Un cliente puede no tener todavía una cuenta o contratos.
- Plan 1:N contratos, reglas de ráfaga y códigos de producto.
- Servidor 1:N interfaces y conexiones de contratos; nodo 1:N coberturas; OLT 1:N puertos; NAP 1:N puertos.
- Modelo de equipo 1:N activos; almacén 1:N activos y existencias; activo 1:N movimientos. Un activo tiene como máximo un destino operativo entre cliente, nodo o empleado.
- Contrato 1:N artículos y cargos recurrentes. El artículo asignado debe pertenecer al mismo cliente y organización; no puede participar simultáneamente en dos asignaciones activas.
- Cliente 1:N facturas y pagos. Pago N:M factura mediante `billing.payment_allocations`. Recibo/factura/archivo deben corresponder al cliente y propósito autorizados.
- Sitio CMS 1:N revisiones; revisión 1:N publicaciones. Revisiones/publicaciones son registros anexables, sin UPDATE/DELETE para el runtime.

Las FK compuestas incluyen la organización para rechazar vínculos cruzados aun si se conoce un UUID válido de otra organización. Los mínimos y máximos exactos se derivan de NOT NULL, índices únicos y FK; el diccionario es la referencia exhaustiva.

## Cambios aplicados en esta fase

| Migración | Resultado |
|---|---|
| `008_module_completion.sql` | Permisos por dominio; productos, destino y estados de activos; exclusividad activo/contrato/cliente; factura de recibo; metadatos de archivos privados; sitios, revisiones y publicaciones CMS. |
| `009_document_and_network_boundaries.sql` | Un recibo solo referencia un archivo de propósito `payment_receipt`; conexiones y consumo de red limitados a owner/admin/support. |
| `010_coverage_fields.sql` | SSID, amplitud de cobertura de 0 a 360 grados y activo relacionado. |
| `011_plan_strategy_options.sql` | Estrategias PCQ Queue Tree, PCQ Simple Queue y CAKE Simple Queue del formulario actual. |

Todas constan en el historial con SHA-256. Las pruebas de dominio se ejecutan en transacciones con ROLLBACK. No se agregaron clientes ni contraseñas predeterminadas al modelo.

## Persistencia actual y trabajo restante

| Superficie | Implementación comprobada | Pendiente concreto |
|---|---|---|
| Login, MFA, sesiones y permisos | Better Auth con PostgreSQL, guardas servidor y pruebas negativas | Aceptación del entorno público, SMTP, TLS y operación de altas/recuperación administrativa |
| Clientes y contratos | Snapshot cifrado en `erp.customer_workspaces`; validación y control de versión servidor | Migración transaccional del snapshot a tablas CRM/servicio y APIs por entidad |
| Planes, nodos, BMU e inventario | Modelo SQL con restricciones y RLS probado; formularios mantienen su comportamiento demo | Repositorios, endpoints y UI conectados; paginación, transacciones y validación por operación |
| Facturación importada | Comprobantes visibles de demostración; modelo facturas/pagos/asignaciones/recibos existente | API de recibos y almacenamiento privado; flujos contables; proveedores fiscales y de cobro |
| CMC | Integración anterior mediante bridge privado y archivos cifrados | Adaptar esa persistencia al nuevo modelo CMS antes de afirmar que usa las tablas nuevas |
| Archivos | Metadatos, límites, propósito y cuarentena SQL | Servicio de upload privado, validación del contenido, antivirus y descarga autorizada |
| Red real | Endpoint protegido; huella SSH y organización propietaria obligatorias | Credenciales/configuración de equipo, gestor de secretos, comprobación con hardware real |

El saldo de cuenta, existencias y total de factura no quedan sincronizados solo por existir sus tablas. Al conectar operaciones deben actualizarse mediante transacciones, reglas de negocio y pruebas de concurrencia; no habilitar escrituras arbitrarias desde el navegador.

## Abrir y regenerar el diagrama

[Visor local de relaciones](http://127.0.0.1:3210/): filtrar dominio, seleccionar tabla, buscar, ajustar escala e incluir enlaces de organización/autoría. Solo contiene estructura; no consulta registros ni expone credenciales. El servidor se limita a `127.0.0.1` y tres recursos permitidos.

Desde la raíz del repositorio, con Node disponible:

```sh
node scripts/generate-database-model.cjs
node scripts/document-database-model.cjs
node scripts/serve-database-model.cjs
node scripts/sync-obsidian.cjs
```

[[08-Diagramas-DBeaver|Diagramas nativos de DBeaver]] conserva los originales y agrega el modelo general y vistas por dominio. Los diagramas describen lo aplicado localmente; no certifican un despliegue público.
