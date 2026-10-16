import { describe, expect, it } from 'vitest';
import { cmcConnection } from './cmc-config.js';

const secret = 'fixture-bridge-key-with-at-least-forty-three-characters';
const local = () => ({ CMC_BRIDGE_URL: 'http://127.0.0.1:3012', CMC_BRIDGE_SECRET: secret, CMC_PUBLIC_URL: 'http://localhost:3010' });

describe('Local CMC connection configuration', () => {
  it('is optional until configured and resolves only the fixed bridge endpoint', () => {
    expect(cmcConnection({})).toBeUndefined();
    expect(cmcConnection(local())).toEqual({ endpoint: 'http://127.0.0.1:3012/bridge', secret, publicUrl: 'http://localhost:3010' });
    expect(cmcConnection({ ...local(), CMC_BRIDGE_URL: 'http://[::1]:3012/', CMC_PUBLIC_URL: 'http://[::1]:3010/' })?.endpoint).toBe('http://[::1]:3012/bridge');
  });

  it.each([
    'http://localhost:3012', 'https://127.0.0.1:3012', 'http://192.168.1.1:3012', 'http://0.0.0.0:3012',
    'http://public.example.test', 'file:///tmp/site', 'http://user:password@127.0.0.1:3012',
    'http://127.0.0.1:3012/other', 'http://127.0.0.1:3012/?redirect=other', 'http://127.0.0.1:3012/#other',
  ])('rejects arbitrary bridge destinations: %s', (url) => {
    expect(() => cmcConnection({ ...local(), CMC_BRIDGE_URL: url })).toThrow();
  });

  it.each([
    'https://localhost:3010', 'http://public.example.test', 'http://0.0.0.0:3010', 'http://192.168.1.1:3010',
    'http://user:password@localhost:3010', 'http://localhost:3010/other', 'http://localhost:3010/?other=1', 'http://localhost:3010/#other',
  ])('rejects non-local or ambiguous public URLs: %s', (url) => {
    expect(() => cmcConnection({ ...local(), CMC_PUBLIC_URL: url })).toThrow();
  });

  it('rejects partial configuration and short bridge secrets', () => {
    expect(() => cmcConnection({ CMC_BRIDGE_URL: local().CMC_BRIDGE_URL })).toThrow();
    expect(() => cmcConnection({ CMC_BRIDGE_SECRET: secret })).toThrow();
    expect(() => cmcConnection({ CMC_PUBLIC_URL: local().CMC_PUBLIC_URL })).toThrow();
    expect(() => cmcConnection({ ...local(), CMC_BRIDGE_SECRET: 'short' })).toThrow();
  });
});
