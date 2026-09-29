import type {
  AccountStatus,
  Customer,
  CustomerKind,
  ServiceStatus,
} from "./customer-types";

const names = [
  "Arturo Santiago Mendoza",
  "Jerlys Mojena García",
  "José de Jesús Vargas",
  "Alfredo Chaves Romero",
  "Moisés Roberto Hernández Ibarra",
  "Carlos Alberto Hernández Rivas",
  "Irene Luna Cruz",
  "Mariana Torres Mendoza",
  "Andrés Valdés Molina",
  "Paola Jiménez Ortega",
  "Daniel Ramírez Soto",
  "Gabriela Flores Ruiz",
  "Fernando Ortiz Luna",
  "Alejandra Vega Castillo",
  "Miguel Ángel Navarro",
  "Sofía Castillo Campos",
  "Ricardo Mendoza Silva",
  "Lucía Herrera Rojas",
  "Jorge Aguilar Moreno",
  "Natalia Salgado León",
  "Víctor Cabrera Núñez",
  "Camila Reyes Fuentes",
  "Héctor Morales Díaz",
  "Valeria Sánchez Ponce",
  "Óscar Medina Robles",
  "Renata López Carrillo",
] as const;

const streets = [
  "Av. Tecnológico 410",
  "Calle del Enlace 28",
  "Circuito Infraestructura 122",
  "Paseo de la Red 89",
  "Calle Conectividad 17",
  "Av. Valle Central 244",
] as const;

const neighborhoods = [
  "Centro",
  "Jardines del Valle",
  "Lomas del Norte",
  "Nueva Conexión",
  "Parque Industrial",
] as const;

const plans = ["Fibra 100", "Fibra 200", "Fibra 300", "Empresarial 500"] as const;
const servers = ["Core Norte", "Core Centro", "Core Sur"] as const;
const nodes = ["Nodo Álamo", "Nodo Centro", "Nodo Mirador", "Nodo Valle"] as const;
const zones = ["Norte", "Centro", "Sur"] as const;
const sellers = ["Laura Méndez", "Diego Reyes", "Sergio Valle"] as const;
const collectors = ["Caja central", "María López", "Recaudación norte"] as const;

function accountStatus(index: number): AccountStatus {
  if (index % 7 === 2) return "Con deuda";
  if (index % 6 === 1) return "Saldo a favor";
  return "Al corriente";
}

function serviceStatus(index: number): ServiceStatus {
  if (index % 11 === 5) return "Suspendido";
  if (index % 8 === 3) return "Degradado";
  if (index % 6 === 2) return "Alertado";
  return "Habilitado";
}

function customerKind(index: number): CustomerKind {
  return index % 8 === 4 ? "Persona jurídica" : "Persona física";
}

