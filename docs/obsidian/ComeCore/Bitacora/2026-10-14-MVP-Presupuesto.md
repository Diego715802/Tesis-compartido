---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-14
zona_horaria: America/Mexico_City
estado: documentos-elaborados-y-verificados
---

> Edición documental posterior: [[Bitacora/2026-10-14-MVP-Android-y-Presupuesto]]. Esta nota conserva el estado histórico; sus horas, costos y plataformas anteriores fueron sustituidos por la edición PDF 3.


# Presupuesto y producto mínimo viable para CometaLink

**Edición vigente:** los PDF fueron reemplazados con las correcciones de propietario, roles, Arial 12, interlineado 1.5 y portadas. Consultar [[Bitacora/2026-10-14-MVP-Formato-y-Roles]]. Esta nota conserva el historial de la primera propuesta; sus distribuciones personales anteriores fueron sustituidas.

**Fecha y hora:** 14 de octubre de 2026, 13:55, America/Mexico_City.

**Autor o tarea:** elaboración documental solicitada por el equipo de ComeCore.

**Motivo:** completar las dos partes de la plantilla para una entrega académica y una propuesta comercial antes de continuar el desarrollo.

**Comportamiento resultante:** dos documentos Word editables de nueve páginas cada uno, con los cuatro integrantes y una planificación basada en el estado comprobado del ERP. La aplicación confirmada por el promotor es una app móvil para clientes del ISP. No se modifica código, infraestructura ni datos de operación en esta tarea.

## Archivos y migraciones

| Archivo | Contenido | Estado |
| --- | --- | --- |
| `docs/entregables/MVP/01_Presupuesto_ComeCore_CometaLink.docx` | Diez apartados, WBS PERT, horas por rol, recursos externos, costo académico, escenario comercial, calendario, pagos, riesgos y fuentes oficiales | Generado y revisado visualmente |
| `docs/entregables/MVP/02_MVP_ComeCore_CometaLink.docx` | Once apartados, problema e hipótesis, MoSCoW, recorrido, aceptación, plan de seis semanas, presupuesto, métricas y decisiones | Generado y revisado visualmente |
| `docs/obsidian/ComeCore/00-Indice.md` | Enlace a esta bitácora | Actualizado |

Migraciones y diagramas: **No aplica**. Se conserva el modelo existente.

La plantilla original en Descargas conserva su SHA256 `c67b56bdf1c4763bf104427ed1b4372de0f1ac58b45791f0c3475f5e6abfc324`. Los documentos mantienen papel carta, márgenes, tipografía y patrones de tabla de la referencia. Se separan sus dos partes y se amplían filas para completar el contenido.

## Decisiones y supuestos

- MVP propuesto del 19/10/2026 al 27/11/2026: acceso de operadores, clientes, planes y contratos persistentes; migración piloto, auditoría, correo, respaldo, restauración y capacitación.
- Beta integral propuesta al 26/02/2027 y cierre al 26/03/2027. El año 2027 se interpreta a partir de la fecha actual; los días exactos son una propuesta.
- Después del MVP: inventario, facturación administrativa, nodos, integración de un MikroTik de laboratorio, CMC y app de consulta y tickets. Android/iOS y dispositivos de ensayo son supuestos a confirmar.
- El presupuesto base excluye CFDI, pasarelas, automatización de cortes, aprovisionamiento multivendedor, sustitución de UISP, alta disponibilidad y soporte 24 horas.
- Equipo: Juan Diego Reyes Carrasco, Emmanuel Hernández Ibarra, Diego Montiel Hernández y Osvaldo Uriel González Maldonado. La distribución individual de funciones y horas se propone para revisión del equipo.
- MVP de 384 horas-persona e integral de 1472 horas-persona. Las 384 ya están incluidas en 1472. No se factura otra vez el esfuerzo histórico del ERP.
- A 20 horas semanales por integrante durante 21 semanas activas se estiman 1680 horas de capacidad y 208 de holgura. Pausa propuesta del 21/12/2026 al 01/01/2027.
- Costo académico del MVP: $77,473.20 MXN. Costo académico integral: $300,085.60 MXN. Valoran trabajo, recursos y contingencia; no equivalen a desembolsos académicos.
- Escenario comercial con IVA ilustrativo: $112,336.14 MXN para el MVP y $435,124.12 MXN integral. Contingencia de 15%, margen bruto de 20% sobre precio e IVA de referencia de 16%, sujetos a revisión fiscal y comercial.
- Gasto externo base estimado: $2,048.00 MXN para dos meses de MVP; $8,624.00 para seis ciclos mensuales y tiendas del escenario integral, antes de impuestos y uso real. Tipo de cambio de planificación: 20 MXN/USD, no cotización observada.
- Se documentan fuentes oficiales de infraestructura, correo y tiendas. No hubo compras, registros ni contratación de servicios.

