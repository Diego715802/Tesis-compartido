---
version: 1
slug: "src-app-erp-servidores-page-tsx"
primary_target: "src/app/(erp)/servidores/page.tsx"
related_targets:
  - "src/features/servidores/servidores-module.tsx"
  - "src/features/servidores/mikrotik-monitor.tsx"
  - "src/features/servidores/mikrotik-charts.tsx"
---

# Monitor de infraestructura MikroTik

Mode: Operate

Audience: personal de redes y soporte que valida un router conectado localmente durante una prueba controlada.

Job: confirmar conectividad, reconocer sensores disponibles y observar en tiempo real salud, consumo eléctrico, ventilación y tráfico sin modificar RouterOS.

Constraints: hereda el lenguaje visual compacto de ComeCore; ECharts; consulta de solo lectura; las credenciales permanecen en el backend; un sensor ausente nunca se sustituye por un valor inventado.

## Direction contract

**THESIS:** Una mesa de diagnóstico de red reúne identidad, salud y tráfico del MikroTik en una secuencia de lectura operativa, evitando el mosaico genérico de métricas sin contexto.

**OWN-WORLD:** Superficies rectangulares blancas, reglas grises, tipografía Roboto compacta y azul operativo de ComeCore; las series reservan cian, verde, ámbar y rojo para mediciones diferenciadas.

**STORY:** El operador ve primero si la conexión es real y de solo lectura, después reconoce qué sensores existen, inspecciona su evolución y finalmente identifica la interfaz que concentra el tráfico.

**FIRST VIEWPORT:** Encabezado de monitor y estado; franja tabular de lecturas reales cuando existe conexión; pausa/actualización y ventana de tiempo; primera fila CPU/memoria y tráfico RX/TX. Ocho gráficas en dos columnas en escritorio y una en móvil; contexto del equipo e interfaces en un desplegable inferior. Los gráficos ofrecen controles HTML de zoom, restauración y PNG con acceso por teclado.

**FORM:** Extensión directa de la superficie establecida de Servidores. Semilla `inherited-servidores-operate`; la interacción distintiva es la actualización periódica con historial acumulado y zoom temporal de ECharts.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
