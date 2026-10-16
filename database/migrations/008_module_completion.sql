-- 008: completar el modelo observado y alinear RLS con permisos del ERP.
-- No carga demostraciones, no modifica migraciones anteriores ni publica servicios.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Lecturas limitadas por dominio, además del aislamiento de organización de has_org_role.
DO $policies$
DECLARE p record; roles text[];
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_catalog.pg_policies
    WHERE schemaname IN ('billing','inventory','network') AND cmd='SELECT'
  LOOP
    roles := CASE WHEN p.schemaname='billing' THEN ARRAY['owner','admin','billing'] ELSE ARRAY['owner','admin','support'] END;
    EXECUTE format('ALTER POLICY %I ON %I.%I USING (app_private.has_org_role(organization_id,%L::text[]))',p.policyname,p.schemaname,p.tablename,roles);
  END LOOP;
  -- Soporte consulta inventario; modificarlo requiere inventario:write (owner/admin).
  FOR p IN SELECT schemaname,tablename,policyname,cmd FROM pg_catalog.pg_policies
    WHERE schemaname='inventory' AND cmd IN ('INSERT','UPDATE')
  LOOP
    IF p.cmd='INSERT' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin'']))',p.policyname,p.schemaname,p.tablename);
    ELSE
      EXECUTE format('ALTER POLICY %I ON %I.%I USING (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin''])) WITH CHECK (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin'']))',p.policyname,p.schemaname,p.tablename);
    END IF;
  END LOOP;
END $policies$;
ALTER POLICY erp_events_read ON audit.erp_events USING (app_private.has_org_role(organization_id,ARRAY['owner','admin']));

-- Campos de Artículos del módulo importado: código, ubicación y responsable.
ALTER TABLE inventory.equipment_models ADD COLUMN stock_kind varchar(16) NOT NULL DEFAULT 'unitary' CHECK (stock_kind IN ('unitary','consumable'));
ALTER TABLE inventory.assets ADD COLUMN product_code varchar(120), ADD COLUMN node_id uuid, ADD COLUMN employee_id uuid;
ALTER TABLE inventory.assets ADD CONSTRAINT assets_product_code_nonempty CHECK (product_code IS NULL OR btrim(product_code)<>'');
ALTER TABLE inventory.assets ADD CONSTRAINT assets_node_fk FOREIGN KEY (organization_id,node_id) REFERENCES network.nodes(organization_id,id) ON DELETE RESTRICT;
ALTER TABLE inventory.assets ADD CONSTRAINT assets_employee_membership_fk FOREIGN KEY (organization_id,employee_id) REFERENCES iam.organization_memberships(organization_id,user_id) ON DELETE RESTRICT;
ALTER TABLE inventory.assets DROP CONSTRAINT assets_status_check;
ALTER TABLE inventory.assets DROP CONSTRAINT assets_check;
ALTER TABLE inventory.assets ADD CONSTRAINT assets_status_check CHECK (status IN ('in_stock','assigned','installed','returned','damaged','retired','maintenance','inactive','stolen'));
ALTER TABLE inventory.assets ADD CONSTRAINT assets_assignment_required CHECK (status NOT IN ('assigned','installed') OR customer_id IS NOT NULL OR node_id IS NOT NULL OR employee_id IS NOT NULL);
ALTER TABLE inventory.assets ADD CONSTRAINT assets_one_destination CHECK (num_nonnulls(customer_id,node_id,employee_id)<=1);
CREATE UNIQUE INDEX assets_product_code_unique ON inventory.assets(organization_id,product_code) WHERE product_code IS NOT NULL;
CREATE UNIQUE INDEX assets_mac_unique ON inventory.assets(organization_id,mac_address) WHERE mac_address IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX assets_node_fk_idx ON inventory.assets(organization_id,node_id) WHERE node_id IS NOT NULL;
CREATE INDEX assets_employee_fk_idx ON inventory.assets(organization_id,employee_id) WHERE employee_id IS NOT NULL;
COMMENT ON COLUMN inventory.assets.employee_id IS 'Responsable de la misma organización; membresía IAM, nunca nombre de texto como identidad.';

