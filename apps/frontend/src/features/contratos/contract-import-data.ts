import type { ServiceStatus } from "../clientes/customer-types";
import { statuses, type ContractRow } from "./contract-model";

export type ContractImportUpdate = { key: string; status: ServiceStatus };
export type ContractImportPreview = ContractImportUpdate & { identifier: string; customerName: string; contractId: string; previousStatus: ServiceStatus };
export type ContractImportResult = { updates: ContractImportUpdate[]; errors: string[]; preview: ContractImportPreview[] };
export const contractImportMaxBytes = 1024 * 1024;
const normalize = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX");
const identifierKey = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase("es-MX");

function csvDelimiter(text: string) {
  let quoted = false;
  let commas = 0;
  let semicolons = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') { if (quoted && text[index + 1] === '"') index += 1; else quoted = !quoted; }
    else if (!quoted && /[\r\n]/.test(char)) break;
    else if (!quoted && char === ",") commas += 1;
    else if (!quoted && char === ";") semicolons += 1;
  }
  return semicolons > commas ? ";" : ",";
}

export function parseContractCsv(text: string) {
  const delimiter = csvDelimiter(text);
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let closed = false;
  function endCell() { row.push(cell.trim()); cell = ""; closed = false; }
  function endRow() { endCell(); if (row.some((value) => value !== "")) records.push(row); row = []; }
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === delimiter) endCell();
    else if (char === "\r" || char === "\n") { endRow(); if (char === "\r" && text[index + 1] === "\n") index += 1; }
    else if (char === '"') {
      if (cell.trim() || closed) throw new Error("CSV inválido: comillas inesperadas en un campo.");
      cell = ""; quoted = true;
    } else if (closed && char.trim()) throw new Error("CSV inválido: texto después del cierre de comillas.");
    else if (!closed) cell += char;
  }
  if (quoted) throw new Error("CSV inválido: falta cerrar un campo entre comillas.");
  if (cell || row.length || closed) endRow();
  return records;
}

function canonicalColumn(column: string): "id" | "serial" | "status" | null {
  const normalized = normalize(column);
  if (["id", "id contrato", "id del contrato", "contractid"].includes(normalized)) return "id";
  if (["serie", "numero de serie", "numerodeserie", "serialnumber", "serial"].includes(normalized)) return "serial";
  if (["estado", "status"].includes(normalized)) return "status";
  return null;
}

function readRecords(text: string, format: "csv" | "json"): unknown[] {
  if (format === "json") {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("El JSON debe contener un arreglo de registros con ID o serie y estado.");
    return parsed;
  }
  const [header, ...records] = parseContractCsv(text);
  if (!header) throw new Error("El archivo está vacío.");
  const columns = header.map(canonicalColumn);
  if (columns.some((column) => column === null)) throw new Error("Columnas permitidas: ID, Serie y Estado.");
  if (new Set(columns).size !== columns.length) throw new Error("El CSV contiene columnas repetidas.");
  if (!columns.includes("status") || (!columns.includes("id") && !columns.includes("serial"))) throw new Error("El CSV requiere Estado y una columna ID o Serie.");
  return records.map((record, index) => {
    if (record.length !== header.length) throw new Error(`Registro ${index + 1}: la cantidad de columnas no coincide con el encabezado.`);
    return Object.fromEntries(record.map((value, column) => [columns[column] === "serial" ? "serialNumber" : columns[column]!, value]));
  });
}

export function parseContractImport(text: string, format: "csv" | "json", rows: ContractRow[]): ContractImportResult {
  const preview: ContractImportPreview[] = [];
  const errors: string[] = [];
  if (new TextEncoder().encode(text).byteLength > contractImportMaxBytes) return { updates: [], errors: ["El archivo excede el máximo de 1 MB."], preview };
  const identifiers = new Map<string, Map<string, ContractRow>>();
  for (const row of rows) for (const value of [row.contract.id, row.contract.serialNumber]) {
    if (!value?.trim()) continue;
    const key = identifierKey(value);
    if (!identifiers.has(key)) identifiers.set(key, new Map());
    identifiers.get(key)!.set(row.key, row);
  }
  let records: unknown[];
  try { records = readRecords(text.replace(/^\uFEFF/, ""), format); }
  catch (error) { return { updates: [], preview, errors: [error instanceof Error ? error.message : "No se pudo leer el archivo."] }; }
  if (records.length === 0) return { updates: [], preview, errors: ["El archivo no contiene contratos para actualizar."] };
  const seen = new Set<string>();
  for (const [index, value] of records.entries()) {
    const prefix = `Registro ${index + 1}: `;
    if (!value || typeof value !== "object" || Array.isArray(value)) { errors.push(`${prefix}debe ser un objeto con ID o serie y estado.`); continue; }
    const fields = Object.entries(value);
    const normalized = fields.map(([key]) => canonicalColumn(key));
    if (normalized.some((column) => column === null)) { errors.push(`${prefix}solo se admiten ID, serie y estado.`); continue; }
    if (new Set(normalized).size !== normalized.length) { errors.push(`${prefix}contiene campos repetidos.`); continue; }
    const record = Object.fromEntries(fields.map(([, entry], fieldIndex) => [normalized[fieldIndex]!, entry]));
    const candidates = [record.id, record.serial].filter((entry) => entry !== undefined);
    if (!candidates.length || candidates.some((entry) => typeof entry !== "string" || !entry.trim())) { errors.push(`${prefix}ingresa un ID o serie válido.`); continue; }
    if (typeof record.status !== "string") { errors.push(`${prefix}el estado debe ser un texto válido.`); continue; }
    const status = statuses.find((entry) => normalize(entry) === normalize(record.status as string));
    if (!status) { errors.push(`${prefix}estado inválido. Usa ${statuses.join(", ")}.`); continue; }
    const matches = (candidates as string[]).map((identifier) => [...(identifiers.get(identifierKey(identifier))?.values() ?? [])]);
    if (matches.some((match) => match.length === 0)) { errors.push(`${prefix}el ID o serie no pertenece a un contrato registrado.`); continue; }
    if (matches.some((match) => match.length > 1)) { errors.push(`${prefix}el ID o serie es ambiguo entre varios contratos.`); continue; }
    const row = matches[0][0];
    if (matches.some((match) => match[0].key !== row.key)) { errors.push(`${prefix}el ID y la serie identifican contratos distintos.`); continue; }
    if (seen.has(row.key)) { errors.push(`${prefix}el contrato está repetido en el archivo.`); continue; }
    seen.add(row.key);
    preview.push({ key: row.key, status, identifier: (candidates as string[]).join(" / "), customerName: row.customer.name, contractId: row.contract.id, previousStatus: row.contract.status });
  }
  return { updates: errors.length ? [] : preview.map(({ key, status }) => ({ key, status })), errors, preview };
}
