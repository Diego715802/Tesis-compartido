"use client";

export type StoredPlan = {
  id: string; name: string; price: number; uploadKbps: number; downloadKbps: number;
  visible: boolean; burstEnabled: boolean; mikrotikStrategy: string; frequency: string;
  version: number; contracts: number; suspended: number; productCodes: Record<string,string>;
};
export async function loadPlans(signal?: AbortSignal): Promise<StoredPlan[]> {
  const response = await fetch('/api/erp/plans', { credentials:'same-origin',cache:'no-store',redirect:'error',signal });
  const body = await response.json().catch(()=>null);
  if (!response.ok || !Array.isArray(body?.plans)) throw new Error(response.status===401 ? 'Tu sesión terminó. Vuelve a iniciar sesión.' : 'No se pudo cargar el catálogo de planes. Inténtalo de nuevo.');
  return body.plans;
}
export async function createStoredPlan(plan: unknown) {
  const response = await fetch('/api/erp/plans', { method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify(plan) });
  const body = await response.json().catch(()=>null);
  if (!response.ok) throw new Error(response.status===409 ? 'Ya existe un plan con ese nombre. Recarga el catálogo.' : response.status===403 ? 'No tienes permiso para crear planes.' : response.status===400 ? 'Revisa nombre, precio, velocidades y códigos del plan.' : 'No se confirmó el guardado. Recarga el catálogo antes de volver a intentar.');
  return body as {id:string;version:number};
}
