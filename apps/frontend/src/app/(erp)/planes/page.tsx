import { requireIdentity } from "@/lib/auth/server";
import type { Metadata } from "next";
import { PlanesModule } from "@/features/planes/planes-module";

export const metadata: Metadata = {
  title: "Planes",
  description: "Módulo Planes de ComeCore ERP.",
};

export default async function PlanesPage() {
  await requireIdentity("planes:read");
  return <PlanesModule />;
}
