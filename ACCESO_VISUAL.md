# Acceso visual a ComeCore

## Alcance confirmado

Se añadió `/login` como una pantalla visual dentro del frontend existente. Por petición del usuario, **la autenticación real y la conexión a la base de datos se implementarán después**. El ERP actual sigue abierto. Esta entrega no ofrece protección para publicarlo en internet.

No se movió ni modificó código original. Se incorporaron la ruta de acceso, su componente, estilos, documentación, brief de diseño y un activo de marca. El PNG transparente nuevo completa la ruta que ya utiliza el componente `Brand` del ERP y corrige su imagen ausente. Login y ERP comparten ese mismo activo.

## Arquitectura revisada

- Monorepo npm workspaces: `apps/frontend` y `apps/backend`.
- Next.js 16 App Router, React 19, TypeScript, MUI y Roboto en el frontend.
- NestJS 12 con Fastify; endpoints existentes de bienvenida y telemetría MikroTik.
- Dashboard en `/`; Clientes, Contratos, Planes, Facturación, Inventario, Servidores y Nodos en el grupo `(erp)`.
- Esquema PostgreSQL con `iam.app_users`, organizaciones, membresías, roles y RLS; sin conexión de ejecución configurada actualmente. El adaptador Supabase es opcional y no constituye una integración de autenticación activa.
- Clientes y contratos incluyen estado local del navegador. Proteger datos reales requiere trasladar la persistencia y validación al servidor, además del login.
- Entornos locales separados y excluidos de Git; se conservaron intactos.

## Comportamiento de la vista previa

El formulario valida únicamente que exista una contraseña y que el correo tenga formato válido. No comprueba cuentas ni permisos. No llama a endpoints, no crea cookies, no persiste contraseñas y no redirige después del envío. Al enviar un formulario válido, vacía la contraseña y muestra un aviso explícito de integración pendiente.

Mostrar/ocultar contraseña y la validación de campos funcionan. La acción de recuperación explica que todavía no se envían correos. El enlace “Abrir ERP actual” abre la aplicación existente sin simular una sesión. No se fabrican cargas de red, bloqueos de intentos, recuperación, MFA ni cierres de sesión.

## Marca

Origen: logo PNG transparente adjunto por el usuario, `WhatsApp_Image_2026-10-05_at_12.46.18_PM-removebg-preview.png`, de 510 × 489 px. Se conserva completo, con transparencia y sin recorte ni recoloración, como `comecore-controla-conecta-crece.png`. El `Brand` ya existente consume esa ruta. El área de marca del login utiliza un fondo claro para mantener legible el texto oscuro del activo original.

## Decisiones visuales de `/login`

La pantalla extiende el sistema documentado en `apps/frontend/DESIGN.md` y observado en el tema, estilos globales y shell del ERP. Conserva Roboto, controles rectangulares, superficies claras, iconos MUI y los acentos azul/cian. El shell y la densidad de los módulos originales permanecen intactos. Estas decisiones corresponden únicamente a la superficie de acceso; no cambian el sistema global ni sus tokens.

- Roboto heredado, título de acceso de 36px y campos de 52px con radio de 2px. La escala local adapta la entrada al sistema sin sustituir el cuerpo operativo de 13px del ERP.
- Superficie blanca y panel de marca `#f1f6fa`; acción azul `#166b9f` y texto `#26343f` para legibilidad. El PNG completo mantiene su proporción mediante `object-fit: contain`, compartido con el `Brand` original.
- Dos paneles de 48%/52% en escritorio, 44%/56% entre 768 y 1023px, y marca/formulario apilados por debajo de 768px. El formulario conserva un ancho máximo de 400px.
- Foco azul `#1c84c6` con contorno de 2px, etiquetas persistentes y enlace de salto al formulario. Se conserva la regla del ERP de expresar estados honestos: los avisos explican la integración pendiente.

## Próxima etapa antes de publicar

Elegir el proveedor de identidad y conectar la base de datos. Implementar autenticación de servidor, hash de contraseñas mediante una biblioteca mantenida, sesiones con expiración y revocación, cookies seguras, CSRF, límites persistentes de acceso, permisos por rol y organización, protección de todas las páginas y APIs y recuperación/MFA con infraestructura real.

Configurar HTTPS, dominio, secretos, SMTP, base de datos y backups. Alinear los puertos en `.env.example` con los entornos de ejecución. Comprobar entonces credenciales correctas e incorrectas, intentos repetidos, sesiones expiradas, cierre de sesión y accesos directos protegidos. Esas verificaciones de autenticación no forman parte de esta entrega visual.

## Verificaciones realizadas

- Compilación optimizada de Next.js, con comprobación TypeScript: correcta. La tabla de rutas conserva las páginas originales y añade `/login`.
- ESLint sobre la ruta y el componente nuevos: correcto.
- Vistas de 1280 × 720, 768 × 1024, 390 × 844 y 320 × 740 px. Sin desbordamiento horizontal global en el login; las pantallas estrechas permiten desplazamiento vertical normal.
- Campos vacíos y correo inválido: mensajes en español y foco en el primer campo que necesita corrección.
- Mostrar/ocultar contraseña: el tipo del campo y el nombre accesible del control cambian correctamente.
- Navegación con teclado: avance del correo a contraseña con foco visible.
- Envío de datos ficticios de prueba: conserva `/login`, muestra aviso de integración pendiente y vacía el campo de contraseña. No hay endpoint de autenticación ni creación de sesiones.
- Recuperación: muestra un aviso explícito, sin simular envío de correo.
- Enlace al ERP: abre el dashboard existente; el logo transparente carga en la cabecera.
- Logo nuevo: comparación de píxeles decodificados RGBA idéntica al PNG del usuario; 510 × 489 px y canal alfa conservado.
- Contraste calculado: texto secundario/fondo de marca 5.60:1, placeholder/blanco 4.88:1, texto de botón/fondo azul 5.77:1 y error/blanco 6.42:1.
- `git diff --exit-code`: ningún archivo original modificado. Backend, dependencias, lockfile y entornos originales permanecen intactos.

Capturas de revisión: `apps/frontend/.impeccable/review/desktop.jpg`, `tablet.jpg`, `mobile.jpg`, `mobile-small.jpg` y `erp.jpg`.
