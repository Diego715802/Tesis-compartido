import type { Customer, CustomerAuditEvent, CustomerContract } from "../clientes/customer-types";
import { flattenContracts, statuses, type ContractRow } from "./contract-model";

export type ContractUpdate = { key: string; changes: Partial<CustomerContract> };

const normalized = (value: string) => value.trim().toLocaleLowerCase("es-MX");
const contractKey = (customerId: string, contractId: string) => `${customerId}/${contractId}`;
const serial = (contract: CustomerContract) => contract.serialNumber?.trim() || contract.id.trim();
const connectionFields = ["server", "ipAddress", "accessMode", "username"] as const;

function registeredCustomer(customers: Customer[], customerId: string) {
  const customer = customers.find((item) => item.id === customerId);
  if (!customer) throw new Error("El contrato debe pertenecer a un cliente registrado.");
  return customer;
}

function existingRow(customers: Customer[], key: string) {
  const row = flattenContracts(customers).find((item) => item.key === key);
  if (!row) throw new Error("El contrato ya no existe. Actualiza el listado antes de continuar.");
  return row;
}

function validateIdentity(customers: Customer[], contract: CustomerContract, excludedKey?: string) {
  if (!contract.id.trim()) throw new Error("El identificador del contrato es obligatorio.");
  if (!serial(contract)) throw new Error("El número de serie del contrato es obligatorio.");
  if (!statuses.includes(contract.status)) throw new Error("El estado del contrato no es válido.");
  const others = flattenContracts(customers).filter((row) => row.key !== excludedKey);
  if (others.some((row) => normalized(row.contract.id) === normalized(contract.id))) throw new Error("El identificador ya pertenece a otro contrato.");
  if (others.some((row) => normalized(serial(row.contract)) === normalized(serial(contract)))) throw new Error("El número de serie ya pertenece a otro contrato.");
}

function validateConnectionCollisions(rows: ContractRow[], changedKeys: Set<string>) {
  for (const row of rows.filter((item) => changedKeys.has(item.key))) {
    const contract = row.contract;
    const others = rows.filter((item) => item.key !== row.key && item.contract.server.trim() === contract.server.trim());
    if (contract.ipAddress.trim() && others.some((item) => item.contract.ipAddress.trim() === contract.ipAddress.trim())) throw new Error("La IP ya está asignada a otro contrato en este servidor.");
    if (contract.accessMode === "PPPoE" && contract.username?.trim() && others.some((item) => item.contract.accessMode === "PPPoE" && item.contract.username?.trim() === contract.username!.trim())) throw new Error("El usuario PPPoE ya está asignado a otro contrato en este servidor.");
  }
}

function auditEvent(action: string, contract: CustomerContract, date: string, fields: string[] = []): CustomerAuditEvent {
  const visibleFields = fields.filter((field) => !["password", "wifiPassword"].includes(field));
  return {
    id: `AUD-CTR-${crypto.randomUUID()}`, action, actor: "Usuario local", date,
    detail: `Contrato ${contract.id}${visibleFields.length ? `; campos: ${visibleFields.join(", ")}` : ""}`,
  };
}

export function saveContract(customers: Customer[], customerId: string, contract: CustomerContract, editingKey?: string): Customer[] {
  registeredCustomer(customers, customerId);
  const existing = editingKey === undefined ? undefined : existingRow(customers, editingKey);
  if (existing && existing.customer.id !== customerId) throw new Error("No se puede reasignar un contrato a otro cliente durante su edición.");
  if (existing && existing.contract.id !== contract.id) throw new Error("No se puede cambiar el identificador del contrato durante su edición.");
  validateIdentity(customers, contract, editingKey);
  if (!existing || connectionFields.some((field) => existing.contract[field] !== contract[field])) {
    const key = contractKey(customerId, contract.id.trim());
    const prospective = flattenContracts(customers).filter((row) => row.key !== editingKey);
    prospective.push({ key, customer: registeredCustomer(customers, customerId), contract });
    validateConnectionCollisions(prospective, new Set([key]));
  }
  const date = new Date().toISOString();
  const event = auditEvent(existing ? "Contrato actualizado" : "Contrato creado", contract, date);
  const saved: CustomerContract = {
    ...existing?.contract, ...contract, id: contract.id.trim(), serialNumber: serial(contract),
    createdAt: existing?.contract.createdAt ?? contract.createdAt ?? date,
    updatedAt: date,
    ...(existing ? { invoices: existing.contract.invoices, tickets: existing.contract.tickets, downstreamGb: existing.contract.downstreamGb, upstreamGb: existing.contract.upstreamGb } : {}),
    audit: [event, ...(existing?.contract.audit ?? contract.audit ?? [])],
  };
  return customers.map((customer) => customer.id !== customerId ? customer : {
    ...customer,
    contracts: existing ? customer.contracts.map((item) => item.id === existing.contract.id ? saved : item) : [...customer.contracts, saved],
    audit: [event, ...customer.audit],
  });
}

