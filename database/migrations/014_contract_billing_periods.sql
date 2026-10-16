-- Preserve the billing periods already offered by the ERP form.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE service.contracts DROP CONSTRAINT contracts_frequency_check;
ALTER TABLE service.contracts ADD CONSTRAINT contracts_frequency_check CHECK (frequency IN ('monthly','bimonthly','quarterly','semiannual','weekly','daily','annual','once'));
ALTER TABLE catalog.service_plans DROP CONSTRAINT service_plans_frequency_check;
ALTER TABLE catalog.service_plans ADD CONSTRAINT service_plans_frequency_check CHECK (frequency IN ('monthly','bimonthly','quarterly','semiannual','weekly','daily','annual','once'));
COMMENT ON COLUMN service.contracts.frequency IS 'Mensual=monthly, Bimestral=bimonthly, Trimestral=quarterly, Semestral=semiannual, Anual=annual. No cambia el periodo elegido por el operador.';
COMMIT;
