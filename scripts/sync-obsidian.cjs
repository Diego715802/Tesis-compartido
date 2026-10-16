#!/usr/bin/env node
'use strict';

// Sincronización explícita y conservadora: nunca sobrescribe una nota editada en la bóveda.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'docs', 'obsidian', 'ComeCore');
const vault = path.resolve(process.argv[2] || path.join(os.homedir(), 'Documents', 'Obsidian Vault'));
const target = path.join(vault, 'ComeCore');
const stateFile = path.join(os.homedir(), 'Library', 'Application Support', 'ComeCore', 'obsidian-sync.json');
const digest = content => crypto.createHash('sha256').update(content).digest('hex');

function walk(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`No se siguen enlaces simbólicos: ${relative}`);
    return entry.isDirectory() ? walk(path.join(directory, entry.name), relative) : [relative];
  });
}
try {
  if (!fs.existsSync(path.join(vault, '.obsidian'))) throw new Error('La ruta debe ser una bóveda Obsidian existente.');
  const saved = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { vault, hashes: {} };
  if (saved.vault !== vault) throw new Error('La bóveda difiere de la sincronización previa; revisar antes de continuar.');
  const updates = [];
  const conflicts = [];
  for (const relative of walk(source)) {
    const content = fs.readFileSync(path.join(source, relative));
    const hash = digest(content);
    const destination = path.join(target, relative);
    if (fs.existsSync(destination)) {
      if (fs.lstatSync(destination).isSymbolicLink()) throw new Error(`Destino es un enlace simbólico: ${relative}`);
      const existing = digest(fs.readFileSync(destination));
      if (existing !== hash && existing !== saved.hashes[relative]) conflicts.push(relative);
    }
    updates.push({ relative, content, hash, destination });
  }
  if (conflicts.length) throw new Error('Notas modificadas en Obsidian; conservar y conciliar antes de sincronizar: ' + conflicts.join(', '));
  for (const update of updates) {
    fs.mkdirSync(path.dirname(update.destination), { recursive: true });
    const temp = update.destination + '.comecore-sync.tmp';
    fs.writeFileSync(temp, update.content);
    fs.renameSync(temp, update.destination);
    saved.hashes[update.relative] = update.hash;
  }
  fs.mkdirSync(path.dirname(stateFile), { recursive: true, mode: 0o700 });
  fs.writeFileSync(stateFile, JSON.stringify(saved, null, 2), { mode: 0o600 });
  process.stdout.write(`${updates.length} archivos sincronizados en ${target}. No se eliminó ninguna nota.\n`);
} catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
