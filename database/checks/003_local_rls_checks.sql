-- Pruebas reales del modelo local después de 001 y 003. Ejecutar como la
-- cuenta administrativa local, con psql -X -v ON_ERROR_STOP=1. Los datos de
-- prueba y todos sus eventos se revierten; no se utilizan usuarios reales.
-- Estas pruebas verifican autorización SQL. El backend todavía debe validar
-- una sesión real antes de establecer app.user_id y app.organization_id.
BEGIN;

DO $structure$
DECLARE
  total integer;
  routine record;
  protected_column text;
BEGIN
  SELECT count(*) INTO total
  FROM pg_class AS relation
  JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
  JOIN pg_roles AS owner ON owner.oid = relation.relowner
  WHERE namespace.nspname IN ('iam', 'crm', 'audit')
    AND (namespace.nspname <> 'audit' OR relation.relname = 'customer_events')
    AND relation.relkind = 'r'
    AND relation.relrowsecurity AND relation.relforcerowsecurity
    AND owner.rolname = 'comecore_owner';
  IF total <> 12 THEN
    RAISE EXCEPTION 'Se esperan 12 tablas de dominio con propietario restringido y FORCE RLS; hay %.', total;
  END IF;

  SELECT count(*) INTO total FROM pg_roles
  WHERE rolname IN ('comecore_runtime', 'comecore_app', 'comecore_readonly', 'comecore_owner')
    AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole
    AND NOT rolreplication AND NOT rolbypassrls;
  IF total <> 4 THEN
    RAISE EXCEPTION 'Un rol de aplicación, lectura o propiedad tiene privilegios elevados.';
  END IF;
  IF NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'comecore_runtime')
     OR (SELECT rolcanlogin FROM pg_roles WHERE rolname = 'comecore_owner') THEN
    RAISE EXCEPTION 'LOGIN debe pertenecer a runtime y no al propietario grupal.';
  END IF;
  SELECT count(*) INTO total FROM pg_roles
  WHERE rolname IN ('comecore_policy', 'comecore_audit_writer')
    AND NOT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb
    AND NOT rolcreaterole AND NOT rolreplication AND rolbypassrls;
  IF total <> 2 THEN
    RAISE EXCEPTION 'Los dos roles internos deben ser NOLOGIN y BYPASSRLS, sin otros privilegios elevados.';
  END IF;
  IF NOT pg_has_role('comecore_runtime', 'comecore_app', 'MEMBER')
     OR pg_has_role('comecore_runtime', 'comecore_policy', 'MEMBER')
     OR pg_has_role('comecore_runtime', 'comecore_audit_writer', 'MEMBER')
     OR pg_has_role('comecore_runtime', 'comecore_owner', 'MEMBER') THEN
    RAISE EXCEPTION 'Las membresías de runtime permiten elevar privilegios o falta el grupo de aplicación.';
  END IF;
  IF pg_has_role('comecore_designer', 'comecore_policy', 'MEMBER')
     OR pg_has_role('comecore_designer', 'comecore_audit_writer', 'MEMBER') THEN
    RAISE EXCEPTION 'La cuenta de diseño no puede asumir roles internos BYPASSRLS.';
  END IF;
  IF has_database_privilege('comecore_runtime', current_database(), 'CREATE') THEN
    RAISE EXCEPTION 'Runtime no debe crear esquemas.';
  END IF;

  IF NOT has_table_privilege('comecore_runtime', 'crm.customers', 'SELECT')
     OR has_table_privilege('comecore_runtime', 'crm.customers', 'DELETE')
     OR has_table_privilege('comecore_runtime', 'iam.organization_memberships', 'INSERT,UPDATE,DELETE')
     OR has_table_privilege('comecore_runtime', 'audit.customer_events', 'INSERT,UPDATE,DELETE') THEN
    RAISE EXCEPTION 'Los privilegios de tablas no cumplen la separación de responsabilidades.';
  END IF;
  FOREACH protected_column IN ARRAY ARRAY['id', 'created_by', 'updated_by', 'created_at', 'updated_at', 'version']
  LOOP
    IF has_column_privilege('comecore_runtime', 'crm.customers', protected_column, 'INSERT')
       OR has_column_privilege('comecore_runtime', 'crm.customers', protected_column, 'UPDATE') THEN
      RAISE EXCEPTION 'Runtime puede asignar o modificar el metadato protegido %.', protected_column;
    END IF;
  END LOOP;
  IF has_column_privilege('comecore_runtime', 'crm.customers', 'organization_id', 'UPDATE')
     OR NOT has_column_privilege('comecore_runtime', 'crm.customers', 'organization_id', 'INSERT')
     OR NOT has_column_privilege('comecore_runtime', 'crm.customers', 'notes', 'UPDATE') THEN
    RAISE EXCEPTION 'Los permisos de columnas no separan identidad de campos de negocio.';
  END IF;
  IF NOT has_schema_privilege('comecore_readonly', 'app_private', 'USAGE')
     OR NOT has_function_privilege('comecore_readonly', 'app_private.has_org_role(uuid,text[])', 'EXECUTE') THEN
    RAISE EXCEPTION 'El rol de lectura no puede resolver las políticas RLS.';
  END IF;
  IF NOT has_table_privilege('comecore_policy', 'iam.organizations', 'SELECT')
     OR NOT has_table_privilege('comecore_policy', 'iam.app_users', 'SELECT')
     OR NOT has_table_privilege('comecore_policy', 'iam.organization_memberships', 'SELECT')
     OR has_table_privilege('comecore_policy', 'iam.organization_memberships', 'INSERT,UPDATE,DELETE')
     OR has_table_privilege('comecore_policy', 'crm.customers', 'SELECT,INSERT,UPDATE,DELETE')
     OR has_table_privilege('comecore_policy', 'audit.customer_events', 'SELECT,INSERT,UPDATE,DELETE') THEN
    RAISE EXCEPTION 'El evaluador de políticas debe limitarse a consultar IAM.';
  END IF;
  IF NOT has_table_privilege('comecore_audit_writer', 'audit.customer_events', 'INSERT')
     OR has_table_privilege('comecore_audit_writer', 'audit.customer_events', 'SELECT,UPDATE,DELETE')
     OR has_table_privilege('comecore_audit_writer', 'iam.app_users', 'SELECT,INSERT,UPDATE,DELETE')
     OR has_table_privilege('comecore_audit_writer', 'crm.customers', 'SELECT,INSERT,UPDATE,DELETE') THEN
    RAISE EXCEPTION 'El escritor de auditoría debe limitarse a agregar eventos.';
  END IF;

  FOR routine IN
    SELECT function.proname, function.prosecdef, function.proconfig,
           owner.rolname,
           EXISTS (
             SELECT 1 FROM aclexplode(COALESCE(function.proacl, acldefault('f', function.proowner))) AS permission
             WHERE permission.grantee = 0 AND permission.privilege_type = 'EXECUTE'
           ) AS public_execute
    FROM pg_proc AS function
    JOIN pg_namespace AS namespace ON namespace.oid = function.pronamespace
    JOIN pg_roles AS owner ON owner.oid = function.proowner
    WHERE namespace.nspname = 'app_private'
      AND function.proname IN ('has_org_role', 'audit_customer_change')
  LOOP
    IF NOT routine.prosecdef
       OR NOT ('search_path=""' = ANY (routine.proconfig))
       OR routine.public_execute
       OR (routine.proname = 'has_org_role' AND routine.rolname <> 'comecore_policy')
       OR (routine.proname = 'audit_customer_change' AND routine.rolname <> 'comecore_audit_writer') THEN
      RAISE EXCEPTION 'La función % no tiene el propietario, search_path o ACL esperado.', routine.proname;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS: propietarios, privilegios, funciones internas y FORCE RLS.';
