import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { FacturacionModule } from "@/features/facturacion/facturacion-module";

export const metadata: Metadata = {
  title: "Facturación",
  description: "Módulo Facturación de ComeCore ERP.",
};

export default async function FacturacionPage() {
  await requireIdentity("facturacion:read");
  return <FacturacionModule />;
}
