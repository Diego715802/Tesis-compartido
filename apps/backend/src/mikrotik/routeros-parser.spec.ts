import { describe, expect, it } from 'vitest';
import {
  parseRouterOsBytes,
  parseRouterOsHealth,
  parseRouterOsKeyValues,
  parseRouterOsRecords,
} from './routeros-parser.js';

describe('RouterOS parsers', () => {
  it('parses resource output in as-value format', () => {
    expect(parseRouterOsKeyValues('uptime=1d2h;cpu-load=14;free-memory=512MiB')).toEqual({
      uptime: '1d2h',
      'cpu-load': '14',
      'free-memory': '512MiB',
    });
  });

  it('parses multiple RouterOS records', () => {
    expect(parseRouterOsRecords('name=ether1;running=true;rx-byte=20\nname=ether2;running=false;rx-byte=5')).toHaveLength(2);
  });

  it('normalizes health name/value records', () => {
    expect(parseRouterOsHealth('name=temperature;value=42;type=C\nname=voltage;value=24.2;type=V')).toMatchObject({
      temperature: '42C',
      voltage: '24.2V',
    });
  });

  it('converts binary memory units to bytes', () => {
    expect(parseRouterOsBytes('2MiB')).toBe(2 * 1024 * 1024);
  });
});
