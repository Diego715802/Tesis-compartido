-- 007: modelo relacional del ERP observado; no carga fixtures ni conecta handlers del navegador.
-- Requiere 001, 003 y 004. Aplicación administrativa una sola vez mediante ledger/checksum.
BEGIN;

CREATE SCHEMA catalog AUTHORIZATION comecore_owner;
CREATE SCHEMA network AUTHORIZATION comecore_owner;
CREATE SCHEMA inventory AUTHORIZATION comecore_owner;
CREATE SCHEMA service AUTHORIZATION comecore_owner;
CREATE SCHEMA billing AUTHORIZATION comecore_owner;
CREATE SCHEMA support AUTHORIZATION comecore_owner;
REVOKE ALL ON SCHEMA catalog, network, inventory, service, billing, support FROM PUBLIC;
GRANT USAGE ON SCHEMA catalog, network, inventory, service, billing, support TO comecore_app, comecore_readonly;
ALTER DEFAULT PRIVILEGES FOR ROLE comecore_owner IN SCHEMA catalog, network, inventory, service, billing, support REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE FUNCTION app_private.erp_valid_vlans(values_to_check integer[])
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = ''
AS $fn$ SELECT values_to_check IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM pg_catalog.unnest(values_to_check) AS vlan(value)
  WHERE value IS NULL OR value < 1 OR value > 4094
) $fn$;
ALTER FUNCTION app_private.erp_valid_vlans(integer[]) OWNER TO comecore_owner;
REVOKE ALL ON FUNCTION app_private.erp_valid_vlans(integer[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.erp_valid_vlans(integer[]) TO comecore_app, comecore_readonly;

CREATE FUNCTION app_private.stamp_erp_record()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $fn$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'La identidad y organización del registro son inmutables' USING ERRCODE = '22023';
    END IF;
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    NEW.version := OLD.version + 1;
  ELSE
    NEW.created_at := pg_catalog.now();
    NEW.created_by := app_private.current_user_id();
    NEW.version := 1;
  END IF;
  NEW.updated_at := pg_catalog.now();
  NEW.updated_by := app_private.current_user_id();
  RETURN NEW;
END;
$fn$;
ALTER FUNCTION app_private.stamp_erp_record() OWNER TO comecore_owner;
REVOKE ALL ON FUNCTION app_private.stamp_erp_record() FROM PUBLIC;
-- Invocada únicamente por trigger: no se permite llamar como una función ordinaria.

CREATE TABLE audit.erp_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  actor_user_id uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  source_table varchar(120) NOT NULL,
  record_id uuid NOT NULL,
  event_type varchar(8) NOT NULL CHECK (event_type IN ('INSERT','UPDATE','DELETE')),
  changed_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  request_id varchar(120),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE audit.erp_events OWNER TO comecore_owner;
CREATE INDEX erp_events_record_timeline_idx ON audit.erp_events (organization_id, source_table, record_id, occurred_at DESC);
CREATE INDEX erp_events_actor_fk_idx ON audit.erp_events (actor_user_id) WHERE actor_user_id IS NOT NULL;
ALTER TABLE audit.erp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.erp_events FORCE ROW LEVEL SECURITY;
GRANT SELECT ON audit.erp_events TO comecore_app, comecore_readonly;
GRANT INSERT ON audit.erp_events TO comecore_audit_writer;
GRANT USAGE ON SEQUENCE audit.erp_events_id_seq TO comecore_audit_writer;
CREATE POLICY erp_events_read ON audit.erp_events FOR SELECT TO comecore_app, comecore_readonly
USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
COMMENT ON TABLE audit.erp_events IS 'Auditoría de operaciones ERP: identidad, tabla y nombres de campos; jamás valores, contraseñas ni tokens';

CREATE FUNCTION app_private.audit_erp_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  before_record jsonb;
  after_record jsonb;
  record_data jsonb;
  fields text[];
BEGIN
  before_record := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN pg_catalog.to_jsonb(OLD) ELSE '{}'::jsonb END;
  after_record := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN pg_catalog.to_jsonb(NEW) ELSE '{}'::jsonb END;
  record_data := CASE WHEN TG_OP = 'DELETE' THEN before_record ELSE after_record END;
  SELECT coalesce(pg_catalog.array_agg(key ORDER BY key), ARRAY[]::text[]) INTO fields
  FROM pg_catalog.jsonb_object_keys(CASE WHEN TG_OP = 'DELETE' THEN before_record ELSE after_record END) AS keys(key)
  WHERE (before_record -> key) IS DISTINCT FROM (after_record -> key)
    AND key NOT IN ('updated_at','updated_by','version','credential_reference','access_secret_reference','wifi_secret_reference','file_reference');
  INSERT INTO audit.erp_events (organization_id, actor_user_id, source_table, record_id, event_type, changed_fields, request_id)
  VALUES ((record_data ->> 'organization_id')::uuid, app_private.current_user_id(), TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    (record_data ->> 'id')::uuid, TG_OP, fields, NULLIF(pg_catalog.left(pg_catalog.current_setting('app.request_id', true),120),''));
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$fn$;
ALTER FUNCTION app_private.audit_erp_change() OWNER TO comecore_audit_writer;
REVOKE ALL ON FUNCTION app_private.audit_erp_change() FROM PUBLIC;

CREATE TABLE catalog.service_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(160) NOT NULL,
  upload_kbps bigint NOT NULL DEFAULT 0,
  download_kbps bigint NOT NULL DEFAULT 0,
  price numeric(14,2) NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'MXN',
  frequency varchar(24) NOT NULL DEFAULT 'monthly',
  visible boolean NOT NULL DEFAULT true,
  mikrotik_strategy varchar(40) NOT NULL DEFAULT 'simple_queue',
  cir_ratio numeric(6,3) NOT NULL DEFAULT 1,
  burst_enabled boolean NOT NULL DEFAULT false,
  schedule_enabled boolean NOT NULL DEFAULT false,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> ''),
  CHECK (upload_kbps >= 0 AND download_kbps >= 0 AND price >= 0),
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (frequency IN ('monthly','weekly','daily','annual','once')),
  CHECK (mikrotik_strategy IN ('simple_queue','queue_tree','ppp_profile','none')),
  CHECK (cir_ratio > 0),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE catalog.service_plans OWNER TO comecore_owner;
CREATE INDEX service_plans_org_list_idx ON catalog.service_plans (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX service_plans_created_by_fk_idx ON catalog.service_plans (created_by);
CREATE INDEX service_plans_updated_by_fk_idx ON catalog.service_plans (updated_by);
ALTER TABLE catalog.service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.service_plans FORCE ROW LEVEL SECURITY;
GRANT SELECT ON catalog.service_plans TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON catalog.service_plans TO comecore_app;
CREATE POLICY service_plans_read ON catalog.service_plans FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY service_plans_insert ON catalog.service_plans FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY service_plans_update ON catalog.service_plans FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER service_plans_stamp BEFORE INSERT OR UPDATE ON catalog.service_plans FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER service_plans_audit AFTER INSERT OR UPDATE OR DELETE ON catalog.service_plans FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE catalog.service_plans IS 'Planes: velocidades normalizadas a kbps; contador de contratos se calcula por relación, no se duplica.';

CREATE TABLE catalog.plan_bursts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  plan_id uuid NOT NULL,
  direction varchar(8) NOT NULL,
  limit_kbps bigint NOT NULL,
  threshold_kbps bigint NOT NULL,
  check_seconds integer NOT NULL,
  duration_seconds numeric(10,3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, plan_id) REFERENCES catalog.service_plans (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, plan_id, direction),
  CHECK (direction IN ('upload','download')),
  CHECK (limit_kbps >= 0 AND threshold_kbps >= 0),
  CHECK (threshold_kbps <= limit_kbps),
  CHECK (check_seconds > 0),
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);
ALTER TABLE catalog.plan_bursts OWNER TO comecore_owner;
CREATE INDEX plan_bursts_org_list_idx ON catalog.plan_bursts (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX plan_bursts_created_by_fk_idx ON catalog.plan_bursts (created_by);
CREATE INDEX plan_bursts_updated_by_fk_idx ON catalog.plan_bursts (updated_by);
CREATE INDEX plan_bursts_organization_plan_fk_idx ON catalog.plan_bursts (organization_id, plan_id);
ALTER TABLE catalog.plan_bursts ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.plan_bursts FORCE ROW LEVEL SECURITY;
GRANT SELECT ON catalog.plan_bursts TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON catalog.plan_bursts TO comecore_app;
CREATE POLICY plan_bursts_read ON catalog.plan_bursts FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY plan_bursts_insert ON catalog.plan_bursts FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY plan_bursts_update ON catalog.plan_bursts FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER plan_bursts_stamp BEFORE INSERT OR UPDATE ON catalog.plan_bursts FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER plan_bursts_audit AFTER INSERT OR UPDATE OR DELETE ON catalog.plan_bursts FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE catalog.plan_product_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  plan_id uuid NOT NULL,
  charge_kind varchar(24) NOT NULL,
  product_code varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, plan_id) REFERENCES catalog.service_plans (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, plan_id, charge_kind),
  CHECK (charge_kind IN ('service','interest_first','interest_second','reconnection','installation')),
  CHECK (btrim(product_code) <> '')
);
ALTER TABLE catalog.plan_product_codes OWNER TO comecore_owner;
CREATE INDEX plan_product_codes_org_list_idx ON catalog.plan_product_codes (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX plan_product_codes_created_by_fk_idx ON catalog.plan_product_codes (created_by);
CREATE INDEX plan_product_codes_updated_by_fk_idx ON catalog.plan_product_codes (updated_by);
CREATE INDEX plan_product_codes_organization_plan_fk_idx ON catalog.plan_product_codes (organization_id, plan_id);
ALTER TABLE catalog.plan_product_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.plan_product_codes FORCE ROW LEVEL SECURITY;
GRANT SELECT ON catalog.plan_product_codes TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON catalog.plan_product_codes TO comecore_app;
CREATE POLICY plan_product_codes_read ON catalog.plan_product_codes FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY plan_product_codes_insert ON catalog.plan_product_codes FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY plan_product_codes_update ON catalog.plan_product_codes FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER plan_product_codes_stamp BEFORE INSERT OR UPDATE ON catalog.plan_product_codes FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER plan_product_codes_audit AFTER INSERT OR UPDATE OR DELETE ON catalog.plan_product_codes FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE network.servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(160) NOT NULL,
  kind varchar(24) NOT NULL,
  host varchar(255) NOT NULL,
  api_port integer NOT NULL DEFAULT 8729,
  connection_status varchar(24) NOT NULL DEFAULT 'disconnected',
  tls_required boolean NOT NULL DEFAULT true,
  traffic_control boolean NOT NULL DEFAULT false,
  dns_enabled boolean NOT NULL DEFAULT false,
  credential_reference varchar(255),
  backup_status varchar(24) NOT NULL DEFAULT 'unknown',
  notes text NOT NULL DEFAULT '',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> '' AND btrim(host) <> ''),
  CHECK (kind IN ('mikrotik','bmu')),
  CHECK (api_port BETWEEN 1 AND 65535),
  CHECK (connection_status IN ('connected','disconnected','maintenance','unknown')),
  CHECK (backup_status IN ('unknown','synced','pending','failed')),
  CHECK (credential_reference IS NULL OR credential_reference ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$')
);
ALTER TABLE network.servers OWNER TO comecore_owner;
CREATE INDEX servers_org_list_idx ON network.servers (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX servers_created_by_fk_idx ON network.servers (created_by);
CREATE INDEX servers_updated_by_fk_idx ON network.servers (updated_by);
ALTER TABLE network.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.servers FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.servers TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.servers TO comecore_app;
CREATE POLICY servers_read ON network.servers FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY servers_insert ON network.servers FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY servers_update ON network.servers FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER servers_stamp BEFORE INSERT OR UPDATE ON network.servers FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER servers_audit AFTER INSERT OR UPDATE OR DELETE ON network.servers FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE network.servers IS 'Solo referencia opaca a un almacén de secretos; no admite claves/token de equipo en texto plano. Su resolución en backend está pendiente.';

CREATE TABLE network.server_interfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  server_id uuid NOT NULL,
  name varchar(100) NOT NULL,
  interface_type varchar(40),
  network_cidr cidr,
  status varchar(20) NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, server_id) REFERENCES network.servers (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, server_id, name),
  UNIQUE (organization_id, id, server_id),
  CHECK (btrim(name) <> ''),
  CHECK (status IN ('up','down','unknown'))
);
ALTER TABLE network.server_interfaces OWNER TO comecore_owner;
CREATE INDEX server_interfaces_org_list_idx ON network.server_interfaces (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX server_interfaces_created_by_fk_idx ON network.server_interfaces (created_by);
CREATE INDEX server_interfaces_updated_by_fk_idx ON network.server_interfaces (updated_by);
CREATE INDEX server_interfaces_organization_server_fk_idx ON network.server_interfaces (organization_id, server_id);
ALTER TABLE network.server_interfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.server_interfaces FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.server_interfaces TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.server_interfaces TO comecore_app;
CREATE POLICY server_interfaces_read ON network.server_interfaces FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY server_interfaces_insert ON network.server_interfaces FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY server_interfaces_update ON network.server_interfaces FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER server_interfaces_stamp BEFORE INSERT OR UPDATE ON network.server_interfaces FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER server_interfaces_audit AFTER INSERT OR UPDATE OR DELETE ON network.server_interfaces FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE network.nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  code varchar(40) NOT NULL,
  name varchar(160) NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  latitude numeric(9,6),
  longitude numeric(9,6),
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, code),
  CHECK (btrim(code) <> '' AND btrim(name) <> ''),
  CHECK (capacity >= 0),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CHECK (status IN ('active','inactive','maintenance'))
);
ALTER TABLE network.nodes OWNER TO comecore_owner;
CREATE INDEX nodes_org_list_idx ON network.nodes (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX nodes_created_by_fk_idx ON network.nodes (created_by);
CREATE INDEX nodes_updated_by_fk_idx ON network.nodes (updated_by);
ALTER TABLE network.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.nodes FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.nodes TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.nodes TO comecore_app;
CREATE POLICY nodes_read ON network.nodes FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY nodes_insert ON network.nodes FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY nodes_update ON network.nodes FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER nodes_stamp BEFORE INSERT OR UPDATE ON network.nodes FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER nodes_audit AFTER INSERT OR UPDATE OR DELETE ON network.nodes FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE network.nodes IS 'Nodos: ocupación se obtiene de contratos asignados; coordenadas y capacidad corresponden al módulo existente.';

CREATE TABLE network.node_coverages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  node_id uuid NOT NULL,
  name varchar(160) NOT NULL,
  description text NOT NULL DEFAULT '',
  geometry_geojson jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, node_id) REFERENCES network.nodes (organization_id, id) ON DELETE RESTRICT,
  CHECK (btrim(name) <> ''),
  CHECK (geometry_geojson IS NULL OR jsonb_typeof(geometry_geojson) = 'object')
);
ALTER TABLE network.node_coverages OWNER TO comecore_owner;
CREATE INDEX node_coverages_org_list_idx ON network.node_coverages (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX node_coverages_created_by_fk_idx ON network.node_coverages (created_by);
CREATE INDEX node_coverages_updated_by_fk_idx ON network.node_coverages (updated_by);
CREATE INDEX node_coverages_organization_node_fk_idx ON network.node_coverages (organization_id, node_id);
ALTER TABLE network.node_coverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.node_coverages FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.node_coverages TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.node_coverages TO comecore_app;
CREATE POLICY node_coverages_read ON network.node_coverages FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY node_coverages_insert ON network.node_coverages FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY node_coverages_update ON network.node_coverages FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER node_coverages_stamp BEFORE INSERT OR UPDATE ON network.node_coverages FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER node_coverages_audit AFTER INSERT OR UPDATE OR DELETE ON network.node_coverages FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE network.node_coverages IS 'El mapa actual utiliza centro/puntos; geometría de cobertura opcional, sin afirmar medición de alcance real.';

CREATE TABLE network.olts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  server_id uuid,
  name varchar(160) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, server_id) REFERENCES network.servers (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> ''),
  CHECK (status IN ('active','inactive','maintenance'))
);
ALTER TABLE network.olts OWNER TO comecore_owner;
CREATE INDEX olts_org_list_idx ON network.olts (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX olts_created_by_fk_idx ON network.olts (created_by);
CREATE INDEX olts_updated_by_fk_idx ON network.olts (updated_by);
CREATE INDEX olts_organization_server_fk_idx ON network.olts (organization_id, server_id);
ALTER TABLE network.olts ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.olts FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.olts TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.olts TO comecore_app;
CREATE POLICY olts_read ON network.olts FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY olts_insert ON network.olts FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY olts_update ON network.olts FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER olts_stamp BEFORE INSERT OR UPDATE ON network.olts FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER olts_audit AFTER INSERT OR UPDATE OR DELETE ON network.olts FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE network.olt_ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  olt_id uuid NOT NULL,
  port_code varchar(80) NOT NULL,
  capacity integer NOT NULL DEFAULT 128,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, olt_id) REFERENCES network.olts (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, olt_id, port_code),
  UNIQUE (organization_id, id, olt_id),
  CHECK (btrim(port_code) <> ''),
  CHECK (capacity > 0)
);
ALTER TABLE network.olt_ports OWNER TO comecore_owner;
CREATE INDEX olt_ports_org_list_idx ON network.olt_ports (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX olt_ports_created_by_fk_idx ON network.olt_ports (created_by);
CREATE INDEX olt_ports_updated_by_fk_idx ON network.olt_ports (updated_by);
CREATE INDEX olt_ports_organization_olt_fk_idx ON network.olt_ports (organization_id, olt_id);
ALTER TABLE network.olt_ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.olt_ports FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.olt_ports TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.olt_ports TO comecore_app;
CREATE POLICY olt_ports_read ON network.olt_ports FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY olt_ports_insert ON network.olt_ports FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE POLICY olt_ports_update ON network.olt_ports FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin']));
CREATE TRIGGER olt_ports_stamp BEFORE INSERT OR UPDATE ON network.olt_ports FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER olt_ports_audit AFTER INSERT OR UPDATE OR DELETE ON network.olt_ports FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE network.naps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  olt_id uuid NOT NULL,
  name varchar(160) NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, olt_id) REFERENCES network.olts (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, olt_id, name),
  UNIQUE (organization_id, id, olt_id),
  CHECK (btrim(name) <> ''),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);
