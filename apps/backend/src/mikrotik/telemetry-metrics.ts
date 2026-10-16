import { parseRouterOsNumber } from './routeros-parser.js';
import type { MikrotikHealthSensor } from './mikrotik.types.js';

// RouterOS CLI reports native units. Do not apply the SNMP scaling here.
export function healthSensors(source: Record<string, string>): MikrotikHealthSensor[] {
  return Object.entries(source).flatMap(([name, raw]) => {
    const value = parseRouterOsNumber(raw);
    if (value === null) return [];
    const unit = /temperature|(?:^|-)temp(?:$|-)/.test(name) ? 'C'
      : /fan.*speed/.test(name) ? 'RPM'
      : /voltage/.test(name) ? 'V'
      : /current/.test(name) ? 'A'
      : /power-consumption|^power$/.test(name) ? 'W' : null;
    return unit ? [{ name, value, unit }] : [];
  }).slice(0, 64);
}

export function counterRate(current: number, previous: number | undefined, elapsedSeconds: number) {
  if (previous === undefined || !Number.isFinite(current) || !Number.isFinite(previous)
    || elapsedSeconds <= 0 || elapsedSeconds > 60 || current < previous) return null;
  return Math.round(((current - previous) * 8) / elapsedSeconds);
}
