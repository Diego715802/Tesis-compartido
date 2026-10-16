# 2026-10-16 · Cliente ficticio y Google Maps

## Cambios

Se agregó una semilla de mantenimiento exclusivamente local y repetible para
CCPRUEBA001: dos planes, dos contratos, cuenta y escenarios operativos ficticios.
Se guarda con RLS y validación del ERP; no se crea una cuenta de login ni se cambia MFA.
Se corrigió la CSP que impedía mostrar los mapas existentes y se agregó la vista
previa de emisoras al CMC. Se conserva el diseño y la estructura de módulos.

## Archivos

- `scripts/seed-demo-customer.mjs`, `scripts/fixtures/demo-customer.mjs`.
- `scripts/test-demo-customer.mjs`, `scripts/test-http-boundaries.mjs`.
- `apps/frontend/src/components/maps/google-map.tsx`, `src/proxy.ts`, `next.config.ts`.
- `apps/frontend/src/features/sitio-web/coverage-map.tsx` y editor de contenido.
- `docs/DEMO_CUSTOMER_AND_MAPS.md`.

## Decisiones

Los recibos/tickets/movimientos/Android se etiquetan como ficticios y permanecen en
la extensión cifrada del expediente. No se ejecutan cobros, envíos, CFDI ni comandos
de router. La vista sin clave usa iframe de Google; editar coordenadas no promete
geocodificación o selección por clic sin la API configurada.

## Comprobaciones

Cliente creado y carga repetida sin duplicación. Ocho controles de la semilla,
34 del flujo HTTP/BFF/PostgreSQL y 18 de acceso HTTP aprobados. Build de frontend
correcto y lint de cambios sin errores. Cliente, contratos, cuenta y mapa de Google
consultados en la sesión real del propietario. Mapas del cliente y cobertura CMC
comprobados en escritorio y móvil. Se corrigió el overflow de la ficha móvil.
La prueba temporal de coordenadas del CMC se revirtió sin publicar.
Evidencias en `docs/testing/maps`.

## Pendientes

Configurar una clave restringida de Maps JavaScript API y aceptar su facturación,
cuotas y comportamiento real antes de afirmar que están activos los radios y la
edición interactiva. La publicación de GitHub se registra solo después de verificar
el commit remoto. No se modificó el esquema de datos en este cambio.