END
$structure$;

INSERT INTO iam.organizations (id, code, name) VALUES
  ('f5010000-0000-4000-8000-000000000001', 'TEST_RLS_A', 'Organización de prueba A'),
  ('f5010000-0000-4000-8000-000000000002', 'TEST_RLS_B', 'Organización de prueba B');
INSERT INTO iam.app_users (id, email, display_name, status) VALUES
  ('f5020000-0000-4000-8000-000000000001', 'rls-owner-a@example.invalid', 'Prueba owner A', 'active'),
  ('f5020000-0000-4000-8000-000000000002', 'rls-admin@example.invalid', 'Prueba admin', 'active'),
  ('f5020000-0000-4000-8000-000000000003', 'rls-billing@example.invalid', 'Prueba billing', 'active'),
  ('f5020000-0000-4000-8000-000000000004', 'rls-support@example.invalid', 'Prueba support', 'active'),
  ('f5020000-0000-4000-8000-000000000005', 'rls-viewer@example.invalid', 'Prueba viewer', 'active'),
  ('f5020000-0000-4000-8000-000000000006', 'rls-blocked@example.invalid', 'Prueba bloqueada', 'blocked'),
  ('f5020000-0000-4000-8000-000000000007', 'rls-revoked@example.invalid', 'Prueba revocada', 'active'),
  ('f5020000-0000-4000-8000-000000000008', 'rls-owner-b@example.invalid', 'Prueba owner B', 'active');
