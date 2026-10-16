-- REVOKE por esquema no elimina la concesión global predeterminada de funciones.
-- Aplicar después de 003; las funciones existentes ya tienen PUBLIC revocado.
BEGIN;
ALTER DEFAULT PRIVILEGES FOR ROLE comecore_owner REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE comecore_policy REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE comecore_audit_writer REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
COMMIT;
