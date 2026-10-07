const nativeAssert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const repository = path.resolve(__dirname, "..");
const features = path.join(repository, "apps/frontend/src/features");
const modules = new Map();
let assertions = 0;
let currentSection = "";
const assert = Object.fromEntries(["equal", "deepEqual", "ok", "throws", "match"].map((method) => [method, (...args) => {
  nativeAssert[method](...args);
  assertions += 1;
}]));

function load(relativePath) {
  const file = path.isAbsolute(relativePath) ? relativePath : path.join(features, relativePath);
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} };
  modules.set(file, module);
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = (name) => name.startsWith(".") ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name);
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(localRequire, module, module.exports);
  return module.exports;
}

function section(name, run) {
  currentSection = name;
  const before = assertions;
  run();
  console.log(`${name}: ${assertions - before} assertions passed.`);
}

function freeze(value) {
  Object.freeze(value);
  Object.values(value).forEach((item) => {
    if (item && typeof item === "object" && !Object.isFrozen(item)) freeze(item);
  });
  return value;
}

const model = load("contratos/contract-model.ts");
const mutations = load("contratos/contract-mutations.ts");
const form = load("contratos/contract-form-data.ts");
const { demoCustomers } = load("clientes/customer-data.ts");
const seedCustomer = structuredClone(demoCustomers[0]);
const testNames = [
  "Arturo Santiago Mendoza",
  "Contacto de prueba",
  "José de Jesús Vargas",
  "Prueba cuatro",
  "Prueba cinco",
  "Prueba seis",
  "Prueba siete",
  "Prueba ocho",
];
const customers = freeze(testNames.map((name, index) => {
  const customer = structuredClone(seedCustomer);
  const sequence = 29 + index;
  customer.id = `CUS-TEST-${sequence}`;
  customer.customId = `CC${String(sequence).padStart(4, "0")}`;
  customer.name = name;
  customer.createdAt = `2026-${String(index + 1).padStart(2, "0")}-01`;
  customer.contact.mobile = index < 2 ? "+52 722 4100000" : `+52 722 42000${index}`;
  customer.account.status = index === 2 ? "Con deuda" : "Al corriente";
  customer.account.balance = index === 2 ? 749 : 0;
  customer.contracts = customer.contracts.slice(0, 1).map((contract) => ({
    ...contract,
    id: `CTR-TEST-SEED-${sequence}`,
    plan: index % 2 === 0 ? "Fibra 100" : "Fibra 200",
    status: model.statuses[index % model.statuses.length],
    accessMode: index % 3 === 0 ? "PPPoE" : index % 3 === 1 ? "Estática" : "DHCP",
    ipAddress: `192.0.2.${20 + index}`,
  }));
  return customer;
}));
const rows = model.flattenContracts(customers);
const rule = (field, operator, value = "") => ({ id: `${field}-${operator}`, field, operator, value });
const group = (logic, rules) => ({ id: "test-group", logic, rules });
const filter = (rules, logic = "and") => model.filterContracts(rows, "", group(logic, rules));