ALTER TABLE network.naps OWNER TO comecore_owner;
CREATE INDEX naps_org_list_idx ON network.naps (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX naps_created_by_fk_idx ON network.naps (created_by);
CREATE INDEX naps_updated_by_fk_idx ON network.naps (updated_by);
CREATE INDEX naps_organization_olt_fk_idx ON network.naps (organization_id, olt_id);
ALTER TABLE network.naps ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.naps FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.naps TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.naps TO comecore_app;
CREATE POLICY naps_read ON network.naps FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY naps_insert ON network.naps FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY naps_update ON network.naps FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER naps_stamp BEFORE INSERT OR UPDATE ON network.naps FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER naps_audit AFTER INSERT OR UPDATE OR DELETE ON network.naps FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE network.nap_ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  nap_id uuid NOT NULL,
  port_code varchar(80) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, nap_id) REFERENCES network.naps (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, nap_id, port_code),
  UNIQUE (organization_id, id, nap_id),
  CHECK (btrim(port_code) <> ''),
  CHECK (status IN ('available','occupied','damaged'))
);
ALTER TABLE network.nap_ports OWNER TO comecore_owner;
CREATE INDEX nap_ports_org_list_idx ON network.nap_ports (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX nap_ports_created_by_fk_idx ON network.nap_ports (created_by);
CREATE INDEX nap_ports_updated_by_fk_idx ON network.nap_ports (updated_by);
CREATE INDEX nap_ports_organization_nap_fk_idx ON network.nap_ports (organization_id, nap_id);
ALTER TABLE network.nap_ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.nap_ports FORCE ROW LEVEL SECURITY;
GRANT SELECT ON network.nap_ports TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON network.nap_ports TO comecore_app;
CREATE POLICY nap_ports_read ON network.nap_ports FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY nap_ports_insert ON network.nap_ports FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY nap_ports_update ON network.nap_ports FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER nap_ports_stamp BEFORE INSERT OR UPDATE ON network.nap_ports FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER nap_ports_audit AFTER INSERT OR UPDATE OR DELETE ON network.nap_ports FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.equipment_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  brand varchar(100) NOT NULL,
  model varchar(140) NOT NULL,
  equipment_type varchar(24) NOT NULL,
  unit varchar(40) NOT NULL DEFAULT 'units',
  description text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, brand, model),
  CHECK (btrim(brand) <> '' AND btrim(model) <> '' AND btrim(unit) <> ''),
  CHECK (equipment_type IN ('antenna','modem','olt','ont','access_point','repeater','router','switch','other')),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE inventory.equipment_models OWNER TO comecore_owner;
