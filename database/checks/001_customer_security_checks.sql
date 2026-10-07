-- Ejecutar después de la migración y la semilla. Todas las comprobaciones deben
-- terminar sin excepción. La transacción se revierte para no alterar la semilla.
BEGIN;

SET LOCAL ROLE comecore_app;
SELECT set_config('app.user_id', '20000000-0000-4000-8000-000000000001', true);
SELECT set_config('app.organization_id', '10000000-0000-4000-8000-000000000001', true);
SELECT set_config('app.request_id', '30000000-0000-4000-8000-000000000002', true);

DO $allowed_read$
DECLARE
  visible_customers integer;
BEGIN
  SELECT count(*) INTO visible_customers FROM crm.customers WHERE deleted_at IS NULL;
  IF visible_customers <> 1 THEN
    RAISE EXCEPTION 'RLS válido: se esperaba 1 cliente y se obtuvieron %', visible_customers;
  END IF;
END
$allowed_read$;

DO $version_check$
DECLARE
  version_before integer;
  version_after integer;
  audit_rows integer;
BEGIN
  SELECT version INTO version_before FROM crm.customers WHERE custom_id = 'CC0029';

  UPDATE crm.customers
  SET notes = 'Comprobación transaccional de escritura segura'
  WHERE custom_id = 'CC0029' AND version = version_before;

  SELECT version INTO version_after FROM crm.customers WHERE custom_id = 'CC0029';
  IF version_after <> version_before + 1 THEN
    RAISE EXCEPTION 'Bloqueo optimista inválido: versión anterior %, versión nueva %', version_before, version_after;
  END IF;

  SELECT count(*) INTO audit_rows
  FROM audit.customer_events
  WHERE customer_id = '40000000-0000-4000-8000-000000000029'
    AND event_type = 'UPDATE';
  IF audit_rows < 1 THEN
    RAISE EXCEPTION 'No se generó el evento de auditoría';
  END IF;
END
$version_check$;

-- Cambiar el contexto de organización debe ocultar completamente los datos.
SELECT set_config('app.organization_id', '10000000-0000-4000-8000-000000000099', true);

DO $denied_read$
DECLARE
  leaked_rows integer;
BEGIN
  SELECT count(*) INTO leaked_rows FROM crm.customers;
  IF leaked_rows <> 0 THEN
    RAISE EXCEPTION 'Fuga entre organizaciones: % filas visibles', leaked_rows;
  END IF;
END
$denied_read$;

ROLLBACK;

-- Inspección estructural para DBeaver.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname IN ('iam', 'crm', 'audit')
ORDER BY schemaname, tablename;

SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname IN ('iam', 'crm', 'audit')
ORDER BY schemaname, tablename, indexname;