INSERT INTO iam.organization_memberships (organization_id, user_id, role, status) VALUES
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000001', 'owner', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000002', 'admin', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000003', 'billing', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000004', 'support', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000005', 'viewer', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000006', 'owner', 'active'),
  ('f5010000-0000-4000-8000-000000000001', 'f5020000-0000-4000-8000-000000000007', 'owner', 'revoked'),
  ('f5010000-0000-4000-8000-000000000002', 'f5020000-0000-4000-8000-000000000008', 'owner', 'active');
INSERT INTO crm.customers (id, organization_id, custom_id_suffix, person_type, display_name) VALUES
  ('f5030000-0000-4000-8000-000000000001', 'f5010000-0000-4000-8000-000000000001', 'TEST_RLS_A', 'other', 'Cliente de prueba A'),
  ('f5030000-0000-4000-8000-000000000002', 'f5010000-0000-4000-8000-000000000002', 'TEST_RLS_B', 'other', 'Cliente de prueba B');
INSERT INTO crm.customer_contacts (customer_id, organization_id, email) VALUES
  ('f5030000-0000-4000-8000-000000000001', 'f5010000-0000-4000-8000-000000000001', 'rls-customer-a@example.invalid'),
  ('f5030000-0000-4000-8000-000000000002', 'f5010000-0000-4000-8000-000000000002', 'rls-customer-b@example.invalid');
INSERT INTO crm.customer_accounts (customer_id, organization_id) VALUES
  ('f5030000-0000-4000-8000-000000000001', 'f5010000-0000-4000-8000-000000000001'),
  ('f5030000-0000-4000-8000-000000000002', 'f5010000-0000-4000-8000-000000000002');
INSERT INTO crm.customer_billing_profiles (customer_id, organization_id) VALUES
  ('f5030000-0000-4000-8000-000000000001', 'f5010000-0000-4000-8000-000000000001'),
  ('f5030000-0000-4000-8000-000000000002', 'f5010000-0000-4000-8000-000000000002');

SET LOCAL ROLE comecore_runtime;
DO $without_context$
DECLARE
  relation record;
  visible_rows bigint;
BEGIN
  PERFORM set_config('app.user_id', '', true);
  PERFORM set_config('app.organization_id', '', true);
  PERFORM set_config('app.request_id', '', true);
  FOR relation IN
    SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('iam', 'crm', 'audit')
  LOOP
    EXECUTE format('SELECT count(*) FROM %I.%I', relation.schemaname, relation.tablename) INTO visible_rows;
    IF visible_rows <> 0 THEN
      RAISE EXCEPTION 'Sin contexto se filtraron % filas de %.%.', visible_rows, relation.schemaname, relation.tablename;
    END IF;
  END LOOP;
  BEGIN
    INSERT INTO crm.customers (organization_id, custom_id_suffix, person_type, display_name)
    VALUES ('f5010000-0000-4000-8000-000000000001', 'DENIED_NO_CONTEXT', 'other', 'Prueba denegada');
    RAISE EXCEPTION 'Se permitió INSERT sin contexto.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: ninguna tabla de dominio expone filas ni acepta clientes sin contexto.';
END
$without_context$;

