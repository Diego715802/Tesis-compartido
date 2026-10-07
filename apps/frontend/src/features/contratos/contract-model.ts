import type { Customer, CustomerContract, ServiceStatus } from "../clientes/customer-types";

export type ContractRow = { key: string; customer: Customer; contract: CustomerContract };
export type ContractSearchMode = "all" | "name" | "ip" | "serial" | "phone";
export type FilterOperator = "contains" | "eq" | "neq" | "gte" | "lte" | "empty" | "notEmpty";
export type FilterRule = { id: string; field: string; operator: FilterOperator; value: string };
export type FilterGroup = { id: string; logic: "and" | "or"; rules: (FilterRule | FilterGroup)[] };
export type ContractFilterField = {
  value: string;
  label: string;
  category: "Contrato" | "OLT" | "Facturación" | "Cliente";
  type: "text" | "number" | "date" | "boolean" | "option";
};

export const statuses: readonly ServiceStatus[] = ["Habilitado", "Deshabilitado", "Alertado", "Degradado", "Suspendido"];

export const contractFilterFields: readonly ContractFilterField[] = [
  { value: "status", label: "Estado", category: "Contrato", type: "option" },
  { value: "plan", label: "Plan", category: "Contrato", type: "option" },
  { value: "ipAddress", label: "Dirección IP", category: "Contrato", type: "text" },
  { value: "pppProfile", label: "Perfil PPP", category: "Contrato", type: "option" },
  { value: "serialNumber", label: "Número de contrato", category: "Contrato", type: "text" },
  { value: "street", label: "Calle", category: "Contrato", type: "text" },
  { value: "number", label: "Número de puerta", category: "Contrato", type: "text" },
  { value: "customId", label: "ID personalizable", category: "Contrato", type: "text" },
  { value: "contractId", label: "ID del contrato", category: "Contrato", type: "text" },
  { value: "node", label: "Nodo Wireless", category: "Contrato", type: "option" },
  { value: "fullNatAddress", label: "Dirección FULL-NAT", category: "Contrato", type: "text" },
  { value: "macAddress", label: "Dirección MAC", category: "Contrato", type: "text" },
  { value: "username", label: "Usuario PPPoE", category: "Contrato", type: "text" },
  { value: "trafficTolerancePercent", label: "Ceil / tolerancia de tráfico (%)", category: "Contrato", type: "number" },
  { value: "notes", label: "Notas", category: "Contrato", type: "text" },
  { value: "createdAt", label: "Fecha de creación", category: "Contrato", type: "date" },
  { value: "server", label: "Servidor", category: "Contrato", type: "option" },
  { value: "pppoe", label: "PPPoE habilitado", category: "Contrato", type: "boolean" },
  { value: "dhcp", label: "DHCP habilitado", category: "Contrato", type: "boolean" },
  { value: "cableModemEnabled", label: "Cablemódem habilitado", category: "Contrato", type: "boolean" },
  { value: "fullNat", label: "FULL-NAT habilitado", category: "Contrato", type: "boolean" },
  { value: "bandwidthControl", label: "Control de ancho de banda", category: "Contrato", type: "boolean" },
  { value: "olt", label: "OLT", category: "OLT", type: "option" },
  { value: "onuSerial", label: "Serie ONU", category: "OLT", type: "text" },
  { value: "onuId", label: "ID ONU", category: "OLT", type: "text" },
  { value: "interfaceName", label: "Interfaz", category: "OLT", type: "option" },
  { value: "onuPort", label: "Puerto ONU", category: "OLT", type: "text" },
  { value: "nap", label: "NAP", category: "OLT", type: "text" },
  { value: "napPort", label: "Puerto NAP", category: "OLT", type: "text" },
  { value: "sealCode", label: "Código de precinto", category: "OLT", type: "text" },
  { value: "vlan", label: "VLAN", category: "OLT", type: "number" },
  { value: "extraVlans", label: "VLAN adicionales", category: "OLT", type: "text" },
  { value: "oltEnabled", label: "OLT habilitada", category: "OLT", type: "boolean" },
  { value: "oltBandwidthControl", label: "Control de ancho de banda OLT", category: "OLT", type: "boolean" },
  { value: "catvControl", label: "Control CATV", category: "OLT", type: "boolean" },
  { value: "provisionWan", label: "Aprovisionar WAN", category: "OLT", type: "boolean" },
  { value: "oltMode", label: "Modo OLT", category: "OLT", type: "option" },
  { value: "billingStatus", label: "Estado de facturación", category: "Facturación", type: "option" },
  { value: "frequency", label: "Frecuencia", category: "Facturación", type: "option" },
  { value: "legalEntity", label: "Entidad legal", category: "Facturación", type: "option" },
  { value: "billingProfile", label: "Perfil de facturación", category: "Facturación", type: "option" },
  { value: "recurringItem", label: "Ítem recurrente", category: "Facturación", type: "text" },
  { value: "startBillingAt", label: "Fecha de inicio de facturación", category: "Facturación", type: "date" },
  { value: "unpaidInvoices", label: "Facturas impagas", category: "Facturación", type: "number" },
  { value: "balance", label: "Saldo de la cuenta", category: "Facturación", type: "number" },
  { value: "balanceZero", label: "Saldo igual a cero", category: "Facturación", type: "boolean" },
  { value: "customerDebt", label: "Cliente con deuda", category: "Facturación", type: "boolean" },
  { value: "billingEnabled", label: "Facturación habilitada", category: "Facturación", type: "boolean" },
  { value: "discount", label: "Descuento", category: "Facturación", type: "text" },
  { value: "accountStatus", label: "Estado de cuenta", category: "Facturación", type: "option" },
  { value: "name", label: "Nombre del cliente", category: "Cliente", type: "text" },
  { value: "document", label: "Documento / cédula", category: "Cliente", type: "text" },
  { value: "customerId", label: "ID del cliente", category: "Cliente", type: "text" },
  { value: "taxId", label: "Identificación fiscal", category: "Cliente", type: "text" },
  { value: "seller", label: "Vendedor", category: "Cliente", type: "option" },
  { value: "collector", label: "Cobrador", category: "Cliente", type: "option" },
  { value: "neighborhood", label: "Barrio / colonia", category: "Cliente", type: "text" },
  { value: "zone", label: "Zona", category: "Cliente", type: "option" },
  { value: "email", label: "Correo electrónico", category: "Cliente", type: "text" },
  { value: "phone", label: "Teléfono", category: "Cliente", type: "text" },
];

