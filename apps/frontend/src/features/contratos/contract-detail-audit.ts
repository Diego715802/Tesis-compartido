import type { CustomerAuditEvent, CustomerContract } from "../clientes/customer-types";

export function contractAuditRecords(customerAudit: CustomerAuditEvent[], contract: CustomerContract) {
  const identifier = contract.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const reference = new RegExp(`\\bContrato\\s+${identifier}(?=$|[;\\s])`, "i");
  const events = new Map((contract.audit ?? []).map((event) => [event.id, event]));
  for (const event of customerAudit) {
    if ((reference.test(event.detail ?? "") || reference.test(event.action)) && !events.has(event.id)) events.set(event.id, event);
  }
  return { contractEvents: [...events.values()], customerEvents: customerAudit.filter((event) => !events.has(event.id)) };
}
