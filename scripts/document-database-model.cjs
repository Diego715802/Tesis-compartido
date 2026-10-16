#!/usr/bin/env node
'use strict';
// Solo metadatos del catálogo previamente extraído. No accede a filas de negocio.
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'docs/database-model');
const target = path.join(root, 'docs/obsidian/ComeCore/Modelo');
const model = JSON.parse(fs.readFileSync(path.join(source, 'catalog.json'), 'utf8'));
const schemas = [...new Set(model.tables.map(t => t.schema))];
const id = name => name.replaceAll('.', '_');
const core = r => !(r.child_columns.length === 1 && ['organization_id','created_by','updated_by','actor_user_id'].includes(r.child_columns[0]));
fs.mkdirSync(target, { recursive: true });
fs.copyFileSync(path.join(source, 'dictionary.md'), path.join(target, 'Diccionario.md'));
const index = ['# Relaciones implementadas de ComeCore', '', `Catálogo PostgreSQL: ${model.tables.length} tablas, ${model.relations.length} FK. Extracción: ${model.generated_at}.`, '', 'Los diagramas de cada dominio ocultan enlaces repetidos de organización/autoría para facilitar la lectura. El diccionario y el visor permiten consultar todas las FK. No contienen registros ni secretos.', '', 'Una FK obligatoria exige un padre por hijo. No exige hijos para todo padre. N:M se expresa mediante dos relaciones con una tabla intermedia.', '', '[[../11-Modelo-ERP-Completo|Alcance y persistencia]] · [[Diccionario|Diccionario completo]]', ''];
for (const schema of schemas) {
  const tables = model.tables.filter(t => t.schema === schema);
  const relations = model.relations.filter(r => r.child.startsWith(schema + '.') && core(r));
  const graph = ['erDiagram'];
  const included = new Set([...tables.map(t => t.key), ...relations.map(r => r.parent)]);
  for (const name of included) {
    const table = model.tables.find(t => t.key === name);
    const pk = table.constraints.find(c => c.type === 'p');
    const fields = (pk?.child_keys || [table.columns[0].attnum]).map(k => table.columns.find(c => c.attnum === k));
    graph.push(`    ${id(name)} {`, ...fields.map(c => `        ${c.type.replace(/\(.*/, '').replaceAll(' ', '_').replaceAll('[]','_array')} ${c.name}${pk ? ' PK' : ''}`), '    }');
  }
  for (const r of relations) graph.push(`    ${id(r.parent)} ${r.optional ? 'o|' : '||'}--${r.cardinality === '1:1' ? 'o|' : 'o{'} ${id(r.child)} : "${r.child_columns.filter(c => c !== 'organization_id').join(', ')}"`);
  const lines = [`# Dominio ${schema}`, '', `Tablas propias: ${tables.length}. Se muestran las PK y los enlaces de negocio; los tipos y columnas completos están en [[Diccionario]].`, '', '```mermaid', ...graph, '```', '', '## Tablas implementadas', '', ...tables.map(t => `- **${t.key}**: ${t.columns.length} columnas; ${t.force_rls ? 'RLS forzado' : 'tabla técnica con ACL privada'}.`), '', '## Cardinalidades de negocio', '', ...relations.map(r => `- ${r.parent} → ${r.child}: **${r.cardinality}**, padre ${r.optional ? 'opcional' : 'obligatorio'} para cada hijo. FK: \`${r.name}\`.`), '', '[[00-Relaciones|Volver al mapa de relaciones]]', ''];
  fs.writeFileSync(path.join(target, schema + '.md'), lines.join('\n'));
  index.push(`- [[${schema}|${schema}]]: ${tables.length} tablas.`);
}
fs.writeFileSync(path.join(target, '00-Relaciones.md'), index.join('\n') + '\n');
console.log(`Obsidian: diccionario y ${schemas.length} diagramas por dominio generados de PostgreSQL.`);
