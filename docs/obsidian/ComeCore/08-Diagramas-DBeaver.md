---
proyecto: ComeCore
tipo: guia-diagramas
fecha: 2026-10-14
---

# Diagramas del modelo PostgreSQL

[Visor local interactivo](http://127.0.0.1:3210/): dominio, búsqueda, escala y selección de tabla. Verificado visualmente en navegador; muestra 67 tablas, 217 FK y detalle de columnas/cardinalidades. Los archivos solo contienen estructura, sin registros ni claves.

La base está en PostgreSQL. **DBeaver es el cliente de administración**, no un alojamiento ni una capa que vuelva segura por sí misma la base. El ERP usa cuentas distintas a `comecore_designer`, sin propiedad de tablas ni privilegios de administración.

## Archivos nativos

Los tres primeros diagramas conservan el corte inicial. Los doce siguientes se generan del catálogo SQL actual; cada dominio incluye también los padres necesarios para interpretar sus FK.

| Archivo | Tablas incluidas | FK |
|---|---:|---:|
| `COMECORE-00-Modelo-general.erd` | 13 | 15 |
| `COMECORE-01-IAM-accesos.erd` | 3 | 2 |
| `COMECORE-02-Clientes-auditoria.erd` | 11 | 13 |
| `COMECORE-03-ERP-completo.erd` | 67 | 217 |
| `COMECORE-04-iam.erd` | 4 | 3 |
| `COMECORE-05-crm.erd` | 10 | 10 |
| `COMECORE-06-service.erd` | 21 | 41 |
| `COMECORE-07-catalog.erd` | 5 | 11 |
| `COMECORE-08-network.erd` | 11 | 31 |
| `COMECORE-09-inventory.erd` | 11 | 30 |
| `COMECORE-10-billing.erd` | 18 | 57 |
| `COMECORE-11-cms.erd` | 5 | 12 |
| `COMECORE-12-documents.erd` | 3 | 3 |
| `COMECORE-13-authn.erd` | 6 | 3 |
| `COMECORE-14-security.erd` | 7 | 4 |

Fuentes: `database/dbeaver/diagrams`. Copias para la aplicación: `~/Library/DBeaverData/workspace6/General/Diagrams`.

En DBeaver: **Window → Project Explorer → General → Diagrams**, actualizar el proyecto si hace falta y abrir `COMECORE-03-ERP-completo`. Usar la conexión local `COMECORE · Desarrollo`. Las FK implementadas permiten a DBeaver representar cardinalidades; se puede reorganizar la disposición sin cambiar el modelo.

Se validó XML y cada referencia de relación contra entidades incluidas. La apertura mediante CLI fue aceptada; **no se verificó visualmente el renderizado nativo de DBeaver**. La comprobación visual completa de esta entrega se hizo en el visor del navegador.

Para actualizar: `node scripts/generate-database-model.cjs`, `node scripts/document-database-model.cjs`, copiar los ERD nuevos al proyecto DBeaver y ejecutar `node scripts/sync-obsidian.cjs`. No compartir los archivos privados de conexión ni las credenciales con el navegador.

[[Modelo/00-Relaciones]] · [[Modelo/Diccionario]] · [[11-Modelo-ERP-Completo]]