-- Un artículo activo pertenece a un contrato y cliente coherentes; nunca a dos clientes.
ALTER TABLE inventory.assets ADD CONSTRAINT assets_org_id_customer_unique UNIQUE(organization_id,id,customer_id);
ALTER TABLE service.contract_items ADD COLUMN customer_id uuid;
UPDATE service.contract_items i SET customer_id=c.customer_id FROM service.contracts c WHERE i.organization_id=c.organization_id AND i.contract_id=c.id;
ALTER TABLE service.contract_items ALTER COLUMN customer_id SET NOT NULL;
ALTER TABLE service.contract_items ADD CONSTRAINT contract_items_contract_customer_fk FOREIGN KEY(organization_id,contract_id,customer_id) REFERENCES service.contracts(organization_id,id,customer_id) ON DELETE RESTRICT;
ALTER TABLE service.contract_items ADD CONSTRAINT contract_items_asset_customer_fk FOREIGN KEY(organization_id,asset_id,customer_id) REFERENCES inventory.assets(organization_id,id,customer_id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX contract_items_one_active_asset ON service.contract_items(organization_id,asset_id) WHERE asset_id IS NOT NULL AND deleted_at IS NULL;

-- La vista de comprobantes enlaza una factura además del pago y del cliente.
ALTER TABLE billing.invoices ADD CONSTRAINT invoices_org_id_customer_unique UNIQUE(organization_id,id,customer_id);
ALTER TABLE billing.payment_receipts ADD COLUMN invoice_id uuid;
ALTER TABLE billing.payment_receipts ADD CONSTRAINT receipts_invoice_customer_fk FOREIGN KEY(organization_id,invoice_id,customer_id) REFERENCES billing.invoices(organization_id,id,customer_id) ON DELETE RESTRICT;
CREATE INDEX receipts_invoice_fk_idx ON billing.payment_receipts(organization_id,invoice_id) WHERE invoice_id IS NOT NULL;

CREATE SCHEMA documents AUTHORIZATION comecore_owner;
CREATE SCHEMA cms AUTHORIZATION comecore_owner;
REVOKE ALL ON SCHEMA documents,cms FROM PUBLIC;
GRANT USAGE ON SCHEMA documents,cms TO comecore_app,comecore_readonly;
ALTER DEFAULT PRIVILEGES FOR ROLE comecore_owner IN SCHEMA documents,cms REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE TABLE documents.files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
 purpose varchar(24) NOT NULL CHECK(purpose IN ('payment_receipt','customer_import','contract_import','site_media')),
 storage_key varchar(255) NOT NULL CHECK(storage_key ~ '^storage:[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$'),
 original_name varchar(180) NOT NULL CHECK(btrim(original_name)<>''), mime_type varchar(100) NOT NULL,
 byte_size bigint NOT NULL CHECK(byte_size BETWEEN 1 AND 52428800), sha256 char(64) NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 scan_status varchar(16) NOT NULL DEFAULT 'quarantined' CHECK(scan_status IN ('quarantined','clean','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),deleted_at timestamptz,
 UNIQUE(organization_id,id),UNIQUE(organization_id,storage_key)
);
COMMENT ON TABLE documents.files IS 'Metadatos privados: objeto en cuarentena por defecto. Descarga exige identidad, propósito autorizado y scan_status clean; no implementa almacenamiento ni antivirus.';
ALTER TABLE billing.payment_receipts ADD COLUMN file_id uuid;
ALTER TABLE billing.payment_receipts ADD CONSTRAINT receipts_file_fk FOREIGN KEY(organization_id,file_id) REFERENCES documents.files(organization_id,id) ON DELETE RESTRICT;
CREATE INDEX receipts_file_fk_idx ON billing.payment_receipts(organization_id,file_id) WHERE file_id IS NOT NULL;

CREATE TABLE cms.sites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
 name varchar(160) NOT NULL CHECK(btrim(name)<>''), public_origin varchar(255), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),deleted_at timestamptz,
 UNIQUE(organization_id,id),CHECK(public_origin IS NULL OR public_origin ~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$')
);
CREATE TABLE cms.revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
 site_id uuid NOT NULL,revision_number bigint NOT NULL CHECK(revision_number>0),
 encrypted_reference varchar(255) NOT NULL CHECK(encrypted_reference ~ '^(storage|vault|kms):[A-Za-z0-9_./:-]+$'),
 content_sha256 char(64) NOT NULL CHECK(content_sha256 ~ '^[a-f0-9]{64}$'),theme_id varchar(80),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),deleted_at timestamptz,
 UNIQUE(organization_id,id),UNIQUE(organization_id,site_id,revision_number),UNIQUE(organization_id,id,site_id),
 FOREIGN KEY(organization_id,site_id) REFERENCES cms.sites(organization_id,id) ON DELETE RESTRICT
);
CREATE TABLE cms.publications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
 site_id uuid NOT NULL,revision_id uuid NOT NULL,environment varchar(16) NOT NULL CHECK(environment IN ('local','staging','production')),
 outcome varchar(16) NOT NULL CHECK(outcome IN ('succeeded','failed')),idempotency_key varchar(120) NOT NULL CHECK(btrim(idempotency_key)<>''),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),deleted_at timestamptz,
 UNIQUE(organization_id,id),UNIQUE(organization_id,idempotency_key),
 FOREIGN KEY(organization_id,site_id) REFERENCES cms.sites(organization_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(organization_id,revision_id,site_id) REFERENCES cms.revisions(organization_id,id,site_id) ON DELETE RESTRICT
);
COMMENT ON TABLE cms.revisions IS 'Modelo de versiones para CMC; conserva solo referencia cifrada y digest. El bridge de archivos existente no se migra automáticamente a esta tabla.';
COMMENT ON TABLE cms.publications IS 'Historial inmutable de publicación. Insertar una fila no publica un sitio ni simula un despliegue.';