CREATE INDEX equipment_models_org_list_idx ON inventory.equipment_models (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX equipment_models_created_by_fk_idx ON inventory.equipment_models (created_by);
CREATE INDEX equipment_models_updated_by_fk_idx ON inventory.equipment_models (updated_by);
ALTER TABLE inventory.equipment_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.equipment_models FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.equipment_models TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON inventory.equipment_models TO comecore_app;
CREATE POLICY equipment_models_read ON inventory.equipment_models FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY equipment_models_insert ON inventory.equipment_models FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY equipment_models_update ON inventory.equipment_models FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER equipment_models_stamp BEFORE INSERT OR UPDATE ON inventory.equipment_models FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER equipment_models_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.equipment_models FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(160) NOT NULL,
  address text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> ''),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE inventory.warehouses OWNER TO comecore_owner;
CREATE INDEX warehouses_org_list_idx ON inventory.warehouses (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX warehouses_created_by_fk_idx ON inventory.warehouses (created_by);
CREATE INDEX warehouses_updated_by_fk_idx ON inventory.warehouses (updated_by);
ALTER TABLE inventory.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.warehouses FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.warehouses TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON inventory.warehouses TO comecore_app;
CREATE POLICY warehouses_read ON inventory.warehouses FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY warehouses_insert ON inventory.warehouses FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY warehouses_update ON inventory.warehouses FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER warehouses_stamp BEFORE INSERT OR UPDATE ON inventory.warehouses FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER warehouses_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.warehouses FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(180) NOT NULL,
  contact_email text,
  contact_phone varchar(32),
  notes text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  CHECK (btrim(name) <> ''),
  CHECK (contact_email IS NULL OR position('@' IN contact_email) > 1),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE inventory.suppliers OWNER TO comecore_owner;
CREATE INDEX suppliers_org_list_idx ON inventory.suppliers (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX suppliers_created_by_fk_idx ON inventory.suppliers (created_by);
CREATE INDEX suppliers_updated_by_fk_idx ON inventory.suppliers (updated_by);
ALTER TABLE inventory.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.suppliers FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.suppliers TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON inventory.suppliers TO comecore_app;
CREATE POLICY suppliers_read ON inventory.suppliers FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY suppliers_insert ON inventory.suppliers FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY suppliers_update ON inventory.suppliers FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER suppliers_stamp BEFORE INSERT OR UPDATE ON inventory.suppliers FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER suppliers_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.suppliers FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.stock_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  model_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  quantity numeric(14,3) NOT NULL DEFAULT 0,
  reserved_quantity numeric(14,3) NOT NULL DEFAULT 0,
  minimum_quantity numeric(14,3) NOT NULL DEFAULT 0,
  maximum_quantity numeric(14,3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, model_id) REFERENCES inventory.equipment_models (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, warehouse_id) REFERENCES inventory.warehouses (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, model_id, warehouse_id),
  CHECK (quantity >= 0 AND reserved_quantity BETWEEN 0 AND quantity AND minimum_quantity >= 0),
  CHECK (maximum_quantity IS NULL OR maximum_quantity >= minimum_quantity)
);
ALTER TABLE inventory.stock_levels OWNER TO comecore_owner;
CREATE INDEX stock_levels_org_list_idx ON inventory.stock_levels (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX stock_levels_created_by_fk_idx ON inventory.stock_levels (created_by);
CREATE INDEX stock_levels_updated_by_fk_idx ON inventory.stock_levels (updated_by);
CREATE INDEX stock_levels_organization_model_fk_idx ON inventory.stock_levels (organization_id, model_id);
CREATE INDEX stock_levels_organization_warehouse_fk_idx ON inventory.stock_levels (organization_id, warehouse_id);
ALTER TABLE inventory.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_levels FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.stock_levels TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON inventory.stock_levels TO comecore_app;
CREATE POLICY stock_levels_read ON inventory.stock_levels FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY stock_levels_insert ON inventory.stock_levels FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY stock_levels_update ON inventory.stock_levels FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER stock_levels_stamp BEFORE INSERT OR UPDATE ON inventory.stock_levels FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER stock_levels_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.stock_levels FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  model_id uuid NOT NULL,
  warehouse_id uuid,
  supplier_id uuid,
  customer_id uuid,
  serial_number varchar(120) NOT NULL,
  mac_address macaddr,
  status varchar(24) NOT NULL DEFAULT 'in_stock',
  notes text NOT NULL DEFAULT '',
  assigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, model_id) REFERENCES inventory.equipment_models (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, warehouse_id) REFERENCES inventory.warehouses (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, supplier_id) REFERENCES inventory.suppliers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, serial_number),
  CHECK (btrim(serial_number) <> ''),
  CHECK (status IN ('in_stock','assigned','installed','returned','damaged','retired')),
  CHECK (status NOT IN ('assigned','installed') OR customer_id IS NOT NULL)
);
ALTER TABLE inventory.assets OWNER TO comecore_owner;
CREATE INDEX assets_org_list_idx ON inventory.assets (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX assets_created_by_fk_idx ON inventory.assets (created_by);
CREATE INDEX assets_updated_by_fk_idx ON inventory.assets (updated_by);
CREATE INDEX assets_organization_model_fk_idx ON inventory.assets (organization_id, model_id);
CREATE INDEX assets_organization_warehouse_fk_idx ON inventory.assets (organization_id, warehouse_id);
CREATE INDEX assets_organization_supplier_fk_idx ON inventory.assets (organization_id, supplier_id);
CREATE INDEX assets_organization_customer_fk_idx ON inventory.assets (organization_id, customer_id);
ALTER TABLE inventory.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.assets FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.assets TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON inventory.assets TO comecore_app;
CREATE POLICY assets_read ON inventory.assets FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY assets_insert ON inventory.assets FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY assets_update ON inventory.assets FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER assets_stamp BEFORE INSERT OR UPDATE ON inventory.assets FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER assets_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.assets FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE inventory.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  model_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  asset_id uuid,
  supplier_id uuid,
  movement_type varchar(24) NOT NULL,
  quantity_delta numeric(14,3) NOT NULL,
  reason varchar(255) NOT NULL,
  reference_code varchar(120),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, model_id) REFERENCES inventory.equipment_models (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, warehouse_id) REFERENCES inventory.warehouses (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, asset_id) REFERENCES inventory.assets (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, supplier_id) REFERENCES inventory.suppliers (organization_id, id) ON DELETE RESTRICT,
  CHECK (movement_type IN ('receipt','issue','adjustment','return','transfer')),
  CHECK (quantity_delta <> 0),
  CHECK (btrim(reason) <> '')
);
ALTER TABLE inventory.stock_movements OWNER TO comecore_owner;
CREATE INDEX stock_movements_org_list_idx ON inventory.stock_movements (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX stock_movements_created_by_fk_idx ON inventory.stock_movements (created_by);
CREATE INDEX stock_movements_updated_by_fk_idx ON inventory.stock_movements (updated_by);
CREATE INDEX stock_movements_organization_model_fk_idx ON inventory.stock_movements (organization_id, model_id);
CREATE INDEX stock_movements_organization_warehouse_fk_idx ON inventory.stock_movements (organization_id, warehouse_id);
CREATE INDEX stock_movements_organization_asset_fk_idx ON inventory.stock_movements (organization_id, asset_id);
CREATE INDEX stock_movements_organization_supplier_fk_idx ON inventory.stock_movements (organization_id, supplier_id);
ALTER TABLE inventory.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_movements FORCE ROW LEVEL SECURITY;
GRANT SELECT ON inventory.stock_movements TO comecore_app, comecore_readonly;
GRANT INSERT ON inventory.stock_movements TO comecore_app;
CREATE POLICY stock_movements_read ON inventory.stock_movements FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY stock_movements_insert ON inventory.stock_movements FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER stock_movements_stamp BEFORE INSERT OR UPDATE ON inventory.stock_movements FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER stock_movements_audit AFTER INSERT OR UPDATE OR DELETE ON inventory.stock_movements FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE inventory.stock_movements IS 'Historial de cantidades; no actualiza saldos de stock por sí mismo. El backend debe registrar movimiento y saldo en una transacción.';

CREATE TABLE billing.legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(220) NOT NULL,
  tax_id varchar(40),
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> ''),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE billing.legal_entities OWNER TO comecore_owner;
CREATE INDEX legal_entities_org_list_idx ON billing.legal_entities (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX legal_entities_created_by_fk_idx ON billing.legal_entities (created_by);
CREATE INDEX legal_entities_updated_by_fk_idx ON billing.legal_entities (updated_by);
ALTER TABLE billing.legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.legal_entities FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.legal_entities TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.legal_entities TO comecore_app;
CREATE POLICY legal_entities_read ON billing.legal_entities FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY legal_entities_insert ON billing.legal_entities FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY legal_entities_update ON billing.legal_entities FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER legal_entities_stamp BEFORE INSERT OR UPDATE ON billing.legal_entities FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER legal_entities_audit AFTER INSERT OR UPDATE OR DELETE ON billing.legal_entities FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.service_billing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  name varchar(120) NOT NULL,
  billing_day smallint NOT NULL DEFAULT 1,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, name),
  CHECK (btrim(name) <> ''),
  CHECK (billing_day BETWEEN 1 AND 31),
  CHECK (status IN ('active','inactive'))
);
ALTER TABLE billing.service_billing_profiles OWNER TO comecore_owner;
CREATE INDEX service_billing_profiles_org_list_idx ON billing.service_billing_profiles (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX service_billing_profiles_created_by_fk_idx ON billing.service_billing_profiles (created_by);
CREATE INDEX service_billing_profiles_updated_by_fk_idx ON billing.service_billing_profiles (updated_by);
ALTER TABLE billing.service_billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.service_billing_profiles FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.service_billing_profiles TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.service_billing_profiles TO comecore_app;
CREATE POLICY service_billing_profiles_read ON billing.service_billing_profiles FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY service_billing_profiles_insert ON billing.service_billing_profiles FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY service_billing_profiles_update ON billing.service_billing_profiles FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER service_billing_profiles_stamp BEFORE INSERT OR UPDATE ON billing.service_billing_profiles FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER service_billing_profiles_audit AFTER INSERT OR UPDATE OR DELETE ON billing.service_billing_profiles FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  server_id uuid NOT NULL,
  node_id uuid NOT NULL,
  serial_number varchar(120) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'enabled',
  price numeric(14,2) NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'MXN',
  frequency varchar(24) NOT NULL DEFAULT 'monthly',
  billing_profile_id uuid,
  legal_entity_id uuid,
  billing_status varchar(24) NOT NULL DEFAULT 'active',
  billing_day smallint NOT NULL DEFAULT 1,
  starts_on date NOT NULL,
  start_billing_on date,
  billing_period_start date,
  billing_period_end date,
  latitude numeric(9,6),
  longitude numeric(9,6),
  notes text NOT NULL DEFAULT '',
  cable_modem_enabled boolean NOT NULL DEFAULT false,
  cable_modem_code varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, plan_id) REFERENCES catalog.service_plans (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, server_id) REFERENCES network.servers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, node_id) REFERENCES network.nodes (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, billing_profile_id) REFERENCES billing.service_billing_profiles (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, legal_entity_id) REFERENCES billing.legal_entities (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, serial_number),
  UNIQUE (organization_id, id, customer_id),
  UNIQUE (organization_id, id, server_id),
  CHECK (btrim(serial_number) <> ''),
  CHECK (status IN ('enabled','disabled','alerted','degraded','suspended')),
  CHECK (price >= 0 AND currency ~ '^[A-Z]{3}$'),
  CHECK (frequency IN ('monthly','weekly','daily','annual','once')),
  CHECK (billing_day BETWEEN 1 AND 31),
  CHECK (billing_period_start IS NULL OR billing_period_end IS NULL OR billing_period_end >= billing_period_start),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CHECK (NOT cable_modem_enabled OR btrim(coalesce(cable_modem_code,'')) <> '')
);
ALTER TABLE service.contracts OWNER TO comecore_owner;
CREATE INDEX contracts_org_list_idx ON service.contracts (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contracts_created_by_fk_idx ON service.contracts (created_by);
CREATE INDEX contracts_updated_by_fk_idx ON service.contracts (updated_by);
CREATE INDEX contracts_organization_customer_fk_idx ON service.contracts (organization_id, customer_id);
CREATE INDEX contracts_organization_plan_fk_idx ON service.contracts (organization_id, plan_id);
CREATE INDEX contracts_organization_server_fk_idx ON service.contracts (organization_id, server_id);
CREATE INDEX contracts_organization_node_fk_idx ON service.contracts (organization_id, node_id);
CREATE INDEX contracts_organization_billing_profile_fk_idx ON service.contracts (organization_id, billing_profile_id);
CREATE INDEX contracts_organization_legal_entity_fk_idx ON service.contracts (organization_id, legal_entity_id);
ALTER TABLE service.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contracts FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contracts TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contracts TO comecore_app;
CREATE POLICY contracts_read ON service.contracts FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contracts_insert ON service.contracts FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY contracts_update ON service.contracts FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support']));
CREATE TRIGGER contracts_stamp BEFORE INSERT OR UPDATE ON service.contracts FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contracts_audit AFTER INSERT OR UPDATE OR DELETE ON service.contracts FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contract_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  server_id uuid NOT NULL,
  interface_id uuid NOT NULL,
  access_mode varchar(16) NOT NULL,
  host_type varchar(16) NOT NULL DEFAULT 'host',
  ip_address inet,
  mac_address macaddr,
  network_cidr cidr,
  netmask inet,
  gateway inet,
  dns_primary inet,
  dns_secondary inet,
  ppp_username varchar(160),
  ppp_profile varchar(120),
  pppoe_server varchar(120),
  access_secret_reference varchar(255),
  wifi_secret_reference varchar(255),
  bandwidth_control boolean NOT NULL DEFAULT true,
  full_nat_address inet,
  traffic_tolerance_percent numeric(5,2) NOT NULL DEFAULT 0,
  cpe_protocol varchar(8) NOT NULL DEFAULT 'https',
  cpe_port integer NOT NULL DEFAULT 443,
  parent_queue varchar(120),
  upload_priority smallint NOT NULL DEFAULT 8,
  download_priority smallint NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id, server_id) REFERENCES service.contracts (organization_id, id, server_id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, interface_id, server_id) REFERENCES network.server_interfaces (organization_id, id, server_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, contract_id),
  CHECK (access_mode IN ('static','pppoe','dhcp')),
  CHECK (host_type IN ('host','subnet')),
  CHECK (access_mode <> 'static' OR (ip_address IS NOT NULL AND netmask IS NOT NULL)),
  CHECK (access_mode <> 'dhcp' OR mac_address IS NOT NULL),
  CHECK (access_mode <> 'pppoe' OR (btrim(coalesce(ppp_username,'')) <> '' AND btrim(coalesce(ppp_profile,'')) <> '' AND access_secret_reference IS NOT NULL)),
  CHECK (cpe_protocol IN ('http','https') AND cpe_port BETWEEN 1 AND 65535),
  CHECK (traffic_tolerance_percent BETWEEN 0 AND 100),
  CHECK (upload_priority BETWEEN 1 AND 8 AND download_priority BETWEEN 1 AND 8),
  CHECK (access_secret_reference IS NULL OR access_secret_reference ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$'),
  CHECK (wifi_secret_reference IS NULL OR wifi_secret_reference ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$')
);
ALTER TABLE service.contract_connections OWNER TO comecore_owner;
CREATE INDEX contract_connections_org_list_idx ON service.contract_connections (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_connections_created_by_fk_idx ON service.contract_connections (created_by);
CREATE INDEX contract_connections_updated_by_fk_idx ON service.contract_connections (updated_by);
CREATE INDEX contract_connections_organization_contract_server_fk_idx ON service.contract_connections (organization_id, contract_id, server_id);
CREATE INDEX contract_connections_organization_interface_server_fk_idx ON service.contract_connections (organization_id, interface_id, server_id);
ALTER TABLE service.contract_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_connections FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_connections TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contract_connections TO comecore_app;
CREATE POLICY contract_connections_read ON service.contract_connections FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_connections_insert ON service.contract_connections FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY contract_connections_update ON service.contract_connections FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER contract_connections_stamp BEFORE INSERT OR UPDATE ON service.contract_connections FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_connections_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_connections FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE service.contract_connections IS 'FK triple exige que contrato e interfaz pertenezcan al mismo servidor. Claves PPPoE/WiFi: solo referencias, nunca texto plano.';

CREATE TABLE service.contract_olt_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  olt_id uuid NOT NULL,
  olt_port_id uuid,
  nap_id uuid,
  nap_port_id uuid,
  mode varchar(16) NOT NULL DEFAULT 'router',
  onu_code varchar(120),
  onu_serial varchar(120) NOT NULL,
  onu_port varchar(80) NOT NULL,
  seal_code varchar(120),
  vlan integer,
  extra_vlans integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  bandwidth_control boolean NOT NULL DEFAULT false,
  catv_control boolean NOT NULL DEFAULT false,
  provision_wan boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id) REFERENCES service.contracts (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, olt_id) REFERENCES network.olts (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, olt_port_id, olt_id) REFERENCES network.olt_ports (organization_id, id, olt_id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, nap_id, olt_id) REFERENCES network.naps (organization_id, id, olt_id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, nap_port_id, nap_id) REFERENCES network.nap_ports (organization_id, id, nap_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, contract_id),
  UNIQUE (organization_id, onu_serial),
  CHECK (mode IN ('router','bridge')),
  CHECK (btrim(onu_serial) <> '' AND btrim(onu_port) <> ''),
  CHECK (vlan IS NULL OR vlan BETWEEN 1 AND 4094),
  CHECK (app_private.erp_valid_vlans(extra_vlans)),
  CHECK (nap_port_id IS NULL OR nap_id IS NOT NULL)
);
ALTER TABLE service.contract_olt_connections OWNER TO comecore_owner;
CREATE INDEX contract_olt_connections_org_list_idx ON service.contract_olt_connections (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_olt_connections_created_by_fk_idx ON service.contract_olt_connections (created_by);
CREATE INDEX contract_olt_connections_updated_by_fk_idx ON service.contract_olt_connections (updated_by);
CREATE INDEX contract_olt_connections_organization_contract_fk_idx ON service.contract_olt_connections (organization_id, contract_id);
CREATE INDEX contract_olt_connections_organization_olt_fk_idx ON service.contract_olt_connections (organization_id, olt_id);
CREATE INDEX contract_olt_connections_organization_olt_port_olt_fk_idx ON service.contract_olt_connections (organization_id, olt_port_id, olt_id);
CREATE INDEX contract_olt_connections_organization_nap_olt_fk_idx ON service.contract_olt_connections (organization_id, nap_id, olt_id);
CREATE INDEX contract_olt_connections_organization_nap_port_nap_fk_idx ON service.contract_olt_connections (organization_id, nap_port_id, nap_id);
ALTER TABLE service.contract_olt_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_olt_connections FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_olt_connections TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contract_olt_connections TO comecore_app;
CREATE POLICY contract_olt_connections_read ON service.contract_olt_connections FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_olt_connections_insert ON service.contract_olt_connections FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY contract_olt_connections_update ON service.contract_olt_connections FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER contract_olt_connections_stamp BEFORE INSERT OR UPDATE ON service.contract_olt_connections FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_olt_connections_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_olt_connections FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contract_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  name varchar(160) NOT NULL,
  discount_type varchar(16) NOT NULL,
  amount numeric(14,2) NOT NULL,
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id) REFERENCES service.contracts (organization_id, id) ON DELETE RESTRICT,
  CHECK (btrim(name) <> ''),
  CHECK (discount_type IN ('percentage','amount')),
  CHECK (amount >= 0 AND (discount_type <> 'percentage' OR amount <= 100)),
  CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on)
);
ALTER TABLE service.contract_discounts OWNER TO comecore_owner;
CREATE INDEX contract_discounts_org_list_idx ON service.contract_discounts (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_discounts_created_by_fk_idx ON service.contract_discounts (created_by);
CREATE INDEX contract_discounts_updated_by_fk_idx ON service.contract_discounts (updated_by);
CREATE INDEX contract_discounts_organization_contract_fk_idx ON service.contract_discounts (organization_id, contract_id);
ALTER TABLE service.contract_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_discounts FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_discounts TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contract_discounts TO comecore_app;
CREATE POLICY contract_discounts_read ON service.contract_discounts FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_discounts_insert ON service.contract_discounts FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY contract_discounts_update ON service.contract_discounts FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER contract_discounts_stamp BEFORE INSERT OR UPDATE ON service.contract_discounts FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_discounts_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_discounts FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contract_recurring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  name varchar(160) NOT NULL,
  unit_price numeric(14,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  product_code varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id) REFERENCES service.contracts (organization_id, id) ON DELETE RESTRICT,
  CHECK (btrim(name) <> ''),
  CHECK (unit_price >= 0 AND quantity > 0)
);
ALTER TABLE service.contract_recurring_items OWNER TO comecore_owner;
CREATE INDEX contract_recurring_items_org_list_idx ON service.contract_recurring_items (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_recurring_items_created_by_fk_idx ON service.contract_recurring_items (created_by);
CREATE INDEX contract_recurring_items_updated_by_fk_idx ON service.contract_recurring_items (updated_by);
CREATE INDEX contract_recurring_items_organization_contract_fk_idx ON service.contract_recurring_items (organization_id, contract_id);
ALTER TABLE service.contract_recurring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_recurring_items FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_recurring_items TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contract_recurring_items TO comecore_app;
CREATE POLICY contract_recurring_items_read ON service.contract_recurring_items FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_recurring_items_insert ON service.contract_recurring_items FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY contract_recurring_items_update ON service.contract_recurring_items FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER contract_recurring_items_stamp BEFORE INSERT OR UPDATE ON service.contract_recurring_items FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_recurring_items_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_recurring_items FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contract_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  name varchar(160) NOT NULL,
  asset_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id) REFERENCES service.contracts (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, asset_id) REFERENCES inventory.assets (organization_id, id) ON DELETE RESTRICT,
  CHECK (btrim(name) <> '')
);
ALTER TABLE service.contract_items OWNER TO comecore_owner;
CREATE INDEX contract_items_org_list_idx ON service.contract_items (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_items_created_by_fk_idx ON service.contract_items (created_by);
CREATE INDEX contract_items_updated_by_fk_idx ON service.contract_items (updated_by);
CREATE INDEX contract_items_organization_contract_fk_idx ON service.contract_items (organization_id, contract_id);
CREATE INDEX contract_items_organization_asset_fk_idx ON service.contract_items (organization_id, asset_id);
ALTER TABLE service.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_items FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_items TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON service.contract_items TO comecore_app;
CREATE POLICY contract_items_read ON service.contract_items FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_items_insert ON service.contract_items FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY contract_items_update ON service.contract_items FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER contract_items_stamp BEFORE INSERT OR UPDATE ON service.contract_items FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_items_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_items FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE service.contract_usage_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL,
  downstream_bytes bigint NOT NULL,
  upstream_bytes bigint NOT NULL,
  source varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, contract_id) REFERENCES service.contracts (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, contract_id, recorded_at, source),
  CHECK (downstream_bytes >= 0 AND upstream_bytes >= 0),
  CHECK (btrim(source) <> '')
);
ALTER TABLE service.contract_usage_samples OWNER TO comecore_owner;
CREATE INDEX contract_usage_samples_org_list_idx ON service.contract_usage_samples (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX contract_usage_samples_created_by_fk_idx ON service.contract_usage_samples (created_by);
CREATE INDEX contract_usage_samples_updated_by_fk_idx ON service.contract_usage_samples (updated_by);
CREATE INDEX contract_usage_samples_organization_contract_fk_idx ON service.contract_usage_samples (organization_id, contract_id);
ALTER TABLE service.contract_usage_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE service.contract_usage_samples FORCE ROW LEVEL SECURITY;
GRANT SELECT ON service.contract_usage_samples TO comecore_app, comecore_readonly;
GRANT INSERT ON service.contract_usage_samples TO comecore_app;
CREATE POLICY contract_usage_samples_read ON service.contract_usage_samples FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY contract_usage_samples_insert ON service.contract_usage_samples FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER contract_usage_samples_stamp BEFORE INSERT OR UPDATE ON service.contract_usage_samples FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER contract_usage_samples_audit AFTER INSERT OR UPDATE OR DELETE ON service.contract_usage_samples FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE service.contract_usage_samples IS 'Muestras reales pendientes de fuente de red; no se cargan curvas sintéticas como telemetría.';

CREATE TABLE billing.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  contract_id uuid,
  legal_entity_id uuid NOT NULL,
  invoice_number varchar(80) NOT NULL,
  document_type varchar(20) NOT NULL DEFAULT 'receipt',
  status varchar(20) NOT NULL DEFAULT 'draft',
  currency char(3) NOT NULL DEFAULT 'MXN',
  amount numeric(14,2) NOT NULL,
  balance numeric(14,2) NOT NULL,
  issued_at timestamptz,
  due_on date NOT NULL,
  period_start date,
  period_end date,
  payment_method varchar(100),
  concept text NOT NULL,
  fiscal_reference varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, contract_id, customer_id) REFERENCES service.contracts (organization_id, id, customer_id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, legal_entity_id) REFERENCES billing.legal_entities (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, invoice_number),
  UNIQUE (organization_id, id, customer_id, currency),
  CHECK (btrim(invoice_number) <> '' AND btrim(concept) <> ''),
  CHECK (document_type IN ('receipt','fiscal_invoice')),
  CHECK (status IN ('draft','unpaid','paid','void')),
  CHECK (amount >= 0 AND balance BETWEEN 0 AND amount),
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (period_start IS NULL OR period_end IS NULL OR period_end >= period_start),
  CHECK (status = 'draft' OR issued_at IS NOT NULL)
);
ALTER TABLE billing.invoices OWNER TO comecore_owner;
CREATE INDEX invoices_org_list_idx ON billing.invoices (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX invoices_created_by_fk_idx ON billing.invoices (created_by);
CREATE INDEX invoices_updated_by_fk_idx ON billing.invoices (updated_by);
CREATE INDEX invoices_organization_customer_fk_idx ON billing.invoices (organization_id, customer_id);
CREATE INDEX invoices_organization_contract_customer_fk_idx ON billing.invoices (organization_id, contract_id, customer_id);
CREATE INDEX invoices_organization_legal_entity_fk_idx ON billing.invoices (organization_id, legal_entity_id);
ALTER TABLE billing.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.invoices FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.invoices TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.invoices TO comecore_app;
CREATE POLICY invoices_read ON billing.invoices FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY invoices_insert ON billing.invoices FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY invoices_update ON billing.invoices FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER invoices_stamp BEFORE INSERT OR UPDATE ON billing.invoices FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER invoices_audit AFTER INSERT OR UPDATE OR DELETE ON billing.invoices FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE billing.invoices IS 'Factura fiscal no equivale a timbrado SAT: proveedor, validaciones y emisión fiscal siguen pendientes.';

CREATE TABLE billing.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL,
  line_number integer NOT NULL,
  description varchar(255) NOT NULL,
  quantity numeric(14,3) NOT NULL DEFAULT 1,
  unit_price numeric(14,2) NOT NULL,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  product_code varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, invoice_id) REFERENCES billing.invoices (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, invoice_id, line_number),
  CHECK (line_number > 0 AND btrim(description) <> ''),
  CHECK (quantity > 0 AND unit_price >= 0 AND tax_amount >= 0)
);
ALTER TABLE billing.invoice_items OWNER TO comecore_owner;
CREATE INDEX invoice_items_org_list_idx ON billing.invoice_items (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX invoice_items_created_by_fk_idx ON billing.invoice_items (created_by);
CREATE INDEX invoice_items_updated_by_fk_idx ON billing.invoice_items (updated_by);
CREATE INDEX invoice_items_organization_invoice_fk_idx ON billing.invoice_items (organization_id, invoice_id);
ALTER TABLE billing.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.invoice_items FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.invoice_items TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.invoice_items TO comecore_app;
CREATE POLICY invoice_items_read ON billing.invoice_items FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY invoice_items_insert ON billing.invoice_items FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY invoice_items_update ON billing.invoice_items FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER invoice_items_stamp BEFORE INSERT OR UPDATE ON billing.invoice_items FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER invoice_items_audit AFTER INSERT OR UPDATE OR DELETE ON billing.invoice_items FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL,
  credit_number varchar(80) NOT NULL,
  amount numeric(14,2) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'applied',
  category varchar(120) NOT NULL,
  description text NOT NULL DEFAULT '',
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, invoice_id) REFERENCES billing.invoices (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, credit_number),
  CHECK (btrim(credit_number) <> '' AND btrim(category) <> ''),
  CHECK (amount > 0),
  CHECK (status IN ('applied','void'))
);
ALTER TABLE billing.credit_notes OWNER TO comecore_owner;
CREATE INDEX credit_notes_org_list_idx ON billing.credit_notes (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX credit_notes_created_by_fk_idx ON billing.credit_notes (created_by);
CREATE INDEX credit_notes_updated_by_fk_idx ON billing.credit_notes (updated_by);
CREATE INDEX credit_notes_organization_invoice_fk_idx ON billing.credit_notes (organization_id, invoice_id);
ALTER TABLE billing.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.credit_notes FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.credit_notes TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.credit_notes TO comecore_app;
CREATE POLICY credit_notes_read ON billing.credit_notes FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY credit_notes_insert ON billing.credit_notes FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY credit_notes_update ON billing.credit_notes FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER credit_notes_stamp BEFORE INSERT OR UPDATE ON billing.credit_notes FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER credit_notes_audit AFTER INSERT OR UPDATE OR DELETE ON billing.credit_notes FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  payment_number varchar(80) NOT NULL,
  paid_at timestamptz NOT NULL,
  amount numeric(14,2) NOT NULL,
  unallocated_credit numeric(14,2) NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'MXN',
  method varchar(100) NOT NULL,
  collector_user_id uuid,
  status varchar(20) NOT NULL DEFAULT 'valid',
  provider_reference varchar(160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, id, customer_id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, collector_user_id) REFERENCES iam.organization_memberships (organization_id, user_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, payment_number),
  UNIQUE (organization_id, id, customer_id, currency),
  CHECK (btrim(payment_number) <> '' AND btrim(method) <> ''),
  CHECK (amount > 0 AND unallocated_credit BETWEEN 0 AND amount),
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (status IN ('valid','void'))
);
ALTER TABLE billing.payments OWNER TO comecore_owner;
CREATE INDEX payments_org_list_idx ON billing.payments (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX payments_created_by_fk_idx ON billing.payments (created_by);
CREATE INDEX payments_updated_by_fk_idx ON billing.payments (updated_by);
CREATE INDEX payments_organization_customer_fk_idx ON billing.payments (organization_id, customer_id);
CREATE INDEX payments_organization_collector_user_fk_idx ON billing.payments (organization_id, collector_user_id);
ALTER TABLE billing.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payments FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.payments TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.payments TO comecore_app;
CREATE POLICY payments_read ON billing.payments FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY payments_insert ON billing.payments FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY payments_update ON billing.payments FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER payments_stamp BEFORE INSERT OR UPDATE ON billing.payments FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER payments_audit AFTER INSERT OR UPDATE OR DELETE ON billing.payments FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  payment_id uuid NOT NULL,
  invoice_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  currency char(3) NOT NULL,
  amount numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, payment_id, customer_id, currency) REFERENCES billing.payments (organization_id, id, customer_id, currency) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, invoice_id, customer_id, currency) REFERENCES billing.invoices (organization_id, id, customer_id, currency) ON DELETE RESTRICT,
  UNIQUE (organization_id, payment_id, invoice_id),
  CHECK (amount > 0)
);
ALTER TABLE billing.payment_allocations OWNER TO comecore_owner;
CREATE INDEX payment_allocations_org_list_idx ON billing.payment_allocations (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX payment_allocations_created_by_fk_idx ON billing.payment_allocations (created_by);
CREATE INDEX payment_allocations_updated_by_fk_idx ON billing.payment_allocations (updated_by);
CREATE INDEX payment_allocations_organization_payment_customer_currency_fk_idx ON billing.payment_allocations (organization_id, payment_id, customer_id, currency);
CREATE INDEX payment_allocations_organization_invoice_customer_currency_fk_idx ON billing.payment_allocations (organization_id, invoice_id, customer_id, currency);
ALTER TABLE billing.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_allocations FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.payment_allocations TO comecore_app, comecore_readonly;
GRANT INSERT ON billing.payment_allocations TO comecore_app;
CREATE POLICY payment_allocations_read ON billing.payment_allocations FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY payment_allocations_insert ON billing.payment_allocations FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER payment_allocations_stamp BEFORE INSERT OR UPDATE ON billing.payment_allocations FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER payment_allocations_audit AFTER INSERT OR UPDATE OR DELETE ON billing.payment_allocations FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE billing.payment_allocations IS 'Impide aplicar pagos a otro cliente/organización/moneda. Límite agregado y actualización de saldos exigen transacción de backend.';

CREATE TABLE billing.payment_promises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  contract_id uuid,
  promise_number varchar(80) NOT NULL,
  debt numeric(14,2) NOT NULL,
  valid_until timestamptz NOT NULL,
  kind varchar(20) NOT NULL DEFAULT 'manual',
  mobile boolean NOT NULL DEFAULT false,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, contract_id, customer_id) REFERENCES service.contracts (organization_id, id, customer_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, promise_number),
  CHECK (btrim(promise_number) <> ''),
  CHECK (debt >= 0),
  CHECK (kind IN ('manual','automatic')),
  CHECK (status IN ('active','fulfilled','expired','cancelled'))
);
ALTER TABLE billing.payment_promises OWNER TO comecore_owner;
CREATE INDEX payment_promises_org_list_idx ON billing.payment_promises (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX payment_promises_created_by_fk_idx ON billing.payment_promises (created_by);
CREATE INDEX payment_promises_updated_by_fk_idx ON billing.payment_promises (updated_by);
CREATE INDEX payment_promises_organization_customer_fk_idx ON billing.payment_promises (organization_id, customer_id);
CREATE INDEX payment_promises_organization_contract_customer_fk_idx ON billing.payment_promises (organization_id, contract_id, customer_id);
ALTER TABLE billing.payment_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_promises FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.payment_promises TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.payment_promises TO comecore_app;
CREATE POLICY payment_promises_read ON billing.payment_promises FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY payment_promises_insert ON billing.payment_promises FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY payment_promises_update ON billing.payment_promises FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER payment_promises_stamp BEFORE INSERT OR UPDATE ON billing.payment_promises FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER payment_promises_audit AFTER INSERT OR UPDATE OR DELETE ON billing.payment_promises FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.payment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  payment_id uuid,
  receipt_number varchar(80) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  file_reference varchar(255),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, payment_id, customer_id) REFERENCES billing.payments (organization_id, id, customer_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, receipt_number),
  CHECK (btrim(receipt_number) <> ''),
  CHECK (status IN ('pending','processed','rejected')),
  CHECK (file_reference IS NULL OR file_reference ~ '^storage:[A-Za-z0-9_./:-]{1,230}$')
);
ALTER TABLE billing.payment_receipts OWNER TO comecore_owner;
CREATE INDEX payment_receipts_org_list_idx ON billing.payment_receipts (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX payment_receipts_created_by_fk_idx ON billing.payment_receipts (created_by);
CREATE INDEX payment_receipts_updated_by_fk_idx ON billing.payment_receipts (updated_by);
CREATE INDEX payment_receipts_organization_customer_fk_idx ON billing.payment_receipts (organization_id, customer_id);
CREATE INDEX payment_receipts_organization_payment_fk_idx ON billing.payment_receipts (organization_id, payment_id);
ALTER TABLE billing.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payment_receipts FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.payment_receipts TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.payment_receipts TO comecore_app;
CREATE POLICY payment_receipts_read ON billing.payment_receipts FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY payment_receipts_insert ON billing.payment_receipts FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY payment_receipts_update ON billing.payment_receipts FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER payment_receipts_stamp BEFORE INSERT OR UPDATE ON billing.payment_receipts FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER payment_receipts_audit AFTER INSERT OR UPDATE OR DELETE ON billing.payment_receipts FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE billing.payment_receipts IS 'Referencia de archivo privada; URLs firmadas y control de tipos/tamaño/antimalware deben implementarse al conectar carga de comprobantes.';

CREATE TABLE billing.cash_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  audit_number varchar(80) NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  currency char(3) NOT NULL DEFAULT 'MXN',
  cash_amount numeric(14,2) NOT NULL DEFAULT 0,
  transfer_amount numeric(14,2) NOT NULL DEFAULT 0,
  card_amount numeric(14,2) NOT NULL DEFAULT 0,
  status varchar(20) NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, audit_number),
  CHECK (btrim(audit_number) <> ''),
  CHECK (period_end >= period_start),
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (cash_amount >= 0 AND transfer_amount >= 0 AND card_amount >= 0),
  CHECK (status IN ('draft','closed','void'))
);
ALTER TABLE billing.cash_audits OWNER TO comecore_owner;
CREATE INDEX cash_audits_org_list_idx ON billing.cash_audits (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX cash_audits_created_by_fk_idx ON billing.cash_audits (created_by);
CREATE INDEX cash_audits_updated_by_fk_idx ON billing.cash_audits (updated_by);
ALTER TABLE billing.cash_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.cash_audits FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.cash_audits TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON billing.cash_audits TO comecore_app;
CREATE POLICY cash_audits_read ON billing.cash_audits FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY cash_audits_insert ON billing.cash_audits FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE POLICY cash_audits_update ON billing.cash_audits FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER cash_audits_stamp BEFORE INSERT OR UPDATE ON billing.cash_audits FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER cash_audits_audit AFTER INSERT OR UPDATE OR DELETE ON billing.cash_audits FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.cash_audit_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  cash_audit_id uuid NOT NULL,
  payment_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, cash_audit_id) REFERENCES billing.cash_audits (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, payment_id) REFERENCES billing.payments (organization_id, id) ON DELETE RESTRICT,
  UNIQUE (organization_id, cash_audit_id, payment_id)
);
ALTER TABLE billing.cash_audit_payments OWNER TO comecore_owner;
CREATE INDEX cash_audit_payments_org_list_idx ON billing.cash_audit_payments (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX cash_audit_payments_created_by_fk_idx ON billing.cash_audit_payments (created_by);
CREATE INDEX cash_audit_payments_updated_by_fk_idx ON billing.cash_audit_payments (updated_by);
CREATE INDEX cash_audit_payments_organization_cash_audit_fk_idx ON billing.cash_audit_payments (organization_id, cash_audit_id);
CREATE INDEX cash_audit_payments_organization_payment_fk_idx ON billing.cash_audit_payments (organization_id, payment_id);
ALTER TABLE billing.cash_audit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.cash_audit_payments FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.cash_audit_payments TO comecore_app, comecore_readonly;
GRANT INSERT ON billing.cash_audit_payments TO comecore_app;
CREATE POLICY cash_audit_payments_read ON billing.cash_audit_payments FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY cash_audit_payments_insert ON billing.cash_audit_payments FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER cash_audit_payments_stamp BEFORE INSERT OR UPDATE ON billing.cash_audit_payments FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER cash_audit_payments_audit AFTER INSERT OR UPDATE OR DELETE ON billing.cash_audit_payments FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE TABLE billing.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  invoice_id uuid,
  payment_id uuid,
  entry_type varchar(16) NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'MXN',
  concept varchar(255) NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, invoice_id, customer_id, currency) REFERENCES billing.invoices (organization_id, id, customer_id, currency) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, payment_id, customer_id, currency) REFERENCES billing.payments (organization_id, id, customer_id, currency) ON DELETE RESTRICT,
  UNIQUE (organization_id, idempotency_key),
  CHECK (entry_type IN ('charge','credit') AND amount > 0),
  CHECK (currency ~ '^[A-Z]{3}$'),
  CHECK (btrim(concept) <> '' AND btrim(idempotency_key) <> '')
);
ALTER TABLE billing.ledger_entries OWNER TO comecore_owner;
CREATE INDEX ledger_entries_org_list_idx ON billing.ledger_entries (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX ledger_entries_created_by_fk_idx ON billing.ledger_entries (created_by);
CREATE INDEX ledger_entries_updated_by_fk_idx ON billing.ledger_entries (updated_by);
CREATE INDEX ledger_entries_organization_customer_fk_idx ON billing.ledger_entries (organization_id, customer_id);
CREATE INDEX ledger_entries_organization_invoice_customer_currency_fk_idx ON billing.ledger_entries (organization_id, invoice_id, customer_id, currency);
CREATE INDEX ledger_entries_organization_payment_customer_currency_fk_idx ON billing.ledger_entries (organization_id, payment_id, customer_id, currency);
ALTER TABLE billing.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.ledger_entries FORCE ROW LEVEL SECURITY;
GRANT SELECT ON billing.ledger_entries TO comecore_app, comecore_readonly;
GRANT INSERT ON billing.ledger_entries TO comecore_app;
CREATE POLICY ledger_entries_read ON billing.ledger_entries FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY ledger_entries_insert ON billing.ledger_entries FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing']));
CREATE TRIGGER ledger_entries_stamp BEFORE INSERT OR UPDATE ON billing.ledger_entries FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER ledger_entries_audit AFTER INSERT OR UPDATE OR DELETE ON billing.ledger_entries FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();
COMMENT ON TABLE billing.ledger_entries IS 'Cuenta corriente cargo/abono de la UI; registros inmutables para runtime y clave de idempotencia. No es un libro contable de doble partida.';

CREATE TABLE support.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  ticket_number varchar(80) NOT NULL,
  title varchar(200) NOT NULL,
  description text NOT NULL DEFAULT '',
  category varchar(80) NOT NULL,
  priority varchar(16) NOT NULL DEFAULT 'medium',
  status varchar(20) NOT NULL DEFAULT 'open',
  assigned_user_id uuid,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  deleted_at timestamptz,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, customer_id) REFERENCES crm.customers (organization_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, contract_id, customer_id) REFERENCES service.contracts (organization_id, id, customer_id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, assigned_user_id) REFERENCES iam.organization_memberships (organization_id, user_id) ON DELETE RESTRICT,
  UNIQUE (organization_id, ticket_number),
  CHECK (btrim(ticket_number) <> '' AND length(btrim(title)) >= 3 AND btrim(category) <> ''),
  CHECK (priority IN ('low','medium','high')),
  CHECK (status IN ('open','in_progress','closed')),
  CHECK (status <> 'closed' OR closed_at IS NOT NULL)
);
ALTER TABLE support.tickets OWNER TO comecore_owner;
CREATE INDEX tickets_org_list_idx ON support.tickets (organization_id, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX tickets_created_by_fk_idx ON support.tickets (created_by);
CREATE INDEX tickets_updated_by_fk_idx ON support.tickets (updated_by);
CREATE INDEX tickets_organization_customer_fk_idx ON support.tickets (organization_id, customer_id);
CREATE INDEX tickets_organization_contract_customer_fk_idx ON support.tickets (organization_id, contract_id, customer_id);
CREATE INDEX tickets_organization_assigned_user_fk_idx ON support.tickets (organization_id, assigned_user_id);
ALTER TABLE support.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.tickets FORCE ROW LEVEL SECURITY;
GRANT SELECT ON support.tickets TO comecore_app, comecore_readonly;
GRANT INSERT, UPDATE ON support.tickets TO comecore_app;
CREATE POLICY tickets_read ON support.tickets FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','billing','support','viewer']));
CREATE POLICY tickets_insert ON support.tickets FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE POLICY tickets_update ON support.tickets FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY['owner','admin','support'])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY['owner','admin','support']));
CREATE TRIGGER tickets_stamp BEFORE INSERT OR UPDATE ON support.tickets FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record();
CREATE TRIGGER tickets_audit AFTER INSERT OR UPDATE OR DELETE ON support.tickets FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change();

