export type CustomerKind = "Persona física" | "Persona jurídica" | "Otro";

export type AccountStatus = "Al corriente" | "Saldo a favor" | "Con deuda";

export type ServiceStatus = "Habilitado" | "Alertado" | "Degradado" | "Suspendido";

export type CustomerInvoice = {
  id: string;
  issuedAt: string;
  type: string;
  amount: number;
  balance: number;
  status: "Pagada" | "Pendiente" | "Anulada";
};

export type CustomerTicket = {
  id: string;
  title: string;
  category: string;
  priority: "Baja" | "Media" | "Alta";
  status: "Abierto" | "En proceso" | "Cerrado";
  createdAt: string;
};

export type CustomerContract = {
  id: string;
  plan: string;
  server: string;
  node: string;
  ipAddress: string;
  status: ServiceStatus;
  downstreamGb: number;
  upstreamGb: number;
  price?: number;
  frequency?: string;
  accessMode?: "Estática" | "PPPoE" | "DHCP";
  hostType?: "Host" | "Subred";
  interfaceName?: string;
  macAddress?: string;
  netmask?: string;
  gateway?: string;
  dnsPrimary?: string;
  dnsSecondary?: string;
  invoices?: CustomerInvoice[];
  items?: string[];
  tickets?: CustomerTicket[];
};

export type CustomerAuditEvent = {
  id: string;
  action: string;
  actor: string;
  date: string;
  detail?: string;
};

export type CustomerTransaction = {
  id: string;
  date: string;
  concept: string;
  amount: number;
  type: "Cargo" | "Abono";
};

export type CustomerDevice = {
  id: string;
  name: string;
  pushToken: string;
  createdAt: string;
};

export type CustomerGateway = {
  id: string;
  name: string;
  enabled: boolean;
  notifyInvoices: boolean;
};

export type Customer = {
  id: string;
  customId: string;
  kind: CustomerKind;
  name: string;
  document: string;
  createdAt: string;
  address: {
    street: string;
    number?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    additionalData?: string;
  };
  contact: {
    email: string;
    mobile: string;
    landline: string;
  };
  billing: {
    enabled: boolean;
    taxId: string;
    legalName: string;
    legalEntity: string;
    regime?: string;
    invoiceType?: string;
    billingDay?: number;
    paymentMethod?: string;
    cfdiUse?: string;
    emailInvoice?: boolean;
    emailPayment?: boolean;
    informAfterPayment?: boolean;
    automaticStatus?: boolean;
    paymentForm?: string;
    additionalInfo?: string;
    additionalInfo2?: string;
    notificationEmails?: string;
  };
  assignment: {
    zone: string;
    seller: string;
    collector: string;
  };
  account: {
    status: AccountStatus;
    balance: number;
    credit: number;
    unpaidInvoices?: number;
    transactions?: CustomerTransaction[];
  };
  communication: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  portalAccess: boolean;
  portalLink?: string;
  paymentGateway: string;
  devices: number;
  deviceRecords?: CustomerDevice[];
  gatewayAccounts?: CustomerGateway[];
  notes: string;
  contracts: CustomerContract[];
  audit: CustomerAuditEvent[];
};

export type CustomerFilters = {
  name: string;
  email: string;
  landline: string;
  document: string;
  mobile: string;
  address: string;
  customId: string;
  ip: string;
  kind: CustomerKind | "Todos";
  plan: string;
  server: string;
  billing: "Todos" | "Habilitada" | "No habilitada";
  account: AccountStatus | "Todos";
};

export type CustomerDetailTab = "detalle" | "consumo" | "mapa" | "pagos" | "app" | "auditoria";

export type CustomerQuickAction = "detail" | "account" | "edit" | "password";
