import { customerFilterOptions } from "../clientes/customer-data";
import type { Customer, CustomerContract } from "../clientes/customer-types";
import { networkNodes } from "../nodos/node-data";

export type ContractFormErrors = Record<string, string>;
export type ContractFormTab = "basic" | "billing" | "advanced";
export type ContractFormOptions = ReturnType<typeof contractFormOptions>;

const unique = (values: (string | undefined)[]) => [...new Set(values.filter((value): value is string => Boolean(value?.trim())))].sort((a, b) => a.localeCompare(b, "es"));

export function contractFormOptions(customers: Customer[], server: string, olt?: string) {
  const contracts = customers.flatMap((customer) => customer.contracts);
  const forServer = contracts.filter((contract) => contract.server === server);
  return {
    plans: unique([...customerFilterOptions.plans, ...contracts.map((contract) => contract.plan)]),
    servers: unique([...customerFilterOptions.servers, ...contracts.map((contract) => contract.server)]),
    nodes: unique([...networkNodes.map((node) => node.name), ...contracts.map((contract) => contract.node)]),
    interfaces: unique(forServer.map((contract) => contract.interfaceName)),
    items: unique(contracts.flatMap((contract) => contract.items ?? [])),
    networks: unique(forServer.map((contract) => contract.network)),
    pppProfiles: unique(forServer.map((contract) => contract.pppProfile)),
    pppoeServers: unique(forServer.map((contract) => contract.pppoeServer)),
    olts: unique(contracts.map((contract) => contract.olt)),
    naps: unique(contracts.filter((contract) => !olt || contract.olt === olt).map((contract) => contract.nap)),
    queues: unique(forServer.map((contract) => contract.parentQueue)),
    billingProfiles: unique(["Básico", "Corporativo", ...contracts.map((contract) => contract.billingProfile)]),
  };
}

export function blankContract(customers: Customer[], customer?: Customer): CustomerContract {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guatemala" }).format(new Date());
  const contracts = customers.flatMap((item) => item.contracts);
  let sequence = contracts.reduce((maximum, item) => Math.max(maximum, Number(item.id.match(/\d+$/)?.[0] ?? 0)), 0) + 1;
  while (contracts.some((item) => item.id === `CTR-${sequence}` || item.serialNumber === `CTR-${sequence}`)) sequence += 1;
  return {
    id: `CTR-${sequence}`, serialNumber: `CTR-${sequence}`, plan: "", server: "", node: "", ipAddress: "", status: "Habilitado",
    downstreamGb: 0, upstreamGb: 0, accessMode: "Estática", hostType: "Host", interfaceName: "", netmask: "255.255.255.0",
    dnsPrimary: "1.1.1.1", dnsSecondary: "8.8.8.8", price: 0, frequency: "Mensual", billingProfile: "Básico", billingStatus: "Activo",
    createdAt: date, startsAt: date, startBillingAt: date, billingDay: customer?.billing.billingDay ?? 1,
    trafficTolerancePercent: 0, cpeProtocol: "http", cpePort: 80, priority: 8, uploadPriority: 8, downloadPriority: 8,
    bandwidthControl: true, oltMode: "Router", vlan: 101, invoices: [], items: [], tickets: [], discounts: [], recurringItems: [], audit: [],
  };
}

export function validIPv4(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split(".").every((part) => Number(part) <= 255 && (part.length === 1 || !part.startsWith("0")));
}

export function validMask(value: string) {
  if (!validIPv4(value)) return false;
  const bits = value.split(".").map((part) => Number(part).toString(2).padStart(8, "0")).join("");
  return /^1*0*$/.test(bits);
}

const billingFields = new Set(["price", "billingProfile", "billingDay", "startBillingAt", "billingPeriodEnd", "discounts", "recurringItems"]);
const advancedFields = new Set(["startsAt", "trafficTolerancePercent", "cpePort", "uploadPriority", "downloadPriority", "fullNatAddress"]);
export function errorTab(field: string): ContractFormTab { return billingFields.has(field) ? "billing" : advancedFields.has(field) ? "advanced" : "basic"; }

