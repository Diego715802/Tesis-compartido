"use client";

import { useMemo, useRef, useState } from "react";
import { commitCustomers, useCustomers } from "../clientes/customer-store";
import type { CustomerContract, ServiceStatus } from "../clientes/customer-types";
import { contractColumns, type ContractColumn } from "./contract-list";
import { contractDate, contractSerial, emptyFilterGroup, exportContractsCsv, filterContracts, flattenContracts, type ContractRow, type FilterGroup } from "./contract-model";
import { deleteContract, restoreContract, saveContract, updateContracts } from "./contract-mutations";
import type { ContractInspectionKind } from "./contract-inspection-dialog";
import type { ContractSearchMode, ContractSort } from "./contract-toolbar";

export function useContractWorkbench() {
  const [customers] = useCustomers();
  const rows = useMemo(() => flattenContracts(customers), [customers]);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<ContractSearchMode>("all");
  const [filters, setFilters] = useState<FilterGroup>(emptyFilterGroup);
  const [status, setStatus] = useState<ServiceStatus | "Todos">("Todos");
  const [sort, setSort] = useState<ContractSort>("id");
  const [descending, setDescending] = useState(false);
  const [columns, setColumns] = useState<ContractColumn[]>(contractColumns.map((column) => column.key));
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState<"create" | string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [inspection, setInspection] = useState<{ key: string; kind: ContractInspectionKind } | null>(null);
  const [dialog, setDialog] = useState<"filters" | "import" | "bulk" | "notify" | null>(null);
  const [confirm, setConfirm] = useState<{ key: string; status?: ServiceStatus } | null>(null);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);
  const [undo, setUndo] = useState<ContractRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const mutationInFlight = useRef(false);
  const filtered = useMemo(() => {
    const matches = filterContracts(rows, query, filters, searchMode).filter((row) => status === "Todos" || row.contract.status === status);
    const value = (row: ContractRow) => sort === "name" ? row.customer.name : sort === "ip" ? row.contract.ipAddress : sort === "date" ? contractDate(row) : contractSerial(row.contract);
    return matches.sort((a, b) => value(a).localeCompare(value(b), "es", { numeric: true }) * (descending ? -1 : 1));
  }, [rows, query, filters, searchMode, status, sort, descending]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selectedRows = rows.filter((row) => selection.has(row.key));
  const selected = new Set(selectedRows.map((row) => row.key));
  const findRow = (key: string | null) => rows.find((row) => row.key === key) ?? null;
  const formRow = findRow(form);
  const detailRow = findRow(detail);
  const inspectionRow = findRow(inspection?.key ?? null);

  async function mutate(operation: (current: typeof customers) => typeof customers, message: string): Promise<boolean> {
    if (mutationInFlight.current) return false;
    mutationInFlight.current = true;
    setSaving(true);
    setSaveError("");
    setNotice(null);
    try {
      await commitCustomers(operation);
      setNotice({ message });
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No se pudo actualizar el contrato.";
      setSaveError(detail);
      setNotice({ message: detail, error: true });
      return false;
    } finally {
      mutationInFlight.current = false;
      setSaving(false);
    }
  }
  function resetView() { setPage(0); setSelection(new Set()); }
  function toggle(key: string) { setSelection((previous) => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; }); }
  function toggleAll() {
    setSelection((previous) => { const next = new Set(previous); const all = visible.every((row) => next.has(row.key)); visible.forEach((row) => all ? next.delete(row.key) : next.add(row.key)); return next; });
  }
  function save(customerId: string, contract: CustomerContract) {
    return mutate((current) => saveContract(current, customerId, contract, form !== "create" ? form ?? undefined : undefined), form === "create" ? "Contrato creado." : "Contrato actualizado.");
  }
  async function applyUpdates(updates: { key: string; changes: Partial<CustomerContract> }[], message: string) {
    const success = await mutate((current) => updateContracts(current, updates), message);
    if (success) setDialog(null);
    return success;
  }
  async function confirmAction() {
    const row = findRow(confirm?.key ?? null);
    if (!row) { setConfirm(null); return; }
    const success = confirm?.status
      ? await applyUpdates([{ key: row.key, changes: { status: confirm.status } }], `Contrato ${confirm.status.toLocaleLowerCase()}.`)
      : await mutate((current) => deleteContract(current, row.key), "Contrato eliminado.");
    if (!success) return;
    if (!confirm?.status) { setUndo(row); setDetail(null); setSelection((previous) => new Set([...previous].filter((key) => key !== row.key))); }
    setConfirm(null);
  }
  async function undoDelete() { if (undo && await mutate((current) => restoreContract(current, undo), "Contrato restaurado.")) setUndo(null); }
  function download() {
    const data = selectedRows.length ? selectedRows : filtered;
    const url = URL.createObjectURL(new Blob(["\uFEFF", exportContractsCsv(data)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `contratos-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice({ message: `${data.length} contratos exportados.` });
  }
  return {
    customers, rows, query, searchMode, filters, status, sort, descending, columns, currentPage, pageSize, visible, filtered, selected, selectedRows,
    form, formRow, detailRow, inspection, inspectionRow, dialog, confirm, confirmRow: findRow(confirm?.key ?? null), notice, undo, saving, saveError,
    setForm, setDetail, setInspection, setDialog, setConfirm, setNotice, setUndo,
    onQuery: (value: string) => { setQuery(value); resetView(); },
    onSearchMode: (value: ContractSearchMode) => { setSearchMode(value); resetView(); },
    onFilters: (value: FilterGroup) => { setFilters(value); resetView(); setDialog(null); },
    onStatus: (value: ServiceStatus | "Todos") => { setStatus(value); resetView(); },
    onClear: () => { setQuery(""); setFilters(emptyFilterGroup()); setStatus("Todos"); resetView(); },
    onSort: (value: ContractSort) => { setSort(value); setPage(0); }, onDirection: () => setDescending((previous) => !previous),
    setColumns, setPage, onPageSize: (value: number) => { setPageSize(value); setPage(0); },
    toggle, toggleAll, save, applyUpdates, confirmAction, undoDelete, download,
  };
}
