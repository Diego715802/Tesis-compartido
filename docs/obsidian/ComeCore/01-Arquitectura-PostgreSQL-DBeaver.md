---
proyecto: ComeCore
tipo: arquitectura
fecha_base: 2026-10-09
fuentes:
  - database/migrations/001_customer_domain.sql
  - database/migrations/003_local_security.sql
  - database/migrations/004_function_defaults.sql
  - scripts/local-postgres.cjs
  - scripts/backup-local-database.cjs
  - database/LOCAL_SETUP.md
---

# Arquitectura PostgreSQL y administración con DBeaver

PostgreSQL es el motor de persistencia elegido para el ERP y ya está preparado para desarrollo local. DBeaver es una aplicación cliente para conectarse al servidor, ejecutar SQL y revisar objetos: no es el motor y su uso no garantiza seguridad, disponibilidad ni respaldo. Estos controles dependen de la configuración de PostgreSQL, del entorno y de la aplicación.

La tarea principal verificó PostgreSQL 18.6 de Postgres.app instalado en `/Applications`, en ejecución y escuchando únicamente en `127.0.0.1:5432`, con comprobación de `lsof`. La base local `comecore` fue creada mediante `database/dbeaver/00_create_database.sql` y recibió `001_customer_domain.sql`, `003_local_security.sql` y `004_function_defaults.sql`. No se aplicó la semilla. DBeaver ya está conectado y las pruebas SQL de autorización local fueron satisfactorias. La autenticación web e integración del backend siguen pendientes.

## Componentes existentes y responsabilidad

| Componente | Responsabilidad y estado |
| --- | --- |
| `apps/frontend` | Interfaz Next.js del ERP; `/login` es una vista previa. |
| `apps/backend` | Lugar previsto para conectar operaciones del ERP al servidor de datos; integración y pruebas pendientes. |
| PostgreSQL | Motor local instalado; base `comecore` y esquema aplicados. La integración de operaciones del ERP permanece pendiente. |
| DBeaver | Cliente administrativo conectado con cuenta separada `comecore_designer`. |
| `database/migrations/001_customer_domain.sql` | Define el modelo inicial, roles grupales, políticas RLS, funciones y disparadores. |
| `database/migrations/003_local_security.sql` | Endurece propietarios, roles internos, auditoría y metadatos de autoría; aplicada en la base local. |
| `database/migrations/004_function_defaults.sql` | Revoca globalmente la ejecución pública predeterminada de funciones futuras creadas por los tres propietarios internos; aplicada en la base local. |
| `scripts/local-postgres.cjs` | Administra `setup`, `start`, `stop` y `status` del servidor local y el historial de migraciones. Usa por ahora Node 22 disponible en esta Mac. |
| `scripts/backup-local-database.cjs` | Crea un dump privado y permite verificar restauración en una base temporal nueva mediante `--verify`. |
| `database/LOCAL_SETUP.md` | Operación de la instalación local, comandos disponibles y límites de las cuentas. |
| `database/README.md` | Instrucciones del esquema y requisitos de conexión; no es evidencia de ejecución. |
| Obsidian | Documentación de arquitectura, diagramas y decisiones técnicas; no almacena datos operativos ni secretos. |

## Acceso al ERP: estado actual

`apps/frontend/src/app/login/page.tsx` muestra `AccessScreen`. El formulario valida visualmente correo y presencia de contraseña; el manejador `submitPreview` cancela el envío, limpia la contraseña y muestra que la autenticación no está conectada. La recuperación de contraseña solo informa de su estado pendiente. El enlace «Abrir ERP actual» permite visitar el ERP sin crear una sesión.

La autenticación se integrará después con una solución mantenida. `iam.app_users` representa operadores internos y contiene perfil, estado y un `external_auth_id` opcional. No hay contraseñas, hashes de contraseña, sesiones, cookies, factores de autenticación ni códigos de recuperación en estas tablas. `external_auth_id` es único cuando tiene valor, pero la migración inicial no define una clave foránea hacia una tabla de autenticación. `last_login_at` es un campo de fecha; su existencia no implementa inicio de sesión.

