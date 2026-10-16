# Índice de controles y acciones ERP

Revisión estática de 71 archivos. 667 controles con eventos y 248 campos. Cada entrada referencia el handler y su línea; un handler genérico puede representar varios botones por fila. Código de Facturación no renderizado se conserva como evidencia de fuente, no como pantalla activa.

La prueba de clicks ejecutados se registra aparte. No se afirma que un control sin backend guarde datos por figurar en esta lista.

## acceso

| Control | Evento / handler | Fuente |
|---|---|---|
| (dinámico) (form) | AccessScreen: onSubmit {submit} | apps/frontend/src/features/acceso/access-screen.tsx:65 |
| "nombre@empresa.com" (input) | AccessScreen: onChange {() => { setErrors(current => ({ ...current, email: undefined })); setMessage(""); }} | apps/frontend/src/features/acceso/access-screen.tsx:67 |
| "Ingresa tu contraseña" (input) | AccessScreen: onChange {() => { setErrors(current => ({ ...current, password: undefined })); setMessage(""); }} | apps/frontend/src/features/acceso/access-screen.tsx:68 |
| {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} (button) | AccessScreen: onClick {() => setShowPassword(current => !current)} | apps/frontend/src/features/acceso/access-screen.tsx:68 |
| (dinámico) (button) | AccessScreen: onClick {() => { setBackup(current => !current); setMessage(""); }} | apps/frontend/src/features/acceso/access-screen.tsx:72 |
| Volver al inicio de sesión (button) | AccessScreen: onClick {async () => { setLoading(true); try { await authPost("/api/auth/sign-out", {}); window.location.replace("/login"); } catch (error) { setMessage(accessMessage(error, "No se pudo reiniciar el acceso. Inténtalo de nuevo.") | apps/frontend/src/features/acceso/access-screen.tsx:76 |
| (dinámico) (form) | RecoveryScreen: onSubmit {submit} | apps/frontend/src/features/acceso/recovery-screen.tsx:56 |
| Cerrar sesión (button) | SecurityScreen: onClick {() => run(async () => { await authPost("/api/auth/sign-out", {}); window.location.replace("/login"); }, "No se pudo cerrar la sesión. Inténtalo de nuevo.")} | apps/frontend/src/features/acceso/security-screen.tsx:89 |
| (dinámico) (form) | SecurityScreen: onSubmit {completeBootstrap} | apps/frontend/src/features/acceso/security-screen.tsx:97 |
| (dinámico) (form) | SecurityScreen: onSubmit {enable} | apps/frontend/src/features/acceso/security-screen.tsx:107 |
| (dinámico) (form) | SecurityScreen: onSubmit {verify} | apps/frontend/src/features/acceso/security-screen.tsx:111 |
| Descargar códigos (button) | SecurityScreen: onClick {downloadCodes} | apps/frontend/src/features/acceso/security-screen.tsx:113 |
| Guardé mis códigos en un lugar privado. (input) | SecurityScreen: onChange {event => setSaved(event.target.checked)} | apps/frontend/src/features/acceso/security-screen.tsx:113 |
| Ya guardé mis códigos (button) | SecurityScreen: onClick {() => { setCodes(null); setSaved(false); setMessage(""); }} | apps/frontend/src/features/acceso/security-screen.tsx:113 |
| Cambiar contraseña (button) | SecurityScreen: onClick {() => { setAction("password"); setMessage(""); }} | apps/frontend/src/features/acceso/security-screen.tsx:116 |
| Renovar códigos de recuperación (button) | SecurityScreen: onClick {() => { setAction("backup"); setMessage(""); }} | apps/frontend/src/features/acceso/security-screen.tsx:116 |
| (dinámico) (form) | SecurityScreen: onSubmit {sensitive} | apps/frontend/src/features/acceso/security-screen.tsx:117 |
| Cancelar (button) | SecurityScreen: onClick {() => setAction(null)} | apps/frontend/src/features/acceso/security-screen.tsx:121 |
| Cerrar todas las sesiones (button) | SecurityScreen: onClick {() => run(async () => { await authPost("/api/security/logout-all", {}); window.location.replace("/login"); }, "No se pudieron cerrar todas las sesiones. Inténtalo de nuevo.")} | apps/frontend/src/features/acceso/security-screen.tsx:124 |
| (dinámico) (form) | VerifyEmailScreen: onSubmit {confirm} | apps/frontend/src/features/acceso/verify-email-screen.tsx:35 |

## clientes

| Control | Evento / handler | Fuente |
|---|---|---|
| Importar (Button) | ClientesModule: onClick {() => setImportOpen(true)} | apps/frontend/src/features/clientes/clientes-module.tsx:268 |
| Exportar (Button) | ClientesModule: onClick {(event) => setExportAnchor(event.currentTarget)} | apps/frontend/src/features/clientes/clientes-module.tsx:269 |
| Nuevo cliente (Button) | ClientesModule: onClick {() => setCreatingCustomer(true)} | apps/frontend/src/features/clientes/clientes-module.tsx:270 |
| (dinámico) (CustomerToolbar) | ClientesModule: onQueryChange {updateQuery}; onFiltersChange {updateFilters}; onToggleFilters {() => setFiltersOpen((open) => !open)}; onClearFilters {() => updateFilters(emptyFilters)} | apps/frontend/src/features/clientes/clientes-module.tsx:277 |
| (dinámico) (CustomerState) | ClientesModule: onAction {retryLoading} | apps/frontend/src/features/clientes/clientes-module.tsx:305 |
| (dinámico) (CustomerState) | ClientesModule: onAction {clearSearchAndFilters} | apps/frontend/src/features/clientes/clientes-module.tsx:313 |
| (dinámico) (CustomerList) | ClientesModule: onPageChange {setPage}; onPageSizeChange {(value) => { setPageSize(value); setPage(1); }}; onSelect {(customer) => { setDetailTab("detalle"); selectCustomer(customer); }}; onAction {handleQuickAction} | apps/frontend/src/features/clientes/clientes-module.tsx:316 |
| (dinámico) (CustomerDetailPanel) | ClientesModule: onTabChange {setDetailTab}; onEdit {setEditingCustomer}; onOpenProfile {(customer) => setProfileCustomerId(customer.id)}; onOpenAccount {(customer) => setAccountCustomerId(customer.id)} | apps/frontend/src/features/clientes/clientes-module.tsx:333 |
| (dinámico) (Drawer) | ClientesModule: onClose {() => setDetailOpen(false)} | apps/frontend/src/features/clientes/clientes-module.tsx:344 |
| (dinámico) (CustomerDetailPanel) | ClientesModule: onTabChange {setDetailTab}; onClose {() => setDetailOpen(false)}; onEdit {setEditingCustomer}; onOpenProfile {(customer) => setProfileCustomerId(customer.id)}; onOpenAccount {(customer) => setAccountCustomerId(customer.id)} | apps/frontend/src/features/clientes/clientes-module.tsx:354 |
| (dinámico) (CustomerFormDialog) | ClientesModule: onClose {() => setEditingCustomer(null)}; onSave {saveCustomer} | apps/frontend/src/features/clientes/clientes-module.tsx:367 |
| (dinámico) (CustomerFormDialog) | ClientesModule: onClose {() => setCreatingCustomer(false)}; onSave {saveCustomer} | apps/frontend/src/features/clientes/clientes-module.tsx:376 |
| (dinámico) (AccountDialog) | ClientesModule: onClose {() => setAccountCustomerId(null)} | apps/frontend/src/features/clientes/clientes-module.tsx:378 |
| (dinámico) (CustomerProfileDialog) | ClientesModule: onClose {() => setProfileCustomerId(null)}; onEdit {() => setEditingCustomer(profileCustomer)}; onOpenAccount {() => setAccountCustomerId(profileCustomer.id)}; onUpdate {saveProfileCustomer} | apps/frontend/src/features/clientes/clientes-module.tsx:381 |
| (dinámico) (CustomerQueryProfile) | ClientesModule: onEdit {setEditingCustomer}; onOpenAccount {(customer) => setAccountCustomerId(customer.id)}; onUpdate {saveProfileCustomer} | apps/frontend/src/features/clientes/clientes-module.tsx:391 |
| (dinámico) (ImportCustomersDialog) | ClientesModule: onClose {() => setImportOpen(false)}; onImport {(fileName) => { setImportOpen(false); setMessage(`${fileName} quedó listo para validación. La importación real se conectará al backend.`); }} | apps/frontend/src/features/clientes/clientes-module.tsx:394 |
| (dinámico) (Menu) | ClientesModule: onClose {() => setExportAnchor(null)} | apps/frontend/src/features/clientes/clientes-module.tsx:396 |
| Exportar clientes en CSV (MenuItem) | ClientesModule: onClick {() => exportCustomers(false)} | apps/frontend/src/features/clientes/clientes-module.tsx:397 |
| Exportar clientes con enlace de acceso (MenuItem) | ClientesModule: onClick {() => exportCustomers(true)} | apps/frontend/src/features/clientes/clientes-module.tsx:398 |
| Revisar números móviles inválidos (MenuItem) | ClientesModule: onClick {() => { setExportAnchor(null); setMessage("No hay teléfonos inválidos en los datos visibles."); }} | apps/frontend/src/features/clientes/clientes-module.tsx:400 |
| (dinámico) (PasswordDialog) | ClientesModule: onClose {() => setPasswordCustomer(null)} | apps/frontend/src/features/clientes/clientes-module.tsx:404 |
| (dinámico) (Snackbar) | ClientesModule: onClose {() => setMessage("")} | apps/frontend/src/features/clientes/clientes-module.tsx:411 |
| (dinámico) (Alert) | ClientesModule: onClose {() => setMessage("")} | apps/frontend/src/features/clientes/clientes-module.tsx:412 |
| (dinámico) (CustomerProfileDialog) | CustomerQueryProfile: onClose {() => setDismissedId(requestedId)}; onEdit {() => onEdit(customer)}; onOpenAccount {() => onOpenAccount(customer)}; onUpdate {onUpdate} | apps/frontend/src/features/clientes/clientes-module.tsx:424 |
| Acercar (Button) | CustomerConsumptionChart: onClick {zoomChart} | apps/frontend/src/features/clientes/customer-consumption-chart.tsx:170 |
| Restablecer (Button) | CustomerConsumptionChart: onClick {resetChart} | apps/frontend/src/features/clientes/customer-consumption-chart.tsx:171 |
| Guardar PNG (Button) | CustomerConsumptionChart: onClick {downloadChart} | apps/frontend/src/features/clientes/customer-consumption-chart.tsx:172 |
| Ver movimientos (Button) | CustomerDetail: onClick {() => onOpenAccount(customer)} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:122 |
| Copiar enlace (Button) | CustomerApp: onClick {() => customer.portalLink && navigator.clipboard?.writeText(customer.portalLink)} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:190 |
| {`Abrir ficha completa de ${customer.name}`} (IconButton) | CustomerDetailPanel: onClick {() => onOpenProfile(customer)} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:229 |
| {`Editar ${customer.name}`} (IconButton) | CustomerDetailPanel: onClick {() => onEdit(customer)} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:229 |
| "Cerrar detalle" (IconButton) | CustomerDetailPanel: onClick {onClose} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:229 |
| "Vistas del cliente" (Tabs) | CustomerDetailPanel: onChange {(_, value: CustomerDetailTab) => onTabChange(value)} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:230 |
| (dinámico) (CustomerDetail) | CustomerDetailPanel: onOpenAccount {onOpenAccount} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:231 |
| Auditoría (Button) | CustomerDetailPanel: onClick {() => onTabChange("auditoria")} | apps/frontend/src/features/clientes/customer-detail-panel.tsx:232 |
| (dinámico) (Dialog) | EditCustomerDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-dialogs.tsx:45 |
| (dinámico) (Box) | EditCustomerDialog: onSubmit {handleSubmit} | apps/frontend/src/features/clientes/customer-dialogs.tsx:46 |
| "Nombre o razón social" (TextField) | EditCustomerDialog: onChange {(event) => setName(event.target.value)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:53 |
| "Correo de contacto" (TextField) | EditCustomerDialog: onChange {(event) => setEmail(event.target.value)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:54 |
| "Teléfono celular" (TextField) | EditCustomerDialog: onChange {(event) => setMobile(event.target.value)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:55 |
| "Dirección" (TextField) | EditCustomerDialog: onChange {(event) => setStreet(event.target.value)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:56 |
| "Colonia" (TextField) | EditCustomerDialog: onChange {(event) => setNeighborhood(event.target.value)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:57 |
| (dinámico) (Switch) | EditCustomerDialog: onChange {(event) => setBillingEnabled(event.target.checked)} | apps/frontend/src/features/clientes/customer-dialogs.tsx:59 |
| Cancelar (Button) | EditCustomerDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-dialogs.tsx:66 |
| (dinámico) (Dialog) | PasswordDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-dialogs.tsx:81 |
| Entendido (Button) | PasswordDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-dialogs.tsx:89 |
| (dinámico) (Dialog) | CustomerFormDialog: onClose {saving ? undefined : onClose} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:111 |
| (dinámico) (Box) | CustomerFormDialog: onSubmit {submit} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:112 |
| "Cerrar formulario" (IconButton) | CustomerFormDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:115 |
| (dinámico) (Tabs) | CustomerFormDialog: onChange {(_, value: FormTab) => setTab(value)} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:118 |
| "Tipo de persona" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, kind: e.target.value as CustomerKind })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:129 |
| "Primer nombre" (TextField) | CustomerFormDialog: onChange {(e) => { setFirstName(e.target.value); setFieldErrors((current) => ({ ...current, name: "" })); }} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:131 |
| "Segundo nombre" (TextField) | CustomerFormDialog: onChange {(e) => setSecondName(e.target.value)} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:132 |
| "Primer apellido" (TextField) | CustomerFormDialog: onChange {(e) => setFirstLastName(e.target.value)} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:133 |
| "Segundo apellido" (TextField) | CustomerFormDialog: onChange {(e) => setSecondLastName(e.target.value)} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:134 |
| "Documento o Cédula de identidad" (TextField) | CustomerFormDialog: onChange {(e) => { setDraft({ ...draft, document: e.target.value }); setFieldErrors((current) => ({ ...current, document: "" })); }} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:135 |
| "ID Cliente" (TextField) | CustomerFormDialog: onChange {(event) => { setDraft({ ...draft, customId: normalizeCustomerId(event.target.value) }); setFieldErrors((current) => ({ ...current, customId: "" })); }} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:136 |
| "Teléfono" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, contact: { ...draft.contact, landline: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:155 |
| "Teléfono móvil" (TextField) | CustomerFormDialog: onChange {(e) => { setDraft({ ...draft, contact: { ...draft.contact, mobile: e.target.value } }); setFieldErrors((current) => ({ ...current, mobile: "" })); }} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:156 |
| "E-mail de contacto" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:157 |
| "Observaciones" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, notes: e.target.value })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:158 |
| "Vendedor" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, assignment: { ...draft.assignment, seller: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:159 |
| "Recaudador" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, assignment: { ...draft.assignment, collector: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:160 |
| "Latitud" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, latitude: Number(e.target.value) } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:168 |
| "Longitud" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, longitude: Number(e.target.value) } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:169 |
| (dinámico) (GoogleMap) | CustomerFormDialog: onMapClick {(position) => setDraft((current) => ({ ...current, address: { ...current.address, latitude: position.lat, longitude: position.lng }, }))} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:172 |
| "Calle" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, street: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:191 |
| "Número" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, number: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:192 |
| "Barrio / Colonia" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, neighborhood: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:193 |
| "Zona" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, assignment: { ...draft.assignment, zone: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:194 |
| "Estado" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, state: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:195 |
| "Ciudad" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:196 |
| "Dato adicional" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, additionalData: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:197 |
| (dinámico) (Switch) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, enabled: e.target.checked } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:207 |
| (dinámico) (Switch) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, informAfterPayment: e.target.checked } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:208 |
| (dinámico) (Switch) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, automaticStatus: e.target.checked } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:209 |
| "Razón social" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, legalEntity: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:212 |
| "Tipo de factura" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, invoiceType: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:213 |
| "Régimen" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, regime: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:215 |
| "Nombre / Razón social" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, legalName: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:216 |
| "Ciclo de facturación comienza el día" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, billingDay: Number(e.target.value) } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:217 |
| "Código postal" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, address: { ...draft.address, postalCode: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:218 |
| "RFC" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, taxId: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:219 |
| "Método de pago" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, paymentMethod: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:224 |
| "Forma de pago" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, paymentForm: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:225 |
| "Información adicional" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, additionalInfo: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:226 |
| "Información adicional 2" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, additionalInfo2: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:227 |
| "Uso de CFDI" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, cfdiUse: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:228 |
| (dinámico) (Switch) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, emailInvoice: e.target.checked } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:229 |
| (dinámico) (Switch) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, emailPayment: e.target.checked } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:230 |
| "Emails a notificar" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, billing: { ...draft.billing, notificationEmails: e.target.value } })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:231 |
| "Pasarela asignada" (TextField) | CustomerFormDialog: onChange {(e) => setDraft({ ...draft, paymentGateway: e.target.value })} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:241 |
| Cancelar (Button) | CustomerFormDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-form-dialog.tsx:248 |
| Anterior (Button) | PaginationControls: onClick {() => onPageChange(page - 1)} | apps/frontend/src/features/clientes/customer-list.tsx:75 |
| (dinámico) (Button) | PaginationControls: onClick {() => onPageChange(item)} | apps/frontend/src/features/clientes/customer-list.tsx:76 |
| Siguiente (Button) | PaginationControls: onClick {() => onPageChange(Math.min(pageCount, page + 1))} | apps/frontend/src/features/clientes/customer-list.tsx:77 |
| (dinámico) (PaginationControls) | CustomerList: onPageChange {onPageChange} | apps/frontend/src/features/clientes/customer-list.tsx:128 |
| (dinámico) (Button) | CustomerList: onClick {() => onPageSizeChange(size)} | apps/frontend/src/features/clientes/customer-list.tsx:136 |
| {`Seleccionar ${customer.name}`} (ButtonBase) | CustomerList: onClick {() => onSelect(customer)} | apps/frontend/src/features/clientes/customer-list.tsx:170 |
| {`Abrir cuenta corriente de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "account"); }} | apps/frontend/src/features/clientes/customer-list.tsx:251 |
| {`Ver detalle de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "detail"); }} | apps/frontend/src/features/clientes/customer-list.tsx:266 |
| {`Editar ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "edit"); }} | apps/frontend/src/features/clientes/customer-list.tsx:275 |
| {`Cambiar contraseña de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "password"); }} | apps/frontend/src/features/clientes/customer-list.tsx:284 |
| {`Seleccionar ${customer.name}`} (Box) | CustomerList: onClick {() => onSelect(customer)} | apps/frontend/src/features/clientes/customer-list.tsx:324 |
| {`Cuenta corriente de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "account"); }} | apps/frontend/src/features/clientes/customer-list.tsx:352 |
| {`Ver detalle de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "detail"); }} | apps/frontend/src/features/clientes/customer-list.tsx:353 |
| {`Editar ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "edit"); }} | apps/frontend/src/features/clientes/customer-list.tsx:354 |
| {`Cambiar contraseña de ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => { event.stopPropagation(); onAction(customer, "password"); }} | apps/frontend/src/features/clientes/customer-list.tsx:355 |
| {`Más acciones para ${customer.name}`} (IconButton) | CustomerList: onClick {(event) => openMenu(event, customer)} | apps/frontend/src/features/clientes/customer-list.tsx:356 |
| (dinámico) (PaginationControls) | CustomerList: onPageChange {onPageChange} | apps/frontend/src/features/clientes/customer-list.tsx:365 |
| (dinámico) (Menu) | CustomerList: onClose {closeMenu} | apps/frontend/src/features/clientes/customer-list.tsx:368 |
| Editar cliente (MenuItem) | CustomerList: onClick {() => runMenuAction("edit")} | apps/frontend/src/features/clientes/customer-list.tsx:374 |
| Cambiar contraseña (MenuItem) | CustomerList: onClick {() => runMenuAction("password")} | apps/frontend/src/features/clientes/customer-list.tsx:377 |
| "Cerrar" (IconButton) | DialogHeader: onClick {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:40 |
| (dinámico) (Dialog) | AccountDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:47 |
| {`Cuenta corriente · ${customer.name}`} (DialogHeader) | AccountDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:48 |
| Cerrar (Button) | AccountDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:56 |
| (dinámico) (Dialog) | ImportCustomersDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:65 |
| "Actualizar desde archivo" (DialogHeader) | ImportCustomersDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:66 |
| "Seleccionar archivo CSV" (Box) | ImportCustomersDialog: onClick {() => inputRef.current?.click()} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:68 |
| (dinámico) (input) | ImportCustomersDialog: onChange {(event) => setFile(event.target.files?.[0] ?? null)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:71 |
| Cancelar (Button) | ImportCustomersDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:74 |
| Validar archivo (Button) | ImportCustomersDialog: onClick {() => file && onImport(file.name)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:74 |
| (dinámico) (Dialog) | TicketDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Crear ticket" (DialogHeader) | TicketDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Título" (TextField) | TicketDialog: onChange {(e) => setTitle(e.target.value)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Categoría" (TextField) | TicketDialog: onChange {(e) => setCategory(e.target.value)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Prioridad" (TextField) | TicketDialog: onChange {(e) => setPriority(e.target.value as CustomerTicket["priority"])} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Contrato" (TextField) | TicketDialog: onChange {(event) => setContractId(event.target.value)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Descripción" (TextField) | TicketDialog: onChange {(e) => setDescription(e.target.value)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| Cancelar (Button) | TicketDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| (dinámico) (Button) | TicketDialog: onClick {saveTicket} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| (dinámico) (Dialog) | CustomerProfileDialog: onClose {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:120 |
| "Volver al directorio" (IconButton) | CustomerProfileDialog: onClick {onClose} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:121 |
| Editar (Button) | CustomerProfileDialog: onClick {onEdit} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:121 |
| Cuenta corriente (Button) | CustomerProfileDialog: onClick {onOpenAccount} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:121 |
| Ver movimientos (Button) | CustomerProfileDialog: onClick {onOpenAccount} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:127 |
| Nuevo contrato (Button) | CustomerProfileDialog: onClick {() => setContractOpen(true)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:128 |
| Nuevo ticket (Button) | CustomerProfileDialog: onClick {() => setTicketOpen(true)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:130 |
| Copiar enlace (Button) | CustomerProfileDialog: onClick {() => customer.portalLink && navigator.clipboard?.writeText(customer.portalLink)} | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:134 |
| (dinámico) (ContractFormDialog) | CustomerProfileDialog: onClose {() => setContractOpen(false)}; onSave {async (customerId, contract) => { try { await commitCustomers((current) => saveContract(current, customerId, contract)); setContractError(""); return true; } catch (error) { setContractError(error instanceof Error ? err | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:141 |
| (dinámico) (TicketDialog) | CustomerProfileDialog: onClose {() => setTicketOpen(false)}; onSave {async (contractId, ticket) => { await onUpdate({ ...customer, contracts: customer.contracts.map((contract) => contract.id === contractId ? { ...contract, tickets: [...(contract.tickets ?? []), ticket] } : contract) });  | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:151 |
| (dinámico) (Button) | CustomerState: onClick {onAction} | apps/frontend/src/features/clientes/customer-state.tsx:109 |
| "Puedes buscar por: Nombre, E-mail, Teléfono fijo, Documento o Cédula, Teléfono celular, Dirección, ID Cliente personalizable, Dirección IP" (TextField) | CustomerToolbar: onChange {(event) => onQueryChange(event.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:64 |
| "Limpiar búsqueda" (IconButton) | CustomerToolbar: onClick {() => onQueryChange("")} | apps/frontend/src/features/clientes/customer-toolbar.tsx:73 |
| "Búsqueda avanzada" (Button) | CustomerToolbar: onClick {onToggleFilters} | apps/frontend/src/features/clientes/customer-toolbar.tsx:78 |
| (dinámico) (Dialog) | CustomerToolbar: onClose {onToggleFilters} | apps/frontend/src/features/clientes/customer-toolbar.tsx:83 |
| "Cerrar búsqueda avanzada" (IconButton) | CustomerToolbar: onClick {onToggleFilters} | apps/frontend/src/features/clientes/customer-toolbar.tsx:86 |
| "Nombre y apellido" (TextField) | CustomerToolbar: onChange {(e) => update("name", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:90 |
| "E-mail de contacto" (TextField) | CustomerToolbar: onChange {(e) => update("email", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:91 |
| "Teléfono fijo" (TextField) | CustomerToolbar: onChange {(e) => update("landline", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:92 |
| "Documento o Cédula" (TextField) | CustomerToolbar: onChange {(e) => update("document", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:93 |
| "Teléfono celular" (TextField) | CustomerToolbar: onChange {(e) => update("mobile", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:94 |
| "Dirección" (TextField) | CustomerToolbar: onChange {(e) => update("address", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:95 |
| "ID Cliente personalizable" (TextField) | CustomerToolbar: onChange {(e) => update("customId", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:96 |
| "Dirección IP" (TextField) | CustomerToolbar: onChange {(e) => update("ip", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:97 |
| "Tipo de persona" (TextField) | CustomerToolbar: onChange {(e) => update("kind", e.target.value as CustomerFilters["kind"])} | apps/frontend/src/features/clientes/customer-toolbar.tsx:98 |
| "Plan" (TextField) | CustomerToolbar: onChange {(e) => update("plan", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:101 |
| "Servidor" (TextField) | CustomerToolbar: onChange {(e) => update("server", e.target.value)} | apps/frontend/src/features/clientes/customer-toolbar.tsx:102 |
| "Facturación" (TextField) | CustomerToolbar: onChange {(e) => update("billing", e.target.value as CustomerFilters["billing"])} | apps/frontend/src/features/clientes/customer-toolbar.tsx:103 |
| "Estado de cuenta" (TextField) | CustomerToolbar: onChange {(e) => update("account", e.target.value as CustomerFilters["account"])} | apps/frontend/src/features/clientes/customer-toolbar.tsx:104 |
| Limpiar (Button) | CustomerToolbar: onClick {clearAdvancedSearch} | apps/frontend/src/features/clientes/customer-toolbar.tsx:108 |
| Buscar (Button) | CustomerToolbar: onClick {applyAdvancedSearch} | apps/frontend/src/features/clientes/customer-toolbar.tsx:109 |

## contratos

| Control | Evento / handler | Fuente |
|---|---|---|
| (dinámico) (Dialog) | ContractBulkContent: onClose {saving ? undefined : onClose} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:66 |
| "Cerrar modificación en lote" (IconButton) | ContractBulkContent: onClick {onClose} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:67 |
| (dinámico) (Checkbox) | ContractBulkContent: onChange {(_, checked) => setEnabled((current) => ({ ...current, [field.name]: checked }))} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:75 |
| {field.label} (TextField) | ContractBulkContent: onChange {(event) => changeValue("status", event.target.value)} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:76 |
| (dinámico) (Autocomplete) | ContractBulkContent: onInputChange {(_, value, reason) => { if (reason === "input" \|\| reason === "clear") changeValue(field.name, value); }}; onChange {(_, value) => changeValue(field.name, value ?? "")} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:76 |
| (dinámico) (Button) | ContractBulkContent: onClick {review ? () => setReview(false) : onClose} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:80 |
| (dinámico) (Button) | ContractBulkContent: onClick {review ? applyChanges : () => { setAttempted(true); if (!Object.keys(errors).length) setReview(true); }} | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:80 |
| ( ) (Button) | ContractControlPanel: onClick {() => onStatus(value)} | apps/frontend/src/features/contratos/contract-control-panel.tsx:18 |
| (dinámico) (Dialog) | ContractDetailContent: onClose {onClose} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:59 |
| "Cerrar detalle del contrato" (IconButton) | ContractDetailContent: onClick {onClose} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:62 |
| "Información del contrato" (Tabs) | ContractDetailContent: onChange {(_, value: DetailTab) => setTab(value)} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:64 |
| (dinámico) (ContractStatusSelect) | ContractDetailContent: onChange {setConfirmStatus} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:79 |
| Editar contrato (Button) | ContractDetailContent: onClick {onEdit} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:80 |
| (dinámico) (Dialog) | ContractDetailContent: onClose {() => setConfirmStatus(null)} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:83 |
| Cancelar (Button) | ContractDetailContent: onClick {() => setConfirmStatus(null)} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:86 |
| Confirmar (Button) | ContractDetailContent: onClick {() => { if (confirmStatus) onStatusChange(confirmStatus); setConfirmStatus(null); }} | apps/frontend/src/features/contratos/contract-detail-dialog.tsx:86 |
| {visible ? `Ocultar ${label}` : `Mostrar ${label}`} (IconButton) | ContractSecret: onClick {() => setVisible(!visible)} | apps/frontend/src/features/contratos/contract-detail-sections.tsx:35 |
| "Identificador" (TextField) | RuleEditor: onChange {(event) => { const selected = contractFilterFields.find((item) => item.value === event.target.value); onChange({ ...rule, field: event.target.value, operator: selected?.type === "text" ? "contains" : "eq", value: "" }); | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:101 |
| "Condición" (TextField) | RuleEditor: onChange {(event) => onChange({ ...rule, operator: event.target.value as FilterOperator })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:110 |
| "Valor" (TextField) | RuleEditor: onChange {(event) => onChange({ ...rule, value: event.target.value })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:115 |
| (dinámico) (Autocomplete) | RuleEditor: onInputChange {(_, value) => onChange({ ...rule, value })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:117 |
| "Valor" (TextField) | RuleEditor: onChange {(event) => onChange({ ...rule, value: event.target.value })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:119 |
| "Eliminar filtro" (IconButton) | RuleEditor: onClick {onDelete} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:122 |
| {depth === 0 ? "Relación entre filtros" : "Relación del grupo"} (ToggleButtonGroup) | GroupEditor: onChange {(_, logic: "and" \| "or" \| null) => { if (logic) onChange({ ...group, logic }); }} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:138 |
| "Eliminar grupo" (IconButton) | GroupEditor: onClick {onDelete} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:139 |
| (dinámico) (GroupEditor) | GroupEditor: onChange {(updated) => replaceRule(index, updated)}; onDelete {() => deleteRule(index)} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:142 |
| (dinámico) (RuleEditor) | GroupEditor: onChange {(updated) => replaceRule(index, updated)}; onDelete {() => deleteRule(index)} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:142 |
| Añadir filtro (Button) | GroupEditor: onClick {() => onChange({ ...group, rules: [...group.rules, newRule()] })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:145 |
| Añadir grupo (Button) | GroupEditor: onClick {() => onChange({ ...group, rules: [...group.rules, { id: createId(), logic: "and", rules: [newRule()] }] })} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:146 |
| (dinámico) (Dialog) | FilterSession: onClose {onClose} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:206 |
| "Cerrar filtros avanzados" (IconButton) | FilterSession: onClick {onClose} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:207 |
| "Filtros guardados" (TextField) | FilterSession: onChange {(event) => setSelectedId(event.target.value)} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:210 |
| "Cargar filtro guardado" (IconButton) | FilterSession: onClick {loadFilter} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:211 |
| "Eliminar filtro guardado" (IconButton) | FilterSession: onClick {() => { persist(saved.filters.filter((filter) => filter.id !== selectedId)); setSelectedId(""); setNotice(""); }} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:212 |
| "Nombre del filtro" (TextField) | FilterSession: onChange {(event) => setFilterName(event.target.value)} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:213 |
| "Guardar filtro" (IconButton) | FilterSession: onClick {saveFilter} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:214 |
| (dinámico) (GroupEditor) | FilterSession: onChange {(group) => { setDraft(group); setError(""); setNotice(""); }} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:219 |
| Limpiar filtros (Button) | FilterSession: onClick {() => { setDraft(emptyFilterGroup()); setError(""); setNotice(""); }} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:221 |
| Cancelar (Button) | FilterSession: onClick {onClose} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:221 |
| Buscar (Button) | FilterSession: onClick {apply} | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:221 |
| (dinámico) (Autocomplete) | ContractBasicForm: onChange {(_, customer) => onSelectCustomer(customer)} | apps/frontend/src/features/contratos/contract-form-basic.tsx:22 |
| "Plan" (ContractField) | ContractBasicForm: onChange {(patch) => { const existing = customers.flatMap((customer) => customer.contracts).find((item) => item.plan === patch.plan); onChange({ ...patch, ...(existing?.price !== undefined ? { price: existing.price } : {}) }); }} | apps/frontend/src/features/contratos/contract-form-basic.tsx:26 |
| "Servidor" (ContractField) | ContractBasicForm: onChange {(patch) => { const nextOptions = contractFormOptions(customers, patch.server ?? ""); onChange({ ...patch, ...(nextOptions.interfaces.includes(contract.interfaceName ?? "") ? {} : { interfaceName: "" }) }); }} | apps/frontend/src/features/contratos/contract-form-basic.tsx:27 |
| (dinámico) (Autocomplete) | ContractBasicForm: onChange {(_, items) => onChange({ items })} | apps/frontend/src/features/contratos/contract-form-basic.tsx:31 |
| (dinámico) (Switch) | ContractBasicForm: onChange {(event) => onChange({ bandwidthControl: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-basic.tsx:32 |
| Agregar (Button) | ContractChargesForm: onClick {() => onChange({ discounts: [...discounts, { id: crypto.randomUUID(), name: "", amount: 0, type: "Porcentaje" }] })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:21 |
| "Descripción" (TextField) | ContractChargesForm: onChange {(event) => patch({ name: event.target.value })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:28 |
| "Tipo" (TextField) | ContractChargesForm: onChange {(event) => patch({ type: event.target.value as typeof discount.type })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:29 |
| {discount.type === "Porcentaje" ? "Porcentaje" : "Importe"} (TextField) | ContractChargesForm: onChange {(event) => patch({ amount: Number(event.target.value) })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:30 |
| {`Quitar descuento ${index + 1}`} (IconButton) | ContractChargesForm: onClick {() => onChange({ discounts: discounts.filter((item) => item.id !== discount.id) })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:31 |
| Agregar (Button) | ContractChargesForm: onClick {() => onChange({ recurringItems: [...items, { id: crypto.randomUUID(), name: "", amount: 0, quantity: 1 }] })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:36 |
| "Artículo" (TextField) | ContractChargesForm: onChange {(event) => patch({ name: event.target.value })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:43 |
| "Cantidad" (TextField) | ContractChargesForm: onChange {(event) => patch({ quantity: Number(event.target.value) })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:44 |
| "Importe unitario" (TextField) | ContractChargesForm: onChange {(event) => patch({ amount: Number(event.target.value) })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:45 |
| {`Quitar artículo recurrente ${index + 1}`} (IconButton) | ContractChargesForm: onClick {() => onChange({ recurringItems: items.filter((entry) => entry.id !== item.id) })} | apps/frontend/src/features/contratos/contract-form-charges.tsx:46 |
| (dinámico) (RadioGroup) | ContractConnectionForm: onChange {(event) => onChange({ hostType: event.target.value as CustomerContract["hostType"] })} | apps/frontend/src/features/contratos/contract-form-connection.tsx:19 |
| (dinámico) (RadioGroup) | ContractConnectionForm: onChange {(event) => onChange({ accessMode: event.target.value as CustomerContract["accessMode"] })} | apps/frontend/src/features/contratos/contract-form-connection.tsx:20 |
| (dinámico) (Dialog) | ContractFormSession: onClose {saving ? undefined : onClose} | apps/frontend/src/features/contratos/contract-form-dialog.tsx:88 |
| (dinámico) (Box) | ContractFormSession: onSubmit {submit} | apps/frontend/src/features/contratos/contract-form-dialog.tsx:89 |
| "Cerrar formulario de contrato" (IconButton) | ContractFormSession: onClick {onClose} | apps/frontend/src/features/contratos/contract-form-dialog.tsx:92 |
| "Configuración del contrato" (Tabs) | ContractFormSession: onChange {(_, value: ContractFormTab) => setTab(value)} | apps/frontend/src/features/contratos/contract-form-dialog.tsx:94 |
| (dinámico) (ContractBasicForm) | ContractFormSession: onSelectCustomer {(selected) => { setCustomerId(selected?.id ?? ""); setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== "customerId"))); if (!editing) patch({ billingDay: selected?.billing.billi | apps/frontend/src/features/contratos/contract-form-dialog.tsx:105 |
| Cancelar (Button) | ContractFormSession: onClick {onClose} | apps/frontend/src/features/contratos/contract-form-dialog.tsx:111 |
| {label} (TextField) | ContractField: onChange {(event) => onChange({ [name]: type === "number" ? event.target.value === "" ? undefined : Number(event.target.value) : event.target.value })} | apps/frontend/src/features/contratos/contract-form-fields.tsx:23 |
| {revealed ? "Ocultar contraseña" : "Mostrar contraseña"} (IconButton) | ContractField: onClick {() => setRevealed(!revealed)} | apps/frontend/src/features/contratos/contract-form-fields.tsx:28 |
| (dinámico) (Autocomplete) | ContractOptionField: onInputChange {(_, next, reason) => { if (reason === "input" \|\| reason === "clear") onChange({ [name]: next }); }}; onChange {(_, next) => onChange({ [name]: next ?? "" })} | apps/frontend/src/features/contratos/contract-form-fields.tsx:34 |
| (dinámico) (Switch) | ContractOltForm: onChange {(event) => onChange({ oltEnabled: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:12 |
| (dinámico) (Switch) | ContractOltForm: onChange {(event) => onChange({ cableModemEnabled: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:13 |
| "OLT" (ContractOptionField) | ContractOltForm: onChange {(patch) => onChange({ ...patch, nap: "", napPort: "" })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:17 |
| "NAP" (ContractOptionField) | ContractOltForm: onChange {(patch) => onChange({ ...patch, napPort: "" })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:21 |
| (dinámico) (Switch) | ContractOltForm: onChange {(event) => onChange({ oltBandwidthControl: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:26 |
| (dinámico) (Switch) | ContractOltForm: onChange {(event) => onChange({ catvControl: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:27 |
| (dinámico) (Switch) | ContractOltForm: onChange {(event) => onChange({ provisionWan: event.target.checked })} | apps/frontend/src/features/contratos/contract-form-olt.tsx:28 |
| (dinámico) (Dialog) | ContractImportContent: onClose {saving ? undefined : onClose} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:73 |
| "Cerrar importación de contratos" (IconButton) | ContractImportContent: onClick {onClose} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:74 |
| Seleccionar archivo (Button) | ContractImportContent: onClick {() => input.current?.click()} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:77 |
| Formato CSV (Button) | ContractImportContent: onClick {downloadFormat} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:77 |
| (dinámico) (input) | ContractImportContent: onChange {(event) => { void readFile(event.target.files?.[0]); event.target.value = ""; }} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:77 |
| (dinámico) (Button) | ContractImportContent: onClick {confirmed ? () => setConfirmed(false) : onClose} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:86 |
| (dinámico) (Button) | ContractImportContent: onClick {confirmed ? applyImport : () => setConfirmed(true)} | apps/frontend/src/features/contratos/contract-import-dialog.tsx:86 |
| Copiar dirección (Button) | ContractCpeSection: onClick {() => void copyAddress()} | apps/frontend/src/features/contratos/contract-inspection-dialog.tsx:53 |
| (dinámico) (Dialog) | ContractInspectionDialog: onClose {onClose} | apps/frontend/src/features/contratos/contract-inspection-dialog.tsx:77 |
| {`Cerrar ${titles[kind]}`} (IconButton) | ContractInspectionDialog: onClick {onClose} | apps/frontend/src/features/contratos/contract-inspection-dialog.tsx:78 |
| Cerrar (Button) | ContractInspectionDialog: onClick {onClose} | apps/frontend/src/features/contratos/contract-inspection-dialog.tsx:82 |
| (dinámico) (ButtonBase) | ContractIdentity: onClick {() => onDetail(row)} | apps/frontend/src/features/contratos/contract-list.tsx:42 |
| (dinámico) (ContractStatusSelect) | ContractIdentity: onChange {(status) => onStatusChange(row, status)} | apps/frontend/src/features/contratos/contract-list.tsx:46 |
| (dinámico) (Checkbox) | ContractList: onChange {props.onToggleAll} | apps/frontend/src/features/contratos/contract-list.tsx:73 |
| (dinámico) (Checkbox) | ContractList: onChange {() => props.onToggle(row.key)} | apps/frontend/src/features/contratos/contract-list.tsx:75 |
| (dinámico) (ContractIdentity) | ContractList: onDetail {props.onDetail}; onStatusChange {props.onStatusChange} | apps/frontend/src/features/contratos/contract-list.tsx:76 |
| {`Ver contrato ${contractSerial(row.contract)}`} (IconButton) | ContractList: onClick {() => props.onDetail(row)} | apps/frontend/src/features/contratos/contract-list.tsx:78 |
| {`Editar contrato ${contractSerial(row.contract)}`} (IconButton) | ContractList: onClick {() => props.onEdit(row)} | apps/frontend/src/features/contratos/contract-list.tsx:78 |
| {`Más acciones contrato ${contractSerial(row.contract)}`} (IconButton) | ContractList: onClick {e => props.onMenu(row, e.currentTarget)} | apps/frontend/src/features/contratos/contract-list.tsx:78 |
| (dinámico) (TablePagination) | ContractList: onPageChange {(_, page) => props.onPage(page)}; onRowsPerPageChange {e => props.onPageSize(Number(e.target.value))} | apps/frontend/src/features/contratos/contract-list.tsx:82 |
| Notificar (Button) | ContractSelectionBar: onClick {onNotify} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:13 |
| Descargar (Button) | ContractSelectionBar: onClick {onDownload} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:14 |
| Actualizar (Button) | ContractSelectionBar: onClick {onUpdate} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:15 |
| (dinámico) (Dialog) | ContractNotificationDialog: onClose {onClose} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:24 |
| "Canal" (TextField) | ContractNotificationDialog: onChange {(event) => setChannel(event.target.value as typeof channel)} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:27 |
| "Mensaje" (TextField) | ContractNotificationDialog: onChange {(event) => setMessage(event.target.value)} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:30 |
| Cerrar (Button) | ContractNotificationDialog: onClick {onClose} | apps/frontend/src/features/contratos/contract-selection-bar.tsx:33 |
| "Estado" (TextField) | ContractStatusSelect: onChange {(event) => { const next = event.target.value as ServiceStatus; if (next !== status && statuses.includes(next)) onChange(next); }} | apps/frontend/src/features/contratos/contract-status-select.tsx:12 |
| "Buscar por" (TextField) | ContractToolbar: onChange {e => props.onSearchMode(e.target.value as ContractSearchMode)} | apps/frontend/src/features/contratos/contract-toolbar.tsx:34 |
| {searchLabels[props.searchMode]} (TextField) | ContractToolbar: onChange {e => props.onQuery(e.target.value)} | apps/frontend/src/features/contratos/contract-toolbar.tsx:37 |
| "Búsqueda avanzada" (IconButton) | ContractToolbar: onClick {props.onFilters} | apps/frontend/src/features/contratos/contract-toolbar.tsx:38 |
| "Limpiar filtros" (Chip) | ContractToolbar: onDelete {props.onClear}; onClick {props.onClear} | apps/frontend/src/features/contratos/contract-toolbar.tsx:40 |
| "Ordenar por" (IconButton) | ContractToolbar: onClick {e => openMenu(e, "sort")} | apps/frontend/src/features/contratos/contract-toolbar.tsx:41 |
| {props.descending ? "Orden descendente" : "Orden ascendente"} (IconButton) | ContractToolbar: onClick {props.onDirection} | apps/frontend/src/features/contratos/contract-toolbar.tsx:42 |
| "Mostrar/Ocultar columnas" (IconButton) | ContractToolbar: onClick {e => openMenu(e, "columns")} | apps/frontend/src/features/contratos/contract-toolbar.tsx:43 |
| "Importar estados" (IconButton) | ContractToolbar: onClick {props.onImport} | apps/frontend/src/features/contratos/contract-toolbar.tsx:44 |
| "Crear nuevo contrato" (IconButton) | ContractToolbar: onClick {props.onCreate} | apps/frontend/src/features/contratos/contract-toolbar.tsx:45 |
| (dinámico) (Menu) | ContractToolbar: onClose {() => setAnchor(null)} | apps/frontend/src/features/contratos/contract-toolbar.tsx:46 |
| (dinámico) (MenuItem) | ContractToolbar: onClick {() => { props.onSort(key as ContractSort); setAnchor(null); }} | apps/frontend/src/features/contratos/contract-toolbar.tsx:47 |
| (dinámico) (MenuItem) | ContractToolbar: onClick {() => props.onColumns(props.columns.includes(column.key) ? props.columns.filter(key => key !== column.key) : [...props.columns, column.key])} | apps/frontend/src/features/contratos/contract-toolbar.tsx:47 |
| (dinámico) (ContractToolbar) | ContratosModule: onQuery {state.onQuery}; onSearchMode {state.onSearchMode}; onFilters {() => state.setDialog("filters")}; onClear {state.onClear}; onCreate {() => state.setForm("create")}; onImport {() => state.setDialog("import")}; onSort {state.onSort}; onDirection {state.onDirection}; onColumns {state.setColumns} | apps/frontend/src/features/contratos/contratos-module.tsx:48 |
| (dinámico) (ContractControlPanel) | ContratosModule: onStatus {state.onStatus} | apps/frontend/src/features/contratos/contratos-module.tsx:49 |
| (dinámico) (ContractList) | ContratosModule: onToggle {state.toggle}; onToggleAll {state.toggleAll}; onDetail {(row) => state.setDetail(row.key)}; onEdit {openEdit}; onMenu {(row, element) => setMenu({ key: row.key, element })}; onStatusChange {(row, status) => state.setConfirm({ key: row.key, status })}; onPage {state.setPage}; onPageSize {state.onPageSize} | apps/frontend/src/features/contratos/contratos-module.tsx:51 |
| (dinámico) (ContractSelectionBar) | ContratosModule: onDownload {state.download}; onUpdate {() => state.setDialog("bulk")}; onNotify {() => state.setDialog("notify")} | apps/frontend/src/features/contratos/contratos-module.tsx:52 |
| (dinámico) (Menu) | ContratosModule: onClose {() => setMenu(null)} | apps/frontend/src/features/contratos/contratos-module.tsx:53 |
| (dinámico) (MenuItem) | ContratosModule: onClick {() => inspect(action.kind)} | apps/frontend/src/features/contratos/contratos-module.tsx:54 |
| (dinámico) (MenuItem) | ContratosModule: onClick {() => { if (menuRow) state.setConfirm({ key: menuRow.key, status }); setMenu(null); }} | apps/frontend/src/features/contratos/contratos-module.tsx:56 |
| Eliminar contrato (MenuItem) | ContratosModule: onClick {() => { if (menuRow) state.setConfirm({ key: menuRow.key }); setMenu(null); }} | apps/frontend/src/features/contratos/contratos-module.tsx:57 |
| (dinámico) (ContractFormDialog) | ContratosModule: onClose {() => state.setForm(null)}; onSave {state.save} | apps/frontend/src/features/contratos/contratos-module.tsx:59 |
| (dinámico) (ContractDetailDialog) | ContratosModule: onClose {() => state.setDetail(null)}; onEdit {() => { if (state.detailRow) openEdit(state.detailRow); }}; onStatusChange {(status) => { if (state.detailRow) state.applyUpdates([{ key: state.detailRow.key, changes: { status } }], "Estado del contrato actualizado."); }} | apps/frontend/src/features/contratos/contratos-module.tsx:60 |
| (dinámico) (ContractInspectionDialog) | ContratosModule: onClose {() => state.setInspection(null)} | apps/frontend/src/features/contratos/contratos-module.tsx:61 |
| (dinámico) (ContractFiltersDialog) | ContratosModule: onClose {() => state.setDialog(null)}; onApply {state.onFilters} | apps/frontend/src/features/contratos/contratos-module.tsx:62 |
| (dinámico) (ContractBulkDialog) | ContratosModule: onClose {() => state.setDialog(null)}; onApply {(changes) => state.applyUpdates(state.selectedRows.map((row) => ({ key: row.key, changes })), `${state.selectedRows.length} contratos actualizados.`)} | apps/frontend/src/features/contratos/contratos-module.tsx:63 |
| (dinámico) (ContractImportDialog) | ContratosModule: onClose {() => state.setDialog(null)}; onApply {(updates) => state.applyUpdates(updates.map(({ key, status }) => ({ key, changes: { status } })), `${updates.length} estados importados.`)} | apps/frontend/src/features/contratos/contratos-module.tsx:64 |
| (dinámico) (ContractNotificationDialog) | ContratosModule: onClose {() => state.setDialog(null)} | apps/frontend/src/features/contratos/contratos-module.tsx:65 |
| (dinámico) (Dialog) | ContratosModule: onClose {() => state.setConfirm(null)} | apps/frontend/src/features/contratos/contratos-module.tsx:66 |
| Cancelar (Button) | ContratosModule: onClick {() => state.setConfirm(null)} | apps/frontend/src/features/contratos/contratos-module.tsx:69 |
| Confirmar (Button) | ContratosModule: onClick {state.confirmAction} | apps/frontend/src/features/contratos/contratos-module.tsx:69 |
| (dinámico) (Snackbar) | ContratosModule: onClose {() => { state.setNotice(null); state.setUndo(null); }} | apps/frontend/src/features/contratos/contratos-module.tsx:71 |
| (dinámico) (Alert) | ContratosModule: onClose {() => { state.setNotice(null); state.setUndo(null); }} | apps/frontend/src/features/contratos/contratos-module.tsx:72 |
| Deshacer (Button) | ContratosModule: onClick {state.undoDelete} | apps/frontend/src/features/contratos/contratos-module.tsx:72 |

## dashboard

| Control | Evento / handler | Fuente |
|---|---|---|
| {`Ver panel ${label}`} (ButtonBase) | DashboardModule: onClick {() => setDashboardSection(label)} | apps/frontend/src/features/dashboard/dashboard-module.tsx:116 |

## facturacion

| Control | Evento / handler | Fuente |
|---|---|---|
| (dinámico) (Button) | Pager: onClick {() => onChange(size)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:178 |
| (dinámico) (Tabs) | SearchPanel: onChange {(_, value) => onAdvanced(value === "advanced")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:213 |
| {placeholder} (TextField) | SearchPanel: onChange {(event) => onQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:241 |
| Limpiar filtros (Button) | SearchPanel: onClick {onClear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:260 |
| {label} (IconButton) | TableAction: onClick {onClick} | apps/frontend/src/features/facturacion/facturacion-module.tsx:284 |
| (dinámico) (Tabs) | DetailTabs: onChange {(_, next) => onChange(next)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:307 |
| Crear Factura (Button) | FacturacionHeader: onClick {onCreate} | apps/frontend/src/features/facturacion/facturacion-module.tsx:413 |
| Exportar (Button) | FacturacionHeader: onClick {(event) => onExport(event.currentTarget)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:423 |
| Abrir módulo Clientes (Button) | CustomerPanel: onClick {() => window.location.assign("/clientes")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:520 |
| Ver comprobante (Button) | InvoiceRelatedPanel: onClick {onPreview} | apps/frontend/src/features/facturacion/facturacion-module.tsx:687 |
| (dinámico) (DetailTabs) | InvoiceDetail: onChange {onTab} | apps/frontend/src/features/facturacion/facturacion-module.tsx:751 |
| Previsualizar (Button) | InvoiceDetail: onClick {onPreview} | apps/frontend/src/features/facturacion/facturacion-module.tsx:776 |
| Imprimir PDF (Button) | InvoiceDetail: onClick {onPreview} | apps/frontend/src/features/facturacion/facturacion-module.tsx:785 |
| Enviar por email (Button) | InvoiceDetail: onClick {() => onAction( `Factura #${invoice.id} enviada a facturacion@cliente-demo.mx.`, ) } | apps/frontend/src/features/facturacion/facturacion-module.tsx:793 |
| (dinámico) (InvoiceRelatedPanel) | InvoiceDetail: onPreview {onPreview} | apps/frontend/src/features/facturacion/facturacion-module.tsx:875 |
| { mode === "emitidas" ? "Nombre cliente (Como figura en la factura)" : "Cliente (Nombre)" } (SearchPanel) | InvoicesView: onQuery {setQuery}; onAdvanced {setAdvanced}; onClear {() => { setQuery(""); setStatus("Todos"); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:944 |
| "Nombre del cliente" (TextField) | InvoicesView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:966 |
| "Estado" (TextField) | InvoicesView: onChange {(event) => setStatus(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:973 |
| (dinámico) (Button) | InvoicesView: onClick {() => setPeriod(item)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1005 |
| (dinámico) (Checkbox) | InvoicesView: onChange {() => setSelectedDrafts( allVisibleSelected ? [] : visibleIds, ) } | apps/frontend/src/features/facturacion/facturacion-module.tsx:1040 |
| (dinámico) (TableRow) | InvoicesView: onClick {() => setSelectedId(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1066 |
| (dinámico) (TableCell) | InvoicesView: onClick {(event) => event.stopPropagation()} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1078 |
| (dinámico) (Checkbox) | InvoicesView: onChange {() => toggleDraft(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1082 |
| (dinámico) (TableCell) | InvoicesView: onClick {(event) => event.stopPropagation()} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1130 |
| "Previsualizar" (TableAction) | InvoicesView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1134 |
| Emitir seleccionadas (Button) | InvoicesView: onClick {() => runBulkAction(onEmitDrafts)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1163 |
| Eliminar (Button) | InvoicesView: onClick {() => runBulkAction(onDeleteDrafts)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1172 |
| (dinámico) (Pager) | InvoicesView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1192 |
| (dinámico) (InvoiceDetail) | InvoicesView: onTab {setDetailTab}; onPreview {() => onPreview(selected)}; onAction {onAction} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1200 |
| "Cliente (Nombre)" (SearchPanel) | CreditNotesView: onQuery {setQuery}; onAdvanced {setAdvanced}; onClear {() => setQuery("")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1233 |
| "Cliente" (TextField) | CreditNotesView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1248 |
| (dinámico) (TableRow) | CreditNotesView: onClick {() => setSelectedId(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1290 |
| "Previsualizar" (TableAction) | CreditNotesView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1322 |
| (dinámico) (Pager) | CreditNotesView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1333 |
| (dinámico) (DetailTabs) | CreditNotesView: onChange {setTab} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1341 |
| Previsualizar (Button) | CreditNotesView: onClick {() => onPreview(selected)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1349 |
| "Cliente (Nombre)" (SearchPanel) | PaymentsView: onQuery {setQuery}; onAdvanced {setAdvanced}; onClear {() => { setQuery(""); setMethod("Todas"); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1446 |
| "Cliente" (TextField) | PaymentsView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1464 |
| (dinámico) (Button) | PaymentsView: onClick {() => setMethod(item)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1498 |
| (dinámico) (TableRow) | PaymentsView: onClick {() => setSelectedId(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1538 |
| (dinámico) (Pager) | PaymentsView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1578 |
| (dinámico) (DetailTabs) | PaymentsView: onChange {setTab} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1586 |
| Previsualizar (Button) | PaymentsView: onClick {() => onPreview(selected)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1609 |
| Imprimir (Button) | PaymentsView: onClick {() => onAction("Comprobante listo para imprimir.")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1617 |
| Imprimir POS (Button) | PaymentsView: onClick {() => onAction("Formato POS preparado.")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1624 |
| "Buscar por nombre de cliente" (TextField) | PaymentPromisesView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1713 |
| (dinámico) (IconButton) | PaymentPromisesView: onClick {() => setFiltersOpen(true)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1730 |
| Explora lo nuevo (Button) | PaymentPromisesView: onClick {() => setQuery("")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1739 |
| "Ver comprobante de promesa" (TableAction) | PaymentPromisesView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1814 |
| (dinámico) (Dialog) | PaymentPromisesView: onClose {() => setFiltersOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1826 |
| Cancelar (Button) | PaymentPromisesView: onClick {() => setFiltersOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1853 |
| Aplicar filtros (Button) | PaymentPromisesView: onClick {() => setFiltersOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1854 |
| {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"} (IconButton) | PaymentReceiptsView: onClick {() => setFiltersOpen((open) => !open)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1928 |
| { searchCriterion === "client" ? "Nombre del cliente" : "Número de factura" } (TextField) | PaymentReceiptsView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1946 |
| "Cambiar criterio de búsqueda" (IconButton) | PaymentReceiptsView: onClick {(event) => setCriteriaAnchor(event.currentTarget)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:1967 |
| Explora lo nuevo (Button) | PaymentReceiptsView: onClick {resetReceiptFilters} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2000 |
| (dinámico) (Menu) | PaymentReceiptsView: onClose {() => setCriteriaAnchor(null)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2009 |
| (dinámico) (MenuItem) | PaymentReceiptsView: onClick {() => { setSearchCriterion(item.value); setQuery(""); setCriteriaAnchor(null); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2037 |
| "Seleccionar identificador del filtro" (TextField) | PaymentReceiptsView: onChange {(event) => { setFilterField(event.target.value as ReceiptFilterField); setFilterValue(""); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2090 |
| "Seleccionar valor del filtro" (TextField) | PaymentReceiptsView: onChange {(event) => setFilterValue(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2108 |
| Limpiar filtro (Button) | PaymentReceiptsView: onClick {() => { setFilterField(""); setFilterValue(""); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2126 |
| "Abrir comprobante" (TableAction) | PaymentReceiptsView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2167 |
| "Puedes buscar por: ID y Creador" (TextField) | CashAuditsView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2217 |
| Búsqueda Avanzada (Button) | CashAuditsView: onClick {() => setAdvancedOpen(true)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2232 |
| "Ver detalle" (TableAction) | CashAuditsView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2285 |
| "Descargar arqueo" (TableAction) | CashAuditsView: onClick {() => onDownload(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2290 |
| "Vista resumida" (TableAction) | CashAuditsView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2295 |
| (dinámico) (Pager) | CashAuditsView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2306 |
| (dinámico) (Dialog) | CashAuditsView: onClose {() => setAdvancedOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2313 |
| Cancelar (Button) | CashAuditsView: onClick {() => setAdvancedOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2346 |
| Buscar (Button) | CashAuditsView: onClick {() => setAdvancedOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2347 |
| "Cliente (Nombre)" (SearchPanel) | CreditNotesOperationalView: onQuery {setQuery}; onAdvanced {setAdvanced}; onClear {clear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2390 |
| "Cliente" (TextField) | CreditNotesOperationalView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2405 |
| "Número de factura" (TextField) | CreditNotesOperationalView: onChange {(event) => setInvoiceNumber(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2411 |
| "Estado" (TextField) | CreditNotesOperationalView: onChange {(event) => setStatus(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2418 |
| (dinámico) (TableRow) | CreditNotesOperationalView: onClick {() => setSelectedId(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2460 |
| (dinámico) (TableCell) | CreditNotesOperationalView: onClick {(event) => event.stopPropagation()} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2499 |
| "Previsualizar" (TableAction) | CreditNotesOperationalView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2503 |
| (dinámico) (Pager) | CreditNotesOperationalView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2521 |
| (dinámico) (DetailTabs) | CreditNotesOperationalView: onChange {setTab} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2532 |
| Previsualizar (Button) | CreditNotesOperationalView: onClick {() => onPreview(selected)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2554 |
| "Cliente (Nombre)" (SearchPanel) | PaymentsOperationalView: onQuery {setQuery}; onAdvanced {setAdvanced}; onClear {clear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2650 |
| "Cliente" (TextField) | PaymentsOperationalView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2665 |
| "Recolectado por" (TextField) | PaymentsOperationalView: onChange {(event) => setCollector(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2671 |
| "Registrado por" (TextField) | PaymentsOperationalView: onChange {(event) => setRegisteredBy(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2687 |
| (dinámico) (Button) | PaymentsOperationalView: onClick {() => setMethod(item)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2713 |
| (dinámico) (TableRow) | PaymentsOperationalView: onClick {() => setSelectedId(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2753 |
| (dinámico) (Pager) | PaymentsOperationalView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2817 |
| (dinámico) (DetailTabs) | PaymentsOperationalView: onChange {setTab} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2828 |
| Previsualizar (Button) | PaymentsOperationalView: onClick {() => onPreview(selected)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2851 |
| Imprimir (Button) | PaymentsOperationalView: onClick {() => onPreview(selected)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2859 |
| Imprimir POS (Button) | PaymentsOperationalView: onClick {() => { onPreview(selected); onAction( `Formato POS del pago #${selected.id} preparado.`, ); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2866 |
| "Buscar por nombre de cliente" (TextField) | PaymentPromisesOperationalView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2966 |
| "Abrir filtros" (IconButton) | PaymentPromisesOperationalView: onClick {() => setFiltersOpen(true)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2983 |
| Limpiar (Button) | PaymentPromisesOperationalView: onClick {clear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:2995 |
| Descargar (Button) | PaymentPromisesOperationalView: onClick {() => onAction( `${selectedIds.length} comprobantes de promesa preparados para descarga.`, ) } | apps/frontend/src/features/facturacion/facturacion-module.tsx:3025 |
| Cancelar selección (Button) | PaymentPromisesOperationalView: onClick {() => setSelectedIds([])} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3036 |
| (dinámico) (Checkbox) | PaymentPromisesOperationalView: onChange {() => setSelectedIds(allSelected ? [] : visibleIds) } | apps/frontend/src/features/facturacion/facturacion-module.tsx:3047 |
| (dinámico) (Checkbox) | PaymentPromisesOperationalView: onChange {() => toggle(row.id)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3074 |
| "Ver comprobante de promesa" (TableAction) | PaymentPromisesOperationalView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3136 |
| (dinámico) (Dialog) | PaymentPromisesOperationalView: onClose {() => setFiltersOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3155 |
| "Tipo" (TextField) | PaymentPromisesOperationalView: onChange {(event) => setType(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3164 |
| (dinámico) (Checkbox) | PaymentPromisesOperationalView: onChange {(event) => setDebtOnly(event.target.checked)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3177 |
| Limpiar (Button) | PaymentPromisesOperationalView: onClick {clear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3187 |
| Aplicar filtros (Button) | PaymentPromisesOperationalView: onClick {() => setFiltersOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3188 |
| "Puedes buscar por: ID y Creador" (TextField) | CashAuditsOperationalView: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3240 |
| Búsqueda Avanzada (Button) | CashAuditsOperationalView: onClick {() => setAdvancedOpen(true)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3255 |
| "Ver detalle" (TableAction) | CashAuditsOperationalView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3317 |
| "Descargar arqueo" (TableAction) | CashAuditsOperationalView: onClick {() => onDownload(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3322 |
| "Vista resumida" (TableAction) | CashAuditsOperationalView: onClick {() => onPreview(row)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3327 |
| (dinámico) (Pager) | CashAuditsOperationalView: onChange {setPageSize} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3345 |
| (dinámico) (Dialog) | CashAuditsOperationalView: onClose {() => setAdvancedOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3352 |
| "ID de arqueo" (TextField) | CashAuditsOperationalView: onChange {(event) => setIdFilter(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3368 |
| "Creado por" (TextField) | CashAuditsOperationalView: onChange {(event) => setCreatorFilter(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3375 |
| Limpiar (Button) | CashAuditsOperationalView: onClick {clear} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3384 |
| Buscar (Button) | CashAuditsOperationalView: onClick {() => setAdvancedOpen(false)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3385 |
| (dinámico) (Dialog) | CreateInvoiceDialog: onClose {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3444 |
| "Cerrar" (IconButton) | CreateInvoiceDialog: onClick {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3466 |
| (dinámico) (Tabs) | CreateInvoiceDialog: onChange {(_, value) => setTab(value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3470 |
| "Cliente" (TextField) | CreateInvoiceDialog: onChange {(event) => setClient(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3493 |
| "Concepto" (TextField) | CreateInvoiceDialog: onChange {(event) => setConcept(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3547 |
| "Monto" (TextField) | CreateInvoiceDialog: onChange {(event) => setAmount(event.target.value)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3553 |
| Cancelar (Button) | CreateInvoiceDialog: onClick {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3601 |
| Crear borrador (Button) | CreateInvoiceDialog: onClick {save} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3604 |
| Ver movimientos de facturación (Button) | ReceiptDetailView: onClick {() => document .getElementById("receipt-payment-history") ?.scrollIntoView({ behavior: "smooth", block: "center" }) } | apps/frontend/src/features/facturacion/facturacion-module.tsx:3732 |
| (dinámico) (Dialog) | PreviewDialog: onClose {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3831 |
| "Cerrar vista" (IconButton) | PreviewDialog: onClick {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3861 |
| Imprimir (Button) | PreviewDialog: onClick {() => window.print()} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3943 |
| Cerrar (Button) | PreviewDialog: onClick {onClose} | apps/frontend/src/features/facturacion/facturacion-module.tsx:3946 |
| (dinámico) (FacturacionHeader) | FacturacionModule: onCreate {() => setCreateOpen(true)}; onExport {(target) => setExportAnchor(target)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4120 |
| (dinámico) (InvoicesView) | FacturacionModule: onPreview {previewInvoice}; onAction {setMessage}; onEmitDrafts {emitDrafts}; onDeleteDrafts {deleteDrafts} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4126 |
| (dinámico) (InvoicesView) | FacturacionModule: onPreview {previewInvoice}; onAction {setMessage} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4142 |
| (dinámico) (CreditNotesOperationalView) | FacturacionModule: onPreview {previewCredit} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4156 |
| (dinámico) (PaymentsOperationalView) | FacturacionModule: onPreview {previewPayment}; onAction {setMessage} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4165 |
| (dinámico) (PaymentPromisesOperationalView) | FacturacionModule: onPreview {previewPromise}; onAction {setMessage} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4175 |
| (dinámico) (PaymentReceiptsView) | FacturacionModule: onPreview {previewReceipt} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4183 |
| (dinámico) (CashAuditsOperationalView) | FacturacionModule: onPreview {previewAudit}; onDownload {() => exportCsv("Descarga de arqueo")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4190 |
| (dinámico) (Menu) | FacturacionModule: onClose {() => setExportAnchor(null)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4199 |
| Exportar listado CSV (MenuItem) | FacturacionModule: onClick {() => exportCsv()} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4204 |
| Exportar Items (MenuItem) | FacturacionModule: onClick {() => exportCsv("Exportar items")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4206 |
| Preparar vista de impresión (MenuItem) | FacturacionModule: onClick {() => { setExportAnchor(null); setMessage("Vista de impresión preparada."); window.print(); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4210 |
| (dinámico) (CreateInvoiceDialog) | FacturacionModule: onClose {() => setCreateOpen(false)}; onCreate {(invoice) => { setDrafts((current) => [invoice, ...current]); setMessage("Borrador de factura creado en la demostración."); }} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4220 |
| (dinámico) (PreviewDialog) | FacturacionModule: onClose {() => setPreview(null)} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4228 |
| (dinámico) (Snackbar) | FacturacionModule: onClose {() => setMessage("")} | apps/frontend/src/features/facturacion/facturacion-module.tsx:4229 |

## inventario

| Control | Evento / handler | Fuente |
|---|---|---|
| Editar (Button) | InventoryDetailPanel: onClick {onEdit} | apps/frontend/src/features/inventario/inventory-workbench.tsx:240 |
| (dinámico) (Button) | InventoryDetailPanel: onClick {onAddItems} | apps/frontend/src/features/inventario/inventory-workbench.tsx:243 |
| "Modo de búsqueda de artículos" (Tabs) | InventoryArticlesView: onChange {(_, value) => setSearchMode(value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:342 |
| "Código, serie, MAC, marca o modelo" (TextField) | InventoryArticlesView: onChange {(event) => { setEquipmentQuery(event.target.value); setPage(1); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:355 |
| "Distribuidor, nodo, empleado, almacén o cliente" (TextField) | InventoryArticlesView: onChange {(event) => { setLocationQuery(event.target.value); setPage(1); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:362 |
| Limpiar filtros (Button) | InventoryArticlesView: onClick {clearFilters} | apps/frontend/src/features/inventario/inventory-workbench.tsx:369 |
| (dinámico) (Button) | InventoryArticlesView: onClick {() => { setArticleStatus((current) => current === status ? "Todos" : status); setPage(1); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:375 |
| "Cambiar estado a" (TextField) | InventoryArticlesView: onChange {(event) => setBulkStatus(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:390 |
| Aplicar a (Button) | InventoryArticlesView: onClick {applyBulkStatus} | apps/frontend/src/features/inventario/inventory-workbench.tsx:394 |
| (dinámico) (Checkbox) | InventoryArticlesView: onChange {toggleAllVisible} | apps/frontend/src/features/inventario/inventory-workbench.tsx:416 |
| (dinámico) (Checkbox) | InventoryArticlesView: onChange {() => toggleSelected(record.id)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:425 |
| {`Cambiar disponibilidad de ${String(record.codigo ?? record.id)}`} (IconButton) | InventoryArticlesView: onClick {() => onStatusChange([record.id], String(record.estado) === "Inactivo" ? "Libre" : "Inactivo")} | apps/frontend/src/features/inventario/inventory-workbench.tsx:438 |
| {`Ver información del artículo ${String(record.codigo ?? record.id)}`} (IconButton) | InventoryArticlesView: onClick {() => onEdit(record)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:439 |
| Limpiar filtros (Button) | InventoryArticlesView: onClick {clearFilters} | apps/frontend/src/features/inventario/inventory-workbench.tsx:444 |
| (dinámico) (Button) | InventoryArticlesView: onClick {() => setPage(pageNumber)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:451 |
| (dinámico) (Button) | InventoryArticlesView: onClick {() => { onPageSizeChange(size); setPage(1); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:455 |
| Exportar (Button) | WisproModuleWorkbench: onClick {(event) => setMenuAnchor(event.currentTarget)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:623 |
| (dinámico) (Button) | WisproModuleWorkbench: onClick {openCreate} | apps/frontend/src/features/inventario/inventory-workbench.tsx:625 |
| (dinámico) (Tabs) | WisproModuleWorkbench: onChange {(_, value) => setView(value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:631 |
| (dinámico) (InventoryArticlesView) | WisproModuleWorkbench: onPageSizeChange {setPageSize}; onEdit {openEdit}; onStatusChange {updateArticleStatuses}; onNotify {setMessage} | apps/frontend/src/features/inventario/inventory-workbench.tsx:637 |
| {config.searchPlaceholder} (TextField) | WisproModuleWorkbench: onChange {(event) => setQuery(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:647 |
| Búsqueda avanzada (Button) | WisproModuleWorkbench: onClick {() => setAdvancedOpen((current) => !current)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:648 |
| "Estado" (TextField) | WisproModuleWorkbench: onChange {(event) => setPendingStatusFilter(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:653 |
| "Creado desde" (TextField) | WisproModuleWorkbench: onChange {(event) => setPendingCreatedFrom(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:654 |
| Aplicar filtros de demostración (Button) | WisproModuleWorkbench: onClick {() => { setStatusFilter(pendingStatusFilter); setCreatedFrom(pendingCreatedFrom); setSelectedId(""); setAdvancedOpen(false); setMessage("Filtros de demostración aplicados."); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:655 |
| {`Seleccionar ${config.singular} ${String(record[column.key] ?? record.id)}`} (ButtonBase) | WisproModuleWorkbench: onClick {() => setSelectedId(record.id)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:671 |
| {`Ver detalle de ${String(record[config.columns[0]?.key] ?? record.id)}`} (IconButton) | WisproModuleWorkbench: onClick {() => setSelectedId(record.id)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:673 |
| {`Editar ${String(record[config.columns[0]?.key] ?? record.id)}`} (IconButton) | WisproModuleWorkbench: onClick {() => openEdit(record)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:674 |
| {`Eliminar ${String(record[config.columns[0]?.key] ?? record.id)}`} (IconButton) | WisproModuleWorkbench: onClick {() => { setSelectedId(record.id); setDeleteOpen(true); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:675 |
| Crear uno aquí (Button) | WisproModuleWorkbench: onClick {openCreate} | apps/frontend/src/features/inventario/inventory-workbench.tsx:679 |
| (dinámico) (Button) | WisproModuleWorkbench: onClick {() => setPageSize(size)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:683 |
| (dinámico) (InventoryDetailPanel) | WisproModuleWorkbench: onEdit {() => openEdit()}; onAddItems {openAddItems} | apps/frontend/src/features/inventario/inventory-workbench.tsx:689 |
| Editar (Button) | WisproModuleWorkbench: onClick {() => openEdit()} | apps/frontend/src/features/inventario/inventory-workbench.tsx:706 |
| Eliminar (Button) | WisproModuleWorkbench: onClick {() => setDeleteOpen(true)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:706 |
| (dinámico) (Menu) | WisproModuleWorkbench: onClose {() => setMenuAnchor(null)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:716 |
| Exportar CSV de demostración (MenuItem) | WisproModuleWorkbench: onClick {exportDemo} | apps/frontend/src/features/inventario/inventory-workbench.tsx:716 |
| Preparar vista de impresión (MenuItem) | WisproModuleWorkbench: onClick {() => { setMenuAnchor(null); setMessage("Vista de impresión preparada para demostración."); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:716 |
| (dinámico) (Dialog) | WisproModuleWorkbench: onClose {() => setDialogMode(null)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:718 |
| (dinámico) (Tabs) | WisproModuleWorkbench: onChange {(_, value) => setFormTab(value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:720 |
| Seleccionar imagen (input) | WisproModuleWorkbench: onChange {(event) => commonChange(event.target.files?.[0]?.name ?? "")} | apps/frontend/src/features/inventario/inventory-workbench.tsx:737 |
| {label} (TextField) | WisproModuleWorkbench: onChange {(event) => commonChange(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:746 |
| {label} (TextField) | WisproModuleWorkbench: onChange {(event) => commonChange(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:752 |
| Eliminar (Button) | WisproModuleWorkbench: onClick {() => { setDialogMode(null); setDeleteOpen(true); }} | apps/frontend/src/features/inventario/inventory-workbench.tsx:778 |
| Cerrar (Button) | WisproModuleWorkbench: onClick {() => setDialogMode(null)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:782 |
| (dinámico) (Button) | WisproModuleWorkbench: onClick {saveDraft} | apps/frontend/src/features/inventario/inventory-workbench.tsx:783 |
| (dinámico) (Dialog) | WisproModuleWorkbench: onClose {() => setAddItemsOpen(false)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:789 |
| "Almacén" (TextField) | WisproModuleWorkbench: onChange {(event) => setArticleWarehouse(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:798 |
| "Distribuidor" (TextField) | WisproModuleWorkbench: onChange {(event) => setArticleDistributor(event.target.value)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:801 |
| "Código de producto" (TextField) | WisproModuleWorkbench: onChange {(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, productCode: event.target.value } : item))} | apps/frontend/src/features/inventario/inventory-workbench.tsx:808 |
| "Número de serie" (TextField) | WisproModuleWorkbench: onChange {(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, serialNumber: event.target.value } : item))} | apps/frontend/src/features/inventario/inventory-workbench.tsx:809 |
| "MAC address" (TextField) | WisproModuleWorkbench: onChange {(event) => setArticleRows((current) => current.map((item) => item.id === row.id ? { ...item, macAddress: event.target.value } : item))} | apps/frontend/src/features/inventario/inventory-workbench.tsx:810 |
| {`Eliminar artículo ${index + 1}`} (IconButton) | WisproModuleWorkbench: onClick {() => setArticleRows((current) => current.filter((item) => item.id !== row.id))} | apps/frontend/src/features/inventario/inventory-workbench.tsx:813 |
| Agregar otro artículo (Button) | WisproModuleWorkbench: onClick {addArticleRow} | apps/frontend/src/features/inventario/inventory-workbench.tsx:820 |
| Cerrar (Button) | WisproModuleWorkbench: onClick {() => setAddItemsOpen(false)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:826 |
| (dinámico) (Button) | WisproModuleWorkbench: onClick {saveArticles} | apps/frontend/src/features/inventario/inventory-workbench.tsx:827 |
| (dinámico) (Dialog) | WisproModuleWorkbench: onClose {() => setDeleteOpen(false)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:833 |
| Cancelar (Button) | WisproModuleWorkbench: onClick {() => setDeleteOpen(false)} | apps/frontend/src/features/inventario/inventory-workbench.tsx:833 |
| Eliminar (Button) | WisproModuleWorkbench: onClick {removeSelected} | apps/frontend/src/features/inventario/inventory-workbench.tsx:833 |
| (dinámico) (Snackbar) | WisproModuleWorkbench: onClose {() => setMessage("")} | apps/frontend/src/features/inventario/inventory-workbench.tsx:835 |

## nodos

| Control | Evento / handler | Fuente |
|---|---|---|
| {ariaLabel} (Button) | PageButton: onClick {onClick} | apps/frontend/src/features/nodos/nodos-module.tsx:47 |
| (dinámico) (Dialog) | CoverageDialog: onClose {onClose} | apps/frontend/src/features/nodos/nodos-module.tsx:63 |
| "Cerrar coberturas" (IconButton) | CoverageDialog: onClick {onClose} | apps/frontend/src/features/nodos/nodos-module.tsx:69 |
| (dinámico) (TableRow) | NodosModule: onClick {() => setSelectedId(node.id)} | apps/frontend/src/features/nodos/nodos-module.tsx:146 |
| {`Ver coberturas de ${node.name}`} (IconButton) | NodosModule: onClick {(event) => { event.stopPropagation(); setSelectedId(node.id); setCoverageNode(node); }} | apps/frontend/src/features/nodos/nodos-module.tsx:158 |
| (dinámico) (PageButton) | NodosModule: onClick {() => setPage(1)} | apps/frontend/src/features/nodos/nodos-module.tsx:176 |
| (dinámico) (PageButton) | NodosModule: onClick {() => setPage((current) => Math.max(1, current - 1))} | apps/frontend/src/features/nodos/nodos-module.tsx:177 |
| (dinámico) (PageButton) | NodosModule: onClick {() => setPage(pageNumber)} | apps/frontend/src/features/nodos/nodos-module.tsx:178 |
| (dinámico) (PageButton) | NodosModule: onClick {() => setPage((current) => Math.min(pageCount, current + 1))} | apps/frontend/src/features/nodos/nodos-module.tsx:179 |
| (dinámico) (PageButton) | NodosModule: onClick {() => setPage(pageCount)} | apps/frontend/src/features/nodos/nodos-module.tsx:180 |
| (dinámico) (PageButton) | NodosModule: onClick {() => updatePageSize(size)} | apps/frontend/src/features/nodos/nodos-module.tsx:186 |
| (dinámico) (GoogleMap) | NodosModule: onMarkerClick {setSelectedId} | apps/frontend/src/features/nodos/nodos-module.tsx:192 |
| (dinámico) (CoverageDialog) | NodosModule: onClose {() => setCoverageNode(null)} | apps/frontend/src/features/nodos/nodos-module.tsx:212 |

## planes

| Control | Evento / handler | Fuente |
|---|---|---|
| (dinámico) (Button) | DetailSection: onClick {() => setOpen((current) => !current)} | apps/frontend/src/features/planes/planes-module.tsx:161 |
| (dinámico) (Dialog) | CreatePlanDialog: onClose {close} | apps/frontend/src/features/planes/planes-module.tsx:280 |
| "Cerrar" (IconButton) | CreatePlanDialog: onClick {close} | apps/frontend/src/features/planes/planes-module.tsx:291 |
| (dinámico) (Button) | CreatePlanDialog: onClick {() => setTab(item.id)} | apps/frontend/src/features/planes/planes-module.tsx:297 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("name", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:304 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("maxUpload", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:307 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("uploadUnit", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:308 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("maxDownload", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:309 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("downloadUnit", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:310 |
| (dinámico) (Checkbox) | CreatePlanDialog: onChange {(event) => updateDraft("visible", event.target.checked)} | apps/frontend/src/features/planes/planes-module.tsx:315 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("price", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:319 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("mikrotikStrategy", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:325 |
| "Ráfagas habilitadas" (Button) | CreatePlanDialog: onClick {() => updateDraft("burstEnabled", !draft.burstEnabled)} | apps/frontend/src/features/planes/planes-module.tsx:326 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("productCode", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:332 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("firstInterestCode", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:333 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("secondInterestCode", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:334 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("reconnectionCode", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:335 |
| (dinámico) (TextField) | CreatePlanDialog: onChange {(event) => updateDraft("installationCode", event.target.value)} | apps/frontend/src/features/planes/planes-module.tsx:336 |
| Cancelar (Button) | CreatePlanDialog: onClick {close} | apps/frontend/src/features/planes/planes-module.tsx:340 |
| "Ayuda para crear un plan" (IconButton) | CreatePlanDialog: onClick {() => setTab("basic")} | apps/frontend/src/features/planes/planes-module.tsx:340 |
| Crear (Button) | CreatePlanDialog: onClick {create} | apps/frontend/src/features/planes/planes-module.tsx:340 |
| (dinámico) (Button) | PlanesModule: onClick {() => setCreateOpen(true)} | apps/frontend/src/features/planes/planes-module.tsx:392 |
| "Puedes buscar por: Nombre, Precio" (TextField) | PlanesModule: onChange {(event) => { setQuery(event.target.value); setPage(1); }} | apps/frontend/src/features/planes/planes-module.tsx:397 |
| "Búsqueda avanzada" (Button) | PlanesModule: onClick {() => setAdvancedOpen((current) => !current)} | apps/frontend/src/features/planes/planes-module.tsx:398 |
| "Nombre" (TextField) | PlanesModule: onChange {(event) => { setQuery(event.target.value); setPage(1); }} | apps/frontend/src/features/planes/planes-module.tsx:402 |
| "Precio" (TextField) | PlanesModule: onChange {(event) => { setPriceQuery(event.target.value); setPage(1); }} | apps/frontend/src/features/planes/planes-module.tsx:402 |
| "Cantidad de planes por página" (Select) | PlanesModule: onChange {(event) => { setPageSize(Number(event.target.value)); setPage(1); }} | apps/frontend/src/features/planes/planes-module.tsx:409 |
| "Primera página" (IconButton) | PlanesModule: onClick {() => setPage(1)} | apps/frontend/src/features/planes/planes-module.tsx:411 |
| "Página anterior" (IconButton) | PlanesModule: onClick {() => setPage(1)} | apps/frontend/src/features/planes/planes-module.tsx:412 |
| {`Página ${item}`} (Button) | PlanesModule: onClick {() => setPage(item)} | apps/frontend/src/features/planes/planes-module.tsx:413 |
| "Página siguiente" (IconButton) | PlanesModule: onClick {() => setPage(totalPages)} | apps/frontend/src/features/planes/planes-module.tsx:414 |
| "Última página" (IconButton) | PlanesModule: onClick {() => setPage(totalPages)} | apps/frontend/src/features/planes/planes-module.tsx:415 |
| {detailVisible ? "Ocultar panel de detalle" : "Mostrar panel de detalle"} (IconButton) | PlanesModule: onClick {() => setDetailVisible((current) => !current)} | apps/frontend/src/features/planes/planes-module.tsx:418 |
| "Elegir columnas" (IconButton) | PlanesModule: onClick {openColumnMenu} | apps/frontend/src/features/planes/planes-module.tsx:419 |
| (dinámico) (Popover) | PlanesModule: onClose {() => setColumnMenuAnchor(null)} | apps/frontend/src/features/planes/planes-module.tsx:420 |
| (dinámico) (Switch) | PlanesModule: onChange {() => toggleColumn(key)} | apps/frontend/src/features/planes/planes-module.tsx:434 |
| (dinámico) (TableRow) | PlanesModule: onClick {() => setSelectedId(plan.id)}; onKeyDown {(event) => { if (event.key === "Enter" \|\| event.key === " ") { event.preventDefault(); setSelectedId(plan.id); } }} | apps/frontend/src/features/planes/planes-module.tsx:453 |
| {`Mostrar detalles de ${plan.name}`} (IconButton) | PlanesModule: onClick {(event) => { event.stopPropagation(); setSelectedId(plan.id); }} | apps/frontend/src/features/planes/planes-module.tsx:461 |
| (dinámico) (CreatePlanDialog) | PlanesModule: onClose {() => setCreateOpen(false)}; onCreate {createPlan} | apps/frontend/src/features/planes/planes-module.tsx:473 |
| "Abrir ayuda" (IconButton) | PlanesModule: onClick {() => setMessage("Ayuda de Planes en la demostración local.")} | apps/frontend/src/features/planes/planes-module.tsx:475 |
| (dinámico) (Snackbar) | PlanesModule: onClose {() => setMessage("")} | apps/frontend/src/features/planes/planes-module.tsx:476 |

## servidores

| Control | Evento / handler | Fuente |
|---|---|---|
| Configuración segura (Button) | MikrotikMonitor: onClick {() => setGuideOpen(true)} | apps/frontend/src/features/servidores/mikrotik-monitor.tsx:73 |
| Actualizar ahora (Button) | MikrotikMonitor: onClick {() => void loadTelemetry()} | apps/frontend/src/features/servidores/mikrotik-monitor.tsx:73 |
| (dinámico) (Dialog) | MikrotikMonitor: onClose {() => setGuideOpen(false)} | apps/frontend/src/features/servidores/mikrotik-monitor.tsx:76 |
| Entendido (Button) | MikrotikMonitor: onClick {() => setGuideOpen(false)} | apps/frontend/src/features/servidores/mikrotik-monitor.tsx:76 |
| "Tipo de servidor" (Tabs) | ServidoresModule: onChange {(_, value) => setView(value)} | apps/frontend/src/features/servidores/servidores-module.tsx:51 |

## sitio-web

| Control | Evento / handler | Fuente |
|---|---|---|
| Reintentar publicación (Button) | recoveryAction: onClick {askToPublish} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:153 |
| (dinámico) (Button) | recoveryAction: onClick {reload} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:155 |
| (dinámico) (Alert) | SitioWebModule: onClose {() => setSuccess("")} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:171 |
| "Editor del sitio" (Tabs) | SitioWebModule: onChange {(_, value: number) => setTab(value)} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:175 |
| (dinámico) (Button) | SitioWebModule: onClick {reload} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:179 |
| (dinámico) (Button) | SitioWebModule: onClick {askToPublish} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:179 |
| (dinámico) (Button) | SitioWebModule: onClick {askToPublish} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:185 |
| (dinámico) (CmcPublicThemeEditor) | SitioWebModule: onPublish {askToPublish} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:189 |
| (dinámico) (Dialog) | SitioWebModule: onClose {() => setDialog(null)} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:192 |
| Cancelar (Button) | SitioWebModule: onClick {() => setDialog(null)} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:195 |
| (dinámico) (Button) | SitioWebModule: onClick {confirm} | apps/frontend/src/features/sitio-web/sitio-web-module.tsx:195 |
| (dinámico) (button) | CmcPublicThemeEditor: onClick {() => choose(preset)} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:41 |
| {label} (input) | CmcPublicThemeEditor: onChange {event => changeColor(key as keyof SiteTheme["colors"],event.target.value)} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:47 |
| (dinámico) (textarea) | CmcPublicThemeEditor: onChange {event => mutateSite(draft => { draft.settings.seasonalPromotions[theme.id] = { ...promotion, [key]:event.target.value }; })} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:51 |
| (dinámico) (input) | CmcPublicThemeEditor: onChange {event => mutateSite(draft => { draft.settings.seasonalPromotions[theme.id] = { ...promotion, [key]:event.target.value }; })} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:51 |
| Previsualizar paleta (button) | CmcPublicThemeEditor: onClick {preview} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:55 |
| (dinámico) (button) | CmcPublicThemeEditor: onClick {publish} | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:55 |
| "Marca" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.brand = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Razón social" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.legalName = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "RFC" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.rfc = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "WhatsApp (con código de país)" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.whatsapp = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Correo general" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.email = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Correo de soporte" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.supportEmail = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Domicilio" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.address = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Horario entre semana" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.hours.weekdays = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Horario de sábado" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.hours.saturday = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Teléfonos de soporte (uno por línea)" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.general.support = e.target.value.split("\n"); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Teléfonos de pagos" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.general.payments = e.target.value.split("\n"); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Teléfonos de ventas" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.company.general.sales = e.target.value.split("\n"); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:13 |
| "Etiqueta de cobertura" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.coverageKicker = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Título de cobertura" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.coverageTitle = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Introducción de cobertura" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.coverageLead = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Introducción de servicios" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.servicesLead = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Introducción de planes" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.plansLead = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| {`Eliminar diapositiva ${index + 1}`} (button) | ContentEditor: onClick {() => mutateSite((d) => { d.settings.heroSlides.splice(index, 1); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Antetítulo" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].eyebrow = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Título" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].title = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Texto destacado" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].emphasis = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Descripción" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].copy = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Imagen" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].image = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Descripción accesible de la imagen" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].imageAlt = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Distintivo" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.heroSlides[index].badge = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| Agregar diapositiva (button) | ContentEditor: onClick {() => mutateSite((d) => { d.settings.heroSlides.push(structuredClone(d.settings.heroSlides.at(-1)!)); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:15 |
| "Misión" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.corporateIdentity.mission = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| "Visión" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.corporateIdentity.vision = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| {`Eliminar valor ${index + 1}`} (button) | ContentEditor: onClick {() => mutateSite((d) => { if (d.settings.corporateIdentity.values.length > 1) d.settings.corporateIdentity.values.splice(index, 1); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| "Nombre" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.corporateIdentity.values[index].title = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| "Descripción" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.settings.corporateIdentity.values[index].description = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| Agregar valor (button) | ContentEditor: onClick {() => mutateSite((d) => { d.settings.corporateIdentity.values.push({ title: "Nuevo valor", description: "Describe cómo se aplica este principio en CometaLink." }); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:17 |
| {`Eliminar plan ${index + 1}`} (button) | ContentEditor: onClick {() => mutateSite((d) => { if (d.plans.length > 1) d.plans.splice(index, 1); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Nombre" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].name = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Identificador" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].id = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Velocidad Mbps" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].speed = Number(e.target.value); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Mensualidad MXN" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].price = Number(e.target.value); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Descripción para streaming" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].streaming = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Descripción para videojuegos" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].gaming = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Frase comercial" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].tagline = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Características (una por línea)" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].features = e.target.value.split("\n"); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| (dinámico) (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.plans[index].popular = e.target.checked; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| Agregar plan (button) | ContentEditor: onClick {() => mutateSite((d) => { d.plans.push({ id: `plan-${crypto.randomUUID().slice(0, 8)}`, name: "Nuevo plan", speed: 50, price: 0, tagline: "", popular: false, features: ["Velocidad simétrica"], streaming: "", gaming: ""  | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Nombre" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].name = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Municipio" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].municipality = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Código postal" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].postalCode = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Latitud" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].lat = Number(e.target.value); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Longitud" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].lng = Number(e.target.value); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Radio" (input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.towers[index].radiusKm = Number(e.target.value); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Eliminar emisora" (button) | ContentEditor: onClick {() => mutateSite((d) => { if (d.towers.length > 1) d.towers.splice(index, 1); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| Agregar emisora (button) | ContentEditor: onClick {() => mutateSite((d) => { d.towers.push({ id: `torre-${crypto.randomUUID().slice(0, 8)}`, name: "Nueva emisora", municipality: "Teotihuacán", postalCode: "", lat: 19.689, lng: -98.88, radiusKm: 4 }); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| {`Eliminar pregunta ${index + 1}`} (button) | ContentEditor: onClick {() => mutateSite((d) => { d.faqs.splice(index, 1); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:23 |
| "Pregunta" (Input) | ContentEditor: onChange {(e) => mutateSite((d) => { d.faqs[index].question = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:23 |
| "Respuesta" (Textarea) | ContentEditor: onChange {(e) => mutateSite((d) => { d.faqs[index].answer = e.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:23 |
| Agregar pregunta (button) | ContentEditor: onClick {() => mutateSite((d) => { d.faqs.push({ question: "Nueva pregunta", answer: "Escribe aquí la respuesta." }); })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:23 |
| "Título del aviso" (Input) | ContentEditor: onChange {event => mutateSite(draft => { draft.settings.maintenance.title = event.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:24 |
| "Imagen del aviso" (Input) | ContentEditor: onChange {event => mutateSite(draft => { draft.settings.maintenance.image = event.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:24 |
| "Mensaje del aviso" (Textarea) | ContentEditor: onChange {event => mutateSite(draft => { draft.settings.maintenance.message = event.target.value; })} | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:24 |

## navegación

| Control | Evento / handler | Fuente |
|---|---|---|
| "Cerrar navegación" (IconButton) | NavigationContent: onClick {onCloseMobile} | apps/frontend/src/components/navigation/sidebar-navigation.tsx:65 |
| (dinámico) (Box) | NavigationContent: onClick {(event) => { if (module.slug === "facturacion" && pathname.startsWith("/facturacion")) { event.preventDefault(); setBillingOpen((open) => !open); return; } if (mobile) onCloseMobile?.(); }} | apps/frontend/src/components/navigation/sidebar-navigation.tsx:91 |
| (dinámico) (Box) | NavigationContent: onClick {mobile ? onCloseMobile : undefined} | apps/frontend/src/components/navigation/sidebar-navigation.tsx:135 |
| (dinámico) (Drawer) | SidebarNavigation: onClose {onCloseMobile} | apps/frontend/src/components/navigation/sidebar-navigation.tsx:180 |
| (dinámico) (NavigationContent) | SidebarNavigation: onCloseMobile {onCloseMobile} | apps/frontend/src/components/navigation/sidebar-navigation.tsx:191 |
| {navigationExpanded ? "Contraer navegación de módulos" : "Expandir navegación de módulos"} (IconButton) | TopNavbar: onClick {onNavigationAction} | apps/frontend/src/components/navigation/top-navbar.tsx:35 |
| {`Cuenta de ${identity.user.name}`} (Button) | UserIdentity: onClick {event => setAnchor(event.currentTarget)} | apps/frontend/src/components/navigation/user-identity.tsx:27 |
| (dinámico) (Menu) | UserIdentity: onClose {() => { if (!busy) setAnchor(null); }} | apps/frontend/src/components/navigation/user-identity.tsx:34 |
| Seguridad de mi cuenta (MenuItem) | UserIdentity: onClick {() => setAnchor(null)} | apps/frontend/src/components/navigation/user-identity.tsx:36 |
| (dinámico) (MenuItem) | UserIdentity: onClick {logout} | apps/frontend/src/components/navigation/user-identity.tsx:37 |
| (dinámico) (TopNavbar) | ErpShell: onNavigationAction {handleNavigationAction} | apps/frontend/src/components/layout/erp-shell.tsx:47 |
| (dinámico) (SidebarNavigation) | ErpShell: onCloseMobile {() => setMobileOpen(false)} | apps/frontend/src/components/layout/erp-shell.tsx:52 |

## Campos

| Campo | Componente | Fuente |
|---|---|---|
| "nombre@empresa.com" | input | apps/frontend/src/features/acceso/access-screen.tsx:67 |
| "Ingresa tu contraseña" | input | apps/frontend/src/features/acceso/access-screen.tsx:68 |
| {backup ? "Tu código de un solo uso" : "000000"} | input | apps/frontend/src/features/acceso/access-screen.tsx:71 |
| (dinámico) | input | apps/frontend/src/features/acceso/recovery-screen.tsx:58 |
| (dinámico) | input | apps/frontend/src/features/acceso/recovery-screen.tsx:59 |
| "nombre@empresa.com" | input | apps/frontend/src/features/acceso/recovery-screen.tsx:60 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:98 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:99 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:100 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:107 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:111 |
| "Códigos de recuperación de un solo uso" | textarea | apps/frontend/src/features/acceso/security-screen.tsx:113 |
| Guardé mis códigos en un lugar privado. | input | apps/frontend/src/features/acceso/security-screen.tsx:113 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:118 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:119 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:120 |
| (dinámico) | input | apps/frontend/src/features/acceso/security-screen.tsx:120 |
| "Nombre o razón social" | TextField | apps/frontend/src/features/clientes/customer-dialogs.tsx:53 |
| "Correo de contacto" | TextField | apps/frontend/src/features/clientes/customer-dialogs.tsx:54 |
| "Teléfono celular" | TextField | apps/frontend/src/features/clientes/customer-dialogs.tsx:55 |
| "Dirección" | TextField | apps/frontend/src/features/clientes/customer-dialogs.tsx:56 |
| "Colonia" | TextField | apps/frontend/src/features/clientes/customer-dialogs.tsx:57 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-dialogs.tsx:59 |
| "Tipo de persona" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:129 |
| "Nombre" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:130 |
| "Primer nombre" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:131 |
| "Segundo nombre" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:132 |
| "Primer apellido" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:133 |
| "Segundo apellido" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:134 |
| "Documento o Cédula de identidad" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:135 |
| "ID Cliente" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:136 |
| "Teléfono" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:155 |
| "Teléfono móvil" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:156 |
| "E-mail de contacto" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:157 |
| "Observaciones" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:158 |
| "Vendedor" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:159 |
| "Recaudador" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:160 |
| "Ingresar dirección" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:166 |
| "Latitud" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:168 |
| "Longitud" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:169 |
| "Calle" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:191 |
| "Número" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:192 |
| "Barrio / Colonia" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:193 |
| "Zona" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:194 |
| "Estado" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:195 |
| "Ciudad" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:196 |
| "Dato adicional" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:197 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-form-dialog.tsx:207 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-form-dialog.tsx:208 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-form-dialog.tsx:209 |
| "Razón social" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:212 |
| "Tipo de factura" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:213 |
| "Tipo de persona" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:214 |
| "Régimen" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:215 |
| "Nombre / Razón social" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:216 |
| "Ciclo de facturación comienza el día" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:217 |
| "Código postal" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:218 |
| "RFC" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:219 |
| "Método de pago" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:224 |
| "Forma de pago" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:225 |
| "Información adicional" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:226 |
| "Información adicional 2" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:227 |
| "Uso de CFDI" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:228 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-form-dialog.tsx:229 |
| (dinámico) | Switch | apps/frontend/src/features/clientes/customer-form-dialog.tsx:230 |
| "Emails a notificar" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:231 |
| "Pasarela asignada" | TextField | apps/frontend/src/features/clientes/customer-form-dialog.tsx:241 |
| (dinámico) | input | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:71 |
| "Título" | TextField | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Categoría" | TextField | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Prioridad" | TextField | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Contrato" | TextField | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Descripción" | TextField | apps/frontend/src/features/clientes/customer-operational-dialogs.tsx:104 |
| "Puedes buscar por: Nombre, E-mail, Teléfono fijo, Documento o Cédula, Teléfono celular, Dirección, ID Cliente personalizable, Dirección IP" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:64 |
| "Nombre y apellido" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:90 |
| "E-mail de contacto" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:91 |
| "Teléfono fijo" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:92 |
| "Documento o Cédula" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:93 |
| "Teléfono celular" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:94 |
| "Dirección" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:95 |
| "ID Cliente personalizable" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:96 |
| "Dirección IP" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:97 |
| "Tipo de persona" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:98 |
| "Plan" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:101 |
| "Servidor" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:102 |
| "Facturación" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:103 |
| "Estado de cuenta" | TextField | apps/frontend/src/features/clientes/customer-toolbar.tsx:104 |
| (dinámico) | Checkbox | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:75 |
| {field.label} | TextField | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:76 |
| {field.label} | TextField | apps/frontend/src/features/contratos/contract-bulk-dialog.tsx:76 |
| "Identificador" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:101 |
| "Condición" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:110 |
| "Valor" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:114 |
| "Valor" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:115 |
| "Valor" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:117 |
| "Valor" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:119 |
| "Filtros guardados" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:210 |
| "Nombre del filtro" | TextField | apps/frontend/src/features/contratos/contract-filters-dialog.tsx:213 |
| "Cliente" | TextField | apps/frontend/src/features/contratos/contract-form-basic.tsx:22 |
| "Artículos" | TextField | apps/frontend/src/features/contratos/contract-form-basic.tsx:31 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-basic.tsx:32 |
| {label} | TextField | apps/frontend/src/features/contratos/contract-form-billing.tsx:39 |
| "Descripción" | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:28 |
| "Tipo" | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:29 |
| {discount.type === "Porcentaje" ? "Porcentaje" : "Importe"} | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:30 |
| "Artículo" | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:43 |
| "Cantidad" | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:44 |
| "Importe unitario" | TextField | apps/frontend/src/features/contratos/contract-form-charges.tsx:45 |
| {label} | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:24 |
| "Ubicación" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:25 |
| "Latitud" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:27 |
| "Longitud" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:28 |
| "Saldo" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:37 |
| "Facturas pendientes" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:38 |
| "Facturación" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:39 |
| "Contratos del cliente" | TextField | apps/frontend/src/features/contratos/contract-form-customer.tsx:40 |
| {label} | TextField | apps/frontend/src/features/contratos/contract-form-fields.tsx:23 |
| {label} | TextField | apps/frontend/src/features/contratos/contract-form-fields.tsx:34 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-olt.tsx:12 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-olt.tsx:13 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-olt.tsx:26 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-olt.tsx:27 |
| (dinámico) | Switch | apps/frontend/src/features/contratos/contract-form-olt.tsx:28 |
| (dinámico) | input | apps/frontend/src/features/contratos/contract-import-dialog.tsx:77 |
| "Dirección CPE" | TextField | apps/frontend/src/features/contratos/contract-inspection-dialog.tsx:53 |
| (dinámico) | Checkbox | apps/frontend/src/features/contratos/contract-list.tsx:73 |
| (dinámico) | Checkbox | apps/frontend/src/features/contratos/contract-list.tsx:75 |
| "Canal" | TextField | apps/frontend/src/features/contratos/contract-selection-bar.tsx:27 |
| "Mensaje" | TextField | apps/frontend/src/features/contratos/contract-selection-bar.tsx:30 |
| "Estado" | TextField | apps/frontend/src/features/contratos/contract-status-select.tsx:12 |
| "Buscar por" | TextField | apps/frontend/src/features/contratos/contract-toolbar.tsx:34 |
| {searchLabels[props.searchMode]} | TextField | apps/frontend/src/features/contratos/contract-toolbar.tsx:37 |
| (dinámico) | Checkbox | apps/frontend/src/features/contratos/contract-toolbar.tsx:47 |
| {placeholder} | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:241 |
| "Nombre del cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:966 |
| "Número de factura" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:972 |
| "Estado" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:973 |
| "Documento o Cédula de identidad" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:988 |
| "Facturas creadas desde" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:989 |
| "Facturas creadas hasta" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:995 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:1040 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:1082 |
| "Cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1248 |
| "Número de factura" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1254 |
| "Emitidas desde" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1255 |
| "Cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1464 |
| "Recolectado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1470 |
| "Registrado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1479 |
| "Buscar por nombre de cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1713 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:1753 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:1769 |
| "Tipo" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1835 |
| "Válidas hasta" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1840 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:1847 |
| { searchCriterion === "client" ? "Nombre del cliente" : "Número de factura" } | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:1946 |
| "Seleccionar identificador del filtro" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2090 |
| "Seleccionar valor del filtro" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2108 |
| "Puedes buscar por: ID y Creador" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2217 |
| "ID de arqueo" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2329 |
| "Creado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2330 |
| "Desde" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2331 |
| "Hasta" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2337 |
| "Cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2405 |
| "Número de factura" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2411 |
| "Estado" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2418 |
| "Cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2665 |
| "Recolectado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2671 |
| "Registrado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2687 |
| "Buscar por nombre de cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:2966 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:3047 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:3074 |
| "Tipo" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3164 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:3177 |
| "Puedes buscar por: ID y Creador" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3240 |
| "ID de arqueo" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3368 |
| "Creado por" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3375 |
| "Cliente" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3493 |
| "Contrato" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3504 |
| "Fecha de emisión" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3512 |
| "Fecha de vencimiento" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3518 |
| "Tipo de factura" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3524 |
| "Forma de pago" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3532 |
| "Concepto" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3547 |
| "Monto" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3553 |
| "Descripción" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3566 |
| "Método de pago" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3582 |
| "Referencia externa" | TextField | apps/frontend/src/features/facturacion/facturacion-module.tsx:3588 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:3590 |
| (dinámico) | Checkbox | apps/frontend/src/features/facturacion/facturacion-module.tsx:3594 |
| "Código, serie, MAC, marca o modelo" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:355 |
| "Distribuidor, nodo, empleado, almacén o cliente" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:362 |
| "Cambiar estado a" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:390 |
| (dinámico) | Checkbox | apps/frontend/src/features/inventario/inventory-workbench.tsx:416 |
| (dinámico) | Checkbox | apps/frontend/src/features/inventario/inventory-workbench.tsx:425 |
| {config.searchPlaceholder} | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:647 |
| "Estado" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:653 |
| "Creado desde" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:654 |
| Seleccionar imagen | input | apps/frontend/src/features/inventario/inventory-workbench.tsx:737 |
| {label} | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:746 |
| {label} | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:752 |
| "Almacén" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:798 |
| "Distribuidor" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:801 |
| "Código de producto" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:808 |
| "Número de serie" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:809 |
| "MAC address" | TextField | apps/frontend/src/features/inventario/inventory-workbench.tsx:810 |
| "Nombre" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:304 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:304 |
| "Máx. Subida" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:307 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:307 |
| "Unidad de subida" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:308 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:308 |
| "Máx. Bajada" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:309 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:309 |
| "Unidad de bajada" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:310 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:310 |
| (dinámico) | Checkbox | apps/frontend/src/features/planes/planes-module.tsx:315 |
| "Precio" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:319 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:319 |
| "Estrategia de ancho de banda" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:325 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:325 |
| "Ráfagas habilitadas" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:326 |
| "Código de producto" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:332 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:332 |
| "Código de producto interes primer vencimiento" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:333 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:333 |
| "Código de producto interés segundo vencimiento" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:334 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:334 |
| "Código de producto cargo por reconexión" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:335 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:335 |
| "Código de producto de instalación" | WisproField | apps/frontend/src/features/planes/planes-module.tsx:336 |
| (dinámico) | TextField | apps/frontend/src/features/planes/planes-module.tsx:336 |
| "Puedes buscar por: Nombre, Precio" | TextField | apps/frontend/src/features/planes/planes-module.tsx:397 |
| "Nombre" | TextField | apps/frontend/src/features/planes/planes-module.tsx:402 |
| "Precio" | TextField | apps/frontend/src/features/planes/planes-module.tsx:402 |
| "Cantidad de planes por página" | Select | apps/frontend/src/features/planes/planes-module.tsx:409 |
| (dinámico) | Switch | apps/frontend/src/features/planes/planes-module.tsx:434 |
| {label} | input | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:47 |
| (dinámico) | textarea | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:51 |
| (dinámico) | input | apps/frontend/src/features/sitio-web/vendor/CmcPublicThemeEditor.tsx:51 |
| (dinámico) | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:10 |
| (dinámico) | textarea | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:11 |
| (dinámico) | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:19 |
| "Nombre" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Municipio" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Código postal" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Latitud" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Longitud" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |
| "Radio" | input | apps/frontend/src/features/sitio-web/vendor/ContentEditor.tsx:21 |