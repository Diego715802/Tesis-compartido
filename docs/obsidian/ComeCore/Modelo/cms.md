# Dominio cms

Tablas propias: 3. Se muestran las PK y los enlaces de negocio; los tipos y columnas completos están en [[Diccionario]].

```mermaid
erDiagram
    cms_publications {
        uuid id PK
    }
    cms_revisions {
        uuid id PK
    }
    cms_sites {
        uuid id PK
    }
    cms_sites ||--o{ cms_revisions : "site_id"
    cms_revisions ||--o{ cms_publications : "revision_id, site_id"
    cms_sites ||--o{ cms_publications : "site_id"
```

## Tablas implementadas

- **cms.publications**: 13 columnas; RLS forzado.
- **cms.revisions**: 13 columnas; RLS forzado.
- **cms.sites**: 11 columnas; RLS forzado.

## Cardinalidades de negocio

- cms.sites → cms.revisions: **1:N**, padre obligatorio para cada hijo. FK: `revisions_organization_id_site_id_fkey`.
- cms.revisions → cms.publications: **1:N**, padre obligatorio para cada hijo. FK: `publications_organization_id_revision_id_site_id_fkey`.
- cms.sites → cms.publications: **1:N**, padre obligatorio para cada hijo. FK: `publications_organization_id_site_id_fkey`.

[[00-Relaciones|Volver al mapa de relaciones]]
