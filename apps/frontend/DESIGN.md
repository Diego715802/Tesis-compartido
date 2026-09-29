---
name: "ComeCore ERP"
description: "Interfaz operativa compacta para la gestión diaria de un ISP."
colors:
  operational-blue: "#1C84C6"
  operational-blue-dark: "#166B9F"
  connectivity-cyan: "#23C6C8"
  ink: "#4B4E51"
  secondary-text: "#676A6C"
  muted-text: "#8A8C8E"
  header: "#F5F5F5"
  surface: "#FDFDFD"
  canvas: "#FFFFFF"
  divider: "#E7EAEC"
  active-row: "#B7DFEE"
  active-row-hover: "#ACD9EA"
  success: "#1AB394"
  danger: "#A33C3C"
  demo-bg: "#FFD08A"
  demo-ink: "#8F5700"
typography:
  page-title:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  section-title:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  card-title:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  metric:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "29px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  micro:
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  square: "0px"
  subtle: "2px"
  control: "24px"
  badge: "12px"
  pill: "999px"
spacing:
  micro: "4px"
  compact: "8px"
  control: "12px"
  card: "15px"
  standard: "20px"
  gutter: "30px"
  section: "40px"
components:
  topbar:
    backgroundColor: "{colors.header}"
    textColor: "{colors.secondary-text}"
    height: "54px"
  metric-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.square}"
    padding: "15px 20px"
  search-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.control}"
    height: "46px"
  selected-client-row:
    backgroundColor: "{colors.active-row}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.square}"
---

# Design System: ComeCore ERP

## Overview

**Creative North Star: “El tablero operativo medido”**

ComeCore adopta la densidad y el orden del panel operativo de referencia proporcionado por el usuario. La interfaz debe sentirse como una herramienta de trabajo para un ISP: compacta, estable y legible, con información agrupada en superficies rectangulares, navegación persistente y azul reservado para posición, selección y acción.

La marca ComeCore se conserva, pero la geometría, el ritmo y la jerarquía visual siguen la referencia: barra superior de 54px, rail lateral de 75px, contenido blanco, tarjetas cuadradas con sombra corta y tipografía Roboto de 13px.

## Colors

- **Azul operativo (`#1C84C6`)**: navegación activa, enlaces, iconos y acciones primarias.
- **Cian de conectividad (`#23C6C8`)**: métricas de red y acentos de consumo.
- **Texto (`#676A6C`)**: tono principal para operación prolongada sin contraste agresivo.
- **Cabecera (`#F5F5F5`)**: barra superior fija y fondos auxiliares.
- **Superficie (`#FDFDFD`)**: tarjetas, paneles y modales.
- **Fila seleccionada (`#B7DFEE`)**: selección inequívoca dentro de tablas o directorios.
- **Divisor (`#E7EAEC`)**: bordes, separadores y estructura interna.

El azul comunica estado o navegación; no se utiliza como fondo decorativo de grandes áreas. Los ceros y estados vacíos permanecen neutrales para no simular actividad.

## Typography

Roboto es la única familia de interfaz, con `Helvetica Neue`, Arial y sans-serif como respaldo. El cuerpo base es de 13px. Las etiquetas usan 600 de peso; los títulos de tarjetas 14px; los títulos de sección 18px; el título de página 24px; y las cifras principales 29px.

No se usan mayúsculas sostenidas ni tracking decorativo. La jerarquía depende del peso, la alineación y la separación vertical.

## Layout

La barra superior permanece fija a 54px. En escritorio, la navegación es un rail fijo de 75px con iconos centrados y una línea azul de 3px para el módulo activo. El contenido comienza después de ambos elementos.

La banda de breadcrumb mide 56px. El área de trabajo usa `30px 20px 40px` de padding. En el dashboard se aplica una cuadrícula de 12 columnas con gutters de 30px: la primera fila contiene seis tarjetas de dos columnas y 210px de altura; la segunda, cuatro tarjetas de tres columnas y 210px; debajo aparecen contratos conectados y, finalmente, la gráfica de clientes junto al historial de contratos.

Debajo de 900px el rail se convierte en drawer y el contenido se apila a una columna. Nunca debe aparecer desplazamiento horizontal global.

## Elevation & Depth

Las superficies operativas utilizan una sola sombra medible: `3px 3px 8px rgba(0, 0, 0, 0.18)`. El drawer móvil usa `10px 0 28px rgba(0, 0, 0, 0.16)` y el botón flotante de ayuda `0 3px 10px rgba(0, 0, 0, 0.20)`.

La sombra separa paneles del lienzo sin convertirlos en tarjetas redondeadas. No se usan gradientes ni efectos translúcidos.

## Shapes

Tarjetas, filas, barras, modales y paneles son rectangulares, con radio 0–2px. Solo la búsqueda, filtros, badges de estado y botones flotantes pueden usar radios completos. Esta diferencia hace que los controles de filtrado se reconozcan sin suavizar toda la interfaz.

## Components

### Top Bar

Barra fija de 54px, fondo `#F5F5F5`, borde inferior fino y marca compacta. Las utilidades viven a la derecha en áreas táctiles de al menos 40px.

### Sidebar Navigation

Rail de 75px con iconos MUI de una sola familia. El estado activo utiliza una barra azul de 3px y fondo `#F5F7F8`; en móvil se presenta como drawer. Los tooltips explican los iconos sin añadir etiquetas persistentes.

### Metric Card

Superficie `#FDFDFD`, sin radio, sombra corta, padding de 15–20px y encabezado separado por borde. Los números se alinean de forma tabular y nunca se inventan datos para llenar la interfaz.

### Search and Filters

El buscador principal mide 46px, usa borde gris, radio 24px e icono al inicio. Los filtros secundarios comparten la forma de cápsula; las acciones principales siguen siendo rectangulares.

### Selected Client Row

La fila seleccionada usa `#B7DFEE`, texto gris oscuro y una barra azul de 3px. Los botones de acción se agrupan al extremo derecho y mantienen tamaños compactos consistentes.

### Empty States

Un estado vacío conserva el título y el marco del panel, muestra un mensaje directo y no simula datos, gráficas o disponibilidad. En esta fase, la gráfica de consumo solo aparece como estructura hasta que exista la configuración real de red.

## Do’s and Don’ts

- Mantener la densidad, proporciones y orden de la referencia Wispro.
- Usar Roboto, superficies cuadradas, gutters de 30px y sombra corta de forma consistente.
- Reservar azul y cian para orientación, selección, métricas y conectividad.
- Conservar foco visible, áreas táctiles y adaptación móvil sin overflow.
- No añadir gradientes, glassmorphism, radios grandes ni tarjetas promocionales.
- No presentar datos operativos, conectividad o acciones como reales cuando son solo interfaz.
- No romper el shell global entre Dashboard, Clientes y módulos pendientes.
