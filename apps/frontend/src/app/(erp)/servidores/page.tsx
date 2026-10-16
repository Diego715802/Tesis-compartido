import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { ServidoresModule } from "@/features/servidores/servidores-module";

export const metadata: Metadata = {
  title: "Servidores",
  description: "Módulo Servidores de ComeCore ERP.",
};

export default async function ServidoresPage() {
  await requireIdentity("red:read");
  return <ServidoresModule />;
}
