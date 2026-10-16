# Modelo PostgreSQL actual de ComeCore

Generado del catálogo real: 67 tablas, 217 claves foráneas. No contiene registros de negocio ni secretos.

## Cardinalidades

- **authn.user → iam.app_users: 1:1** (vínculo opcional). FK `app_users_external_auth_fk`; external_auth_id → id.
- **iam.organizations → iam.organization_memberships: 1:N** (vínculo obligatorio). FK `organization_memberships_organization_id_fkey`; organization_id → id.
- **iam.app_users → iam.organization_memberships: 1:N** (vínculo obligatorio). FK `organization_memberships_user_id_fkey`; user_id → id.
- **iam.app_users → crm.customers: 1:N** (vínculo opcional). FK `customers_created_by_fkey`; created_by → id.
- **iam.organizations → crm.customers: 1:N** (vínculo obligatorio). FK `customers_organization_id_fkey`; organization_id → id.
- **iam.app_users → crm.customers: 1:N** (vínculo opcional). FK `customers_updated_by_fkey`; updated_by → id.
- **crm.customers → crm.customer_contacts: 1:1** (vínculo obligatorio). FK `customer_contacts_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_addresses: 1:N** (vínculo obligatorio). FK `customer_addresses_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_billing_profiles: 1:1** (vínculo obligatorio). FK `customer_billing_profiles_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_accounts: 1:1** (vínculo obligatorio). FK `customer_accounts_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_assignments: 1:1** (vínculo obligatorio). FK `customer_assignments_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_devices: 1:N** (vínculo obligatorio). FK `customer_devices_customer_fk`; organization_id, customer_id → organization_id, id.
- **crm.customers → crm.customer_payment_gateways: 1:N** (vínculo obligatorio). FK `customer_payment_gateways_customer_fk`; organization_id, customer_id → organization_id, id.
- **iam.app_users → audit.customer_events: 1:N** (vínculo opcional). FK `customer_events_actor_user_id_fkey`; actor_user_id → id.
- **crm.customers → audit.customer_events: 1:N** (vínculo opcional). FK `customer_events_customer_id_fkey`; customer_id → id.
- **iam.organizations → audit.customer_events: 1:N** (vínculo obligatorio). FK `customer_events_organization_id_fkey`; organization_id → id.
- **authn.user → authn.session: 1:N** (vínculo obligatorio). FK `session_userId_fkey`; userId → id.
- **authn.user → authn.account: 1:N** (vínculo obligatorio). FK `account_userId_fkey`; userId → id.
- **authn.user → authn.twoFactor: 1:1** (vínculo obligatorio). FK `twoFactor_userId_fkey`; userId → id.
- **authn.user → security.account_flags: 1:1** (vínculo obligatorio). FK `account_flags_user_id_fkey`; user_id → id.
- **authn.session → security.session_assurance: 1:1** (vínculo obligatorio). FK `session_assurance_session_id_fkey`; session_id → id.
- **authn.user → security.factor_replays: 1:N** (vínculo obligatorio). FK `factor_replays_user_id_fkey`; user_id → id.
- **authn.user → security.events: 1:N** (vínculo opcional). FK `events_actor_id_fkey`; actor_id → id.
- **iam.organizations → erp.customer_workspaces: 1:1** (vínculo obligatorio). FK `customer_workspaces_organization_id_fkey`; organization_id → id.
- **iam.app_users → audit.erp_events: 1:N** (vínculo opcional). FK `erp_events_actor_user_id_fkey`; actor_user_id → id.
- **iam.organizations → audit.erp_events: 1:N** (vínculo obligatorio). FK `erp_events_organization_id_fkey`; organization_id → id.
- **iam.app_users → catalog.service_plans: 1:N** (vínculo opcional). FK `service_plans_created_by_fkey`; created_by → id.
- **iam.organizations → catalog.service_plans: 1:N** (vínculo obligatorio). FK `service_plans_organization_id_fkey`; organization_id → id.
- **iam.app_users → catalog.service_plans: 1:N** (vínculo opcional). FK `service_plans_updated_by_fkey`; updated_by → id.
- **iam.app_users → catalog.plan_bursts: 1:N** (vínculo opcional). FK `plan_bursts_created_by_fkey`; created_by → id.
- **iam.organizations → catalog.plan_bursts: 1:N** (vínculo obligatorio). FK `plan_bursts_organization_id_fkey`; organization_id → id.
- **catalog.service_plans → catalog.plan_bursts: 1:N** (vínculo obligatorio). FK `plan_bursts_organization_id_plan_id_fkey`; organization_id, plan_id → organization_id, id.
- **iam.app_users → catalog.plan_bursts: 1:N** (vínculo opcional). FK `plan_bursts_updated_by_fkey`; updated_by → id.
- **iam.app_users → catalog.plan_product_codes: 1:N** (vínculo opcional). FK `plan_product_codes_created_by_fkey`; created_by → id.
- **iam.organizations → catalog.plan_product_codes: 1:N** (vínculo obligatorio). FK `plan_product_codes_organization_id_fkey`; organization_id → id.
- **catalog.service_plans → catalog.plan_product_codes: 1:N** (vínculo obligatorio). FK `plan_product_codes_organization_id_plan_id_fkey`; organization_id, plan_id → organization_id, id.
- **iam.app_users → catalog.plan_product_codes: 1:N** (vínculo opcional). FK `plan_product_codes_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.servers: 1:N** (vínculo opcional). FK `servers_created_by_fkey`; created_by → id.
- **iam.organizations → network.servers: 1:N** (vínculo obligatorio). FK `servers_organization_id_fkey`; organization_id → id.
- **iam.app_users → network.servers: 1:N** (vínculo opcional). FK `servers_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.server_interfaces: 1:N** (vínculo opcional). FK `server_interfaces_created_by_fkey`; created_by → id.
- **iam.organizations → network.server_interfaces: 1:N** (vínculo obligatorio). FK `server_interfaces_organization_id_fkey`; organization_id → id.
- **network.servers → network.server_interfaces: 1:N** (vínculo obligatorio). FK `server_interfaces_organization_id_server_id_fkey`; organization_id, server_id → organization_id, id.
- **iam.app_users → network.server_interfaces: 1:N** (vínculo opcional). FK `server_interfaces_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.nodes: 1:N** (vínculo opcional). FK `nodes_created_by_fkey`; created_by → id.
- **iam.organizations → network.nodes: 1:N** (vínculo obligatorio). FK `nodes_organization_id_fkey`; organization_id → id.
- **iam.app_users → network.nodes: 1:N** (vínculo opcional). FK `nodes_updated_by_fkey`; updated_by → id.
- **inventory.assets → network.node_coverages: 1:N** (vínculo opcional). FK `coverage_asset_fk`; organization_id, asset_id → organization_id, id.
- **iam.app_users → network.node_coverages: 1:N** (vínculo opcional). FK `node_coverages_created_by_fkey`; created_by → id.
- **iam.organizations → network.node_coverages: 1:N** (vínculo obligatorio). FK `node_coverages_organization_id_fkey`; organization_id → id.
- **network.nodes → network.node_coverages: 1:N** (vínculo obligatorio). FK `node_coverages_organization_id_node_id_fkey`; organization_id, node_id → organization_id, id.
- **iam.app_users → network.node_coverages: 1:N** (vínculo opcional). FK `node_coverages_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.olts: 1:N** (vínculo opcional). FK `olts_created_by_fkey`; created_by → id.
- **iam.organizations → network.olts: 1:N** (vínculo obligatorio). FK `olts_organization_id_fkey`; organization_id → id.
- **network.servers → network.olts: 1:N** (vínculo opcional). FK `olts_organization_id_server_id_fkey`; organization_id, server_id → organization_id, id.
- **iam.app_users → network.olts: 1:N** (vínculo opcional). FK `olts_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.olt_ports: 1:N** (vínculo opcional). FK `olt_ports_created_by_fkey`; created_by → id.
- **iam.organizations → network.olt_ports: 1:N** (vínculo obligatorio). FK `olt_ports_organization_id_fkey`; organization_id → id.
- **network.olts → network.olt_ports: 1:N** (vínculo obligatorio). FK `olt_ports_organization_id_olt_id_fkey`; organization_id, olt_id → organization_id, id.
- **iam.app_users → network.olt_ports: 1:N** (vínculo opcional). FK `olt_ports_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.naps: 1:N** (vínculo opcional). FK `naps_created_by_fkey`; created_by → id.
- **iam.organizations → network.naps: 1:N** (vínculo obligatorio). FK `naps_organization_id_fkey`; organization_id → id.
- **network.olts → network.naps: 1:N** (vínculo obligatorio). FK `naps_organization_id_olt_id_fkey`; organization_id, olt_id → organization_id, id.
- **iam.app_users → network.naps: 1:N** (vínculo opcional). FK `naps_updated_by_fkey`; updated_by → id.
- **iam.app_users → network.nap_ports: 1:N** (vínculo opcional). FK `nap_ports_created_by_fkey`; created_by → id.
- **iam.organizations → network.nap_ports: 1:N** (vínculo obligatorio). FK `nap_ports_organization_id_fkey`; organization_id → id.
- **network.naps → network.nap_ports: 1:N** (vínculo obligatorio). FK `nap_ports_organization_id_nap_id_fkey`; organization_id, nap_id → organization_id, id.
- **iam.app_users → network.nap_ports: 1:N** (vínculo opcional). FK `nap_ports_updated_by_fkey`; updated_by → id.
- **iam.app_users → inventory.equipment_models: 1:N** (vínculo opcional). FK `equipment_models_created_by_fkey`; created_by → id.
- **iam.organizations → inventory.equipment_models: 1:N** (vínculo obligatorio). FK `equipment_models_organization_id_fkey`; organization_id → id.
- **iam.app_users → inventory.equipment_models: 1:N** (vínculo opcional). FK `equipment_models_updated_by_fkey`; updated_by → id.
- **iam.app_users → inventory.warehouses: 1:N** (vínculo opcional). FK `warehouses_created_by_fkey`; created_by → id.
- **iam.organizations → inventory.warehouses: 1:N** (vínculo obligatorio). FK `warehouses_organization_id_fkey`; organization_id → id.
- **iam.app_users → inventory.warehouses: 1:N** (vínculo opcional). FK `warehouses_updated_by_fkey`; updated_by → id.
- **iam.app_users → inventory.suppliers: 1:N** (vínculo opcional). FK `suppliers_created_by_fkey`; created_by → id.
- **iam.organizations → inventory.suppliers: 1:N** (vínculo obligatorio). FK `suppliers_organization_id_fkey`; organization_id → id.
- **iam.app_users → inventory.suppliers: 1:N** (vínculo opcional). FK `suppliers_updated_by_fkey`; updated_by → id.
- **iam.app_users → inventory.stock_levels: 1:N** (vínculo opcional). FK `stock_levels_created_by_fkey`; created_by → id.
- **iam.organizations → inventory.stock_levels: 1:N** (vínculo obligatorio). FK `stock_levels_organization_id_fkey`; organization_id → id.
- **inventory.equipment_models → inventory.stock_levels: 1:N** (vínculo obligatorio). FK `stock_levels_organization_id_model_id_fkey`; organization_id, model_id → organization_id, id.
- **inventory.warehouses → inventory.stock_levels: 1:N** (vínculo obligatorio). FK `stock_levels_organization_id_warehouse_id_fkey`; organization_id, warehouse_id → organization_id, id.
- **iam.app_users → inventory.stock_levels: 1:N** (vínculo opcional). FK `stock_levels_updated_by_fkey`; updated_by → id.
- **iam.app_users → inventory.assets: 1:N** (vínculo opcional). FK `assets_created_by_fkey`; created_by → id.
- **iam.organization_memberships → inventory.assets: 1:N** (vínculo opcional). FK `assets_employee_membership_fk`; organization_id, employee_id → organization_id, user_id.
- **network.nodes → inventory.assets: 1:N** (vínculo opcional). FK `assets_node_fk`; organization_id, node_id → organization_id, id.
- **crm.customers → inventory.assets: 1:N** (vínculo opcional). FK `assets_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → inventory.assets: 1:N** (vínculo obligatorio). FK `assets_organization_id_fkey`; organization_id → id.
- **inventory.equipment_models → inventory.assets: 1:N** (vínculo obligatorio). FK `assets_organization_id_model_id_fkey`; organization_id, model_id → organization_id, id.
- **inventory.suppliers → inventory.assets: 1:N** (vínculo opcional). FK `assets_organization_id_supplier_id_fkey`; organization_id, supplier_id → organization_id, id.
- **inventory.warehouses → inventory.assets: 1:N** (vínculo opcional). FK `assets_organization_id_warehouse_id_fkey`; organization_id, warehouse_id → organization_id, id.
- **iam.app_users → inventory.assets: 1:N** (vínculo opcional). FK `assets_updated_by_fkey`; updated_by → id.
- **inventory.assets → inventory.stock_movements: 1:N** (vínculo opcional). FK `stock_movements_asset_model_fk`; organization_id, asset_id, model_id → organization_id, id, model_id.
- **iam.app_users → inventory.stock_movements: 1:N** (vínculo opcional). FK `stock_movements_created_by_fkey`; created_by → id.
- **iam.organizations → inventory.stock_movements: 1:N** (vínculo obligatorio). FK `stock_movements_organization_id_fkey`; organization_id → id.
- **inventory.equipment_models → inventory.stock_movements: 1:N** (vínculo obligatorio). FK `stock_movements_organization_id_model_id_fkey`; organization_id, model_id → organization_id, id.
- **inventory.suppliers → inventory.stock_movements: 1:N** (vínculo opcional). FK `stock_movements_organization_id_supplier_id_fkey`; organization_id, supplier_id → organization_id, id.
- **inventory.warehouses → inventory.stock_movements: 1:N** (vínculo obligatorio). FK `stock_movements_organization_id_warehouse_id_fkey`; organization_id, warehouse_id → organization_id, id.
- **iam.app_users → inventory.stock_movements: 1:N** (vínculo opcional). FK `stock_movements_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.legal_entities: 1:N** (vínculo opcional). FK `legal_entities_created_by_fkey`; created_by → id.
- **iam.organizations → billing.legal_entities: 1:N** (vínculo obligatorio). FK `legal_entities_organization_id_fkey`; organization_id → id.
- **iam.app_users → billing.legal_entities: 1:N** (vínculo opcional). FK `legal_entities_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.service_billing_profiles: 1:N** (vínculo opcional). FK `service_billing_profiles_created_by_fkey`; created_by → id.
- **iam.organizations → billing.service_billing_profiles: 1:N** (vínculo obligatorio). FK `service_billing_profiles_organization_id_fkey`; organization_id → id.
- **iam.app_users → billing.service_billing_profiles: 1:N** (vínculo opcional). FK `service_billing_profiles_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contracts: 1:N** (vínculo opcional). FK `contracts_created_by_fkey`; created_by → id.
- **billing.service_billing_profiles → service.contracts: 1:N** (vínculo opcional). FK `contracts_organization_id_billing_profile_id_fkey`; organization_id, billing_profile_id → organization_id, id.
- **crm.customers → service.contracts: 1:N** (vínculo obligatorio). FK `contracts_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → service.contracts: 1:N** (vínculo obligatorio). FK `contracts_organization_id_fkey`; organization_id → id.
- **billing.legal_entities → service.contracts: 1:N** (vínculo opcional). FK `contracts_organization_id_legal_entity_id_fkey`; organization_id, legal_entity_id → organization_id, id.
- **network.nodes → service.contracts: 1:N** (vínculo obligatorio). FK `contracts_organization_id_node_id_fkey`; organization_id, node_id → organization_id, id.
- **catalog.service_plans → service.contracts: 1:N** (vínculo obligatorio). FK `contracts_organization_id_plan_id_fkey`; organization_id, plan_id → organization_id, id.
- **network.servers → service.contracts: 1:N** (vínculo obligatorio). FK `contracts_organization_id_server_id_fkey`; organization_id, server_id → organization_id, id.
- **iam.app_users → service.contracts: 1:N** (vínculo opcional). FK `contracts_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contract_connections: 1:N** (vínculo opcional). FK `contract_connections_created_by_fkey`; created_by → id.
- **service.contracts → service.contract_connections: 1:1** (vínculo obligatorio). FK `contract_connections_organization_id_contract_id_server_id_fkey`; organization_id, contract_id, server_id → organization_id, id, server_id.
- **iam.organizations → service.contract_connections: 1:N** (vínculo obligatorio). FK `contract_connections_organization_id_fkey`; organization_id → id.
- **network.server_interfaces → service.contract_connections: 1:N** (vínculo obligatorio). FK `contract_connections_organization_id_interface_id_server_i_fkey`; organization_id, interface_id, server_id → organization_id, id, server_id.
- **iam.app_users → service.contract_connections: 1:N** (vínculo opcional). FK `contract_connections_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contract_olt_connections: 1:N** (vínculo opcional). FK `contract_olt_connections_created_by_fkey`; created_by → id.
- **service.contracts → service.contract_olt_connections: 1:1** (vínculo obligatorio). FK `contract_olt_connections_organization_id_contract_id_fkey`; organization_id, contract_id → organization_id, id.
- **iam.organizations → service.contract_olt_connections: 1:N** (vínculo obligatorio). FK `contract_olt_connections_organization_id_fkey`; organization_id → id.
- **network.naps → service.contract_olt_connections: 1:N** (vínculo opcional). FK `contract_olt_connections_organization_id_nap_id_olt_id_fkey`; organization_id, nap_id, olt_id → organization_id, id, olt_id.
- **network.nap_ports → service.contract_olt_connections: 1:N** (vínculo opcional). FK `contract_olt_connections_organization_id_nap_port_id_nap_i_fkey`; organization_id, nap_port_id, nap_id → organization_id, id, nap_id.
- **network.olts → service.contract_olt_connections: 1:N** (vínculo obligatorio). FK `contract_olt_connections_organization_id_olt_id_fkey`; organization_id, olt_id → organization_id, id.
- **network.olt_ports → service.contract_olt_connections: 1:N** (vínculo opcional). FK `contract_olt_connections_organization_id_olt_port_id_olt_i_fkey`; organization_id, olt_port_id, olt_id → organization_id, id, olt_id.
- **iam.app_users → service.contract_olt_connections: 1:N** (vínculo opcional). FK `contract_olt_connections_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contract_discounts: 1:N** (vínculo opcional). FK `contract_discounts_created_by_fkey`; created_by → id.
- **service.contracts → service.contract_discounts: 1:N** (vínculo obligatorio). FK `contract_discounts_organization_id_contract_id_fkey`; organization_id, contract_id → organization_id, id.
- **iam.organizations → service.contract_discounts: 1:N** (vínculo obligatorio). FK `contract_discounts_organization_id_fkey`; organization_id → id.
- **iam.app_users → service.contract_discounts: 1:N** (vínculo opcional). FK `contract_discounts_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contract_recurring_items: 1:N** (vínculo opcional). FK `contract_recurring_items_created_by_fkey`; created_by → id.
- **service.contracts → service.contract_recurring_items: 1:N** (vínculo obligatorio). FK `contract_recurring_items_organization_id_contract_id_fkey`; organization_id, contract_id → organization_id, id.
- **iam.organizations → service.contract_recurring_items: 1:N** (vínculo obligatorio). FK `contract_recurring_items_organization_id_fkey`; organization_id → id.
- **iam.app_users → service.contract_recurring_items: 1:N** (vínculo opcional). FK `contract_recurring_items_updated_by_fkey`; updated_by → id.
- **inventory.assets → service.contract_items: 1:N** (vínculo opcional). FK `contract_items_asset_customer_fk`; organization_id, asset_id, customer_id → organization_id, id, customer_id.
- **service.contracts → service.contract_items: 1:N** (vínculo obligatorio). FK `contract_items_contract_customer_fk`; organization_id, contract_id, customer_id → organization_id, id, customer_id.
- **iam.app_users → service.contract_items: 1:N** (vínculo opcional). FK `contract_items_created_by_fkey`; created_by → id.
- **inventory.assets → service.contract_items: 1:N** (vínculo opcional). FK `contract_items_organization_id_asset_id_fkey`; organization_id, asset_id → organization_id, id.
- **service.contracts → service.contract_items: 1:N** (vínculo obligatorio). FK `contract_items_organization_id_contract_id_fkey`; organization_id, contract_id → organization_id, id.
- **iam.organizations → service.contract_items: 1:N** (vínculo obligatorio). FK `contract_items_organization_id_fkey`; organization_id → id.
- **iam.app_users → service.contract_items: 1:N** (vínculo opcional). FK `contract_items_updated_by_fkey`; updated_by → id.
- **iam.app_users → service.contract_usage_samples: 1:N** (vínculo opcional). FK `contract_usage_samples_created_by_fkey`; created_by → id.
- **service.contracts → service.contract_usage_samples: 1:N** (vínculo obligatorio). FK `contract_usage_samples_organization_id_contract_id_fkey`; organization_id, contract_id → organization_id, id.
- **iam.organizations → service.contract_usage_samples: 1:N** (vínculo obligatorio). FK `contract_usage_samples_organization_id_fkey`; organization_id → id.
- **iam.app_users → service.contract_usage_samples: 1:N** (vínculo opcional). FK `contract_usage_samples_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.invoices: 1:N** (vínculo opcional). FK `invoices_created_by_fkey`; created_by → id.
- **service.contracts → billing.invoices: 1:N** (vínculo opcional). FK `invoices_organization_id_contract_id_customer_id_fkey`; organization_id, contract_id, customer_id → organization_id, id, customer_id.
- **crm.customers → billing.invoices: 1:N** (vínculo obligatorio). FK `invoices_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → billing.invoices: 1:N** (vínculo obligatorio). FK `invoices_organization_id_fkey`; organization_id → id.
- **billing.legal_entities → billing.invoices: 1:N** (vínculo obligatorio). FK `invoices_organization_id_legal_entity_id_fkey`; organization_id, legal_entity_id → organization_id, id.
- **iam.app_users → billing.invoices: 1:N** (vínculo opcional). FK `invoices_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.invoice_items: 1:N** (vínculo opcional). FK `invoice_items_created_by_fkey`; created_by → id.
- **iam.organizations → billing.invoice_items: 1:N** (vínculo obligatorio). FK `invoice_items_organization_id_fkey`; organization_id → id.
- **billing.invoices → billing.invoice_items: 1:N** (vínculo obligatorio). FK `invoice_items_organization_id_invoice_id_fkey`; organization_id, invoice_id → organization_id, id.
- **iam.app_users → billing.invoice_items: 1:N** (vínculo opcional). FK `invoice_items_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.credit_notes: 1:N** (vínculo opcional). FK `credit_notes_created_by_fkey`; created_by → id.
- **iam.organizations → billing.credit_notes: 1:N** (vínculo obligatorio). FK `credit_notes_organization_id_fkey`; organization_id → id.
- **billing.invoices → billing.credit_notes: 1:N** (vínculo obligatorio). FK `credit_notes_organization_id_invoice_id_fkey`; organization_id, invoice_id → organization_id, id.
- **iam.app_users → billing.credit_notes: 1:N** (vínculo opcional). FK `credit_notes_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.payments: 1:N** (vínculo opcional). FK `payments_created_by_fkey`; created_by → id.
- **iam.organization_memberships → billing.payments: 1:N** (vínculo opcional). FK `payments_organization_id_collector_user_id_fkey`; organization_id, collector_user_id → organization_id, user_id.
- **crm.customers → billing.payments: 1:N** (vínculo obligatorio). FK `payments_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → billing.payments: 1:N** (vínculo obligatorio). FK `payments_organization_id_fkey`; organization_id → id.
- **iam.app_users → billing.payments: 1:N** (vínculo opcional). FK `payments_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.payment_allocations: 1:N** (vínculo opcional). FK `payment_allocations_created_by_fkey`; created_by → id.
- **iam.organizations → billing.payment_allocations: 1:N** (vínculo obligatorio). FK `payment_allocations_organization_id_fkey`; organization_id → id.
- **billing.invoices → billing.payment_allocations: 1:N** (vínculo obligatorio). FK `payment_allocations_organization_id_invoice_id_customer_id_fkey`; organization_id, invoice_id, customer_id, currency → organization_id, id, customer_id, currency.
- **billing.payments → billing.payment_allocations: 1:N** (vínculo obligatorio). FK `payment_allocations_organization_id_payment_id_customer_id_fkey`; organization_id, payment_id, customer_id, currency → organization_id, id, customer_id, currency.
- **iam.app_users → billing.payment_allocations: 1:N** (vínculo opcional). FK `payment_allocations_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.payment_promises: 1:N** (vínculo opcional). FK `payment_promises_created_by_fkey`; created_by → id.
- **service.contracts → billing.payment_promises: 1:N** (vínculo opcional). FK `payment_promises_organization_id_contract_id_customer_id_fkey`; organization_id, contract_id, customer_id → organization_id, id, customer_id.
- **crm.customers → billing.payment_promises: 1:N** (vínculo obligatorio). FK `payment_promises_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → billing.payment_promises: 1:N** (vínculo obligatorio). FK `payment_promises_organization_id_fkey`; organization_id → id.
- **iam.app_users → billing.payment_promises: 1:N** (vínculo opcional). FK `payment_promises_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.payment_receipts: 1:N** (vínculo opcional). FK `payment_receipts_created_by_fkey`; created_by → id.
- **crm.customers → billing.payment_receipts: 1:N** (vínculo obligatorio). FK `payment_receipts_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → billing.payment_receipts: 1:N** (vínculo obligatorio). FK `payment_receipts_organization_id_fkey`; organization_id → id.
- **billing.payments → billing.payment_receipts: 1:N** (vínculo opcional). FK `payment_receipts_organization_id_payment_id_customer_id_fkey`; organization_id, payment_id, customer_id → organization_id, id, customer_id.
- **iam.app_users → billing.payment_receipts: 1:N** (vínculo opcional). FK `payment_receipts_updated_by_fkey`; updated_by → id.
- **documents.files → billing.payment_receipts: 1:N** (vínculo opcional). FK `receipt_file_purpose_fk`; organization_id, file_id, file_purpose → organization_id, id, purpose.
- **documents.files → billing.payment_receipts: 1:N** (vínculo opcional). FK `receipts_file_fk`; organization_id, file_id → organization_id, id.
- **billing.invoices → billing.payment_receipts: 1:N** (vínculo opcional). FK `receipts_invoice_customer_fk`; organization_id, invoice_id, customer_id → organization_id, id, customer_id.
- **iam.app_users → billing.cash_audits: 1:N** (vínculo opcional). FK `cash_audits_created_by_fkey`; created_by → id.
- **iam.organizations → billing.cash_audits: 1:N** (vínculo obligatorio). FK `cash_audits_organization_id_fkey`; organization_id → id.
- **iam.app_users → billing.cash_audits: 1:N** (vínculo opcional). FK `cash_audits_updated_by_fkey`; updated_by → id.
- **billing.cash_audits → billing.cash_audit_payments: 1:N** (vínculo obligatorio). FK `cash_audit_payments_audit_currency_fk`; organization_id, cash_audit_id, currency → organization_id, id, currency.
- **iam.app_users → billing.cash_audit_payments: 1:N** (vínculo opcional). FK `cash_audit_payments_created_by_fkey`; created_by → id.
- **iam.organizations → billing.cash_audit_payments: 1:N** (vínculo obligatorio). FK `cash_audit_payments_organization_id_fkey`; organization_id → id.
- **billing.payments → billing.cash_audit_payments: 1:N** (vínculo obligatorio). FK `cash_audit_payments_payment_currency_fk`; organization_id, payment_id, currency → organization_id, id, currency.
- **iam.app_users → billing.cash_audit_payments: 1:N** (vínculo opcional). FK `cash_audit_payments_updated_by_fkey`; updated_by → id.
- **iam.app_users → billing.ledger_entries: 1:N** (vínculo opcional). FK `ledger_entries_created_by_fkey`; created_by → id.
- **crm.customers → billing.ledger_entries: 1:N** (vínculo obligatorio). FK `ledger_entries_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → billing.ledger_entries: 1:N** (vínculo obligatorio). FK `ledger_entries_organization_id_fkey`; organization_id → id.
- **billing.invoices → billing.ledger_entries: 1:N** (vínculo opcional). FK `ledger_entries_organization_id_invoice_id_customer_id_curr_fkey`; organization_id, invoice_id, customer_id, currency → organization_id, id, customer_id, currency.
- **billing.payments → billing.ledger_entries: 1:N** (vínculo opcional). FK `ledger_entries_organization_id_payment_id_customer_id_curr_fkey`; organization_id, payment_id, customer_id, currency → organization_id, id, customer_id, currency.
- **iam.app_users → billing.ledger_entries: 1:N** (vínculo opcional). FK `ledger_entries_updated_by_fkey`; updated_by → id.
- **iam.app_users → support.tickets: 1:N** (vínculo opcional). FK `tickets_created_by_fkey`; created_by → id.
- **iam.organization_memberships → support.tickets: 1:N** (vínculo opcional). FK `tickets_organization_id_assigned_user_id_fkey`; organization_id, assigned_user_id → organization_id, user_id.
- **service.contracts → support.tickets: 1:N** (vínculo obligatorio). FK `tickets_organization_id_contract_id_customer_id_fkey`; organization_id, contract_id, customer_id → organization_id, id, customer_id.
- **crm.customers → support.tickets: 1:N** (vínculo obligatorio). FK `tickets_organization_id_customer_id_fkey`; organization_id, customer_id → organization_id, id.
- **iam.organizations → support.tickets: 1:N** (vínculo obligatorio). FK `tickets_organization_id_fkey`; organization_id → id.
- **iam.app_users → support.tickets: 1:N** (vínculo opcional). FK `tickets_updated_by_fkey`; updated_by → id.
- **iam.app_users → documents.files: 1:N** (vínculo opcional). FK `files_created_by_fkey`; created_by → id.
- **iam.organizations → documents.files: 1:N** (vínculo obligatorio). FK `files_organization_id_fkey`; organization_id → id.
- **iam.app_users → documents.files: 1:N** (vínculo opcional). FK `files_updated_by_fkey`; updated_by → id.
- **iam.app_users → cms.sites: 1:N** (vínculo opcional). FK `sites_created_by_fkey`; created_by → id.
- **iam.organizations → cms.sites: 1:N** (vínculo obligatorio). FK `sites_organization_id_fkey`; organization_id → id.
- **iam.app_users → cms.sites: 1:N** (vínculo opcional). FK `sites_updated_by_fkey`; updated_by → id.
- **iam.app_users → cms.revisions: 1:N** (vínculo opcional). FK `revisions_created_by_fkey`; created_by → id.
- **iam.organizations → cms.revisions: 1:N** (vínculo obligatorio). FK `revisions_organization_id_fkey`; organization_id → id.
- **cms.sites → cms.revisions: 1:N** (vínculo obligatorio). FK `revisions_organization_id_site_id_fkey`; organization_id, site_id → organization_id, id.
- **iam.app_users → cms.revisions: 1:N** (vínculo opcional). FK `revisions_updated_by_fkey`; updated_by → id.
- **iam.app_users → cms.publications: 1:N** (vínculo opcional). FK `publications_created_by_fkey`; created_by → id.
- **iam.organizations → cms.publications: 1:N** (vínculo obligatorio). FK `publications_organization_id_fkey`; organization_id → id.
- **cms.revisions → cms.publications: 1:N** (vínculo obligatorio). FK `publications_organization_id_revision_id_site_id_fkey`; organization_id, revision_id, site_id → organization_id, id, site_id.
- **cms.sites → cms.publications: 1:N** (vínculo obligatorio). FK `publications_organization_id_site_id_fkey`; organization_id, site_id → organization_id, id.
- **iam.app_users → cms.publications: 1:N** (vínculo opcional). FK `publications_updated_by_fkey`; updated_by → id.

