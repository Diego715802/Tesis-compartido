"use client";

import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
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
  onSave: () => void;
};

export function PasswordDialog({ customer, onClose, onSave }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const mismatch = confirmation.length > 0 && password !== confirmation;
  const valid = password.length >= 8 && password === confirmation;
  const passwordError = attempted && password.length < 8;
  const confirmationError = attempted && (confirmation.length === 0 || password !== confirmation);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) {
      setAttempted(true);
      const targetId = password.length < 8 ? "password-field-new" : "password-field-confirmation";
      window.setTimeout(() => document.getElementById(targetId)?.focus(), 0);
      return;
    }
    onSave();
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 0.75 }}>Cambiar contraseña</DialogTitle>
        <DialogContent>
        <Typography sx={{ mb: 2.25, color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.55 }}>
          Define una nueva contraseña para el acceso al portal de {customer.name}.
        </Typography>
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <TextField
            id="password-field-new"
            autoFocus
            required
            type={visible ? "text" : "password"}
            label="Nueva contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={passwordError}
            helperText={passwordError ? "La contraseña debe tener al menos 8 caracteres." : "Mínimo 8 caracteres"}
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible((value) => !value)} edge="end">{visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }}
          />
          <TextField
            id="password-field-confirmation"
            required
            type={visible ? "text" : "password"}
            label="Confirmar contraseña"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            error={confirmationError || mismatch}
            helperText={confirmationError ? (confirmation.length === 0 ? "Confirma la nueva contraseña." : "Las contraseñas no coinciden") : mismatch ? "Las contraseñas no coinciden" : " "}
          />
        </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" sx={{ boxShadow: "none" }}>Actualizar contraseña</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
