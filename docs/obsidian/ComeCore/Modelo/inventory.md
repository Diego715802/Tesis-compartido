# Dominio inventory

Tablas propias: 6. Se muestran las PK y los enlaces de negocio; los tipos y columnas completos están en [[Diccionario]].

```mermaid
erDiagram
    inventory_assets {
        uuid id PK
    }
    inventory_equipment_models {
        uuid id PK
    }
    inventory_stock_levels {
        uuid id PK
    }
    inventory_stock_movements {
        uuid id PK
    }
    inventory_suppliers {
        uuid id PK
    }
    inventory_warehouses {
        uuid id PK
    }
    iam_organization_memberships {
        uuid organization_id PK
        uuid user_id PK
    }
    network_nodes {
        uuid id PK
    }
    crm_customers {
        uuid id PK
    }
    inventory_equipment_models ||--o{ inventory_stock_levels : "model_id"
    inventory_warehouses ||--o{ inventory_stock_levels : "warehouse_id"
    iam_organization_memberships o|--o{ inventory_assets : "employee_id"
    network_nodes o|--o{ inventory_assets : "node_id"
    crm_customers o|--o{ inventory_assets : "customer_id"
    inventory_equipment_models ||--o{ inventory_assets : "model_id"
    inventory_suppliers o|--o{ inventory_assets : "supplier_id"
    inventory_warehouses o|--o{ inventory_assets : "warehouse_id"
    inventory_assets o|--o{ inventory_stock_movements : "asset_id, model_id"
    inventory_equipment_models ||--o{ inventory_stock_movements : "model_id"
    inventory_suppliers o|--o{ inventory_stock_movements : "supplier_id"
    inventory_warehouses ||--o{ inventory_stock_movements : "warehouse_id"
```

## Tablas implementadas

- **inventory.assets**: 20 columnas; RLS forzado.
- **inventory.equipment_models**: 15 columnas; RLS forzado.
- **inventory.stock_levels**: 14 columnas; RLS forzado.
- **inventory.stock_movements**: 17 columnas; RLS forzado.
- **inventory.suppliers**: 13 columnas; RLS forzado.
- **inventory.warehouses**: 11 columnas; RLS forzado.

## Cardinalidades de negocio

- inventory.equipment_models → inventory.stock_levels: **1:N**, padre obligatorio para cada hijo. FK: `stock_levels_organization_id_model_id_fkey`.
- inventory.warehouses → inventory.stock_levels: **1:N**, padre obligatorio para cada hijo. FK: `stock_levels_organization_id_warehouse_id_fkey`.
- iam.organization_memberships → inventory.assets: **1:N**, padre opcional para cada hijo. FK: `assets_employee_membership_fk`.
- network.nodes → inventory.assets: **1:N**, padre opcional para cada hijo. FK: `assets_node_fk`.
- crm.customers → inventory.assets: **1:N**, padre opcional para cada hijo. FK: `assets_organization_id_customer_id_fkey`.
- inventory.equipment_models → inventory.assets: **1:N**, padre obligatorio para cada hijo. FK: `assets_organization_id_model_id_fkey`.
- inventory.suppliers → inventory.assets: **1:N**, padre opcional para cada hijo. FK: `assets_organization_id_supplier_id_fkey`.
- inventory.warehouses → inventory.assets: **1:N**, padre opcional para cada hijo. FK: `assets_organization_id_warehouse_id_fkey`.
- inventory.assets → inventory.stock_movements: **1:N**, padre opcional para cada hijo. FK: `stock_movements_asset_model_fk`.
- inventory.equipment_models → inventory.stock_movements: **1:N**, padre obligatorio para cada hijo. FK: `stock_movements_organization_id_model_id_fkey`.
- inventory.suppliers → inventory.stock_movements: **1:N**, padre opcional para cada hijo. FK: `stock_movements_organization_id_supplier_id_fkey`.
- inventory.warehouses → inventory.stock_movements: **1:N**, padre obligatorio para cada hijo. FK: `stock_movements_organization_id_warehouse_id_fkey`.

[[00-Relaciones|Volver al mapa de relaciones]]
