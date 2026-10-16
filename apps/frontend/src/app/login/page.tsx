import type { Metadata } from "next";
import { AccessScreen } from "@/features/acceso/access-screen";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceso del personal autorizado a ComeCore ERP.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AccessScreen />;
}
