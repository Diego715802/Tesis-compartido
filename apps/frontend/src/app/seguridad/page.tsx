import type { Metadata } from "next";
import { requireIdentity } from "@/lib/auth/server";
import { SecurityScreen } from "@/features/acceso/security-screen";
export const metadata: Metadata = { title: "Seguridad de la cuenta", robots: { index: false, follow: false } };
export default async function SecurityPage() { const identity = await requireIdentity(undefined, true); return <SecurityScreen identity={identity} />; }