## Diccionario

### app_private.schema_migrations

RLS: false; FORCE: false. Control técnico de migraciones y SHA-256; no contiene usuarios ni secretos

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| version | text | No | PK |
| checksum | character(64) | No |  |
| applied_at | timestamp with time zone | No |  |


### audit.customer_events

RLS: true; FORCE: true. Bitácora append-only; registra campos modificados, no valores PII

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint | No | PK |
| organization_id | uuid | No | FK |
| customer_id | uuid | Sí | FK |
| actor_user_id | uuid | Sí | FK |
| event_type | character varying(16) | No |  |
| source_table | character varying(120) | No |  |
| record_id | uuid | Sí |  |
| changed_fields | text[] | No |  |
| request_id | uuid | Sí |  |
| occurred_at | timestamp with time zone | No |  |

- CHECK (((event_type)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[])))

### audit.erp_events

RLS: true; FORCE: true. Auditoría de operaciones ERP: identidad, tabla y nombres de campos; jamás valores, contraseñas ni tokens

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint | No | PK |
| organization_id | uuid | No | FK |
| actor_user_id | uuid | Sí | FK |
| source_table | character varying(120) | No |  |
| record_id | uuid | No |  |
| event_type | character varying(8) | No |  |
| changed_fields | text[] | No |  |
| request_id | character varying(120) | Sí |  |
| occurred_at | timestamp with time zone | No |  |

