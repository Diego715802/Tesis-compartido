export type BillingView =
  | "borradores"
  | "emitidas"
  | "notas"
  | "pagos"
  | "promesas"
  | "comprobantes"
  | "arqueos";

export type InvoiceRecord = {
  id: number;
  client: string;
  business: string;
  contract: string;
  type: "Comprobante" | "Factura";
  amount: number;
  balance: number;
  issuedAt: string;
  period: string;
  status: "Pagada" | "Impaga" | "Anulada" | "Borrador";
  paymentMethod: string;
  dueAt: string;
  concept: string;
};

export type CreditNoteRecord = {
  id: number;
  client: string;
  invoice: number;
  amount: number;
  issuedAt: string;
  status: "Aplicada" | "Anulada";
  category: string;
  description: string;
};

export type PaymentRecord = {
  id: number;
  client: string;
  paidAt: string;
  amount: number;
  credit: number;
  collector: string;
  registeredBy: string;
  method: string;
  status: "Vigente" | "Anulado";
  invoice: number;
};

export type PaymentPromiseRecord = {
  id: number;
  client: string;
  contract: string;
  debt: number;
  mobile: boolean;
  validUntil: string;
  type: "Manual" | "Automática";
  creator: string;
  createdAt: string;
};

export type ReceiptRecord = {
  id: number;
  client: string;
  status: "Procesado" | "Pendiente";
  createdAt: string;
};

export type CashAuditRecord = {
  id: number;
  createdAt: string;
  creator: string;
  creatorInitials: string;
  transactions: number;
  amount: number;
  cash: number;
  transfer: number;
  card: number;
};

export const billingViewItems: readonly { value: BillingView; label: string }[] = [
  { value: "borradores", label: "Borradores" },
  { value: "emitidas", label: "Emitidas" },
  { value: "notas", label: "Notas de crédito" },
  { value: "pagos", label: "Pagos" },
  { value: "promesas", label: "Promesas de pago" },
  { value: "comprobantes", label: "Comprobantes de Pago" },
  { value: "arqueos", label: "Arqueos de caja" },
] as const;

const clients = [
  "Cliente Demo Norte",
  "Comercio Central Demo",
  "Residencial Alameda",
  "Tienda La Estación",
  "Servicios Horizonte",
  "Cliente Demo Reforma",
  "Cafetería del Parque",
  "Papelería Los Pinos",
  "Consultorio San Miguel",
  "Cliente Demo Jardines",
  "Abarrotes La Plaza",
  "Estudio Creativo Sur",
];

export const draftInvoices: InvoiceRecord[] = [
  { id: 2218, client: clients[0], business: "COMECORE Telecomunicaciones", contract: "#120 · Plan Conecta 100", type: "Comprobante", amount: 350, balance: 350, issuedAt: "—", period: "Sep. 2026", status: "Borrador", paymentMethod: "Por definir", dueAt: "04/10/2026", concept: "Servicio mensual" },
  { id: 2219, client: clients[3], business: "COMECORE Telecomunicaciones", contract: "#143 · Plan Negocio", type: "Comprobante", amount: 550, balance: 550, issuedAt: "—", period: "Sep. 2026", status: "Borrador", paymentMethod: "Transferencia", dueAt: "05/10/2026", concept: "Servicio mensual" },
  { id: 2220, client: clients[7], business: "COMECORE Telecomunicaciones", contract: "#207 · Plan Conecta 50", type: "Factura", amount: 238, balance: 238, issuedAt: "—", period: "Sep. 2026", status: "Borrador", paymentMethod: "Efectivo", dueAt: "06/10/2026", concept: "Reconexión" },
];