DO $viewer$
DECLARE
  affected bigint;
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000005', true);
  PERFORM set_config('app.organization_id', 'f5010000-0000-4000-8000-000000000001', true);
  IF (SELECT count(*) FROM crm.customers) <> 1
     OR (SELECT count(*) FROM crm.customer_contacts) <> 1
     OR (SELECT count(*) FROM crm.customer_accounts) <> 1
     OR (SELECT count(*) FROM iam.app_users) <> 1
     OR (SELECT count(*) FROM iam.organization_memberships) <> 1
     OR (SELECT count(*) FROM iam.organizations) <> 1 THEN
    RAISE EXCEPTION 'Viewer no tiene una lectura aislada de su organización e identidad.';
  END IF;
  UPDATE crm.customers SET notes = 'Debe denegarse';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Viewer modificó clientes.'; END IF;
  UPDATE crm.customer_accounts SET balance = 999;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Viewer modificó cuentas.'; END IF;
  BEGIN
    INSERT INTO crm.customers (organization_id, custom_id_suffix, person_type, display_name)
    VALUES ('f5010000-0000-4000-8000-000000000001', 'DENIED_VIEWER', 'other', 'Prueba denegada');
    RAISE EXCEPTION 'Viewer creó clientes.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM crm.customers;
    RAISE EXCEPTION 'Runtime obtuvo DELETE.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE iam.organization_memberships SET role = 'owner';
    RAISE EXCEPTION 'Runtime puede elevar roles de IAM.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO audit.customer_events (organization_id, event_type, source_table)
    VALUES ('f5010000-0000-4000-8000-000000000001', 'INSERT', 'evento.manipulado');
    RAISE EXCEPTION 'Runtime puede insertar auditoría directamente.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE audit.customer_events SET source_table = 'evento.manipulado';
    RAISE EXCEPTION 'Runtime puede reescribir auditoría.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM audit.customer_events;
    RAISE EXCEPTION 'Runtime puede eliminar auditoría.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: viewer consulta; IAM, borrados y auditoría directa permanecen restringidos.';
END
$viewer$;

