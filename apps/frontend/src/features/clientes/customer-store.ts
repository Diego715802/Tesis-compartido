"use client";

import { useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { demoCustomers } from "./customer-data";
import { normalizeCustomerId } from "./customer-id";
import type { Customer } from "./customer-types";

export const CUSTOMER_STORAGE_KEY = "comecore.customers.v1";
const CUSTOMER_DATASET_REVISION_KEY = "comecore.customers.dataset-revision";
const CUSTOMER_DATASET_REVISION = "single-customer-2026-10-05";

export type CustomerPersistenceStatus = {
  status: "loading" | "saved" | "unavailable";
  message: string;
};

const serverPersistence: CustomerPersistenceStatus = { status: "loading", message: "" };
let customers: Customer[] = demoCustomers;
let persistence: CustomerPersistenceStatus = serverPersistence;
let initialized = false;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStrings(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "string");
}

function hasNumbers(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "number" && Number.isFinite(value[key]));
}

function hasBooleans(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "boolean");
}

function hasOptionalFields(value: Record<string, unknown>, fields: { string?: string[]; number?: string[]; boolean?: string[] }) {
  return (Object.entries(fields) as ["string" | "number" | "boolean", string[]][]).every(([type, keys]) => keys.every((key) => value[key] === undefined || (typeof value[key] === type && (type !== "number" || Number.isFinite(value[key])))));
}

function isAudit(value: unknown) {
  return isRecord(value) && hasStrings(value, ["id", "action", "actor", "date"]) && hasOptionalFields(value, { string: ["detail"] });
}

function isContract(value: unknown) {
  if (!isRecord(value) || !hasStrings(value, ["id", "plan", "server", "node", "ipAddress", "status"]) || !hasNumbers(value, ["downstreamGb", "upstreamGb"])) return false;
  if (!["Habilitado", "Deshabilitado", "Alertado", "Degradado", "Suspendido"].includes(String(value.status))) return false;
  if (!hasOptionalFields(value, {
    string: ["frequency", "accessMode", "hostType", "interfaceName", "macAddress", "netmask", "gateway", "dnsPrimary", "dnsSecondary", "serialNumber", "createdAt", "startsAt", "updatedAt", "username", "password", "wifiPassword", "notes", "billingProfile", "billingStatus", "startBillingAt", "billingPeriodStart", "billingPeriodEnd", "cpeProtocol", "parentQueue", "network", "olt", "onuSerial", "onuPort", "nap", "cableModemId", "pppProfile", "pppoeServer", "fullNatAddress", "oltMode", "onuId", "napPort", "sealCode", "extraVlans"],
    number: ["price", "billingDay", "trafficTolerancePercent", "cpePort", "priority", "latitude", "longitude", "uploadPriority", "downloadPriority", "vlan"],
    boolean: ["oltEnabled", "cableModemEnabled", "bandwidthControl", "oltBandwidthControl", "catvControl", "provisionWan"],
  })) return false;
  if (value.items !== undefined && (!Array.isArray(value.items) || !value.items.every((item) => typeof item === "string"))) return false;
  if (value.audit !== undefined && (!Array.isArray(value.audit) || !value.audit.every(isAudit))) return false;
  if (value.invoices !== undefined && (!Array.isArray(value.invoices) || !value.invoices.every((invoice) => isRecord(invoice) && hasStrings(invoice, ["id", "issuedAt", "type", "status"]) && hasNumbers(invoice, ["amount", "balance"])))) return false;
  if (value.tickets !== undefined && (!Array.isArray(value.tickets) || !value.tickets.every((ticket) => isRecord(ticket) && hasStrings(ticket, ["id", "title", "category", "priority", "status", "createdAt"])))) return false;
  if (value.discounts !== undefined && (!Array.isArray(value.discounts) || !value.discounts.every((discount) => isRecord(discount) && hasStrings(discount, ["id", "name", "type"]) && hasNumbers(discount, ["amount"]) && ["Porcentaje", "Importe"].includes(String(discount.type))))) return false;
  if (value.recurringItems !== undefined && (!Array.isArray(value.recurringItems) || !value.recurringItems.every((item) => isRecord(item) && hasStrings(item, ["id", "name"]) && hasNumbers(item, ["amount", "quantity"])))) return false;
  return true;
}