CREATE UNIQUE INDEX contract_connections_ip_unique ON service.contract_connections (organization_id, server_id, ip_address) WHERE ip_address IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX contract_connections_ppp_unique ON service.contract_connections (organization_id, server_id, ppp_username) WHERE access_mode = 'pppoe' AND ppp_username IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX contract_olt_nap_port_unique ON service.contract_olt_connections (organization_id, nap_port_id) WHERE nap_port_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX invoices_customer_due_idx ON billing.invoices (organization_id, customer_id, due_on) WHERE status = 'unpaid' AND deleted_at IS NULL;
CREATE INDEX tickets_open_priority_idx ON support.tickets (organization_id, status, priority, created_at) WHERE status <> 'closed' AND deleted_at IS NULL;
CREATE INDEX ledger_entries_customer_time_idx ON billing.ledger_entries (organization_id, customer_id, occurred_at, id);
CREATE INDEX contract_usage_samples_time_idx ON service.contract_usage_samples (organization_id, contract_id, recorded_at DESC);


-- Mezcla de conexión/facturación en la UI: permisos de columnas según rol IAM.
CREATE FUNCTION app_private.guard_contract_finance()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $fn$
DECLARE
  old_data jsonb := pg_catalog.to_jsonb(OLD);
  new_data jsonb := pg_catalog.to_jsonb(NEW);
  field_name text;
