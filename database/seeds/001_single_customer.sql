BEGIN;

-- Identificadores fijos solo para que la semilla sea repetible.
SELECT set_config('app.organization_id', '10000000-0000-4000-8000-000000000001', true);
SELECT set_config('app.user_id', '20000000-0000-4000-8000-000000000001', true);
SELECT set_config('app.request_id', '30000000-0000-4000-8000-000000000001', true);

INSERT INTO iam.organizations (id, code, name)
VALUES ('10000000-0000-4000-8000-000000000001', 'COMECORE', 'COMECORE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now();

INSERT INTO iam.app_users (id, email, display_name)
VALUES ('20000000-0000-4000-8000-000000000001', 'administracion@comecore.local', 'Administración COMECORE')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now();

INSERT INTO iam.organization_memberships (organization_id, user_id, role, status)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'owner',
  'active'
)
ON CONFLICT (organization_id, user_id)
DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status, updated_at = now();

INSERT INTO crm.customers (
  id, organization_id, custom_id_suffix, person_type, display_name,
  first_name, first_last_name, second_last_name, document_id,
  status, portal_access_enabled, notes, created_by, updated_by
)
VALUES (
  '40000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  '0029',
  'individual',
  'Arturo Santiago Mendoza',
  'Arturo',
  'Santiago',
  'Mendoza',
  'CURP420029',
  'active',
  true,
  'Prefiere contacto por la tarde. Confirmar antes de una visita técnica.',
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001'
)
ON CONFLICT (organization_id, custom_id_suffix)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  document_id = EXCLUDED.document_id,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_by = EXCLUDED.updated_by;

INSERT INTO crm.customer_contacts (
  customer_id, organization_id, email, mobile_phone, landline_phone,
  notify_email, notify_sms, notify_whatsapp
)
VALUES (
  '40000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  'arturo.santiago.mendoza@correo.mx',
  '+52 722 4100000',
  '722 2100000',
  true,
  false,
  false
)
ON CONFLICT (customer_id) DO UPDATE SET
  email = EXCLUDED.email,
  mobile_phone = EXCLUDED.mobile_phone,
  landline_phone = EXCLUDED.landline_phone,
  notify_email = EXCLUDED.notify_email,
  notify_sms = EXCLUDED.notify_sms,
  notify_whatsapp = EXCLUDED.notify_whatsapp;

INSERT INTO crm.customer_addresses (
  id, organization_id, customer_id, address_type, is_primary,
  street, neighborhood, city, state_region, postal_code,
  latitude, longitude, additional_data
)
VALUES (
  '50000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000029',
  'service',
  true,
  'Av. Tecnológico 410',
  'Centro',
  'Toluca',
  'Estado de México',
  '50000',
  19.282600,
  -99.655700,
  'Portón gris; preguntar por recepción.'
)
ON CONFLICT (id) DO UPDATE SET
  street = EXCLUDED.street,
  neighborhood = EXCLUDED.neighborhood,
  city = EXCLUDED.city,
  state_region = EXCLUDED.state_region,
  postal_code = EXCLUDED.postal_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  additional_data = EXCLUDED.additional_data;

INSERT INTO crm.customer_billing_profiles (
  customer_id, organization_id, enabled, tax_id, legal_name,
  legal_entity, tax_regime, invoice_type, billing_day,
  payment_method, payment_form, cfdi_use, email_invoice, email_payment
)
VALUES (
  '40000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  true,
  'XAXX010101000',
  'Arturo Santiago Mendoza',
  'COMECORE Telecom',
  'Personas físicas con actividad empresarial',
  'Comprobante',
  1,
  'Transferencia electrónica',
  '99 - Por definir',
  'G03 - Gastos en general',
  true,
  false
)
ON CONFLICT (customer_id) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  tax_id = EXCLUDED.tax_id,
  legal_name = EXCLUDED.legal_name,
  legal_entity = EXCLUDED.legal_entity,
  tax_regime = EXCLUDED.tax_regime,
  invoice_type = EXCLUDED.invoice_type,
  billing_day = EXCLUDED.billing_day,
  payment_method = EXCLUDED.payment_method,
  payment_form = EXCLUDED.payment_form,
  cfdi_use = EXCLUDED.cfdi_use,
  email_invoice = EXCLUDED.email_invoice,
  email_payment = EXCLUDED.email_payment;

INSERT INTO crm.customer_accounts (
  customer_id, organization_id, account_status, balance,
  available_credit, unpaid_invoices, currency
)
VALUES (
  '40000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  'current',
  0,
  0,
  0,
  'MXN'
)
ON CONFLICT (customer_id) DO UPDATE SET
  account_status = EXCLUDED.account_status,
  balance = EXCLUDED.balance,
  available_credit = EXCLUDED.available_credit,
  unpaid_invoices = EXCLUDED.unpaid_invoices,
  currency = EXCLUDED.currency;

INSERT INTO crm.customer_assignments (
  customer_id, organization_id, zone_name, seller_name, collector_name
)
VALUES (
  '40000000-0000-4000-8000-000000000029',
  '10000000-0000-4000-8000-000000000001',
  'Norte',
  'Laura Méndez',
  'Caja central'
)
ON CONFLICT (customer_id) DO UPDATE SET
  zone_name = EXCLUDED.zone_name,
  seller_name = EXCLUDED.seller_name,
  collector_name = EXCLUDED.collector_name;

COMMIT;