function isCustomer(value: unknown) {
  if (!isRecord(value) || !hasStrings(value, ["id", "customId", "kind", "name", "document", "createdAt", "paymentGateway", "notes"])) return false;
  if (!["Persona física", "Persona jurídica", "Otro"].includes(String(value.kind))) return false;
  if (!hasBooleans(value, ["portalAccess"]) || !hasNumbers(value, ["devices"])) return false;
  if (!hasOptionalFields(value, { string: ["portalLink"] })) return false;
  if (!isRecord(value.address) || !hasStrings(value.address, ["street", "neighborhood", "city", "state", "postalCode"]) || !hasNumbers(value.address, ["latitude", "longitude"])) return false;
  if (!hasOptionalFields(value.address, { string: ["number", "additionalData"] })) return false;
  if (!isRecord(value.contact) || !hasStrings(value.contact, ["email", "mobile", "landline"])) return false;
  if (!isRecord(value.billing) || !hasStrings(value.billing, ["taxId", "legalName", "legalEntity"]) || !hasBooleans(value.billing, ["enabled"])) return false;
  if (!hasOptionalFields(value.billing, {
    string: ["regime", "invoiceType", "paymentMethod", "cfdiUse", "paymentForm", "additionalInfo", "additionalInfo2", "notificationEmails"],
    number: ["billingDay"],
    boolean: ["emailInvoice", "emailPayment", "informAfterPayment", "automaticStatus"],
  })) return false;
  if (!isRecord(value.assignment) || !hasStrings(value.assignment, ["zone", "seller", "collector"])) return false;
  if (!isRecord(value.account) || !hasStrings(value.account, ["status"]) || !hasNumbers(value.account, ["balance", "credit"])) return false;
  if (!["Al corriente", "Saldo a favor", "Con deuda"].includes(String(value.account.status))) return false;
  if (!hasOptionalFields(value.account, { number: ["unpaidInvoices"] })) return false;
  if (value.account.transactions !== undefined && (!Array.isArray(value.account.transactions) || !value.account.transactions.every((transaction) => isRecord(transaction) && hasStrings(transaction, ["id", "date", "concept", "type"]) && hasNumbers(transaction, ["amount"]) && ["Cargo", "Abono"].includes(String(transaction.type))))) return false;
  if (!isRecord(value.communication) || !hasBooleans(value.communication, ["email", "sms", "whatsapp"])) return false;
  if (!Array.isArray(value.contracts) || !value.contracts.every(isContract)) return false;
  if (!Array.isArray(value.audit) || !value.audit.every(isAudit)) return false;
  if (value.deviceRecords !== undefined && (!Array.isArray(value.deviceRecords) || !value.deviceRecords.every((device) => isRecord(device) && hasStrings(device, ["id", "name", "pushToken", "createdAt"])))) return false;
  if (value.gatewayAccounts !== undefined && (!Array.isArray(value.gatewayAccounts) || !value.gatewayAccounts.every((gateway) => isRecord(gateway) && hasStrings(gateway, ["id", "name"]) && hasBooleans(gateway, ["enabled", "notifyInvoices"])))) return false;
  return true;
}

function readCustomers(raw: string): Customer[] {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.customers) || !parsed.customers.every(isCustomer)) throw new Error("Invalid customer data");
  const customerIds = parsed.customers.map((customer) => customer.id);
  const contractIds = parsed.customers.flatMap((customer) => customer.contracts.map((contract: { id: string }) => contract.id));
  if (new Set(customerIds).size !== customerIds.length || new Set(contractIds).size !== contractIds.length) throw new Error("Duplicate record identifiers");
  return (parsed.customers as Customer[]).map((customer) => ({
    ...customer,
    customId: normalizeCustomerId(customer.customId),
  }));
}