Los LOGIN de PostgreSQL para DBeaver y para el backend son cuentas del servidor de datos. Son distintos de los usuarios del ERP representados en `iam.app_users` y no sustituyen la autenticación de la aplicación.

## Modelo inicial para crecer

La migración inicial separa `iam` (identidad y pertenencia), `crm` (clientes) y `audit` (eventos). Son 12 tablas de dominio. La preparación local agregó `app_private.schema_migrations`, una tabla técnica de tres columnas para registrar archivos aplicados y sus sumas SHA-256; no es un dominio del ERP ni una tabla de usuarios. Ver [[07-Control-Tecnico-Migraciones]]. Los UUID identifican organizaciones, operadores y clientes. Cada cliente pertenece a una organización y las siete tablas dependientes comprueban esa pertenencia mediante una clave foránea compuesta `(organization_id, customer_id)` hacia `(organization_id, id)` de `crm.customers`.

El identificador visible se genera como `CC` concatenado con `custom_id_suffix`. La unicidad del sufijo se limita a la organización. Los clientes se archivan con `deleted_at`; el rol de aplicación no recibe `DELETE`. `version` aumenta al actualizar un cliente y puede servir para incorporar posteriormente control de concurrencia en las operaciones de la aplicación.

Los índices cubren rutas de acceso previstas para listados, búsquedas, relaciones y auditoría. Su existencia no demuestra rendimiento a escala. Al implementar consultas reales deberán revisarse planes, volumen, latencia y transacciones. El particionado, réplicas y ajustes de capacidad se decidirán con mediciones, sin inventar tablas de dominios futuros.

## Autorización definida en SQL

La preparación local separó las cuentas LOGIN del backend y de DBeaver. Ambas son `NOSUPERUSER` y `NOBYPASSRLS`; el navegador no debe recibir sus credenciales. Los roles internos de funciones no se concedieron a ninguna cuenta LOGIN.

| Rol PostgreSQL | Capacidad y finalidad |
| --- | --- |
| `comecore_runtime` | LOGIN de ejecución del futuro backend; miembro de `comecore_app`, sin propiedad de objetos. |
| `comecore_designer` | LOGIN de diseño y administración en DBeaver; miembro de `comecore_owner` y `comecore_readonly`. No tiene bypass de RLS, pero dispone de capacidad administrativa de DDL mediante propiedad, incluida la posibilidad de cambiar o desactivar políticas. Debe tratarse como cuenta administrativa. |
| `comecore_owner` | `NOLOGIN`, `NOSUPERUSER`, `NOBYPASSRLS`; propietario de esquemas, tablas y funciones ordinarias. |
| `comecore_app` | Rol grupal `NOLOGIN`, sin bypass; permisos de aplicación sometidos a RLS. |
| `comecore_readonly` | Rol grupal `NOLOGIN`, sin bypass; permisos de lectura sometidos a RLS. |
| `comecore_policy` | `NOLOGIN`, `NOSUPERUSER`, `BYPASSRLS`; propietario de `has_org_role`. Tiene lectura de las tres tablas IAM y ejecución de los helpers de contexto para evitar recursión de políticas. No tiene permisos de escritura de IAM. |
| `comecore_audit_writer` | `NOLOGIN`, `NOSUPERUSER`, `BYPASSRLS`; propietario del disparador de auditoría. Tiene `INSERT` en eventos y `USAGE` de su secuencia, sin `SELECT`, `UPDATE` o `DELETE` sobre los eventos. |

`BYPASSRLS` es un atributo general del rol, no un bypass limitado por esquema. El alcance de estos dos roles internos se reduce mediante sus concesiones explícitas; `NOLOGIN` y su ausencia de membresías en cuentas LOGIN impiden su uso ordinario como cuentas de conexión. Las pruebas SQL locales comprobaron esta separación y la tarea principal confirmó que el runtime no puede asumir `comecore_policy`.

