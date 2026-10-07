export const CUSTOMER_ID_PREFIX = "CC";

export function customerIdSuffix(value: string) {
  return value.trim().replace(/^CC(?:[-\s]*)/i, "");
}

export function normalizeCustomerId(value: string) {
  const suffix = customerIdSuffix(value)
    .toLocaleUpperCase("es-MX")
    .replace(/[^A-Z0-9_-]/g, "");

  return `${CUSTOMER_ID_PREFIX}${suffix}`;
}
