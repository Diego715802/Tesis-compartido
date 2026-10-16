---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-16
zona_horaria: America/Mexico_City
estado: nucleo-relacional-conectado-y-verificado-localmente
---

# Persistencia relacional de clientes, planes y contratos

**Fecha:** 16 de octubre de 2026, America/Mexico_City.

**Autor o tarea:** completar la conexión a PostgreSQL tras la prueba con cliente ficticio, por solicitud del usuario.

**Motivo:** el catálogo de planes era estado React y el contrato conservaba una etiqueta sin FK desde el guardado del ERP. Se conectan las tablas existentes, conservando el diseño, las identidades de interfaz y los datos anteriores.

**Comportamiento resultante:** Planes guarda y consulta su catálogo real y sus códigos; el formulario de contratos obtiene sus planes por API. Los expedientes guardan el núcleo en CRM y Servicio con `customer_id`/`plan_id` por organización. Lecturas SQL son la fuente de datos básicos, planes, precio y periodo. Una extensión cifrada conserva campos técnicos y operativos pendientes. Este cambio no completa todos los módulos del ERP ni declara producción lista.

## Archivos y migraciones

| Archivo | Cambio y propósito | Estado |
| --- | --- | --- |
| `database/migrations/012_connected_customer_workflow.sql` | workspace_key estable; índices únicos; asignación de red pendiente permitida sin recursos falsos; identidades inmutables | Aplicada en PostgreSQL local y registrada con SHA256 |
| `database/migrations/013_audit_deleted_customer_reference.sql` | Corrige referencia colgante al retirar fixtures; conserva record_id histórico y permisos de DELETE revocados | Aplicada y comprobada con limpieza real |
| `database/migrations/014_contract_billing_periods.sql` | Conserva Bimestral/Trimestral/Semestral del formulario | Aplicada; prueba real de Bimestral/Exento |
| `apps/backend/src/workspace/relational-workspace.ts` | Escritura normalizada y lectura autoritativa del núcleo; transacciones y archivado | Integrado en el backend existente |
| `apps/backend/src/workspace/plan-routes.ts` | Catálogo y códigos de producto reales, validación y permisos | Integrado |
| `apps/backend/src/main.ts` y `workspace-routes.ts` | Activan repositorio relacional; conservan cifrado, sesión, MFA, versión y controles existentes | Compilados y probados |
| `workspace-permissions.ts` y `workspace-routes.spec.ts` | Corrige propiedad opcional ausente que bloqueaba Facturación; regresión | Prueba aprobada |
| Frontend: API de planes, página/diálogo Planes y formulario de contratos | Consulta/alta reales, errores, carga, selección del plan y permiso de escritura | Compilado; lint sin advertencias |
| `scripts/test-customer-contract-flow.mjs` | 34 controles HTTP/SQL, roles, concurrencia, legado, archivo y limpieza recuperable | Ejecutado y aprobado |
| `docs/CONNECTED_WORKFLOW.md` y `docs/testing/*` | Operación, aplicación, límites y evidencia sin secretos | Actualizados |

Se preservaron las migraciones aplicadas anteriores. No se ejecutó una semilla ni una compra de infraestructura. No se trasladó el ERP a otra base ni a Supabase.

## Diagramas y documentación

Catálogo extraído del PostgreSQL actualizado: **67 tablas, 15 esquemas, 217 FK y 66 tablas con FORCE RLS**. Las cifras no cambian porque se conectan entidades ya existentes; no se añade una tabla por botón.

Se regeneraron el visor HTML, diccionario, relaciones Mermaid, 12 ERD de DBeaver y 15 diagramas por dominio de Obsidian. Se conservaron los diagramas originales existentes. Los nuevos identificadores únicos y la opcionalidad de servidor/nodo constan en el catálogo real.

- [[Modelo/crm|CRM]]: cliente, contacto, domicilio, perfil fiscal, estado de cuenta y asignación.
- [[Modelo/catalog|Catálogo]]: planes y códigos de producto.
- [[Modelo/service|Servicio]]: un cliente puede tener varios contratos; un plan puede servir a varios contratos.
- [[Modelo/00-Relaciones|Mapa de relaciones]] y [[Modelo/Diccionario|diccionario actualizado]].

## Decisiones y conservación

