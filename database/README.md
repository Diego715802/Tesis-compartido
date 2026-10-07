# Base de datos de Clientes — COMECORE

La base utiliza PostgreSQL y se administra desde DBeaver. DBeaver es el cliente
gráfico; la información vive en un servidor PostgreSQL o en Supabase.

## Orden de ejecución en DBeaver

1. Crea una conexión PostgreSQL administrativa con `SSL mode=require`.
2. Conéctate a la base `postgres` y ejecuta `dbeaver/00_create_database.sql`.
3. Reconecta DBeaver a la nueva base `comecore`.
4. Ejecuta `migrations/001_customer_domain.sql`.
5. Ejecuta `seeds/001_single_customer.sql`.
6. Ejecuta `checks/001_customer_security_checks.sql` y confirma que todas las
   tablas reporten `rowsecurity = true`.

En Supabase no ejecutes el archivo de creación de base. Ejecuta la migración, la
semilla y, al final, `supabase/002_supabase_auth_adapter.sql`. La tabla
`iam.app_users` debe registrar en `external_auth_id` el UUID correspondiente de
`auth.users` antes de que ese usuario acceda al ERP.

## Modelo inicial

- `iam.organizations`: empresas o tenants.
- `iam.app_users`: operadores internos; no contiene contraseñas.
- `iam.organization_memberships`: roles owner, admin, billing, support y viewer.
- `crm.customers`: identidad principal con prefijo `CC` generado en PostgreSQL.
- `crm.customer_contacts`: teléfonos, correo y preferencias de comunicación.
- `crm.customer_addresses`: direcciones de servicio, facturación y coordenadas.
- `crm.customer_billing_profiles`: configuración fiscal y notificaciones.
- `crm.customer_accounts`: resumen de saldo; después será alimentado por el ledger.
- `crm.customer_assignments`: zona, vendedor y recaudador.
- `crm.customer_devices`: tokens únicamente cifrados por el backend.
- `crm.customer_payment_gateways`: referencias externas, nunca llaves secretas.
- `audit.customer_events`: bitácora append-only sin copiar valores personales.

## Seguridad obligatoria

- El navegador nunca debe conectarse usando `comecore_owner`, `postgres`, una
  contraseña de DBeaver ni una clave `service_role`.
- El backend usa un LOGIN propio, secreto, miembro de `comecore_app` y abre cada
  petición dentro de una transacción configurando `app.user_id`,
  `app.organization_id` y `app.request_id` después de verificar la sesión.
- RLS aísla cada organización y las políticas separan lectura, escritura operativa
  y facturación. No existe permiso de `DELETE`; los clientes se archivan.
- Activa TLS, cifrado de disco/volumen, rotación de credenciales, copias diarias y
  recuperación a un punto en el tiempo en el proveedor de PostgreSQL.
- Los tokens de dispositivos deben cifrarse con AES-256-GCM o un KMS en el backend;
  la llave de cifrado nunca se guarda en PostgreSQL ni en Git.
- Configura un pool de conexiones en el backend. Para más de 1,000 clientes no se
  necesita particionado: los índices incluidos cubren listado, búsqueda, joins,
  ubicación y auditoría. Revisa `EXPLAIN (ANALYZE, BUFFERS)` al incorporar consultas.

## Creación del LOGIN del backend

Créalo desde DBeaver con una contraseña generada fuera del repositorio:

```sql
CREATE ROLE comecore_runtime LOGIN PASSWORD '<generada-en-el-gestor-de-secretos>'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
GRANT comecore_app TO comecore_runtime;
ALTER ROLE comecore_runtime SET statement_timeout = '10s';
ALTER ROLE comecore_runtime SET idle_in_transaction_session_timeout = '15s';
```

Guarda la cadena `DATABASE_URL` solo en `apps/backend/.env`. El archivo `.env`
está excluido de Git. En producción exige `sslmode=require` o `verify-full`.
