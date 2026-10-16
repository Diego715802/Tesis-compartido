# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personal interno de un proveedor de Internet que opera clientes, contratos, planes, facturación, inventario e infraestructura de red durante jornadas prolongadas, principalmente desde desktop, laptop y tablet.

## Product Purpose

ComeCore será la interfaz administrativa de un ERP/BSS/OSS para ISP. Su propósito es reunir la operación comercial, financiera y de red en una experiencia coherente, clara y escalable.

## Positioning

Un mismo sistema conecta las tres realidades que definen la operación de un ISP: finanzas con consistencia estricta, procesos operativos de larga duración y red con estado observado y consistencia eventual.

## Operating Context

Uso empresarial diario por áreas administrativas, cobranza, soporte y operación de red. La interfaz debe favorecer lectura rápida, orientación constante y baja fatiga visual en sesiones largas.

## Capabilities and Constraints

Actualización funcional, 16 de octubre de 2026: el alcance visual inicial que se
conserva abajo es histórico. El ERP ya integra autenticación Better Auth/PostgreSQL,
sesiones, MFA y permisos servidor; clientes/planes/contratos tienen persistencia
relacional. El Panel de Control y Servidores incorporan ocho gráficas ECharts de
telemetría MikroTik de solo lectura. El router físico y el histórico persistente de
telemetría siguen pendientes. Sin sensores no se fabrican lecturas. El resumen
administrativo restante conserva estados de demostración identificados.

- Frontend existente en React, TypeScript y Next.js con App Router.
- MUI es la biblioteca de interfaz administrativa definida por la arquitectura.
- La primera superficie incluye únicamente Clientes, Contratos, Planes, Facturación, Inventario, Servidores y Nodos.
- Esta etapa es exclusivamente visual: no incluye datos, CRUD, formularios, dashboards, autenticación real, permisos, backend ni lógica de negocio.
- Cada módulo debe resolver por ahora a un placeholder de “Próximamente”.

## Brand Commitments

- Nombre: ComeCore.
- Activo de marca principal: `/Users/diegoreyes/Downloads/WhatsApp Image 2026-09-24 at 11.11.07 PM.jpeg`.
- Identidad predominantemente blanca y neutra con azul marino, azul y cian del logo usados como acentos sobrios.
- El producto debe sentirse empresarial, premium, tecnológico y vinculado con infraestructura y telecomunicaciones, sin parecer una plantilla administrativa genérica.
- Una línea geométrica inspirada en conectividad debe acompañar al logo como firma visual sutil.

## Evidence on Hand

- Arquitectura y alcance: `/Users/diegoreyes/Downloads/ANALISIS_ARQUITECTURA_ERP_ISP_WISPRO.md`.
- Logo oficial proporcionado por el usuario en formato JPEG.
- Registro inicial, histórico: no existían todavía datos reales, pantallas funcionales ni métricas que debieran representarse.
- Evidencia funcional actual: el monitor y sus ocho gráficas están documentados en `../../docs/MIKROTIK_MONITOR.md`, con validación local y SSH sintética identificada. La conexión a un router físico y la aceptación de producción permanecen pendientes.

## Product Principles

- Priorizar claridad operativa sobre ornamentación.
- Mantener separados los dominios aunque compartan una sola experiencia.
- Dar identidad mediante proporción, ritmo, marca y estados; no mediante saturación visual.
- Diseñar para crecer sin anticipar funcionalidades que aún no existen.
- Mantener accesibilidad, legibilidad y respuesta consistente en cada tamaño objetivo.
