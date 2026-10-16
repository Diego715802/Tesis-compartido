-- Pruebas SQL de 007. Ejecutar como administrador local; datos exclusivamente transaccionales.
-- No prueba todavía la persistencia de los formularios del navegador.
BEGIN;
SET LOCAL statement_timeout = '30s';
CREATE FUNCTION pg_temp.assert_erp(condition boolean, message text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF condition IS DISTINCT FROM true THEN RAISE EXCEPTION 'Fallo ERP: %', message; END IF; END $$;
CREATE FUNCTION pg_temp.expect_erp_error(statement text, expected_state text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE statement;
  EXCEPTION WHEN OTHERS THEN
    IF SQLSTATE = expected_state THEN RETURN; END IF;
    RAISE EXCEPTION 'Fallo ERP: se esperaba SQLSTATE %, llegó %', expected_state, SQLSTATE;
  END;
  RAISE EXCEPTION 'Fallo ERP: la operación prohibida fue aceptada';
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.assert_erp(boolean,text), pg_temp.expect_erp_error(text,text) TO comecore_app;

SELECT pg_temp.assert_erp((SELECT count(*) = 37 AND bool_and(c.relrowsecurity AND c.relforcerowsecurity)
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname IN ('catalog','network','inventory','service','billing','support') AND c.relkind='r'), '37 tablas ERP con RLS forzado');
SELECT pg_temp.assert_erp((SELECT relrowsecurity AND relforcerowsecurity FROM pg_class WHERE oid='audit.erp_events'::regclass), 'auditoría ERP con RLS forzado');
SELECT pg_temp.assert_erp((SELECT NOT rolsuper AND NOT rolbypassrls FROM pg_roles WHERE rolname='comecore_runtime'), 'runtime sin bypass/superusuario');
SELECT pg_temp.assert_erp((SELECT p.prosecdef AND r.rolname='comecore_audit_writer' AND NOT r.rolcanlogin AND p.proconfig @> ARRAY['search_path=""']
 FROM pg_proc p JOIN pg_roles r ON r.oid=p.proowner WHERE p.oid='app_private.audit_erp_change()'::regprocedure), 'definer audit limitado');
SELECT pg_temp.assert_erp(NOT has_table_privilege('comecore_runtime','audit.erp_events','INSERT,UPDATE,DELETE'), 'runtime no falsifica auditoría');
SELECT pg_temp.assert_erp(NOT has_table_privilege('comecore_runtime','billing.ledger_entries','UPDATE,DELETE'), 'movimientos financieros append-only');
SELECT pg_temp.assert_erp(NOT has_table_privilege('comecore_runtime','inventory.stock_movements','UPDATE,DELETE'), 'historial de stock append-only');

INSERT INTO iam.organizations(id,code,name) VALUES
 ('73000000-0000-4000-8000-000000000001','ERP_CHECK_A','Organización prueba A'),
 ('73000000-0000-4000-8000-000000000002','ERP_CHECK_B','Organización prueba B');
INSERT INTO iam.app_users(id,email,display_name) VALUES
 ('73100000-0000-4000-8000-000000000001','owner-erp-check@example.invalid','Prueba owner'),
 ('73100000-0000-4000-8000-000000000002','support-erp-check@example.invalid','Prueba support'),
 ('73100000-0000-4000-8000-000000000003','billing-erp-check@example.invalid','Prueba billing'),
 ('73100000-0000-4000-8000-000000000004','viewer-erp-check@example.invalid','Prueba viewer');
INSERT INTO iam.organization_memberships(organization_id,user_id,role) VALUES
 ('73000000-0000-4000-8000-000000000001','73100000-0000-4000-8000-000000000001','owner'),
 ('73000000-0000-4000-8000-000000000002','73100000-0000-4000-8000-000000000001','owner'),
 ('73000000-0000-4000-8000-000000000001','73100000-0000-4000-8000-000000000002','support'),
 ('73000000-0000-4000-8000-000000000001','73100000-0000-4000-8000-000000000003','billing'),
 ('73000000-0000-4000-8000-000000000001','73100000-0000-4000-8000-000000000004','viewer');

SELECT set_config('app.user_id','73100000-0000-4000-8000-000000000001',true);
SELECT set_config('app.organization_id','73000000-0000-4000-8000-000000000001',true);
SELECT set_config('app.request_id','73800000-0000-4000-8000-000000000001',true);
INSERT INTO crm.customers(id,organization_id,custom_id_suffix,person_type,display_name) VALUES
 ('73200000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','ERP_CHECK_1','individual','Prueba cliente 1'),
 ('73200000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001','ERP_CHECK_2','individual','Prueba cliente 2'),
 ('73200000-0000-4000-8000-000000000003','73000000-0000-4000-8000-000000000002','ERP_CHECK_3','individual','Prueba cliente B');
-- La cuenta administrativa prepara solamente la entidad B para probar FK entre organizaciones.
INSERT INTO catalog.service_plans(id,organization_id,name,price) VALUES ('73300000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000002','Plan B',100);
INSERT INTO network.servers(id,organization_id,name,kind,host) VALUES ('73400000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000002','Servidor B','mikrotik','192.0.2.2');
INSERT INTO network.nodes(id,organization_id,code,name) VALUES ('73500000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000002','NODE_CHECK_B','Nodo B');

SET LOCAL ROLE comecore_app;
INSERT INTO catalog.service_plans(id,organization_id,name,price,created_by,created_at,version) VALUES
 ('73300000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','Plan A',100,'73100000-0000-4000-8000-000000000004','2000-01-01',999);
SELECT pg_temp.assert_erp((SELECT created_by='73100000-0000-4000-8000-000000000001' AND created_at=now() AND version=1 FROM catalog.service_plans WHERE id='73300000-0000-4000-8000-000000000001'), 'autoría/version en servidor, no manipulables');
INSERT INTO network.servers(id,organization_id,name,kind,host) VALUES ('73400000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','Servidor A','mikrotik','192.0.2.1');
INSERT INTO network.server_interfaces(id,organization_id,server_id,name) VALUES ('73600000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','73400000-0000-4000-8000-000000000001','ether1');
INSERT INTO network.nodes(id,organization_id,code,name) VALUES ('73500000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','NODE_CHECK_A','Nodo A');
INSERT INTO billing.legal_entities(id,organization_id,name) VALUES ('73700000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','Entidad A');
INSERT INTO service.contracts(id,organization_id,customer_id,plan_id,server_id,node_id,serial_number,starts_on,price) VALUES
 ('73800000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','73300000-0000-4000-8000-000000000001','73400000-0000-4000-8000-000000000001','73500000-0000-4000-8000-000000000001','CTR_CHECK_1','2026-10-11',100),
 ('73800000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000002','73300000-0000-4000-8000-000000000001','73400000-0000-4000-8000-000000000001','73500000-0000-4000-8000-000000000001','CTR_CHECK_2','2026-10-11',100);
INSERT INTO service.contract_connections(organization_id,contract_id,server_id,interface_id,access_mode,ip_address,netmask) VALUES
 ('73000000-0000-4000-8000-000000000001','73800000-0000-4000-8000-000000000001','73400000-0000-4000-8000-000000000001','73600000-0000-4000-8000-000000000001','static','192.0.2.10','255.255.255.0');
INSERT INTO billing.invoices(id,organization_id,customer_id,contract_id,legal_entity_id,invoice_number,amount,balance,due_on,concept) VALUES
 ('73900000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','73800000-0000-4000-8000-000000000001','73700000-0000-4000-8000-000000000001','INV_CHECK_1',100,100,'2026-10-20','Servicio prueba'),
 ('73900000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000002','73800000-0000-4000-8000-000000000002','73700000-0000-4000-8000-000000000001','INV_CHECK_2',100,100,'2026-10-20','Servicio prueba 2');
INSERT INTO billing.payments(id,organization_id,customer_id,payment_number,paid_at,amount,method) VALUES
 ('74000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','PAY_CHECK_1',now(),100,'cash');
INSERT INTO billing.payment_allocations(organization_id,payment_id,invoice_id,customer_id,currency,amount) VALUES
 ('73000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001','73900000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','MXN',100);
SELECT pg_temp.assert_erp((SELECT count(*)>0 FROM audit.erp_events WHERE request_id='73800000-0000-4000-8000-000000000001' AND source_table='service.contracts'), 'auditoría ligada a solicitud');
SELECT pg_temp.assert_erp((SELECT count(*)=0 FROM audit.erp_events WHERE source_table='network.servers' AND changed_fields && ARRAY['credential_reference']), 'audit no expone referencias a secretos');
SELECT pg_temp.assert_erp((SELECT count(*)=0 FROM catalog.service_plans WHERE id='73300000-0000-4000-8000-000000000002'), 'consulta manual no ve otra organización aunque owner pertenezca a ambas');
SELECT pg_temp.expect_erp_error($q$INSERT INTO service.contracts(organization_id,customer_id,plan_id,server_id,node_id,serial_number,starts_on) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','73300000-0000-4000-8000-000000000002','73400000-0000-4000-8000-000000000001','73500000-0000-4000-8000-000000000001','INVALID_CROSS_ORG','2026-10-11')$q$,'23503');
SELECT pg_temp.expect_erp_error($q$INSERT INTO billing.payment_allocations(organization_id,payment_id,invoice_id,customer_id,currency,amount) VALUES ('73000000-0000-4000-8000-000000000001','74000000-0000-4000-8000-000000000001','73900000-0000-4000-8000-000000000002','73200000-0000-4000-8000-000000000001','MXN',1)$q$,'23503');
SELECT pg_temp.expect_erp_error($q$INSERT INTO service.contract_connections(organization_id,contract_id,server_id,interface_id,access_mode,ip_address,netmask) VALUES ('73000000-0000-4000-8000-000000000001','73800000-0000-4000-8000-000000000002','73400000-0000-4000-8000-000000000001','73600000-0000-4000-8000-000000000001','static','192.0.2.10','255.255.255.0')$q$,'23505');
SELECT pg_temp.expect_erp_error($q$UPDATE service.contracts SET customer_id='73200000-0000-4000-8000-000000000002' WHERE id='73800000-0000-4000-8000-000000000001'$q$,'22023');
SELECT pg_temp.expect_erp_error($q$UPDATE catalog.service_plans SET organization_id='73000000-0000-4000-8000-000000000002' WHERE id='73300000-0000-4000-8000-000000000001'$q$,'22023');
SELECT pg_temp.expect_erp_error($q$INSERT INTO network.servers(organization_id,name,kind,host,credential_reference) VALUES ('73000000-0000-4000-8000-000000000001','Servidor inválido','mikrotik','192.0.2.3','contraseña-no-permitida')$q$,'23514');
SELECT pg_temp.assert_erp(app_private.erp_valid_vlans(ARRAY[1,101,4094]) AND NOT app_private.erp_valid_vlans(ARRAY[0,4095]) AND NOT app_private.erp_valid_vlans(ARRAY[NULL::integer]), 'VLAN válidas 1..4094 sin nulos');

-- Contexto ausente: ningún dominio ofrece registros por un SELECT sin filtros.
SELECT set_config('app.user_id','',true), set_config('app.organization_id','',true);
DO $check$ DECLARE item record; rows_found bigint;
BEGIN FOR item IN SELECT n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname IN ('catalog','network','inventory','service','billing','support') LOOP
 EXECUTE format('SELECT count(*) FROM %I.%I',item.nspname,item.relname) INTO rows_found;
 PERFORM pg_temp.assert_erp(rows_found=0,'sin contexto: '||item.nspname||'.'||item.relname);
END LOOP; END $check$;
SELECT set_config('app.organization_id','73000000-0000-4000-8000-000000000001',true);

-- Soporte opera servicio; no modifica condiciones financieras, catálogo o servidores.
SELECT set_config('app.user_id','73100000-0000-4000-8000-000000000002',true);
UPDATE service.contracts SET notes='Nota operativa verificada' WHERE id='73800000-0000-4000-8000-000000000001';
SELECT pg_temp.assert_erp((SELECT notes='Nota operativa verificada' AND updated_by='73100000-0000-4000-8000-000000000002' AND version=2 FROM service.contracts WHERE id='73800000-0000-4000-8000-000000000001'),'support actualiza notas legítimas');
SELECT pg_temp.expect_erp_error($q$UPDATE service.contracts SET price=1 WHERE id='73800000-0000-4000-8000-000000000001'$q$,'42501');
SELECT pg_temp.expect_erp_error($q$INSERT INTO catalog.service_plans(organization_id,name) VALUES ('73000000-0000-4000-8000-000000000001','Plan de soporte prohibido')$q$,'42501');
SELECT pg_temp.expect_erp_error($q$INSERT INTO network.servers(organization_id,name,kind,host) VALUES ('73000000-0000-4000-8000-000000000001','Servidor soporte prohibido','bmu','192.0.2.4')$q$,'42501');
SELECT pg_temp.expect_erp_error($q$INSERT INTO billing.payments(organization_id,customer_id,payment_number,paid_at,amount,method) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','PAY_SUPPORT_FORBIDDEN',now(),1,'cash')$q$,'42501');
INSERT INTO support.tickets(organization_id,customer_id,contract_id,ticket_number,title,category) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','73800000-0000-4000-8000-000000000001','TKT_CHECK_1','Ticket legítimo','Soporte técnico');
SELECT pg_temp.expect_erp_error($q$INSERT INTO support.tickets(organization_id,customer_id,contract_id,ticket_number,title,category) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000002','73800000-0000-4000-8000-000000000001','TKT_BAD_LINK','Ticket inválido','Soporte técnico')$q$,'23503');

-- Facturación cambia precio autorizado, pero no controla red/servicio.
SELECT set_config('app.user_id','73100000-0000-4000-8000-000000000003',true);
UPDATE service.contracts SET price=120 WHERE id='73800000-0000-4000-8000-000000000001';
SELECT pg_temp.assert_erp((SELECT price=120 FROM service.contracts WHERE id='73800000-0000-4000-8000-000000000001'),'billing actualiza precio legítimo');
SELECT pg_temp.expect_erp_error($q$UPDATE service.contracts SET status='disabled' WHERE id='73800000-0000-4000-8000-000000000001'$q$,'42501');
INSERT INTO billing.ledger_entries(organization_id,customer_id,entry_type,amount,concept,idempotency_key) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','charge',120,'Cargo verificado','ERP_LEDGER_CHECK');
SELECT pg_temp.expect_erp_error($q$INSERT INTO billing.ledger_entries(organization_id,customer_id,entry_type,amount,concept,idempotency_key) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','charge',120,'Duplicado','ERP_LEDGER_CHECK')$q$,'23505');
SELECT pg_temp.expect_erp_error($q$UPDATE billing.ledger_entries SET amount=0 WHERE idempotency_key='ERP_LEDGER_CHECK'$q$,'42501');
SELECT pg_temp.expect_erp_error($q$INSERT INTO audit.erp_events(organization_id,source_table,record_id,event_type) VALUES ('73000000-0000-4000-8000-000000000001','fake','73800000-0000-4000-8000-000000000001','INSERT')$q$,'42501');

-- Viewer lee su organización y no realiza mutaciones.
SELECT set_config('app.user_id','73100000-0000-4000-8000-000000000004',true);
SELECT pg_temp.assert_erp((SELECT count(*)=2 FROM service.contracts WHERE organization_id='73000000-0000-4000-8000-000000000001'),'viewer ve contratos permitidos');
SELECT pg_temp.expect_erp_error($q$INSERT INTO support.tickets(organization_id,customer_id,contract_id,ticket_number,title,category) VALUES ('73000000-0000-4000-8000-000000000001','73200000-0000-4000-8000-000000000001','73800000-0000-4000-8000-000000000001','TKT_VIEWER_FORBIDDEN','Ticket prohibido','Soporte técnico')$q$,'42501');
WITH mutated AS (UPDATE service.contracts SET notes='No permitido' WHERE id='73800000-0000-4000-8000-000000000001' RETURNING id) SELECT pg_temp.assert_erp((SELECT count(*)=0 FROM mutated),'viewer no actualiza ni siquiera por SQL manual');

RESET ROLE;
UPDATE iam.organization_memberships SET status='revoked' WHERE organization_id='73000000-0000-4000-8000-000000000001' AND user_id='73100000-0000-4000-8000-000000000004';
SET LOCAL ROLE comecore_app;
SELECT pg_temp.assert_erp((SELECT count(*)=0 FROM service.contracts),'membresía revocada pierde lectura');
RESET ROLE;
ROLLBACK;
\echo 'Checks 007: RLS, FK compuestos, aislamiento, privilegios, autoría, auditoría e idempotencia verificados; fixtures revertidos.'
