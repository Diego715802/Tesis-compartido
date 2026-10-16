BEGIN;
SET LOCAL lock_timeout='5s';
-- Un comprobante no puede referenciar un archivo de importación o medios del CMC.
ALTER TABLE documents.files ADD CONSTRAINT files_org_id_purpose_unique UNIQUE(organization_id,id,purpose);
ALTER TABLE billing.payment_receipts ADD COLUMN file_purpose varchar(24) GENERATED ALWAYS AS ('payment_receipt'::varchar) STORED;
ALTER TABLE billing.payment_receipts ADD CONSTRAINT receipt_file_purpose_fk FOREIGN KEY(organization_id,file_id,file_purpose) REFERENCES documents.files(organization_id,id,purpose) ON DELETE RESTRICT;
-- Datos técnicos no se heredan del permiso comercial de leer contratos.
ALTER POLICY contract_connections_read ON service.contract_connections USING(app_private.has_org_role(organization_id,ARRAY['owner','admin','support']));
ALTER POLICY contract_olt_connections_read ON service.contract_olt_connections USING(app_private.has_org_role(organization_id,ARRAY['owner','admin','support']));
ALTER POLICY contract_usage_samples_read ON service.contract_usage_samples USING(app_private.has_org_role(organization_id,ARRAY['owner','admin','support']));
COMMIT;