export function validateContract(contract: CustomerContract, customerId: string, customers: Customer[], editing?: { customerId: string; contract: CustomerContract } | null): ContractFormErrors {
  const errors: ContractFormErrors = {};
  const customer = customers.find((item) => item.id === customerId);
  if (!customer) errors.customerId = "Selecciona un cliente registrado.";
  for (const field of ["serialNumber", "plan", "server", "node", "interfaceName"] as const) {
    if (!contract[field]?.trim()) errors[field] = "Este campo es obligatorio.";
  }
  const otherContracts = customers.flatMap((item) => item.contracts.filter((entry) => !(item.id === editing?.customerId && entry.id === editing.contract.id)));
  if (otherContracts.some((item) => (item.serialNumber || item.id).toLocaleLowerCase() === contract.serialNumber?.trim().toLocaleLowerCase())) errors.serialNumber = "El número de serie ya pertenece a otro contrato.";
  const mode = contract.accessMode ?? "Estática";
  if (mode === "Estática" || contract.ipAddress.trim()) {
    if (!validIPv4(contract.ipAddress.trim())) errors.ipAddress = "Ingresa una dirección IPv4 válida.";
    else if (otherContracts.some((item) => item.server === contract.server && item.ipAddress === contract.ipAddress.trim())) errors.ipAddress = "La IP ya está asignada en este servidor.";
  }
  if (mode === "Estática" && !validMask(contract.netmask ?? "")) errors.netmask = "Ingresa una máscara de red válida.";
  const addressFields: ("gateway" | "dnsPrimary" | "dnsSecondary" | "fullNatAddress")[] = mode === "Estática" ? ["gateway", "dnsPrimary", "dnsSecondary", "fullNatAddress"] : ["fullNatAddress"];
  for (const field of addressFields) {
    if (contract[field]?.trim() && !validIPv4(contract[field]!.trim())) errors[field] = "Ingresa una dirección IPv4 válida.";
  }
  if (contract.network?.trim()) {
    const [address, prefix] = contract.network.trim().split("/");
    if (!validIPv4(address) || (prefix !== undefined && (!/^\d+$/.test(prefix) || Number(prefix) > 32))) errors.network = "Ingresa una red IPv4, por ejemplo 10.0.0.0/24.";
  }
  if (mode === "DHCP" && !contract.macAddress?.trim()) errors.macAddress = "La dirección MAC es obligatoria para DHCP.";
  if (contract.macAddress?.trim() && !/^([\da-f]{2}:){5}[\da-f]{2}$/i.test(contract.macAddress.trim())) errors.macAddress = "Usa el formato AA:BB:CC:DD:EE:FF.";
  if (mode === "PPPoE") {
    if (!contract.username?.trim()) errors.username = "Ingresa el usuario PPPoE.";
    else if (otherContracts.some((item) => item.server === contract.server && item.accessMode === "PPPoE" && item.username === contract.username?.trim())) errors.username = "El usuario PPPoE ya está asignado en este servidor.";
    if (!contract.password) errors.password = "Ingresa la contraseña PPPoE.";
    if (!contract.pppProfile?.trim()) errors.pppProfile = "Selecciona o ingresa el perfil PPP.";
  }
  if (contract.oltEnabled) {
    if (!contract.olt?.trim()) errors.olt = "Selecciona o ingresa la OLT.";
    if (!contract.onuSerial?.trim()) errors.onuSerial = "Ingresa el número de serie ONU.";
    if (!contract.onuPort?.trim()) errors.onuPort = "Ingresa el puerto ONU.";
    if (mode === "Estática" && !contract.gateway?.trim()) errors.gateway = "Ingresa el gateway para la OLT.";
    if (mode === "Estática" && !contract.dnsPrimary?.trim()) errors.dnsPrimary = "Ingresa el DNS principal para la OLT.";
    if (contract.vlan !== undefined && (!Number.isInteger(contract.vlan) || contract.vlan < 1 || contract.vlan > 4094)) errors.vlan = "La VLAN debe estar entre 1 y 4094.";
    if (contract.extraVlans?.trim() && contract.extraVlans.split(",").some((value) => !/^\d+$/.test(value.trim()) || Number(value) < 1 || Number(value) > 4094)) errors.extraVlans = "Ingresa VLAN entre 1 y 4094 separadas por coma.";
    if (contract.nap?.trim() && !contract.napPort?.trim()) errors.napPort = "Ingresa el puerto NAP.";
  }
  if (contract.cableModemEnabled && !contract.cableModemId?.trim()) errors.cableModemId = "Ingresa el ID del cable módem.";
  if (customer?.billing.enabled) {
    if (contract.price === undefined || !Number.isFinite(contract.price) || contract.price < 0) errors.price = "Ingresa un precio mayor o igual a cero.";
    if (!contract.billingProfile?.trim()) errors.billingProfile = "Selecciona un perfil de facturación.";
    if (!Number.isInteger(contract.billingDay) || contract.billingDay! < 1 || contract.billingDay! > 31) errors.billingDay = "El día debe estar entre 1 y 31.";
    if (contract.billingPeriodStart && contract.billingPeriodEnd && contract.billingPeriodEnd < contract.billingPeriodStart) errors.billingPeriodEnd = "El fin del período debe ser posterior al inicio.";
    if (contract.discounts?.some((item) => !item.name.trim() || !Number.isFinite(item.amount) || item.amount < 0 || (item.type === "Porcentaje" && item.amount > 100))) errors.discounts = "Completa cada descuento y usa porcentajes entre 0 y 100.";
    if (contract.recurringItems?.some((item) => !item.name.trim() || !Number.isFinite(item.amount) || item.amount < 0 || !Number.isInteger(item.quantity) || item.quantity < 1)) errors.recurringItems = "Completa los artículos con importe válido y cantidad entera positiva.";
  }
  if (contract.trafficTolerancePercent !== undefined && (!Number.isFinite(contract.trafficTolerancePercent) || contract.trafficTolerancePercent < 0 || contract.trafficTolerancePercent > 100)) errors.trafficTolerancePercent = "Ingresa un porcentaje entre 0 y 100.";
  if (contract.cpePort !== undefined && (!Number.isInteger(contract.cpePort) || contract.cpePort < 1 || contract.cpePort > 65535)) errors.cpePort = "El puerto debe estar entre 1 y 65535.";
  for (const field of ["uploadPriority", "downloadPriority"] as const) {
    if (contract[field] !== undefined && (!Number.isInteger(contract[field]) || contract[field]! < 1 || contract[field]! > 8)) errors[field] = "La prioridad debe estar entre 1 y 8.";
  }
  if (!contract.startsAt) errors.startsAt = "Selecciona la fecha de alta.";
  for (const field of ["startsAt", "startBillingAt", "billingPeriodStart", "billingPeriodEnd"] as const) {
    const value = contract[field];
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value)) errors[field] = "Selecciona una fecha válida.";
  }
  return errors;
}

export function cleanContract(contract: CustomerContract): CustomerContract {
  const cleaned = Object.fromEntries(Object.entries(contract).map(([key, value]) => [key, typeof value === "string" && key !== "password" && key !== "wifiPassword" ? value.trim() : value])) as CustomerContract;
  return { ...cleaned, macAddress: cleaned.macAddress?.toUpperCase() };
}
