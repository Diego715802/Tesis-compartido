# Dominio erp

Tablas propias: 1. Se muestran las PK y los enlaces de negocio; los tipos y columnas completos están en [[Diccionario]].

```mermaid
erDiagram
    erp_customer_workspaces {
        uuid organization_id PK
    }
```

## Tablas implementadas

- **erp.customer_workspaces**: 4 columnas; RLS forzado.

## Cardinalidades de negocio


[[00-Relaciones|Volver al mapa de relaciones]]