- CHECK (((event_type)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[])))

### authn.account

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| accountId | text | No |  |
| providerId | text | No |  |
| userId | uuid | No | FK |
| accessToken | text | Sí |  |
| refreshToken | text | Sí |  |
| idToken | text | Sí |  |
| accessTokenExpiresAt | timestamp with time zone | Sí |  |
| refreshTokenExpiresAt | timestamp with time zone | Sí |  |
| scope | text | Sí |  |
| password | text | Sí |  |
| createdAt | timestamp with time zone | No |  |
| updatedAt | timestamp with time zone | No |  |

- CHECK ((("providerId" <> 'credential'::text) OR (password ~ '^\$argon2id\$'::text)))

### authn.rateLimit

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| key | text | No | UQ |
| count | integer | No |  |
| lastRequest | bigint | No |  |


### authn.session

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| expiresAt | timestamp with time zone | No |  |
| token | text | No | UQ |
| createdAt | timestamp with time zone | No |  |
| updatedAt | timestamp with time zone | No |  |
| ipAddress | text | Sí |  |
| userAgent | text | Sí |  |
| userId | uuid | No | FK |


### authn.twoFactor

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| secret | text | No |  |
| backupCodes | text | No |  |
| userId | uuid | No | FK |
| verified | boolean | Sí |  |
| failedVerificationCount | integer | Sí |  |
| lockedUntil | timestamp with time zone | Sí |  |


