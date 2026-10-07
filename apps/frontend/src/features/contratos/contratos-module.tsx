"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import NetworkPingRoundedIcon from "@mui/icons-material/NetworkPingRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, ListItemIcon, Menu, MenuItem, Snackbar, Typography } from "@mui/material";
import { useState } from "react";
import { useCustomerPersistenceStatus } from "../clientes/customer-store";
import { ContractBulkDialog } from "./contract-bulk-dialog";
import { ContractControlPanel } from "./contract-control-panel";
import { ContractDetailDialog } from "./contract-detail-dialog";
import { ContractFiltersDialog } from "./contract-filters-dialog";
import { ContractFormDialog } from "./contract-form-dialog";
import { ContractImportDialog } from "./contract-import-dialog";
import { ContractInspectionDialog, type ContractInspectionKind } from "./contract-inspection-dialog";
import { ContractList } from "./contract-list";
import { contractSerial, ruleCount, statuses, type ContractRow } from "./contract-model";
import { ContractNotificationDialog, ContractSelectionBar } from "./contract-selection-bar";
import { ContractToolbar } from "./contract-toolbar";
import { useContractWorkbench } from "./use-contract-workbench";

export function ContratosModule() {
  const state = useContractWorkbench();
  const persistence = useCustomerPersistenceStatus();
  const [menu, setMenu] = useState<{ key: string; element: HTMLElement } | null>(null);
  const menuRow = state.rows.find((row) => row.key === menu?.key);
  const inspect = (kind: ContractInspectionKind) => { if (menuRow) state.setInspection({ key: menuRow.key, kind }); setMenu(null); };
  const actions = [
    { kind: "cpe", label: "Acceso CPE", icon: <LaunchRoundedIcon /> },
    { kind: "ping", label: "Ping", icon: <NetworkPingRoundedIcon /> },
    { kind: "sync", label: "Resincronizar contrato", icon: <SyncRoundedIcon /> },
    { kind: "pppoe", label: "PPPoE Status", icon: <SettingsEthernetRoundedIcon /> },
    { kind: "audit", label: "Auditorías", icon: <HistoryRoundedIcon /> },
    { kind: "consumption", label: "Resumen de consumo", icon: <BarChartRoundedIcon /> },
  ] as const;
  function openEdit(row: ContractRow) { state.setDetail(null); state.setForm(row.key); }
  const activeFilters = ruleCount(state.filters) + Number(state.status !== "Todos") + Number(Boolean(state.query));

  return <Box sx={{ minWidth: 0 }}>
    <Typography component="h1" sx={{ fontSize: 20, fontWeight: 400, mb: 2 }}>Contratos</Typography>
    <Typography role="status" sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>Guardado local · Sin conexión a equipos de red</Typography>
    {persistence.status === "unavailable" && <Alert severity="warning" sx={{ mb: 2 }}>{persistence.message}</Alert>}
    <ContractToolbar query={state.query} onQuery={state.onQuery} searchMode={state.searchMode} onSearchMode={state.onSearchMode} total={state.filtered.length} filters={activeFilters} onFilters={() => state.setDialog("filters")} onClear={state.onClear} onCreate={() => state.setForm("create")} onImport={() => state.setDialog("import")} sort={state.sort} onSort={state.onSort} descending={state.descending} onDirection={state.onDirection} columns={state.columns} onColumns={state.setColumns} />
    <ContractControlPanel rows={state.rows} status={state.status} onStatus={state.onStatus} />
    {!state.customers.length && <Alert severity="info" action={<Button component="a" href="/clientes">Clientes</Button>} sx={{ my: 2 }}>Primero registra un cliente para poder crear un contrato.</Alert>}
    <ContractList rows={state.visible} selected={state.selected} onToggle={state.toggle} onToggleAll={state.toggleAll} columns={state.columns} onDetail={(row) => state.setDetail(row.key)} onEdit={openEdit} onMenu={(row, element) => setMenu({ key: row.key, element })} onStatusChange={(row, status) => state.setConfirm({ key: row.key, status })} page={state.currentPage} pageSize={state.pageSize} count={state.filtered.length} onPage={state.setPage} onPageSize={state.onPageSize} />
    <ContractSelectionBar count={state.selectedRows.length} total={state.filtered.length} onDownload={state.download} onUpdate={() => state.setDialog("bulk")} onNotify={() => state.setDialog("notify")} />
    <Menu anchorEl={menu?.element ?? null} open={Boolean(menuRow)} onClose={() => setMenu(null)}>
      {actions.map((action) => <MenuItem key={action.kind} onClick={() => inspect(action.kind)}><ListItemIcon>{action.icon}</ListItemIcon>{action.label}</MenuItem>)}
      <Divider />
      {statuses.filter((status) => status !== "Suspendido").map((status) => <MenuItem key={status} disabled={menuRow?.contract.status === status} onClick={() => { if (menuRow) state.setConfirm({ key: menuRow.key, status }); setMenu(null); }}><ListItemIcon><PowerSettingsNewRoundedIcon /></ListItemIcon>{status === "Habilitado" ? "Habilitar" : status === "Deshabilitado" ? "Deshabilitar" : `Marcar ${status.toLocaleLowerCase()}`}</MenuItem>)}
      <MenuItem sx={{ color: "error.main" }} onClick={() => { if (menuRow) state.setConfirm({ key: menuRow.key }); setMenu(null); }}><ListItemIcon><DeleteOutlineRoundedIcon color="error" /></ListItemIcon>Eliminar contrato</MenuItem>
    </Menu>
    <ContractFormDialog open={Boolean(state.form)} onClose={() => state.setForm(null)} onSave={state.save} customers={state.customers} editing={state.formRow ? { customerId: state.formRow.customer.id, contract: state.formRow.contract } : null} />
    <ContractDetailDialog open={Boolean(state.detailRow)} onClose={() => state.setDetail(null)} onEdit={() => { if (state.detailRow) openEdit(state.detailRow); }} customer={state.detailRow?.customer ?? null} contract={state.detailRow?.contract ?? null} onStatusChange={(status) => { if (state.detailRow) state.applyUpdates([{ key: state.detailRow.key, changes: { status } }], "Estado del contrato actualizado."); }} />
    <ContractInspectionDialog open={Boolean(state.inspectionRow)} onClose={() => state.setInspection(null)} kind={state.inspection?.kind ?? "audit"} customer={state.inspectionRow?.customer ?? null} contract={state.inspectionRow?.contract ?? null} />
    <ContractFiltersDialog open={state.dialog === "filters"} onClose={() => state.setDialog(null)} onApply={state.onFilters} value={state.filters} rows={state.rows} />
    <ContractBulkDialog open={state.dialog === "bulk"} onClose={() => state.setDialog(null)} customers={state.customers} rows={state.selectedRows} onApply={(changes) => state.applyUpdates(state.selectedRows.map((row) => ({ key: row.key, changes })), `${state.selectedRows.length} contratos actualizados.`)} />
    <ContractImportDialog open={state.dialog === "import"} onClose={() => state.setDialog(null)} rows={state.rows} onApply={(updates) => state.applyUpdates(updates.map(({ key, status }) => ({ key, changes: { status } })), `${updates.length} estados importados.`)} />
    <ContractNotificationDialog open={state.dialog === "notify"} onClose={() => state.setDialog(null)} rows={state.selectedRows} />
    <Dialog open={Boolean(state.confirmRow)} onClose={() => state.setConfirm(null)} fullWidth maxWidth="xs" aria-labelledby="contract-confirm-title">
      <DialogTitle id="contract-confirm-title">{state.confirm?.status ? "Cambiar estado" : "Eliminar contrato"}</DialogTitle>
      <DialogContent><Typography sx={{ fontSize: 13 }}>{state.confirmRow?.customer.name} · {state.confirmRow ? contractSerial(state.confirmRow.contract) : ""}</Typography><Typography sx={{ fontSize: 13, mt: 1 }}>{state.confirm?.status ? `Estado nuevo: ${state.confirm.status}.` : "Se eliminará este contrato. La ficha del cliente y sus otros contratos se conservarán."}</Typography></DialogContent>
      <DialogActions><Button color="inherit" onClick={() => state.setConfirm(null)}>Cancelar</Button><Button variant="contained" color={state.confirm?.status ? "primary" : "error"} onClick={state.confirmAction}>Confirmar</Button></DialogActions>
    </Dialog>
    <Snackbar open={Boolean(state.notice)} autoHideDuration={state.undo ? 15000 : 5000} onClose={() => { state.setNotice(null); state.setUndo(null); }}>
      <Alert severity={state.notice?.error ? "error" : "success"} onClose={() => { state.setNotice(null); state.setUndo(null); }} action={state.undo && !state.notice?.error ? <Button color="inherit" size="small" onClick={state.undoDelete}>Deshacer</Button> : undefined}>{state.notice?.message}</Alert>
    </Snackbar>
  </Box>;
}
