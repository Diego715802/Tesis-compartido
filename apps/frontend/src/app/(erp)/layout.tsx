import { requireIdentity } from "@/lib/auth/server";
import { IdentityProvider } from "@/components/auth/identity-provider";
import { ErpShell } from "@/components/layout/erp-shell";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireIdentity();
  return <IdentityProvider identity={identity}><ErpShell>{children}</ErpShell></IdentityProvider>;
}
