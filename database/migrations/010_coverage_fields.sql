-- Campos visibles en Detalles Cobertura / SSID y Amplitud del módulo Nodos.
BEGIN;
ALTER TABLE network.node_coverages ADD COLUMN ssid varchar(160), ADD COLUMN amplitude_degrees numeric(6,2) CHECK(amplitude_degrees BETWEEN 0 AND 360), ADD COLUMN asset_id uuid;
ALTER TABLE network.node_coverages ADD CONSTRAINT coverage_asset_fk FOREIGN KEY(organization_id,asset_id) REFERENCES inventory.assets(organization_id,id) ON DELETE RESTRICT;
CREATE INDEX coverages_asset_fk_idx ON network.node_coverages(organization_id,asset_id) WHERE asset_id IS NOT NULL;
COMMENT ON COLUMN network.node_coverages.amplitude_degrees IS 'Apertura declarada de antena; no acredita cobertura geográfica real ni medición radioeléctrica.';
COMMIT;