### authn.user

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| name | text | No |  |
| email | text | No | UQ |
| emailVerified | boolean | No |  |
| image | text | Sí |  |
| createdAt | timestamp with time zone | No |  |
| updatedAt | timestamp with time zone | No |  |
| twoFactorEnabled | boolean | Sí |  |


### authn.verification

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| identifier | text | No |  |
| value | text | No |  |
| expiresAt | timestamp with time zone | No |  |
| createdAt | timestamp with time zone | No |  |
| updatedAt | timestamp with time zone | No |  |


### billing.cash_audit_payments

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ, FK |
| cash_audit_id | uuid | No | FK, UQ |
| payment_id | uuid | No | UQ, FK |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| currency | character(3) | No | FK, FK |

- CHECK ((version > 0))

### billing.cash_audits

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | UQ, UQ, FK, UQ |
| audit_number | character varying(80) | No | UQ |
| period_start | timestamp with time zone | No |  |
| period_end | timestamp with time zone | No |  |
| currency | character(3) | No | UQ |
| cash_amount | numeric(14,2) | No |  |
| transfer_amount | numeric(14,2) | No |  |
| card_amount | numeric(14,2) | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((audit_number)::text) <> ''::text))
- CHECK ((period_end >= period_start))
- CHECK (((cash_amount >= (0)::numeric) AND (transfer_amount >= (0)::numeric) AND (card_amount >= (0)::numeric)))
- CHECK ((currency ~ '^[A-Z]{3}$'::text))
- CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'closed'::character varying, 'void'::character varying])::text[])))
- CHECK ((version > 0))

### billing.credit_notes

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | UQ, FK, UQ, FK |
| invoice_id | uuid | No | FK |
| credit_number | character varying(80) | No | UQ |
| amount | numeric(14,2) | No |  |
| status | character varying(20) | No |  |
| category | character varying(120) | No |  |
| description | text | No |  |
| issued_at | timestamp with time zone | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((amount > (0)::numeric))
- CHECK (((btrim((credit_number)::text) <> ''::text) AND (btrim((category)::text) <> ''::text)))
- CHECK (((status)::text = ANY ((ARRAY['applied'::character varying, 'void'::character varying])::text[])))
- CHECK ((version > 0))

