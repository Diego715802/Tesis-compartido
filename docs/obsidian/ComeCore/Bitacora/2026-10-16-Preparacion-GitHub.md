---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-16
estado: commit-local-publicacion-pendiente-de-autenticacion
---

# Avance preparado para GitHub

**Fecha:** 16 de octubre de 2026, America/Mexico_City.

**Motivo:** el usuario solicita subir el avance al repositorio existente `Diego715802/Tesis-compartido` y recibir su enlace.

**Comportamiento resultante:** se prepara un commit local del avance conservando arquitectura, módulos, autenticación, CMC, migraciones, diagramas y documentación. El commit local de código y documentación es `6da2b36`. La publicación remota queda pendiente de una sesión GitHub con permisos de escritura. No se han modificado datos de operación ni ejecutado nuevas migraciones por esta tarea.

## Archivos y migraciones

Cambios actuales de frontend/backend, dependencias, scripts, marca y documentación dentro del repositorio. Los `.env` reales permanecen excluidos; solo se incluyen ejemplos. No se incluyen `node_modules`, compilaciones, logs, respaldo de datos ni archivos del directorio externo `abr/work`.

Migraciones: se versionan los archivos ya existentes; no se aplica SQL por esta tarea.

## Diagramas y documentación

Se incluyen los diagramas y diccionarios existentes; el modelo no se modifica. Los PDF de MVP y presupuesto conservan la edición anterior. Sus tarifas monetarias y reserva del 10% fueron supuestos sin una cotización y no deben utilizarse como precio comercial ni gastos confirmados. El usuario recibió después una aclaración: honorarios pendientes de acuerdo y compras nuevas identificadas cero. La tabla conversacional posterior de horas no modificó aquellos PDF. Corregir los documentos cuando el usuario solicite esa edición.

## Pruebas y evidencia

| Verificación | Resultado real |
| --- | --- |
| Compilación backend | Correcta, Nest build |
| Compilación frontend | Correcta, Next build, TypeScript y generación de rutas |
| Pruebas backend | 8 archivos y 67 pruebas aprobadas |
| Pruebas de límites frontend | 2 archivos aprobados, autenticación y CMC con upstream simulado |
| `git diff --check` | Sin errores en los archivos previamente rastreados; al incluir documentos nuevos se detectaron espacios finales en diccionarios generados, sin efecto de ejecución |
| Archivos de entorno reales | Ignorados por Git |
| Patrones de secretos en candidatos | Sin claves privadas ni tokens de proveedor detectados; URL de ejemplo con marcador y credenciales sintéticas de tests identificadas |
| Remoto y rama | `origin` apunta al repositorio solicitado; rama local `main`; head remoto observado `ff8f0b75441280ff06cbe965a72820647acf2039` |
| Acceso HTTPS de escritura | Falló `git push --dry-run`: no hay credenciales GitHub disponibles |
| Conector GitHub | Desconectado; no permite publicar |
| Alternativa SSH no interactiva | Sin confianza de host configurada; no se cambió la configuración SSH |

Estas verificaciones no sustituyen una auditoría de seguridad completa ni la aceptación de producción. No se ejecutaron pruebas contra una red de clientes ni se publicó el ERP.

## Pendientes y seguimiento

Conectar GitHub o configurar autenticación de Git en la Mac; después verificar el head remoto y subir sin forzar ni sobrescribir cambios ajenos. No se solicita compartir contraseñas ni tokens por chat.

Sincronización Obsidian: 40 archivos sincronizados en la bóveda existente, sin eliminar notas ni conflictos.

## Actualización del avance: flujo relacional y monitor MikroTik

Nueva solicitud del usuario del 16 de octubre: actualizar este mismo repositorio
con el trabajo posterior. Se incluyen las migraciones adicionales 012–014, el
flujo relacional de clientes/planes/contratos, las ocho gráficas MikroTik, pruebas,
diagramas vigentes, capturas de QA identificadas y sus guías. No se aplica SQL ni se
publica un servicio de Internet por esta operación Git.

Verificación previa al commit: `git diff --check` correcto; `.env` reales ignorados;
revisión de 238 blobs de commits locales aún no publicados y 361 rutas candidatas
sin coincidencias con secretos locales ni patrones de claves privadas/tokens de
proveedor. Es una comprobación específica, no una garantía de ausencia universal
de secretos. Las credenciales sintéticas de QA se generaron fuera del repositorio
y ya se retiraron; los scripts de prueba contienen únicamente su generación.

La evidencia del avance está en las bitácoras de Persistencia Relacional y Gráficas
MikroTik: 34 controles del recorrido HTTP/SQL, 73 pruebas backend, 13 frontend,
compilaciones y 18 controles de frontera HTTP. Hardware físico y aceptación pública
continúan pendientes.

El remoto sigue en `ff8f0b75441280ff06cbe965a72820647acf2039`. En esta solicitud se
volvió a comprobar `git push --dry-run`: Git no dispone de usuario/credenciales
HTTPS; el conector GitHub devuelve sesión desconectada. Se guarda el avance en
Git local y se prepara la conexión oficial. No se presenta como una subida
remota completada; no se fuerza el remoto ni se solicitan tokens por chat.