export const issuedInvoices: InvoiceRecord[] = clients.map((client, index) => ({
  id: 2191 - index,
  client,
  business: "COMECORE Telecomunicaciones",
  contract: `#${215 + index} · ${index % 3 === 0 ? "Plan Negocio" : index % 2 === 0 ? "Conecta 50" : "Conecta 100"}`,
  type: index % 4 === 0 ? "Factura" : "Comprobante",
  amount: [350, 400, 186, 338, 350, 386, 350, 526, 550, 338, 2750, 350][index],
  balance: index % 5 === 1 ? [350, 400, 186, 338, 350, 386, 350, 526, 550, 338, 2750, 350][index] : 0,
  issuedAt: `28/09/2026 ${String(12 - Math.floor(index / 2)).padStart(2, "0")}:${String(54 - index * 3).padStart(2, "0")}`,
  period: "27/09/2026",
  status: index === 4 ? "Anulada" : index % 5 === 1 ? "Impaga" : "Pagada",
  paymentMethod: index % 3 === 0 ? "Transferencia electrónica" : index % 3 === 1 ? "Efectivo" : "Mercado Pago",
  dueAt: "04/10/2026",
  concept: "Plan Conecta · Septiembre 2026",
}));

export const creditNotes: CreditNoteRecord[] = clients.slice(0, 10).map((client, index) => ({
  id: 173 - index,
  client,
  invoice: 1794 - index * 17,
  amount: index % 4 === 2 ? 0 : [350, 13.33, 400, 350, 550][index % 5],
  issuedAt: `${String(11 - index).padStart(2, "0")}/09/2026 12:${String(47 - index * 2).padStart(2, "0")}`,
  status: index === 1 ? "Aplicada" : "Anulada",
  category: index % 3 === 0 ? "Bonificación comercial" : index % 3 === 1 ? "Ajuste de saldo" : "Error administrativo",
  description: index % 3 === 0 ? "Crédito por ajuste del servicio mensual" : "Nota de crédito de demostración",
}));

export const payments: PaymentRecord[] = clients.map((client, index) => ({
  id: 2754 - index,
  client,
  paidAt: "28/09/2026",
  amount: [350, 1350, 178, 238, 238, 298, 298, 238, 298, 178, 548, 298][index],
  credit: index === 1 ? 50 : 0,
  collector: index % 3 === 0 ? "Elizabeth E." : "Jenifer M.",
  registeredBy: index % 4 === 0 ? "Juan J. Córdova" : "Jenifer M.",
  method: ["Efectivo", "Cuenta Juan", "Efectivo", "Mercado Pago", "Transferencia", "Mercado Pago"][index % 6],
  status: index === 8 ? "Anulado" : "Vigente",
  invoice: 2098 - index,
}));

export const paymentPromises: PaymentPromiseRecord[] = clients.map((client, index) => ({
  id: 910 - index,
  client,
  contract: `#${31 + index} · ${index % 2 ? "Conecta 100" : "Conecta 50"} · 172.35.${index}.${71 + index}`,
  debt: index % 3 === 2 ? 0 : index % 2 ? 238 : 298,
  mobile: index === 5 || index === 6,
  validUntil: `${String(30 - index).padStart(2, "0")}/10/2026`,
  type: index === 10 ? "Automática" : "Manual",
  creator: index < 7 ? "Jenifer Megan Equia" : "Operador Demo",
  createdAt: `${String(28 - index).padStart(2, "0")}/09/2026 ${21 - Math.floor(index / 3)}:${String(49 - index * 2).padStart(2, "0")}:26`,
}));

export const paymentReceipts: ReceiptRecord[] = [
  { id: 848, client: clients[0], status: "Procesado", createdAt: "16/07/2026 21:58:55" },
  { id: 320, client: clients[1], status: "Procesado", createdAt: "13/07/2026 11:41:19" },
  { id: 283, client: clients[2], status: "Procesado", createdAt: "12/07/2026 19:14:19" },
  { id: 140, client: clients[3], status: "Procesado", createdAt: "28/06/2026 14:05:04" },
  { id: 11, client: clients[4], status: "Procesado", createdAt: "01/06/2026 13:55:54" },
];

export const cashAudits: CashAuditRecord[] = [
  { id: 1, createdAt: "01/07/2026 09:52:19", creator: "Operador de caja", creatorInitials: "OC", transactions: 670, amount: 273230.01, cash: 128450, transfer: 98780.01, card: 46000 },
];

export const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