### billing.invoice_items

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ |
| invoice_id | uuid | No | FK, UQ |
| line_number | integer | No | UQ |
| description | character varying(255) | No |  |
| quantity | numeric(14,3) | No |  |
| unit_price | numeric(14,2) | No |  |
| tax_amount | numeric(14,2) | No |  |
| product_code | character varying(100) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((line_number > 0) AND (btrim((description)::text) <> ''::text)))
- CHECK (((quantity > (0)::numeric) AND (unit_price >= (0)::numeric) AND (tax_amount >= (0)::numeric)))
- CHECK ((version > 0))

### billing.invoices

RLS: true; FORCE: true. Factura fiscal no equivale a timbrado SAT: proveedor, validaciones y emisión fiscal siguen pendientes.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, UQ, PK |
| organization_id | uuid | No | UQ, FK, FK, FK, UQ, UQ, UQ, FK |
| customer_id | uuid | No | UQ, FK, FK, UQ |
| contract_id | uuid | Sí | FK |
| legal_entity_id | uuid | No | FK |
| invoice_number | character varying(80) | No | UQ |
| document_type | character varying(20) | No |  |
| status | character varying(20) | No |  |
| currency | character(3) | No | UQ |
| amount | numeric(14,2) | No |  |
| balance | numeric(14,2) | No |  |
| issued_at | timestamp with time zone | Sí |  |
| due_on | date | No |  |
| period_start | date | Sí |  |
| period_end | date | Sí |  |
| payment_method | character varying(100) | Sí |  |
| concept | text | No |  |
| fiscal_reference | character varying(160) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((btrim((invoice_number)::text) <> ''::text) AND (btrim(concept) <> ''::text)))
- CHECK (((amount >= (0)::numeric) AND ((balance >= (0)::numeric) AND (balance <= amount))))
- CHECK (((period_start IS NULL) OR (period_end IS NULL) OR (period_end >= period_start)))
- CHECK ((((status)::text = 'draft'::text) OR (issued_at IS NOT NULL)))
- CHECK ((currency ~ '^[A-Z]{3}$'::text))
- CHECK (((document_type)::text = ANY ((ARRAY['receipt'::character varying, 'fiscal_invoice'::character varying])::text[])))
- CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'unpaid'::character varying, 'paid'::character varying, 'void'::character varying])::text[])))
- CHECK ((version > 0))

### billing.ledger_entries

RLS: true; FORCE: true. Cuenta corriente cargo/abono de la UI; registros inmutables para runtime y clave de idempotencia. No es un libro contable de doble partida.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ, UQ, FK, FK |
| customer_id | uuid | No | FK, FK, FK |
| invoice_id | uuid | Sí | FK |
| payment_id | uuid | Sí | FK |
| entry_type | character varying(16) | No |  |
| amount | numeric(14,2) | No |  |
| currency | character(3) | No | FK, FK |
| concept | character varying(255) | No |  |
| occurred_at | timestamp with time zone | No |  |
| idempotency_key | character varying(120) | No | UQ |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((((entry_type)::text = ANY ((ARRAY['charge'::character varying, 'credit'::character varying])::text[])) AND (amount > (0)::numeric)))
- CHECK (((btrim((concept)::text) <> ''::text) AND (btrim((idempotency_key)::text) <> ''::text)))
- CHECK ((currency ~ '^[A-Z]{3}$'::text))
- CHECK ((version > 0))

### billing.legal_entities

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ |
| name | character varying(220) | No | UQ |
| tax_id | character varying(40) | Sí |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK ((version > 0))

### billing.payment_allocations

RLS: true; FORCE: true. Impide aplicar pagos a otro cliente/organización/moneda. Límite agregado y actualización de saldos exigen transacción de backend.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, FK, UQ |
| payment_id | uuid | No | FK, UQ |
| invoice_id | uuid | No | FK, UQ |
| customer_id | uuid | No | FK, FK |
| currency | character(3) | No | FK, FK |
| amount | numeric(14,2) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((amount > (0)::numeric))
- CHECK ((version > 0))

### billing.payment_promises

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, FK, UQ, UQ |
| customer_id | uuid | No | FK, FK |
| contract_id | uuid | Sí | FK |
| promise_number | character varying(80) | No | UQ |
| debt | numeric(14,2) | No |  |
| valid_until | timestamp with time zone | No |  |
| kind | character varying(20) | No |  |
| mobile | boolean | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((debt >= (0)::numeric))
- CHECK (((kind)::text = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying])::text[])))
- CHECK ((btrim((promise_number)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'fulfilled'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
- CHECK ((version > 0))

### billing.payment_receipts

RLS: true; FORCE: true. Referencia de archivo privada; URLs firmadas y control de tipos/tamaño/antimalware deben implementarse al conectar carga de comprobantes.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ, FK, UQ, FK, FK, FK |
| customer_id | uuid | No | FK, FK, FK |
| payment_id | uuid | Sí | FK |
| receipt_number | character varying(80) | No | UQ |
| status | character varying(20) | No |  |
| file_reference | character varying(255) | Sí |  |
| processed_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| invoice_id | uuid | Sí | FK |
| file_id | uuid | Sí | FK, FK |
| file_purpose | character varying(24) | Sí | FK |

- CHECK (((file_reference IS NULL) OR ((file_reference)::text ~ '^storage:[A-Za-z0-9_./:-]{1,230}$'::text)))
- CHECK ((btrim((receipt_number)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processed'::character varying, 'rejected'::character varying])::text[])))
- CHECK ((version > 0))

### billing.payments

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, UQ, UQ, PK |
| organization_id | uuid | No | UQ, FK, FK, FK, UQ, UQ, UQ, UQ |
| customer_id | uuid | No | FK, UQ, UQ |
| payment_number | character varying(80) | No | UQ |
| paid_at | timestamp with time zone | No |  |
| amount | numeric(14,2) | No |  |
| unallocated_credit | numeric(14,2) | No |  |
| currency | character(3) | No | UQ, UQ |
| method | character varying(100) | No |  |
| collector_user_id | uuid | Sí | FK |
| status | character varying(20) | No |  |
| provider_reference | character varying(160) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((btrim((payment_number)::text) <> ''::text) AND (btrim((method)::text) <> ''::text)))
- CHECK (((amount > (0)::numeric) AND ((unallocated_credit >= (0)::numeric) AND (unallocated_credit <= amount))))
- CHECK ((currency ~ '^[A-Z]{3}$'::text))
- CHECK (((status)::text = ANY ((ARRAY['valid'::character varying, 'void'::character varying])::text[])))
- CHECK ((version > 0))

### billing.service_billing_profiles

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ |
| name | character varying(120) | No | UQ |
| billing_day | smallint | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((billing_day >= 1) AND (billing_day <= 31)))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK ((version > 0))

### catalog.plan_bursts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK |
| plan_id | uuid | No | UQ, FK |
| direction | character varying(8) | No | UQ |
| limit_kbps | bigint | No |  |
| threshold_kbps | bigint | No |  |
| check_seconds | integer | No |  |
| duration_seconds | numeric(10,3) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((limit_kbps >= 0) AND (threshold_kbps >= 0)))
- CHECK ((threshold_kbps <= limit_kbps))
- CHECK ((check_seconds > 0))
- CHECK (((direction)::text = ANY ((ARRAY['upload'::character varying, 'download'::character varying])::text[])))
- CHECK (((duration_seconds IS NULL) OR (duration_seconds >= (0)::numeric)))
- CHECK ((version > 0))

### catalog.plan_product_codes

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK |
| plan_id | uuid | No | UQ, FK |
| charge_kind | character varying(24) | No | UQ |
| product_code | character varying(100) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((charge_kind)::text = ANY ((ARRAY['service'::character varying, 'interest_first'::character varying, 'interest_second'::character varying, 'reconnection'::character varying, 'installation'::character varying])::text[])))
- CHECK ((btrim((product_code)::text) <> ''::text))
- CHECK ((version > 0))

### catalog.service_plans

RLS: true; FORCE: true. Planes: velocidades normalizadas a kbps; contador de contratos se calcula por relación, no se duplica.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ |
| name | character varying(160) | No | UQ |
| upload_kbps | bigint | No |  |
| download_kbps | bigint | No |  |
| price | numeric(14,2) | No |  |
| currency | character(3) | No |  |
| frequency | character varying(24) | No |  |
| visible | boolean | No |  |
| mikrotik_strategy | character varying(40) | No |  |
| cir_ratio | numeric(6,3) | No |  |
| burst_enabled | boolean | No |  |
| schedule_enabled | boolean | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((upload_kbps >= 0) AND (download_kbps >= 0) AND (price >= (0)::numeric)))
- CHECK ((cir_ratio > (0)::numeric))
- CHECK ((currency ~ '^[A-Z]{3}$'::text))
- CHECK (((frequency)::text = ANY ((ARRAY['monthly'::character varying, 'weekly'::character varying, 'daily'::character varying, 'annual'::character varying, 'once'::character varying])::text[])))
- CHECK (((mikrotik_strategy)::text = ANY ((ARRAY['simple_queue'::character varying, 'queue_tree'::character varying, 'ppp_profile'::character varying, 'none'::character varying, 'pcq_queue_tree'::character varying, 'pcq_simple_queue'::character varying, 'cake_simple_queue'::character varying])::text[])))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK ((version > 0))

### cms.publications

RLS: true; FORCE: true. Historial inmutable de publicación. Insertar una fila no publica un sitio ni simula un despliegue.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, FK |
| site_id | uuid | No | FK, FK |
| revision_id | uuid | No | FK |
| environment | character varying(16) | No |  |
| outcome | character varying(16) | No |  |
| idempotency_key | character varying(120) | No | UQ |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((environment)::text = ANY ((ARRAY['local'::character varying, 'staging'::character varying, 'production'::character varying])::text[])))
- CHECK ((btrim((idempotency_key)::text) <> ''::text))
- CHECK (((outcome)::text = ANY ((ARRAY['succeeded'::character varying, 'failed'::character varying])::text[])))
- CHECK ((version > 0))

