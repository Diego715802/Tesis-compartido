import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { ClientesModule } from "@/features/clientes/clientes-module";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Módulo Clientes de ComeCore ERP.",
};

export default async function ClientesPage() {
  await requireIdentity("clientes:read");
  return <ClientesModule />;
}
