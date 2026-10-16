---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-16
zona_horaria: America/Mexico_City
estado: pruebas-http-sql-aprobadas-integracion-relacional-pendiente
---

# Recorrido con cliente ficticio por HTTP y PostgreSQL

> Esta nota registra la primera prueba y su brecha. El trabajo posterior se documenta en [[Bitacora/2026-10-16-Persistencia-Relacional]]; la integración cliente/plan/contrato ya no está pendiente en esa versión.

**Fecha:** 16 de octubre de 2026, America/Mexico_City.

**Autor o tarea:** prueba del recorrido cliente, plan y contrato solicitada por el usuario.

**Motivo:** comprobar lo que funciona realmente antes de continuar la integración del ERP.

**Comportamiento resultante:** se agrega una prueba reproducible que atraviesa HTTP real, Next BFF, backend y PostgreSQL, con cuentas MFA y organizaciones desechables. Las rutas y los modelos de producción no se modifican. La prueba detecta y documenta la integración relacional pendiente del catálogo de planes; no la presenta como resuelta.

## Archivos y migraciones

| Archivo | Cambio y propósito | Estado |
| --- | --- | --- |
| `scripts/test-customer-contract-flow.mjs` | Alta y lectura del cliente ficticio; contrato; sesión nueva; permisos; datos malformados; limpieza aislada | Ejecutado localmente |
| `package.json` | Comando `npm run test:customer-flow` | Agregado |
| `docs/testing/customer-contract-flow.json` | Resultados anonimizados, límites y limpieza | Generado por la prueba |
| `docs/obsidian/ComeCore/00-Indice.md` | Enlace a esta entrada | Actualizado |

Migraciones: **No aplica**. No se cambia el modelo ni se aplican nuevas migraciones. Se ejecutaron los checks existentes 007 y 008 con ROLLBACK final.

## Diagramas y documentación

ERD y mapa: **No aplica**, sin cambios de esquema. Se conserva la distinción entre `erp.customer_workspaces` y las tablas normalizadas `crm.customers`, `catalog.service_plans` y `service.contracts`.

### Datos ficticios utilizados

- Cliente: `Cliente Ficticio - Prueba ComeCore`.
- Etiqueta de plan: `QA Ficticio 50 Mbps`.
- Contrato: `QA-FLOW-CTR-1`; precio sintético de $349 MXN/mes y día de pago 15. No son una tarifa del ISP ni un cobro realizado.
- Correo reservado de ejemplo y dirección IP de documentación; comunicaciones desactivadas, portal sin habilitar y sin conectar equipos de red.
- Tres operadores temporales con contraseñas aleatorias y MFA: propietario, lector de su organización y propietario de otra organización. No se imprimen ni guardan sus secretos en los resultados.

## Pruebas y evidencia

| Verificación | Entorno | Resultado |
| --- | --- | --- |
| Acceso sin sesión | HTTP al BFF real | 401 |
| Login y MFA de las cuentas aisladas | Better Auth y PostgreSQL reales | Correctos |
| Alta y nueva consulta del cliente | HTTP/BFF/backend/PostgreSQL | Datos conservados |
| Contrato y auditoría servidor | API existente | Plan como etiqueta, precio y día conservados; autoría servidor |
| Lectura independiente del registro | SQL y descifrado dentro de la prueba | Snapshot cifrado; organización y contrato correctos |
| Versión obsoleta | HTTP | 409; sin cambio de versión |
| Precio negativo y contrato duplicado | HTTP | 400 |
| Lector modifica / consulta | HTTP | Escritura 403; lectura legítima permitida |
| Parámetro de otra organización | HTTP | No expone el cliente ajeno |
| Origen ajeno | HTTP | 403 |
| Logout y cookie copiada | HTTP | Cookie anterior no obtiene acceso: 401 |
| Nueva sesión con segundo factor | HTTP | Recupera el mismo cliente y contrato persistidos |
| Filas normalizadas de la organización de prueba | SQL | Cero filas CRM/planes/contratos: integración pendiente confirmada |
| Limpieza | SQL | Organizaciones, cuentas, sesiones y snapshots temporales retirados; ausencia comprobada |
| Checks 007 y 008 | SQL real, transacción con ROLLBACK | Aprobados; relaciones, aislamiento y permisos del modelo normalizado |

El script específico completó **17 controles**, incluido el control de limpieza y la comprobación del límite de integración. No equivale a 17 pruebas de que el recorrido normalizado ya está terminado.

Comandos ejecutados con el Node disponible en el entorno:

```text
node scripts/test-customer-contract-flow.mjs
node scripts/test-erp-database.cjs
```

Los servicios locales estaban detenidos: se inició el PostgreSQL existente y se levantaron backend y frontend sobre loopback, sin alterar credenciales ni publicar servicios a internet. Se mantienen disponibles al finalizar.

## Pendientes y seguimiento

1. Conectar el catálogo de planes a su API y almacenamiento: actualmente el alta de Planes usa estado de React y se pierde al recargar.
2. Conectar el recorrido cliente/plan/contrato al modelo relacional, con plan_id y comprobación de relaciones por organización. El snapshot actual usa una etiqueta de plan y no prueba esa FK.
3. Verificar los clicks de formularios en navegador cuando esté disponible el acceso a esa superficie. Esta ejecución fue por HTTP y SQL; el intento de observación de la pestaña de error existente fue rechazado por la política del navegador y no se intentó eludirla.
4. La aceptación de HTTPS público, correo externo y operación de la red no está cubierta por estas pruebas locales.

Sincronización de esta entrada a Obsidian: 41 archivos sincronizados en la bóveda existente, sin eliminar notas ni conflictos.

Reversión y privacidad: la prueba elimina exclusivamente las entidades creadas por su ejecución, validando el prefijo de organización y sus miembros dentro de una transacción. No modifica registros ajenos ni deja credenciales predeterminadas.
