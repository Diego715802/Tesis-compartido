import type { Metadata } from "next";
import { FacturacionModule } from "@/features/facturacion/facturacion-module";

export const metadata: Metadata = {
  title: "Facturación",
  description: "Submódulo de facturación de ComeCore ERP.",
};

export default function FacturacionSubmodulePage() {
  return <FacturacionModule />;
}
