-- Ejecutar una sola vez desde DBeaver conectado a la base administrativa `postgres`.
-- Requiere una cuenta administradora. No guardes contraseñas en este archivo.
-- IMPORTANTE: CREATE DATABASE no puede ejecutarse dentro de una transacción.

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_owner') THEN
    CREATE ROLE comecore_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_app') THEN
    CREATE ROLE comecore_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_readonly') THEN
    CREATE ROLE comecore_readonly NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
END
$roles$;

-- Si `comecore` ya existe, omite únicamente la siguiente sentencia.
CREATE DATABASE comecore
  WITH OWNER = comecore_owner
       ENCODING = 'UTF8'
       TEMPLATE = template0;

COMMENT ON DATABASE comecore IS 'COMECORE ERP - datos operativos aislados por organización';

-- El usuario LOGIN del backend debe crearse fuera del repositorio y recibir una
-- contraseña generada por un gestor de secretos. Después asígnale el rol:
--   GRANT comecore_app TO <usuario_runtime>;
-- Nunca uses comecore_owner ni una cuenta superusuario desde la aplicación.
