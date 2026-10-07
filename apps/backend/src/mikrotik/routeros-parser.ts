type RosRecord = Record<string, string>;

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replaceAll('_', '-');
}

export function parseRouterOsKeyValues(output: string): RosRecord {
  const record: RosRecord = {};

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('Flags:') || line.startsWith('Columns:')) {
      continue;
    }

    for (const segment of line.split(';')) {
      const equalsIndex = segment.indexOf('=');
      const colonIndex = segment.indexOf(':');
      const separatorIndex = equalsIndex >= 0 ? equalsIndex : colonIndex;
      if (separatorIndex < 0) continue;

      const key = normalizeKey(segment.slice(0, separatorIndex));
      const value = segment.slice(separatorIndex + 1).trim();
      if (key) record[key] = value;
    }
  }

  return record;
}

export function parseRouterOsRecords(output: string): RosRecord[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('='))
    .map((line) => parseRouterOsKeyValues(line))
    .filter((record) => Object.keys(record).length > 0);
}

export function parseRouterOsHealth(output: string): RosRecord {
  const directValues = parseRouterOsKeyValues(output);
  const records = parseRouterOsRecords(output);

  for (const record of records) {
    const name = record.name;
    const value = record.value;
    if (name && value !== undefined) {
      directValues[normalizeKey(name)] = record.type
        ? `${value}${record.type}`
        : value;
    }
  }

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    const tableMatch = line.match(/^\d+\s+([\w-]+)\s+(-?[\d.]+)\s*([\w/%°.-]+)?$/);
    if (tableMatch) {
      directValues[normalizeKey(tableMatch[1])] = `${tableMatch[2]}${tableMatch[3] ?? ''}`;
    }
  }

  return directValues;
}

export function parseBoolean(value: string | undefined) {
  return value === 'true' || value === 'yes';
}

export function parseRouterOsNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replaceAll(',', '').match(/-?[\d.]+/)?.[0] ?? '');
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRouterOsBytes(value: string | undefined) {
  if (!value) return 0;
  const numeric = parseRouterOsNumber(value) ?? 0;
  const normalized = value.toLowerCase();
  if (normalized.includes('gib')) return numeric * 1024 ** 3;
  if (normalized.includes('mib')) return numeric * 1024 ** 2;
  if (normalized.includes('kib')) return numeric * 1024;
  if (normalized.includes('gb')) return numeric * 1000 ** 3;
  if (normalized.includes('mb')) return numeric * 1000 ** 2;
  if (normalized.includes('kb')) return numeric * 1000;
  return numeric;
}
