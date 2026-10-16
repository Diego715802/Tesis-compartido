---
proyecto: ComeCore
tipo: bitacora
fecha: 2026-10-14
zona_horaria: America/Mexico_City
estado: pdf-version-3-verificados
---

# MVP Android, horario real y presupuesto sin compras nuevas

**Fecha y hora:** 14 de octubre de 2026, 20:08, America/Mexico_City.

**Autor o tarea:** actualización de los dos PDF solicitada por el promotor del proyecto.

**Motivo:** confirmar Android de consulta, infraestructura existente y computadoras personales; horario lunes/miércoles/viernes de 08:30 a 14:00; beta con clientes al final de noviembre y cierre objetivo a inicios de marzo. Explicar WBS y A + B, y separar valoración de trabajo, compras y precio comercial.

**Comportamiento resultante:** presupuesto de 15 páginas y MVP de 14 páginas, con portada dirigida a la empresa ISP CometaLink y logo transparente. Cuerpo Arial 12, justificado, interlineado 18 pt. Los PDF vigentes sustituyen la edición 2; plantilla y Word históricos se conservan sin cambios.

## Archivos y migraciones

| Archivo | Cambio y propósito | Estado |
| --- | --- | --- |
| `docs/entregables/MVP/01_Presupuesto_ComeCore_CometaLink.pdf` | WBS y presupuesto reestimados; compras cero; honorarios por acordar; horario y fechas objetivos | Generado y verificado localmente |
| `docs/entregables/MVP/02_MVP_ComeCore_CometaLink.pdf` | Android incluido en beta con clientes; métricas, alcance, calendario y costos coherentes | Generado y verificado localmente |
| `abr/work/mvp-20261014/academic-v3/build_pdfs.py` y `content.py` | Generación reproducible y datos de cálculo, conservando fuentes anteriores | Fuente de edición PDF 3 |

Migraciones, código de aplicación y datos de operación: **No aplica**. Esta actualización documental no construye Android ni verifica de nuevo el ERP.

## Diagramas y documentación

ERD y mapa de datos: **No aplica**, sin cambios de modelo. Se enlaza esta entrada desde el índice; las notas previas conservan su historia y remiten a esta edición.

- Android de consulta: plan, próxima fecha de pago, estado administrativo y avisos dentro de la app. Importe pendiente solo con fuente validada. Sin pagos desde app ni compra de otra plataforma móvil.
- Roles conservados: Juan Diego backend; Diego Montiel frontend; Osvaldo UI/pruebas; Emmanuel Android. Gestión y demás apoyo entre Juan Diego, Osvaldo y Diego Montiel.
- Beta objetivo: **27/11/2026**, cinco clientes y cinco operadores propuestos. Presentación en empresa y universidad con datos autorizados o anonimizados.
- Candidata: **19/02/2027**. Entrega objetivo: **05/03/2027**, condicionada al alcance y aceptación; no garantía de cierre universal del ERP.
- Inicio propuesto 19/10/2026 y pausa propuesta 21/12/2026-01/01/2027: 54 jornadas activas de 5.5 h por persona, 297 h individuales, 1188 h de equipo. No se suponen horas extras.
- Reestimación incremental: 324 h beta + 656 h posteriores = **980 h base**. Distribución total: Juan Diego 264, Diego Montiel 252, Osvaldo 248 y Emmanuel 216. Para beta: 88, 84, 80 y 72, respectivamente.
- Reserva del 10%: 98 h; queda capacidad no comprometida de 110 h. La reserva cabe por persona y por fase. Backend es el cuello principal; una holgura ajena no lo sustituye. Escenario pesimista 1225 h supera capacidad: requiere replanificar.
- Compras nuevas previstas: **$0.00 MXN**, usando recursos existentes. No elimina gastos de operación ya pagados ni prueba capacidad de correo, respaldo o hosting.
- Valor académico del trabajo: **$169,640.00**; reserva de esfuerzo **$16,964.00**; total valorado **$186,604.00**. Beta incluida: trabajo $55,960.00 + reserva $5,596.00 = $61,556.00.
- Honorarios y precio de venta **por acordar**. No se presentan utilidad ni impuestos de una contratación inexistente como gastos efectivos. A + B se explica como valor del trabajo + compras adicionales.
- Se conservan tarifas estimativas de la edición previa; no son salarios aceptados ni una cotización de mercado. Las horas nuevas son una reestimación del alcance incremental y deben calibrarse con avance real.

## Pruebas y evidencia

| Verificación | Entorno | Resultado | Evidencia |
| --- | --- | --- | --- |
| 19 tareas PERT, fases, roles y personas | Python / Decimal | Coinciden horas y valores; beta incluida una vez | `academic-v3/content.py`, `generation-report.json` |
| Jornadas reales M/X/V y capacidad individual | Python datetime | 54 jornadas; reserva cabe por persona antes y después de beta | `generation-report.json` |
| Contenido completo | PDF generado | Todos los párrafos y celdas presentes; 10 apartados presupuesto y 11 MVP | `final-quality-report.json` |
| Tipografía y límites | Extracción de PDF | Arial incrustada, interior 12 pt, 18 pt entre líneas; márgenes sin desbordar | `final-quality-report.json` |
| Diseño | Renders PNG 2x | 29 páginas revisadas, resumen financiero intacto, sin página final aislada | `budget-render-final` y `mvp-render-final` |
| Marca y originales | PDF/hash SHA256 | Logo con máscara alfa; plantilla y Word históricos conservados | `final-quality-report.json` |

## Pendientes y seguimiento

Reestimar al medir la primera semana y la beta; confirmar datos y muestra, dispositivos Android, laboratorio, pausa y recursos existentes. Probar infraestructura pública y restauración antes de aceptar clientes reales. Acordar honorarios y cualquier nueva necesidad antes de contratar. El alcance de marzo está descrito, con exclusiones explícitas; no se declara desarrollo o despliegue realizado.

Reversión: se conservaron los PDF de edición 2 en `academic-v3/*-v2.pdf`; fuentes de edición 2 y plantilla originales intactas.

Sincronización de esta entrada a Obsidian: el script conservador confirmó 39 archivos sincronizados en la bóveda existente, sin conflictos ni eliminación de notas.

Historial: [[Bitacora/2026-10-14-MVP-Formato-y-Roles]] y [[Bitacora/2026-10-14-MVP-Presupuesto]].
