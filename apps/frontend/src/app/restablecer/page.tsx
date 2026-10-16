import type { Metadata } from "next";
import { RecoveryScreen } from "@/features/acceso/recovery-screen";
export const metadata: Metadata = { title: "Restablecer contraseña", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function ResetPage() { return <RecoveryScreen reset />; }
