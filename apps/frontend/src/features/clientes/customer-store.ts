"use client";

import { useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { normalizeCustomerId } from "./customer-id";
import type { Customer } from "./customer-types";

export const CUSTOMER_STORAGE_KEY = "comecore.customers.v1";
// This legacy key is deliberately neither read nor written. A future migration
// requires an authenticated owner and an explicit review of the source records.
export type CustomerPersistenceStatus = {
  status: "loading" | "saved" | "unavailable";
  message: string;
};

const serverPersistence: CustomerPersistenceStatus = { status: "loading", message: "Cargando los datos del servidor…" };
const serverCustomers: Customer[] = [];
let customers: Customer[] = serverCustomers;
let persistence: CustomerPersistenceStatus = serverPersistence;
let version = 0;
let initialized = false;
let loading: Promise<void> | null = null;
let saveQueue: Promise<void> = Promise.resolve();
let pendingSaves = 0;
let generation = 0;
let failedSaveGeneration = 0;
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

type WorkspaceSnapshot = { customers: Customer[]; version: number };
class PersistenceError extends Error {
  constructor(message: string, readonly status: number, readonly code = "") { super(message); }
}

function readSnapshot(parsed: unknown): WorkspaceSnapshot {
  if (!isRecord(parsed) || !Number.isSafeInteger(parsed.version) || Number(parsed.version) < 0 || !Array.isArray(parsed.customers) || !parsed.customers.every(isCustomer)) throw new Error("Respuesta de datos no válida.");
  const customerIds = parsed.customers.map((customer) => customer.id);
  const contractIds = parsed.customers.flatMap((customer) => customer.contracts.map((contract: { id: string }) => contract.id));
  if (new Set(customerIds).size !== customerIds.length || new Set(contractIds).size !== contractIds.length) throw new Error("Respuesta de datos no válida.");
  return {
    version: Number(parsed.version),
    customers: (parsed.customers as Customer[]).map((customer) => ({ ...customer, customId: normalizeCustomerId(customer.customId) })),
  };
}

function notify() { listeners.forEach((listener) => listener()); }
function storageFailure(message: string) { persistence = { status: "unavailable", message }; }

async function requestSnapshot(method: "GET" | "PUT", data?: WorkspaceSnapshot): Promise<WorkspaceSnapshot> {
  const response = await fetch("/api/erp/workspace", {
    method, credentials: "same-origin", cache: "no-store",
    headers: method === "PUT" ? { "Content-Type": "application/json" } : undefined,
    body: data === undefined ? undefined : JSON.stringify(data),
    redirect: "error",
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = isRecord(body) && typeof body.code === "string" ? body.code : "";
    const message = code === "PLAN_NOT_FOUND" ? "Selecciona un plan registrado de tu organización. Revisa el catálogo de Planes antes de guardar." : code === "RECORD_CONFLICT" ? "Ya existe un registro con esos identificadores o contacto. Revisa los datos antes de guardar." : response.status === 400 ? "Revisa los datos, fechas e identificadores del cliente y del contrato." : response.status === 401 ? "Tu sesión terminó. Vuelve a iniciar sesión." : response.status === 403 ? "No tienes permiso para guardar estos cambios o debes completar la verificación de tu cuenta." : response.status === 409 ? "Otra sesión actualizó los datos. Se cargó la versión del servidor; revisa tus cambios antes de volver a guardarlos." : "No se confirmó el guardado en el servidor. Revisa los datos e inténtalo de nuevo.";
    throw new PersistenceError(message, response.status, code);
  }
  return readSnapshot(body);
}

async function loadSnapshot(showLoading = true): Promise<void> {
  const requestedGeneration = generation;
  if (showLoading) { persistence = serverPersistence; notify(); }
  try {
    const snapshot = await requestSnapshot("GET");
    if (requestedGeneration !== generation) return;
    customers = snapshot.customers;
    version = snapshot.version;
    initialized = true;
    persistence = { status: "saved", message: "" };
  } catch (error) {
    if (requestedGeneration !== generation) return;
    initialized = false;
    if (error instanceof PersistenceError && (error.status === 401 || ["MFA_REQUIRED", "PASSWORD_CHANGE_REQUIRED"].includes(error.code))) { customers = []; version = 0; }
    storageFailure(error instanceof PersistenceError ? error.message : "No se pudieron cargar los datos del servidor. Recarga la página para volver a intentarlo.");
    throw error;
  } finally { if (requestedGeneration === generation) notify(); }
}

function initialize(): Promise<void> {
  if (typeof window === "undefined" || initialized) return Promise.resolve();
  if (!loading) loading = loadSnapshot().finally(() => { loading = null; });
  return loading;
}

export function retryCustomerWorkspace(): Promise<void> {
  if (pendingSaves > 0) return saveQueue;
  if (!loading) loading = loadSnapshot().finally(() => { loading = null; });
  return loading;
}

function refreshWhenVisible() {
  if (document.visibilityState === "visible" && pendingSaves === 0 && !loading) {
    loading = loadSnapshot(false).catch(() => undefined).finally(() => { loading = null; });
  }
}

function subscribe(listener: () => void) {
  const firstSubscriber = listeners.size === 0;
  listeners.add(listener);
  if (firstSubscriber) {
    void initialize().catch(() => undefined);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    }
  };
}

/** Resolve only after the server commits. Consumers can await this to announce
 * success. Saves are serialized, using the latest committed version and state.
 * No customer data, credentials or tokens are persisted by JavaScript storage.
 */
export function commitCustomers(update: SetStateAction<Customer[]>): Promise<void> {
  const requestedGeneration = generation;
  const requestedFailureGeneration = failedSaveGeneration;
  pendingSaves += 1;
  persistence = { status: "loading", message: "Guardando los cambios en el servidor…" };
  notify();
  const operation = saveQueue.then(async () => {
    if (requestedGeneration !== generation || requestedFailureGeneration !== failedSaveGeneration) throw new Error("No se guardaron los cambios pendientes. Revisa la versión del servidor.");
    await initialize();
    if (!initialized) throw new Error("Los datos aún no están disponibles. Recarga antes de editar.");
    const proposed = typeof update === "function" ? update(customers) : update;
    if (proposed === customers) return;
    const normalized = proposed.map((customer) => ({ ...customer, customId: normalizeCustomerId(customer.customId) }));
    try {
      const snapshot = await requestSnapshot("PUT", { customers: normalized, version });
      if (requestedGeneration !== generation) return;
      customers = snapshot.customers;
      version = snapshot.version;
      persistence = { status: "saved", message: "" };
    } catch (error) {
      if (requestedGeneration !== generation) throw error;
      failedSaveGeneration += 1;
      // A lost response may follow a committed write. Re-read; never blindly retry.
      try { await loadSnapshot(false); } catch { /* The last confirmed data stays in memory. */ }
      const message = error instanceof PersistenceError ? error.message : "No se confirmó el guardado en el servidor. Revisa los datos antes de volver a intentarlo.";
      storageFailure(message);
      throw new Error(message);
    } finally { notify(); }
  });
  const completed = operation.catch((error: unknown) => {
    if (requestedGeneration === generation) {
      if (requestedFailureGeneration === failedSaveGeneration) failedSaveGeneration += 1;
      if (persistence.status !== "unavailable") storageFailure(error instanceof Error ? error.message : "No se pudieron guardar los cambios.");
      notify();
      throw new Error(persistence.message);
    }
    throw error;
  }).finally(() => { pendingSaves -= 1; notify(); });
  saveQueue = completed.catch(() => undefined);
  return completed;
}

export const setCustomers: Dispatch<SetStateAction<Customer[]>> = (update) => { void commitCustomers(update).catch(() => undefined); };

/** Useful for explicit session transitions; full-page logout also discards memory. */
export function resetCustomerWorkspace() {
  generation += 1;
  failedSaveGeneration += 1;
  customers = [];
  version = 0;
  initialized = false;
  persistence = serverPersistence;
  notify();
}

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
  return [useSyncExternalStore(subscribe, () => customers, () => serverCustomers), setCustomers];
}

export function useCustomerPersistenceStatus(): CustomerPersistenceStatus {
  return useSyncExternalStore(subscribe, () => persistence, () => serverPersistence);
}
