import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { ContratosModule } from "@/features/contratos/contratos-module";

export const metadata: Metadata = {
  title: "Contratos",
  description: "Módulo Contratos de ComeCore ERP.",
};

export default async function ContratosPage() {
  await requireIdentity("contratos:read");
  return <ContratosModule />;
}
