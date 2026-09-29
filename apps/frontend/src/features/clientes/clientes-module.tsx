"use client";

import Alert from "@mui/material/Alert";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { customerFilterOptions, demoCustomers } from "./customer-data";
import { CustomerDetailPanel } from "./customer-detail-panel";
import { PasswordDialog } from "./customer-dialogs";
import { CustomerFormDialog } from "./customer-form-dialog";
import { AccountDialog, CustomerProfileDialog, ImportCustomersDialog } from "./customer-operational-dialogs";
import { CustomerList } from "./customer-list";
import { CustomerListLoading, CustomerState } from "./customer-state";
import { CustomerToolbar } from "./customer-toolbar";
import type {
  Customer,
  CustomerDetailTab,
  CustomerFilters,
  CustomerQuickAction,
} from "./customer-types";

const emptyFilters: CustomerFilters = {
  name: "",
  email: "",
  landline: "",
  document: "",
  mobile: "",
  address: "",
  customId: "",
  ip: "",
  kind: "Todos",
  plan: "Todos",
  server: "Todos",
  billing: "Todos",
  account: "Todos",
};

type LoadStatus = "loading" | "ready" | "error";

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchesQuery(customer: Customer, query: string) {
  if (!query) return true;

  const searchable = [
    customer.id,
    customer.customId,
    customer.name,
    customer.document,
    customer.contact.email,
    customer.contact.mobile,
    customer.contact.landline,
    customer.address.street,
    customer.address.neighborhood,
    customer.address.city,
    customer.address.state,
    customer.billing.taxId,
    customer.billing.legalName,
  ];

  return searchable.some((value) => normalizeSearch(value).includes(query));
}

function matchesFilters(customer: Customer, filters: CustomerFilters) {
  const contains = (value: string, filter: string) => !filter || normalizeSearch(value).includes(normalizeSearch(filter));
  if (!contains(customer.name, filters.name)) return false;
  if (!contains(customer.contact.email, filters.email)) return false;
  if (!contains(customer.contact.landline, filters.landline)) return false;
  if (!contains(customer.document, filters.document)) return false;
  if (!contains(customer.contact.mobile, filters.mobile)) return false;
  if (!contains(`${customer.address.street} ${customer.address.number ?? ""} ${customer.address.neighborhood} ${customer.address.city} ${customer.address.state}`, filters.address)) return false;
  if (!contains(customer.customId, filters.customId)) return false;
  if (filters.ip && !customer.contracts.some((contract) => contains(contract.ipAddress, filters.ip))) return false;
  if (filters.kind !== "Todos" && customer.kind !== filters.kind) return false;
  if (filters.plan !== "Todos" && !customer.contracts.some((contract) => contract.plan === filters.plan)) return false;
  if (filters.server !== "Todos" && !customer.contracts.some((contract) => contract.server === filters.server)) return false;
  if (filters.billing === "Habilitada" && !customer.billing.enabled) return false;
  if (filters.billing === "No habilitada" && customer.billing.enabled) return false;
  if (filters.account !== "Todos" && customer.account.status !== filters.account) return false;
  return true;
}