try {
  section("Contract model", () => {
    assert.equal(demoCustomers.length, 1);
    assert.equal(rows.length, customers.reduce((total, customer) => total + customer.contracts.length, 0));
    assert.equal(new Set(rows.map((row) => row.key)).size, rows.length);
    assert.equal(rows[0].customer, customers[0]);
    assert.equal(rows[0].contract, customers[0].contracts[0]);
    assert.equal(rows[0].key, `${customers[0].id}/${customers[0].contracts[0].id}`);
    assert.equal(model.contractSerial(rows[0].contract), rows[0].contract.id);
    assert.equal(model.contractSerial({ ...rows[0].contract, serialNumber: "SER-2026" }), "SER-2026");
    assert.equal(model.formatContractDate("2026-10-02"), "02/10/2026");
    assert.equal(model.formatContractDate("2026-10-02T12:00:00Z"), "02/10/2026");
    assert.equal(model.formatContractDate(""), "-");
    assert.equal(model.contractDate({ ...rows[0], contract: { ...rows[0].contract, startsAt: "2026-10-02T12:00:00Z" } }), "2026-10-02");
    assert.equal(model.contractDate({ ...rows[0], contract: { ...rows[0].contract, createdAt: "2026-09-01", startsAt: "2026-10-02" } }), "2026-09-01");
    assert.equal(model.contractDate(rows[0]), rows[0].customer.createdAt);
    assert.equal(model.normalizeText("  JOSÉ  "), "jose");
    assert.equal(model.filterContracts(rows, "jose de jesus", model.emptyFilterGroup(), "name").length, 1);
    assert.equal(model.filterContracts(rows, "7224100000", model.emptyFilterGroup(), "phone").length, 2);
    assert.equal(model.filterContracts(rows, rows[0].contract.ipAddress, model.emptyFilterGroup(), "ip")[0].key, rows[0].key);
    assert.equal(model.filterContracts(rows, rows[0].contract.id.toLowerCase(), model.emptyFilterGroup(), "serial").length, 1);
    const andResult = filter([rule("status", "eq", "Habilitado"), rule("plan", "eq", "Fibra 100")]);
    assert.ok(andResult.length > 0);
    assert.ok(andResult.every((row) => row.contract.status === "Habilitado" && row.contract.plan === "Fibra 100"));
    const nested = group("and", [rule("plan", "eq", "Fibra 100"), group("or", [rule("name", "contains", "Arturo"), rule("customerDebt", "eq", "true")])]);
    assert.equal(model.filterContracts(rows, "", nested).length, rows.filter((row) => row.contract.plan === "Fibra 100" && (row.customer.name.includes("Arturo") || row.customer.account.balance > 0)).length);
    assert.equal(model.ruleCount(nested), 3);
    assert.equal(model.filterContracts(rows, "", group("or", [group("and", []), rule("name", "contains", "unknown customer")])).length, 0);
    assert.equal(model.filterContracts(rows, "", group("or", [])).length, rows.length);
    assert.equal(model.ruleCount(group("and", [rule("plan", "eq", ""), rule("onuSerial", "empty")])), 1);
    assert.equal(filter([rule("balance", "eq", "0.0")]).length, rows.filter((row) => row.customer.account.balance === 0).length);
    assert.equal(filter([rule("balance", "neq", "0.0")]).length, rows.filter((row) => row.customer.account.balance !== 0).length);
    assert.ok(filter([rule("balance", "gte", "749")]).every((row) => row.customer.account.balance >= 749));
    assert.equal(filter([rule("balance", "gte", "not-a-number")]).length, 0);
    const dates = filter([rule("createdAt", "gte", "2026-06-01"), rule("createdAt", "lte", "2026-08-31")]);
    assert.ok(dates.length > 0);
    assert.ok(dates.every((row) => row.customer.createdAt >= "2026-06-01" && row.customer.createdAt <= "2026-08-31"));
    assert.equal(filter([rule("pppoe", "eq", "true")]).length, rows.filter((row) => row.contract.accessMode === "PPPoE").length);
    assert.equal(filter([rule("dhcp", "eq", "true")]).length, rows.filter((row) => row.contract.accessMode === "DHCP").length);
    assert.equal(filter([rule("onuSerial", "empty")]).length, rows.length);
    assert.equal(filter([rule("onuSerial", "notEmpty")]).length, 0);
    const discountRow = { ...rows[0], contract: { ...rows[0].contract, discounts: [{ id: "D1", name: "Cliente frecuente", amount: 10, type: "Porcentaje" }] } };
    assert.equal(model.filterContracts([discountRow], "", group("and", [rule("discount", "contains", "frecuente")])).length, 1);
    assert.equal(model.filterContracts([discountRow], "", group("and", [rule("discount", "neq", "Cliente frecuente")])).length, 0);
    assert.ok(model.customerAddress(customers[0]).includes(customers[0].address.city));
    assert.ok(model.contractFieldValues(rows, "plan").includes("Fibra 100"));
    assert.deepEqual(model.contractFieldValues(rows, "status"), model.statuses);
    assert.deepEqual(model.contractFieldValues(rows, "pppoe"), ["true", "false"]);
    const exportedCustomers = structuredClone(customers);
    exportedCustomers[0].name = 'Ana "SUM"\nSecond line';
    exportedCustomers[0].contracts[0].plan = "@SUM(1+1)";
    exportedCustomers[0].contracts[0].username = "=USER()";
    exportedCustomers[0].contracts[0].password = "private-secret-test";
    exportedCustomers[0].contracts[0].wifiPassword = "wifi-secret-test";
    const exportRows = model.flattenContracts(exportedCustomers);
    const csv = model.exportContractsCsv(exportRows);
    assert.ok(csv.includes('"Ana ""SUM""\nSecond line"'));
    assert.ok(csv.includes('"\'@SUM(1+1)"'));
    assert.ok(csv.includes('"\'=USER()"'));
    assert.ok(!csv.includes("private-secret-test") && !csv.includes("wifi-secret-test"));
    assert.equal(model.filterContracts(exportRows, "private-secret-test", model.emptyFilterGroup()).length, 0);
  });

  section("Manual contract states", () => {
    const first = rows[0];
    let current = customers;
    for (const status of ["Degradado", "Habilitado", "Alertado", "Habilitado", "Deshabilitado", "Habilitado"]) {
      current = mutations.updateContracts(current, [{ key: first.key, changes: { status } }], "Estado manual");
      const updated = model.flattenContracts(current).find((row) => row.key === first.key);
      assert.equal(updated.contract.status, status);
      assert.equal(updated.contract.invoices, first.contract.invoices);
      assert.equal(updated.contract.tickets, first.contract.tickets);
      assert.equal(updated.customer.account, first.customer.account);
      assert.equal(updated.customer.contact, first.customer.contact);
      assert.equal(updated.customer.contracts.length, first.customer.contracts.length);
      assert.ok(rows.filter((row) => row.key !== first.key).every((row) => model.flattenContracts(current).find((item) => item.key === row.key).contract === row.contract));
      assert.equal(updated.contract.audit[0].action, "Estado manual");
    }
    const degraded = mutations.updateContracts(customers, [{ key: first.key, changes: { status: "Degradado" } }]);
    const created = mutations.saveContract(degraded, first.customer.id, { ...first.contract, id: "CTR-REACTIVATE-TEST", serialNumber: "SER-REACTIVATE-TEST", ipAddress: "192.0.2.99", status: "Habilitado" });
    assert.equal(created.find((customer) => customer.id === first.customer.id).contracts.at(-1).status, "Habilitado");
    assert.equal(created.find((customer) => customer.id === first.customer.id).contracts[0].status, "Degradado");
    assert.equal(created.find((customer) => customer.id === first.customer.id).contracts.length, first.customer.contracts.length + 1);
  });

  section("Contract mutations", () => {
    const base = freeze(customers.slice(0, 2));
    const original = JSON.stringify(base);
    const first = model.flattenContracts(base)[0];
    const fresh = { ...first.contract, id: "CTR-TEST-1", serialNumber: "SER-TEST-1", ipAddress: "192.0.2.70", password: "never-log-me", audit: [] };
    assert.throws(() => mutations.saveContract(base, "UNREGISTERED", fresh), /registrado/);
    let created = mutations.saveContract(base, base[0].id, fresh);
    assert.equal(created[0].contracts.length, base[0].contracts.length + 1);
    assert.equal(created[1], base[1]);
    assert.equal(created[0].audit[0].action, "Contrato creado");
    assert.equal(created[0].contracts.at(-1).audit[0].actor, "Usuario local");
    assert.ok(!JSON.stringify(created[0].audit[0]).includes("never-log-me"));
    assert.match(created[0].audit[0].date, /^\d{4}-\d{2}-\d{2}T/);
    created = mutations.saveContract(created, base[0].id, { ...fresh, id: "CTR-TEST-2", serialNumber: "SER-TEST-2", ipAddress: "192.0.2.71" });
    assert.equal(created[0].contracts.length, base[0].contracts.length + 2);
    assert.throws(() => mutations.saveContract(base, base[1].id, { ...fresh, id: first.contract.id }), /identificador/);
    assert.throws(() => mutations.saveContract(base, base[1].id, { ...fresh, serialNumber: first.contract.id.toLowerCase() }), /serie/);
    assert.throws(() => mutations.saveContract(base, base[0].id, first.contract, "missing/key"), /ya no existe/);
    assert.throws(() => mutations.saveContract(base, base[1].id, first.contract, first.key), /reasignar/);
    assert.throws(() => mutations.saveContract(base, base[0].id, fresh, first.key), /identificador/);
    const edited = mutations.saveContract(base, base[0].id, { ...first.contract, plan: "Updated plan", invoices: [], tickets: [], downstreamGb: 0, password: "top-secret" }, first.key);
    assert.equal(edited[0].contracts[0].plan, "Updated plan");
    assert.equal(edited[0].contracts[0].invoices, first.contract.invoices);
    assert.equal(edited[0].contracts[0].tickets, first.contract.tickets);
    assert.equal(edited[0].contracts[0].downstreamGb, first.contract.downstreamGb);
    assert.equal(edited[0].contracts[0].audit[0].action, "Contrato actualizado");
    const updated = mutations.updateContracts(base, [{ key: first.key, changes: { status: "Deshabilitado", password: "do-not-show", wifiPassword: "wifi-secret" } }], "Estado actualizado");
    assert.equal(updated[0].contracts[0].status, "Deshabilitado");
    assert.equal(updated[0].contracts[0].invoices, first.contract.invoices);
    assert.equal(updated[0].contracts[0].items, first.contract.items);
    assert.ok(!JSON.stringify(updated[0].audit[0]).includes("do-not-show") && !JSON.stringify(updated[0].audit[0]).includes("wifi-secret"));
    assert.throws(() => mutations.updateContracts(base, [{ key: first.key, changes: { status: "Habilitado" } }, { key: "missing/key", changes: { status: "Deshabilitado" } }]), /ya no existe/);
    assert.throws(() => mutations.updateContracts(base, [{ key: first.key, changes: { id: "new-id" } }]), /identidad/);
    assert.throws(() => mutations.updateContracts(base, [{ key: first.key, changes: { serialNumber: "new-serial" } }]), /identidad/);
    assert.throws(() => mutations.updateContracts(base, [{ key: first.key, changes: { customerId: base[1].id } }]), /cliente/);
    assert.throws(() => mutations.updateContracts(base, [{ key: first.key, changes: { status: "INVALID" } }]), /estado/);
    assert.equal(mutations.updateContracts(base, []), base);
    const deleted = mutations.deleteContract(base, first.key);
    assert.equal(deleted[0].contracts.length, base[0].contracts.length - 1);
    assert.equal(deleted[0].audit[0].action, "Contrato eliminado");
    assert.equal(deleted[1], base[1]);
    const concurrent = deleted.map((customer, index) => index === 0 ? { ...customer, name: "Updated client", contact: { ...customer.contact, mobile: "Updated phone" } } : customer);
    const restored = mutations.restoreContract(concurrent, first);
    assert.equal(restored[0].name, "Updated client");
    assert.equal(restored[0].contact.mobile, "Updated phone");
    assert.equal(restored[0].contracts.length, base[0].contracts.length);
    assert.equal(restored[0].contracts.at(-1).invoices, first.contract.invoices);
    assert.equal(restored[0].audit[0].action, "Contrato restaurado");
    assert.equal(restored[0].audit[1].action, "Contrato eliminado");
    assert.throws(() => mutations.restoreContract(base, first), /identificador/);
    assert.throws(() => mutations.restoreContract(concurrent, { ...first, key: "mismatch/key" }), /referencia/);
    assert.throws(() => mutations.restoreContract([], first), /registrado/);
    assert.equal(JSON.stringify(base), original);
    const connectionBase = freeze(base.map((customer, customerIndex) => ({ ...customer, contracts: customer.contracts.map((contract, index) => ({ ...contract, server: customerIndex === 0 ? "Origin" : "Destination", accessMode: "PPPoE", ipAddress: customerIndex === 0 && index === 0 || customerIndex === 1 ? "192.0.2.60" : contract.ipAddress, username: customerIndex === 0 && index === 0 || customerIndex === 1 ? "collision-user" : `other-${contract.id}` })) })));
    const connectionBefore = JSON.stringify(connectionBase);
    const ownerKey = `${connectionBase[0].id}/${connectionBase[0].contracts[0].id}`;
    const destinationKey = `${connectionBase[1].id}/${connectionBase[1].contracts[0].id}`;
    assert.throws(() => mutations.updateContracts(connectionBase, [{ key: ownerKey, changes: { server: "Destination" } }]), /IP/);
    assert.throws(() => mutations.updateContracts(connectionBase, [{ key: ownerKey, changes: { server: "Destination", ipAddress: "192.0.2.61" } }]), /PPPoE/);
    assert.throws(() => mutations.saveContract(connectionBase, connectionBase[0].id, { ...fresh, server: "Destination", ipAddress: "192.0.2.60", username: "unique-user" }), /IP/);
    assert.throws(() => mutations.saveContract(connectionBase, connectionBase[0].id, { ...fresh, server: "Destination", ipAddress: "192.0.2.62", username: "collision-user" }), /PPPoE/);
    assert.throws(() => mutations.saveContract(connectionBase, connectionBase[0].id, { ...connectionBase[0].contracts[0], server: "Destination" }, ownerKey), /IP/);
    const moved = mutations.updateContracts(connectionBase, [{ key: ownerKey, changes: { server: "Destination" } }, { key: destinationKey, changes: { server: "Origin" } }]);
    assert.equal(moved[0].contracts[0].server, "Destination");
    assert.equal(moved[1].contracts[0].server, "Origin");
    const legacy = freeze(connectionBase.map((customer) => ({ ...customer, contracts: customer.contracts.map((contract) => ({ ...contract, server: "Legacy" })) })));
    assert.equal(mutations.updateContracts(legacy, [{ key: ownerKey, changes: { status: "Deshabilitado" } }])[0].contracts[0].status, "Deshabilitado");
    assert.equal(JSON.stringify(connectionBase), connectionBefore);
    const reassignedIp = mutations.saveContract(deleted, base[0].id, { ...fresh, ipAddress: first.contract.ipAddress });
    assert.throws(() => mutations.restoreContract(reassignedIp, first), /IP/);
    const originalConnection = model.flattenContracts(connectionBase)[0];
    const connectionDeleted = mutations.deleteContract(connectionBase, originalConnection.key);
    const reassignedUsername = mutations.saveContract(connectionDeleted, base[0].id, { ...fresh, server: "Origin", username: "collision-user", ipAddress: "192.0.2.64" });
    assert.throws(() => mutations.restoreContract(reassignedUsername, originalConnection), /PPPoE/);
  });

  section("Contract form validation", () => {
    const customer = customers[0];
    const valid = { ...form.blankContract(customers, customer), serialNumber: "TEST-UNIQUE", plan: "Fibra 100", server: "Core Norte", node: "NOC", interfaceName: "test-interface", ipAddress: "192.0.2.55" };
    assert.deepEqual(form.validateContract(valid, customer.id, customers), {});
    assert.ok(form.validateContract(valid, "UNREGISTERED", customers).customerId);
    for (const field of ["serialNumber", "plan", "server", "node", "interfaceName"]) assert.ok(form.validateContract({ ...valid, [field]: "" }, customer.id, customers)[field]);
    assert.ok(form.validateContract({ ...valid, serialNumber: customer.contracts[0].id }, customer.id, customers).serialNumber);
    assert.ok(form.validateContract({ ...valid, server: customer.contracts[0].server, ipAddress: customer.contracts[0].ipAddress }, customer.id, customers).ipAddress);
    assert.ok(form.validateContract({ ...valid, ipAddress: "256.0.0.1" }, customer.id, customers).ipAddress);
    assert.ok(form.validateContract({ ...valid, netmask: "255.0.255.0" }, customer.id, customers).netmask);
    assert.ok(form.validateContract({ ...valid, accessMode: "DHCP", ipAddress: "", macAddress: "" }, customer.id, customers).macAddress);
    assert.deepEqual(form.validateContract({ ...valid, accessMode: "DHCP", ipAddress: "", macAddress: "AA:BB:CC:DD:EE:FF" }, customer.id, customers), {});
    const ppp = { ...valid, accessMode: "PPPoE", ipAddress: "" };
    assert.ok(form.validateContract(ppp, customer.id, customers).username);
    assert.ok(form.validateContract(ppp, customer.id, customers).password);
    assert.ok(form.validateContract(ppp, customer.id, customers).pppProfile);
    assert.deepEqual(form.validateContract({ ...ppp, username: "test-unique", password: " password with spaces ", pppProfile: "Test profile" }, customer.id, customers), {});
    const hiddenAddresses = { gateway: "invalid-gateway", dnsPrimary: "invalid-primary", dnsSecondary: "invalid-secondary" };
    assert.deepEqual(form.validateContract({ ...valid, ...hiddenAddresses, accessMode: "DHCP", ipAddress: "", macAddress: "AA:BB:CC:DD:EE:FF" }, customer.id, customers), {});
    assert.deepEqual(form.validateContract({ ...ppp, ...hiddenAddresses, username: "test-unique", password: "test-password", pppProfile: "Test profile" }, customer.id, customers), {});
    assert.ok(form.validateContract({ ...ppp, ...hiddenAddresses, username: "test-unique", password: "test-password", pppProfile: "Test profile", fullNatAddress: "invalid-address" }, customer.id, customers).fullNatAddress);
    const withUser = customers.map((item, index) => index === 0 ? { ...item, contracts: item.contracts.map((contract, contractIndex) => contractIndex === 0 ? { ...contract, accessMode: "PPPoE", server: valid.server, username: "test-duplicate" } : contract) } : item);
    assert.ok(form.validateContract({ ...ppp, username: "test-duplicate", password: "test-password" }, customer.id, withUser).username);
    const olt = { ...valid, oltEnabled: true, olt: "Test OLT", onuSerial: "TEST-ONU", onuPort: "1", gateway: "192.0.2.1" };
    assert.deepEqual(form.validateContract(olt, customer.id, customers), {});
    assert.ok(form.validateContract({ ...olt, gateway: "" }, customer.id, customers).gateway);
    assert.ok(form.validateContract({ ...olt, dnsPrimary: "" }, customer.id, customers).dnsPrimary);
    assert.ok(form.validateContract({ ...olt, vlan: 5000 }, customer.id, customers).vlan);
    assert.ok(form.validateContract({ ...olt, extraVlans: "101,5000" }, customer.id, customers).extraVlans);
    assert.ok(form.validateContract({ ...olt, nap: "Test NAP", napPort: "" }, customer.id, customers).napPort);
    assert.ok(form.validateContract({ ...valid, cableModemEnabled: true, cableModemId: "" }, customer.id, customers).cableModemId);
    assert.ok(form.validateContract({ ...valid, startsAt: "2026-02-30" }, customer.id, customers).startsAt);
    assert.ok(form.validateContract({ ...valid, billingPeriodStart: "2026-10-02", billingPeriodEnd: "2026-09-01" }, customer.id, customers).billingPeriodEnd);
    assert.ok(form.validateContract({ ...valid, discounts: [{ id: "d", name: "Discount", amount: 101, type: "Porcentaje" }] }, customer.id, customers).discounts);
    assert.ok(form.validateContract({ ...valid, recurringItems: [{ id: "r", name: "Router", amount: 5, quantity: 0 }] }, customer.id, customers).recurringItems);
    assert.ok(form.validateContract({ ...valid, price: -1 }, customer.id, customers).price);
    assert.ok(form.validateContract({ ...valid, billingDay: 32 }, customer.id, customers).billingDay);
    assert.ok(form.validateContract({ ...valid, cpePort: 65536 }, customer.id, customers).cpePort);
    assert.ok(form.validateContract({ ...valid, trafficTolerancePercent: 101 }, customer.id, customers).trafficTolerancePercent);
    assert.ok(form.validateContract({ ...valid, uploadPriority: 0 }, customer.id, customers).uploadPriority);
    assert.ok(form.validateContract({ ...valid, downloadPriority: 9 }, customer.id, customers).downloadPriority);
    assert.ok(!form.validIPv4("10.01.1.1"));
    assert.ok(form.validIPv4("192.0.2.1") && form.validMask("255.255.255.0"));
    const cleaned = form.cleanContract({ ...valid, password: " password with spaces ", invoices: customer.contracts[0].invoices, audit: customer.audit, macAddress: "aa:bb:cc:dd:ee:ff" });
    assert.equal(cleaned.password, " password with spaces ");
    assert.equal(cleaned.invoices, customer.contracts[0].invoices);
    assert.equal(cleaned.audit, customer.audit);
    assert.equal(cleaned.macAddress, "AA:BB:CC:DD:EE:FF");
    assert.equal(form.errorTab("price"), "billing");
    assert.equal(form.errorTab("startsAt"), "advanced");
    assert.equal(form.errorTab("customerId"), "basic");
    assert.ok(form.contractFormOptions(customers, valid.server).nodes.includes("NOC"));
  });

  section("Shared customer integration", () => {
    const store = load("clientes/customer-store.ts");
    const originalCustomer = customers[0];
    const editorDraft = freeze({ ...originalCustomer, name: "Updated contact", contact: { ...originalCustomer.contact, mobile: "+52 555 0100" } });
    const currentCustomer = freeze({
      ...originalCustomer,
      contracts: [...originalCustomer.contracts, { ...originalCustomer.contracts[0], id: "CTR-CONCURRENT", serialNumber: "SERIAL-CONCURRENT", ipAddress: "192.0.2.85" }],
      audit: [{ id: "AUD-CONCURRENT", action: "Contrato creado", actor: "Usuario local", date: "2026-10-02" }, ...originalCustomer.audit],
      account: { ...originalCustomer.account, balance: 1200, status: "Con deuda" },
    });
    const before = JSON.stringify(currentCustomer);
    const savedDetails = store.saveCustomerDetails([currentCustomer, customers[1]], editorDraft);
    assert.equal(savedDetails[0].name, "Updated contact");
    assert.equal(savedDetails[0].contact.mobile, "+52 555 0100");
    assert.equal(savedDetails[0].contracts, currentCustomer.contracts);
    assert.equal(savedDetails[0].audit, currentCustomer.audit);
    assert.equal(savedDetails[0].account, currentCustomer.account);
    assert.equal(savedDetails[1], customers[1]);
    assert.ok(model.flattenContracts(savedDetails).filter((row) => row.customer.id === currentCustomer.id).every((row) => row.customer.name === "Updated contact" && row.customer.contact.mobile === "+52 555 0100"));
    assert.equal(JSON.stringify(currentCustomer), before);
    const createdCustomer = { ...editorDraft, id: "CUS-NEW", contracts: [] };
    assert.equal(store.saveCustomerDetails([currentCustomer], createdCustomer).length, 2);
    const newTicket = { id: "TKT-NEW", title: "New ticket", category: "Soporte", priority: "Media", status: "Abierto", createdAt: "2026-10-02" };
    const concurrentTicket = { ...newTicket, id: "TKT-CONCURRENT", title: "Concurrent ticket" };
    const currentWithTicket = freeze({ ...savedDetails[0], contracts: savedDetails[0].contracts.map((contract, index) => index === 0 ? { ...contract, plan: "Updated plan", tickets: [...(contract.tickets ?? []), concurrentTicket] } : contract) });
    const staleProfile = freeze({ ...originalCustomer, contracts: originalCustomer.contracts.map((contract, index) => index === 0 ? { ...contract, tickets: [...(contract.tickets ?? []), newTicket, newTicket] } : contract) });
    const savedTickets = store.appendCustomerTickets([currentWithTicket], staleProfile);
    assert.equal(savedTickets[0].contracts.length, currentWithTicket.contracts.length);
    assert.equal(savedTickets[0].contracts[0].plan, "Updated plan");
    assert.equal(savedTickets[0].contact.mobile, "+52 555 0100");
    assert.equal(savedTickets[0].contracts[0].tickets.filter((ticket) => ticket.id === "TKT-NEW").length, 1);
    assert.equal(savedTickets[0].contracts[0].tickets.filter((ticket) => ticket.id === "TKT-CONCURRENT").length, 1);
    assert.equal(store.appendCustomerTickets(savedTickets, staleProfile)[0].contracts[0].tickets.length, savedTickets[0].contracts[0].tickets.length);
    const afterDeletion = { ...currentWithTicket, contracts: currentWithTicket.contracts.slice(1) };
    const retained = store.appendCustomerTickets([afterDeletion], staleProfile);
    assert.equal(retained[0].contracts.length, afterDeletion.contracts.length);
    assert.ok(retained[0].contracts.every((contract) => contract.id !== originalCustomer.contracts[0].id));
    assert.equal(store.appendCustomerTickets([customers[1]], staleProfile)[0], customers[1]);
  });

  if (fs.existsSync(path.join(features, "contratos/contract-import-data.ts"))) section("Contract imports", () => {
    const importer = load("contratos/contract-import-data.ts");
    const first = rows[0];
    const second = rows[1];
    const validCsv = `ID,Estado\r\n${first.contract.id},Deshabilitado`;
    let result = importer.parseContractImport(validCsv, "csv", rows);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.updates, [{ key: first.key, status: "Deshabilitado" }]);
    assert.equal(result.preview[0].previousStatus, first.contract.status);
    assert.equal(result.preview[0].customerName, first.customer.name);
    assert.deepEqual(importer.parseContractCsv('ID;Estado\r\n"CTR;A";"Habilitado"'), [["ID", "Estado"], ["CTR;A", "Habilitado"]]);
    assert.deepEqual(importer.parseContractCsv('ID,Estado\r\n"CTR""A","Habilitado"'), [["ID", "Estado"], ['CTR"A', "Habilitado"]]);
    assert.throws(() => importer.parseContractCsv('ID,Estado\r\n"Unclosed'), /comillas/);
    assert.throws(() => importer.parseContractCsv('ID,Estado\r\n"A"invalid,Habilitado'), /comillas/);
    assert.ok(importer.parseContractImport("", "csv", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("{bad", "json", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("{}", "json", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("[]", "json", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("ID,Plan,Estado\nA,Fibra 100,Habilitado", "csv", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("ID,Estado,Estado\nA,Habilitado,Habilitado", "csv", rows).errors.length > 0);
    assert.ok(importer.parseContractImport(`ID,Estado\n${first.contract.id},INVALID`, "csv", rows).errors.length > 0);
    assert.ok(importer.parseContractImport("ID,Estado\nMISSING,Habilitado", "csv", rows).errors.length > 0);
    assert.ok(importer.parseContractImport(`${validCsv}\n${first.contract.id},Habilitado`, "csv", rows).errors.length > 0);
    assert.equal(importer.parseContractImport(`${validCsv}\nMISSING,Habilitado`, "csv", rows).updates.length, 0);
    assert.ok(importer.parseContractImport("x".repeat(importer.contractImportMaxBytes + 1), "csv", rows).errors[0].includes("1 MB"));
    result = importer.parseContractImport(JSON.stringify([{ id: first.contract.id.toLowerCase(), status: "deSHabilitado" }]), "json", rows);
    assert.equal(result.errors.length, 0);
    assert.equal(result.updates[0].status, "Deshabilitado");
    const serialRows = [{ ...first, contract: { ...first.contract, serialNumber: "S-ONE" } }, { ...second, contract: { ...second.contract, serialNumber: "S-TWO" } }];
    assert.equal(importer.parseContractImport("Serie;Estado\nS-ONE;Habilitado", "csv", serialRows).updates[0].key, first.key);
    assert.ok(importer.parseContractImport(JSON.stringify([{ id: first.contract.id, serialNumber: "S-TWO", status: "Habilitado" }]), "json", serialRows).errors.length > 0);
    assert.ok(importer.parseContractImport(JSON.stringify([{ id: first.contract.id, password: "secret", status: "Habilitado" }]), "json", rows).errors.length > 0);
    const ambiguous = serialRows.map((row) => ({ ...row, contract: { ...row.contract, serialNumber: "SAME" } }));
    assert.ok(importer.parseContractImport("Serie,Estado\nSAME,Habilitado", "csv", ambiguous).errors.length > 0);
    assert.equal(importer.parseContractImport(`\uFEFF${validCsv}`, "csv", rows).errors.length, 0);
    const original = JSON.stringify(customers);
    const imported = mutations.updateContracts(customers, result.updates.map(({ key, status }) => ({ key, changes: { status } })), "Estado importado");
    assert.equal(imported[0].contracts[0].status, "Deshabilitado");
    assert.equal(imported[0].contracts[0].invoices, first.contract.invoices);
    assert.equal(JSON.stringify(customers), original);
  });
  console.log(`All ${assertions} contract regression assertions passed.`);
} catch (error) {
  console.error(`Failure in ${currentSection} after ${assertions} assertions.`);
  throw error;
}
