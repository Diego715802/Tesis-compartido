import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FacturacionModule } from "@/features/facturacion/facturacion-module";

export const metadata: Metadata = {
  title: "Facturación",
  description: "Submódulo de facturación de ComeCore ERP.",
};

export default async function FacturacionSubmodulePage({ params }: { params: Promise<{ submodule: string }> }) {
  await requireIdentity("facturacion:read");
  const { submodule } = await params;
  if (submodule !== "comprobantes") redirect("/facturacion/comprobantes");
  return <FacturacionModule />;
}
