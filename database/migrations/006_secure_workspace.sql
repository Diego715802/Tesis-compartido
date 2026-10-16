-- Transitional, encrypted persistence for the existing customer/contract UI.
-- No browser credential, password, token or customer data belongs in localStorage.
-- Apply with the migration administrator, after 005. The application cannot own it.
BEGIN;

CREATE SCHEMA erp AUTHORIZATION comecore_owner;
REVOKE ALL ON SCHEMA erp FROM PUBLIC;
GRANT USAGE ON SCHEMA erp TO comecore_app, comecore_readonly;

CREATE TABLE erp.customer_workspaces (
  organization_id uuid PRIMARY KEY REFERENCES iam.organizations(id),
  payload_ciphertext text NOT NULL CHECK (octet_length(payload_ciphertext) <= 4200000),
  version integer NOT NULL CHECK (version >= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE erp.customer_workspaces OWNER TO comecore_owner;
REVOKE ALL ON TABLE erp.customer_workspaces FROM PUBLIC;
GRANT SELECT ON erp.customer_workspaces TO comecore_app, comecore_readonly;
GRANT INSERT (organization_id, payload_ciphertext, version) ON erp.customer_workspaces TO comecore_app;
GRANT UPDATE (payload_ciphertext, version) ON erp.customer_workspaces TO comecore_app;

CREATE TRIGGER customer_workspaces_updated_at
  BEFORE UPDATE ON erp.customer_workspaces FOR EACH ROW
  EXECUTE FUNCTION app_private.set_updated_at();

ALTER TABLE erp.customer_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.customer_workspaces FORCE ROW LEVEL SECURITY;
CREATE POLICY customer_workspaces_read ON erp.customer_workspaces
  FOR SELECT TO comecore_app, comecore_readonly
  USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY customer_workspaces_insert ON erp.customer_workspaces
  FOR INSERT TO comecore_app
  WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support']));
CREATE POLICY customer_workspaces_update ON erp.customer_workspaces
  FOR UPDATE TO comecore_app
  USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support']))
  WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support']));

COMMENT ON TABLE erp.customer_workspaces IS 'Adaptador transitorio cifrado y versionado: clientes/contratos UI; no sustituye el modelo CRM relacional';
COMMENT ON COLUMN erp.customer_workspaces.payload_ciphertext IS 'Better Auth symmetricEncrypt con clave dedicada externa; incluye contexto de organización y versión autenticado';

COMMIT;
