import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { InventarioModule } from "@/features/inventario/inventario-module";

export const metadata: Metadata = {
  title: "Inventario",
  description: "Módulo Inventario de ComeCore ERP.",
};

export default async function InventarioPage() {
  await requireIdentity("inventario:read");
  return <InventarioModule />;
}
