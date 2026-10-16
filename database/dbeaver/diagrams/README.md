# Diagramas nativos de DBeaver para COMECORE

Archivos `.erd` en XML versión 1 para DBeaver 26.2.2, referenciando la conexión
local guardada `COMECORE · Desarrollo` y la base `comecore`.

| Archivo | Tablas | Relaciones FK incluidas | Vista inicial |
| --- | ---: | ---: | --- |
| `COMECORE-00-Modelo-general.erd` | 13 | 15 | Claves |
| `COMECORE-01-IAM-accesos.erd` | 3 | 2 | Todas las columnas |
| `COMECORE-02-Clientes-auditoria.erd` | 11 | 13 | Claves |

La vista general incluye las 12 tablas de IAM, CRM y auditoría más la tabla
técnica `app_private.schema_migrations`, que no tiene relaciones FK.

Los archivos contienen referencias a tablas existentes. DBeaver carga las
columnas, tipos y relaciones reales desde PostgreSQL al abrirlos. Los diagramas
no sustituyen ni modifican el esquema SQL. El diseño inicial se organiza
automáticamente porque no se fijaron coordenadas; luego puede ajustarse y guardarse.

## Abrir en la instalación local

Las copias están en el proyecto General de DBeaver:

`~/Library/DBeaverData/workspace6/General/Diagrams/`

1. En DBeaver: **Window → Project Explorer**.
2. En **Project – General**, abrir **Diagrams** y seleccionar el archivo `.erd`.
3. Si los archivos nuevos todavía no aparecen, actualizar el proyecto con
   **Refresh** o volver a abrir DBeaver.
4. Al abrir el diagrama, DBeaver conecta mediante `COMECORE · Desarrollo`.
   Si necesita elegir una conexión, seleccionar esa conexión local.
5. Para ver todas las columnas de la vista general o de clientes, cambiar
   **Attribute visibility** a **All** en la configuración del diagrama.

Copiar estas referencias a otra Mac requiere una conexión a la misma base.
DBeaver permite reasignar el identificador de conexión si no existe allí.

## Verificación y alcance

Se comprobó la estructura XML, el identificador de conexión en la configuración
local, los nombres de las 13 tablas y las 15 FK mediante lectura del catálogo
PostgreSQL. El formato se contrastó con el cargador y las constantes oficiales
del tag 26.2.2 y con los plugins de la aplicación instalada.

**Pendiente:** abrir y verificar visualmente los diagramas en la interfaz de
DBeaver. La creación del archivo no demuestra esa comprobación visual.

No se incluyen contraseñas, datos de clientes ni resultados de autenticación.

## Referencias del formato

- [Cargador/serializador oficial 26.2.2](https://github.com/dbeaver/dbeaver/blob/26.2.2/plugins/org.jkiss.dbeaver.ui.editors.erd/src/org/jkiss/dbeaver/ui/editors/erd/model/DiagramLoader.java)
- [Constantes XML oficiales](https://github.com/dbeaver/dbeaver/blob/26.2.2/plugins/org.jkiss.dbeaver.model.erd/src/org/jkiss/dbeaver/model/erd/ERDPersistedState.java)
- [Tipo de recurso y carpeta Diagrams](https://github.com/dbeaver/dbeaver/blob/26.2.2/plugins/org.jkiss.dbeaver.model.erd/plugin.xml)
- [Diagramas personalizados](https://github.com/dbeaver/dbeaver/wiki/Custom-Diagrams)
- [Project Explorer](https://github.com/dbeaver/dbeaver/wiki/Project-Explorer)


## Modelo ampliado — 14 de octubre de 2026

Los tres archivos iniciales se conservan como corte histórico. Modelo actual: 67 tablas y 217 FK; 12 ERD adicionales generados del catálogo, con vecinos de referencia para cada dominio.

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

Visor local comprobado: http://127.0.0.1:3210/. Detalle y límites en `docs/obsidian/ComeCore/08-Diagramas-DBeaver.md`. La validación XML no equivale a renderizado nativo verificado.
