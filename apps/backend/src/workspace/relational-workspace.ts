import type { PoolClient } from 'pg';
import { isDeepStrictEqual } from 'node:util';
import type { WorkspaceCustomer } from './workspace-schema.js';
import { WorkspaceError, type WorkspaceIdentity } from './workspace-permissions.js';

type Row = Record<string, unknown>;
const text = (row: Row | null | undefined, key: string, fallback = '') => {
  const value = row?.[key];
  if (value == null) return fallback;
  if (['string','number','boolean'].includes(typeof value)) return String(value as string | number | boolean);
  throw new WorkspaceError(503,'WORKSPACE_INCONSISTENT','El registro requiere revisión de integridad.');
};
const number = (row: Row | null | undefined, key: string, fallback = 0) => row?.[key] == null ? fallback : Number(row[key]);
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';
const date = (value: unknown) => iso(value).slice(0, 10);
const kinds: Record<string,string> = { 'Persona física': 'individual', 'Persona jurídica': 'company', Otro: 'other' };
const states: Record<string,string> = { Habilitado: 'enabled', Deshabilitado: 'disabled', Alertado: 'alerted', Degradado: 'degraded', Suspendido: 'suspended' };
const frequencies: Record<string,string> = { Mensual: 'monthly', Bimestral:'bimonthly',Trimestral:'quarterly',Semestral:'semiannual',Semanal: 'weekly', Diario: 'daily', Anual: 'annual', Única: 'once' };
const billingStates: Record<string,string> = { Activo:'active',Suspendido:'suspended',Exento:'exempt',Inactivo:'inactive' };
const reverse = (map: Record<string,string>, value: string, fallback: string) => Object.keys(map).find(key => map[key] === value) ?? fallback;

