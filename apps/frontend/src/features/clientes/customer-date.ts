const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "America/Mexico_City",
});

export function formatCustomerDate(value: string): string {
  // El servidor entrega ISO completo; expedientes anteriores pueden tener solo fecha.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(normalized);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : "Sin fecha";
}
