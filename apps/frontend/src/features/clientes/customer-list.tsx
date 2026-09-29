"use client";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import ButtonGroup from "@mui/material/ButtonGroup";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Customer, CustomerQuickAction } from "./customer-types";

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  firstResult: number;
  lastResult: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelect: (customer: Customer) => void;
  onAction: (customer: Customer, action: CustomerQuickAction) => void;
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function accountChip(customer: Customer) {
  if (customer.account.status === "Con deuda") {
    return { color: "#9D3434", background: "#FFF0F0", border: "#F5D2D2" };
  }

  if (customer.account.status === "Saldo a favor") {
    return { color: "#14705E", background: "#EAF8F4", border: "#CDEDE4" };
  }

  return { color: "#4D6277", background: "#F1F5F8", border: "#DFE7EF" };
}

function addressLine(customer: Customer) {
  return `${customer.address.street}${customer.address.number ? ` ${customer.address.number}` : ""}, ${customer.address.neighborhood}`;
}

function visiblePages(page: number, pageCount: number) {
  if (pageCount <= 3) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (page <= 2) return [1, 2, 3];
  if (page >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];
  return [page - 1, page, page + 1];
}

function PaginationControls({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  return (
    <ButtonGroup size="small" variant="outlined" aria-label="Paginación de clientes" sx={{ flexWrap: "nowrap", "& .MuiButton-root": { minWidth: 36, px: 1.1, borderRadius: "0 !important", fontSize: "0.7rem" } }}>
      {page > 1 && <Button onClick={() => onPageChange(page - 1)}>Anterior</Button>}
      {visiblePages(page, pageCount).map((item) => <Button key={item} variant={item === page ? "contained" : "outlined"} aria-current={item === page ? "page" : undefined} onClick={() => onPageChange(item)} sx={{ boxShadow: "none" }}>{item}</Button>)}
      <Button disabled={page >= pageCount} onClick={() => onPageChange(Math.min(pageCount, page + 1))}>Siguiente</Button>
    </ButtonGroup>
  );
}

export function CustomerList({
  customers,
  selectedCustomerId,
  page,
  pageCount,
  pageSize,
  total,
  firstResult,
  lastResult,
  onPageChange,
  onPageSizeChange,
  onSelect,
  onAction,
}: CustomerListProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuCustomer, setMenuCustomer] = useState<Customer | null>(null);

  function openMenu(event: React.MouseEvent<HTMLElement>, customer: Customer) {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuCustomer(customer);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuCustomer(null);
  }

  function runMenuAction(action: CustomerQuickAction) {
    if (menuCustomer) onAction(menuCustomer, action);
    closeMenu();
  }

  return (
    <Box
      component="section"
      aria-labelledby="listado-clientes-titulo"
      sx={{
        minWidth: 0,
        overflow: "hidden",
        backgroundColor: "background.paper",
        boxShadow: "3px 3px 8px rgba(0,0,0,.18)",
      }}
    >
      <Box sx={{ display: "flex", minHeight: 72, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 1.5, px: { xs: 1.5, sm: 2 }, py: 1.25, borderBottom: "1px solid", borderColor: "divider", flexWrap: "wrap" }}>
        <Box sx={{ minWidth: 0 }}>
          <PaginationControls page={page} pageCount={pageCount} onPageChange={onPageChange} />
          <Typography id="listado-clientes-titulo" component="h2" sx={{ mt: 0.8, color: "text.secondary", fontSize: "0.74rem", fontWeight: 500 }}>
            {total > 0 ? `Mostrando Clientes ${firstResult} - ${lastResult} de ${total} en total` : "Sin clientes para mostrar"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, ml: "auto" }}>
          <Typography sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary", fontSize: "0.74rem" }}>Paginar de a</Typography>
          <ButtonGroup size="small" variant="outlined" aria-label="Clientes por página" sx={{ "& .MuiButton-root": { minWidth: 40, borderRadius: "0 !important", fontSize: "0.7rem" } }}>
            {[20, 50, 100, 500].map((size) => <Button key={size} variant={pageSize === size ? "contained" : "outlined"} onClick={() => onPageSizeChange(size)} sx={{ boxShadow: "none" }}>{size}</Button>)}
          </ButtonGroup>
        </Box>
      </Box>

      <TableContainer sx={{ display: { xs: "none", xl: "block" }, maxHeight: "calc(100dvh - 320px)" }}>
        <Table stickyHeader aria-label="Listado de clientes" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "35%" }}>Cliente</TableCell>
              <TableCell sx={{ width: "22%" }}>Contacto</TableCell>
              <TableCell sx={{ width: "25%" }}>Facturación</TableCell>
              <TableCell align="right" sx={{ width: 184 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const selected = selectedCustomerId === customer.id;
              const accountStyle = accountChip(customer);

              return (
                <TableRow
                  key={customer.id}
                  hover
                  selected={selected}
                  sx={{
                    "&.Mui-selected": { backgroundColor: "#B7DFEE" },
                    "&.Mui-selected:hover": { backgroundColor: "#ACD9EA" },
                    "&.Mui-selected td:first-of-type": {
                      boxShadow: "inset 3px 0 0 #1C84C6",
                    },
                  }}
                >
                  <TableCell>
                    <ButtonBase
                      onClick={() => onSelect(customer)}
                      aria-label={`Seleccionar ${customer.name}`}
                      aria-pressed={selected}
                      sx={{ display: "flex", width: "100%", minWidth: 0, alignItems: "flex-start", justifyContent: "flex-start", gap: 1.25, color: "inherit", textAlign: "left", "&:focus-visible": { outline: "3px solid rgba(28,132,198,.3)", outlineOffset: 2 } }}
                    >
                      <Box
                        aria-hidden="true"
                        sx={{
                          display: "grid",
                          width: 36,
                          height: 36,
                          flex: "0 0 36px",
                          placeItems: "center",
                          color: selected ? "primary.main" : "text.secondary",
                          backgroundColor: selected ? "#DFEEFB" : "#F1F5F8",
                          borderRadius: "2px",
                          fontSize: "0.72rem",
                          fontWeight: 750,
                        }}
                      >
                        {customer.name.split(" ").slice(0, 2).map((word) => word[0]).join("")}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ overflow: "hidden", fontSize: "0.84rem", fontWeight: 700, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {customer.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.45, color: "text.secondary" }}>
                          <LocationOnOutlinedIcon sx={{ flex: "0 0 auto", fontSize: 15 }} />
                          <Typography sx={{ overflow: "hidden", fontSize: "0.72rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {addressLine(customer)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.35, color: "text.disabled" }}>
                          <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
                          <Typography sx={{ fontSize: "0.68rem" }}>{formatDate(customer.createdAt)} · {customer.customId}</Typography>
                        </Box>
                      </Box>
                    </ButtonBase>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                      <PhoneIphoneRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "0.73rem" }}>{customer.contact.mobile}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", minWidth: 0, alignItems: "center", gap: 0.75, mt: 0.65, color: "text.secondary" }}>
                      <EmailOutlinedIcon sx={{ flex: "0 0 auto", fontSize: 16 }} />
                      <Typography sx={{ overflow: "hidden", fontSize: "0.73rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {customer.contact.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <ReceiptLongOutlinedIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                      <Typography sx={{ overflow: "hidden", fontSize: "0.73rem", fontWeight: 650, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {customer.billing.taxId}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.7 }}>
                      <Chip
                        label={customer.account.status}
                        size="small"
                        sx={{
                          height: 23,
                          color: accountStyle.color,
                          backgroundColor: accountStyle.background,
                          border: "1px solid",
                          borderColor: accountStyle.border,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      />
                      <Typography sx={{ color: "text.secondary", fontSize: "0.69rem" }}>
                        {customer.billing.enabled ? "Facturación activa" : "Sin facturación"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                      <Tooltip title="Cuenta corriente">
                        <IconButton
                          aria-label={`Abrir cuenta corriente de ${customer.name}`}
                          onClick={(event) => { event.stopPropagation(); onAction(customer, "account"); }}
                          sx={{
                            width: 34,
                            height: 34,
                            color: customer.account.status === "Con deuda" ? "#A33C3C" : "text.secondary",
                            borderRadius: "2px",
                            "&:hover": { color: "primary.main", backgroundColor: "#EEF6FD" },
                          }}
                        >
                          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalle">
                        <IconButton
                          aria-label={`Ver detalle de ${customer.name}`}
                          onClick={(event) => { event.stopPropagation(); onAction(customer, "detail"); }}
                          sx={{ width: 34, height: 34, borderRadius: "2px", color: "primary.main", "&:hover": { backgroundColor: "#EEF6FD" } }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar cliente">
                        <IconButton
                          aria-label={`Editar ${customer.name}`}
                          onClick={(event) => { event.stopPropagation(); onAction(customer, "edit"); }}
                          sx={{ width: 34, height: 34, borderRadius: "2px", color: "primary.main", "&:hover": { backgroundColor: "#EEF6FD" } }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cambiar contraseña">
                        <IconButton
                          aria-label={`Cambiar contraseña de ${customer.name}`}
                          onClick={(event) => { event.stopPropagation(); onAction(customer, "password"); }}
                          sx={{ width: 34, height: 34, borderRadius: "2px", color: "primary.main", "&:hover": { backgroundColor: "#EEF6FD" } }}
                        >
                          <KeyOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: { xs: "block", xl: "none" }, maxHeight: "calc(100dvh - 320px)", overflowY: "auto" }}>
        {customers.map((customer) => {
          const selected = selectedCustomerId === customer.id;
          const accountStyle = accountChip(customer);
          return (
            <Box
              key={customer.id}
              component="article"
              sx={{
                position: "relative",
                display: { xs: "block", md: "grid" },
                gridTemplateColumns: { md: "minmax(210px, 1.25fr) minmax(155px, 0.8fr) minmax(145px, 0.7fr) auto" },
                alignItems: { md: "center" },
                gap: { md: 1.5 },
                px: 1.5,
                py: { xs: 1.75, md: 1.4 },
                backgroundColor: selected ? "#F0F7FD" : "transparent",
                borderBottom: "1px solid",
                borderColor: "divider",
                "&::before": selected ? { content: '""', position: "absolute", inset: "12px auto 12px 0", width: 2, backgroundColor: "primary.main", borderRadius: "0 2px 2px 0" } : undefined,
              }}
            >
              <Box sx={{ display: "flex", minWidth: 0, alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box component={ButtonBase} onClick={() => onSelect(customer)} aria-label={`Seleccionar ${customer.name}`} aria-pressed={selected} sx={{ display: "block", minWidth: 0, color: "inherit", textAlign: "left", "&:focus-visible": { outline: "3px solid rgba(28,132,198,.3)", outlineOffset: 2 } }}>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>{customer.name}</Typography>
                  <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.71rem" }}>{customer.customId} · {customer.kind}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.75, color: "text.secondary" }}>
                    <LocationOnOutlinedIcon sx={{ flex: "0 0 auto", fontSize: 15 }} />
                    <Typography sx={{ overflow: "hidden", fontSize: "0.72rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{addressLine(customer)}</Typography>
                  </Box>
                </Box>
                <Chip label={customer.account.status} size="small" sx={{ display: { xs: "inline-flex", md: "none" }, height: 23, color: accountStyle.color, backgroundColor: accountStyle.background, border: "1px solid", borderColor: accountStyle.border, fontSize: "0.63rem", fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: "grid", gap: 0.6, mt: { xs: 1.15, md: 0 }, color: "text.secondary" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <PhoneIphoneRoundedIcon sx={{ flex: "0 0 auto", fontSize: 15 }} />
                  <Typography sx={{ fontSize: "0.72rem" }}>{customer.contact.mobile}</Typography>
                </Box>
                <Box sx={{ display: "flex", minWidth: 0, alignItems: "center", gap: 0.6 }}>
                  <EmailOutlinedIcon sx={{ flex: "0 0 auto", fontSize: 15 }} />
                  <Typography sx={{ overflow: "hidden", fontSize: "0.7rem", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.contact.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gap: 0.6, mt: { xs: 1.15, md: 0 } }}>
                <Typography sx={{ overflow: "hidden", fontSize: "0.72rem", fontWeight: 650, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.billing.taxId}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Chip label={customer.account.status} size="small" sx={{ display: { xs: "none", md: "inline-flex" }, height: 23, color: accountStyle.color, backgroundColor: accountStyle.background, border: "1px solid", borderColor: accountStyle.border, fontSize: "0.63rem", fontWeight: 700 }} />
                  <Typography sx={{ display: { xs: "none", lg: "block" }, color: "text.secondary", fontSize: "0.65rem" }}>{customer.billing.enabled ? "Activa" : "Inactiva"}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-end", md: "center" }, gap: 0.25, mt: { xs: 1.1, md: 0 } }}>
                  <IconButton aria-label={`Cuenta corriente de ${customer.name}`} onClick={(event) => { event.stopPropagation(); onAction(customer, "account"); }} sx={{ width: { xs: 44, md: 36 }, height: { xs: 44, md: 36 }, borderRadius: "2px" }}><AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label={`Ver detalle de ${customer.name}`} onClick={(event) => { event.stopPropagation(); onAction(customer, "detail"); }} sx={{ width: { xs: 44, md: 36 }, height: { xs: 44, md: 36 }, borderRadius: "2px" }}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label={`Editar ${customer.name}`} onClick={(event) => { event.stopPropagation(); onAction(customer, "edit"); }} sx={{ display: { xs: "none", md: "inline-flex" }, width: 36, height: 36, borderRadius: "2px", color: "primary.main" }}><EditOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label={`Cambiar contraseña de ${customer.name}`} onClick={(event) => { event.stopPropagation(); onAction(customer, "password"); }} sx={{ display: { xs: "none", md: "inline-flex" }, width: 36, height: 36, borderRadius: "2px", color: "primary.main" }}><KeyOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label={`Más acciones para ${customer.name}`} onClick={(event) => openMenu(event, customer)} sx={{ display: { xs: "inline-flex", md: "none" }, width: 44, height: 44, borderRadius: "2px" }}><MoreHorizRoundedIcon sx={{ fontSize: 19 }} /></IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", minHeight: 58, alignItems: "center", justifyContent: "space-between", gap: 1.5, px: 1.5, py: 1, borderTop: customers.length > 0 ? "1px solid" : 0, borderColor: "divider", flexWrap: "wrap" }}>
        <Typography sx={{ color: "text.secondary", fontSize: "0.7rem" }}>{total > 0 ? `Mostrando ${firstResult}–${lastResult} de ${total}` : "Sin registros"}</Typography>
        <PaginationControls page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 205, mt: 0.75, border: "1px solid", borderColor: "divider", boxShadow: "0 12px 28px rgba(7, 26, 58, 0.12)" } } }}
      >
        <MenuItem onClick={() => runMenuAction("edit")} sx={{ gap: 1.25, fontSize: "0.82rem" }}>
          <EditOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} /> Editar cliente
        </MenuItem>
        <MenuItem onClick={() => runMenuAction("password")} sx={{ gap: 1.25, fontSize: "0.82rem" }}>
          <KeyOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} /> Cambiar contraseña
        </MenuItem>
      </Menu>
    </Box>
  );
}