export function updateContracts(customers: Customer[], updates: ContractUpdate[], action = "Contrato actualizado"): Customer[] {
  if (updates.length === 0) return customers;
  const changesByKey = new Map<string, Partial<CustomerContract>>();
  const connectionChanges = new Set<string>();
  for (const update of updates) {
    const row = existingRow(customers, update.key);
    if (changesByKey.has(update.key)) throw new Error("El lote contiene el mismo contrato más de una vez.");
    if (["id", "serialNumber", "customerId", "customer", "audit"].some((field) => Object.hasOwn(update.changes, field))) throw new Error("Los lotes no pueden modificar el cliente, la identidad ni la auditoría del contrato.");
    if (Object.hasOwn(update.changes, "status") && !statuses.includes(update.changes.status!)) throw new Error("El estado del contrato no es válido.");
    if (Object.keys(update.changes).length > 0) changesByKey.set(update.key, update.changes);
    if (connectionFields.some((field) => Object.hasOwn(update.changes, field) && update.changes[field] !== row.contract[field])) connectionChanges.add(update.key);
  }
  if (changesByKey.size === 0) return customers;
  if (connectionChanges.size) validateConnectionCollisions(flattenContracts(customers).map((row) => ({ ...row, contract: { ...row.contract, ...changesByKey.get(row.key) } })), connectionChanges);
  const date = new Date().toISOString();
  return customers.map((customer) => {
    const events: CustomerAuditEvent[] = [];
    const contracts = customer.contracts.map((contract) => {
      const changes = changesByKey.get(contractKey(customer.id, contract.id));
      if (!changes) return contract;
      const event = auditEvent(action, contract, date, Object.keys(changes));
      events.push(event);
      return { ...contract, ...changes, updatedAt: date, audit: [event, ...(contract.audit ?? [])] };
    });
    return events.length ? { ...customer, contracts, audit: [...events, ...customer.audit] } : customer;
  });
}

export function deleteContract(customers: Customer[], key: string): Customer[] {
  const row = existingRow(customers, key);
  const event = auditEvent("Contrato eliminado", row.contract, new Date().toISOString());
  return customers.map((customer) => customer.id === row.customer.id ? {
    ...customer, contracts: customer.contracts.filter((contract) => contract.id !== row.contract.id), audit: [event, ...customer.audit],
  } : customer);
}

export function restoreContract(customers: Customer[], row: ContractRow): Customer[] {
  registeredCustomer(customers, row.customer.id);
  if (row.key !== contractKey(row.customer.id, row.contract.id)) throw new Error("La referencia del contrato a restaurar no coincide con su cliente.");
  validateIdentity(customers, row.contract);
  validateConnectionCollisions([...flattenContracts(customers), row], new Set([row.key]));
  const date = new Date().toISOString();
  const event = auditEvent("Contrato restaurado", row.contract, date);
  const restored = { ...row.contract, updatedAt: date, audit: [event, ...(row.contract.audit ?? [])] };
  return customers.map((customer) => customer.id === row.customer.id ? {
    ...customer, contracts: [...customer.contracts, restored], audit: [event, ...customer.audit],
  } : customer);
}