El contexto de cada transacción de aplicación se prevé mediante `app.user_id`, `app.organization_id` y `app.request_id`, establecidos por el backend tras verificar una sesión. `app_private.has_org_role` comprueba organización, operador y membresía activos, además del rol permitido. Es una función auxiliar de autorización; no verifica contraseñas ni crea sesiones.

| Operación definida | Roles de membresía permitidos por las políticas iniciales |
| --- | --- |
| Leer CRM y eventos de auditoría de la organización | `owner`, `admin`, `billing`, `support`, `viewer` |
| Insertar o actualizar clientes, contactos, direcciones, asignaciones y dispositivos | `owner`, `admin`, `support` |
| Insertar o actualizar perfiles de facturación, cuentas y pasarelas | `owner`, `admin`, `billing` |
| Cambiar `deleted_at` de un cliente | `owner`, `admin`, comprobado por disparador |
| Leer perfil interno en `iam.app_users` | El propio operador, según `app.user_id` |
| Leer membresías | El propio operador, o `owner`/`admin` de la organización |

La migración inicial habilita RLS en las 12 tablas de dominio y lo fuerza en IAM y CRM. `003_local_security.sql` añade `FORCE ROW LEVEL SECURITY` a `audit.customer_events`, por lo que el diseño local aplicado fuerza RLS en las 12. La tabla técnica de historial queda fuera de ese conjunto de dominio y no recibe permisos de lectura o escritura para `comecore_app`.

El endurecimiento mueve la propiedad de `has_org_role` al lector interno de IAM y la de `audit_customer_change` al escritor interno de auditoría. Revoca al rol de aplicación el acceso directo a la secuencia de eventos. También sustituye los permisos generales de `INSERT` y `UPDATE` en `crm.customers` por listas de columnas permitidas: la cuenta de ejecución no puede asignar directamente `id`, `created_by`, `updated_by`, `created_at`, `updated_at` o `version`; los autores iniciales provienen de `app.user_id` mediante valores predeterminados. Las políticas por rol de membresía siguen siendo necesarias. Las pruebas SQL confirmaron permisos de columnas y creación de cliente con identidad, versión y autoría generadas por el servidor.

`003` agrega índices de las FK `created_by`, `updated_by`, `customer_events.customer_id`, `actor_user_id` y `organization_memberships.user_id`. La revocación predeterminada de funciones por esquema en `003` no elimina la concesión global predeterminada. Por eso `004_function_defaults.sql` aplica la revocación **global** de `PUBLIC EXECUTE` para funciones futuras creadas por `comecore_owner`, `comecore_policy` y `comecore_audit_writer`. La preparación de la cuenta `comecore_designer` también revoca esa concesión global para sus funciones futuras. La tarea principal confirmó las ACL predeterminadas globales sin ejecución pública para los cuatro roles. Cada futura migración debe establecer sus propios permisos y políticas.

## Configuración local y DBeaver

`scripts/local-postgres.cjs` mantiene un directorio de datos aislado para desarrollo en esta Mac. El servidor usa solo loopback IPv4, autenticación SCRAM para las dos cuentas de `comecore` y administración por socket local con identidad del usuario macOS. SSL está desactivado en esta instalación local; esa configuración no es la recomendación para una conexión remota o producción.

La conexión de DBeaver se llama `COMECORE · Desarrollo`, apunta a la base `comecore` en `127.0.0.1:5432` y usa `comecore_designer`. El archivo privado `.pgpass` permite usar PgPass sin registrar contraseñas en estas notas. La tarea principal verificó tres conexiones JDBC de DBeaver 26.2.2 en `pg_stat_activity`, correspondientes a Main, Metadata y SQL Editor. El controlador oficial PostgreSQL JDBC 42.7.13 se descargó desde DBeaver.

