---
proyecto: ComeCore
tipo: indice
fecha: 2026-10-14
---

# ComeCore — documentación técnica

Estado actual verificado localmente el **14 de octubre de 2026**. Las notas iniciales del 9 y 11 de octubre se conservan como historia: sus cifras de tablas, login visual y dominios planeados fueron superadas por la implementación siguiente.

- [[11-Modelo-ERP-Completo|Modelo PostgreSQL completo y persistencia actual]]
- [[Modelo/00-Relaciones|Diagramas por dominio: uno a uno, uno a muchos y tablas intermedias]]
- [[Modelo/Diccionario|Diccionario de todas las tablas y claves foráneas]]
- [[12-Seguridad-y-Verificacion|Controles de seguridad, pruebas y pendientes públicos]]
- [[13-Cobertura-de-Acciones|Acciones revisadas y límites de la evidencia]]
- [[08-Diagramas-DBeaver|DBeaver y visor interactivo]]
- [[07-Control-Tecnico-Migraciones|Migraciones y checksums]]
- [[10-Sitio-Web-CMC|Sitio web y contenido: integración CMC local]]
- [[Bitacora/2026-10-14-MVP-Presupuesto|Documentos de MVP y presupuesto para CometaLink]]
- [[Bitacora/2026-10-14-MVP-Formato-y-Roles|Historial PDF de portada y roles]]
- [[Bitacora/2026-10-14-MVP-Android-y-Presupuesto|PDF vigentes: Android, beta noviembre y presupuesto actualizado]]
- [[Bitacora/2026-10-14-Modelo-Completo|Cierre del modelo y verificación]]
- [[Bitacora/2026-10-12-Modulos-Importados|Reemplazo de Inventario y Facturación]]
- [[Bitacora/2026-10-12-CMC|Integración local del CMC]]

- [[Bitacora/2026-10-16-Preparacion-GitHub|Avance preparado para GitHub y verificaciones de compilación]]

## Estado comprobado

| Elemento | Estado |
|---|---|
| Base local | PostgreSQL 18.6, `comecore`: 67 tablas, 15 esquemas, 217 FK; 66 tablas FORCE RLS y un historial técnico privado. |
| Autenticación | Better Auth conectado; MFA, sesiones y permisos servidor. 33 controles de integración aprobados; infraestructura pública pendiente. |
| Clientes/contratos | Snapshot cifrado en PostgreSQL; adaptación al modelo relacional pendiente. |
| Otros módulos | Modelo SQL aplicado; varias pantallas aún usan datos demo y requieren APIs transaccionales. |
| Diagramas | Visor local con filtros/zoom/detalle, 12 nuevos ERD DBeaver y 15 diagramas Mermaid por esquema. Se conservaron los tres ERD originales. |
| Seguridad SQL | Pruebas reales de RLS, permisos, relaciones cruzadas, actor y auditoría, con ROLLBACK. |
| Respaldos | Script ampliado para verificar restauración de todas las tablas, cantidades, RLS, restricciones e historial en una BD temporal. Resultado final en la bitácora. |
| Publicación | No desplegado por esta tarea; requisitos exactos en [[12-Seguridad-y-Verificacion]]. |
| Obsidian | Sincronización explícita mediante `scripts/sync-obsidian.cjs`, sin borrar notas ni sobrescribir ediciones ajenas. |

## Documentación histórica

[[01-Arquitectura-PostgreSQL-DBeaver]] · [[02-ERD-IAM]] · [[03-ERD-CRM]] · [[04-ERD-Auditoria]] · [[05-Mapa-General]] · [[06-Dominios-Planeados]] · [[09-Inventario-Funcional-ERP]] · [[Bitacora/2026-10-09]]

Cada cambio debe registrar motivo, implementación, pruebas y pendientes. No guardar secretos, contraseñas, tokens, cadenas de conexión privadas ni registros de clientes en estas notas.