BEGIN
  IF NEW.customer_id IS DISTINCT FROM OLD.customer_id THEN
    RAISE EXCEPTION 'No se puede reasignar el cliente del contrato' USING ERRCODE = '22023';
  END IF;
  FOREACH field_name IN ARRAY ARRAY['price','currency','frequency','billing_profile_id','legal_entity_id','billing_status','billing_day','start_billing_on','billing_period_start','billing_period_end'] LOOP
    IF (new_data -> field_name) IS DISTINCT FROM (old_data -> field_name)
      AND NOT app_private.has_org_role(NEW.organization_id, ARRAY['owner','admin','billing']) THEN
      RAISE EXCEPTION 'La operación financiera requiere permisos de facturación' USING ERRCODE = '42501';
    END IF;
  END LOOP;
  FOREACH field_name IN ARRAY ARRAY['plan_id','server_id','node_id','serial_number','status','starts_on','latitude','longitude','notes','cable_modem_enabled','cable_modem_code'] LOOP
    IF (new_data -> field_name) IS DISTINCT FROM (old_data -> field_name)
      AND NOT app_private.has_org_role(NEW.organization_id, ARRAY['owner','admin','support']) THEN
      RAISE EXCEPTION 'La operación de servicio requiere permisos operativos' USING ERRCODE = '42501';
    END IF;
  END LOOP;
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at AND NOT app_private.has_org_role(NEW.organization_id, ARRAY['owner','admin']) THEN
    RAISE EXCEPTION 'Archivar/restaurar un contrato requiere permisos administrativos' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$fn$;