- La organización se obtiene de la sesión, nunca del cuerpo, URL o formulario; las FK compuestas y RLS se mantienen. El runtime sigue sin propiedad, superusuario o BYPASSRLS.
- Los planes se registran explícitamente. No se convierten los antiguos ejemplos React en datos del ISP, ni se inventan routers/nodos.
- El contrato puede existir administrativamente antes de aprovisionar red. `server_id`/`node_id` permanecen nulos hasta asignación real; sus FK siguen obligando a la misma organización cuando se asignan.
- Un guardado confirma núcleo relacional, cifrado y versión dentro de la misma transacción. Si hay un plan ajeno o inválido, se revierte todo. El bloqueo por organización también cubre la primera escritura.
- Se preservan claves UI en `workspace_key` y UUID internos como PK; no se permite trasladar el contrato a otro cliente ni reutilizar silenciosamente un cliente archivado.
- Administradores crean planes; Facturación modifica campos financieros existentes; Soporte conserva permisos operativos sin cambiar precios. Se evitó ampliar permisos para resolver los fallos encontrados.
- El archivado es lógico y conserva historia. Los cambios operativos deben usar la API; la edición directa por SQL no participa en la versión global del BFF.
- Los expedientes cifrados anteriores siguen visibles. Solo un guardado explícito los conecta al modelo: si falta el plan, no se altera el original. La prueba verificó ambos resultados.
- La base estaba vacía de clientes, planes, contratos y snapshots de negocio antes de esta integración. Al terminar vuelve a estar sin fixtures. No hubo datos reales que migrar en esta instalación.

## Pruebas y evidencia

| Verificación | Entorno | Resultado |
| --- | --- | --- |
| Compilaciones backend y frontend | Nest/Next/TypeScript | Correctas |
| Backend | Vitest | 8 archivos, 68 pruebas aprobadas |
| Límites frontend de autenticación/CMC | Node test, upstreams simulados | 2 archivos aprobados |
| Recorrido específico | HTTP real → BFF → backend → PostgreSQL | 34 controles aprobados |
| Alta de plan y código; nueva consulta | API y SQL | Persistentes; no estado local de demostración |
| Cliente → contrato → plan | JOIN SQL real | Una relación válida por organización |
| Referencia de plan ajeno | API y SQL | Rechazada; núcleo y cifrado sin cambios |
| Facturación y Soporte | Cuentas MFA reales aisladas | Operación permitida pasa; escalada de precio/plan denegada |
| Bimestral y Exento | API/SQL | No se convierten en Mensual/Activo |
| Dos escrituras simultáneas | API real | Una 200, otra 409 |
| Sesión nueva y logout | Better Auth real | Recupera persistencia; cookie antigua rechazada |
| Archivado y legado | API/SQL | Historia conservada, contador recalculado y conversión explícita sin pérdida |
| Datos temporales | SQL y manifiesto privado | Organizaciones, cuentas, sesiones y datos sintéticos retirados |
| Checks 007 y 008 | PostgreSQL real, ROLLBACK | Aprobados |
| Respaldo/restauración | Base temporal privada | Correctos antes de migrar y después de 014 |
| Lint frontend cambiado | ESLint | Sin advertencias |
| Lint backend | Oxlint | Salida 0; tres advertencias preexistentes, ninguna en los nuevos archivos relacional/planes |
| Integridad de migraciones | Historial y SHA256 | Coinciden los archivos aplicados |

Evidencia: `docs/testing/customer-contract-flow.json` y `connected-workflow-verification.json`. Los informes contienen controles y límites, no secretos ni registros de clientes reales. El precio usado en pruebas es sintético y no corresponde a un cobro.

Se corrigieron durante las pruebas: INSERT que incluía una columna protegida, bloqueo de catálogo que indebidamente exigía permisos de actualización, comparación de un campo opcional ausente y referencia de auditoría a un cliente eliminado. Los casos se repitieron hasta aprobar; no se ocultaron ampliando permisos.

## Pendientes y seguimiento

- Verificar los clicks y la presentación en navegador de esta versión. La evidencia de este cambio es compilación, HTTP y SQL; no se presentan capturas antiguas como un recorrido nuevo.
- Conectar por separado Inventario, facturación completa, red, tickets/dispositivos y demás entidades complementarias. El catálogo SQL existente no demuestra esos flujos operativos.
- Completar asignación/provisión y telemetría con equipos autorizados; no se efectuó ninguna operación sobre la red del ISP.
- Para publicar, comprobar HTTPS, correo externo, secretos, base privada/TLS, copias fuera del host y restauración en el entorno real. Las pruebas locales no equivalen a aceptación pública.
- Antes de convertir expedientes de otra instalación, revisar planes y restricciones. Los registros creados directamente en SQL sin clave de origen ni extensión no se adoptan como expedientes UI automáticamente.

Reversión: se conservan las fuentes y los respaldos privados; las migraciones aplicadas no deben editarse ni borrarse. La limpieza se limita a entidades de prueba de este script y valida sus miembros; si falla, conserva un manifiesto privado y permite reintento con `--cleanup-only`.

Sincronización Obsidian: 42 archivos sincronizados en la bóveda existente, sin eliminar notas ni conflictos.
