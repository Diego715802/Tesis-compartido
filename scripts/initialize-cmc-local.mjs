import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Copy public content into the private local store once. Never overwrite a draft,
// import identities, or write to the live website.
const file = path.join(os.homedir(), 'Library/Application Support/ComeCore/CMC/local-connection.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
Object.assign(process.env, config.environment);
const { createFileStore } = await import(pathToFileURL(path.join(config.projectRoot, 'backend/storage/store.mjs')));
const { assertCompleteSite } = await import(pathToFileURL(path.join(config.projectRoot, 'backend/integrations/erp-context.mjs')));
const store = createFileStore('cometalink-cmc', config.environment.CMC_STORAGE_DIR, { key: Buffer.from(config.environment.CMC_DATA_ENCRYPTION_KEY, 'hex') });
if (await store.get('config/site', { type: 'json' })) {
  process.stdout.write('El CMC local ya tiene contenido. Se conservó sin sobrescribirlo.\n');
} else {
  let site; let source;
  if (process.argv.includes('--from-public')) {
    source = 'https://cometalink.net/api/site';
    const response = await fetch(source, { headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error('No se pudo leer el contenido público; el almacenamiento local sigue sin inicializar.');
    const body = await response.text();
    if (Buffer.byteLength(body, 'utf8') > 300_000) throw new Error('El documento público excede el límite local.');
    site = JSON.parse(body);
  } else if (process.argv.includes('--from-reference')) {
    source = 'docs/reference/published-site.json';
    site = JSON.parse(fs.readFileSync(path.join(config.projectRoot, source), 'utf8'));
  } else throw new Error('Elige --from-public para copiar la web pública o --from-reference para una instantánea histórica del proyecto.');
  // Optional field in the public model; normalize without altering its meaning.
  for (const plan of site.plans ?? []) plan.popular = Boolean(plan.popular);
  assertCompleteSite(site);
  await store.setJSON('config/site', site);
  // Already reflected in the imported public snapshot: do not reapply historical
  // contact/pricing migrations on the new local copy.
  for (const name of ['2026-08-19-calaveras-contact', '2026-08-19-pricing-289-389-549', '2026-08-21-attention-channels-v3', '2026-08-21-hero-greeting-v1', '2026-08-21-prepublication-compliance-v1']) {
    await store.setJSON(`migrations/${name}`, { appliedAt: new Date().toISOString(), source: 'public-content-import' });
  }
  await store.setJSON('local/import', { source, importedAt: new Date().toISOString(), checksum: createHash('sha256').update(JSON.stringify(site)).digest('hex') });
  process.stdout.write(`Contenido copiado desde ${source} al almacén local cifrado. El sitio público no se modificó.\n`);
}
