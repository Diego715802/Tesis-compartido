import { requireIdentity } from "@/lib/auth/server";
import { SecurityScreen } from "@/features/acceso/security-screen";
export default async function NoPermissionPage() {
  const identity = await requireIdentity();
  return <><div role="alert" style={{ padding: "16px 24px", background: "#f0f7fb", color: "#284b61" }}>Tu cuenta no tiene permiso para consultar ese módulo. Solicita el acceso a tu administrador.</div><SecurityScreen identity={identity} /></>;
}
