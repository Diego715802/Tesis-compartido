# Base local ComeCore

> Estado actualizado el 14 de octubre de 2026: el modelo tiene 67 tablas, 217 FK y autenticación real. Las cifras iniciales siguientes son históricas. Consultar `docs/obsidian/ComeCore/11-Modelo-ERP-Completo.md` y `12-Seguridad-y-Verificacion.md` para alcance actual, roles y pruebas. Para nuevas migraciones usar `scripts/apply-database-migration.cjs`; la restauración ahora verifica todas las tablas de aplicación.

PostgreSQL **18.6**, distribuido por Postgres.app, ejecuta la base `comecore` en esta
Mac. DBeaver tiene la conexión **COMECORE · Desarrollo**, usando `comecore_designer`
y autenticación **PostgreSQL PgPass**. Host `127.0.0.1`, puerto `5432`.

La base conserva las definiciones originales de `001_customer_domain.sql` y agrega
`003_local_security.sql` y `004_function_defaults.sql`. No se aplica el adaptador
Supabase `002` ni la semilla ficticia. Hay 12 tablas de dominio y una tabla técnica
para registrar migraciones y checksums.

## Operación

Con Node.js disponible:

```sh
node scripts/local-postgres.cjs status
node scripts/local-postgres.cjs start
node scripts/local-postgres.cjs stop
node scripts/test-local-database.cjs
node scripts/backup-local-database.cjs --verify
node scripts/sync-obsidian.cjs
```

En esta Mac también se puede usar el ejecutable ya disponible en
`/Users/dieguin/Downloads/ERP TESIS/abr/work/node-v22.23.3-darwin-x64/bin/node`.
`setup` crea la instalación inicial y aplica únicamente migraciones pendientes;
no borra datos, no modifica migraciones aplicadas y rechaza checksums diferentes.
No se instaló un servicio de inicio automático. Tras reiniciar la Mac, usar `start`.

Datos y registros del servidor: `~/Library/Application Support/ComeCore/PostgreSQL18`.
Los respaldos privados están dentro de `backups`; la comprobación restaura sobre
una base temporal nueva y luego la elimina. Un respaldo local en el mismo disco no
sustituye una copia externa ni un plan de recuperación de producción.

## Cuentas y límites

- `comecore_runtime`: futura cuenta del backend; hereda `comecore_app`, sin DDL,
  superusuario, BYPASSRLS, escritura IAM, escritura directa de auditoría ni DELETE CRM.
- `comecore_designer`: DBeaver para diseño local; hereda propietario y lectura.
  Es una cuenta administrativa con capacidad de cambiar esquemas y políticas. No
  utilizarla desde el backend. FORCE RLS no impide al propietario cambiar las políticas.
- `comecore_owner`: propietario NOLOGIN de los objetos de dominio.
- `comecore_policy` y `comecore_audit_writer`: propietarios internos NOLOGIN de
  funciones SECURITY DEFINER; tienen BYPASSRLS y permisos limitados. No se conceden
  a las cuentas de conexión.
- El administrador local usa identidad macOS por socket privado, sin contraseña TCP.

Las credenciales de desarrollo se guardan fuera de Git con permisos `0600`:
`.pgpass`, el archivo privado local `credentials.json` y `database/.env`. Son archivos
con secretos: no copiarlos a Obsidian ni compartirlos. El backend aún no carga esta
configuración y el navegador nunca debe recibirla.

La red se limita a loopback y las cuentas TCP usan SCRAM-SHA-256. TLS está desactivado
**solo en este desarrollo local**. Antes de publicar: servidor privado o servicio
administrado, TLS verificable, gestor de secretos, respaldos externos/restauración,
monitorización, migraciones del entorno y autenticación real con validación de
sesiones antes de establecer el contexto RLS en cada transacción.

## Diagramas y registro

Los diagramas y diccionarios están en `docs/obsidian/ComeCore` y se sincronizan con
la sección `ComeCore` de la bóveda existente. `AGENTS.md` establece el registro por
cada tarea. El sincronizador conserva notas editadas directamente en Obsidian y
detiene la copia si hay conflictos; no elimina archivos.

En DBeaver, abrir el esquema `iam`, `crm` o `audit` y seleccionar **ER Diagram**.
Las relaciones están implementadas como claves foráneas reales. El archivo
`database/dbeaver/01_explore_local.sql` está abierto en el editor SQL de la conexión.

Fuentes: [PostgreSQL RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html),
[SCRAM](https://www.postgresql.org/docs/18/auth-password.html),
[DBeaver PgPass](https://dbeaver.com/docs/dbeaver/Authentication-PostgreSQL-Pgpass/).