DO $new_tables$
DECLARE t record;
BEGIN
 FOR t IN SELECT n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname IN ('documents','cms') LOOP
  EXECUTE format('ALTER TABLE %I.%I OWNER TO comecore_owner',t.nspname,t.relname);
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',t.nspname,t.relname);
  EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',t.nspname,t.relname);
  EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC',t.nspname,t.relname);
  EXECUTE format('GRANT SELECT,INSERT ON %I.%I TO comecore_app',t.nspname,t.relname);
  IF t.relname NOT IN ('revisions','publications') THEN EXECUTE format('GRANT UPDATE ON %I.%I TO comecore_app',t.nspname,t.relname); END IF;
  EXECUTE format('GRANT SELECT ON %I.%I TO comecore_readonly',t.nspname,t.relname);
  EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT TO comecore_app,comecore_readonly USING (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin'']))',t.relname||'_read',t.nspname,t.relname);
  EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin'']))',t.relname||'_insert',t.nspname,t.relname);
  EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin''])) WITH CHECK (app_private.has_org_role(organization_id,ARRAY[''owner'',''admin'']))',t.relname||'_update',t.nspname,t.relname);
  EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION app_private.stamp_erp_record()',t.relname||'_stamp',t.nspname,t.relname);
  EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION app_private.audit_erp_change()',t.relname||'_audit',t.nspname,t.relname);
  EXECUTE format('CREATE INDEX %I ON %I.%I(organization_id,created_at DESC,id)',t.relname||'_org_idx',t.nspname,t.relname);
  EXECUTE format('CREATE INDEX %I ON %I.%I(created_by)',t.relname||'_creator_idx',t.nspname,t.relname);
  EXECUTE format('CREATE INDEX %I ON %I.%I(updated_by)',t.relname||'_updater_idx',t.nspname,t.relname);
 END LOOP;
END $new_tables$;
-- Archivos de comprobantes: lectura/registro por Facturación, sin tocar otros propósitos.
ALTER POLICY files_read ON documents.files USING (app_private.has_org_role(organization_id,ARRAY['owner','admin']) OR (purpose='payment_receipt' AND app_private.has_org_role(organization_id,ARRAY['billing'])));
ALTER POLICY files_insert ON documents.files WITH CHECK (app_private.has_org_role(organization_id,ARRAY['owner','admin']) OR (purpose='payment_receipt' AND scan_status='quarantined' AND app_private.has_org_role(organization_id,ARRAY['billing'])));
CREATE INDEX cms_revisions_site_idx ON cms.revisions(organization_id,site_id);
CREATE INDEX cms_publications_revision_idx ON cms.publications(organization_id,revision_id,site_id);
CREATE INDEX cms_publications_site_idx ON cms.publications(organization_id,site_id);
COMMIT;
