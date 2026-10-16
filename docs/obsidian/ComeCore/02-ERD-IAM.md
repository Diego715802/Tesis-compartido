---
proyecto: ComeCore
tipo: erd
dominio: iam
fecha_base: 2026-10-09
fuente: database/migrations/001_customer_domain.sql
---

# ERD — identidad y membresías

Los nombres del diagrama corresponden a `iam.organizations`, `iam.app_users` y `iam.organization_memberships`. Se muestran todas las columnas de las tres tablas. `PK` indica clave primaria, `FK` clave foránea y `UK` unicidad. La marca `NULL` señala una columna opcional; las demás son `NOT NULL`.

```mermaid
erDiagram
    organizations ||--o{ organization_memberships : "organization_id"
    app_users ||--o{ organization_memberships : "user_id"

    organizations {
        uuid id PK
        varchar code UK "40; unicidad por lower(code)"
        varchar name "160"
        varchar status "20; active, suspended, archived"
        timestamptz created_at
        timestamptz updated_at
    }

    app_users {
        uuid id PK
        uuid external_auth_id UK "NULL; sin FK ni credenciales"
        text email UK "unicidad por lower(email)"
        varchar display_name "160"
        varchar status "20; active, blocked, disabled"
        timestamptz last_login_at "NULL"
        timestamptz created_at
        timestamptz updated_at
    }

    organization_memberships {
        uuid organization_id PK,FK "PK compuesta con user_id"
        uuid user_id PK,FK "PK compuesta con organization_id"
        varchar role "20; owner, admin, billing, support, viewer"
        varchar status "20; active, invited, revoked"
        timestamptz created_at
        timestamptz updated_at
    }
```

Una organización puede tener cero o muchas membresías. Un operador puede tener cero o muchas membresías y pertenecer a varias organizaciones. Cada membresía exige exactamente una organización y un operador; su clave primaria compuesta permite un solo registro por pareja `(organization_id, user_id)`. La eliminación de sus referencias usa `ON DELETE RESTRICT`.

`external_auth_id` no se relaciona con otra tabla en esta migración. La autenticación, las credenciales y las sesiones siguen pendientes y no están dibujadas como entidades existentes. El operador interno no es lo mismo que un cliente de `crm.customers` ni que una cuenta LOGIN de PostgreSQL.

Las referencias a operadores desde clientes y eventos se muestran en [[03-ERD-CRM]], [[04-ERD-Auditoria]] y [[05-Mapa-General]].
