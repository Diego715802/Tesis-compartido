"use client";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState, type FormEvent } from "react";
import type { Customer, CustomerContract } from "../clientes/customer-types";
import { ContractAdvancedForm } from "./contract-form-advanced";
import { ContractBasicForm } from "./contract-form-basic";
import { ContractBillingForm } from "./contract-form-billing";
import { blankContract, cleanContract, contractFormOptions, errorTab, validateContract, type ContractFormErrors, type ContractFormTab } from "./contract-form-data";

export type ContractFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (customerId: string, contract: CustomerContract) => void | boolean | Promise<void | boolean>;
  customers: Customer[];
  initialCustomerId?: string;
  editing?: { customerId: string; contract: CustomerContract } | null;
  saveError?: string;
};

export function ContractFormDialog(props: ContractFormDialogProps) {
  if (!props.open) return null;
  return <ContractFormSession key={props.editing ? `${props.editing.customerId}:${props.editing.contract.id}` : `new:${props.initialCustomerId ?? ""}`} {...props} />;
}

function ContractFormSession({ onClose, onSave, customers, initialCustomerId, editing, saveError }: ContractFormDialogProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState<ContractFormTab>("basic");
  const [customerId, setCustomerId] = useState(editing?.customerId ?? initialCustomerId ?? "");
  const [contract, setContract] = useState<CustomerContract>(() => {
    const customer = customers.find((item) => item.id === (editing?.customerId ?? initialCustomerId));
    const defaults = blankContract(customers, customer);
    return editing ? { ...defaults, ...editing.contract, serialNumber: editing.contract.serialNumber || editing.contract.id, createdAt: editing.contract.createdAt ?? customer?.createdAt ?? defaults.createdAt, startsAt: (editing.contract.startsAt ?? editing.contract.createdAt ?? customer?.createdAt ?? defaults.startsAt)?.slice(0, 10) } : defaults;
  });
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [errors, setErrors] = useState<ContractFormErrors>({});
  const customer = customers.find((item) => item.id === customerId);
  const options = contractFormOptions(customers, contract.server, contract.olt);

  function patch(changes: Partial<CustomerContract>) {
    setContract((current) => ({ ...current, ...changes }));
    const dependentErrors = changes.accessMode !== undefined ? ["ipAddress", "netmask", "gateway", "dnsPrimary", "dnsSecondary", "macAddress", "username", "password", "pppProfile"] : changes.oltEnabled === false ? ["olt", "onuSerial", "onuPort", "gateway", "dnsPrimary", "vlan", "extraVlans", "napPort"] : [];
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => !Object.hasOwn(changes, name) && !dependentErrors.includes(name))));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setRequestError("");
    const cleaned = cleanContract(contract);
    const validation = validateContract(cleaned, customerId, customers, editing);
    if (Object.keys(validation).length) {
      setErrors(validation);
      const field = Object.keys(validation)[0];
      setTab(errorTab(field));
      window.requestAnimationFrame(() => document.getElementById(`contract-field-${field}`)?.focus());
      return;
    }
    setSaving(true);
    try {
      if (await onSave(customerId, { ...cleaned, updatedAt: new Date().toISOString() }) === false) { setRequestError("El contrato no se guardó. Revisa el mensaje del servidor antes de volver a intentarlo."); return; }
      onClose();
    } catch { setRequestError("No se confirmó el guardado del contrato. Revisa los datos y vuelve a intentarlo."); }
    finally { setSaving(false); }
  }

  const fieldProps = { contract, errors, options, onChange: patch };
  return <Dialog open onClose={saving ? undefined : onClose} fullScreen={mobile} maxWidth={false} aria-labelledby="contract-form-title" slotProps={{ paper: { sx: { width: mobile ? "100%" : "min(1500px,calc(100vw - 40px))", maxWidth: "none", maxHeight: mobile ? "100dvh" : "calc(100dvh - 32px)", borderRadius: 0 } } }}>
    <Box component="form" noValidate onSubmit={submit} sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography id="contract-form-title" component="h2" sx={{ fontSize: 18, fontWeight: 600 }}>{editing ? "Editar contrato" : "Nuevo contrato"}</Typography>
        <IconButton aria-label="Cerrar formulario de contrato" onClick={onClose} disabled={saving}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <Tabs aria-label="Configuración del contrato" value={tab} onChange={(_, value: ContractFormTab) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: { xs: 0.5, sm: 2 }, borderBottom: "1px solid", borderColor: "divider", "& .MuiTab-root": { minHeight: 56, px: 2, fontSize: 13 } }}>
        <Tab id="contract-tab-basic" aria-controls="contract-panel-basic" value="basic" label="Básico" icon={<DescriptionOutlinedIcon />} iconPosition="start" />
        <Tab id="contract-tab-billing" aria-controls="contract-panel-billing" value="billing" label="Facturación" icon={<AccountBalanceOutlinedIcon />} iconPosition="start" />
        <Tab id="contract-tab-advanced" aria-controls="contract-panel-advanced" value="advanced" label="Avanzado" icon={<SettingsOutlinedIcon />} iconPosition="start" />
      </Tabs>
      <DialogContent sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
        {!customers.length && <Alert severity="warning" sx={{ mb: 2 }}>Registra un cliente antes de crear un contrato. <Link href="/clientes">Ir a Clientes</Link></Alert>}
        {requestError && <Alert severity="error" sx={{ mb: 2 }}>{requestError}</Alert>}
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        {Object.keys(errors).length > 0 && <Alert severity="error" sx={{ mb: 2 }}>Revisa los campos señalados antes de guardar el contrato.</Alert>}
        <Box role="tabpanel" id={`contract-panel-${tab}`} aria-labelledby={`contract-tab-${tab}`}>
          {tab === "basic" && <ContractBasicForm {...fieldProps} customers={customers} customerId={customerId} editing={Boolean(editing)} onSelectCustomer={(selected) => { setCustomerId(selected?.id ?? ""); setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== "customerId"))); if (!editing) patch({ billingDay: selected?.billing.billingDay ?? 1 }); }} />}
          {tab === "billing" && <ContractBillingForm {...fieldProps} customer={customer} />}
          {tab === "advanced" && <ContractAdvancedForm {...fieldProps} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 0.75, px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={saving || !customers.length} startIcon={<SaveOutlinedIcon />} sx={{ boxShadow: "none" }}>{saving ? "Guardando…" : editing ? "Actualizar" : "Crear"}</Button>
      </DialogActions>
    </Box>
  </Dialog>;
}