export function flattenContracts(customers: Customer[]): ContractRow[] {
  return customers.flatMap((customer) => customer.contracts.map((contract) => ({ key: `${customer.id}/${contract.id}`, customer, contract })));
}

export function contractSerial(contract: CustomerContract) {
  return contract.serialNumber ?? contract.id;
}

export function contractDate(row: ContractRow) {
  return (row.contract.createdAt ?? row.contract.startsAt ?? row.customer.createdAt).slice(0, 10);
}

export function formatContractDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || "-";
}

export function normalizeText(value: unknown) {
  return String(value ?? "").toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function customerAddress(customer: Customer) {
  return [customer.address.street, customer.address.number, customer.address.neighborhood, customer.address.city, customer.address.state, customer.address.postalCode].filter(Boolean).join(", ");
}

export function emptyFilterGroup(): FilterGroup {
  return { id: "root", logic: "and", rules: [] };
}

function phoneValues(customer: Customer) {
  return [customer.contact.mobile, customer.contact.landline].filter((phone) => phone.trim() && !normalizeText(phone).startsWith("sin telefono"));
}

type FieldValue = string | number | boolean | string[] | undefined;

function fieldValue(row: ContractRow, field: string): FieldValue {
  const { customer, contract } = row;
  switch (field) {
    case "serialNumber": return contractSerial(contract);
    case "contractId": return contract.id;
    case "createdAt": return contractDate(row);
    case "pppoe": return contract.accessMode === "PPPoE";
    case "dhcp": return contract.accessMode === "DHCP";
    case "fullNat": return Boolean(contract.fullNatAddress?.trim());
    case "street": return customer.address.street;
    case "number": return customer.address.number;
    case "customId": return customer.customId;
    case "billingStatus": return contract.billingStatus ?? customer.account.status;
    case "legalEntity": return customer.billing.legalEntity;
    case "recurringItem": return contract.recurringItems?.map((item) => item.name) ?? [];
    case "unpaidInvoices": return customer.account.unpaidInvoices ?? contract.invoices?.filter((invoice) => invoice.status === "Pendiente").length ?? 0;
    case "balance": return customer.account.balance;
    case "balanceZero": return customer.account.balance === 0;
    case "customerDebt": return customer.account.balance > 0 || customer.account.status === "Con deuda";
    case "billingEnabled": return customer.billing.enabled;
    case "discount": return contract.discounts?.map((discount) => discount.name) ?? [];
    case "accountStatus": return customer.account.status;
    case "name": return customer.name;
    case "document": return customer.document;
    case "customerId": return customer.id;
    case "taxId": return customer.billing.taxId;
    case "seller": return customer.assignment.seller;
    case "collector": return customer.assignment.collector;
    case "neighborhood": return customer.address.neighborhood;
    case "zone": return customer.assignment.zone;
    case "email": return customer.contact.email;
    case "phone": return phoneValues(customer);
    default: return contract[field as keyof CustomerContract] as FieldValue;
  }
}

function valueStrings(value: FieldValue): string[] {
  if (Array.isArray(value)) return value;
  if (value === undefined) return [];
  if (typeof value === "boolean") return [value ? "true" : "false"];
  return [String(value)];
}

export function contractFieldValues(rows: ContractRow[], field: string) {
  const definition = contractFilterFields.find((item) => item.value === field);
  if (definition?.type === "boolean") return ["true", "false"];
  if (field === "status") return [...statuses];
  return [...new Set(rows.flatMap((row) => valueStrings(fieldValue(row, field))).filter((value) => value.trim()))].sort((a, b) => a.localeCompare(b, "es-MX", { numeric: true }));
}

function activeRule(rule: FilterRule) {
  return contractFilterFields.some((field) => field.value === rule.field) && (rule.operator === "empty" || rule.operator === "notEmpty" || rule.value.trim() !== "");
}

export function ruleCount(group: FilterGroup): number {
  return group.rules.reduce((total, rule) => total + ("rules" in rule ? ruleCount(rule) : Number(activeRule(rule))), 0);
}

function matchesRule(row: ContractRow, rule: FilterRule) {
  const values = valueStrings(fieldValue(row, rule.field));
  const empty = values.length === 0 || values.every((value) => value.trim() === "");
  if (rule.operator === "empty") return empty;
  if (rule.operator === "notEmpty") return !empty;
  const expected = normalizeText(rule.value);
  const definition = contractFilterFields.find((field) => field.value === rule.field);
  if (rule.operator === "contains") return values.some((value) => normalizeText(value).includes(expected));
  const equal = (value: string) => definition?.type === "number" ? Number.isFinite(Number(rule.value)) && value.trim() !== "" && Number(value) === Number(rule.value) : definition?.type === "date" ? value.slice(0, 10) === rule.value.slice(0, 10) : normalizeText(value) === expected;
  if (rule.operator === "eq") return values.some(equal);
  if (rule.operator === "neq") return values.every((value) => !equal(value));
  return values.some((value) => {
    if (definition?.type === "number") {
      const actual = Number(value);
      const target = Number(rule.value);
      if (!Number.isFinite(actual) || !Number.isFinite(target) || value.trim() === "") return false;
      return rule.operator === "gte" ? actual >= target : actual <= target;
    }
    if (definition?.type === "date") {
      const actual = value.slice(0, 10);
      const target = rule.value.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(actual) || !/^\d{4}-\d{2}-\d{2}$/.test(target)) return false;
      return rule.operator === "gte" ? actual >= target : actual <= target;
    }
    const order = normalizeText(value).localeCompare(expected, "es-MX", { numeric: true });
    return rule.operator === "gte" ? order >= 0 : order <= 0;
  });
}

