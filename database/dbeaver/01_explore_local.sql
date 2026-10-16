-- COMECORE · Desarrollo local · Consultas de solo lectura
-- Conexión: COMECORE · Desarrollo / comecore_designer (PostgreSQL PgPass).
-- Diagramas: expande comecore > Schemas > iam/crm/audit; abre cada esquema
-- y selecciona la pestaña ER Diagram/Diagrama. Las FK ya están creadas.
-- Los cuatro diagramas completos también están en Obsidian > ComeCore.

SELECT current_database() AS base, current_user AS cuenta,
       inet_server_addr() AS servidor, inet_server_port() AS puerto,
       current_setting('server_version') AS version;

SELECT table_schema AS esquema, table_name AS tabla
FROM information_schema.tables
WHERE table_schema IN ('iam', 'crm', 'audit', 'app_private')
  AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

SELECT n.nspname AS esquema, c.relname AS tabla,
       pg_get_userbyid(c.relowner) AS propietario,
       c.relrowsecurity AS rls, c.relforcerowsecurity AS rls_forzada
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('iam', 'crm', 'audit') AND c.relkind = 'r'
ORDER BY 1, 2;

SELECT conrelid::regclass AS origen, confrelid::regclass AS destino,
       pg_get_constraintdef(oid) AS relacion
FROM pg_constraint
WHERE contype = 'f' AND connamespace IN (
  SELECT oid FROM pg_namespace WHERE nspname IN ('iam', 'crm', 'audit')
) ORDER BY 1, 2;

SELECT version, checksum, applied_at FROM app_private.schema_migrations ORDER BY version;

-- Es normal ver cero datos: aún no hay operadores/clientes persistidos ni login conectado.
-- No establezcas app.user_id desde datos enviados directamente por el navegador.