### cms.revisions

RLS: true; FORCE: true. Modelo de versiones para CMC; conserva solo referencia cifrada y digest. El bridge de archivos existente no se migra automáticamente a esta tabla.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, UQ |
| site_id | uuid | No | UQ, FK, UQ |
| revision_number | bigint | No | UQ |
| encrypted_reference | character varying(255) | No |  |
| content_sha256 | character(64) | No |  |
| theme_id | character varying(80) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((content_sha256 ~ '^[a-f0-9]{64}$'::text))
- CHECK (((encrypted_reference)::text ~ '^(storage|vault|kms):[A-Za-z0-9_./:-]+$'::text))
- CHECK ((revision_number > 0))
- CHECK ((version > 0))

### cms.sites

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ |
| name | character varying(160) | No |  |
| public_origin | character varying(255) | Sí |  |
| active | boolean | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((public_origin IS NULL) OR ((public_origin)::text ~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$'::text)))
- CHECK ((version > 0))

### crm.customer_accounts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| customer_id | uuid | No | FK, PK |
| organization_id | uuid | No | FK |
| account_status | character varying(24) | No |  |
| balance | numeric(14,2) | No |  |
| available_credit | numeric(14,2) | No |  |
| unpaid_invoices | integer | No |  |
| currency | character(3) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((available_credit >= (0)::numeric))
- CHECK (((currency)::text = upper((currency)::text)))
- CHECK (((account_status)::text = ANY ((ARRAY['current'::character varying, 'credit'::character varying, 'debt'::character varying])::text[])))
- CHECK ((unpaid_invoices >= 0))

### crm.customer_addresses

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| organization_id | uuid | No | FK |
| customer_id | uuid | No | FK |
| address_type | character varying(20) | No |  |
| is_primary | boolean | No |  |
| street | character varying(180) | No |  |
| exterior_number | character varying(40) | Sí |  |
| neighborhood | character varying(120) | No |  |
| city | character varying(120) | No |  |
| state_region | character varying(120) | No |  |
| postal_code | character varying(16) | No |  |
| country_code | character(2) | No |  |
| latitude | numeric(9,6) | Sí |  |
| longitude | numeric(9,6) | Sí |  |
| additional_data | text | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK (((country_code)::text = upper((country_code)::text)))
- CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))))
- CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
- CHECK (((address_type)::text = ANY ((ARRAY['service'::character varying, 'billing'::character varying, 'other'::character varying])::text[])))

### crm.customer_assignments

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| customer_id | uuid | No | FK, PK |
| organization_id | uuid | No | FK |
| zone_name | character varying(120) | No |  |
| seller_name | character varying(160) | No |  |
| collector_name | character varying(160) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |


### crm.customer_billing_profiles

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| customer_id | uuid | No | FK, PK |
| organization_id | uuid | No | FK |
| enabled | boolean | No |  |
| tax_id | character varying(40) | Sí |  |
| legal_name | character varying(220) | Sí |  |
| legal_entity | character varying(160) | Sí |  |
| tax_regime | character varying(160) | Sí |  |
| invoice_type | character varying(60) | No |  |
| billing_day | smallint | No |  |
| payment_method | character varying(100) | Sí |  |
| payment_form | character varying(100) | Sí |  |
| cfdi_use | character varying(120) | Sí |  |
| inform_after_payment | boolean | No |  |
| automatic_status | boolean | No |  |
| email_invoice | boolean | No |  |
| email_payment | boolean | No |  |
| notification_emails | text[] | No |  |
| additional_info | text | No |  |
| additional_info_2 | text | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK (((billing_day >= 1) AND (billing_day <= 31)))

### crm.customer_contacts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| customer_id | uuid | No | FK, PK |
| organization_id | uuid | No | FK |
| email | text | Sí |  |
| mobile_phone | character varying(32) | Sí |  |
| landline_phone | character varying(32) | Sí |  |
| notify_email | boolean | No |  |
| notify_sms | boolean | No |  |
| notify_whatsapp | boolean | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK (((email IS NULL) OR (POSITION(('@'::text) IN (email)) > 1)))
- CHECK (((mobile_phone IS NULL) OR ((length(regexp_replace((mobile_phone)::text, '[^0-9]'::text, ''::text, 'g'::text)) >= 8) AND (length(regexp_replace((mobile_phone)::text, '[^0-9]'::text, ''::text, 'g'::text)) <= 15))))

### crm.customer_devices

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| organization_id | uuid | No | FK |
| customer_id | uuid | No | FK |
| device_name | character varying(160) | No |  |
| platform | character varying(30) | Sí |  |
| push_token_ciphertext | bytea | Sí |  |
| push_token_fingerprint | character varying(64) | Sí |  |
| status | character varying(20) | No |  |
| last_seen_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((btrim((device_name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'revoked'::character varying])::text[])))

### crm.customer_payment_gateways

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| organization_id | uuid | No | FK, UQ |
| customer_id | uuid | No | FK, UQ |
| provider | character varying(40) | No | UQ |
| external_account_reference | character varying(180) | Sí |  |
| enabled | boolean | No |  |
| notify_invoices | boolean | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((btrim((provider)::text) <> ''::text))

### crm.customers

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | UQ, FK, UQ |
| custom_id_suffix | character varying(32) | No | UQ |
| custom_id | character varying(34) | Sí |  |
| person_type | character varying(24) | No |  |
| display_name | character varying(200) | No |  |
| first_name | character varying(100) | Sí |  |
| middle_name | character varying(100) | Sí |  |
| first_last_name | character varying(100) | Sí |  |
| second_last_name | character varying(100) | Sí |  |
| document_id | character varying(80) | Sí |  |
| status | character varying(20) | No |  |
| portal_access_enabled | boolean | No |  |
| notes | text | No |  |
| version | integer | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((((custom_id_suffix)::text = upper(btrim((custom_id_suffix)::text))) AND ((custom_id_suffix)::text ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'::text)))
- CHECK ((btrim((display_name)::text) <> ''::text))
- CHECK (((person_type)::text = ANY ((ARRAY['individual'::character varying, 'company'::character varying, 'other'::character varying])::text[])))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'blocked'::character varying])::text[])))
- CHECK ((version > 0))

### documents.files

RLS: true; FORCE: true. Metadatos privados: objeto en cuarentena por defecto. Descarga exige identidad, propósito autorizado y scan_status clean; no implementa almacenamiento ni antivirus.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | UQ, FK, UQ, UQ |
| purpose | character varying(24) | No | UQ |
| storage_key | character varying(255) | No | UQ |
| original_name | character varying(180) | No |  |
| mime_type | character varying(100) | No |  |
| byte_size | bigint | No |  |
| sha256 | character(64) | No |  |
| scan_status | character varying(16) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((byte_size >= 1) AND (byte_size <= 52428800)))
- CHECK ((btrim((original_name)::text) <> ''::text))
- CHECK (((purpose)::text = ANY ((ARRAY['payment_receipt'::character varying, 'customer_import'::character varying, 'contract_import'::character varying, 'site_media'::character varying])::text[])))
- CHECK (((scan_status)::text = ANY ((ARRAY['quarantined'::character varying, 'clean'::character varying, 'rejected'::character varying])::text[])))
- CHECK ((sha256 ~ '^[a-f0-9]{64}$'::text))
- CHECK (((storage_key)::text ~ '^storage:[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$'::text))
- CHECK ((version > 0))

### erp.customer_workspaces

RLS: true; FORCE: true. Adaptador transitorio cifrado y versionado: clientes/contratos UI; no sustituye el modelo CRM relacional

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| organization_id | uuid | No | FK, PK |
| payload_ciphertext | text | No |  |
| version | integer | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((octet_length(payload_ciphertext) <= 4200000))
- CHECK ((version >= 1))

### iam.app_users

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| external_auth_id | uuid | Sí | FK, UQ |
| email | text | No |  |
| display_name | character varying(160) | No |  |
| status | character varying(20) | No |  |
| last_login_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((btrim((display_name)::text) <> ''::text))
- CHECK ((POSITION(('@'::text) IN (email)) > 1))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'blocked'::character varying, 'disabled'::character varying])::text[])))

### iam.organization_memberships

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| organization_id | uuid | No | FK, PK |
| user_id | uuid | No | PK, FK |
| role | character varying(20) | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'billing'::character varying, 'support'::character varying, 'viewer'::character varying])::text[])))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'invited'::character varying, 'revoked'::character varying])::text[])))

### iam.organizations

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | PK |
| code | character varying(40) | No |  |
| name | character varying(160) | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |

