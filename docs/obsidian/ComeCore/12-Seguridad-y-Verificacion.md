---
proyecto: ComeCore
tipo: seguridad-y-pruebas
fecha: 2026-10-14
estado: verificacion-local
---

# Seguridad implementada y evidencia

La implementación reduce riesgos comprobables del ERP local. No constituye una certificación ASVS, una auditoría independiente ni una aceptación de producción. Se contrastaron los controles aplicables con [OWASP ASVS 5.0.0](https://owasp.org/projects/asvs), la [guía de seguridad de BD de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) y la [documentación oficial de RLS PostgreSQL 18](https://www.postgresql.org/docs/18/ddl-rowsecurity.html).

## Controles efectivos

- **Autenticación:** Better Auth 1.7.7; Argon2id con 64 MiB, 3 iteraciones, paralelismo 1 y salida de 32 bytes. Claves nuevas de 15 a 128 caracteres. HIBP mantenido comprueba filtraciones; no se envía la contraseña al proveedor. Registro público y endpoints no autorizados deshabilitados. Respuestas iguales para cuenta inexistente y clave incorrecta.
- **MFA:** TOTP obligatorio para todos los operadores, incluidos administradores. Inscripción con contraseña; códigos de respaldo de un uso; desafío de 5 minutos; antirrepetición de TOTP; no se permite recordar dispositivo ni desactivar MFA por endpoint público. Reautenticación con contraseña y TOTP para cambios sensibles y consulta/regeneración de códigos. Cambio de correo no expuesto.
- **Sesiones:** cookies HttpOnly, SameSite Strict, Path `/`, sin Domain; Secure en configuración pública. Sesión de una hora sin cookie cache; sesión nueva al autenticar; revocación al cerrar todas las sesiones, cambiar contraseña o recuperar cuenta. Tokens de sesión fuera del JSON, URL y localStorage. Los enlaces de recuperación contienen un token de recuperación temporal, no el identificador de sesión.
- **Recuperación:** enlaces impredecibles de Better Auth, identificador hash, expiración de 15 minutos y uso único; respuesta genérica. Corrección verificada: HIBP valida antes de consumir el token, de modo que una contraseña rechazada no inutiliza el enlace. Sin SMTP se responde servicio no disponible: no se simula correo enviado.
- **Límites:** contadores PostgreSQL atómicos; login 8 solicitudes por cuenta/origen y minuto; recuperación 3; límite general de origen 80; factores 12 por desafío/origen; reautenticación 5. Better Auth agrega límites propios y bloqueo temporal del factor tras 10 fallos durante 5 minutos. No se bloquea globalmente una cuenta por fallos de contraseña desde otro origen. Requiere evaluar ataques distribuidos y tráfico real en el ingreso público.
- **CSRF, entradas y rutas:** origen exacto y rechazo cross-site en mutaciones; allowlist de endpoints y cuerpos Zod estrictos; consultas parametrizadas; redirecciones restringidas. El frontend y backend comprueban sesión/MFA/permisos, independientemente de los enlaces visibles. El gateway interno solo admite el frontend autorizado.
- **Base de datos:** runtime y auth separados, sin superusuario/BYPASSRLS/CREATE ROLE/CREATE DB ni membresía en propietarios internos. Se valida al arrancar y se rechaza una conexión incompatible. Contexto organización/actor por transacción; RLS forzado; FK compuestas; estampado de actor, versiones, auditoría de nombres de campos. Usuario navegador sin conexión directa a PostgreSQL.
- **Red:** backend/BD escuchan loopback local; MikroTik exige pin SHA-256 SSH válido y organización propietaria; se niega una organización distinta antes del servicio. No se ejecutó una conexión a hardware real como parte de esta prueba.
- **Archivos/CMS:** propósito y cuarentena, tamaño/MIME/SHA y claves de almacenamiento restringidas en SQL; revisiones/publicaciones anexables. Esto no implementa almacenamiento ni escaneo de archivos por sí solo.
- **Auditoría:** eventos de acceso, MFA, recuperación y cambios; huellas HMAC del origen y nombres de campos de negocio. Sin contraseñas, tokens ni valores de negocio en esos eventos. Debe definirse retención, alertas y extracción de auditoría fuera del servidor.

La protección de XSS incluye el escape de React y cabeceras del frontend; no se afirma haber hecho un pentest exhaustivo de todas las superficies ni de proveedores externos.

## Contraste ASVS por área

| Área aplicable de ASVS 5 | Implementación/evidencia | Límite de la verificación |
|---|---|---|
| V6 Autenticación | Argon2id, HIBP, MFA, recuperación, antienumeración y límites; 33 controles de integración | No análisis estadístico de tiempos ni prueba de abuso distribuido; recuperación administrativa completa pendiente |
| V7 Sesiones | Expiración, revocación y reautenticación; cookies locales verificadas | Cookies Secure y comportamiento del proxy/HTTPS requieren entorno público real |
| V8 Autorización | Guardas, membresía activa, RLS y pruebas de otra organización/rol | Faltan APIs normalizadas; deberán heredar y probar la autorización por recurso/campo |
| Validación y prevención de inyección | Zod estricto, SQL parametrizado y límites/FK/CHECK | Importación masiva, proveedores y nuevos endpoints pendientes de pruebas específicas |
| Manejo de archivos y protección de datos | Metadatos privados/cuarentena y snapshot cifrado | Upload, antivirus, KMS, backups externos y retención aún requieren infraestructura |
| Configuración, comunicaciones y auditoría | Rechazo de configuración insegura; TLS verify-full público, logs sin secretos y pin SSH | Sin TLS/SMTP externos ni monitoreo de producción verificados |

Referencias oficiales de [autenticación V6](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md), [sesiones V7](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md) y [autorización V8](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md). La tabla agrupa áreas, no marca como aprobados todos sus requisitos.

## Pruebas ejecutadas

Reejecutadas el 14 de octubre de 2026 contra PostgreSQL local y builds actuales:

| Prueba | Resultado real |
|---|---|
| Build NestJS y Next.js/TypeScript | Aprobado |
| `npm test --workspace apps/backend` | 8 archivos, 67 pruebas aprobadas |
| `node scripts/test-auth-security.mjs` | 33 controles positivos y negativos aprobados; Better Auth/PostgreSQL reales y correo capturado en memoria |
| `node scripts/test-erp-database.cjs` | Checks 007 y 008, incluyendo límites añadidos por 009–011, aprobados; ROLLBACK |
| `node scripts/test-http-boundaries.mjs` | 18 comprobaciones reales del ingreso HTTP: rutas protegidas, APIs, CSRF, cabeceras y backend directo |
| `node scripts/test-network-boundary.mjs` | Organización propietaria 200; organización distinta 403 antes de ejecutar el servicio; fixture propia retirada |
| `node scripts/test-contracts.cjs` | 245 aserciones de regresión aprobadas |
| `node --experimental-strip-types --test apps/frontend/tests/customer-date.test.mjs` | 2 pruebas aprobadas; fecha ISO persistida e inválida no derriban clientes |

Las pruebas de autenticación cubren credenciales válidas/erróneas, cuenta inexistente, CSRF, registro y redirección externos, inscripción/MFA pendiente/código repetido/respaldo único, viewer, otra organización, versión obsoleta, HIBP, token reutilizado/vencido, sesión expirada/revocada y cierre de sesión. También pasaron las pruebas BFF de autenticación y los 10 escenarios CMC sobre las rutas reales con upstream de prueba. La telemetría usa una respuesta de prueba para comprobar la guarda, no un router simulado presentado como real.

El recorrido de pantallas está separado en [[13-Cobertura-de-Acciones]]. Pruebas estructurales o SQL no equivalen a haber pulsado todos los controles, ni a verificar infraestructura pública.

Resultados estructurados: `docs/database-model/verification.json`. Restauración final de todas las tablas aprobada; la bitácora registra el archivo privado y el alcance exacto.

## Antes de publicar

1. Conectar cada módulo demo a endpoints normalizados con operaciones transaccionales, validación de permisos por recurso y pruebas de concurrencia/IDOR. Resolver saldo, existencias y totales con reglas de negocio consistentes.
2. Configurar dominio HTTPS y `AUTH_DEPLOYMENT=public`, `AUTH_PUBLIC_ORIGIN` exacto, proxy que elimine cabeceras IP aportadas por clientes, `AUTH_TRUST_PROXY_HEADER=x-real-ip` y backend privado. Verificar cookies Secure, CSP, HSTS, CSRF, CORS y límites con el ingreso real.
3. PostgreSQL privado con TLS `sslmode=verify-full`, CA confiable, firewall y cuentas separadas; secretos nuevos de alta entropía en gestor de secretos, sin el usuario de DBeaver ni una cuenta propietaria para la aplicación. Cifrar y custodiar claves fuera de la BD.
4. SMTP real (`SMTP_HOST`, puerto, usuario, contraseña, remitente) con TLS; probar entrega y recuperación real. Documentar alta/verificación de operadores y procedimiento seguro de pérdida de MFA. No usar `admin` como contraseña pública.
5. Almacenamiento privado, escaneo/validación de archivos, descarga autorizada; proveedores fiscales/pagos con idempotencia y conciliación; credenciales de routers en gestor de secretos y huella verificada fuera de banda.
6. Respaldos cifrados fuera de la Mac, periodicidad/RPO/RTO, roles globales y restauración en otro host. La restauración local no demuestra recuperación ante pérdida del equipo.
7. Revisar actualizaciones y dependencias en CI. La auditoría repetida el 14 de octubre dio 0 vulnerabilidades en dependencias de producción y 5 avisos altos en herramientas de desarrollo de ESLint/Next (cadena braces). No se aplicó un downgrade incompatible como supuesto arreglo. Volver a evaluar antes del despliegue.
8. Monitoreo, alertas, retención/purga de contadores y auditoría, pruebas de carga y revisión independiente según el riesgo del ERP.

La configuración pública falla al arrancar sin HTTPS, SMTP, proxy explícito o TLS de PostgreSQL. Eso previene una publicación accidental con valores locales, pero no prueba que esos servicios estén bien operados.
