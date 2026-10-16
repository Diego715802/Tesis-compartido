"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Customer } from "./customer-types";

type EditCustomerDialogProps = {
  customer: Customer;
  onClose: () => void;
  onSave: (customer: Customer) => void;
};

export function EditCustomerDialog({ customer, onClose, onSave }: EditCustomerDialogProps) {
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.contact.email);
  const [mobile, setMobile] = useState(customer.contact.mobile);
  const [street, setStreet] = useState(customer.address.street);
  const [neighborhood, setNeighborhood] = useState(customer.address.neighborhood);
  const [billingEnabled, setBillingEnabled] = useState(customer.billing.enabled);

  const valid = name.trim().length > 2 && email.includes("@") && mobile.trim().length >= 8 && street.trim().length > 2;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    onSave({
      ...customer,
      name: name.trim(),
      contact: { ...customer.contact, email: email.trim(), mobile: mobile.trim() },
      address: { ...customer.address, street: street.trim(), neighborhood: neighborhood.trim() },
      billing: { ...customer.billing, enabled: billingEnabled },
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 0.75 }}>Editar cliente</DialogTitle>
        <DialogContent>
        <Typography sx={{ mb: 2.25, color: "text.secondary", fontSize: "0.78rem" }}>
          Actualiza los datos principales de {customer.customId}. Los cambios se reflejan en esta sesión.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
          <TextField required label="Nombre o razón social" value={name} onChange={(event) => setName(event.target.value)} sx={{ gridColumn: { sm: "1 / -1" } }} />
          <TextField required type="email" label="Correo de contacto" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField required label="Teléfono celular" value={mobile} onChange={(event) => setMobile(event.target.value)} />
          <TextField required label="Dirección" value={street} onChange={(event) => setStreet(event.target.value)} />
          <TextField label="Colonia" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
          <FormControlLabel
            control={<Switch checked={billingEnabled} onChange={(event) => setBillingEnabled(event.target.checked)} />}
            label="Facturación habilitada"
            sx={{ gridColumn: { sm: "1 / -1" }, mx: 0, "& .MuiFormControlLabel-label": { fontSize: "0.82rem" } }}
          />
        </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!valid} sx={{ boxShadow: "none" }}>Guardar cambios</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

type PasswordDialogProps = {
  customer: Customer;
  onClose: () => void;
};

export function PasswordDialog({ customer, onClose }: PasswordDialogProps) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="portal-password-title">
      <DialogTitle id="portal-password-title">Acceso al portal del cliente</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.6 }}>
          El acceso al portal de {customer.name} todavía no está conectado a un servicio de autenticación.
          El cambio de contraseña estará disponible cuando se integre ese portal.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onClose} variant="contained" autoFocus sx={{ boxShadow: "none" }}>Entendido</Button></DialogActions>
    </Dialog>
  );
}