function matchesGroup(row: ContractRow, group: FilterGroup): boolean {
  const active = group.rules.filter((rule) => "rules" in rule ? ruleCount(rule) > 0 : activeRule(rule));
  if (active.length === 0) return true;
  const matches = (rule: FilterRule | FilterGroup): boolean => "rules" in rule ? matchesGroup(row, rule) : matchesRule(row, rule);
  return group.logic === "or" ? active.some(matches) : active.every(matches);
}

function matchesSearch(row: ContractRow, query: string, mode: ContractSearchMode) {
  if (!query) return true;
  const { customer, contract } = row;
  const phones = phoneValues(customer);
  let values: string[];
  if (mode === "name") values = [customer.name];
  else if (mode === "ip") values = [contract.ipAddress, contract.fullNatAddress ?? ""];
  else if (mode === "serial") values = [contractSerial(contract), contract.id];
  else if (mode === "phone") values = phones;
  else values = [customer.name, customer.id, customer.customId, customer.document, customer.contact.email, ...phones, customerAddress(customer), contract.id, contractSerial(contract), contract.ipAddress, contract.plan, contract.server, contract.node, contract.interfaceName ?? "", contract.username ?? "", contract.macAddress ?? "", contract.notes ?? ""];
  const phoneQuery = /^[\d+\s().-]+$/.test(query) ? query.replace(/\D/g, "") : "";
  const phoneMatches = (mode === "all" || mode === "phone") && phoneQuery.length > 0 && phones.some((phone) => phone.replace(/\D/g, "").includes(phoneQuery));
  return phoneMatches || values.some((value) => normalizeText(value).includes(query));
}

