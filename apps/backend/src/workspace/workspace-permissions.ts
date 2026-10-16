import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import type { WorkspaceContract, WorkspaceCustomer } from './workspace-schema.js';

export type WorkspaceRole = 'owner' | 'admin' | 'billing' | 'support' | 'viewer';
export interface WorkspaceIdentity {
  user: { id: string; email: string; name: string };
  organization: { id: string; name: string };
  role: WorkspaceRole;
  permissions: string[];
  mfaRequired: boolean;
  passwordChangeRequired?: boolean;
}

export class WorkspaceError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string) { super(message); }
}

const financialCustomerFields = new Set(['billing', 'account', 'paymentGateway', 'gatewayAccounts']);
const financialContractFields = new Set(['price', 'frequency', 'invoices', 'billingProfile', 'billingStatus', 'startBillingAt', 'billingPeriodStart', 'billingPeriodEnd', 'billingDay', 'discounts', 'recurringItems']);
const managedCustomerFields = new Set(['audit', 'contracts']);
const managedContractFields = new Set(['audit', 'updatedAt']);
const forbidden = () => new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para realizar estos cambios.');

export function requireWorkspaceIdentity(identity: WorkspaceIdentity | null): asserts identity is WorkspaceIdentity {
  if (!identity || !['owner', 'admin', 'billing', 'support', 'viewer'].includes(identity.role)) throw new WorkspaceError(401, 'UNAUTHORIZED', 'Inicia sesión para continuar.');
  if (identity.passwordChangeRequired) throw new WorkspaceError(403, 'PASSWORD_CHANGE_REQUIRED', 'Cambia tu contraseña antes de acceder al ERP.');
  if (identity.mfaRequired) throw new WorkspaceError(403, 'MFA_REQUIRED', 'Completa la verificación de dos pasos antes de acceder al ERP.');
}

export function canReadNetworkSecrets(identity: WorkspaceIdentity): boolean {
  return ['owner', 'admin', 'support'].includes(identity.role) && identity.permissions.includes('red:secrets');
}

export function redactWorkspaceCustomers(customers: WorkspaceCustomer[], identity: WorkspaceIdentity): WorkspaceCustomer[] {
  if (canReadNetworkSecrets(identity)) return customers;
  return customers.map((customer) => ({
    ...customer,
    deviceRecords: customer.deviceRecords?.map((device) => ({ ...device, pushToken: '' })),
    contracts: customer.contracts.map((contract) => ({ ...contract, password: '', wifiPassword: '' })),
  }));
}

function strip<T extends object>(value: T, ignored: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !ignored.has(key)));
}

function sameFields(before: object, after: object, ignored: Set<string>): boolean {
  return isDeepStrictEqual(strip(before, ignored), strip(after, ignored));
}

function onlyFields(value: object, fields: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => fields.has(key)));
}

// Redacted GET values are placeholders, never instructions to erase a secret.
// A role without the secret permission may submit only those empty placeholders.
function preserveHiddenSecrets(customer: WorkspaceCustomer, previous: WorkspaceCustomer | undefined, identity: WorkspaceIdentity): WorkspaceCustomer {
  if (canReadNetworkSecrets(identity)) return customer;
  return {
    ...customer,
    deviceRecords: customer.deviceRecords?.map((device) => {
      if (device.pushToken) throw forbidden();
      const existing = previous?.deviceRecords?.find((item) => item.id === device.id);
      return { ...device, pushToken: existing?.pushToken ?? '' };
    }),
    contracts: customer.contracts.map((contract) => {
      if (contract.password || contract.wifiPassword) throw forbidden();
      const existing = previous?.contracts.find((item) => item.id === contract.id);
      const preserved = { ...contract };
      if (existing?.password === undefined) delete preserved.password;
      else preserved.password = existing.password;
      if (existing?.wifiPassword === undefined) delete preserved.wifiPassword;
      else preserved.wifiPassword = existing.wifiPassword;
      return preserved;
    }),
  };
}

function safeSupportCustomerCreation(customer: WorkspaceCustomer): boolean {
  const billing = customer.billing;
  const account = customer.account;
  return !billing.enabled && !billing.taxId && !billing.legalName && !billing.regime &&
    ['', 'Comprobante'].includes(billing.invoiceType ?? '') && (billing.billingDay ?? 1) === 1 &&
    ['', 'Por definir'].includes(billing.paymentMethod ?? '') && ['', '99 - Por definir'].includes(billing.paymentForm ?? '') &&
    ['', 'G03 - Gastos en general'].includes(billing.cfdiUse ?? '') &&
    !billing.emailInvoice && !billing.emailPayment && !billing.informAfterPayment && !billing.automaticStatus &&
    !billing.additionalInfo && !billing.additionalInfo2 && !billing.notificationEmails &&
    account.status === 'Al corriente' && account.balance === 0 && account.credit === 0 && !account.unpaidInvoices && !account.transactions?.length &&
    ['', 'Sin pasarela'].includes(customer.paymentGateway) && !customer.gatewayAccounts?.length;
}