DO $support$
DECLARE
  affected bigint;
  version_before integer;
  event_count integer;
  inserted_customer crm.customers%ROWTYPE;
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000004', true);
  PERFORM set_config('app.request_id', 'f5040000-0000-4000-8000-000000000001', true);
  SELECT version INTO version_before FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000001';
  UPDATE crm.customers SET notes = 'VALOR_PRIVADO_PRUEBA_003'
  WHERE id = 'f5030000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Support no pudo actualizar su cliente.'; END IF;
  IF (SELECT version FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000001') <> version_before + 1 THEN
    RAISE EXCEPTION 'No se incrementó la versión del cliente.';
  END IF;
  SELECT count(*) INTO event_count FROM audit.customer_events AS event
  WHERE event.request_id = 'f5040000-0000-4000-8000-000000000001'
    AND event.actor_user_id = 'f5020000-0000-4000-8000-000000000004'
    AND event.organization_id = 'f5010000-0000-4000-8000-000000000001'
    AND event.customer_id = 'f5030000-0000-4000-8000-000000000001'
    AND event.record_id = 'f5030000-0000-4000-8000-000000000001'
    AND event.source_table = 'crm.customers' AND event.event_type = 'UPDATE'
    AND 'notes' = ANY (event.changed_fields)
    AND to_jsonb(event)::text NOT LIKE '%VALOR_PRIVADO_PRUEBA_003%';
  IF event_count <> 1 THEN
    RAISE EXCEPTION 'La auditoría no enlaza actor, cliente, organización, request_id y campos sin valores privados.';
  END IF;
  INSERT INTO crm.customers (organization_id, custom_id_suffix, person_type, display_name)
  VALUES ('f5010000-0000-4000-8000-000000000001', 'TEST_SUPPORT_NEW', 'other', 'Cliente nuevo de prueba')
  RETURNING * INTO inserted_customer;
  IF inserted_customer.id IS NULL OR inserted_customer.version <> 1
     OR inserted_customer.custom_id <> 'CCTEST_SUPPORT_NEW'
     OR inserted_customer.created_by IS DISTINCT FROM 'f5020000-0000-4000-8000-000000000004'::uuid
     OR inserted_customer.updated_by IS DISTINCT FROM 'f5020000-0000-4000-8000-000000000004'::uuid THEN
    RAISE EXCEPTION 'El alta de cliente no genera identidad, versión y autoría desde los defaults del servidor.';
  END IF;
  BEGIN
    UPDATE crm.customers SET created_by = 'f5020000-0000-4000-8000-000000000001'
    WHERE id = inserted_customer.id;
    RAISE EXCEPTION 'Support cambió el autor protegido del cliente.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  INSERT INTO crm.customer_addresses (id, organization_id, customer_id, street)
  VALUES ('f5030000-0000-4000-8000-000000000005', 'f5010000-0000-4000-8000-000000000001',
          'f5030000-0000-4000-8000-000000000001', 'Calle de prueba');
  UPDATE crm.customer_accounts SET balance = 999;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Support modificó cuentas de facturación.'; END IF;
  BEGIN
    INSERT INTO crm.customer_payment_gateways (organization_id, customer_id, provider)
    VALUES ('f5010000-0000-4000-8000-000000000001', 'f5030000-0000-4000-8000-000000000001', 'denied_support');
    RAISE EXCEPTION 'Support creó una pasarela de facturación.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE crm.customers SET deleted_at = clock_timestamp()
    WHERE id = 'f5030000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Support archivó un cliente.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE crm.customers SET id = 'f5030000-0000-4000-8000-000000000099'
    WHERE id = 'f5030000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'Support cambió la identidad del cliente.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Support consultó un cliente de otra organización.';
  END IF;
  UPDATE crm.customers SET notes = 'Fuga de escritura'
  WHERE id = 'f5030000-0000-4000-8000-000000000002';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Support modificó otra organización.'; END IF;
  BEGIN
    INSERT INTO crm.customers (organization_id, custom_id_suffix, person_type, display_name)
    VALUES ('f5010000-0000-4000-8000-000000000002', 'DENIED_CROSS_ORG', 'other', 'Prueba denegada');
    RAISE EXCEPTION 'Support insertó un cliente en otra organización.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: soporte, versión, auditoría por solicitud y aislamiento de lectura/escritura.';
END
$support$;

DO $billing$
DECLARE
  affected bigint;
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000003', true);
  PERFORM set_config('app.request_id', 'f5040000-0000-4000-8000-000000000002', true);
  UPDATE crm.customer_accounts SET balance = 13.37, account_status = 'debt'
  WHERE customer_id = 'f5030000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Billing no pudo actualizar una cuenta propia.'; END IF;
  UPDATE crm.customer_billing_profiles SET billing_day = 12
  WHERE customer_id = 'f5030000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Billing no pudo actualizar su perfil de facturación.'; END IF;
  INSERT INTO crm.customer_payment_gateways (id, organization_id, customer_id, provider)
  VALUES ('f5030000-0000-4000-8000-000000000006', 'f5010000-0000-4000-8000-000000000001',
          'f5030000-0000-4000-8000-000000000001', 'rls_verification');
  UPDATE crm.customers SET notes = 'Debe denegarse';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Billing modificó el dominio de soporte.'; END IF;
  BEGIN
    INSERT INTO crm.customer_addresses (organization_id, customer_id, address_type)
    VALUES ('f5010000-0000-4000-8000-000000000001', 'f5030000-0000-4000-8000-000000000001', 'other');
    RAISE EXCEPTION 'Billing creó una dirección del dominio de soporte.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM crm.customer_accounts WHERE organization_id = 'f5010000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Billing consultó otra organización.';
  END IF;
  RAISE NOTICE 'PASS: facturación puede modificar sus tres tablas y no modificar soporte.';
END
$billing$;

DO $owner_admin$
DECLARE
  affected bigint;
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000001', true);
  UPDATE crm.customers SET deleted_at = clock_timestamp()
  WHERE id = 'f5030000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 OR NOT EXISTS (
    SELECT 1 FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000001' AND deleted_at IS NOT NULL
  ) THEN RAISE EXCEPTION 'Owner no pudo archivar un cliente propio.'; END IF;
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000002', true);
  UPDATE crm.customers SET deleted_at = NULL
  WHERE id = 'f5030000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Admin no pudo restaurar el cliente propio.'; END IF;
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000008', true);
  PERFORM set_config('app.organization_id', 'f5010000-0000-4000-8000-000000000002', true);
  IF (SELECT count(*) FROM crm.customers) <> 1
     OR NOT EXISTS (SELECT 1 FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Owner B no tiene acceso exclusivo a su organización.';
  END IF;
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000001', true);
  IF EXISTS (SELECT 1 FROM crm.customers) THEN
    RAISE EXCEPTION 'Una identidad sin membresía en B accedió al cambiar el contexto.';
  END IF;
  RAISE NOTICE 'PASS: archivo/restauración por owner/admin y acceso independiente de la segunda organización.';
END
$owner_admin$;

DO $blocked_revoked$
DECLARE
  identity_id text;
  affected bigint;
BEGIN
  PERFORM set_config('app.organization_id', 'f5010000-0000-4000-8000-000000000001', true);
  FOREACH identity_id IN ARRAY ARRAY[
    'f5020000-0000-4000-8000-000000000006',
    'f5020000-0000-4000-8000-000000000007'
  ] LOOP
    PERFORM set_config('app.user_id', identity_id, true);
    IF EXISTS (SELECT 1 FROM crm.customers)
       OR EXISTS (SELECT 1 FROM audit.customer_events)
       OR EXISTS (SELECT 1 FROM iam.organizations) THEN
      RAISE EXCEPTION 'Una identidad bloqueada o revocada conserva acceso al dominio.';
    END IF;
    UPDATE crm.customers SET notes = 'Debe denegarse';
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'Una identidad bloqueada o revocada modificó clientes.'; END IF;
  END LOOP;
  RAISE NOTICE 'PASS: usuario bloqueado y membresía revocada no acceden a los datos de organización.';
END
$blocked_revoked$;

RESET ROLE;
UPDATE iam.organizations SET status = 'suspended' WHERE id = 'f5010000-0000-4000-8000-000000000001';
SET LOCAL ROLE comecore_runtime;
DO $suspended$
DECLARE
  affected bigint;
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000001', true);
  IF EXISTS (SELECT 1 FROM crm.customers)
     OR EXISTS (SELECT 1 FROM audit.customer_events)
     OR EXISTS (SELECT 1 FROM iam.organizations) THEN
    RAISE EXCEPTION 'La organización suspendida conserva acceso al dominio.';
  END IF;
  UPDATE crm.customer_accounts SET balance = 999;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'La organización suspendida modificó facturación.'; END IF;
  RAISE NOTICE 'PASS: una organización suspendida no expone ni modifica sus datos.';
END
$suspended$;
RESET ROLE;
UPDATE iam.organizations SET status = 'active' WHERE id = 'f5010000-0000-4000-8000-000000000001';

SET LOCAL ROLE comecore_readonly;
DO $readonly$
BEGIN
  PERFORM set_config('app.user_id', 'f5020000-0000-4000-8000-000000000005', true);
  IF NOT app_private.has_org_role('f5010000-0000-4000-8000-000000000001', ARRAY['viewer'])
     OR (SELECT count(*) FROM crm.customers WHERE id = 'f5030000-0000-4000-8000-000000000001') <> 1 THEN
    RAISE EXCEPTION 'Readonly no puede ejecutar las políticas y consultar su organización.';
  END IF;
  BEGIN
    UPDATE crm.customers SET notes = 'Debe denegarse';
    RAISE EXCEPTION 'Readonly tiene permiso de escritura.';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: rol de lectura ejecuta RLS y carece de escritura.';
END
$readonly$;

ROLLBACK;

DO $rollback_verification$
BEGIN
  IF EXISTS (SELECT 1 FROM iam.organizations WHERE id IN (
    'f5010000-0000-4000-8000-000000000001', 'f5010000-0000-4000-8000-000000000002'
  )) OR EXISTS (SELECT 1 FROM audit.customer_events WHERE request_id IN (
    'f5040000-0000-4000-8000-000000000001', 'f5040000-0000-4000-8000-000000000002'
  )) THEN
    RAISE EXCEPTION 'Las fixtures o los eventos de prueba persistieron después de ROLLBACK.';
  END IF;
  IF NULLIF(current_setting('app.user_id', true), '') IS NOT NULL
     OR NULLIF(current_setting('app.organization_id', true), '') IS NOT NULL
     OR NULLIF(current_setting('app.request_id', true), '') IS NOT NULL THEN
    RAISE EXCEPTION 'El contexto de SET LOCAL persistió después de ROLLBACK.';
  END IF;
  RAISE NOTICE 'PASS: ROLLBACK eliminó las fixtures, sus eventos y el contexto local.';
END
$rollback_verification$;
