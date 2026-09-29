"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  billingViewItems,
  cashAudits,
  creditNotes,
  currency,
  draftInvoices,
  issuedInvoices,
  paymentPromises,
  paymentReceipts,
  payments,
  type BillingView,
  type CashAuditRecord,
  type CreditNoteRecord,
  type InvoiceRecord,
  type PaymentPromiseRecord,
  type PaymentRecord,
  type ReceiptRecord,
} from "./facturacion-data";

const panelSx = {
  border: "1px solid #E2E7EA",
  borderRadius: "2px",
  backgroundColor: "#FFFFFF",
  boxShadow: "2px 3px 8px rgba(31,42,52,.12)",
};

type PreviewState = {
  title: string;
  subtitle?: string;
  kind?: "document" | "audit";
  lines?: { label: string; value: string }[];
} | null;

function matchesQuery(record: object, query: string) {
  return Object.values(record)
    .join(" ")
    .toLocaleLowerCase("es-MX")
    .includes(query.trim().toLocaleLowerCase("es-MX"));
}

function StatusChip({ status }: { status: string }) {
  const normalized = status.toLocaleLowerCase("es-MX");
  const color =
    normalized.includes("impag") || normalized.includes("pendiente")
      ? "error"
      : normalized.includes("anulad")
        ? "primary"
        : normalized.includes("borrador")
          ? "default"
          : "success";
  return (
    <Chip
      size="small"
      color={color}
      label={status}
      sx={{ height: 22, borderRadius: "2px", fontSize: 10.5, fontWeight: 700 }}
    />
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Box
      sx={{
        display: "grid",
        minHeight: 220,
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <HelpOutlineRoundedIcon sx={{ color: "#979B9E", fontSize: 34 }} />
        <Typography
          sx={{ mt: 0.5, color: "#676A6C", fontSize: 14, fontWeight: 650 }}
        >
          {label}
        </Typography>
        <Typography sx={{ mt: 0.35, color: "#8A8C8E", fontSize: 11.5 }}>
          Prueba otra búsqueda o limpia los filtros.
        </Typography>
      </Box>
    </Box>
  );
}

function Pager({
  pageSize,
  onChange,
  total,
  noun,
}: {
  pageSize: number;
  onChange: (size: number) => void;
  total: number;
  noun: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: 1.5,
        py: 1.1,
        borderTop: "1px solid #E7EAEC",
        flexWrap: "wrap",
      }}
    >
      <Typography sx={{ color: "#676A6C", fontSize: 11.5 }}>
        Mostrando {Math.min(total, pageSize)} de {total} {noun}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        <Typography sx={{ mr: 0.5, color: "#676A6C", fontSize: 11 }}>
          Paginar de a
        </Typography>
        {[10, 20, 50, 100, 500].map((size) => (
          <Button
            key={size}
            size="small"
            aria-pressed={pageSize === size}
            variant={pageSize === size ? "contained" : "outlined"}
            onClick={() => onChange(size)}
            sx={{ minWidth: 36, height: 30, px: 0.5, boxShadow: "none" }}
          >
            {size}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

function SearchPanel({
  query,
  onQuery,
  advanced,
  onAdvanced,
  placeholder,
  children,
  onClear,
}: {
  query: string;
  onQuery: (value: string) => void;
  advanced: boolean;
  onAdvanced: (value: boolean) => void;
  placeholder: string;
  children?: ReactNode;
  onClear?: () => void;
}) {
  return (
    <Box sx={{ ...panelSx, mb: 2 }}>
      <Tabs
        value={advanced ? "advanced" : "quick"}
        onChange={(_, value) => onAdvanced(value === "advanced")}
        sx={{
          px: 1.5,
          minHeight: 46,
          borderBottom: "1px solid #E3E7EA",
          "& .MuiTab-root": {
            minHeight: 46,
            px: 2,
            textTransform: "none",
            fontSize: 12,
          },
        }}
      >
        <Tab value="quick" label="Búsqueda rápida" />
        <Tab value="advanced" label="Búsqueda avanzada" />
      </Tabs>
      <Box sx={{ p: 1.75 }}>
        {!advanced ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <TextField
              size="small"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={placeholder}
              sx={{ flex: "1 1 360px", maxWidth: 690 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{ color: "#8A8C8E", fontSize: 19 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {onClear && (
              <Button size="small" onClick={onClear}>
                Limpiar filtros
              </Button>
            )}
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}

function TableAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        color="primary"
        size="small"
        onClick={onClick}
        sx={{ width: 34, height: 34 }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

function DetailTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 42,
        borderBottom: "1px solid #E3E7EA",
        "& .MuiTab-root": {
          minHeight: 42,
          minWidth: 0,
          px: 1.25,
          textTransform: "none",
          fontSize: 10.5,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab} value={tab} label={tab} />
      ))}
    </Tabs>
  );
}

function FacturacionHeader({
  view,
  onCreate,
  onExport,
}: {
  view: BillingView;
  onCreate: () => void;
  onExport: (target: HTMLElement) => void;
}) {
  const current = billingViewItems.find((item) => item.value === view)!;
  return (
    <>
      <Breadcrumbs
        separator={<ChevronRightRoundedIcon sx={{ fontSize: 14 }} />}
        sx={{ mb: 0.8, "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}
      >
        <Link
          href="/"
          color="text.secondary"
          underline="hover"
          sx={{ fontSize: 12 }}
        >
          Inicio
        </Link>
        <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
          Facturación
        </Typography>
        <Typography
          sx={{ color: "text.primary", fontSize: 12, fontWeight: 650 }}
        >
          {current.label}
        </Typography>
      </Breadcrumbs>
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              display: "grid",
              width: 40,
              height: 40,
              placeItems: "center",
              color: "#FFF",
              backgroundColor: "#1C84C6",
              borderRadius: "50%",
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              component="h1"
              sx={{
                color: "#4B4E51",
                fontSize: { xs: 24, sm: 28 },
                fontWeight: 650,
                lineHeight: 1.1,
              }}
            >
              {view === "borradores" || view === "emitidas"
                ? "Facturas"
                : current.label}
            </Typography>
            <Typography sx={{ mt: 0.3, color: "#7A7D80", fontSize: 12.5 }}>
              Gestión de {current.label.toLocaleLowerCase("es-MX")} · datos de
              demostración
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}
        >
          {view === "borradores" && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onCreate}
              sx={{ boxShadow: "none", flex: { xs: 1, sm: "initial" } }}
            >
              Crear Factura
            </Button>
          )}
          {!["promesas", "comprobantes"].includes(view) && (
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              endIcon={<MoreVertRoundedIcon />}
              onClick={(event) => onExport(event.currentTarget)}
              sx={{ boxShadow: "none", flex: { xs: 1, sm: "initial" } }}
            >
              Exportar
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}

function DetailRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Box>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(110px,.8fr) minmax(0,1.2fr)",
            gap: 1,
            py: 0.85,
            borderBottom: "1px solid #ECEEEF",
          }}
        >
          <Typography sx={{ color: "#676A6C", fontSize: 11.5 }}>
            {row.label}
          </Typography>
          <Typography
            sx={{
              minWidth: 0,
              color: "#4B4E51",
              fontSize: 11.5,
              fontWeight: 600,
              textAlign: "right",
              overflowWrap: "anywhere",
            }}
          >
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function AuditPlaceholder({ title }: { title: string }) {
  return (
    <Box
      sx={{
        display: "grid",
        minHeight: 220,
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <ReceiptLongOutlinedIcon sx={{ color: "#1C84C6", fontSize: 34 }} />
        <Typography sx={{ mt: 1, fontSize: 14, fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 0.4, color: "#8A8C8E", fontSize: 11.5 }}>
          Selecciona un registro para consultar esta información.
        </Typography>
      </Box>
    </Box>
  );
}

function CustomerPanel({
  name,
  contract,
}: {
  name: string;
  contract?: string;
}) {
  return (
    <Box>
      <Typography
        sx={{ mb: 1.2, color: "#4B4E51", fontSize: 15, fontWeight: 700 }}
      >
        Información del cliente
      </Typography>
      <DetailRows
        rows={[
          { label: "Nombre", value: name },
          { label: "Contrato", value: contract ?? "Contrato principal" },
          { label: "Documento", value: "RFC demo · XAXX010101000" },
          { label: "Teléfono", value: "+52 55 0000 0000" },
          { label: "Correo", value: "facturacion@cliente-demo.mx" },
        ]}
      />
      <Button
        size="small"
        variant="outlined"
        sx={{ mt: 1.5 }}
        onClick={() => window.location.assign("/clientes")}
      >
        Abrir módulo Clientes
      </Button>
    </Box>
  );
}

function AuditTimeline({
  createdAt,
  subject,
}: {
  createdAt: string;
  subject: string;
}) {
  const events = [
    {
      title: "Registro creado",
      detail: `${subject} fue registrado por Operador COMECORE.`,
      date: createdAt,
    },
    {
      title: "Validación completada",
      detail: "Los datos y el monto fueron validados correctamente.",
      date: "28/09/2026 12:14",
    },
    {
      title: "Última consulta",
      detail: "El documento fue consultado desde Facturación.",
      date: "29/09/2026 09:20",
    },
  ];
  return (
    <Box>
      <Typography
        sx={{ mb: 1.25, color: "#4B4E51", fontSize: 15, fontWeight: 700 }}
      >
        Auditoría
      </Typography>
      {events.map((event, index) => (
        <Box
          key={event.title}
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "18px minmax(0,1fr)",
            gap: 1,
            pb: index === events.length - 1 ? 0 : 1.6,
            "&::before":
              index === events.length - 1
                ? undefined
                : {
                    content: '""',
                    position: "absolute",
                    top: 15,
                    bottom: 0,
                    left: 6.5,
                    width: "1px",
                    backgroundColor: "#DDE3E7",
                  },
          }}
        >
          <Box
            sx={{
              zIndex: 1,
              width: 14,
              height: 14,
              mt: 0.35,
              border: "3px solid #D7EEF9",
              backgroundColor: "#1C84C6",
              borderRadius: "50%",
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ color: "#4B4E51", fontSize: 11.5, fontWeight: 700 }}
            >
              {event.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.2,
                color: "#676A6C",
                fontSize: 10.8,
                overflowWrap: "anywhere",
              }}
            >
              {event.detail}
            </Typography>
            <Typography sx={{ mt: 0.35, color: "#96999C", fontSize: 10 }}>
              {event.date}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function InvoiceRelatedPanel({
  invoice,
  tab,
  onPreview,
}: {
  invoice: InvoiceRecord;
  tab: string;
  onPreview: () => void;
}) {
  if (tab === "Cliente")
    return <CustomerPanel name={invoice.client} contract={invoice.contract} />;
  if (tab === "Auditorías")
    return (
      <AuditTimeline
        createdAt={invoice.issuedAt}
        subject={`La factura #${invoice.id}`}
      />
    );
  if (tab === "Nota de crédito")
    return (
      <Box>
        <Typography sx={{ mb: 1.2, fontSize: 15, fontWeight: 700 }}>
          Notas de crédito relacionadas
        </Typography>
        {invoice.status === "Anulada" ? (
          <>
            <StatusChip status="Aplicada" />
            <DetailRows
              rows={[
                { label: "Nota", value: `NC-${invoice.id}` },
                { label: "Motivo", value: "Anulación de comprobante" },
                { label: "Monto", value: currency.format(invoice.amount) },
              ]}
            />
          </>
        ) : (
          <EmptyState label="Esta factura no tiene notas de crédito" />
        )}
      </Box>
    );
  if (tab === "ID Pago")
    return (
      <Box>
        <Typography sx={{ mb: 1.2, fontSize: 15, fontWeight: 700 }}>
          Identificación del pago
        </Typography>
        <DetailRows
          rows={[
            {
              label: "Referencia",
              value:
                invoice.balance === 0
                  ? `PAY-${invoice.id}-MX`
                  : "Pendiente de asignación",
            },
            { label: "Factura", value: `#${invoice.id}` },
            { label: "Método", value: invoice.paymentMethod },
            {
              label: "Conciliación",
              value: invoice.balance === 0 ? "Conciliada" : "Sin conciliar",
            },
          ]}
        />
        {invoice.balance === 0 && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={onPreview}
            sx={{ mt: 1.5 }}
          >
            Ver comprobante
          </Button>
        )}
      </Box>
    );
  return (
    <Box>
      <Typography sx={{ mb: 1.2, fontSize: 15, fontWeight: 700 }}>
        Pasarela de pagos
      </Typography>
      <DetailRows
        rows={[
          {
            label: "Proveedor",
            value:
              invoice.paymentMethod === "Mercado Pago"
                ? "Mercado Pago"
                : "Sin pasarela",
          },
          {
            label: "Estado",
            value: invoice.balance === 0 ? "Acreditado" : "Esperando pago",
          },
          {
            label: "Referencia externa",
            value: invoice.balance === 0 ? `EXT-${invoice.id}` : "—",
          },
          { label: "Última actualización", value: "28/09/2026 12:20" },
        ]}
      />
    </Box>
  );
}

function InvoiceDetail({
  invoice,
  tab,
  onTab,
  onPreview,
  onAction,
}: {
  invoice: InvoiceRecord;
  tab: string;
  onTab: (tab: string) => void;
  onPreview: () => void;
  onAction: (message: string) => void;
}) {
  const tabs = [
    "Factura",
    "Nota de crédito",
    "Cliente",
    "ID Pago",
    "Pasarela de pagos",
    "Auditorías",
  ];
  return (
    <Box component="aside" sx={{ ...panelSx, minWidth: 0, overflow: "hidden" }}>
      <DetailTabs tabs={tabs} value={tab} onChange={onTab} />
      <Box sx={{ p: 1.6 }}>
        {tab === "Factura" ? (
          <>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "#4B4E51",
                    fontSize: 16,
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  Comprobante de {invoice.business}
                </Typography>
                <Typography sx={{ mt: 0.25, color: "#8A8C8E", fontSize: 11 }}>
                  #{invoice.id} · {invoice.client}
                </Typography>
              </Box>
              <StatusChip status={invoice.status} />
            </Box>
            <Box sx={{ display: "flex", gap: 0.7, my: 1.5, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<VisibilityOutlinedIcon />}
                onClick={onPreview}
                sx={{ boxShadow: "none" }}
              >
                Previsualizar
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintOutlinedIcon />}
                onClick={onPreview}
              >
                Imprimir PDF
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EmailOutlinedIcon />}
                onClick={() =>
                  onAction(
                    `Factura #${invoice.id} enviada a facturacion@cliente-demo.mx.`,
                  )
                }
              >
                Enviar por email
              </Button>
            </Box>
            <Divider />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.2,
                py: 1.5,
              }}
            >
              <Box>
                <Typography sx={{ color: "#8A8C8E", fontSize: 10.5 }}>
                  Monto pagado
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 650 }}>
                  {currency.format(invoice.amount - invoice.balance)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "#8A8C8E", fontSize: 10.5 }}>
                  Monto adeudado
                </Typography>
                <Typography
                  sx={{
                    color: invoice.balance ? "error.main" : "text.primary",
                    fontSize: 18,
                    fontWeight: 650,
                  }}
                >
                  {currency.format(invoice.balance)}
                </Typography>
              </Box>
            </Box>
            <DetailRows
              rows={[
                ["Emitido el", invoice.issuedAt],
                ["Periodo", invoice.period],
                ["Vencimiento", invoice.dueAt],
                ["Forma de pago", invoice.paymentMethod],
              ].map(([label, value]) => ({ label, value }))}
            />
            <Typography
              sx={{
                mt: 1.7,
                mb: 0.7,
                color: "#4B4E51",
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              Items
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: 1,
                p: 1.1,
                backgroundColor: "#F7F8F9",
              }}
            >
              <Typography sx={{ fontSize: 11.5, overflowWrap: "anywhere" }}>
                {invoice.concept}
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>
                {currency.format(invoice.amount)}
              </Typography>
            </Box>
          </>
        ) : (
          <InvoiceRelatedPanel
            invoice={invoice}
            tab={tab}
            onPreview={onPreview}
          />
        )}
      </Box>
    </Box>
  );
}

function InvoicesView({
  mode,
  rows,
  query,
  setQuery,
  pageSize,
  setPageSize,
  selectedId,
  setSelectedId,
  onPreview,
  onAction,
  onEmitDrafts,
  onDeleteDrafts,
}: {
  mode: "emitidas" | "borradores";
  rows: InvoiceRecord[];
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  selectedId: number | null;
  setSelectedId: (id: number) => void;
  onPreview: (invoice: InvoiceRecord) => void;
  onAction: (message: string) => void;
  onEmitDrafts?: (ids: number[]) => void;
  onDeleteDrafts?: (ids: number[]) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [period, setPeriod] = useState("Últimos 3 meses");
  const [status, setStatus] = useState("Todos");
  const [detailTab, setDetailTab] = useState("Factura");
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const filtered = rows.filter(
    (row) =>
      matchesQuery(row, query) && (status === "Todos" || row.status === status),
  );
  const visibleIds = filtered.slice(0, pageSize).map((row) => row.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedDrafts.includes(id));
  const toggleDraft = (id: number) =>
    setSelectedDrafts((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const runBulkAction = (action?: (ids: number[]) => void) => {
    if (!selectedDrafts.length) {
      onAction("Selecciona al menos un borrador para continuar.");
      return;
    }
    action?.(selectedDrafts);
    setSelectedDrafts([]);
  };

  return (
    <>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        advanced={advanced}
        onAdvanced={setAdvanced}
        placeholder={
          mode === "emitidas"
            ? "Nombre cliente (Como figura en la factura)"
            : "Cliente (Nombre)"
        }
        onClear={() => {
          setQuery("");
          setStatus("Todos");
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Nombre del cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <TextField size="small" label="Número de factura" />
          <TextField
            size="small"
            select
            label="Estado"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {["Todos", "Pagada", "Impaga", "Anulada", "Borrador"].map(
              (item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ),
            )}
          </TextField>
          <TextField size="small" label="Documento o Cédula de identidad" />
          <TextField
            size="small"
            label="Facturas creadas desde"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            label="Facturas creadas hasta"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </SearchPanel>
      <Box sx={{ display: "flex", mb: 2, flexWrap: "wrap" }}>
        {["Últimos 3 meses", "Último mes", "Mes actual"].map((item) => (
          <Button
            key={item}
            size="small"
            variant={period === item ? "contained" : "outlined"}
            onClick={() => setPeriod(item)}
            sx={{ borderRadius: 0, boxShadow: "none" }}
          >
            {item}
          </Button>
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            lg:
              mode === "emitidas"
                ? "minmax(620px,1.45fr) minmax(320px,.75fr)"
                : "1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={panelSx}>
          <TableContainer>
            <Table
              size="small"
              sx={{ minWidth: mode === "emitidas" ? 780 : 650 }}
            >
              <TableHead>
                <TableRow>
                  {mode === "borradores" && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={allVisibleSelected}
                        indeterminate={
                          selectedDrafts.length > 0 && !allVisibleSelected
                        }
                        onChange={() =>
                          setSelectedDrafts(
                            allVisibleSelected ? [] : visibleIds,
                          )
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Emitido el</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, pageSize).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected?.id === row.id}
                    onClick={() => setSelectedId(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "#BCE4F3" },
                      "&.Mui-selected:hover": { backgroundColor: "#AEDDEE" },
                    }}
                  >
                    {mode === "borradores" && (
                      <TableCell
                        padding="checkbox"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedDrafts.includes(row.id)}
                          onChange={() => toggleDraft(row.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ color: "#1C84C6", fontWeight: 700 }}>
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "#1C84C6",
                          fontSize: 11.5,
                          fontWeight: 650,
                        }}
                      >
                        {row.client}
                      </Typography>
                      <Typography sx={{ color: "#8A8C8E", fontSize: 10.5 }}>
                        {row.business}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {row.issuedAt}
                    </TableCell>
                    <TableCell sx={{ color: "#1C84C6", fontSize: 11 }}>
                      {row.type}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 11.5, fontWeight: 650 }}
                    >
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: row.balance ? "error.main" : "text.primary",
                        fontSize: 11.5,
                      }}
                    >
                      {currency.format(row.balance)}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <TableAction
                        label="Previsualizar"
                        icon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => onPreview(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <EmptyState label="No se encontraron facturas" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {mode === "borradores" && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                px: 1.5,
                py: 1.1,
                borderTop: "1px solid #E7EAEC",
                flexWrap: "wrap",
              }}
            >
              <Button
                size="small"
                variant="contained"
                disabled={!selectedDrafts.length}
                onClick={() => runBulkAction(onEmitDrafts)}
                sx={{ boxShadow: "none" }}
              >
                Emitir seleccionadas
              </Button>
              <Button
                size="small"
                color="error"
                disabled={!selectedDrafts.length}
                onClick={() => runBulkAction(onDeleteDrafts)}
              >
                Eliminar
              </Button>
              <Typography
                sx={{
                  ml: { sm: "auto" },
                  alignSelf: "center",
                  color: "#7A7D80",
                  fontSize: 11,
                }}
              >
                {selectedDrafts.length} seleccionadas
              </Typography>
            </Box>
          )}
          <Pager
            pageSize={pageSize}
            onChange={setPageSize}
            total={filtered.length}
            noun="facturas"
          />
        </Box>
        {mode === "emitidas" && selected && (
          <InvoiceDetail
            invoice={selected}
            tab={detailTab}
            onTab={setDetailTab}
            onPreview={() => onPreview(selected)}
            onAction={onAction}
          />
        )}
      </Box>
    </>
  );
}

function CreditNotesView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: CreditNoteRecord) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [selectedId, setSelectedId] = useState(creditNotes[0].id);
  const [tab, setTab] = useState("Nota de crédito");
  const selected = creditNotes.find((row) => row.id === selectedId)!;
  const filtered = creditNotes.filter((row) => matchesQuery(row, query));
  return (
    <>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        advanced={advanced}
        onAdvanced={setAdvanced}
        placeholder="Cliente (Nombre)"
        onClear={() => setQuery("")}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <TextField size="small" label="Número de factura" />
          <TextField
            size="small"
            label="Emitidas desde"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </SearchPanel>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(620px,1.35fr) minmax(330px,.65fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={panelSx}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Factura</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Emitido el</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, pageSize).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected.id === row.id}
                    onClick={() => setSelectedId(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "#BCE4F3" },
                    }}
                  >
                    <TableCell sx={{ color: "#1C84C6", fontWeight: 700 }}>
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                        {row.client}
                      </Typography>
                      <Typography sx={{ color: "#8A8C8E", fontSize: 10.5 }}>
                        COMECORE Telecomunicaciones
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                      #{row.invoice}
                    </TableCell>
                    <TableCell align="right">
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{row.issuedAt}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <TableAction
                        label="Previsualizar"
                        icon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => onPreview(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pager
            pageSize={pageSize}
            onChange={setPageSize}
            total={filtered.length}
            noun="notas de crédito"
          />
        </Box>
        <Box component="aside" sx={{ ...panelSx, overflow: "hidden" }}>
          <DetailTabs
            tabs={["Nota de crédito", "Cliente", "Auditorías"]}
            value={tab}
            onChange={setTab}
          />
          <Box sx={{ p: 1.6 }}>
            {tab === "Nota de crédito" ? (
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => onPreview(selected)}
                  sx={{ mb: 1.5, boxShadow: "none" }}
                >
                  Previsualizar
                </Button>
                <Typography
                  sx={{ color: "#4B4E51", fontSize: 15, fontWeight: 700 }}
                >
                  Categorías
                </Typography>
                <Chip
                  label={selected.category}
                  color={
                    selected.category.includes("Error") ? "error" : "primary"
                  }
                  size="small"
                  sx={{ mt: 0.8, borderRadius: "2px" }}
                />
                <Typography
                  sx={{
                    mt: 2,
                    color: "#4B4E51",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Items
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 1,
                    mt: 0.8,
                    p: 1.2,
                    backgroundColor: "#F7F8F9",
                  }}
                >
                  <Typography sx={{ fontSize: 11.5 }}>
                    {selected.description}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 11.5 }}>
                    {currency.format(selected.amount)}
                  </Typography>
                </Box>
              </>
            ) : (
              <AuditPlaceholder title={tab} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function PaymentsView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
  onAction,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: PaymentRecord) => void;
  onAction: (message: string) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [selectedId, setSelectedId] = useState(payments[0].id);
  const [method, setMethod] = useState("Todas");
  const [tab, setTab] = useState("Pago");
  const selected = payments.find((row) => row.id === selectedId)!;
  const filtered = payments.filter(
    (row) =>
      matchesQuery(row, query) && (method === "Todas" || row.method === method),
  );
  const methods = [
    "Todas",
    "No identificado",
    "Transferencia electrónica",
    "Transferencia bancaria",
    "Efectivo",
    "Nota de crédito",
    "Cuenta corriente",
    "Reembolso",
    "Mercado Pago",
  ];
  return (
    <>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        advanced={advanced}
        onAdvanced={setAdvanced}
        placeholder="Cliente (Nombre)"
        onClear={() => {
          setQuery("");
          setMethod("Todas");
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <TextField
            size="small"
            select
            label="Recolectado por"
            defaultValue="Todos"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Jenifer M.">Jenifer M.</MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="Registrado por"
            defaultValue="Todos"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Juan J. Córdova">Juan J. Córdova</MenuItem>
          </TextField>
        </Box>
      </SearchPanel>
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{ mb: 0.7, color: "#676A6C", fontSize: 11.5, fontWeight: 700 }}
        >
          Formas de pago
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {methods.map((item) => (
            <Button
              key={item}
              size="small"
              variant={method === item ? "contained" : "outlined"}
              onClick={() => setMethod(item)}
              sx={{ borderRadius: 0, boxShadow: "none", fontSize: 10.5 }}
            >
              {item}
            </Button>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(660px,1.4fr) minmax(340px,.6fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={panelSx}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha de pago</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Crédito</TableCell>
                  <TableCell>Recolectado por</TableCell>
                  <TableCell>Registrado por</TableCell>
                  <TableCell>Forma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, pageSize).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected.id === row.id}
                    onClick={() => setSelectedId(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "#BCE4F3" },
                    }}
                  >
                    <TableCell sx={{ color: "#1C84C6", fontWeight: 700 }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                      {row.client}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{row.paidAt}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {currency.format(row.credit)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{row.collector}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {row.registeredBy}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.method}
                        size="small"
                        color="primary"
                        sx={{ height: 22, borderRadius: "2px", fontSize: 9.5 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pager
            pageSize={pageSize}
            onChange={setPageSize}
            total={filtered.length}
            noun="pagos"
          />
        </Box>
        <Box component="aside" sx={{ ...panelSx, overflow: "hidden" }}>
          <DetailTabs
            tabs={["Pago", "Cliente", "Auditorías"]}
            value={tab}
            onChange={setTab}
          />
          <Box sx={{ p: 1.6 }}>
            {tab === "Pago" ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    $ Información de pago
                  </Typography>
                  <StatusChip status={selected.status} />
                </Box>
                <Box
                  sx={{ display: "flex", gap: 0.6, my: 1.5, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onPreview(selected)}
                    sx={{ boxShadow: "none" }}
                  >
                    Previsualizar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PrintOutlinedIcon />}
                    onClick={() => onAction("Comprobante listo para imprimir.")}
                  >
                    Imprimir
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PointOfSaleOutlinedIcon />}
                    onClick={() => onAction("Formato POS preparado.")}
                  >
                    Imprimir POS
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 1,
                    py: 1.3,
                    borderTop: "1px solid #ECEEEF",
                    borderBottom: "1px solid #ECEEEF",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#8A8C8E", fontSize: 10 }}>
                      ID
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      #{selected.id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#8A8C8E", fontSize: 10 }}>
                      Fecha
                    </Typography>
                    <Typography sx={{ fontSize: 11.5 }}>
                      {selected.paidAt}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#8A8C8E", fontSize: 10 }}>
                      Monto
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {currency.format(selected.amount)}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1.5, fontSize: 14, fontWeight: 700 }}>
                  Transacciones de Pago
                </Typography>
                <Box sx={{ mt: 0.7, p: 1.1, backgroundColor: "#F7F8F9" }}>
                  <Typography sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                    Comprobante #{selected.invoice}
                  </Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 11.5 }}>
                    {currency.format(selected.amount)}
                  </Typography>
                </Box>
              </>
            ) : (
              <AuditPlaceholder title={tab} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function PaymentPromisesView({
  query,
  setQuery,
  onPreview,
}: {
  query: string;
  setQuery: (value: string) => void;
  onPreview: (record: PaymentPromiseRecord) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = paymentPromises.filter((row) => matchesQuery(row, query));
  return (
    <>
      <Box
        sx={{
          ...panelSx,
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          p: 1.2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre de cliente"
          sx={{ flex: "1 1 300px", maxWidth: 520 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title="Filtros">
          <IconButton onClick={() => setFiltersOpen(true)}>
            <FilterAltOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Chip
          label={`${filtered.length} Total items`}
          variant="outlined"
          sx={{ height: 38, borderRadius: "6px" }}
        />
        <Button
          variant="outlined"
          startIcon={<AutorenewRoundedIcon />}
          onClick={() => setQuery("")}
        >
          Explora lo nuevo
        </Button>
      </Box>
      <Box sx={panelSx}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" />
                </TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Deuda acumulada</TableCell>
                <TableCell>Aplicación Móvil</TableCell>
                <TableCell>Válido hasta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Creador</TableCell>
                <TableCell>Creado el</TableCell>
                <TableCell align="right">Documento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{ color: "#4B4E51", fontSize: 11.5, fontWeight: 700 }}
                    >
                      {row.client}
                    </Typography>
                    <Typography sx={{ color: "#8A8C8E", fontSize: 10 }}>
                      {row.contract}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: row.debt ? "error.main" : "text.primary",
                      fontWeight: row.debt ? 700 : 400,
                    }}
                  >
                    {currency.format(row.debt)}
                  </TableCell>
                  <TableCell>
                    {row.mobile && (
                      <Chip
                        label="Aplicación Móvil"
                        color="primary"
                        size="small"
                        sx={{ height: 22, borderRadius: "2px" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{row.validUntil}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.type}
                      color="success"
                      size="small"
                      sx={{ height: 22, borderRadius: "2px" }}
                    />
                  </TableCell>
                  <TableCell>{row.creator}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                    {row.createdAt}
                  </TableCell>
                  <TableCell align="right">
                    <TableAction
                      label="Ver comprobante de promesa"
                      icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filtros de promesas de pago</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.5, pt: 1 }}>
            <TextField size="small" select label="Tipo" defaultValue="Todos">
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Manual">Manual</MenuItem>
              <MenuItem value="Automática">Automática</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Válidas hasta"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Solo con deuda acumulada"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setFiltersOpen(false)}>
            Aplicar filtros
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function PaymentReceiptsView({
  query,
  setQuery,
  onPreview,
}: {
  query: string;
  setQuery: (value: string) => void;
  onPreview: (record: ReceiptRecord) => void;
}) {
  const filtered = paymentReceipts.filter((row) => matchesQuery(row, query));
  return (
    <>
      <Box
        sx={{
          ...panelSx,
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          p: 1.2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre de cliente, número de factura..."
          sx={{ flex: "1 1 320px", maxWidth: 560 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Chip
          label={`${filtered.length} Total items`}
          variant="outlined"
          sx={{ height: 38, borderRadius: "6px" }}
        />
        <Button
          variant="outlined"
          startIcon={<AutorenewRoundedIcon />}
          onClick={() => setQuery("")}
        >
          Explora lo nuevo
        </Button>
      </Box>
      <Box sx={panelSx}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Factura</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado el</TableCell>
                <TableCell align="right">Documento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ color: "#1C84C6", fontWeight: 600 }}>
                    {row.client}
                  </TableCell>
                  <TableCell sx={{ color: "#1C84C6" }}>
                    Comprobante #{row.id}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell align="right">
                    <TableAction
                      label="Abrir comprobante"
                      icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState label="No hay comprobantes para mostrar" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

function CashAuditsView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
  onDownload,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: CashAuditRecord) => void;
  onDownload: (record: CashAuditRecord) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const filtered = cashAudits.filter((row) => matchesQuery(row, query));
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) auto" },
          gap: 1,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Puedes buscar por: ID y Creador"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "#8A8C8E" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<SearchRoundedIcon />}
          onClick={() => setAdvancedOpen(true)}
        >
          Búsqueda Avanzada
        </Button>
      </Box>
      <Box sx={panelSx}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell># ▼</TableCell>
                <TableCell>Creado el ▲</TableCell>
                <TableCell>Creado por</TableCell>
                <TableCell align="right">Transacciones ▲</TableCell>
                <TableCell align="right">Monto ▲</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          display: "grid",
                          width: 32,
                          height: 32,
                          placeItems: "center",
                          color: "#FFF",
                          backgroundColor: "#FF977D",
                          borderRadius: "50%",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {row.creatorInitials}
                      </Box>
                      <Typography sx={{ fontSize: 11.5 }}>
                        {row.creator}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{row.transactions}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {currency.format(row.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <TableAction
                      label="Ver detalle"
                      icon={<SearchRoundedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                    <TableAction
                      label="Descargar arqueo"
                      icon={<DownloadRoundedIcon fontSize="small" />}
                      onClick={() => onDownload(row)}
                    />
                    <TableAction
                      label="Vista resumida"
                      icon={<VisibilityOutlinedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pager
          pageSize={pageSize}
          onChange={setPageSize}
          total={filtered.length}
          noun="arqueos de caja"
        />
      </Box>
      <Dialog
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Búsqueda avanzada</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              pt: 1,
            }}
          >
            <TextField size="small" label="ID de arqueo" />
            <TextField size="small" label="Creado por" />
            <TextField
              size="small"
              label="Desde"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="Hasta"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdvancedOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setAdvancedOpen(false)}>
            Buscar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function CreditNotesOperationalView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: CreditNoteRecord) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState("Todos");
  const [selectedId, setSelectedId] = useState(creditNotes[0].id);
  const [tab, setTab] = useState("Nota de crédito");
  const selected =
    creditNotes.find((row) => row.id === selectedId) ?? creditNotes[0];
  const filtered = creditNotes.filter(
    (row) =>
      matchesQuery(row, query) &&
      (!invoiceNumber || String(row.invoice).includes(invoiceNumber)) &&
      (status === "Todos" || row.status === status),
  );
  const clear = () => {
    setQuery("");
    setInvoiceNumber("");
    setStatus("Todos");
  };

  return (
    <>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        advanced={advanced}
        onAdvanced={setAdvanced}
        placeholder="Cliente (Nombre)"
        onClear={clear}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <TextField
            size="small"
            label="Número de factura"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <TextField
            size="small"
            select
            label="Estado"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {["Todos", "Aplicada", "Anulada"].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </SearchPanel>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            lg: "minmax(620px,1.35fr) minmax(330px,.65fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={panelSx}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Factura</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Emitido el</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, pageSize).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected.id === row.id}
                    onClick={() => setSelectedId(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "#BCE4F3" },
                    }}
                  >
                    <TableCell sx={{ color: "#1C84C6", fontWeight: 700 }}>
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "#1C84C6",
                          fontSize: 11.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {row.client}
                      </Typography>
                      <Typography sx={{ color: "#8A8C8E", fontSize: 10.5 }}>
                        COMECORE Telecomunicaciones
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                      #{row.invoice}
                    </TableCell>
                    <TableCell align="right">
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {row.issuedAt}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <TableAction
                        label="Previsualizar"
                        icon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => onPreview(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState label="No se encontraron notas de crédito" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pager
            pageSize={pageSize}
            onChange={setPageSize}
            total={filtered.length}
            noun="notas de crédito"
          />
        </Box>
        <Box
          component="aside"
          sx={{ ...panelSx, minWidth: 0, overflow: "hidden" }}
        >
          <DetailTabs
            tabs={["Nota de crédito", "Cliente", "Auditorías"]}
            value={tab}
            onChange={setTab}
          />
          <Box sx={{ p: 1.6 }}>
            {tab === "Nota de crédito" ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                    Nota #{selected.id}
                  </Typography>
                  <StatusChip status={selected.status} />
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => onPreview(selected)}
                  sx={{ mb: 1.5, boxShadow: "none" }}
                >
                  Previsualizar
                </Button>
                <DetailRows
                  rows={[
                    { label: "Factura", value: `#${selected.invoice}` },
                    { label: "Categoría", value: selected.category },
                    { label: "Emitida el", value: selected.issuedAt },
                    { label: "Monto", value: currency.format(selected.amount) },
                  ]}
                />
                <Typography
                  sx={{ mt: 1.6, mb: 0.6, fontSize: 13.5, fontWeight: 700 }}
                >
                  Items
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto",
                    gap: 1,
                    p: 1.1,
                    backgroundColor: "#F7F8F9",
                  }}
                >
                  <Typography sx={{ fontSize: 11.5, overflowWrap: "anywhere" }}>
                    {selected.description}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>
                    {currency.format(selected.amount)}
                  </Typography>
                </Box>
              </>
            ) : tab === "Cliente" ? (
              <CustomerPanel name={selected.client} />
            ) : (
              <AuditTimeline
                createdAt={selected.issuedAt}
                subject={`La nota #${selected.id}`}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function PaymentsOperationalView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
  onAction,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: PaymentRecord) => void;
  onAction: (message: string) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [selectedId, setSelectedId] = useState(payments[0].id);
  const [method, setMethod] = useState("Todas");
  const [collector, setCollector] = useState("Todos");
  const [registeredBy, setRegisteredBy] = useState("Todos");
  const [tab, setTab] = useState("Pago");
  const selected = payments.find((row) => row.id === selectedId) ?? payments[0];
  const filtered = payments.filter(
    (row) =>
      matchesQuery(row, query) &&
      (method === "Todas" || row.method === method) &&
      (collector === "Todos" || row.collector === collector) &&
      (registeredBy === "Todos" || row.registeredBy === registeredBy),
  );
  const methods = [
    "Todas",
    ...Array.from(new Set(payments.map((row) => row.method))),
  ];
  const clear = () => {
    setQuery("");
    setMethod("Todas");
    setCollector("Todos");
    setRegisteredBy("Todos");
  };

  return (
    <>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        advanced={advanced}
        onAdvanced={setAdvanced}
        placeholder="Cliente (Nombre)"
        onClear={clear}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <TextField
            size="small"
            select
            label="Recolectado por"
            value={collector}
            onChange={(event) => setCollector(event.target.value)}
          >
            {[
              "Todos",
              ...Array.from(new Set(payments.map((row) => row.collector))),
            ].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Registrado por"
            value={registeredBy}
            onChange={(event) => setRegisteredBy(event.target.value)}
          >
            {[
              "Todos",
              ...Array.from(new Set(payments.map((row) => row.registeredBy))),
            ].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </SearchPanel>
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{ mb: 0.7, color: "#676A6C", fontSize: 11.5, fontWeight: 700 }}
        >
          Formas de pago
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {methods.map((item) => (
            <Button
              key={item}
              size="small"
              variant={method === item ? "contained" : "outlined"}
              onClick={() => setMethod(item)}
              sx={{ borderRadius: 0, boxShadow: "none", fontSize: 10.5 }}
            >
              {item}
            </Button>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            lg: "minmax(660px,1.4fr) minmax(340px,.6fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={panelSx}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha de pago</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Crédito</TableCell>
                  <TableCell>Recolectado por</TableCell>
                  <TableCell>Registrado por</TableCell>
                  <TableCell>Forma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, pageSize).map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected.id === row.id}
                    onClick={() => setSelectedId(row.id)}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "#BCE4F3" },
                    }}
                  >
                    <TableCell sx={{ color: "#1C84C6", fontWeight: 700 }}>
                      {row.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#1C84C6",
                        fontSize: 11.5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {row.client}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {row.paidAt}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {currency.format(row.credit)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{row.collector}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {row.registeredBy}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.method}
                        size="small"
                        color="primary"
                        sx={{
                          height: 22,
                          maxWidth: 150,
                          borderRadius: "2px",
                          fontSize: 9.5,
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState label="No se encontraron pagos" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pager
            pageSize={pageSize}
            onChange={setPageSize}
            total={filtered.length}
            noun="pagos"
          />
        </Box>
        <Box
          component="aside"
          sx={{ ...panelSx, minWidth: 0, overflow: "hidden" }}
        >
          <DetailTabs
            tabs={["Pago", "Cliente", "Auditorías"]}
            value={tab}
            onChange={setTab}
          />
          <Box sx={{ p: 1.6 }}>
            {tab === "Pago" ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    Información de pago
                  </Typography>
                  <StatusChip status={selected.status} />
                </Box>
                <Box
                  sx={{ display: "flex", gap: 0.6, my: 1.5, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onPreview(selected)}
                    sx={{ boxShadow: "none" }}
                  >
                    Previsualizar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PrintOutlinedIcon />}
                    onClick={() => onPreview(selected)}
                  >
                    Imprimir
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PointOfSaleOutlinedIcon />}
                    onClick={() => {
                      onPreview(selected);
                      onAction(
                        `Formato POS del pago #${selected.id} preparado.`,
                      );
                    }}
                  >
                    Imprimir POS
                  </Button>
                </Box>
                <DetailRows
                  rows={[
                    { label: "ID", value: `#${selected.id}` },
                    { label: "Fecha", value: selected.paidAt },
                    { label: "Monto", value: currency.format(selected.amount) },
                    { label: "Forma", value: selected.method },
                    { label: "Recolectado por", value: selected.collector },
                    { label: "Registrado por", value: selected.registeredBy },
                  ]}
                />
                <Typography sx={{ mt: 1.5, fontSize: 14, fontWeight: 700 }}>
                  Transacciones de pago
                </Typography>
                <Box sx={{ mt: 0.7, p: 1.1, backgroundColor: "#F7F8F9" }}>
                  <Typography sx={{ color: "#1C84C6", fontSize: 11.5 }}>
                    Comprobante #{selected.invoice}
                  </Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 11.5 }}>
                    {currency.format(selected.amount)}
                  </Typography>
                </Box>
              </>
            ) : tab === "Cliente" ? (
              <CustomerPanel name={selected.client} />
            ) : (
              <AuditTimeline
                createdAt={selected.paidAt}
                subject={`El pago #${selected.id}`}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function PaymentPromisesOperationalView({
  query,
  setQuery,
  onPreview,
  onAction,
}: {
  query: string;
  setQuery: (value: string) => void;
  onPreview: (record: PaymentPromiseRecord) => void;
  onAction: (message: string) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [type, setType] = useState("Todos");
  const [debtOnly, setDebtOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const filtered = paymentPromises.filter(
    (row) =>
      matchesQuery(row, query) &&
      (type === "Todos" || row.type === type) &&
      (!debtOnly || row.debt > 0),
  );
  const visibleIds = filtered.map((row) => row.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggle = (id: number) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const clear = () => {
    setQuery("");
    setType("Todos");
    setDebtOnly(false);
    setSelectedIds([]);
  };

  return (
    <>
      <Box
        sx={{
          ...panelSx,
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          p: 1.2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre de cliente"
          sx={{ flex: "1 1 300px", maxWidth: 520 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title="Filtros">
          <IconButton
            aria-label="Abrir filtros"
            onClick={() => setFiltersOpen(true)}
          >
            <FilterAltOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Chip
          label={`${filtered.length} Total items`}
          variant="outlined"
          sx={{ height: 38, borderRadius: "6px" }}
        />
        <Button
          variant="outlined"
          startIcon={<AutorenewRoundedIcon />}
          onClick={clear}
        >
          Limpiar
        </Button>
      </Box>
      {selectedIds.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
            p: 1.2,
            backgroundColor: "#EAF6FC",
            border: "1px solid #B7DFF1",
          }}
        >
          <Typography
            sx={{
              mr: "auto",
              color: "#155D87",
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            {selectedIds.length} promesas seleccionadas
          </Typography>
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() =>
              onAction(
                `${selectedIds.length} comprobantes de promesa preparados para descarga.`,
              )
            }
          >
            Descargar
          </Button>
          <Button size="small" onClick={() => setSelectedIds([])}>
            Cancelar selección
          </Button>
        </Box>
      )}
      <Box sx={panelSx}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={selectedIds.length > 0 && !allSelected}
                    onChange={() =>
                      setSelectedIds(allSelected ? [] : visibleIds)
                    }
                  />
                </TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Deuda acumulada</TableCell>
                <TableCell>Aplicación Móvil</TableCell>
                <TableCell>Válido hasta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Creador</TableCell>
                <TableCell>Creado el</TableCell>
                <TableCell align="right">Documento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={selectedIds.includes(row.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: "#4B4E51",
                        fontSize: 11.5,
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {row.client}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#8A8C8E",
                        fontSize: 10,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {row.contract}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: row.debt ? "error.main" : "text.primary",
                      fontWeight: row.debt ? 700 : 400,
                    }}
                  >
                    {currency.format(row.debt)}
                  </TableCell>
                  <TableCell>
                    {row.mobile && (
                      <Chip
                        label="Aplicación Móvil"
                        color="primary"
                        size="small"
                        sx={{ height: 22, borderRadius: "2px" }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.validUntil}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.type}
                      color="success"
                      size="small"
                      sx={{ height: 22, borderRadius: "2px" }}
                    />
                  </TableCell>
                  <TableCell>{row.creator}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                    {row.createdAt}
                  </TableCell>
                  <TableCell align="right">
                    <TableAction
                      label="Ver comprobante de promesa"
                      icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <EmptyState label="No se encontraron promesas de pago" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filtros de promesas de pago</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.5, pt: 1 }}>
            <TextField
              size="small"
              select
              label="Tipo"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Manual">Manual</MenuItem>
              <MenuItem value="Automática">Automática</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={debtOnly}
                  onChange={(event) => setDebtOnly(event.target.checked)}
                />
              }
              label="Solo con deuda acumulada"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clear}>Limpiar</Button>
          <Button variant="contained" onClick={() => setFiltersOpen(false)}>
            Aplicar filtros
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function CashAuditsOperationalView({
  query,
  setQuery,
  pageSize,
  setPageSize,
  onPreview,
  onDownload,
}: {
  query: string;
  setQuery: (value: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onPreview: (record: CashAuditRecord) => void;
  onDownload: (record: CashAuditRecord) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [idFilter, setIdFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const filtered = cashAudits.filter(
    (row) =>
      matchesQuery(row, query) &&
      (!idFilter || String(row.id).includes(idFilter)) &&
      (!creatorFilter ||
        row.creator
          .toLocaleLowerCase("es-MX")
          .includes(creatorFilter.toLocaleLowerCase("es-MX"))),
  );
  const clear = () => {
    setQuery("");
    setIdFilter("");
    setCreatorFilter("");
  };

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) auto" },
          gap: 1,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Puedes buscar por: ID y Creador"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "#8A8C8E" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<SearchRoundedIcon />}
          onClick={() => setAdvancedOpen(true)}
        >
          Búsqueda Avanzada
        </Button>
      </Box>
      <Box sx={panelSx}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell># ▼</TableCell>
                <TableCell>Creado el ▲</TableCell>
                <TableCell>Creado por</TableCell>
                <TableCell align="right">Transacciones ▲</TableCell>
                <TableCell align="right">Monto ▲</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(0, pageSize).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.createdAt}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          display: "grid",
                          flex: "0 0 auto",
                          width: 32,
                          height: 32,
                          placeItems: "center",
                          color: "#FFF",
                          backgroundColor: "#FF8064",
                          borderRadius: "50%",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {row.creatorInitials}
                      </Box>
                      <Typography
                        sx={{
                          minWidth: 0,
                          fontSize: 11.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {row.creator}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{row.transactions}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {currency.format(row.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <TableAction
                      label="Ver detalle"
                      icon={<SearchRoundedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                    <TableAction
                      label="Descargar arqueo"
                      icon={<DownloadRoundedIcon fontSize="small" />}
                      onClick={() => onDownload(row)}
                    />
                    <TableAction
                      label="Vista resumida"
                      icon={<VisibilityOutlinedIcon fontSize="small" />}
                      onClick={() => onPreview(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState label="No se encontraron arqueos de caja" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pager
          pageSize={pageSize}
          onChange={setPageSize}
          total={filtered.length}
          noun="arqueos de caja"
        />
      </Box>
      <Dialog
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Búsqueda avanzada</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              pt: 1,
            }}
          >
            <TextField
              size="small"
              label="ID de arqueo"
              value={idFilter}
              onChange={(event) => setIdFilter(event.target.value)}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
            />
            <TextField
              size="small"
              label="Creado por"
              value={creatorFilter}
              onChange={(event) => setCreatorFilter(event.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clear}>Limpiar</Button>
          <Button variant="contained" onClick={() => setAdvancedOpen(false)}>
            Buscar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function CreateInvoiceDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (invoice: InvoiceRecord) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState("Factura");
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("Servicio mensual");
  const [error, setError] = useState(false);

  function save() {
    if (!client.trim()) {
      setError(true);
      setTab("Factura");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError(true);
      setTab("Items");
      return;
    }
    onCreate({
      id: Date.now(),
      client,
      business: "COMECORE Telecomunicaciones",
      contract: "Contrato seleccionado",
      type: "Comprobante",
      amount: Number(amount),
      balance: Number(amount),
      issuedAt: "—",
      period: "Sep. 2026",
      status: "Borrador",
      paymentMethod: "Por definir",
      dueAt: "04/10/2026",
      concept,
    });
    setClient("");
    setAmount("");
    setError(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
            Crear Factura
          </Typography>
          <Typography sx={{ mt: 0.3, color: "#8A8C8E", fontSize: 11.5 }}>
            El registro se guardará solamente en esta sesión de demostración.
          </Typography>
        </Box>
        <IconButton aria-label="Cerrar" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{
          px: 2,
          borderTop: "1px solid #E7EAEC",
          borderBottom: "1px solid #E7EAEC",
          "& .MuiTab-root": { minHeight: 46, textTransform: "none" },
        }}
      >
        <Tab value="Factura" label="Factura" />
        <Tab value="Items" label="Items" />
        <Tab value="Avanzado" label="Avanzado" />
      </Tabs>
      <DialogContent sx={{ pt: 2.5 }}>
        {tab === "Factura" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
              gap: 1.6,
            }}
          >
            <TextField
              autoFocus
              required
              error={error && !client.trim()}
              helperText={
                error && !client.trim() ? "Selecciona un cliente." : ""
              }
              label="Cliente"
              value={client}
              onChange={(event) => setClient(event.target.value)}
            />
            <TextField
              select
              label="Contrato"
              defaultValue="Contrato principal"
            >
              <MenuItem value="Contrato principal">Contrato principal</MenuItem>
              <MenuItem value="Sin contrato">Sin contrato</MenuItem>
            </TextField>
            <TextField
              label="Fecha de emisión"
              type="date"
              defaultValue="2026-09-28"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fecha de vencimiento"
              type="date"
              defaultValue="2026-10-04"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Tipo de factura"
              defaultValue="Comprobante"
            >
              <MenuItem value="Comprobante">Comprobante</MenuItem>
              <MenuItem value="Factura">Factura</MenuItem>
            </TextField>
            <TextField select label="Forma de pago" defaultValue="Por definir">
              <MenuItem value="Por definir">Por definir</MenuItem>
              <MenuItem value="Efectivo">Efectivo</MenuItem>
              <MenuItem value="Transferencia">Transferencia</MenuItem>
            </TextField>
          </Box>
        )}
        {tab === "Items" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
              gap: 1.6,
            }}
          >
            <TextField
              required
              label="Concepto"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
            />
            <TextField
              required
              error={error && (!amount || Number(amount) <= 0)}
              helperText={
                error && (!amount || Number(amount) <= 0)
                  ? "Ingresa un monto mayor a cero."
                  : ""
              }
              label="Monto"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <TextField
              label="Descripción"
              multiline
              minRows={4}
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          </Box>
        )}
        {tab === "Avanzado" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
              gap: 1.6,
            }}
          >
            <TextField select label="Método de pago" defaultValue="Por definir">
              <MenuItem value="Por definir">Por definir</MenuItem>
              <MenuItem value="Pago en una sola exhibición">
                Pago en una sola exhibición
              </MenuItem>
            </TextField>
            <TextField label="Referencia externa" />
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Enviar factura por email"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Emitir inmediatamente"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E7EAEC" }}>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={save} sx={{ boxShadow: "none" }}>
          Crear borrador
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PreviewDialog({
  preview,
  onClose,
}: {
  preview: PreviewState;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(preview)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
            {preview?.title}
          </Typography>
          {preview?.subtitle && (
            <Typography sx={{ mt: 0.3, color: "#8A8C8E", fontSize: 11.5 }}>
              {preview.subtitle}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="Cerrar vista" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#F5F6F7", py: 3 }}>
        <Box
          sx={{
            width: "min(100%,650px)",
            minHeight: 440,
            mx: "auto",
            p: { xs: 2, sm: 4 },
            backgroundColor: "#FFF",
            boxShadow: "0 5px 24px rgba(0,0,0,.14)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              pb: 2,
              borderBottom: "2px solid #1C84C6",
            }}
          >
            <Box>
              <Typography
                sx={{ color: "#1C84C6", fontSize: 22, fontWeight: 800 }}
              >
                COMECORE
              </Typography>
              <Typography sx={{ color: "#676A6C", fontSize: 10.5 }}>
                Controla · Conecta · Crece
              </Typography>
            </Box>
            <Typography
              sx={{ color: "#4B4E51", fontSize: 16, fontWeight: 700 }}
            >
              {preview?.kind === "audit" ? "ARQUEO DE CAJA" : "COMPROBANTE"}
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            {preview?.lines?.map((line) => (
              <Box
                key={line.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px,.7fr) 1fr",
                  gap: 2,
                  py: 1,
                  borderBottom: "1px solid #ECEEEF",
                }}
              >
                <Typography
                  sx={{ color: "#676A6C", fontSize: 12, fontWeight: 650 }}
                >
                  {line.label}
                </Typography>
                <Typography
                  sx={{
                    color: "#4B4E51",
                    fontSize: 12,
                    textAlign: "right",
                    overflowWrap: "anywhere",
                  }}
                >
                  {line.value}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 5, p: 2, backgroundColor: "#F7F8F9" }}>
            <Typography sx={{ color: "#676A6C", fontSize: 11 }}>
              Documento de demostración. No representa una operación fiscal ni
              financiera real.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<PrintOutlinedIcon />}
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
        <Button variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function FacturacionModule() {
  const pathname = usePathname();
  const [view] = useState<BillingView>(() => {
    const pathSegment = pathname.startsWith("/facturacion/")
      ? pathname.split("/").pop()
      : null;
    if (billingViewItems.some((item) => item.value === pathSegment))
      return pathSegment as BillingView;
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (billingViewItems.some((item) => item.value === hash))
        return hash as BillingView;
    }
    return "borradores";
  });
  const [drafts, setDrafts] = useState(draftInvoices);
  const [issued, setIssued] = useState(issuedInvoices);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    issuedInvoices[0].id,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState("");

  function emitDrafts(ids: number[]) {
    const emitted: InvoiceRecord[] = drafts
      .filter((draft) => ids.includes(draft.id))
      .map((draft) => ({ ...draft, status: "Impaga", issuedAt: "28/09/2026" }));
    setDrafts((current) => current.filter((draft) => !ids.includes(draft.id)));
    setIssued((current) => [...emitted, ...current]);
    setMessage(
      `${ids.length} ${ids.length === 1 ? "borrador emitido" : "borradores emitidos"}.`,
    );
  }

  function deleteDrafts(ids: number[]) {
    setDrafts((current) => current.filter((draft) => !ids.includes(draft.id)));
    setMessage(
      `${ids.length} ${ids.length === 1 ? "borrador eliminado" : "borradores eliminados"}.`,
    );
  }

  function previewInvoice(record: InvoiceRecord) {
    setPreview({
      title: `${record.type} #${record.id}`,
      subtitle: record.client,
      lines: [
        { label: "Cliente", value: record.client },
        { label: "Contrato", value: record.contract },
        { label: "Periodo", value: record.period },
        { label: "Concepto", value: record.concept },
        { label: "Monto", value: currency.format(record.amount) },
        { label: "Balance", value: currency.format(record.balance) },
        { label: "Estado", value: record.status },
      ],
    });
  }
  function previewCredit(record: CreditNoteRecord) {
    setPreview({
      title: `Nota de crédito #${record.id}`,
      subtitle: record.client,
      lines: [
        { label: "Factura relacionada", value: `#${record.invoice}` },
        { label: "Categoría", value: record.category },
        { label: "Descripción", value: record.description },
        { label: "Monto", value: currency.format(record.amount) },
        { label: "Estado", value: record.status },
      ],
    });
  }
  function previewPayment(record: PaymentRecord) {
    setPreview({
      title: `Comprobante de pago #${record.id}`,
      subtitle: record.client,
      lines: [
        { label: "Fecha de pago", value: record.paidAt },
        { label: "Forma de pago", value: record.method },
        { label: "Recolectado por", value: record.collector },
        { label: "Factura", value: `#${record.invoice}` },
        { label: "Monto", value: currency.format(record.amount) },
      ],
    });
  }
  function previewPromise(record: PaymentPromiseRecord) {
    setPreview({
      title: `Promesa de pago #${record.id}`,
      subtitle: record.client,
      lines: [
        { label: "Contrato", value: record.contract },
        { label: "Deuda acumulada", value: currency.format(record.debt) },
        { label: "Válida hasta", value: record.validUntil },
        { label: "Tipo", value: record.type },
        { label: "Creador", value: record.creator },
      ],
    });
  }
  function previewReceipt(record: ReceiptRecord) {
    setPreview({
      title: `Comprobante #${record.id}`,
      subtitle: record.client,
      lines: [
        { label: "Cliente", value: record.client },
        { label: "Estado", value: record.status },
        { label: "Creado el", value: record.createdAt },
      ],
    });
  }
  function previewAudit(record: CashAuditRecord) {
    setPreview({
      title: `Arqueo de caja #${record.id}`,
      subtitle: record.creator,
      kind: "audit",
      lines: [
        { label: "Creado el", value: record.createdAt },
        { label: "Transacciones", value: String(record.transactions) },
        { label: "Efectivo", value: currency.format(record.cash) },
        { label: "Transferencias", value: currency.format(record.transfer) },
        { label: "Tarjetas", value: currency.format(record.card) },
        { label: "Monto total", value: currency.format(record.amount) },
      ],
    });
  }

  const exportRows = useMemo(() => {
    if (view === "borradores") return drafts;
    if (view === "emitidas") return issued;
    if (view === "notas") return creditNotes;
    if (view === "pagos") return payments;
    if (view === "promesas") return paymentPromises;
    if (view === "comprobantes") return paymentReceipts;
    return cashAudits;
  }, [drafts, issued, view]);

  function exportCsv(label = "Exportar listado") {
    const rows = exportRows as unknown as Record<string, unknown>[];
    const headers = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row))),
    );
    const csv = [
      headers,
      ...rows.map((row) => headers.map((key) => String(row[key] ?? ""))),
    ]
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `comecore-${view}-demo.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
    setMessage(`${label}: archivo CSV generado.`);
  }

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1.5, sm: 2.5, xl: 3 },
        py: { xs: 1.75, md: 2.25 },
      }}
    >
      <FacturacionHeader
        view={view}
        onCreate={() => setCreateOpen(true)}
        onExport={(target) => setExportAnchor(target)}
      />
      {view === "borradores" && (
        <InvoicesView
          mode="borradores"
          rows={drafts}
          query={query}
          setQuery={setQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          selectedId={selectedInvoiceId}
          setSelectedId={setSelectedInvoiceId}
          onPreview={previewInvoice}
          onAction={setMessage}
          onEmitDrafts={emitDrafts}
          onDeleteDrafts={deleteDrafts}
        />
      )}
      {view === "emitidas" && (
        <InvoicesView
          mode="emitidas"
          rows={issued}
          query={query}
          setQuery={setQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          selectedId={selectedInvoiceId}
          setSelectedId={setSelectedInvoiceId}
          onPreview={previewInvoice}
          onAction={setMessage}
        />
      )}
      {view === "notas" && (
        <CreditNotesOperationalView
          query={query}
          setQuery={setQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onPreview={previewCredit}
        />
      )}
      {view === "pagos" && (
        <PaymentsOperationalView
          query={query}
          setQuery={setQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onPreview={previewPayment}
          onAction={setMessage}
        />
      )}
      {view === "promesas" && (
        <PaymentPromisesOperationalView
          query={query}
          setQuery={setQuery}
          onPreview={previewPromise}
          onAction={setMessage}
        />
      )}
      {view === "comprobantes" && (
        <PaymentReceiptsView
          query={query}
          setQuery={setQuery}
          onPreview={previewReceipt}
        />
      )}
      {view === "arqueos" && (
        <CashAuditsOperationalView
          query={query}
          setQuery={setQuery}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onPreview={previewAudit}
          onDownload={() => exportCsv("Descarga de arqueo")}
        />
      )}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem onClick={() => exportCsv()}>Exportar listado CSV</MenuItem>
        {view === "borradores" && (
          <MenuItem onClick={() => exportCsv("Exportar items")}>
            Exportar Items
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setExportAnchor(null);
            setMessage("Vista de impresión preparada.");
            window.print();
          }}
        >
          Preparar vista de impresión
        </MenuItem>
      </Menu>
      <CreateInvoiceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(invoice) => {
          setDrafts((current) => [invoice, ...current]);
          setMessage("Borrador de factura creado en la demostración.");
        }}
      />
      <PreviewDialog preview={preview} onClose={() => setPreview(null)} />
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3400}
        onClose={() => setMessage("")}
        message={message}
      />
    </Box>
  );
}