- CHECK ((((code)::text = upper((code)::text)) AND ((code)::text ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'::text)))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'archived'::character varying])::text[])))

### inventory.assets

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ, FK, FK, UQ, FK, UQ, FK, FK |
| model_id | uuid | No | UQ, FK |
| warehouse_id | uuid | Sí | FK |
| supplier_id | uuid | Sí | FK |
| customer_id | uuid | Sí | UQ, FK |
| serial_number | character varying(120) | No | UQ |
| mac_address | macaddr | Sí |  |
| status | character varying(24) | No |  |
| notes | text | No |  |
| assigned_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| product_code | character varying(120) | Sí |  |
| node_id | uuid | Sí | FK |
| employee_id | uuid | Sí | FK |

- CHECK ((((status)::text <> ALL ((ARRAY['assigned'::character varying, 'installed'::character varying])::text[])) OR (customer_id IS NOT NULL) OR (node_id IS NOT NULL) OR (employee_id IS NOT NULL)))
- CHECK ((num_nonnulls(customer_id, node_id, employee_id) <= 1))
- CHECK (((product_code IS NULL) OR (btrim((product_code)::text) <> ''::text)))
- CHECK ((btrim((serial_number)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['in_stock'::character varying, 'assigned'::character varying, 'installed'::character varying, 'returned'::character varying, 'damaged'::character varying, 'retired'::character varying, 'maintenance'::character varying, 'inactive'::character varying, 'stolen'::character varying])::text[])))
- CHECK ((version > 0))

### inventory.equipment_models

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | UQ, FK, UQ |
| brand | character varying(100) | No | UQ |
| model | character varying(140) | No | UQ |
| equipment_type | character varying(24) | No |  |
| unit | character varying(40) | No |  |
| description | text | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| stock_kind | character varying(16) | No |  |

- CHECK (((btrim((brand)::text) <> ''::text) AND (btrim((model)::text) <> ''::text) AND (btrim((unit)::text) <> ''::text)))
- CHECK (((equipment_type)::text = ANY ((ARRAY['antenna'::character varying, 'modem'::character varying, 'olt'::character varying, 'ont'::character varying, 'access_point'::character varying, 'repeater'::character varying, 'router'::character varying, 'switch'::character varying, 'other'::character varying])::text[])))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK (((stock_kind)::text = ANY ((ARRAY['unitary'::character varying, 'consumable'::character varying])::text[])))
- CHECK ((version > 0))

### inventory.stock_levels

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ, FK |
| model_id | uuid | No | FK, UQ |
| warehouse_id | uuid | No | UQ, FK |
| quantity | numeric(14,3) | No |  |
| reserved_quantity | numeric(14,3) | No |  |
| minimum_quantity | numeric(14,3) | No |  |
| maximum_quantity | numeric(14,3) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((quantity >= (0)::numeric) AND ((reserved_quantity >= (0)::numeric) AND (reserved_quantity <= quantity)) AND (minimum_quantity >= (0)::numeric)))
- CHECK (((maximum_quantity IS NULL) OR (maximum_quantity >= minimum_quantity)))
- CHECK ((version > 0))

### inventory.stock_movements

RLS: true; FORCE: true. Historial de cantidades; no actualiza saldos de stock por sí mismo. El backend debe registrar movimiento y saldo en una transacción.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ, FK, FK, FK |
| model_id | uuid | No | FK, FK |
| warehouse_id | uuid | No | FK |
| asset_id | uuid | Sí | FK |
| supplier_id | uuid | Sí | FK |
| movement_type | character varying(24) | No |  |
| quantity_delta | numeric(14,3) | No |  |
| reason | character varying(255) | No |  |
| reference_code | character varying(120) | Sí |  |
| occurred_at | timestamp with time zone | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((movement_type)::text = ANY ((ARRAY['receipt'::character varying, 'issue'::character varying, 'adjustment'::character varying, 'return'::character varying, 'transfer'::character varying])::text[])))
- CHECK ((quantity_delta <> (0)::numeric))
- CHECK ((btrim((reason)::text) <> ''::text))
- CHECK ((version > 0))

### inventory.suppliers

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ |
| name | character varying(180) | No |  |
| contact_email | text | Sí |  |
| contact_phone | character varying(32) | Sí |  |
| notes | text | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((contact_email IS NULL) OR (POSITION(('@'::text) IN (contact_email)) > 1)))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK ((version > 0))

### inventory.warehouses

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ |
| name | character varying(160) | No | UQ |
| address | text | No |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
- CHECK ((version > 0))

### network.nap_ports

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, UQ |
| nap_id | uuid | No | UQ, FK, UQ |
| port_code | character varying(80) | No | UQ |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((port_code)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'damaged'::character varying])::text[])))
- CHECK ((version > 0))

### network.naps

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, UQ |
| olt_id | uuid | No | UQ, FK, UQ |
| name | character varying(160) | No | UQ |
| latitude | numeric(9,6) | Sí |  |
| longitude | numeric(9,6) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))))
- CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK ((version > 0))

### network.node_coverages

RLS: true; FORCE: true. El mapa actual utiliza centro/puntos; geometría de cobertura opcional, sin afirmar medición de alcance real.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ, FK |
| node_id | uuid | No | FK |
| name | character varying(160) | No |  |
| description | text | No |  |
| geometry_geojson | jsonb | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| ssid | character varying(160) | Sí |  |
| amplitude_degrees | numeric(6,2) | Sí |  |
| asset_id | uuid | Sí | FK |

- CHECK (((amplitude_degrees >= (0)::numeric) AND (amplitude_degrees <= (360)::numeric)))
- CHECK (((geometry_geojson IS NULL) OR (jsonb_typeof(geometry_geojson) = 'object'::text)))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK ((version > 0))

### network.nodes

RLS: true; FORCE: true. Nodos: ocupación se obtiene de contratos asignados; coordenadas y capacidad corresponden al módulo existente.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | UQ, FK, UQ |
| code | character varying(40) | No | UQ |
| name | character varying(160) | No |  |
| capacity | integer | No |  |
| latitude | numeric(9,6) | Sí |  |
| longitude | numeric(9,6) | Sí |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((capacity >= 0))
- CHECK (((btrim((code)::text) <> ''::text) AND (btrim((name)::text) <> ''::text)))
- CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))))
- CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[])))
- CHECK ((version > 0))

### network.olt_ports

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, UQ |
| olt_id | uuid | No | UQ, FK, UQ |
| port_code | character varying(80) | No | UQ |
| capacity | integer | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((capacity > 0))
- CHECK ((btrim((port_code)::text) <> ''::text))
- CHECK ((version > 0))

### network.olts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK |
| server_id | uuid | Sí | FK |
| name | character varying(160) | No | UQ |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[])))
- CHECK ((version > 0))

### network.server_interfaces

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ, FK, UQ |
| server_id | uuid | No | UQ, FK, UQ |
| name | character varying(100) | No | UQ |
| interface_type | character varying(40) | Sí |  |
| network_cidr | cidr | Sí |  |
| status | character varying(20) | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['up'::character varying, 'down'::character varying, 'unknown'::character varying])::text[])))
- CHECK ((version > 0))

### network.servers

