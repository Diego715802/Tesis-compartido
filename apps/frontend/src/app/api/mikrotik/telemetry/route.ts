import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.COMECORE_BACKEND_URL ?? "http://127.0.0.1:3000";
  try {
    const response = await fetch(`${backendUrl}/mikrotik/telemetry`, { cache: "no-store", signal: AbortSignal.timeout(12_000) });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ message: "El backend de COMECORE no está disponible. Inicia apps/backend para consultar el MikroTik." }, { status: 503 });
  }
}