## Pruebas y evidencia

| Verificación | Entorno | Resultado |
| --- | --- | --- |
| Plantilla original | Archivo local | Hash idéntico antes y después |
| Secciones y equipo | OOXML | Diez y once apartados completos; cuatro nombres completos en ambos documentos |
| Cálculos | Python con Decimal | WBS, roles, costos, contingencia, margen, IVA y suma de pagos comprobados |
| Fidelidad | Comparación ZIP/OOXML | Estilos, tema, numeración y geometría preservados; solo contenido, enlaces y metadatos de autoría cambiados |
| Diseño | Renderizador documental incluido | Las 18 páginas finales inspeccionadas a tamaño original; sin recortes, superposiciones ni filas truncadas |
| Alcance | Documentación actual y `verification.json` | Snapshot, módulos demo, pruebas locales y aceptación pública distinguidos; app móvil planificada |

Las cifras de pruebas del ERP citadas proceden del informe existente del 14/10/2026; no se volvieron a ejecutar pruebas de aplicación por esta tarea documental. No se atribuyen entrevistas, ventas, aceptación empresarial ni seguridad en producción sin evidencia.

Evidencia interna en `abr/work/mvp-20261014`: contrato `artifact.md`, cálculos `calculation-checks.json`, informe `final-quality-report.json` y renders de las 18 páginas. Las imágenes y PDF intermedios de revisión se conservan como evidencia interna.

### Conversión a PDF solicitada el 14 de octubre

Se agregaron `docs/entregables/MVP/01_Presupuesto_ComeCore_CometaLink.pdf` y `docs/entregables/MVP/02_MVP_ComeCore_CometaLink.pdf`, conservando los Word originales. Ambos PDF tienen nueve páginas, texto seleccionable, los cuatro integrantes y las cifras completas. Las 18 páginas renderizadas son idénticas píxel por píxel a las páginas Word previamente revisadas; también se inspeccionaron las hojas de contacto de los dos PDF. Evidencia: `abr/work/mvp-20261014/pdf-delivery-quality.json`. Sin cambios de contenido, código o base de datos.

## Pendientes y seguimiento

### Corrección de marca solicitada el 14 de octubre

Se añadió el logo transparente de ComeCore en la parte superior derecha de la primera página de ambos Word y se regeneraron los dos PDF. Se reutilizó sin alterar la imagen que usa el ERP en `apps/frontend/public/brand/comecore-controla-conecta-crece.png`, conservando colores, canal alfa y proporciones. No se cambió el contenido ni la plantilla original.

Se revisaron las 18 páginas finales a tamaño original: ambos documentos mantienen nueve páginas. La comparación contra las versiones anteriores detectó cambios solo en el área del logo de la página 1; las páginas 2 a 9 son idénticas píxel por píxel. Se comprobó también texto PDF idéntico por página, transparencia real de la imagen y preservación de estilos, tablas y márgenes. Los cuatro archivos de `docs/entregables/MVP` quedaron actualizados. Evidencia actual: `abr/work/mvp-20261014/logo-revision/final-quality-report.json`; las versiones anteriores se conservaron en esa carpeta de trabajo.

- Validar con el equipo y CometaLink fechas, dedicación, funciones, servidores, plataformas móviles, lote piloto y disponibilidad de operadores.
- Ejecutar entrevistas y pruebas con usuarios. Las métricas son metas, no resultados; los desarrolladores no sustituyen a operadores del piloto.
- Revisar precios, tratamiento fiscal, pagos y propiedad contractual antes de contratar.
- El cierre técnico exige APIs normalizadas y pruebas de persistencia, aislamiento y recuperación. TLS, SMTP, respaldos externos y aceptación del entorno público siguen siendo condiciones de publicación.
- Sincronización con Obsidian: `scripts/sync-obsidian.cjs` confirmó 37 archivos sincronizados en la bóveda existente, sin conflictos y sin eliminar notas. Es una sincronización explícita.

Referencias: [[11-Modelo-ERP-Completo]], [[12-Seguridad-y-Verificacion]], [[13-Cobertura-de-Acciones]] y [[Bitacora/2026-10-14-Modelo-Completo]].