export const demoCustomers: Customer[] = names.map((name, index) => {
  const sequence = index + 29;
  const status = accountStatus(index);
  const plan = plans[index % plans.length];
  const kind = customerKind(index);
  const hasSecondContract = index % 9 === 0;

  return {
    id: `CUS-${String(sequence).padStart(5, "0")}`,
    customId: `CC-${String(sequence).padStart(4, "0")}`,
    kind,
    name,
    document: kind === "Persona jurídica" ? `CCO${String(880100 + sequence)}A${index}` : `CURP${String(420000 + sequence)}`,
    createdAt: `2026-${String((index % 8) + 1).padStart(2, "0")}-${String((index % 23) + 1).padStart(2, "0")}`,
    address: {
      street: streets[index % streets.length],
      neighborhood: neighborhoods[index % neighborhoods.length],
      city: index % 3 === 0 ? "Toluca" : "Metepec",
      state: "Estado de México",
      postalCode: String(50000 + index * 17),
      latitude: 19.2826 + index * 0.0021,
      longitude: -99.6557 + index * 0.0014,
      additionalData: index % 3 === 0 ? "Portón gris; preguntar por recepción." : "",
    },
    contact: {
      email: `${name.toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@correo.mx`,
      mobile: `+52 722 ${String(4100000 + index * 731).padStart(7, "0")}`,
      landline: index % 4 === 0 ? `722 ${String(2100000 + index * 193)}` : "Sin teléfono fijo",
    },
    billing: {
      enabled: index % 5 !== 3,
      taxId: kind === "Persona jurídica" ? `RFC${String(701000 + sequence)}MX` : `XAXX010101${String(index).padStart(3, "0")}`,
      legalName: kind === "Persona jurídica" ? `${name} S.A. de C.V.` : name,
      legalEntity: index % 2 === 0 ? "ComeCore Telecom" : "ComeCore Servicios",
      regime: kind === "Persona jurídica" ? "Régimen general de ley" : "Personas físicas con actividad empresarial",
      invoiceType: "Comprobante",
      billingDay: (index % 25) + 1,
      paymentMethod: index % 2 === 0 ? "Transferencia electrónica" : "Por definir",
      cfdiUse: "G03 - Gastos en general",
      emailInvoice: true,
      emailPayment: index % 3 !== 0,
    },
    assignment: {
      zone: zones[index % zones.length],
      seller: sellers[index % sellers.length],
      collector: collectors[index % collectors.length],
    },
    account: {
      status,
      balance: status === "Con deuda" ? 749 + index * 12 : status === "Saldo a favor" ? -(180 + index * 5) : 0,
      credit: status === "Saldo a favor" ? 180 + index * 5 : 0,
      unpaidInvoices: status === "Con deuda" ? 1 + (index % 2) : 0,
      transactions: status === "Con deuda" ? [
        { id: `MOV-${index}-1`, date: "2026-09-01", concept: "Factura mensual de servicio", amount: 749 + index * 12, type: "Cargo" as const },
      ] : [],
    },
    communication: {
      email: true,
      sms: index % 3 !== 0,
      whatsapp: index % 4 !== 0,
    },
    portalAccess: index % 5 !== 2,
    portalLink: `https://clientes.comecore.local/acceso/CC-${String(sequence).padStart(4, "0")}`,
    paymentGateway: index % 4 === 0 ? "Sin pasarela" : index % 2 === 0 ? "Mercado Pago" : "Conekta",
    devices: index % 4,
    deviceRecords: index % 4 === 0 ? [] : [
      { id: `DEV-${sequence}`, name: index % 2 === 0 ? "Teléfono Android" : "iPhone", pushToken: `push_${sequence}_••••••••`, createdAt: "2026-09-18 09:14" },
    ],
    gatewayAccounts: index % 4 === 0 ? [] : [
      { id: `GTW-${sequence}`, name: index % 2 === 0 ? "Mercado Pago" : "Conekta", enabled: true, notifyInvoices: true },
    ],
    notes: index % 5 === 0 ? "Prefiere contacto por la tarde. Confirmar antes de una visita técnica." : "Sin observaciones operativas.",
    contracts: [
      {
        id: `CTR-${String(1030 + index)}`,
        plan,
        server: servers[index % servers.length],
        node: nodes[index % nodes.length],
        ipAddress: `10.${24 + (index % 3)}.${Math.floor(index / 5) + 1}.${20 + index}`,
        status: serviceStatus(index),
        downstreamGb: Number((8.4 + index * 1.37).toFixed(1)),
        upstreamGb: Number((1.2 + index * 0.42).toFixed(1)),
        price: 499 + (index % 4) * 150,
        frequency: "Mensual",
        accessMode: index % 3 === 0 ? "PPPoE" : index % 3 === 1 ? "Estática" : "DHCP",
        hostType: "Host",
        interfaceName: `sfp-salida-${(index % 4) + 1}`,
        macAddress: `AC:7${index % 10}:2B:9C:${String(index).padStart(2, "0")}:11`,
        netmask: "255.255.255.0",
        gateway: `10.${24 + (index % 3)}.${Math.floor(index / 5) + 1}.1`,
        dnsPrimary: "1.1.1.1",
        dnsSecondary: "8.8.8.8",
        invoices: [
          { id: `FAC-${580 + index}`, issuedAt: "2026-09-01", type: "Comprobante", amount: 499 + (index % 4) * 150, balance: status === "Con deuda" ? 499 + (index % 4) * 150 : 0, status: status === "Con deuda" ? "Pendiente" as const : "Pagada" as const },
          { id: `FAC-${369 + index}`, issuedAt: "2026-08-01", type: "Comprobante", amount: 499 + (index % 4) * 150, balance: 0, status: "Pagada" as const },
        ],
        items: index % 3 === 0 ? ["Router Wi‑Fi 6 en comodato"] : [],
        tickets: index % 5 === 0 ? [
          { id: `TKT-${900 + index}`, title: "Validar niveles de señal", category: "Soporte técnico", priority: "Media" as const, status: "En proceso" as const, createdAt: "2026-09-21" },
        ] : [],
      },
      ...(hasSecondContract
        ? [
            {
              id: `CTR-${String(2080 + index)}`,
              plan: "Fibra 100",
              server: "Core Centro",
              node: "Nodo Centro",
              ipAddress: `10.31.2.${80 + index}`,
              status: "Habilitado" as const,
              downstreamGb: 5.8,
              upstreamGb: 0.9,
              price: 399,
              frequency: "Mensual",
              accessMode: "Estática" as const,
              hostType: "Host" as const,
              interfaceName: "ether-usuarios-2",
              netmask: "255.255.255.0",
              invoices: [],
              items: [],
              tickets: [],
            },
          ]
        : []),
    ],
    audit: [
      {
        id: `AUD-${index}-1`,
        action: "Se actualizó la información de contacto",
        actor: "Administración",
        date: "2026-09-22 11:34",
      },
      {
        id: `AUD-${index}-2`,
        action: "Se consultó la cuenta corriente",
        actor: "Cobranza",
        date: "2026-09-18 09:12",
      },
      {
        id: `AUD-${index}-3`,
        action: "Cliente creado",
        actor: sellers[index % sellers.length],
        date: `${`2026-${String((index % 8) + 1).padStart(2, "0")}-${String((index % 23) + 1).padStart(2, "0")}`} 15:20`,
      },
    ],
  };
});

export const customerFilterOptions = {
  plans: [...new Set(demoCustomers.flatMap((customer) => customer.contracts.map((contract) => contract.plan)))],
  servers: [...new Set(demoCustomers.flatMap((customer) => customer.contracts.map((contract) => contract.server)))],
};
