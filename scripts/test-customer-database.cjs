const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const migrationPath = path.join(root, "database/migrations/001_customer_domain.sql");
const seedPath = path.join(root, "database/seeds/001_single_customer.sql");
const adapterPath = path.join(root, "database/supabase/002_supabase_auth_adapter.sql");

const migration = fs.readFileSync(migrationPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");
const adapter = fs.readFileSync(adapterPath, "utf8");

const customerTables = [
  "customers",
  "customer_contacts",
  "customer_addresses",
  "customer_billing_profiles",
  "customer_accounts",
  "customer_assignments",
  "customer_devices",
  "customer_payment_gateways",
];

for (const table of customerTables) {
  assert.match(migration, new RegExp(`CREATE TABLE crm\\.${table} \\(`), `${table} debe existir`);
  assert.match(migration, new RegExp(`'${table}'`), `${table} debe estar incluido en la configuración RLS`);
}

assert.match(migration, /custom_id varchar\(34\) GENERATED ALWAYS AS \('CC' \|\| custom_id_suffix\) STORED/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/g);
assert.match(migration, /FORCE ROW LEVEL SECURITY/g);
assert.match(migration, /REVOKE DELETE ON ALL TABLES IN SCHEMA crm FROM comecore_app/);
assert.match(migration, /SECURITY DEFINER\s+SET search_path = ''/g);
assert.match(migration, /REVOKE ALL ON FUNCTION app_private\.audit_customer_change\(\) FROM PUBLIC/);
assert.match(migration, /changed_fields text\[\]/);
assert.doesNotMatch(migration, /GRANT\s+DELETE\s+ON/i);
assert.doesNotMatch(migration, /PASSWORD\s+['"]/i);
assert.doesNotMatch(migration, /service_role/i);

assert.match(seed, /'0029'/);
assert.match(seed, /'Arturo Santiago Mendoza'/);
assert.equal((seed.match(/INSERT INTO crm\.customers/g) ?? []).length, 1, "la semilla debe contener un solo cliente");

assert.match(adapter, /auth\.uid\(\)/);
assert.doesNotMatch(adapter, /user_metadata/i);
assert.match(adapter, /REVOKE ALL ON ALL TABLES IN SCHEMA iam, crm, audit FROM anon/);

console.log(`Database security contract passed for ${customerTables.length} CRM tables.`);
