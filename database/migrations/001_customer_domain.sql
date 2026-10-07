BEGIN;

-- Rol grupal sin LOGIN. En PostgreSQL administrado puede haberse creado desde
-- el script de DBeaver; en Supabase lo crea la cuenta postgres del proyecto.
DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_app') THEN
    CREATE ROLE comecore_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comecore_readonly') THEN
    CREATE ROLE comecore_readonly NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
END
$roles$;

CREATE SCHEMA IF NOT EXISTS app_private;
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS audit;

REVOKE ALL ON SCHEMA app_private, iam, crm, audit FROM PUBLIC;
GRANT USAGE ON SCHEMA iam, crm, audit TO comecore_app, comecore_readonly;
GRANT USAGE ON SCHEMA app_private TO comecore_app;

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$function$;

CREATE OR REPLACE FUNCTION app_private.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT NULLIF(current_setting('app.organization_id', true), '')::uuid
$function$;

REVOKE ALL ON FUNCTION app_private.current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.current_organization_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO comecore_app;
GRANT EXECUTE ON FUNCTION app_private.current_organization_id() TO comecore_app;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO comecore_readonly;
GRANT EXECUTE ON FUNCTION app_private.current_organization_id() TO comecore_readonly;

CREATE TABLE iam.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL,
  name varchar(160) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_code_format CHECK (code = upper(code) AND code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  CONSTRAINT organizations_status_check CHECK (status IN ('active', 'suspended', 'archived')),
  CONSTRAINT organizations_name_not_blank CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX organizations_code_unique ON iam.organizations (lower(code));

CREATE TABLE iam.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_auth_id uuid UNIQUE,
  email text NOT NULL,
  display_name varchar(160) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_users_email_check CHECK (position('@' IN email) > 1),
  CONSTRAINT app_users_display_name_not_blank CHECK (btrim(display_name) <> ''),
  CONSTRAINT app_users_status_check CHECK (status IN ('active', 'blocked', 'disabled'))
);

CREATE UNIQUE INDEX app_users_email_unique ON iam.app_users (lower(email));

CREATE TABLE iam.organization_memberships (
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES iam.app_users(id) ON DELETE RESTRICT,
  role varchar(20) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id),
  CONSTRAINT organization_memberships_role_check CHECK (role IN ('owner', 'admin', 'billing', 'support', 'viewer')),
  CONSTRAINT organization_memberships_status_check CHECK (status IN ('active', 'invited', 'revoked'))
);