RLS: true; FORCE: true. Solo referencia opaca a un almacén de secretos; no admite claves/token de equipo en texto plano. Su resolución en backend está pendiente.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, UQ |
| name | character varying(160) | No | UQ |
| kind | character varying(24) | No |  |
| host | character varying(255) | No |  |
| api_port | integer | No |  |
| connection_status | character varying(24) | No |  |
| tls_required | boolean | No |  |
| traffic_control | boolean | No |  |
| dns_enabled | boolean | No |  |
| credential_reference | character varying(255) | Sí |  |
| backup_status | character varying(24) | No |  |
| notes | text | No |  |
| last_seen_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((api_port >= 1) AND (api_port <= 65535)))
- CHECK (((backup_status)::text = ANY ((ARRAY['unknown'::character varying, 'synced'::character varying, 'pending'::character varying, 'failed'::character varying])::text[])))
- CHECK (((btrim((name)::text) <> ''::text) AND (btrim((host)::text) <> ''::text)))
- CHECK (((connection_status)::text = ANY ((ARRAY['connected'::character varying, 'disconnected'::character varying, 'maintenance'::character varying, 'unknown'::character varying])::text[])))
- CHECK (((credential_reference IS NULL) OR ((credential_reference)::text ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$'::text)))
- CHECK (((kind)::text = ANY ((ARRAY['mikrotik'::character varying, 'bmu'::character varying])::text[])))
- CHECK ((version > 0))

### security.account_flags

RLS: true; FORCE: true. Alta temporal local: exige cambio antes de MFA/ERP; rechazada al publicar

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| user_id | uuid | No | PK, FK |
| must_change_password | boolean | No |  |
| temporary_expires_at | timestamp with time zone | Sí |  |


### security.attempt_buckets

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| key | character(64) | No | PK |
| window_start | timestamp with time zone | No | PK |
| count | integer | No |  |

- CHECK ((count > 0))

### security.events

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint | No | PK |
| event_type | character varying(80) | No |  |
| actor_id | uuid | Sí | FK |
| success | boolean | No |  |
| source_fingerprint | character(64) | Sí |  |
| occurred_at | timestamp with time zone | No |  |


### security.factor_replays

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| user_id | uuid | No | PK, FK |
| code_fingerprint | character(64) | No | PK |
| expires_at | timestamp with time zone | No |  |


### security.session_assurance

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| session_id | uuid | No | PK, FK |
| reauthenticated_at | timestamp with time zone | No |  |


### service.contract_connections

RLS: true; FORCE: true. FK triple exige que contrato e interfaz pertenezcan al mismo servidor. Claves PPPoE/WiFi: solo referencias, nunca texto plano.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | UQ, FK, FK, UQ, FK |
| contract_id | uuid | No | UQ, FK |
| server_id | uuid | No | FK, FK |
| interface_id | uuid | No | FK |
| access_mode | character varying(16) | No |  |
| host_type | character varying(16) | No |  |
| ip_address | inet | Sí |  |
| mac_address | macaddr | Sí |  |
| network_cidr | cidr | Sí |  |
| netmask | inet | Sí |  |
| gateway | inet | Sí |  |
| dns_primary | inet | Sí |  |
| dns_secondary | inet | Sí |  |
| ppp_username | character varying(160) | Sí |  |
| ppp_profile | character varying(120) | Sí |  |
| pppoe_server | character varying(120) | Sí |  |
| access_secret_reference | character varying(255) | Sí |  |
| wifi_secret_reference | character varying(255) | Sí |  |
| bandwidth_control | boolean | No |  |
| full_nat_address | inet | Sí |  |
| traffic_tolerance_percent | numeric(5,2) | No |  |
| cpe_protocol | character varying(8) | No |  |
| cpe_port | integer | No |  |
| parent_queue | character varying(120) | Sí |  |
| upload_priority | smallint | No |  |
| download_priority | smallint | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((access_mode)::text = ANY ((ARRAY['static'::character varying, 'pppoe'::character varying, 'dhcp'::character varying])::text[])))
- CHECK (((access_secret_reference IS NULL) OR ((access_secret_reference)::text ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$'::text)))
- CHECK ((((access_mode)::text <> 'static'::text) OR ((ip_address IS NOT NULL) AND (netmask IS NOT NULL))))
- CHECK ((((access_mode)::text <> 'dhcp'::text) OR (mac_address IS NOT NULL)))
- CHECK ((((access_mode)::text <> 'pppoe'::text) OR ((btrim((COALESCE(ppp_username, ''::character varying))::text) <> ''::text) AND (btrim((COALESCE(ppp_profile, ''::character varying))::text) <> ''::text) AND (access_secret_reference IS NOT NULL))))
- CHECK ((((cpe_protocol)::text = ANY ((ARRAY['http'::character varying, 'https'::character varying])::text[])) AND ((cpe_port >= 1) AND (cpe_port <= 65535))))
- CHECK ((((upload_priority >= 1) AND (upload_priority <= 8)) AND ((download_priority >= 1) AND (download_priority <= 8))))
- CHECK (((host_type)::text = ANY ((ARRAY['host'::character varying, 'subnet'::character varying])::text[])))
- CHECK (((traffic_tolerance_percent >= (0)::numeric) AND (traffic_tolerance_percent <= (100)::numeric)))
- CHECK ((version > 0))
- CHECK (((wifi_secret_reference IS NULL) OR ((wifi_secret_reference)::text ~ '^(vault|kms|secret):[A-Za-z0-9_./:-]{1,230}$'::text)))

### service.contract_discounts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ |
| contract_id | uuid | No | FK |
| name | character varying(160) | No |  |
| discount_type | character varying(16) | No |  |
| amount | numeric(14,2) | No |  |
| starts_on | date | Sí |  |
| ends_on | date | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((amount >= (0)::numeric) AND (((discount_type)::text <> 'percentage'::text) OR (amount <= (100)::numeric))))
- CHECK (((starts_on IS NULL) OR (ends_on IS NULL) OR (ends_on >= starts_on)))
- CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'amount'::character varying])::text[])))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK ((version > 0))

### service.contract_items

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, FK, FK, FK, UQ |
| contract_id | uuid | No | FK, FK |
| name | character varying(160) | No |  |
| asset_id | uuid | Sí | FK, FK |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |
| customer_id | uuid | No | FK, FK |

- CHECK ((btrim((name)::text) <> ''::text))
- CHECK ((version > 0))

### service.contract_olt_connections

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ, FK, FK, FK, FK, UQ |
| contract_id | uuid | No | FK, UQ |
| olt_id | uuid | No | FK, FK, FK |
| olt_port_id | uuid | Sí | FK |
| nap_id | uuid | Sí | FK, FK |
| nap_port_id | uuid | Sí | FK |
| mode | character varying(16) | No |  |
| onu_code | character varying(120) | Sí |  |
| onu_serial | character varying(120) | No | UQ |
| onu_port | character varying(80) | No |  |
| seal_code | character varying(120) | Sí |  |
| vlan | integer | Sí |  |
| extra_vlans | integer[] | No |  |
| bandwidth_control | boolean | No |  |
| catv_control | boolean | No |  |
| provision_wan | boolean | No |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((btrim((onu_serial)::text) <> ''::text) AND (btrim((onu_port)::text) <> ''::text)))
- CHECK (((nap_port_id IS NULL) OR (nap_id IS NOT NULL)))
- CHECK (app_private.erp_valid_vlans(extra_vlans))
- CHECK (((mode)::text = ANY ((ARRAY['router'::character varying, 'bridge'::character varying])::text[])))
- CHECK ((version > 0))
- CHECK (((vlan IS NULL) OR ((vlan >= 1) AND (vlan <= 4094))))

### service.contract_recurring_items

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, UQ |
| contract_id | uuid | No | FK |
| name | character varying(160) | No |  |
| unit_price | numeric(14,2) | No |  |
| quantity | integer | No |  |
| product_code | character varying(100) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((unit_price >= (0)::numeric) AND (quantity > 0)))
- CHECK ((btrim((name)::text) <> ''::text))
- CHECK ((version > 0))

### service.contract_usage_samples

RLS: true; FORCE: true. Muestras reales pendientes de fuente de red; no se cargan curvas sintéticas como telemetría.

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, UQ, FK, UQ |
| contract_id | uuid | No | FK, UQ |
| recorded_at | timestamp with time zone | No | UQ |
| downstream_bytes | bigint | No |  |
| upstream_bytes | bigint | No |  |
| source | character varying(40) | No | UQ |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((downstream_bytes >= 0) AND (upstream_bytes >= 0)))
- CHECK ((btrim((source)::text) <> ''::text))
- CHECK ((version > 0))

### service.contracts

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, UQ, UQ, PK |
| organization_id | uuid | No | FK, FK, FK, UQ, UQ, UQ, FK, FK, FK, UQ, FK |
| customer_id | uuid | No | FK, UQ |
| plan_id | uuid | No | FK |
| server_id | uuid | No | UQ, FK |
| node_id | uuid | No | FK |
| serial_number | character varying(120) | No | UQ |
| status | character varying(24) | No |  |
| price | numeric(14,2) | No |  |
| currency | character(3) | No |  |
| frequency | character varying(24) | No |  |
| billing_profile_id | uuid | Sí | FK |
| legal_entity_id | uuid | Sí | FK |
| billing_status | character varying(24) | No |  |
| billing_day | smallint | No |  |
| starts_on | date | No |  |
| start_billing_on | date | Sí |  |
| billing_period_start | date | Sí |  |
| billing_period_end | date | Sí |  |
| latitude | numeric(9,6) | Sí |  |
| longitude | numeric(9,6) | Sí |  |
| notes | text | No |  |
| cable_modem_enabled | boolean | No |  |
| cable_modem_code | character varying(120) | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((billing_day >= 1) AND (billing_day <= 31)))
- CHECK (((price >= (0)::numeric) AND (currency ~ '^[A-Z]{3}$'::text)))
- CHECK (((billing_period_start IS NULL) OR (billing_period_end IS NULL) OR (billing_period_end >= billing_period_start)))
- CHECK (((NOT cable_modem_enabled) OR (btrim((COALESCE(cable_modem_code, ''::character varying))::text) <> ''::text)))
- CHECK (((frequency)::text = ANY ((ARRAY['monthly'::character varying, 'weekly'::character varying, 'daily'::character varying, 'annual'::character varying, 'once'::character varying])::text[])))
- CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))))
- CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
- CHECK ((btrim((serial_number)::text) <> ''::text))
- CHECK (((status)::text = ANY ((ARRAY['enabled'::character varying, 'disabled'::character varying, 'alerted'::character varying, 'degraded'::character varying, 'suspended'::character varying])::text[])))
- CHECK ((version > 0))

### support.tickets

RLS: true; FORCE: true. 

| Columna | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid | No | UQ, PK |
| organization_id | uuid | No | FK, FK, FK, FK, UQ, UQ |
| customer_id | uuid | No | FK, FK |
| contract_id | uuid | No | FK |
| ticket_number | character varying(80) | No | UQ |
| title | character varying(200) | No |  |
| description | text | No |  |
| category | character varying(80) | No |  |
| priority | character varying(16) | No |  |
| status | character varying(20) | No |  |
| assigned_user_id | uuid | Sí | FK |
| closed_at | timestamp with time zone | Sí |  |
| created_at | timestamp with time zone | No |  |
| updated_at | timestamp with time zone | No |  |
| created_by | uuid | Sí | FK |
| updated_by | uuid | Sí | FK |
| version | integer | No |  |
| deleted_at | timestamp with time zone | Sí |  |

- CHECK (((btrim((ticket_number)::text) <> ''::text) AND (length(btrim((title)::text)) >= 3) AND (btrim((category)::text) <> ''::text)))
- CHECK ((((status)::text <> 'closed'::text) OR (closed_at IS NOT NULL)))
- CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])))
- CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'in_progress'::character varying, 'closed'::character varying])::text[])))
- CHECK ((version > 0))