// Identifiers originate exclusively in the fixed records below, never request keys.
async function upsert(client: PoolClient, table: string, values: Row, conflict: string[], update = Object.keys(values).filter(key => !conflict.includes(key))) {
  const keys = Object.keys(values);
  const result = await client.query(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i+1)).join(',')})
    ON CONFLICT (${conflict.join(',')}) DO UPDATE SET ${update.map(key => `${key}=EXCLUDED.${key}`).join(',')} RETURNING *`, keys.map(key => values[key]));
  if (result.rowCount !== 1) throw new WorkspaceError(403, 'FORBIDDEN', 'No tienes permiso para modificar este registro.');
  return result.rows[0] as Row;
}

export async function lockRelationalWorkspace(client: PoolClient, identity: WorkspaceIdentity) {
  // Serialize only this tenant's workspace, including the first insert race.
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', ['workspace:' + identity.organization.id]);
}

export async function writeRelationalWorkspace(client: PoolClient, identity: WorkspaceIdentity, customers: WorkspaceCustomer[], previous: WorkspaceCustomer[] = []) {
  const organization_id = identity.organization.id;
  const financial = ['owner','admin','billing'].includes(identity.role);
  const technical = ['owner','admin','support'].includes(identity.role);
  const existing = await client.query('SELECT id,workspace_key,deleted_at FROM crm.customers WHERE organization_id=$1 AND workspace_key IS NOT NULL', [organization_id]);
  const existingRows = existing.rows as {id:string;workspace_key:string;deleted_at:Date|null}[];
  const previousIds = new Map(existingRows.filter(row=>!row.deleted_at).map(row => [row.workspace_key,row.id]));
  const saved: WorkspaceCustomer[] = [];
  const oldCustomers = new Map(previous.map(customer=>[customer.id,customer]));
  for (const customer of customers) {
    if (existingRows.some(row=>row.workspace_key===customer.id && row.deleted_at)) throw new WorkspaceError(409,'ARCHIVED_CUSTOMER','El cliente está archivado. No se puede reutilizar su identificador como un alta nueva.');
    let customerId = previousIds.get(customer.id);
    // A workspace update need not rewrite/audit every customer in a large ERP.
    // A legacy record with no normalized key is always imported on explicit save.
    if (customerId && isDeepStrictEqual(customer, oldCustomers.get(customer.id))) { saved.push(customer); continue; }
    if (technical) {
      const suffix = customer.customId.toUpperCase().replace(/^CC/, '');
      if (!/^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(suffix)) throw new WorkspaceError(400, 'INVALID_CUSTOMER_ID', 'El identificador del cliente debe empezar con CC y tener hasta 32 caracteres válidos después del prefijo.');
      const row = await upsert(client, 'crm.customers', { organization_id, workspace_key: customer.id, custom_id_suffix: suffix,
        person_type: kinds[customer.kind], display_name: customer.name.trim(), document_id: customer.document.trim() || null,
        portal_access_enabled: customer.portalAccess, notes: customer.notes }, ['organization_id','workspace_key']);
      customerId = text(row, 'id');
      await upsert(client, 'crm.customer_contacts', { organization_id, customer_id: customerId, email: customer.contact.email.trim() || null,
        mobile_phone: customer.contact.mobile.trim() || null, landline_phone: customer.contact.landline.trim() || null,
        notify_email: customer.communication.email, notify_sms: customer.communication.sms, notify_whatsapp: customer.communication.whatsapp }, ['customer_id']);
      // One primary service address per customer; the partial unique index is kept.
      const a = customer.address;
      const address = await client.query("SELECT id FROM crm.customer_addresses WHERE organization_id=$1 AND customer_id=$2 AND address_type='service' AND is_primary", [organization_id, customerId]);
      if (address.rowCount) {
        await client.query('UPDATE crm.customer_addresses SET street=$3,exterior_number=$4,neighborhood=$5,city=$6,state_region=$7,postal_code=$8,latitude=$9,longitude=$10,additional_data=$11 WHERE organization_id=$1 AND customer_id=$2 AND id=$12',
          [organization_id,customerId,a.street,a.number || null,a.neighborhood,a.city,a.state,a.postalCode,a.latitude,a.longitude,a.additionalData || '',address.rows[0].id]);
      } else {
        await client.query("INSERT INTO crm.customer_addresses (organization_id,customer_id,street,exterior_number,neighborhood,city,state_region,postal_code,latitude,longitude,additional_data) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
          [organization_id,customerId,a.street,a.number || null,a.neighborhood,a.city,a.state,a.postalCode,a.latitude,a.longitude,a.additionalData || '']);
      }
      await upsert(client, 'crm.customer_assignments', { organization_id,customer_id:customerId,zone_name:customer.assignment.zone,seller_name:customer.assignment.seller,collector_name:customer.assignment.collector }, ['customer_id']);
    }
    if (!customerId) throw new WorkspaceError(409, 'CUSTOMER_NOT_CONNECTED', 'El cliente debe ser conectado por un administrador antes de modificar su facturación.');
    if (financial) {
      const b = customer.billing;
      await upsert(client, 'crm.customer_billing_profiles', { organization_id,customer_id:customerId,enabled:b.enabled,tax_id:b.taxId || null,legal_name:b.legalName || null,legal_entity:b.legalEntity || null,
        tax_regime:b.regime || null,invoice_type:b.invoiceType || 'Comprobante',billing_day:b.billingDay ?? 1,payment_method:b.paymentMethod || null,payment_form:b.paymentForm || null,cfdi_use:b.cfdiUse || null,
        inform_after_payment:b.informAfterPayment ?? false,automatic_status:b.automaticStatus ?? false,email_invoice:b.emailInvoice ?? false,email_payment:b.emailPayment ?? false,
        notification_emails:(b.notificationEmails || '').split(/[,;\s]+/).filter(Boolean),additional_info:b.additionalInfo || '',additional_info_2:b.additionalInfo2 || '' }, ['customer_id']);
      await upsert(client, 'crm.customer_accounts', { organization_id,customer_id:customerId,account_status:({'Al corriente':'current','Saldo a favor':'credit','Con deuda':'debt'} as const)[customer.account.status],
        balance:customer.account.balance,available_credit:customer.account.credit,unpaid_invoices:customer.account.unpaidInvoices ?? 0 }, ['customer_id']);
    }
    const connected = { ...customer, contracts: [...customer.contracts] };
    for (let i=0;i<customer.contracts.length;i++) {
      const contract = customer.contracts[i];
      const frequency = frequencies[contract.frequency || 'Mensual'];
      if (!frequency) throw new WorkspaceError(400,'INVALID_FREQUENCY','Selecciona una frecuencia de facturación válida.');
      // Plain SELECT preserves read-only catalog access for billing/support. The
      // real FK protects the plan relationship without requiring catalog UPDATE.
      const found = await client.query(`SELECT id,name FROM catalog.service_plans WHERE organization_id=$1 AND deleted_at IS NULL AND status='active' AND ${contract.planId ? 'id=$2::uuid' : 'lower(btrim(name))=lower(btrim($2))'}`, [organization_id,contract.planId || contract.plan]);
      if (found.rowCount !== 1) throw new WorkspaceError(409, 'PLAN_NOT_FOUND', 'Selecciona un plan registrado de esta organización. Crea el plan en el catálogo antes de guardar el contrato.');
      const plan = found.rows[0] as {id:string;name:string};
      let serverId: string | null = null, nodeId: string | null = null;
      if (technical) {
        const server = await client.query('SELECT id FROM network.servers WHERE organization_id=$1 AND name=$2 AND deleted_at IS NULL', [organization_id,contract.server]);
        const node = await client.query('SELECT id FROM network.nodes WHERE organization_id=$1 AND name=$2 AND deleted_at IS NULL', [organization_id,contract.node]);
        // Ambiguous or not yet configured names cannot grant network assignment.
        serverId = server.rowCount === 1 ? server.rows[0].id as string : null;
        nodeId = node.rowCount === 1 ? node.rows[0].id as string : null;
      }
      const values: Row = { organization_id,workspace_key:contract.id,customer_id:customerId,plan_id:plan.id,serial_number:contract.serialNumber || contract.id,
        status:states[contract.status],price:contract.price ?? 0,frequency,billing_day:contract.billingDay ?? 1,
        starts_on:date(contract.startsAt || contract.createdAt || new Date()),start_billing_on:contract.startBillingAt || null,billing_period_start:contract.billingPeriodStart || null,billing_period_end:contract.billingPeriodEnd || null,
        billing_status:billingStates[contract.billingStatus || 'Activo'] || contract.billingStatus,notes:contract.notes || '',latitude:contract.latitude ?? null,longitude:contract.longitude ?? null,deleted_at:null };
      if (technical) { values.server_id=serverId;values.node_id=nodeId; }
      let row: Row;
      if (technical) row = await upsert(client, 'service.contracts', values, ['organization_id','workspace_key']);
      else {
        // Billing may UPDATE existing contracts, never INSERT via an upsert.
        const keys = Object.keys(values).filter(key=>!['organization_id','workspace_key','customer_id'].includes(key));
        const updated = await client.query(`UPDATE service.contracts SET ${keys.map((key,index)=>`${key}=$${index+4}`).join(',')} WHERE organization_id=$1 AND workspace_key=$2 AND customer_id=$3 AND deleted_at IS NULL RETURNING *`, [organization_id,contract.id,customerId,...keys.map(key=>values[key])]);
        if (updated.rowCount !== 1) throw new WorkspaceError(403,'FORBIDDEN','No tienes permiso para crear este contrato.');
        row = updated.rows[0] as Row;
      }
      if (text(row,'customer_id') !== customerId) throw new WorkspaceError(403,'FORBIDDEN','No se puede trasladar un contrato a otro cliente.');
      connected.contracts[i] = { ...contract,planId:plan.id,plan:plan.name };
    }
    if (technical) await client.query('UPDATE service.contracts SET deleted_at=now() WHERE organization_id=$1 AND customer_id=$2 AND workspace_key IS NOT NULL AND deleted_at IS NULL AND NOT(workspace_key=ANY($3::text[]))', [organization_id,customerId,customer.contracts.map(c=>c.id)]);
    saved.push(connected);
  }
  if (['owner','admin'].includes(identity.role)) {
    const removed = [...previousIds.keys()].filter(key=>!customers.some(c=>c.id===key));
    if (removed.length) {
      await client.query('UPDATE service.contracts SET deleted_at=now() WHERE organization_id=$1 AND customer_id IN (SELECT id FROM crm.customers WHERE organization_id=$1 AND workspace_key=ANY($2::text[])) AND deleted_at IS NULL', [organization_id,removed]);
      await client.query('UPDATE crm.customers SET deleted_at=now() WHERE organization_id=$1 AND workspace_key=ANY($2::text[]) AND deleted_at IS NULL', [organization_id,removed]);
    }
  }
  return saved;
}

/** Normalized core is authoritative. Encrypted snapshot retains the existing
 * technical/operational fields and secrets until their own modules are connected.
 * No implicit import, fictitious plan, or fake network device is created on GET.
 */
export async function readRelationalWorkspace(client: PoolClient, identity: WorkspaceIdentity, legacy: WorkspaceCustomer[]) {
  const result = await client.query(`SELECT to_jsonb(c) AS core,to_jsonb(cc) AS contact,to_jsonb(ca) AS address,to_jsonb(cb) AS billing,to_jsonb(ac) AS account,to_jsonb(a) AS assignment
    FROM crm.customers c LEFT JOIN crm.customer_contacts cc ON (cc.organization_id,cc.customer_id)=(c.organization_id,c.id)
    LEFT JOIN crm.customer_addresses ca ON (ca.organization_id,ca.customer_id)=(c.organization_id,c.id) AND ca.address_type='service' AND ca.is_primary
    LEFT JOIN crm.customer_billing_profiles cb ON (cb.organization_id,cb.customer_id)=(c.organization_id,c.id)
    LEFT JOIN crm.customer_accounts ac ON (ac.organization_id,ac.customer_id)=(c.organization_id,c.id)
    LEFT JOIN crm.customer_assignments a ON (a.organization_id,a.customer_id)=(c.organization_id,c.id)
    WHERE c.organization_id=$1 AND c.workspace_key IS NOT NULL`, [identity.organization.id]);
  if (!result.rowCount) return legacy;
  const contracts = await client.query(`SELECT to_jsonb(c) AS core,p.name AS plan_name FROM service.contracts c
    JOIN catalog.service_plans p ON (p.organization_id,p.id)=(c.organization_id,c.plan_id)
    WHERE c.organization_id=$1 AND c.workspace_key IS NOT NULL AND c.deleted_at IS NULL`, [identity.organization.id]);
  const rows = result.rows as {core:Row;contact:Row|null;address:Row|null;billing:Row|null;account:Row|null;assignment:Row|null}[];
  const mapped = rows.filter(row=>!row.core.deleted_at).map(row=>{
    const c=row.core, key=text(c,'workspace_key'), old=legacy.find(item=>item.id===key);
    // Every application-managed row has its encrypted extension in the same commit.
    // A missing extension fails closed instead of fabricating operational values.
    if (!old) throw new WorkspaceError(503,'WORKSPACE_INCONSISTENT','El expediente requiere revisión de integridad antes de editar.');
    const b=row.billing, a=row.address, contact=row.contact, account=row.account, assignment=row.assignment;
    const connected: WorkspaceCustomer = { ...old,customId:text(c,'custom_id'),name:text(c,'display_name'),document:text(c,'document_id'),
      kind:reverse(kinds,text(c,'person_type'),'Otro') as WorkspaceCustomer['kind'],portalAccess:Boolean(c.portal_access_enabled),notes:text(c,'notes'),
      contact:contact ? { email:text(contact,'email'),mobile:text(contact,'mobile_phone'),landline:text(contact,'landline_phone') } : old.contact,
      communication:contact ? {email:Boolean(contact.notify_email),sms:Boolean(contact.notify_sms),whatsapp:Boolean(contact.notify_whatsapp)} : old.communication,
      address:a ? {street:text(a,'street'),number:text(a,'exterior_number'),neighborhood:text(a,'neighborhood'),city:text(a,'city'),state:text(a,'state_region'),postalCode:text(a,'postal_code'),latitude:number(a,'latitude'),longitude:number(a,'longitude'),additionalData:text(a,'additional_data')} : old.address,
      assignment:assignment ? {zone:text(assignment,'zone_name'),seller:text(assignment,'seller_name'),collector:text(assignment,'collector_name')} : old.assignment,
      billing:b ? { ...old.billing,enabled:Boolean(b.enabled),taxId:text(b,'tax_id'),legalName:text(b,'legal_name'),legalEntity:text(b,'legal_entity'),regime:text(b,'tax_regime'),invoiceType:text(b,'invoice_type'),billingDay:number(b,'billing_day',1),paymentMethod:text(b,'payment_method'),paymentForm:text(b,'payment_form'),cfdiUse:text(b,'cfdi_use'),emailInvoice:Boolean(b.email_invoice),emailPayment:Boolean(b.email_payment),informAfterPayment:Boolean(b.inform_after_payment),automaticStatus:Boolean(b.automatic_status),notificationEmails:Array.isArray(b.notification_emails)?b.notification_emails.join(', '):'',additionalInfo:text(b,'additional_info'),additionalInfo2:text(b,'additional_info_2') } : old.billing,
      account:account ? { ...old.account,status:({current:'Al corriente',credit:'Saldo a favor',debt:'Con deuda'} as const)[text(account,'account_status') as 'current'|'credit'|'debt'],balance:number(account,'balance'),credit:number(account,'available_credit'),unpaidInvoices:number(account,'unpaid_invoices') } : old.account,
      contracts:[],
    };
    connected.contracts=(contracts.rows as {core:Row;plan_name:string}[]).filter(contract=>text(contract.core,'customer_id')===text(c,'id')).map(contract=>{
      const core=contract.core, previous=old.contracts.find(item=>item.id===text(core,'workspace_key'));
      if (!previous) throw new WorkspaceError(503,'WORKSPACE_INCONSISTENT','El contrato requiere revisión de integridad.');
      return { ...previous,planId:text(core,'plan_id'),plan:contract.plan_name,serialNumber:text(core,'serial_number'),status:reverse(states,text(core,'status'),'Deshabilitado') as typeof previous.status,
        price:number(core,'price'),frequency:reverse(frequencies,text(core,'frequency'),'Mensual'),billingStatus:reverse(billingStates,text(core,'billing_status'),text(core,'billing_status','Activo')),billingDay:number(core,'billing_day',1),startsAt:date(core.starts_on),
        ...(core.start_billing_on ? {startBillingAt:date(core.start_billing_on)} : {}),notes:text(core,'notes') };
    });
    return connected;
  });
  // Legacy records not yet imported remain visible until an explicit write.
  return [...mapped,...legacy.filter(c=>!rows.some(row=>text(row.core,'workspace_key')===c.id))];
}
