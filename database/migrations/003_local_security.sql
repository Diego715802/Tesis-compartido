-- Complemento de 001 para PostgreSQL local. No aplicar el adaptador Supabase 002.
-- Requiere el administrador local: crea dos propietarios internos de funciones.
BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_policy') THEN
    CREATE ROLE comecore_policy NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_audit_writer') THEN
    CREATE ROLE comecore_audit_writer NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS;
  END IF;
END
$roles$;

ALTER ROLE comecore_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE comecore_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE comecore_readonly NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

-- La cuenta del backend nunca recibe propiedad de objetos ni estos dos roles.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE comecore FROM PUBLIC;
GRANT CONNECT ON DATABASE comecore TO comecore_app, comecore_readonly, comecore_owner;

ALTER SCHEMA iam OWNER TO comecore_owner;
ALTER SCHEMA crm OWNER TO comecore_owner;
ALTER SCHEMA audit OWNER TO comecore_owner;
ALTER SCHEMA app_private OWNER TO comecore_owner;

DO $owners$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT n.nspname, c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('iam', 'crm', 'audit', 'app_private') AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I OWNER TO comecore_owner', item.nspname, item.relname);
  END LOOP;
  -- Las secuencias de identidad cambian de propietario con su tabla.
END
$owners$;

ALTER FUNCTION app_private.current_user_id() OWNER TO comecore_owner;
ALTER FUNCTION app_private.current_organization_id() OWNER TO comecore_owner;
ALTER FUNCTION app_private.set_updated_at() OWNER TO comecore_owner;
ALTER FUNCTION app_private.update_customer_version() OWNER TO comecore_owner;

-- Evita recursión en las políticas IAM con un definer sin LOGIN y de solo lectura.
GRANT USAGE ON SCHEMA iam, app_private TO comecore_policy;
GRANT SELECT ON iam.organizations, iam.app_users, iam.organization_memberships TO comecore_policy;
GRANT EXECUTE ON FUNCTION app_private.current_user_id(), app_private.current_organization_id() TO comecore_policy;
ALTER FUNCTION app_private.has_org_role(uuid, text[]) OWNER TO comecore_policy;

-- El escritor de auditoría solo inserta eventos; no tiene lectura ni UPDATE/DELETE.
GRANT USAGE ON SCHEMA audit, app_private TO comecore_audit_writer;
GRANT INSERT ON audit.customer_events TO comecore_audit_writer;
GRANT USAGE ON SEQUENCE audit.customer_events_id_seq TO comecore_audit_writer;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO comecore_audit_writer;
ALTER FUNCTION app_private.audit_customer_change() OWNER TO comecore_audit_writer;
ALTER TABLE audit.customer_events FORCE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA app_private TO comecore_readonly;
REVOKE ALL ON FUNCTION app_private.has_org_role(uuid, text[]), app_private.audit_customer_change() FROM PUBLIC;
REVOKE USAGE, SELECT ON SEQUENCE audit.customer_events_id_seq FROM comecore_app;

-- Metadatos de autoría no editables desde operaciones ordinarias del backend.
REVOKE INSERT, UPDATE ON crm.customers FROM comecore_app;
GRANT INSERT (
  organization_id, custom_id_suffix, person_type, display_name, first_name,
  middle_name, first_last_name, second_last_name, document_id, status,
  portal_access_enabled, notes
) ON crm.customers TO comecore_app;
GRANT UPDATE (
  custom_id_suffix, person_type, display_name, first_name, middle_name,
  first_last_name, second_last_name, document_id, status, portal_access_enabled,
  notes, deleted_at
) ON crm.customers TO comecore_app;
ALTER TABLE crm.customers ALTER COLUMN created_by SET DEFAULT app_private.current_user_id();
ALTER TABLE crm.customers ALTER COLUMN updated_by SET DEFAULT app_private.current_user_id();

-- FK de operadores y auditoría: los índices por organización no cubren estas búsquedas.
CREATE INDEX customers_created_by_idx ON crm.customers (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX customers_updated_by_idx ON crm.customers (updated_by) WHERE updated_by IS NOT NULL;
CREATE INDEX customer_events_customer_fk_idx ON audit.customer_events (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX customer_events_actor_fk_idx ON audit.customer_events (actor_user_id) WHERE actor_user_id IS NOT NULL;
CREATE INDEX organization_memberships_user_fk_idx ON iam.organization_memberships (user_id);

ALTER DEFAULT PRIVILEGES FOR ROLE comecore_owner IN SCHEMA iam, crm, audit, app_private
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
-- Sin concesiones automáticas sobre futuras tablas: cada migración debe definir permisos y RLS.
COMMENT ON ROLE comecore_policy IS 'NOLOGIN: únicamente lectura IAM para evaluar has_org_role; nunca conceder a cuentas LOGIN';
COMMENT ON ROLE comecore_audit_writer IS 'NOLOGIN: únicamente escritura de eventos desde el trigger; nunca conceder a cuentas LOGIN';
COMMENT ON TABLE app_private.schema_migrations IS 'Control técnico de migraciones y SHA-256; no contiene usuarios ni secretos';

COMMIT;
