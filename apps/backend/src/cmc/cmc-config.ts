export type CmcConnection = { endpoint: string; secret: string; publicUrl: string };

/** Fixed server configuration. The browser can never choose an upstream or key. */
export function cmcConnection(env: NodeJS.ProcessEnv = process.env): CmcConnection | undefined {
  if (!env.CMC_BRIDGE_URL && !env.CMC_BRIDGE_SECRET && !env.CMC_PUBLIC_URL) return undefined;
  const target = new URL(env.CMC_BRIDGE_URL ?? '');
  const publicUrl = new URL(env.CMC_PUBLIC_URL ?? '');
  if (target.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(target.hostname)
    || target.username || target.password || target.pathname !== '/' || target.search || target.hash
    || !env.CMC_BRIDGE_SECRET || env.CMC_BRIDGE_SECRET.length < 43
    || publicUrl.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(publicUrl.hostname)
    || publicUrl.username || publicUrl.password || publicUrl.pathname !== '/' || publicUrl.search || publicUrl.hash) {
    throw new Error('La conexión local del CMC no está configurada correctamente.');
  }
  return { endpoint: `${target.origin}/bridge`, secret: env.CMC_BRIDGE_SECRET, publicUrl: publicUrl.origin };
}
