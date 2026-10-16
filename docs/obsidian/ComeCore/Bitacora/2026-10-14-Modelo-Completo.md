---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-14
zona_horaria: America/Mexico_City
estado: implementado-y-verificado-localmente
---

# Modelo completo, relaciones y seguridad — cierre local

**Motivo:** analizar todos los módulos actuales tras el reemplazo de Inventario/Facturación y completar una base relacionada, protegida y documentada.

**Comportamiento resultante:** la base `comecore` conserva sus tablas originales y llega a 67 tablas, 15 esquemas y 217 FK. Se agregaron cuatro tablas y campos/restricciones para las acciones actuales. 66 tablas FORCE RLS; historial de migraciones privado por ACL. No se movió el código original ni se desplegó el ERP en internet.

## Archivos y migraciones

| Archivo | Cambio y estado |
|---|---|
| `008_module_completion.sql` | Aplicada: permisos por dominio, activo/cliente/contrato, destinos, estados, factura de recibo, archivos y CMS |
| `009_document_and_network_boundaries.sql` | Aplicada: propósito del archivo y lectura de información de red restringidos |
| `010_coverage_fields.sql` | Aplicada: SSID, amplitud válida y activo de cobertura |
| `011_plan_strategy_options.sql` | Aplicada: estrategias del formulario de planes |
| `scripts/apply-database-migration.cjs` | Aplicación atómica e inmutabilidad por checksum; revisión del historial aprobada |
| Backend `security/database-boundaries.ts`, `config.ts`, `runtime.ts` y MikroTik | Rechaza credenciales SQL elevadas, requiere pin/organización del router; HIBP antes de consumir token de recuperación |
| Frontend `customer-date.ts`, `customer-list.tsx`, monitor MikroTik y navegación | Corrige fecha ISO que derribaba el directorio; texto de configuración real; submenú cerrado inerte para no recibir foco/clicks invisibles |
| `apps/frontend/eslint.config.mjs` | Reconoce CommonJS solo en pruebas `.cjs`; no deshabilita la regla en código del producto |
| Scripts de modelo, diagramas, pruebas y respaldo | Catálogo sin registros; diccionario/ERD, visor local, índices de acciones, pruebas repetibles y restauración completa |
| `AGENTS.md`, scripts npm y notas 00/06/07/08/09/11/12/13 | Estado de autenticación actualizado; comandos repetibles; historia conservada y estado vigente separado |

## Pruebas y evidencia

| Verificación | Resultado y alcance |
|---|---|
| Compilación NestJS + Next.js/TypeScript | Aprobada; frontend recompilado tras el ajuste de navegación |
| Backend Vitest | 8 archivos y 67 pruebas aprobadas |
| Autenticación real | 33 controles positivos/negativos con Better Auth y PostgreSQL aprobados; correo en memoria, no SMTP externo |
| Ingreso HTTP real | 18 comprobaciones aprobadas: 11 rutas redirigen al login, 4 APIs devuelven 401, CSRF externo 403, login/cabeceras y backend sin gateway |
| SQL 003 y checks 007/008 | Aprobados, incluyendo restricciones 009–011: contexto, organizaciones/roles, campos, FK, activos, recibos, archivos, CMS, auditoría y versión; ROLLBACK |
| Límite de organización de red | MFA/propietario 200; organización ajena 403 sin ejecutar servicio; fixture efímera retirada |
| Regresión Contratos | 245 aserciones aprobadas |
| Fechas de Clientes | 2 pruebas aprobadas; directorio persistido volvió a abrir sin crash tras reiniciar |
| BFF frontend | Autenticación aprobada y 10 escenarios CMC aprobados con upstream controlado |
| Lint | Frontend: 0 errores, 5 avisos del módulo importado; backend: 0 errores, 3 avisos. Archivos modificados de fecha, lista, monitor y navegación sin errores de ESLint |
| Dependencias | `npm audit --omit=dev`: 0 avisos; árbol completo: 5 avisos altos en herramientas ESLint/Next/braces. Pendiente resolver antes del proceso público de compilación |
| Historial y diff | Checksum de migraciones verificado; `git diff --check` aprobado |
| Catálogo/ERD | 67 tablas/217 FK consultadas; 12 nuevos XML validados y copiados a DBeaver sin sobrescribir ediciones distintas del usuario |
| Diagrama navegador | 1:1 cliente/cuenta y N:M pago/factura por tabla intermedia; filtros, búsqueda vacía, zoom y detalle comprobados; captura en `docs/database-model/diagram.png` |
| DBeaver nativo | Solicitud de apertura aceptada por CLI; renderizado nativo no verificado visualmente |
| Limpieza | Cuenta/org de análisis y sus sesiones/snapshot retirados; consulta final: 0 fixtures de análisis/red y 0 bases temporales de restauración |
| Respaldo final | `comecore-2026-10-14T19-21-30.649Z.dump`, privado fuera del repo; restauración completa aprobada en BD nueva y retirada |

El respaldo final verifica nombres de todas las tablas de aplicación, cantidades de registros, indicadores RLS/FORCE, cantidades de restricciones e historial/checksums. No sustituye respaldo de roles globales, copias externas ni recuperación en otro host.

## Recorridos y verdad de la persistencia

El índice estático de 71 archivos contiene 667 controles con eventos y 248 campos. La evidencia de navegador del 14 de octubre está en `docs/database-model/browser-review.json`; el recorrido anterior del 12 se resume en [[13-Cobertura-de-Acciones]]. No se afirma haber pulsado físicamente los 667 controles. Un control genérico se repite por fila y parte del código histórico ya no se renderiza.

Con cuenta de prueba aislada se comprobó contraseña + MFA, comprobantes/búsqueda negativa/vista previa, límite organizativo del CMC, conservación del cliente sintético y cierre de sesión. Acceder directamente a Clientes tras salir devolvió el login. La cuenta temporal fue eliminada; no se cambiaron credenciales de usuarios reales ni se realizaron operaciones financieras.

Clientes/Contratos siguen usando snapshot cifrado; Planes, Nodos, Inventario y BMU tienen pantallas demo. Las tablas normalizadas y sus restricciones se probaron directamente, pero los endpoints transaccionales y la adaptación del frontend siguen pendientes. El CMC conserva su bridge/almacenamiento cifrado anterior; las tablas nuevas no lo sustituyen automáticamente.

## Diagramas, notas y pendientes

[[11-Modelo-ERP-Completo]] · [[Modelo/00-Relaciones]] · [[Modelo/Diccionario]] · [[12-Seguridad-y-Verificacion]] · [[13-Cobertura-de-Acciones]] · [[08-Diagramas-DBeaver]]

Antes de publicar: APIs normalizadas y reglas contables/stock, SMTP y recuperación administrativa/MFA, HTTPS/proxy/cookies públicas, PostgreSQL privado con TLS, secretos/KMS, archivos/antivirus, proveedores externos, copias fuera del equipo, retención/monitoreo y corrección de avisos de desarrollo. Revisar con los requisitos aplicables de ASVS, sin afirmar certificación completa ni prometer un porcentaje de seguridad.

**Obsidian:** `scripts/sync-obsidian.cjs` confirmó 36 archivos sincronizados en la bóveda existente, sin conflictos ni eliminación de notas. No es un servicio automático para cambios externos. Los diagramas y estas notas no contienen contraseñas, tokens ni registros reales de clientes.
