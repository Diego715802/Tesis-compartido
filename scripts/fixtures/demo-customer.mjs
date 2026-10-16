// Datos sintéticos para desarrollo: no representan un abonado ni un servicio real.
export const DEMO_CUSTOMER_KEY = 'demo-comecore-client-001';
export const DEMO_CUSTOMER_CODE = 'CCPRUEBA001';
export const DEMO_PLANS = [
  { name: 'PRUEBA - Fibra 50 Mbps', price: 349, speed: 50000 },
  { name: 'PRUEBA - Enlace 20 Mbps', price: 199, speed: 20000 },
];
export function makeDemoCustomer(planIds, today = new Date()) {
  const date = today.toISOString().slice(0, 10);
  const previous = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 15)).toISOString().slice(0, 10);
  const position = { latitude: 19.6906, longitude: -98.8693 };
  const invoices = [
    { id: 'DEMO-REC-001', issuedAt: previous, type: 'Comprobante de prueba', amount: 349, balance: 0, status: 'Pagada' },
    { id: 'DEMO-REC-002', issuedAt: date, type: 'Comprobante de prueba', amount: 349, balance: 349, status: 'Pendiente' },
    { id: 'DEMO-REC-003', issuedAt: date, type: 'Comprobante de prueba', amount: 199, balance: 199, status: 'Pendiente' },
  ];
  return {
    id: DEMO_CUSTOMER_KEY, customId: DEMO_CUSTOMER_CODE, kind: 'Otro',
    name: 'Cliente Ficticio ComeCore - PRUEBAS', document: 'FICTICIO-001', createdAt: today.toISOString(),
    address: { street: 'Ubicación de demostración', number: 'S/N', neighborhood: 'Centro', city: 'Teotihuacán', state: 'Estado de México', postalCode: '55800', ...position, additionalData: 'Punto ilustrativo; no es un domicilio de abonado.' },
    contact: { email: 'cliente.comecore@example.invalid', mobile: '+1 202 555 0123', landline: '' },
    billing: { enabled: false, taxId: '', legalName: 'Cliente ficticio de demostración', legalEntity: 'Otro', regime: '', invoiceType: 'Comprobante', billingDay: 15, paymentMethod: 'Por definir', paymentForm: '99 - Por definir', cfdiUse: 'G03 - Gastos en general', emailInvoice: false, emailPayment: false, informAfterPayment: false, automaticStatus: false, notificationEmails: '', additionalInfo: 'SOLO PRUEBAS. Sin timbrado fiscal ni cobros reales.', additionalInfo2: '' },
    assignment: { zone: 'Zona de pruebas', seller: 'Sin asignar', collector: 'Sin asignar' },
    account: { status: 'Con deuda', balance: 548, credit: 0, unpaidInvoices: 2, transactions: [
      { id: 'DEMO-MOV-001', date: previous, concept: 'Cargo ficticio del periodo anterior', amount: 349, type: 'Cargo' },
      { id: 'DEMO-MOV-002', date: previous, concept: 'Abono ficticio del periodo anterior', amount: 349, type: 'Abono' },
      { id: 'DEMO-MOV-003', date, concept: 'Cargo ficticio: Fibra 50 Mbps', amount: 349, type: 'Cargo' },
      { id: 'DEMO-MOV-004', date, concept: 'Cargo ficticio: Enlace 20 Mbps', amount: 199, type: 'Cargo' },
    ] },
    communication: { email: false, sms: false, whatsapp: false }, portalAccess: false, portalLink: '', paymentGateway: 'Sin pasarela',
    devices: 1, deviceRecords: [{ id: 'DEMO-ANDROID-001', name: 'Android de prueba (sin vincular)', pushToken: '', createdAt: today.toISOString() }], gatewayAccounts: [],
    notes: 'EXPEDIENTE FICTICIO para pruebas manuales. No enviar comunicaciones, cobrar, timbrar ni aprovisionar equipos. El dispositivo Android es una referencia sin conexión a una app. Los recibos y tickets son escenarios del expediente, no operaciones de servicios externos.',
    contracts: DEMO_PLANS.map((plan, index) => ({
      id: `demo-comecore-contract-00${index + 1}`, serialNumber: `DEMO-CTR-00${index + 1}`, planId: planIds[index], plan: plan.name,
      server: 'Sin configurar', node: 'Sin configurar', ipAddress: `192.0.2.${50 + index}`, status: index ? 'Suspendido' : 'Habilitado',
      downstreamGb: 0, upstreamGb: 0, price: plan.price, frequency: 'Mensual', accessMode: 'Estática', hostType: 'Host',
      netmask: '255.255.255.0', gateway: '192.0.2.1', macAddress: `02:00:00:00:00:${50 + index}`, interfaceName: '',
      username: '', password: '', wifiPassword: '', startsAt: date, createdAt: today.toISOString(), ...position,
      billingProfile: 'Básico', billingStatus: index ? 'Suspendido' : 'Activo', billingDay: 15, startBillingAt: date,
      bandwidthControl: false, oltEnabled: false, cableModemEnabled: false, provisionWan: false,
      invoices: index ? [invoices[2]] : invoices.slice(0, 2), items: ['Internet de demostración; sin provisión de red'],
      tickets: [{ id: `DEMO-TICKET-00${index + 1}`, title: index ? 'Revisar suspensión de prueba' : 'Consulta ficticia de velocidad', category: 'Soporte', priority: index ? 'Alta' : 'Baja', status: index ? 'Abierto' : 'Cerrado', createdAt: today.toISOString() }],
      notes: 'Servicio ficticio. IP de documentación; sin router o nodo asignado ni credenciales.', audit: [],
    })), audit: [],
  };
}
