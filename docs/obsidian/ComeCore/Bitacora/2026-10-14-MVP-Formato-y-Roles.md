---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-14
zona_horaria: America/Mexico_City
estado: pdf-version-2-verificados
---

> Edición documental posterior: [[Bitacora/2026-10-14-MVP-Android-y-Presupuesto]]. Esta nota conserva el estado histórico; sus horas, costos y plataformas anteriores fueron sustituidos por la edición PDF 3.


# Edición PDF con portada y roles confirmados

**Fecha y hora:** 14 de octubre de 2026, 16:32, America/Mexico_City.

**Autor o tarea:** actualización documental solicitada por Juan Diego Reyes Carrasco.

**Motivo:** identificar a Alfredo Zamora Contreras, dueño de CometaLink, como responsable del presupuesto; corregir funciones del equipo y aplicar Arial 12, justificación, interlineado 1.5 y portadas con logo según la referencia visual del usuario. Entrega solicitada exclusivamente en dos PDF.

**Comportamiento resultante:** presupuesto de 16 páginas y MVP de 15 páginas, incluyendo una portada en cada archivo. Los documentos PDF vigentes sustituyen las versiones PDF anteriores. Los Word anteriores se conservan como versión histórica y no incluyen estas últimas correcciones.

## Archivos y migraciones

| Archivo | Cambio | Estado |
| --- | --- | --- |
| `docs/entregables/MVP/01_Presupuesto_ComeCore_CometaLink.pdf` | Alfredo como dueño y responsable del presupuesto; roles, horas y capacidad actualizados; nueva portada y formato | Generado y verificado |
| `docs/entregables/MVP/02_MVP_ComeCore_CometaLink.pdf` | Roles corregidos; primer MVP con tres integrantes operativos y app de Emmanuel en etapa posterior; nueva portada y formato | Generado y verificado |
| `abr/work/mvp-20261014/academic-v2/build_pdfs.py` | Generación reproducible de los PDF a partir del contenido previo y las correcciones autorizadas | Fuente de la edición PDF 2 |

Migraciones, código de aplicación, datos de operación y diagramas: **No aplica**.

## Decisiones vigentes

- Juan Diego Reyes Carrasco: backend, base de datos, seguridad y API.
- Diego Montiel Hernández: frontend del ERP.
- Osvaldo Uriel González Maldonado: UI y pruebas.
- Emmanuel Hernández Ibarra: app móvil para clientes.
- Gestión, análisis, documentación, despliegue y demás apoyo: Juan Diego, Osvaldo y Diego Montiel.
- Las horas estimadas se distribuyen en 500 para Juan Diego, 380 para Diego Montiel, 400 para Osvaldo y 192 para Emmanuel: total 1472. Para el primer MVP: 138, 118, 128 y 0 respectivamente; total 384. Emmanuel participa en la etapa posterior de la app.
- Las horas por función y las tarifas se conservan; no cambian los importes del presupuesto. Las dedicaciones semanales propuestas se ajustan a la distribución individual: capacidad integral 1638 h y holgura 166 h. Son supuestos de planificación pendientes de confirmar con el equipo.
- El cuerpo y las tablas usan Arial real incrustada de 12 pt; interlineado de 18 pt. Los párrafos se justifican y las tablas alinean campos y cifras según su naturaleza. Las portadas usan tamaños de título mayores para reproducir la jerarquía de la imagen de referencia.
- Portadas vectoriales azul marino, turquesa y blanco, con el logo transparente existente del ERP. La imagen adjunta se usa como referencia de composición; no se copian el año 2030 ni sus textos de ejemplo.

## Pruebas y evidencia

| Comprobación | Resultado |
| --- | --- |
| Identidad y funciones en tablas del PDF real | Alfredo y los cuatro integrantes correctos; sin las asignaciones antiguas |
| Horas y costos | Sumas por persona y rol cuadran; 384 h de MVP incluidas en 1472 h integrales; importes conservados |
| Fuentes | Solo Arial y Arial Bold incrustadas; todos los caracteres del contenido interior a 12 pt |
| Interlineado y alineación | 18 pt comprobados entre líneas del PDF; justificación definida en el generador |
| Diseño | Las 31 páginas revisadas visualmente; se corrigieron títulos aislados y tablas de totales fragmentadas |
| Límites de página | Sin desbordamiento horizontal; cabeceras y paginación revisadas |
| Logo y referencias | Transparencia del logo comprobada; siete destinos de fuentes conservados en el presupuesto |
| Originales | Plantilla y Word anteriores conservan sus hashes |

Evidencia: `abr/work/mvp-20261014/academic-v2/generation-report.json`, `final-quality-report.json`, contenido extraído y carpetas `budget-render-final` y `mvp-render-final`. Las versiones PDF previas se conservaron en la carpeta de trabajo.

## Pendientes y seguimiento

Los roles quedan confirmados por el usuario. Fechas, dedicación, costos comerciales, plataformas móviles, datos piloto y publicación siguen sujetos a la validación documentada; esta edición no ejecuta desarrollo ni despliegue del ERP.

Sincronización con Obsidian: el script conservador confirmó 38 archivos sincronizados en la bóveda existente, sin conflictos ni eliminación de notas.

Historial: [[Bitacora/2026-10-14-MVP-Presupuesto]].