Las credenciales locales se guardan fuera de Git, en el archivo privado `database/.env` y en el almacén local de credenciales, con permisos `0600` verificados. `.pgpass` también tiene permisos `0600` verificados. Estas notas describen su ubicación y protección sin copiar sus valores. La tarea principal confirmó SCRAM en ambas cuentas LOGIN. La conexión TCP del runtime con PgPass fue satisfactoria y una contraseña incorrecta fue rechazada. La cadena del backend todavía requiere integración en la aplicación; su existencia no conecta por sí sola el ERP.

El arranque local es manual; no se instaló un servicio de inicio automático. Tras reiniciar la Mac debe usarse `start`. Los comandos y el ejecutable Node 22 disponible se documentan en [la guía de operación local](</Users/dieguin/Downloads/ERP TESIS/abr/outputs/Tesis-compartido/database/LOCAL_SETUP.md>). Los diagramas `.erd` nativos se describen en [[08-Diagramas-DBeaver]].

## Verificación local realizada

`database/checks/003_local_rls_checks.sql`, ejecutado mediante `scripts/test-local-database.cjs`, comprobó las 12 tablas de dominio con propietario restringido y FORCE RLS, permisos de roles y columnas, ausencia de filas sin contexto, separación de `viewer`/`support`/`billing`/`owner`/`admin`, aislamiento entre dos organizaciones y denegación de usuario bloqueado, membresía revocada y organización suspendida. También comprobó auditoría enlazada por `request_id` con nombres de campos y sin valores privados.

La prueba finalizó en `ROLLBACK` y comprobó que no permanecieran sus datos temporales, eventos ni contexto transaccional. La evidencia valida autorización SQL local. No valida sesiones web, el flujo completo del backend, rendimiento a escala ni preparación para producción.

## Respaldo y restauración local

La tarea principal ejecutó satisfactoriamente `scripts/backup-local-database.cjs --verify`. El script creó un dump de PostgreSQL con permisos `0600` dentro de `~/Library/Application Support/ComeCore/PostgreSQL18/backups` y un manifiesto privado con SHA-256. Restauró el dump en una base temporal nueva, comparó los nombres de las 13 tablas y el historial de versiones/checksums, y eliminó esa base temporal al terminar.

Esta comprobación valida la restauración local de estructura e historial, sin convertirla en una prueba de recuperación de producción o de todos los comportamientos del ERP restaurado. No hay respaldos externos ni ejecución automática programada configurados. Los archivos de respaldo y el almacén de secretos no se sincronizan con Obsidian.

## Datos y auditoría

`crm.customer_devices.push_token_ciphertext` está previsto para recibir un token cifrado por el backend; la columna no cifra automáticamente. La llave debe permanecer fuera de la base y del repositorio. `crm.customer_payment_gateways` guarda referencias de cuentas externas, sin columnas para llaves secretas de pasarelas.

Los disparadores de las ocho tablas CRM generan `audit.customer_events`. Guardan tipo de operación, origen, identificadores, nombres de campos modificados, actor, petición y fecha; no copian los valores personales anteriores o nuevos. El rol de aplicación tiene permiso de lectura de esos eventos, no de modificación directa. Ver [[04-ERD-Auditoria]].

## Controles que deben comprobarse durante la implementación

- Integración de autenticación, sesiones y protección de rutas y operaciones del ERP.
- Manejo seguro del contexto por petición en transacciones y en el pool de conexiones.
- TLS cuando corresponda al despliegue, cifrado de almacenamiento, copias de seguridad y recuperación probada.
- Ausencia de secretos en el navegador, Git, registros técnicos y Obsidian.
- Repetición de pruebas apropiadas cuando nuevas migraciones u operaciones cambien el modelo o sus permisos.

Cada comprobación debe indicar entorno, resultado y evidencia en [[Cambio-Tecnico|una entrada de bitácora]]. Una instalación local no prueba preparación ni despliegue de producción.