function notify() {
  listeners.forEach((listener) => listener());
}

function storageFailure(message: string) {
  persistence = { status: "unavailable", message };
}

function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const storedRevision = window.localStorage.getItem(CUSTOMER_DATASET_REVISION_KEY);
    const resetToSingleCustomer = storedRevision !== CUSTOMER_DATASET_REVISION;
    const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
    customers = resetToSingleCustomer || raw === null ? demoCustomers : readCustomers(raw);
    if (resetToSingleCustomer || raw === null) {
      window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({ version: 1, customers }));
      window.localStorage.setItem(CUSTOMER_DATASET_REVISION_KEY, CUSTOMER_DATASET_REVISION);
    }
    persistence = { status: "saved", message: "" };
  } catch {
    storageFailure("No se pudieron cargar los datos guardados. Los cambios se conservarán en esta sesión hasta que el almacenamiento vuelva a estar disponible.");
  }
}

function receiveStorage(event: StorageEvent) {
  if (event.key !== CUSTOMER_STORAGE_KEY && event.key !== null) return;
  try {
    customers = event.newValue === null ? demoCustomers : readCustomers(event.newValue);
    persistence = { status: "saved", message: "" };
  } catch {
    storageFailure("No se pudieron leer los cambios guardados en otra pestaña. Los datos de esta sesión se conservaron.");
  }
  notify();
}

function subscribe(listener: () => void) {
  const firstSubscriber = listeners.size === 0;
  listeners.add(listener);
  if (firstSubscriber && persistence.status === "saved") initialized = false;
  initialize();
  if (firstSubscriber) window.addEventListener("storage", receiveStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", receiveStorage);
  };
}

export const setCustomers: Dispatch<SetStateAction<Customer[]>> = (update) => {
  initialize();
  const updated = (typeof update === "function" ? update(customers) : update).map((customer) => ({
    ...customer,
    customId: normalizeCustomerId(customer.customId),
  }));
  if (updated === customers) return;
  customers = updated;
  try {
    window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({ version: 1, customers }));
    window.localStorage.setItem(CUSTOMER_DATASET_REVISION_KEY, CUSTOMER_DATASET_REVISION);
    persistence = { status: "saved", message: "" };
  } catch {
    storageFailure("No se pudieron guardar los cambios en este navegador. Los cambios están disponibles en esta sesión y se perderán al cerrar o recargar la página.");
  }
  notify();
};

export function saveCustomerDetails(current: Customer[], draft: Customer): Customer[] {
  if (!current.some((customer) => customer.id === draft.id)) return [draft, ...current];
  return current.map((customer) => customer.id !== draft.id ? customer : {
    ...customer,
    customId: draft.customId,
    kind: draft.kind,
    name: draft.name,
    document: draft.document,
    address: draft.address,
    contact: draft.contact,
    billing: draft.billing,
    assignment: draft.assignment,
    paymentGateway: draft.paymentGateway,
    notes: draft.notes,
  });
}

export function appendCustomerTickets(current: Customer[], updated: Customer): Customer[] {
  return current.map((customer) => customer.id !== updated.id ? customer : {
    ...customer,
    contracts: customer.contracts.map((contract) => {
      const proposed = updated.contracts.find((item) => item.id === contract.id);
      if (!proposed?.tickets?.length) return contract;
      const existingIds = new Set((contract.tickets ?? []).map((ticket) => ticket.id));
      const additions = proposed.tickets.filter((ticket) => {
        if (existingIds.has(ticket.id)) return false;
        existingIds.add(ticket.id);
        return true;
      });
      return additions.length ? { ...contract, tickets: [...(contract.tickets ?? []), ...additions] } : contract;
    }),
  });
}

export function useCustomers(): [Customer[], Dispatch<SetStateAction<Customer[]>>] {
  return [useSyncExternalStore(subscribe, () => customers, () => demoCustomers), setCustomers];
}

export function useCustomerPersistenceStatus(): CustomerPersistenceStatus {
  return useSyncExternalStore(subscribe, () => persistence, () => serverPersistence);
}
