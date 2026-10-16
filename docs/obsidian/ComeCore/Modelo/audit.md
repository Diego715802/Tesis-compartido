# Dominio audit

Tablas propias: 2. Se muestran las PK y los enlaces de negocio; los tipos y columnas completos están en [[Diccionario]].

```mermaid
erDiagram
    audit_customer_events {
        bigint id PK
    }
    audit_erp_events {
        bigint id PK
    }
    crm_customers {
        uuid id PK
    }
    crm_customers o|--o{ audit_customer_events : "customer_id"
```

## Tablas implementadas

- **audit.customer_events**: 10 columnas; RLS forzado.
- **audit.erp_events**: 9 columnas; RLS forzado.

## Cardinalidades de negocio

- crm.customers → audit.customer_events: **1:N**, padre opcional para cada hijo. FK: `customer_events_customer_id_fkey`.

[[00-Relaciones|Volver al mapa de relaciones]]
