# ComeCore: conservación del ERP y registro técnico

Estas convenciones complementan las instrucciones del usuario. Antes de implementar,
revisar la arquitectura existente y las instrucciones específicas de cada subcarpeta.

- Conservar las funcionalidades y la estructura del ERP. No mover archivos originales.
  Preferir módulos y migraciones adicionales; si un cambio requiere editar un archivo
  existente, respetar el alcance autorizado por el usuario.
- El login usa Better Auth y PostgreSQL, con guardas servidor y pruebas locales de
  sesiones, MFA y permisos. Conservar esas protecciones; la aceptación pública de
  TLS, SMTP, proxy y recuperación operativa es un requisito separado.
- PostgreSQL es el motor de datos; DBeaver es su cliente administrativo. Nunca dar al
  navegador credenciales de base de datos. El backend utiliza `comecore_runtime`, sin
  propiedad de tablas, superusuario ni BYPASSRLS.
- Las migraciones aplicadas son inmutables. Agregar otra migración, registrar su
  checksum y comprobar permisos/RLS con SQL real. No aplicar el adaptador Supabase a
  esta base local sin una migración y un despliegue específicos. No cargar semillas de
  ejemplo como usuarios reales.
- Nunca conceder `comecore_policy` ni `comecore_audit_writer` a una cuenta LOGIN.
  Son propietarios internos NOLOGIN de funciones con permisos restringidos.
- Por cada cambio terminado, actualizar una entrada fechada en
  `docs/obsidian/ComeCore/Bitacora` usando la plantilla incluida. Registrar qué cambió,
  archivos, decisiones, comprobaciones reales y pendientes. No incluir contraseñas,
  tokens, cadenas de conexión con secretos ni datos personales de clientes.
- Cuando cambie un modelo, actualizar los diagramas y diccionarios de datos de
  `docs/obsidian/ComeCore` y los diagramas DBeaver cuando existan.
- Ejecutar `node scripts/sync-obsidian.cjs` para copiar la documentación a la bóveda
  configurada. Si se detectan ediciones del usuario en Obsidian, conciliarlas y
  conservarlas; no forzar la sobrescritura. Esta sincronización es explícita, no un
  servicio que capture cambios externos automáticamente.
- Distinguir desarrollo local, integración de autenticación y producción. TLS,
  gestión de secretos, backups/restauración, sesiones, MFA y límites de acceso deben
  comprobarse en el entorno de publicación antes de declararlo listo.
