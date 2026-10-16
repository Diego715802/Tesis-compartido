-- Preserve audit history without a dangling customer FK during administrative cleanup.
-- Runtime DELETE privileges remain revoked; no RLS or authorization is relaxed.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';

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

  -- A DELETE event must not reference a row that the same statement removes.
  -- record_id retains the historical UUID; updates/soft deletes retain customer_id.
  IF TG_OP = 'DELETE' THEN subject_id := NULL; END IF;

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

ALTER FUNCTION app_private.audit_customer_change() OWNER TO comecore_audit_writer;
REVOKE ALL ON FUNCTION app_private.audit_customer_change() FROM PUBLIC;
COMMIT;
