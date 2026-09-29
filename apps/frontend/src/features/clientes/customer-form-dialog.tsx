"use client";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState, type FormEvent, type ReactNode } from "react";
import { GoogleMap } from "@/components/maps/google-map";
import type { Customer, CustomerKind } from "./customer-types";

type CustomerFormDialogProps = { customer?: Customer | null; onClose: () => void; onSave: (customer: Customer) => void };
type FormTab = "basico" | "facturacion" | "pasarela";

const inputSx = {
  minWidth: 0,
  "& .MuiInputBase-root": { minWidth: 0, backgroundColor: "#FFFFFF" },
  "& .MuiInputBase-input": { minWidth: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" },
  "& .MuiInputBase-inputMultiline": { overflow: "auto", overflowWrap: "anywhere", textOverflow: "clip" },
  "& .MuiFormHelperText-root": { mx: 0, overflowWrap: "anywhere" },
} as const;

const gridTwo = { display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.45, "& > *": { minWidth: 0 } } as const;

function Frame({ children }: { children: ReactNode }) {
  return <Box component="section" sx={{ minWidth: 0, p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", backgroundColor: "#FFFFFF" }}>{children}</Box>;
}

function blankCustomer(sequence: number): Customer {
  const id = `CUS-${String(sequence).padStart(5, "0")}`;
  const customId = `CC-${String(sequence).padStart(4, "0")}`;
  return {
    id, customId, kind: "Otro", name: "", document: "", createdAt: new Date().toISOString().slice(0, 10),
    address: { street: "", number: "", neighborhood: "", city: "", state: "", postalCode: "", latitude: 19.2826, longitude: -99.6557, additionalData: "" },
    contact: { email: "", mobile: "+52 ", landline: "" },
    billing: { enabled: false, taxId: "", legalName: "", legalEntity: "ComeCore Telecom", regime: "", invoiceType: "Comprobante", billingDay: 1, paymentMethod: "Por definir", paymentForm: "99 - Por definir", cfdiUse: "G03 - Gastos en general", emailInvoice: false, emailPayment: false, informAfterPayment: false, automaticStatus: false, additionalInfo: "", additionalInfo2: "", notificationEmails: "" },
    assignment: { zone: "Sin asignar", seller: "Sin asignar", collector: "Caja central" },
    account: { status: "Al corriente", balance: 0, credit: 0, unpaidInvoices: 0, transactions: [] },
    communication: { email: true, sms: false, whatsapp: true }, portalAccess: true,
    portalLink: `https://clientes.comecore.local/acceso/${customId}`, paymentGateway: "Sin pasarela", devices: 0, deviceRecords: [], gatewayAccounts: [], notes: "", contracts: [],
    audit: [{ id: `AUD-${id}-1`, action: "Cliente creado", actor: "Administración", date: new Date().toLocaleString("es-MX") }],
  };
}

function splitName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", secondName: parts.length > 3 ? parts[1] : "", firstLastName: parts.length > 1 ? parts[parts.length - 2] : "", secondLastName: parts.length > 2 ? parts[parts.length - 1] : "" };
}

export function CustomerFormDialog({ customer, onClose, onSave }: CustomerFormDialogProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState<FormTab>("basico");
  const [draft, setDraft] = useState<Customer>(() => customer ?? blankCustomer(Date.now() % 100000));
  const initialName = splitName(customer?.name ?? "");
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [secondName, setSecondName] = useState(initialName.secondName);
  const [firstLastName, setFirstLastName] = useState(initialName.firstLastName);
  const [secondLastName, setSecondLastName] = useState(initialName.secondLastName);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const editing = Boolean(customer);
  const composedName = [firstName, secondName, firstLastName, secondLastName].filter((part) => part.trim()).join(" ");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (composedName.trim().length < 3) errors.name = "Ingresa el nombre o razón social del cliente.";
    if (draft.document.trim().length < 3) errors.document = "Ingresa el documento o cédula.";
    if (draft.contact.mobile.trim().length < 6) errors.mobile = "Ingresa un teléfono móvil válido.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTab("basico");
      window.setTimeout(() => document.getElementById(errors.name ? "customer-field-first-name" : errors.document ? "customer-field-document" : "customer-field-mobile")?.focus(), 0);
      return;
    }
    onSave({ ...draft, name: composedName.trim(), document: draft.document.trim(), contact: { ...draft.contact, email: draft.contact.email.trim(), mobile: draft.contact.mobile.trim() } });
  }

  const latLngAdornment = <InputAdornment position="end"><RefreshRoundedIcon sx={{ color: "primary.main", fontSize: 18 }} /></InputAdornment>;

  return (
    <Dialog open onClose={onClose} fullScreen={mobile} maxWidth={false} slotProps={{ paper: { sx: { width: mobile ? "100%" : "min(1780px, calc(100vw - 40px))", maxWidth: "none", maxHeight: mobile ? "100dvh" : "calc(100dvh - 32px)", borderRadius: 0 } }, backdrop: { sx: { backgroundColor: "rgba(20,31,43,.62)" } } }}>
      <Box component="form" noValidate onSubmit={submit} sx={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column" }}>
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography component="h2" sx={{ fontSize: "1.05rem", fontWeight: 760 }}>{editing ? "Editar cliente" : "Nuevo cliente"}</Typography>
          <IconButton aria-label="Cerrar formulario" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </DialogTitle>

        <Tabs value={tab} onChange={(_, value: FormTab) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: { xs: 0.5, sm: 2 }, minHeight: 58, borderBottom: "1px solid", borderColor: "divider", "& .MuiTab-root": { minHeight: 58, px: { xs: 1.5, sm: 2.5 }, fontSize: "0.76rem", fontWeight: 700 } }}>
          <Tab value="basico" label="Básico" icon={<PersonOutlineRoundedIcon />} iconPosition="start" />
          <Tab value="facturacion" label="Facturación" icon={<AccountBalanceOutlinedIcon />} iconPosition="start" />
          <Tab value="pasarela" label="Pasarela de pago" icon={<CreditCardOutlinedIcon />} iconPosition="start" />
        </Tabs>

        <DialogContent sx={{ flex: 1, p: { xs: 1.25, sm: 2.5 }, backgroundColor: "#FBFCFE" }}>
          {tab === "basico" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.4fr) minmax(390px, 1fr)" }, gap: 2, alignItems: "start" }}>
              <Frame>
                <Box sx={gridTwo}>
                  <TextField select label="Tipo de persona" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as CustomerKind })} sx={inputSx}><MenuItem value="Persona física">Persona física</MenuItem><MenuItem value="Persona jurídica">Persona jurídica</MenuItem><MenuItem value="Otro">Otro</MenuItem></TextField>
                  <TextField label="Nombre" value={composedName} disabled sx={inputSx} />
                  <TextField id="customer-field-first-name" required label="Primer nombre" value={firstName} error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} onChange={(e) => { setFirstName(e.target.value); setFieldErrors((current) => ({ ...current, name: "" })); }} sx={inputSx} />
                  <TextField label="Segundo nombre" value={secondName} onChange={(e) => setSecondName(e.target.value)} sx={inputSx} />
                  <TextField required label="Primer apellido" value={firstLastName} onChange={(e) => setFirstLastName(e.target.value)} sx={inputSx} />
                  <TextField label="Segundo apellido" value={secondLastName} onChange={(e) => setSecondLastName(e.target.value)} sx={inputSx} />
                  <TextField id="customer-field-document" required label="Documento o Cédula de identidad" value={draft.document} error={Boolean(fieldErrors.document)} helperText={fieldErrors.document} onChange={(e) => { setDraft({ ...draft, document: e.target.value }); setFieldErrors((current) => ({ ...current, document: "" })); }} sx={inputSx} />
                  <TextField label="ID Cliente personalizable" value={draft.customId} onChange={(e) => setDraft({ ...draft, customId: e.target.value })} sx={inputSx} />
                  <TextField label="Teléfono" value={draft.contact.landline} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, landline: e.target.value } })} sx={inputSx} />
                  <TextField id="customer-field-mobile" required label="Teléfono móvil" value={draft.contact.mobile} error={Boolean(fieldErrors.mobile)} helperText={fieldErrors.mobile || "Formato internacional: +[país][área][número]"} onChange={(e) => { setDraft({ ...draft, contact: { ...draft.contact, mobile: e.target.value } }); setFieldErrors((current) => ({ ...current, mobile: "" })); }} sx={inputSx} />
                  <TextField type="email" label="E-mail de contacto" value={draft.contact.email} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }} />
                  <TextField multiline minRows={4} label="Observaciones" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }} />
                  <TextField select label="Vendedor" value={draft.assignment.seller} onChange={(e) => setDraft({ ...draft, assignment: { ...draft.assignment, seller: e.target.value } })} sx={inputSx}><MenuItem value="Sin asignar">Sin asignar</MenuItem><MenuItem value="Laura Méndez">Laura Méndez</MenuItem><MenuItem value="Diego Reyes">Diego Reyes</MenuItem><MenuItem value="Sergio Valle">Sergio Valle</MenuItem><MenuItem value="Ventas">Ventas</MenuItem><MenuItem value="Administración">Administración</MenuItem></TextField>
                  <TextField select label="Recaudador" value={draft.assignment.collector} onChange={(e) => setDraft({ ...draft, assignment: { ...draft.assignment, collector: e.target.value } })} sx={inputSx}><MenuItem value="Caja central">Caja central</MenuItem><MenuItem value="María López">María López</MenuItem><MenuItem value="Recaudación norte">Recaudación norte</MenuItem><MenuItem value="Sin asignar">Sin asignar</MenuItem></TextField>
                </Box>
              </Frame>

              <Frame>
                <Typography component="h3" sx={{ mb: 1.25, fontSize: "0.86rem", fontWeight: 750 }}>Autocompletar punto GPS con el mapa</Typography>
                <TextField fullWidth label="Ingresar dirección" placeholder="Haz clic en el mapa o escribe una dirección" sx={inputSx} />
                <Box sx={{ ...gridTwo, mt: 1.45 }}>
                  <TextField label="Latitud" type="number" value={draft.address.latitude} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, latitude: Number(e.target.value) } })} slotProps={{ input: { endAdornment: latLngAdornment } }} sx={inputSx} />
                  <TextField label="Longitud" type="number" value={draft.address.longitude} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, longitude: Number(e.target.value) } })} slotProps={{ input: { endAdornment: latLngAdornment } }} sx={inputSx} />
                </Box>
                <Box sx={{ my: 1.5, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                  <GoogleMap
                    ariaLabel="Seleccionar ubicación del cliente"
                    center={{ lat: draft.address.latitude, lng: draft.address.longitude }}
                    markers={[{
                      id: draft.id,
                      label: "C",
                      title: composedName || "Nuevo cliente",
                      position: { lat: draft.address.latitude, lng: draft.address.longitude },
                    }]}
                    selectedMarkerId={draft.id}
                    zoom={15}
                    minHeight={280}
                    onMapClick={(position) => setDraft((current) => ({
                      ...current,
                      address: { ...current.address, latitude: position.lat, longitude: position.lng },
                    }))}
                  />
                </Box>
                <Box sx={gridTwo}>
                  <TextField label="Calle" value={draft.address.street} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, street: e.target.value } })} sx={inputSx} />
                  <TextField label="Número" value={draft.address.number ?? ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, number: e.target.value } })} sx={inputSx} />
                  <TextField label="Barrio / Colonia" value={draft.address.neighborhood} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, neighborhood: e.target.value } })} sx={inputSx} />
                  <TextField label="Zona" value={draft.assignment.zone} onChange={(e) => setDraft({ ...draft, assignment: { ...draft.assignment, zone: e.target.value } })} sx={inputSx} />
                  <TextField label="Estado" value={draft.address.state} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, state: e.target.value } })} sx={inputSx} />
                  <TextField label="Ciudad" value={draft.address.city} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })} sx={inputSx} />
                  <TextField multiline minRows={2} label="Dato adicional" value={draft.address.additionalData ?? ""} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, additionalData: e.target.value } })} sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }} />
                </Box>
              </Frame>
            </Box>
          )}

          {tab === "facturacion" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2, alignItems: "start" }}>
              <Frame>
                <Box sx={{ ...gridTwo, mb: 2 }}>
                  <FormControlLabel control={<Switch checked={draft.billing.enabled} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, enabled: e.target.checked } })} />} label="Facturación" />
                  <FormControlLabel control={<Switch checked={draft.billing.informAfterPayment ?? false} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, informAfterPayment: e.target.checked } })} />} label="Informar después de pagar" />
                  <FormControlLabel control={<Switch checked={draft.billing.automaticStatus ?? false} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, automaticStatus: e.target.checked } })} />} label="Estado automático" />
                </Box>
                <Box sx={gridTwo}>
                  <TextField label="Razón social" value={draft.billing.legalEntity} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, legalEntity: e.target.value } })} sx={inputSx} />
                  <TextField label="Tipo de factura" value={draft.billing.invoiceType ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, invoiceType: e.target.value } })} sx={inputSx} />
                  <TextField label="Tipo de persona" value={draft.kind} disabled sx={inputSx} />
                  <TextField label="Régimen" value={draft.billing.regime ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, regime: e.target.value } })} sx={inputSx} />
                  <TextField label="Nombre / Razón social" value={draft.billing.legalName} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, legalName: e.target.value } })} sx={inputSx} />
                  <TextField type="number" label="Ciclo de facturación comienza el día" value={draft.billing.billingDay ?? 1} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, billingDay: Number(e.target.value) } })} sx={inputSx} />
                  <TextField label="Código postal" value={draft.address.postalCode} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, postalCode: e.target.value } })} sx={inputSx} />
                  <TextField label="RFC" value={draft.billing.taxId} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, taxId: e.target.value } })} sx={inputSx} />
                </Box>
              </Frame>
              <Frame>
                <Box sx={gridTwo}>
                  <TextField label="Método de pago" value={draft.billing.paymentMethod ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, paymentMethod: e.target.value } })} sx={inputSx} />
                  <TextField label="Forma de pago" value={draft.billing.paymentForm ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, paymentForm: e.target.value } })} sx={inputSx} />
                  <TextField label="Información adicional" value={draft.billing.additionalInfo ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, additionalInfo: e.target.value } })} sx={inputSx} />
                  <TextField label="Información adicional 2" value={draft.billing.additionalInfo2 ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, additionalInfo2: e.target.value } })} sx={inputSx} />
                  <TextField label="Uso de CFDI" value={draft.billing.cfdiUse ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, cfdiUse: e.target.value } })} sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }} />
                  <FormControlLabel control={<Switch checked={draft.billing.emailInvoice ?? false} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, emailInvoice: e.target.checked } })} />} label="Enviar correo con factura emitida" />
                  <FormControlLabel control={<Switch checked={draft.billing.emailPayment ?? false} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, emailPayment: e.target.checked } })} />} label="Enviar correo cuando se crea un pago" />
                  <TextField multiline minRows={3} label="Emails a notificar" helperText="Correos separados por coma, sin espacios." value={draft.billing.notificationEmails ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing, notificationEmails: e.target.value } })} sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }} />
                </Box>
              </Frame>
            </Box>
          )}

          {tab === "pasarela" && (
            <Box sx={{ maxWidth: 900, mx: "auto" }}><Frame>
              <Typography component="h3" sx={{ fontSize: "0.96rem", fontWeight: 750 }}>Pasarela de pago del cliente</Typography>
              <Typography sx={{ mt: 0.45, mb: 2, color: "text.secondary", fontSize: "0.75rem" }}>Vincula una cuenta de cobro. Las credenciales se administran desde Configuración.</Typography>
              <TextField select fullWidth label="Pasarela asignada" value={draft.paymentGateway} onChange={(e) => setDraft({ ...draft, paymentGateway: e.target.value })} sx={inputSx}><MenuItem value="Sin pasarela">Sin pasarela</MenuItem><MenuItem value="Mercado Pago">Mercado Pago</MenuItem><MenuItem value="Conekta">Conekta</MenuItem><MenuItem value="Stripe">Stripe</MenuItem></TextField>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, p: 1.5, color: "text.secondary", backgroundColor: "#F6F8FA" }}><LocationOnOutlinedIcon sx={{ fontSize: 19 }} /><Typography sx={{ fontSize: "0.72rem" }}>La pasarela quedará disponible en la ficha y el portal del cliente.</Typography></Box>
            </Frame></Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" sx={{ boxShadow: "none" }}>{editing ? "Actualizar" : "Crear"}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
