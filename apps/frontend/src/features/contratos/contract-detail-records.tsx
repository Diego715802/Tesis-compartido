"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { Customer, CustomerAuditEvent, CustomerContract } from "../clientes/customer-types";
import { contractAuditRecords } from "./contract-detail-audit";
import { ContractFields, ContractSection, ContractStatus, contractCurrency } from "./contract-detail-sections";

function RecordsTable({ title, columns, children }: { title: string; columns: string[]; children: ReactNode }) {
  return <Box sx={{ width: "100%", overflowX: "auto" }}><Table size="small" aria-label={title} sx={{ "& th": { fontWeight: 600, whiteSpace: "nowrap" }, "& td": { fontSize: 13 } }}><TableHead><TableRow>{columns.map((column) => <TableCell key={column}>{column}</TableCell>)}</TableRow></TableHead><TableBody>{children}</TableBody></Table></Box>;
}

function EmptyRecords({ children }: { children: ReactNode }) {
  return <Typography role="status" sx={{ py: 2, color: "text.secondary", fontSize: 13 }}>{children}</Typography>;
}

export function RelatedContractsSection({ customer, contractId }: { customer: Customer; contractId: string }) {
  return <ContractSection title={`Contratos del cliente (${customer.contracts.length})`}>
    <RecordsTable title="Contratos del cliente" columns={["Contrato", "Plan", "Servidor / nodo", "Interfaz", "IP", "Estado"]}>
      {customer.contracts.map((contract) => <TableRow key={contract.id} selected={contract.id === contractId}><TableCell sx={{ whiteSpace: "nowrap" }}>{contract.id}{contract.id === contractId && <Typography component="span" sx={{ ml: 1, fontSize: 12, color: "text.secondary" }}>Actual</Typography>}</TableCell><TableCell>{contract.plan}</TableCell><TableCell>{[contract.server, contract.node].filter(Boolean).join(" / ") || "Sin registrar"}</TableCell><TableCell>{contract.interfaceName || "Sin registrar"}</TableCell><TableCell>{contract.ipAddress || "Sin registrar"}</TableCell><TableCell><ContractStatus status={contract.status} /></TableCell></TableRow>)}
    </RecordsTable>
  </ContractSection>;
}