ALTER FUNCTION app_private.guard_contract_finance() OWNER TO comecore_owner;
REVOKE ALL ON FUNCTION app_private.guard_contract_finance() FROM PUBLIC;
CREATE TRIGGER contracts_finance_guard BEFORE UPDATE ON service.contracts FOR EACH ROW EXECUTE FUNCTION app_private.guard_contract_finance();

-- Historial de stock y arqueos conservan coherencia con su artículo/moneda.
ALTER TABLE inventory.assets ADD CONSTRAINT assets_model_identity UNIQUE (organization_id, id, model_id);
ALTER TABLE inventory.stock_movements DROP CONSTRAINT stock_movements_organization_id_asset_id_fkey;
ALTER TABLE inventory.stock_movements ADD CONSTRAINT stock_movements_asset_model_fk
  FOREIGN KEY (organization_id, asset_id, model_id) REFERENCES inventory.assets (organization_id, id, model_id) ON DELETE RESTRICT;
ALTER TABLE billing.cash_audits ADD CONSTRAINT cash_audits_currency_identity UNIQUE (organization_id, id, currency);
ALTER TABLE billing.cash_audit_payments ADD COLUMN currency char(3) NOT NULL DEFAULT 'MXN';
ALTER TABLE billing.payments ADD CONSTRAINT payments_currency_identity UNIQUE (organization_id, id, currency);
ALTER TABLE billing.cash_audit_payments DROP CONSTRAINT cash_audit_payments_organization_id_cash_audit_id_fkey;
ALTER TABLE billing.cash_audit_payments DROP CONSTRAINT cash_audit_payments_organization_id_payment_id_fkey;
ALTER TABLE billing.cash_audit_payments ADD CONSTRAINT cash_audit_payments_audit_currency_fk
  FOREIGN KEY (organization_id, cash_audit_id, currency) REFERENCES billing.cash_audits (organization_id, id, currency) ON DELETE RESTRICT;
ALTER TABLE billing.cash_audit_payments ADD CONSTRAINT cash_audit_payments_payment_currency_fk
  FOREIGN KEY (organization_id, payment_id, currency) REFERENCES billing.payments (organization_id, id, currency) ON DELETE RESTRICT;

COMMIT;
