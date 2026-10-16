import type { Pool } from 'pg';
export async function verifyDatabaseBoundary(pool: Pool, business: boolean): Promise<void> {
  const result = await pool.query<{ elevated: boolean; owns_business: boolean; internal_member: boolean }>(`
    SELECT r.rolsuper OR r.rolbypassrls OR r.rolcreatedb OR r.rolcreaterole AS elevated,
      EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE c.relowner=r.oid AND n.nspname IN ('iam','crm','catalog','network','inventory','service','billing','support','cms','documents')) AS owns_business,
      pg_has_role(current_user,'comecore_policy','MEMBER') OR pg_has_role(current_user,'comecore_audit_writer','MEMBER') OR pg_has_role(current_user,'comecore_owner','MEMBER') AS internal_member
    FROM pg_roles r WHERE r.rolname=current_user`);
  const row = result.rows[0];
  if (!row || row.elevated || row.internal_member || (business && row.owns_business)) {
    throw new Error('La conexión de aplicación tiene privilegios incompatibles con RLS. No se inicia el servicio.');
  }
}