export function filterContracts(rows: ContractRow[], query: string, group: FilterGroup, searchMode: ContractSearchMode = "all") {
  const normalizedQuery = normalizeText(query);
  return rows.filter((row) => matchesSearch(row, normalizedQuery, searchMode) && matchesGroup(row, group));
}

function csvCell(value: unknown) {
  let cell = String(value ?? "");
  if (/^\s*[=+\-@]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replaceAll('"', '""')}"`;
}

export function exportContractsCsv(rows: ContractRow[]) {
  const headers = ["ID contrato", "Número de serie", "Fecha de creación", "ID cliente", "ID personalizable", "Nombre completo", "Documento", "Correo", "Teléfono celular", "Teléfono fijo", "Dirección", "Latitud", "Longitud", "Plan", "Estado", "Servidor", "Nodo", "Interfaz", "Modo", "Dirección IP", "MAC", "Usuario PPPoE", "Precio", "Frecuencia", "Perfil de facturación", "Estado de cuenta", "Saldo", "Facturas impagas"];
  const values = rows.map((row) => {
    const { customer, contract } = row;
    return [contract.id, contractSerial(contract), formatContractDate(contractDate(row)), customer.id, customer.customId, customer.name, customer.document, customer.contact.email, customer.contact.mobile, customer.contact.landline, customerAddress(customer), customer.address.latitude, customer.address.longitude, contract.plan, contract.status, contract.server, contract.node, contract.interfaceName, contract.accessMode, contract.ipAddress, contract.macAddress, contract.username, contract.price, contract.frequency, contract.billingProfile, customer.account.status, customer.account.balance, fieldValue(row, "unpaidInvoices")];
  });
  return [headers, ...values].map((cells) => cells.map(csvCell).join(",")).join("\r\n");
}
