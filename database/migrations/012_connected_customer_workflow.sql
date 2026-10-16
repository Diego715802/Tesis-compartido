-- Connect existing UI keys to normalized rows; no demo data and no deleted history.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER TABLE crm.customers ADD COLUMN workspace_key varchar(100);
ALTER TABLE service.contracts ADD COLUMN workspace_key varchar(100);
ALTER TABLE crm.customers ADD CONSTRAINT customers_workspace_key_unique UNIQUE (organization_id, workspace_key);
ALTER TABLE service.contracts ADD CONSTRAINT contracts_workspace_key_unique UNIQUE (organization_id, workspace_key);
ALTER TABLE crm.customers ADD CONSTRAINT customers_workspace_key_check CHECK (workspace_key IS NULL OR workspace_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$');
ALTER TABLE service.contracts ADD CONSTRAINT contracts_workspace_key_check CHECK (workspace_key IS NULL OR workspace_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$');
GRANT INSERT (workspace_key) ON crm.customers TO comecore_app;

-- An administrative contract can exist before network provisioning. Assigned
-- resources still require the existing composite organization/resource FKs.
ALTER TABLE service.contracts ALTER COLUMN server_id DROP NOT NULL;
ALTER TABLE service.contracts ALTER COLUMN node_id DROP NOT NULL;
COMMENT ON COLUMN service.contracts.server_id IS 'Servidor registrado de la organización; NULL hasta asignación real. No implica aprovisionamiento.';
COMMENT ON COLUMN service.contracts.node_id IS 'Nodo registrado de la organización; NULL hasta asignación real.';
COMMENT ON COLUMN crm.customers.workspace_key IS 'Identificador estable de la UI existente; UUID interno se conserva como PK.';
COMMENT ON COLUMN service.contracts.workspace_key IS 'Identificador estable de la UI; customer_id y plan_id son FK reales por organización.';

-- Prevent ambiguous label resolution; actual plan IDs are used by new forms.
CREATE UNIQUE INDEX service_plans_name_folded_unique ON catalog.service_plans (organization_id, lower(btrim(name)));

CREATE FUNCTION app_private.guard_workspace_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $fn$
BEGIN
  IF NEW.workspace_key IS DISTINCT FROM OLD.workspace_key THEN
    RAISE EXCEPTION 'Identificador de origen inmutable' USING ERRCODE='42501';
  END IF;
  IF TG_TABLE_SCHEMA='service' AND (pg_catalog.to_jsonb(NEW)->>'customer_id') IS DISTINCT FROM (pg_catalog.to_jsonb(OLD)->>'customer_id') THEN
    RAISE EXCEPTION 'Cliente del contrato inmutable' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $fn$;
ALTER FUNCTION app_private.guard_workspace_identity() OWNER TO comecore_owner;
REVOKE ALL ON FUNCTION app_private.guard_workspace_identity() FROM PUBLIC;
CREATE TRIGGER customers_workspace_identity BEFORE UPDATE ON crm.customers FOR EACH ROW EXECUTE FUNCTION app_private.guard_workspace_identity();
CREATE TRIGGER contracts_workspace_identity BEFORE UPDATE ON service.contracts FOR EACH ROW EXECUTE FUNCTION app_private.guard_workspace_identity();
COMMIT;
