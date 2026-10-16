import { z } from 'zod';

// Transitional adapter for the existing customer/contract UI. Relational CRM tables
// remain intact; this snapshot preserves fields whose relational module is pending.
export const WORKSPACE_BODY_LIMIT = 2 * 1024 * 1024;
const text = (maximum = 512) => z.string().max(maximum).refine((value) => !value.includes('\0'));
const id = text(100).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const number = z.number().finite().min(-1_000_000_000_000).max(1_000_000_000_000);
const nonnegative = number.nonnegative();
const day = z.number().int().min(1).max(31);
const audit = z.strictObject({ id, action: text(), actor: text(), date: text(100), detail: text(8_000).optional() });
const invoice = z.strictObject({ id, issuedAt: text(100), type: text(), amount: nonnegative, balance: number, status: z.enum(['Pagada', 'Pendiente', 'Anulada']) });
const ticket = z.strictObject({ id, title: text(), category: text(), priority: z.enum(['Baja', 'Media', 'Alta']), status: z.enum(['Abierto', 'En proceso', 'Cerrado']), createdAt: text(100) });
const transaction = z.strictObject({ id, date: text(100), concept: text(2_000), amount: nonnegative, type: z.enum(['Cargo', 'Abono']) });
const discount = z.strictObject({ id, name: text(), amount: nonnegative, type: z.enum(['Porcentaje', 'Importe']) }).refine((value) => value.type !== 'Porcentaje' || value.amount <= 100);
const recurringItem = z.strictObject({ id, name: text(), amount: nonnegative, quantity: z.number().int().min(1).max(100_000) });
const device = z.strictObject({ id, name: text(), pushToken: text(4_096), createdAt: text(100) });
const gateway = z.strictObject({ id, name: text(), enabled: z.boolean(), notifyInvoices: z.boolean() });
const latitude = z.number().finite().min(-90).max(90);
const longitude = z.number().finite().min(-180).max(180);