export function ContractBillingSection({ customer, contract }: { customer: Customer; contract: CustomerContract }) {
  return <>
    <ContractSection title="Facturación del cliente"><ContractFields fields={[
      { label: "Facturación", value: customer.billing.enabled ? "Habilitada" : "Deshabilitada" },
      { label: "Identificación fiscal", value: customer.billing.taxId }, { label: "Razón social", value: customer.billing.legalName },
      { label: "Persona fiscal", value: customer.billing.legalEntity }, { label: "Régimen fiscal", value: customer.billing.regime },
      { label: "Tipo de factura", value: customer.billing.invoiceType }, { label: "Uso CFDI", value: customer.billing.cfdiUse },
      { label: "Método de pago", value: customer.billing.paymentMethod }, { label: "Forma de pago", value: customer.billing.paymentForm },
      { label: "Día de facturación", value: customer.billing.billingDay },
    ]} /></ContractSection>
    <ContractSection title="Facturación del contrato"><ContractFields fields={[
      { label: "Perfil de facturación", value: contract.billingProfile }, { label: "Estado de facturación", value: contract.billingStatus },
      { label: "Inicio de facturación", value: contract.startBillingAt }, { label: "Día de facturación", value: contract.billingDay },
      { label: "Período desde", value: contract.billingPeriodStart }, { label: "Período hasta", value: contract.billingPeriodEnd },
      { label: "Precio", value: contract.price === undefined ? undefined : contractCurrency.format(contract.price) },
      { label: "Frecuencia", value: contract.frequency },
    ]} /></ContractSection>
    <ContractSection title="Facturas del contrato">{!contract.invoices?.length ? <EmptyRecords>Sin facturas registradas para este contrato.</EmptyRecords> : <RecordsTable title="Facturas del contrato" columns={["Folio", "Emisión", "Tipo", "Importe", "Saldo", "Estado"]}>{contract.invoices.map((invoice) => <TableRow key={invoice.id}><TableCell>{invoice.id}</TableCell><TableCell>{invoice.issuedAt}</TableCell><TableCell>{invoice.type}</TableCell><TableCell>{contractCurrency.format(invoice.amount)}</TableCell><TableCell>{contractCurrency.format(invoice.balance)}</TableCell><TableCell><Chip size="small" variant="outlined" label={invoice.status} color={invoice.status === "Pendiente" ? "warning" : "default"} /></TableCell></TableRow>)}</RecordsTable>}</ContractSection>
    <ContractSection title="Descuentos">{!contract.discounts?.length ? <EmptyRecords>Sin descuentos registrados.</EmptyRecords> : <RecordsTable title="Descuentos" columns={["Nombre", "Tipo", "Valor"]}>{contract.discounts.map((discount) => <TableRow key={discount.id}><TableCell>{discount.name}</TableCell><TableCell>{discount.type}</TableCell><TableCell>{discount.type === "Porcentaje" ? `${discount.amount}%` : contractCurrency.format(discount.amount)}</TableCell></TableRow>)}</RecordsTable>}</ContractSection>
    <ContractSection title="Ítems recurrentes">{!contract.recurringItems?.length ? <EmptyRecords>Sin ítems recurrentes registrados.</EmptyRecords> : <RecordsTable title="Ítems recurrentes" columns={["Nombre", "Cantidad", "Importe unitario", "Total"]}>{contract.recurringItems.map((item) => <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{contractCurrency.format(item.amount)}</TableCell><TableCell>{contractCurrency.format(item.amount * item.quantity)}</TableCell></TableRow>)}</RecordsTable>}</ContractSection>
    <ContractSection title="Ítems del contrato">{!contract.items?.length ? <EmptyRecords>Sin ítems registrados.</EmptyRecords> : <Box component="ul" sx={{ pl: 2, fontSize: 13 }}>{contract.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</Box>}</ContractSection>
  </>;
}

export function ContractTicketsSection({ contract }: { contract: CustomerContract }) {
  return <ContractSection title="Tickets del contrato">{!contract.tickets?.length ? <EmptyRecords>Sin tickets registrados para este contrato.</EmptyRecords> : <RecordsTable title="Tickets del contrato" columns={["Ticket", "Título", "Categoría", "Prioridad", "Estado", "Fecha"]}>{contract.tickets.map((ticket) => <TableRow key={ticket.id}><TableCell>{ticket.id}</TableCell><TableCell>{ticket.title}</TableCell><TableCell>{ticket.category}</TableCell><TableCell>{ticket.priority}</TableCell><TableCell><Chip size="small" variant="outlined" label={ticket.status} /></TableCell><TableCell>{ticket.createdAt}</TableCell></TableRow>)}</RecordsTable>}</ContractSection>;
}

function AuditRecords({ events, title }: { events: CustomerAuditEvent[]; title: string }) {
  return events.length === 0 ? <EmptyRecords>Sin eventos de auditoría registrados.</EmptyRecords> : <RecordsTable title={title} columns={["Fecha", "Acción", "Usuario", "Detalle"]}>{events.map((event) => <TableRow key={event.id}><TableCell sx={{ whiteSpace: "nowrap" }}>{event.date}</TableCell><TableCell>{event.action}</TableCell><TableCell>{event.actor}</TableCell><TableCell sx={{ overflowWrap: "anywhere" }}>{event.detail || "Sin detalle"}</TableCell></TableRow>)}</RecordsTable>;
}

export function ContractAuditSection({ customer, contract }: { customer: Customer; contract: CustomerContract }) {
  const { contractEvents, customerEvents } = contractAuditRecords(customer.audit, contract);
  return <><ContractSection title="Auditoría del contrato"><AuditRecords title="Auditoría del contrato" events={contractEvents} /></ContractSection><ContractSection title="Auditoría del cliente"><AuditRecords title="Auditoría del cliente" events={customerEvents} /></ContractSection></>;
}
