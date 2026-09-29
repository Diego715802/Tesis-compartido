---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets:
  - "src/app/(erp)/clientes/page.tsx"
  - "src/app/(erp)/contratos/page.tsx"
  - "src/app/(erp)/planes/page.tsx"
  - "src/app/(erp)/facturacion/page.tsx"
  - "src/app/(erp)/inventario/page.tsx"
  - "src/app/(erp)/servidores/page.tsx"
  - "src/app/(erp)/nodos/page.tsx"
---

# Panel operativo de ComeCore

Mode: Operate

Audience: personal interno de un ISP durante sesiones prolongadas en desktop, laptop y tablet.

Job: comprender el estado operativo del ISP de un vistazo y entrar a los dominios principales desde un riel persistente.

Constraints: réplica visual de la interfaz autenticada de Wispro observada por el usuario; MUI; marca ComeCore; solo interfaz, sin integración, autenticación ni lógica de negocio; métricas en cero y estados demostrativos, nunca datos reales inventados.

## Direction contract

**THESIS:** Un tablero ISP compacto replica la densidad, jerarquía y ritmo medido del panel Wispro, sustituyendo el mundo visual anterior de ComeCore sin copiar su marca ni fingir datos operativos.

**OWN-WORLD:** Roboto a 13 px; texto gris #676A6C; barra superior #F5F5F5; tarjetas #FDFDFD sin radio, con sombra desplazada 3/3/8 al 18%; azul operativo #1C84C6; riel de iconos de 75 px y reglas grises de un píxel.

**STORY:** La barra fija identifica ComeCore; el riel lateral conserva orientación; la banda de contexto nombra “Paneles de Control”; tres pestañas organizan el área y una retícula densa resume contratos, facturación, entradas y tendencias.

**FIRST VIEWPORT:** Navbar fija de 54 px, riel izquierdo de 75 px, banda de contexto de 56 px, contenido con 30/20/40 px de padding; pestañas de 49 px; primera fila de seis tarjetas métricas y segunda de cuatro tarjetas, todas visibles antes del gráfico inferior.

**FORM:** Referencia fijada por el usuario: `https://cloud.wispro.co/stats/dashboard?locale=es`, inspeccionada en su sesión de Chrome. Semilla `pinned-reference`. La forma distintiva es su shell Bootstrap-like medido: densidad alta, tarjetas cuadradas, pestaña activa con borde azul y tablero de métricas sin decoración ajena.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: ninguna decisión visual bloqueante para esta etapa.