export function safePortalLink(value: string): boolean {
  if (value === '') return true;
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (/^\/(?!\/)[A-Za-z0-9/_-]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export const contractSchema = z.strictObject({
  id, plan: text(), server: text(), node: text(), ipAddress: text(100),
  status: z.enum(['Habilitado', 'Deshabilitado', 'Alertado', 'Degradado', 'Suspendido']),
  downstreamGb: nonnegative, upstreamGb: nonnegative, price: nonnegative.optional(), frequency: text().optional(),
  accessMode: z.enum(['Estática', 'PPPoE', 'DHCP']).optional(), hostType: z.enum(['Host', 'Subred']).optional(),
  interfaceName: text().optional(), macAddress: text(100).optional(), netmask: text(100).optional(), gateway: text(100).optional(),
  dnsPrimary: text(100).optional(), dnsSecondary: text(100).optional(), invoices: z.array(invoice).max(2_000).optional(),
  items: z.array(text()).max(500).optional(), tickets: z.array(ticket).max(1_000).optional(),
  serialNumber: text(100).optional(), createdAt: text(100).optional(), startsAt: text(100).optional(), updatedAt: text(100).optional(),
  username: text().optional(), password: text(1_024).optional(), wifiPassword: text(1_024).optional(), notes: text(8_000).optional(),
  billingProfile: text().optional(), billingStatus: text().optional(), startBillingAt: text(100).optional(),
  billingPeriodStart: text(100).optional(), billingPeriodEnd: text(100).optional(), billingDay: day.optional(),
  trafficTolerancePercent: z.number().finite().min(0).max(100).optional(), cpePort: z.number().int().min(1).max(65_535).optional(),
  cpeProtocol: z.enum(['http', 'https', 'ssh', 'telnet', '']).optional(), parentQueue: text().optional(), priority: z.number().int().min(1).max(8).optional(),
  network: text().optional(), oltEnabled: z.boolean().optional(), olt: text().optional(), onuSerial: text().optional(), onuPort: text().optional(),
  nap: text().optional(), cableModemEnabled: z.boolean().optional(), cableModemId: text().optional(), latitude: latitude.optional(), longitude: longitude.optional(),
  audit: z.array(audit).max(1_000).optional(), pppProfile: text().optional(), pppoeServer: text().optional(), bandwidthControl: z.boolean().optional(),
  fullNatAddress: text(100).optional(), uploadPriority: z.number().int().min(1).max(8).optional(), downloadPriority: z.number().int().min(1).max(8).optional(),
  discounts: z.array(discount).max(100).optional(), recurringItems: z.array(recurringItem).max(500).optional(), oltMode: z.enum(['Router', 'Bridge']).optional(),
  onuId: text().optional(), napPort: text().optional(), sealCode: text().optional(), vlan: z.number().int().min(1).max(4_094).optional(), extraVlans: text().optional(),
  oltBandwidthControl: z.boolean().optional(), catvControl: z.boolean().optional(), provisionWan: z.boolean().optional(),
});

export const customerSchema = z.strictObject({
  id, customId: text(100).min(1), kind: z.enum(['Persona física', 'Persona jurídica', 'Otro']), name: text().min(1), document: text(), createdAt: text(100),
  address: z.strictObject({ street: text(), number: text(100).optional(), neighborhood: text(), city: text(), state: text(), postalCode: text(100), latitude, longitude, additionalData: text(4_000).optional() }),
  contact: z.strictObject({ email: text(320), mobile: text(100), landline: text(100) }),
  billing: z.strictObject({
    enabled: z.boolean(), taxId: text(100), legalName: text(), legalEntity: text(), regime: text().optional(), invoiceType: text().optional(),
    billingDay: day.optional(), paymentMethod: text().optional(), cfdiUse: text().optional(), emailInvoice: z.boolean().optional(), emailPayment: z.boolean().optional(),
    informAfterPayment: z.boolean().optional(), automaticStatus: z.boolean().optional(), paymentForm: text().optional(), additionalInfo: text(8_000).optional(),
    additionalInfo2: text(8_000).optional(), notificationEmails: text(4_000).optional(),
  }),
  assignment: z.strictObject({ zone: text(), seller: text(), collector: text() }),
  account: z.strictObject({ status: z.enum(['Al corriente', 'Saldo a favor', 'Con deuda']), balance: number, credit: nonnegative, unpaidInvoices: z.number().int().nonnegative().max(100_000).optional(), transactions: z.array(transaction).max(2_000).optional() }),
  communication: z.strictObject({ email: z.boolean(), sms: z.boolean(), whatsapp: z.boolean() }),
  portalAccess: z.boolean(), portalLink: text(2_048).refine(safePortalLink).optional(), paymentGateway: text(), devices: z.number().int().nonnegative().max(10_000),
  deviceRecords: z.array(device).max(500).optional(), gatewayAccounts: z.array(gateway).max(100).optional(), notes: text(8_000),
  contracts: z.array(contractSchema).max(500), audit: z.array(audit).max(1_000),
});

export const customersSchema = z.array(customerSchema).max(5_000).superRefine((customers, ctx) => {
  const customerIds = new Set<string>();
  const customIds = new Set<string>();
  const contractIds = new Set<string>();
  const serials = new Set<string>();
  const connections = new Set<string>();
  for (const customer of customers) {
    for (const [values, value] of [[customerIds, customer.id], [customIds, customer.customId]] as const) {
      const key = value.toLocaleLowerCase('es-MX');
      if (values.has(key)) ctx.addIssue({ code: 'custom', message: 'Identificadores duplicados.' });
      values.add(key);
    }
    for (const contract of customer.contracts) {
      const key = contract.id.toLocaleLowerCase('es-MX');
      const serial = (contract.serialNumber || contract.id).trim().toLocaleLowerCase('es-MX');
      if (contractIds.has(key) || serials.has(serial)) ctx.addIssue({ code: 'custom', message: 'Contratos duplicados.' });
      contractIds.add(key); serials.add(serial);
      for (const [kind, value] of [['ip', contract.ipAddress], ['pppoe', contract.accessMode === 'PPPoE' ? contract.username : undefined]] as const) {
        if (!value?.trim()) continue;
        const connection = `${contract.server.trim().toLocaleLowerCase('es-MX')}|${kind}|${value.trim().toLocaleLowerCase('es-MX')}`;
        if (connections.has(connection)) ctx.addIssue({ code: 'custom', message: 'Conexión duplicada en el servidor.' });
        connections.add(connection);
      }
    }
  }
});

export const workspaceUpdateSchema = z.strictObject({ customers: customersSchema, version: z.number().int().min(0).max(2_147_483_646) });
export const workspaceEnvelopeSchema = z.strictObject({ schemaVersion: z.literal(1), organizationId: z.uuid(), version: z.number().int().min(1), customers: customersSchema });
export type WorkspaceCustomer = z.infer<typeof customerSchema>;
export type WorkspaceContract = z.infer<typeof contractSchema>;
