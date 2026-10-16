# Clientes, planes y contratos conectados

Actualización local del 16 de octubre de 2026. Se conserva una base PostgreSQL
`comecore`, con aislamiento por organización; no se necesita una base por módulo.

## Persistencia implementada

| Parte del recorrido | Fuente relacional |
| --- | --- |
| Identidad y datos básicos del cliente | `crm.customers` |
| Contacto y preferencias de comunicación | `crm.customer_contacts` |
| Domicilio principal | `crm.customer_addresses` |
| Asignación comercial | `crm.customer_assignments` |
| Perfil fiscal y estado de cuenta | `crm.customer_billing_profiles`, `crm.customer_accounts` |
| Catálogo de planes y códigos de producto | `catalog.service_plans`, `catalog.plan_product_codes` |
| Contrato del cliente con su plan | `service.contracts.customer_id` y `plan_id` |
| Campos técnicos/operativos complementarios y secretos | Extensión cifrada en `erp.customer_workspaces` |

Los datos básicos anteriores se leen de las tablas relacionales, no de su copia
en la extensión. La extensión mantiene las funciones existentes que aún dependen
de datos complementarios. No se guarda ningún secreto de red en texto plano en
las tablas nuevas. No se han integrado todavía todas las entidades de facturas,
movimientos, tickets, dispositivos y aprovisionamiento que pueden aparecer dentro
del expediente: conservar un campo no equivale a conectar su propio módulo.

Las relaciones cliente/contrato/plan tienen FK compuestas que incluyen organización.
Un cliente puede tener varios contratos y un plan puede usarse en varios contratos.
Los identificadores de interfaz se conservan en `workspace_key`; la PK interna es UUID.

Un contrato administrativo puede existir con `server_id` y `node_id` nulos mientras
no se asignen recursos reales. No se crean routers o nodos de ejemplo al guardar.
Cuando la etiqueta corresponde inequívocamente a un recurso registrado, se conserva
la FK de esa organización. El aprovisionamiento y la telemetría siguen siendo trabajo
del módulo de red, no una consecuencia del guardado administrativo.

## APIs y permisos

| Ruta pública del BFF | Operación |
| --- | --- |
| `GET /api/erp/plans` | Listado real y contadores derivados de contratos activos |
| `POST /api/erp/plans` | Alta de plan y códigos en una transacción; solo owner/admin |
| `GET /api/erp/workspace` | Expedientes con núcleo relacional y extensión cifrada |
| `PUT /api/erp/workspace` | Escritura atómica de datos relacionados, extensión y versión |

Se conservan sesión y MFA, CSRF/origen, permisos servidor y RLS forzado. El runtime
no es propietario, superusuario ni BYPASSRLS. Facturación puede editar campos
financieros existentes; Soporte puede editar campos operativos, sin crear planes
ni cambiar precios. El servidor verifica las relaciones y no toma la organización
del cuerpo o de parámetros enviados por el navegador.

El guardado usa bloqueo transaccional por organización y una versión optimista.
Dos escrituras con la misma versión no se pisan: una confirma y la otra recibe 409.
No se reescriben todos los clientes sin cambios. El borrado del expediente por un
administrador archiva las filas: no elimina su historial ni permite reutilizar
silenciosamente su identificador. La edición administrativa directa por SQL no
forma parte del protocolo de versión del BFF: usar las APIs para cambios operativos.

## Actualización de una instalación existente

1. Respaldar y comprobar restauración con `node scripts/backup-local-database.cjs --verify`.
2. Con las migraciones anteriores aplicadas y su historial íntegro, ejecutar:

```sh
node scripts/apply-database-migration.cjs 012_connected_customer_workflow.sql
node scripts/apply-database-migration.cjs 013_audit_deleted_customer_reference.sql
node scripts/apply-database-migration.cjs 014_contract_billing_periods.sql
```

3. Compilar y reiniciar backend y frontend con su configuración local existente.
4. Registrar los planes reales antes de guardar contratos. No se importan los
   planes de demostración de la UI como datos del negocio.
5. Ejecutar las pruebas con los servicios locales y PostgreSQL disponibles:

```sh
npm run test:customer-flow
npm run test:erp-database
```

El aplicador rechaza cambios de checksum y no modifica migraciones anteriores.
La migración 013 corrige la referencia de auditoría durante un DELETE administrativo:
`record_id` conserva el UUID histórico, sin una FK a un cliente que ya se retiró.
No habilita DELETE para el runtime. La 014 conserva los periodos bimestral,
trimestral y semestral que el formulario ya ofrecía.

## Expedientes anteriores y recuperación de pruebas

Los expedientes cifrados anteriores permanecen consultables. Su primer guardado
explícito conecta el núcleo al modelo relacional en una transacción. Si falta el
plan o hay datos inválidos, se revierte la operación y se conserva el cifrado anterior.
No hay conversión implícita durante GET ni creación automática de planes.

En esta base local no había clientes, contratos, planes ni snapshots de negocio
antes de aplicar la integración; los datos de prueba posteriores se retiraron.
Una instalación con expedientes anteriores debe revisar sus planes y restricciones
antes de la conversión. Las filas insertadas manualmente sin `workspace_key` ni
extensión no se adoptan automáticamente como expedientes de la UI.

La prueba guarda un manifiesto de IDs sintéticos, sin contraseñas, en un directorio
privado fuera del repositorio. Si su limpieza falla, conserva el manifiesto y rechaza
otra ejecución normal para no mezclar lotes. Para reintentar exclusivamente la limpieza:

```sh
node scripts/test-customer-contract-flow.mjs --cleanup-only
```

Verifica el prefijo de la organización y que todos sus miembros pertenezcan al lote
antes de borrar esos datos desechables. No se usa el script sobre organizaciones reales.

## Evidencia y límites

Resultados del recorrido real: `docs/testing/customer-contract-flow.json`.
Incluyen cuentas MFA ficticias, nueva sesión, JOIN SQL, plan ajeno, reversión,
concurrencia, permisos de facturación/soporte, archivado y conservación de legado.
El test no imprime contraseñas, tokens ni datos de clientes reales.

Los checks SQL 007/008 conservan RLS, FK, roles, auditoría y ROLLBACK final.
La compilación y las pruebas por HTTP no son una prueba de todos los clicks o de
la presentación en móvil. La aceptación pública de TLS, correo externo, copias
fuera del host y operación de red sigue pendiente en el entorno de publicación.

Diagramas actuales: `docs/database-model/index.html`, `relationships.mmd`,
`database/dbeaver/diagrams` y notas por dominio en Obsidian. El generador extrae
solo metadatos del catálogo SQL, nunca registros o secretos.
