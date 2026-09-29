import type { Metadata } from "next";
import { ErpShell } from "@/components/layout/erp-shell";
import { DashboardModule } from "@/features/dashboard/dashboard-module";

export const metadata: Metadata = {
  title: "Paneles de Control",
  description: "Panel operativo visual de ComeCore ERP.",
};

export default function Home() {
  return (
    <ErpShell>
      <DashboardModule />
    </ErpShell>
  );
}