function safeSupportContractCreation(contract: WorkspaceContract, customer: WorkspaceCustomer): boolean {
  return !contract.price && !contract.invoices?.length && !contract.discounts?.length && !contract.recurringItems?.length &&
    ['', 'Mensual'].includes(contract.frequency ?? '') && ['', 'Básico'].includes(contract.billingProfile ?? '') &&
    ['', 'Activo'].includes(contract.billingStatus ?? '') && !contract.billingPeriodStart && !contract.billingPeriodEnd &&
    (contract.billingDay ?? 1) === (customer.billing.billingDay ?? 1) &&
    (!contract.startBillingAt || contract.startBillingAt === contract.startsAt);
}

function verifyContractChanges(previous: WorkspaceCustomer, proposed: WorkspaceCustomer, identity: WorkspaceIdentity) {
  const oldContracts = new Map(previous.contracts.map((contract) => [contract.id, contract]));
  const newContracts = new Map(proposed.contracts.map((contract) => [contract.id, contract]));
  if (identity.role === 'billing' && (oldContracts.size !== newContracts.size || [...oldContracts.keys()].some((key) => !newContracts.has(key)))) throw forbidden();
  for (const [id, existing] of oldContracts) {
    const updated = newContracts.get(id);
    if (!updated) {
      if (identity.role === 'support' && (existing.price || existing.invoices?.length || existing.recurringItems?.length || existing.discounts?.length)) throw forbidden();
      continue;
    }
    if (existing.createdAt !== updated.createdAt) throw forbidden();
    if (identity.role === 'billing' && !sameFields(existing, updated, new Set([...financialContractFields, ...managedContractFields]))) throw forbidden();
    if (identity.role === 'support' && !isDeepStrictEqual(onlyFields(existing, financialContractFields), onlyFields(updated, financialContractFields))) throw forbidden();
  }
  if (identity.role === 'support') {
    for (const contract of proposed.contracts) if (!oldContracts.has(contract.id) && !safeSupportContractCreation(contract, proposed)) throw forbidden();
  }
}

function event(identity: WorkspaceIdentity, action: string) {
  return { id: `AUD-${randomUUID()}`, action, actor: identity.user.name, date: new Date().toISOString() };
}

function withServerAudit(proposed: WorkspaceCustomer, previous: WorkspaceCustomer | undefined, identity: WorkspaceIdentity): WorkspaceCustomer {
  const contracts = proposed.contracts.map((contract) => {
    const existing = previous?.contracts.find((item) => item.id === contract.id);
    const changed = !existing || !sameFields(existing, contract, managedContractFields);
    return {
      ...contract,
      audit: changed ? [event(identity, existing ? 'Contrato actualizado' : 'Contrato creado'), ...(existing?.audit ?? [])].slice(0, 1_000) : existing?.audit ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: changed ? new Date().toISOString() : existing?.updatedAt,
    };
  });
  const changed = !previous || !sameFields(previous, proposed, new Set(['audit'])) || !isDeepStrictEqual(previous.contracts.map((item) => item.id), proposed.contracts.map((item) => item.id));
  return {
    ...proposed,
    contracts,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    audit: changed ? [event(identity, previous ? 'Cliente actualizado' : 'Cliente creado'), ...(previous?.audit ?? [])].slice(0, 1_000) : previous.audit,
  };
}

export function authorizeWorkspaceUpdate(previous: WorkspaceCustomer[], proposed: WorkspaceCustomer[], identity: WorkspaceIdentity): WorkspaceCustomer[] {
  requireWorkspaceIdentity(identity);
  if (identity.role === 'viewer') throw forbidden();
  const oldCustomers = new Map(previous.map((customer) => [customer.id, customer]));
  const oldContractOwners = new Map(previous.flatMap((customer) => customer.contracts.map((contract) => [contract.id, customer.id] as const)));
  if (['billing', 'support'].includes(identity.role) && previous.some((customer) => !proposed.some((item) => item.id === customer.id))) throw forbidden();
  const authorized = proposed.map((raw) => {
    const existing = oldCustomers.get(raw.id);
    const customer = preserveHiddenSecrets(raw, existing, identity);
    if (!existing && (identity.role === 'billing' || (identity.role === 'support' && !safeSupportCustomerCreation(customer)))) throw forbidden();
    if (existing) {
      if (existing.createdAt !== customer.createdAt) throw forbidden();
      if (identity.role === 'billing' && !sameFields(existing, customer, new Set([...financialCustomerFields, ...managedCustomerFields]))) throw forbidden();
      if (identity.role === 'support') {
        for (const key of financialCustomerFields) if (!isDeepStrictEqual((existing as unknown as Record<string, unknown>)[key], (customer as unknown as Record<string, unknown>)[key])) throw forbidden();
      }
      verifyContractChanges(existing, customer, identity);
    }
    for (const contract of customer.contracts) {
      const previousOwner = oldContractOwners.get(contract.id);
      if (previousOwner && previousOwner !== customer.id) throw forbidden();
      if (!existing && identity.role === 'support' && !safeSupportContractCreation(contract, customer)) throw forbidden();
    }
    return withServerAudit(customer, existing, identity);
  });
  return authorized;
}