CREATE INDEX organization_memberships_user_active_idx
  ON iam.organization_memberships (user_id, organization_id)
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION app_private.has_org_role(target_organization_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    target_organization_id = app_private.current_organization_id()
    AND EXISTS (
      SELECT 1
      FROM iam.organization_memberships AS membership
      JOIN iam.app_users AS actor ON actor.id = membership.user_id
      JOIN iam.organizations AS organization ON organization.id = membership.organization_id
      WHERE membership.organization_id = target_organization_id
        AND membership.user_id = app_private.current_user_id()
        AND membership.status = 'active'
        AND membership.role = ANY (allowed_roles)
        AND actor.status = 'active'
        AND organization.status = 'active'
    )
$function$;

REVOKE ALL ON FUNCTION app_private.has_org_role(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_org_role(uuid, text[]) TO comecore_app;
GRANT EXECUTE ON FUNCTION app_private.has_org_role(uuid, text[]) TO comecore_readonly;

CREATE TABLE crm.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  custom_id_suffix varchar(32) NOT NULL,
  custom_id varchar(34) GENERATED ALWAYS AS ('CC' || custom_id_suffix) STORED,
  person_type varchar(24) NOT NULL,
  display_name varchar(200) NOT NULL,
  first_name varchar(100),
  middle_name varchar(100),
  first_last_name varchar(100),
  second_last_name varchar(100),
  document_id varchar(80),
  status varchar(20) NOT NULL DEFAULT 'active',
  portal_access_enabled boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT customers_organization_identity UNIQUE (organization_id, id),
  CONSTRAINT customers_custom_id_unique UNIQUE (organization_id, custom_id_suffix),
  CONSTRAINT customers_custom_id_suffix_check CHECK (
    custom_id_suffix = upper(btrim(custom_id_suffix))
    AND custom_id_suffix ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'
  ),
  CONSTRAINT customers_person_type_check CHECK (person_type IN ('individual', 'company', 'other')),
  CONSTRAINT customers_status_check CHECK (status IN ('active', 'inactive', 'blocked')),
  CONSTRAINT customers_display_name_not_blank CHECK (btrim(display_name) <> ''),
  CONSTRAINT customers_version_positive CHECK (version > 0)
);

CREATE UNIQUE INDEX customers_document_unique
  ON crm.customers (organization_id, lower(document_id))
  WHERE document_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX customers_active_list_idx
  ON crm.customers (organization_id, status, created_at DESC, id)
  WHERE deleted_at IS NULL;
CREATE INDEX customers_name_search_idx
  ON crm.customers (organization_id, lower(display_name))
  WHERE deleted_at IS NULL;
CREATE INDEX customers_custom_id_search_idx
  ON crm.customers (organization_id, custom_id)
  WHERE deleted_at IS NULL;

CREATE TABLE crm.customer_contacts (
  customer_id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  email text,
  mobile_phone varchar(32),
  landline_phone varchar(32),
  notify_email boolean NOT NULL DEFAULT true,
  notify_sms boolean NOT NULL DEFAULT false,
  notify_whatsapp boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_contacts_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_contacts_email_check CHECK (email IS NULL OR position('@' IN email) > 1),
  CONSTRAINT customer_contacts_mobile_check CHECK (
    mobile_phone IS NULL OR length(regexp_replace(mobile_phone, '[^0-9]', '', 'g')) BETWEEN 8 AND 15
  )
);

CREATE UNIQUE INDEX customer_contacts_email_unique
  ON crm.customer_contacts (organization_id, lower(email))
  WHERE email IS NOT NULL;
CREATE INDEX customer_contacts_mobile_idx
  ON crm.customer_contacts (organization_id, regexp_replace(mobile_phone, '[^0-9]', '', 'g'))
  WHERE mobile_phone IS NOT NULL;

CREATE TABLE crm.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  address_type varchar(20) NOT NULL DEFAULT 'service',
  is_primary boolean NOT NULL DEFAULT true,
  street varchar(180) NOT NULL DEFAULT '',
  exterior_number varchar(40),
  neighborhood varchar(120) NOT NULL DEFAULT '',
  city varchar(120) NOT NULL DEFAULT '',
  state_region varchar(120) NOT NULL DEFAULT '',
  postal_code varchar(16) NOT NULL DEFAULT '',
  country_code char(2) NOT NULL DEFAULT 'MX',
  latitude numeric(9,6),
  longitude numeric(9,6),
  additional_data text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_addresses_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_addresses_type_check CHECK (address_type IN ('service', 'billing', 'other')),
  CONSTRAINT customer_addresses_country_check CHECK (country_code = upper(country_code)),
  CONSTRAINT customer_addresses_latitude_check CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT customer_addresses_longitude_check CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE UNIQUE INDEX customer_addresses_primary_unique
  ON crm.customer_addresses (organization_id, customer_id, address_type)
  WHERE is_primary;
CREATE INDEX customer_addresses_customer_idx
  ON crm.customer_addresses (organization_id, customer_id);
CREATE INDEX customer_addresses_geo_idx
  ON crm.customer_addresses (organization_id, latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE crm.customer_billing_profiles (
  customer_id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  tax_id varchar(40),
  legal_name varchar(220),
  legal_entity varchar(160),
  tax_regime varchar(160),
  invoice_type varchar(60) NOT NULL DEFAULT 'Comprobante',
  billing_day smallint NOT NULL DEFAULT 1,
  payment_method varchar(100),
  payment_form varchar(100),
  cfdi_use varchar(120),
  inform_after_payment boolean NOT NULL DEFAULT false,
  automatic_status boolean NOT NULL DEFAULT false,
  email_invoice boolean NOT NULL DEFAULT false,
  email_payment boolean NOT NULL DEFAULT false,
  notification_emails text[] NOT NULL DEFAULT ARRAY[]::text[],
  additional_info text NOT NULL DEFAULT '',
  additional_info_2 text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_billing_profiles_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_billing_profiles_day_check CHECK (billing_day BETWEEN 1 AND 31)
);

CREATE UNIQUE INDEX customer_billing_profiles_tax_id_unique
  ON crm.customer_billing_profiles (organization_id, lower(tax_id))
  WHERE tax_id IS NOT NULL AND enabled;

CREATE TABLE crm.customer_accounts (
  customer_id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  account_status varchar(24) NOT NULL DEFAULT 'current',
  balance numeric(14,2) NOT NULL DEFAULT 0,
  available_credit numeric(14,2) NOT NULL DEFAULT 0,
  unpaid_invoices integer NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'MXN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_accounts_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_accounts_status_check CHECK (account_status IN ('current', 'credit', 'debt')),
  CONSTRAINT customer_accounts_credit_check CHECK (available_credit >= 0),
  CONSTRAINT customer_accounts_unpaid_check CHECK (unpaid_invoices >= 0),
  CONSTRAINT customer_accounts_currency_check CHECK (currency = upper(currency))
);

CREATE INDEX customer_accounts_status_idx
  ON crm.customer_accounts (organization_id, account_status, balance);

CREATE TABLE crm.customer_assignments (
  customer_id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  zone_name varchar(120) NOT NULL DEFAULT 'Sin asignar',
  seller_name varchar(160) NOT NULL DEFAULT 'Sin asignar',
  collector_name varchar(160) NOT NULL DEFAULT 'Sin asignar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_assignments_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE
);

CREATE INDEX customer_assignments_zone_idx
  ON crm.customer_assignments (organization_id, lower(zone_name));

CREATE TABLE crm.customer_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  device_name varchar(160) NOT NULL,
  platform varchar(30),
  push_token_ciphertext bytea,
  push_token_fingerprint varchar(64),
  status varchar(20) NOT NULL DEFAULT 'active',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_devices_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_devices_status_check CHECK (status IN ('active', 'revoked')),
  CONSTRAINT customer_devices_name_not_blank CHECK (btrim(device_name) <> '')
);

CREATE UNIQUE INDEX customer_devices_token_unique
  ON crm.customer_devices (organization_id, push_token_fingerprint)
  WHERE push_token_fingerprint IS NOT NULL;
CREATE INDEX customer_devices_customer_idx
  ON crm.customer_devices (organization_id, customer_id, status);

CREATE TABLE crm.customer_payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  provider varchar(40) NOT NULL,
  external_account_reference varchar(180),
  enabled boolean NOT NULL DEFAULT true,
  notify_invoices boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_payment_gateways_customer_fk FOREIGN KEY (organization_id, customer_id)
    REFERENCES crm.customers (organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_payment_gateways_provider_not_blank CHECK (btrim(provider) <> ''),
  CONSTRAINT customer_payment_gateways_provider_unique UNIQUE (organization_id, customer_id, provider)
);

CREATE INDEX customer_payment_gateways_customer_idx
  ON crm.customer_payment_gateways (organization_id, customer_id, enabled);

CREATE TABLE audit.customer_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES crm.customers(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES iam.app_users(id) ON DELETE SET NULL,
  event_type varchar(16) NOT NULL,
  source_table varchar(120) NOT NULL,
  record_id uuid,
  changed_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  request_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT customer_events_type_check CHECK (event_type IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX customer_events_customer_timeline_idx
  ON audit.customer_events (organization_id, customer_id, occurred_at DESC, id DESC);
CREATE INDEX customer_events_actor_idx
  ON audit.customer_events (organization_id, actor_user_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION app_private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION app_private.update_customer_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'La identidad y organización del cliente son inmutables.' USING ERRCODE = '42501';
  END IF;

  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
     AND NOT app_private.has_org_role(OLD.organization_id, ARRAY['owner', 'admin']) THEN
    RAISE EXCEPTION 'Solo owner o admin puede archivar un cliente.' USING ERRCODE = '42501';
  END IF;

  NEW.version := OLD.version + 1;
  NEW.updated_at := clock_timestamp();
  NEW.updated_by := COALESCE(app_private.current_user_id(), NEW.updated_by);
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION app_private.audit_customer_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  before_row jsonb := COALESCE(to_jsonb(OLD), '{}'::jsonb);
  after_row jsonb := COALESCE(to_jsonb(NEW), '{}'::jsonb);
  tenant_id uuid;
  subject_id uuid;
  source_id uuid;
  fields text[];
BEGIN
  tenant_id := COALESCE((after_row ->> 'organization_id')::uuid, (before_row ->> 'organization_id')::uuid);
  subject_id := COALESCE(
    (after_row ->> 'customer_id')::uuid,
    (before_row ->> 'customer_id')::uuid,
    CASE WHEN TG_TABLE_NAME = 'customers' THEN COALESCE((after_row ->> 'id')::uuid, (before_row ->> 'id')::uuid) END
  );
  source_id := COALESCE(
    (after_row ->> 'id')::uuid,
    (before_row ->> 'id')::uuid,
    (after_row ->> 'customer_id')::uuid,
    (before_row ->> 'customer_id')::uuid
  );

  SELECT COALESCE(array_agg(keys.key ORDER BY keys.key), ARRAY[]::text[])
  INTO fields
  FROM (
    SELECT changed_key
    FROM jsonb_object_keys(before_row || after_row) AS changed(changed_key)
    WHERE (before_row -> changed_key) IS DISTINCT FROM (after_row -> changed_key)
      AND changed_key NOT IN ('updated_at', 'version')
  ) AS keys(key);

  INSERT INTO audit.customer_events (
    organization_id, customer_id, actor_user_id, event_type,
    source_table, record_id, changed_fields, request_id
  ) VALUES (
    tenant_id,
    subject_id,
    app_private.current_user_id(),
    TG_OP,
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    source_id,
    fields,
    NULLIF(current_setting('app.request_id', true), '')::uuid
  );

  RETURN COALESCE(NEW, OLD);
END
$function$;

REVOKE ALL ON FUNCTION app_private.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.update_customer_version() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.audit_customer_change() FROM PUBLIC;

CREATE TRIGGER customers_version_before_update
  BEFORE UPDATE ON crm.customers
  FOR EACH ROW EXECUTE FUNCTION app_private.update_customer_version();

DO $triggers$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customer_contacts', 'customer_addresses', 'customer_billing_profiles',
    'customer_accounts', 'customer_assignments', 'customer_devices',
    'customer_payment_gateways'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON crm.%I FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at()',
      table_name || '_updated_at_before_update', table_name
    );
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY[
    'customers', 'customer_contacts', 'customer_addresses',
    'customer_billing_profiles', 'customer_accounts', 'customer_assignments',
    'customer_devices', 'customer_payment_gateways'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON crm.%I FOR EACH ROW EXECUTE FUNCTION app_private.audit_customer_change()',
      table_name || '_audit_after_change', table_name
    );
  END LOOP;
END
$triggers$;

-- Privilegios: el frontend nunca recibe credenciales de estos roles.
REVOKE ALL ON ALL TABLES IN SCHEMA iam, crm, audit FROM PUBLIC;
GRANT SELECT ON iam.organizations, iam.app_users, iam.organization_memberships TO comecore_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA crm TO comecore_app;
REVOKE DELETE ON ALL TABLES IN SCHEMA crm FROM comecore_app;
GRANT SELECT ON audit.customer_events TO comecore_app;
GRANT SELECT ON ALL TABLES IN SCHEMA iam, crm, audit TO comecore_readonly;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO comecore_app;

ALTER TABLE iam.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.customer_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_select ON iam.organizations
  FOR SELECT TO comecore_app, comecore_readonly
  USING (app_private.has_org_role(id, ARRAY['owner', 'admin', 'billing', 'support', 'viewer']));

CREATE POLICY app_users_select_self ON iam.app_users
  FOR SELECT TO comecore_app, comecore_readonly
  USING (id = app_private.current_user_id());

CREATE POLICY memberships_select ON iam.organization_memberships
  FOR SELECT TO comecore_app, comecore_readonly
  USING (
    user_id = app_private.current_user_id()
    OR app_private.has_org_role(organization_id, ARRAY['owner', 'admin'])
  );

CREATE POLICY customer_events_select ON audit.customer_events
  FOR SELECT TO comecore_app, comecore_readonly
  USING (app_private.has_org_role(organization_id, ARRAY['owner', 'admin', 'billing', 'support', 'viewer']));

DO $rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customers', 'customer_contacts', 'customer_addresses',
    'customer_assignments', 'customer_devices'
  ]
  LOOP
    EXECUTE format('ALTER TABLE crm.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''billing'', ''support'', ''viewer'']))',
      table_name || '_select', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''support'']))',
      table_name || '_insert', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''support''])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''support'']))',
      table_name || '_update', table_name
    );
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY[
    'customer_billing_profiles', 'customer_accounts', 'customer_payment_gateways'
  ]
  LOOP
    EXECUTE format('ALTER TABLE crm.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR SELECT TO comecore_app, comecore_readonly USING (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''billing'', ''support'', ''viewer'']))',
      table_name || '_select', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR INSERT TO comecore_app WITH CHECK (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''billing'']))',
      table_name || '_insert', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON crm.%I FOR UPDATE TO comecore_app USING (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''billing''])) WITH CHECK (app_private.has_org_role(organization_id, ARRAY[''owner'', ''admin'', ''billing'']))',
      table_name || '_update', table_name
    );
  END LOOP;
END
$rls$;

-- Fuerza RLS incluso para propietarios de tablas que no sean superusuarios.
ALTER TABLE iam.organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE iam.app_users FORCE ROW LEVEL SECURITY;
ALTER TABLE iam.organization_memberships FORCE ROW LEVEL SECURITY;

DO $force_rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customers', 'customer_contacts', 'customer_addresses',
    'customer_billing_profiles', 'customer_accounts', 'customer_assignments',
    'customer_devices', 'customer_payment_gateways'
  ]
  LOOP
    EXECUTE format('ALTER TABLE crm.%I FORCE ROW LEVEL SECURITY', table_name);
  END LOOP;
END
$force_rls$;

COMMENT ON SCHEMA crm IS 'Dominio de clientes COMECORE, aislado por organización mediante RLS';
COMMENT ON COLUMN crm.customers.custom_id_suffix IS 'Parte editable del identificador; el prefijo CC se genera en la base';
COMMENT ON COLUMN crm.customer_devices.push_token_ciphertext IS 'Token cifrado por el backend con una llave externa a PostgreSQL';
COMMENT ON TABLE audit.customer_events IS 'Bitácora append-only; registra campos modificados, no valores PII';

COMMIT;
