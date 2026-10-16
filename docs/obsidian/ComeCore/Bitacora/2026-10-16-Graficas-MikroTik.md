---
proyecto: ComeCore
tipo: cambio-tecnico
fecha: 2026-10-16
estado: verificado-localmente
---

# Gráficas de red y mapa de temperatura MikroTik

**Fecha y zona:** 16 de octubre de 2026, America/Mexico_City.

**Tarea:** incorporar las referencias ECharts del usuario al Panel de Control y
preparar la consulta de su MikroTik sin inventar mediciones.

**Resultado:** ocho gráficas compartidas por Paneles de Control (Básico/Servidores)
y Servidores/MikroTik: CPU y memoria, RX/TX, temperatura por sensor, mapa de calor
sensor×tiempo, barras por interfaz, intensidad por interfaz, W/V y ventiladores RPM.
Los resúmenes administrativos demostrativos conservan su identificación.

## Archivos y migraciones

| Archivo o grupo | Cambio | Aplicación |
| --- | --- | --- |
| `apps/frontend/src/features/servidores/mikrotik-*` | Tipos, ocho gráficas, ECharts por módulos, controles HTML y monitor compartido | Compilado y servido localmente |
| `telemetry-history.ts`, `mikrotik-chart-options.ts`, `echarts-runtime.ts` | Historial limitado, huecos, opciones y carga diferida | Frontend local |
| `features/dashboard/dashboard-module.tsx` | Monitor en el panel; se retiraron contadores ficticios de red de esa pestaña | Frontend local |
| `apps/backend/src/mikrotik/mikrotik.service.ts`, `telemetry-metrics.ts` | Sensores múltiples, tasas válidas, caché y consulta SSH compartida, timeout y límites | Backend local |
| `mikrotik.service.spec.ts`, `apps/frontend/tests/mikrotik-charts.spec.ts` | Pruebas de SSH y representación de datos | Ejecutadas |
| `scripts/qa-monitor-session.mjs`, `qa-mikrotik-ssh.mjs` | Cuenta efímera con MFA y par SSH sintético para QA local | Solo pruebas optativas |
| `docs/MIKROTIK_MONITOR.md` | Guía operativa, conexión, limitaciones y fuentes oficiales | Guardada |
| Migraciones SQL | No aplica: no cambió el esquema | No se crearon tablas de telemetría |

## Decisiones y compatibilidad

- Se preservan login, Better Auth, MFA, permisos `red:read`, organización propietaria,
  BFF y gateway. Las credenciales SSH permanecen en el backend; huella obligatoria.
- El mapa de calor reemplaza ruido Perlin por °C observados. No simula una cámara
  térmica ni deduce distribución física a partir de sensores puntuales.
- El ISP no tiene cierres bursátiles: el tiempo sigue continuo y las interrupciones
  se representan como huecos. No se descargan datos de contaminación de Beijing.
- Magnitudes separadas: porcentaje, °C, Mbps, W, V y RPM. Las bandas de CPU y escala
  térmica son visuales, no alarmas de seguridad térmica por modelo.
- Consulta nominal cada 15 s mientras la pestaña está visible; pausa y actualización
  manual. El backend comparte una conexión en curso y caché de 10 s.
- Primera medición, reinicio de contadores o separación mayor de 60 s no se muestran
  como tasa de tráfico confirmada. Sin sensores, se muestra estado vacío.
- Historial en memoria de la vista, máximo 360 puntos. No sobrevive a la salida.
  No hay todavía recolección de fondo ni retención SQL de telemetría.
- La suma de interfaces puede duplicar flujos. La selección explícita de WAN y
  alarmas por equipo siguen pendientes.
- Diseño compacto heredado conservado; se actualizó el brief y el estado funcional
  de PRODUCT.md. No se rediseñaron los tokens globales.

## Diagramas y documentación

Los ERD y diccionarios existentes no necesitan regeneración: no cambió ninguna
relación, tabla ni permiso SQL. Se actualizaron índice e inventario funcional de
Obsidian con los nuevos controles y el intervalo de lectura.

## Pruebas y evidencia

| Verificación | Entorno | Resultado |
| --- | --- | --- |
| Suite backend | Vitest local | 73 pruebas aprobadas |
| Gráficas e historial | Vitest/ECharts SSR | 13 pruebas aprobadas: ocho gráficas, actualización, huecos, ausencia de sensores, límite y zoom conservado |
| Lector RouterOS | SSH local sintético | Lecturas y unidades, primera muestra sin tasa, reinicio, caché y concurrencia; huella incorrecta rechazada |
| Permisos de red | Runtime/BD local con fixtures | MFA y organización válida permitidos; otra organización denegada antes de consultar red |
| Frontera HTTP | Frontend/backend locales | 18 comprobaciones aprobadas: páginas/APIs sin sesión, origen externo, gateway y cabeceras |
| Compilación | Next.js y NestJS | Ambas compilaciones aprobadas |
| Análisis estático | ESLint frontend/Oxlint MikroTik backend | Archivos modificados sin errores |
| Chrome, perfil juan diego | Cuenta temporal con MFA; SSH QA identificado | Ocho gráficas de canvas, pausa, selector temporal y controles HTML accesibles; PNG descargado y abierto correctamente |
| Diseño | Escritorio configurado1440/móvil390 | Sin desbordamiento horizontal; tamaños reales del raster pueden excluir10px de scrollbar; capturas en `.impeccable/review/mikrotik/` |
| Equipo físico | No conectado | Pendiente, no presentado como prueba realizada |

Las capturas y el PNG de QA contienen **datos sintéticos**, identificados en la
cabecera de la sesión de prueba. No son mediciones de la red de CometaLink.
La revisión final detectó controles que dependían de canvas y leyenda de CPU
ambigua: se añadieron botones HTML y colores distintos. Se separó la franja de
leyenda de las unidades de los ejes tras la confirmación visual.

## Pendientes y seguimiento

Conectar el router físico y contrastar modelo, versión, sensores y contadores con
WinBox/CLI; ajustar frecuencia al hardware y documentar umbrales antes de activar
alarmas. Configurar únicamente en servidor host, organización, cuenta de lectura,
credencial y huella SSH verificada. La guía técnica detalla cada variable.

Faltan histórico SQL, recolección continua, selección WAN y pruebas en el entorno
público real. Esta tarea no certifica HTTPS, proxy, VPN ni seguridad de RouterOS.

**Cierre comprobado:** cuenta, organización y sesiones QA eliminadas y ausencia
verificada; archivo privado de credenciales retirado; par SSH sintético detenido;
backend normal reiniciado y estado `configuration_required` confirmado. La ruta
del ERP vuelve a exigir login. Las 18 comprobaciones HTTP se repitieron con el
backend normal y aprobaron. La revisión de las correcciones concluyó `ship`.

Obsidian: **43 archivos sincronizados** a la bóveda configurada, sin eliminar
notas ni forzar conflictos. Resultado estructurado en
`docs/testing/mikrotik-monitor-verification.json`.

**Privacidad:** no registrar contraseñas, claves, sesiones, semillas MFA ni
direcciones de equipos de la empresa en esta nota.