export function ClientesModule() {
  const theme = useTheme();
  const compactDetail = useMediaQuery(theme.breakpoints.down("lg"));
  const [status, setStatus] = useState<LoadStatus>("ready");
  const [customers, setCustomers] = useState<Customer[]>(demoCustomers);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CustomerFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(demoCustomers[0]?.id ?? null);
  const [detailTab, setDetailTab] = useState<CustomerDetailTab>("detalle");
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [profileCustomerId, setProfileCustomerId] = useState<string | null>(null);
  const [accountCustomerId, setAccountCustomerId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [passwordCustomer, setPasswordCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState("");

  const normalizedQuery = normalizeSearch(query);
  const filteredCustomers = useMemo(
    () => customers.filter((customer) => matchesQuery(customer, normalizedQuery) && matchesFilters(customer, filters)),
    [customers, filters, normalizedQuery],
  );
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const firstResultIndex = (safePage - 1) * pageSize;
  const pageCustomers = filteredCustomers.slice(firstResultIndex, firstResultIndex + pageSize);
  const selectedCustomer = pageCustomers.find((customer) => customer.id === selectedCustomerId) ?? pageCustomers[0] ?? null;
  const effectiveSelectedCustomerId = selectedCustomer?.id ?? null;
  const profileCustomer = customers.find((customer) => customer.id === profileCustomerId) ?? null;
  const accountCustomer = customers.find((customer) => customer.id === accountCustomerId) ?? null;
  const activeFilterCount = Object.values(filters).filter((value) => value !== "Todos" && value !== "").length;

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateFilters(value: CustomerFilters) {
    setFilters(value);
    setPage(1);
  }

  function clearSearchAndFilters() {
    setQuery("");
    setFilters(emptyFilters);
    setPage(1);
  }

  function selectCustomer(customer: Customer, openCompactPanel = true) {
    setSelectedCustomerId(customer.id);
    if (compactDetail && openCompactPanel) setDetailOpen(true);
  }

  function handleQuickAction(customer: Customer, action: CustomerQuickAction) {
    selectCustomer(customer, false);
    if (action === "account") setAccountCustomerId(customer.id);
    if (action === "detail") setProfileCustomerId(customer.id);
    if (action === "edit") setEditingCustomer(customer);
    if (action === "password") setPasswordCustomer(customer);
  }

  function saveCustomer(updatedCustomer: Customer) {
    setCustomers((current) => current.some((customer) => customer.id === updatedCustomer.id)
      ? current.map((customer) => customer.id === updatedCustomer.id ? updatedCustomer : customer)
      : [updatedCustomer, ...current]);
    setSelectedCustomerId(updatedCustomer.id);
    setEditingCustomer(null);
    setCreatingCustomer(false);
    setMessage("El expediente del cliente se guardó en esta sesión.");
  }

  function exportCustomers(includeAccess = false) {
    const header = ["ID", "ID personalizable", "Nombre", "Documento", "Correo", "Teléfono", "Dirección", "Plan", ...(includeAccess ? ["Enlace de acceso"] : [])];
    const rows = filteredCustomers.map((customer) => [customer.id, customer.customId, customer.name, customer.document, customer.contact.email, customer.contact.mobile, `${customer.address.street}, ${customer.address.neighborhood}`, customer.contracts[0]?.plan ?? "Sin contrato", ...(includeAccess ? [customer.portalLink ?? ""] : [])]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = includeAccess ? "clientes-acceso.csv" : "clientes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
    setMessage("La exportación CSV se generó correctamente.");
  }

  function retryLoading() {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 420);
  }

  const hasNoResults = status === "ready" && customers.length > 0 && filteredCustomers.length === 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        px: { xs: 1.5, sm: 2.5, xl: 3 },
        py: { xs: 2, md: 2.5 },
      }}
    >
      <Box component="header" sx={{ mb: 2 }}>
        <Breadcrumbs
          separator={<ChevronRightRoundedIcon sx={{ fontSize: 14 }} />}
          aria-label="Ruta de navegación"
          sx={{ mb: 1, "& .MuiBreadcrumbs-separator": { mx: 0.5, color: "text.disabled" } }}
        >
          <Link href="/" underline="hover" color="text.secondary" sx={{ fontSize: "0.72rem" }}>Inicio</Link>
          <Typography color="text.primary" sx={{ fontSize: "0.72rem", fontWeight: 650 }}>Clientes</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, flexWrap: { xs: "wrap", lg: "nowrap" } }}>
          <Box sx={{ display: "flex", minWidth: 0, alignItems: "center", gap: 1.5 }}>
            <Box aria-hidden="true" sx={{ display: "grid", width: 42, height: 42, flex: "0 0 42px", placeItems: "center", color: "primary.main", backgroundColor: "#EAF3FC", borderRadius: 0 }}>
              <PeopleOutlineRoundedIcon sx={{ fontSize: 23 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" sx={{ fontSize: { xs: "1.55rem", sm: "1.8rem" }, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em" }}>
                Clientes
              </Typography>
              <Typography sx={{ mt: 0.35, color: "text.secondary", fontSize: { xs: "0.77rem", sm: "0.82rem" } }}>
                Consulta información comercial, de contacto y servicio sin salir del directorio.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "grid", width: { xs: "100%", lg: "auto" }, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, auto)" }, alignItems: "center", justifyContent: { xs: "stretch", md: "end" }, gap: 1 }}>
            <Chip label={`${customers.length} clientes`} size="small" sx={{ display: { xs: "none", md: "inline-flex" }, height: 30, color: "primary.dark", backgroundColor: "#EDF5FC", border: "1px solid #D7E7F5", fontSize: "0.68rem", fontWeight: 700 }} />
            <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={() => setImportOpen(true)}>Importar</Button>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} endIcon={<KeyboardArrowDownRoundedIcon />} onClick={(event) => setExportAnchor(event.currentTarget)}>Exportar</Button>
            <Button variant="contained" startIcon={<PersonAddAltRoundedIcon />} onClick={() => setCreatingCustomer(true)} sx={{ gridColumn: { xs: "1 / -1", md: "auto" }, boxShadow: "none" }}>Nuevo cliente</Button>
          </Box>
        </Box>
      </Box>

      <CustomerToolbar
        query={query}
        filters={filters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        plans={customerFilterOptions.plans}
        servers={customerFilterOptions.servers}
        onQueryChange={updateQuery}
        onFiltersChange={updateFilters}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        onClearFilters={() => updateFilters(emptyFilters)}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(330px, 0.42fr)", xl: "minmax(0, 1fr) 390px" },
          gap: 2.5,
          alignItems: "start",
          mt: 2,
        }}
      >
        {status === "loading" ? (
          <Box sx={{ overflow: "hidden", backgroundColor: "background.paper", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
            <CustomerListLoading />
          </Box>
        ) : status === "error" ? (
          <Box sx={{ backgroundColor: "background.paper", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
            <CustomerState kind="error" onAction={retryLoading} />
          </Box>
        ) : customers.length === 0 ? (
          <Box sx={{ backgroundColor: "background.paper", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
            <CustomerState kind="empty" />
          </Box>
        ) : hasNoResults ? (
          <Box sx={{ backgroundColor: "background.paper", boxShadow: "3px 3px 8px rgba(0,0,0,.18)" }}>
            <CustomerState kind="no-results" onAction={clearSearchAndFilters} />
          </Box>
        ) : (
          <CustomerList
            customers={pageCustomers}
            selectedCustomerId={effectiveSelectedCustomerId}
            page={safePage}
            pageCount={pageCount}
            pageSize={pageSize}
            total={filteredCustomers.length}
            firstResult={filteredCustomers.length > 0 ? firstResultIndex + 1 : 0}
            lastResult={Math.min(firstResultIndex + pageSize, filteredCustomers.length)}
            onPageChange={setPage}
            onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
            onSelect={(customer) => { setDetailTab("detalle"); selectCustomer(customer); }}
            onAction={handleQuickAction}
          />
        )}

        <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 94 }}>
          <CustomerDetailPanel
            customer={selectedCustomer}
            tab={detailTab}
            onTabChange={setDetailTab}
            onEdit={setEditingCustomer}
            onOpenProfile={(customer) => setProfileCustomerId(customer.id)}
            onOpenAccount={(customer) => setAccountCustomerId(customer.id)}
          />
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={compactDetail && detailOpen}
        onClose={() => setDetailOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: { sx: { width: { xs: "100%", sm: "min(460px, 92vw)" }, backgroundImage: "none" } },
          backdrop: { sx: { backgroundColor: "rgba(7, 26, 58, 0.24)" } },
        }}
      >
        <CustomerDetailPanel
          mobile
          customer={selectedCustomer}
          tab={detailTab}
          onTabChange={setDetailTab}
          onClose={() => setDetailOpen(false)}
          onEdit={setEditingCustomer}
          onOpenProfile={(customer) => setProfileCustomerId(customer.id)}
          onOpenAccount={(customer) => setAccountCustomerId(customer.id)}
        />
      </Drawer>

      {editingCustomer && (
        <CustomerFormDialog
          key={editingCustomer.id}
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={saveCustomer}
        />
      )}

      {creatingCustomer && <CustomerFormDialog onClose={() => setCreatingCustomer(false)} onSave={saveCustomer} />}

      {accountCustomer && <AccountDialog customer={accountCustomer} onClose={() => setAccountCustomerId(null)} />}

      {profileCustomer && (
        <CustomerProfileDialog
          customer={profileCustomer}
          onClose={() => setProfileCustomerId(null)}
          onEdit={() => setEditingCustomer(profileCustomer)}
          onOpenAccount={() => setAccountCustomerId(profileCustomer.id)}
          onUpdate={saveCustomer}
        />
      )}

      {importOpen && <ImportCustomersDialog onClose={() => setImportOpen(false)} onImport={(fileName) => { setImportOpen(false); setMessage(`${fileName} quedó listo para validación. La importación real se conectará al backend.`); }} />}

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)} slotProps={{ paper: { sx: { mt: 0.75, minWidth: 265, border: "1px solid", borderColor: "divider", boxShadow: "0 14px 32px rgba(7,26,58,.12)" } } }}>
        <MenuItem onClick={() => exportCustomers(false)}>Exportar clientes en CSV</MenuItem>
        <MenuItem onClick={() => exportCustomers(true)}>Exportar clientes con enlace de acceso</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setExportAnchor(null); setMessage("No hay teléfonos inválidos en los datos visibles."); }}>Revisar números móviles inválidos</MenuItem>
      </Menu>

      {passwordCustomer && (
        <PasswordDialog
          key={passwordCustomer.id}
          customer={passwordCustomer}
          onClose={() => setPasswordCustomer(null)}
          onSave={() => {
            setPasswordCustomer(null);
            setMessage("La contraseña del portal se actualizó en esta sesión.");
          }}
        />
      )}

      <Snackbar open={Boolean(message)} autoHideDuration={4200} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage("")} sx={{ width: "100%" }}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}
