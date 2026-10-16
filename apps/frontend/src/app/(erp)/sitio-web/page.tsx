import type { Metadata } from "next";
import { requireIdentity } from "@/lib/auth/server";
import { SitioWebModule } from "@/features/sitio-web/sitio-web-module";

export const metadata: Metadata = { title: "Sitio web y contenido (CMC)", description: "Administración del contenido público de CometaLink desde ComeCore." };

export default async function SitioWebPage() {
  await requireIdentity("sitio-web:read");
  return <SitioWebModule/>;
}
