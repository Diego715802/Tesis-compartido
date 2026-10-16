import type { Metadata } from "next";
import { RecoveryScreen } from "@/features/acceso/recovery-screen";
export const metadata: Metadata = { title: "Recuperar acceso", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function RecoveryPage() { return <RecoveryScreen />; }
