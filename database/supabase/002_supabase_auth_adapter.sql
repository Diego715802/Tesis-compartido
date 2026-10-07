-- OPCIONAL: ejecutar únicamente dentro de un proyecto Supabase, después de
-- 001_customer_domain.sql. Conecta auth.users con iam.app_users y mantiene las
-- mismas políticas RLS. No usa metadatos editables del usuario para autorizar.
BEGIN;

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT app_user.id
  FROM iam.app_users AS app_user
  WHERE app_user.external_auth_id = (SELECT auth.uid())
    AND app_user.status = 'active'
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION app_private.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT membership.organization_id
  FROM iam.organization_memberships AS membership
  WHERE membership.user_id = app_private.current_user_id()
    AND membership.status = 'active'
  ORDER BY membership.created_at
  LIMIT 1
$function$;

REVOKE ALL ON FUNCTION app_private.current_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.current_organization_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.has_org_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO authenticated, comecore_app;
GRANT EXECUTE ON FUNCTION app_private.current_organization_id() TO authenticated, comecore_app;
GRANT EXECUTE ON FUNCTION app_private.has_org_role(uuid, text[]) TO authenticated, comecore_app;

GRANT USAGE ON SCHEMA iam, crm, audit TO authenticated;
GRANT SELECT ON iam.organizations, iam.app_users, iam.organization_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA crm TO authenticated;
GRANT SELECT ON audit.customer_events TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA iam, crm, audit FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA iam, crm, audit FROM anon;

DO $policy_roles$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname IN ('iam', 'crm', 'audit')
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO comecore_app, comecore_readonly, authenticated',
      policy_row.policyname, policy_row.schemaname, policy_row.tablename
    );
  END LOOP;
END
$policy_roles$;

COMMIT;
