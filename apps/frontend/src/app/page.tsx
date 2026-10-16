import { requireIdentity } from "@/lib/auth/server";
import { IdentityProvider } from "@/components/auth/identity-provider";
import type { Metadata } from "next";
import { ErpShell } from "@/components/layout/erp-shell";
import { DashboardModule } from "@/features/dashboard/dashboard-module";

export const metadata: Metadata = {
  title: "Paneles de Control",
  description: "Panel operativo visual de ComeCore ERP.",
};

export default async function Home() {
  const identity = await requireIdentity("dashboard:read");
  return (
    <IdentityProvider identity={identity}><ErpShell>
      <DashboardModule />
    </ErpShell></IdentityProvider>
  );
}
