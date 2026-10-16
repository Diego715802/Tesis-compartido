#!/usr/bin/env node
'use strict';
// Catálogo SQL real, sin registros, contraseñas, sesiones ni cadenas de conexión.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');const {Pool}=require('pg');
const root=path.resolve(__dirname,'..');const out=path.join(root,'docs/database-model');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
async function main(){
 const p=new Pool({host:path.join(os.homedir(),'Library/Application Support/ComeCore/PostgreSQL18/socket'),user:os.userInfo().username,database:'comecore'});
 try{
 const tables=(await p.query(`SELECT c.oid::int,n.nspname AS schema,c.relname AS name,c.relrowsecurity AS rls,c.relforcerowsecurity AS force_rls,obj_description(c.oid,'pg_class') AS description FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' ORDER BY 2,3`)).rows;
 const columns=(await p.query(`SELECT a.attrelid::int AS table_oid,a.attnum,a.attname AS name,format_type(a.atttypid,a.atttypmod) AS type,a.attnotnull AS not_null FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE a.attnum>0 AND NOT a.attisdropped AND c.relkind='r' AND n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' ORDER BY a.attrelid,a.attnum`)).rows;
 const constraints=(await p.query(`SELECT oid::int,conname AS name,conrelid::int AS child_oid,confrelid::int AS parent_oid,contype AS type,conkey AS child_keys,confkey AS parent_keys,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid=ANY($1::oid[]) ORDER BY conrelid,conname`,[tables.map(t=>t.oid)])).rows;
 const policies=(await p.query(`SELECT schemaname AS schema,tablename AS table_name,policyname,cmd,roles,qual,with_check FROM pg_policies WHERE schemaname NOT LIKE 'pg_%' ORDER BY 1,2,3`)).rows;
 const indexes=(await p.query(`SELECT schemaname AS schema,tablename AS table_name,indexname,indexdef FROM pg_indexes WHERE schemaname NOT LIKE 'pg_%' AND schemaname<>'information_schema' ORDER BY 1,2,3`)).rows;
 const uniqueKeys=(await p.query(`SELECT i.indrelid::int AS table_oid,ARRAY(SELECT k FROM unnest(i.indkey) WITH ORDINALITY AS a(k,pos) WHERE pos<=i.indnkeyatts)::int[] AS keys FROM pg_index i WHERE i.indisunique AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indrelid=ANY($1::oid[])`,[tables.map(t=>t.oid)])).rows;
 const migrations=(await p.query('SELECT version,checksum,applied_at FROM app_private.schema_migrations ORDER BY version')).rows;
 const roles=(await p.query(`SELECT rolname,rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls,rolconnlimit FROM pg_roles WHERE rolname LIKE 'comecore_%' ORDER BY rolname`)).rows;
 for(const t of tables){t.key=t.schema+'.'+t.name;t.columns=columns.filter(c=>c.table_oid===t.oid);t.constraints=constraints.filter(c=>c.child_oid===t.oid);t.policies=policies.filter(c=>c.schema===t.schema&&c.table_name===t.name);t.indexes=indexes.filter(c=>c.schema===t.schema&&c.table_name===t.name);}
 const map=new Map(tables.map(t=>[t.oid,t]));
 const relations=constraints.filter(c=>c.type==='f').map(c=>{const child=map.get(c.child_oid),parent=map.get(c.parent_oid);const unique=uniqueKeys.some(k=>k.table_oid===c.child_oid&&k.keys.every(v=>c.child_keys.includes(v)));return {...c,child:child.key,parent:parent.key,child_columns:c.child_keys.map(v=>child.columns.find(a=>a.attnum===v).name),parent_columns:c.parent_keys.map(v=>parent.columns.find(a=>a.attnum===v).name),cardinality:unique?'1:1':'1:N',optional:c.child_keys.some(v=>!child.columns.find(a=>a.attnum===v).not_null)};});
 const model={generated_at:new Date().toISOString(),database:'comecore',tables,relations,roles,migrations};
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(model,null,2));
 const md=['# Modelo PostgreSQL actual de ComeCore','',`Generado del catálogo real: ${tables.length} tablas, ${relations.length} claves foráneas. No contiene registros de negocio ni secretos.`,'','## Cardinalidades','',...relations.map(r=>`- **${r.parent} → ${r.child}: ${r.cardinality}** (${r.optional?'vínculo opcional':'vínculo obligatorio'}). FK \`${r.name}\`; ${r.child_columns.join(', ')} → ${r.parent_columns.join(', ')}.`),'','## Diccionario',''];
 for(const t of tables){md.push('### '+t.key,'',`RLS: ${t.rls}; FORCE: ${t.force_rls}. ${t.description||''}`,'','| Columna | Tipo | Nulo | Clave |','|---|---|---|---|',...t.columns.map(c=>`| ${c.name} | ${c.type} | ${c.not_null?'No':'Sí'} | ${t.constraints.filter(k=>['p','f','u'].includes(k.type)&&k.child_keys?.includes(c.attnum)).map(k=>({p:'PK',f:'FK',u:'UQ'})[k.type]).join(', ')} |`),'',...t.constraints.filter(c=>c.type==='c').map(c=>'- '+c.definition),'');}
 fs.writeFileSync(path.join(out,'dictionary.md'),md.join('\n'));
 const connection='postgres-jdbc-1a121c52ebc-68bb2c9358d996f1';
 const groups=[{name:'03-ERP-completo',set:tables},...['iam','crm','service','catalog','network','inventory','billing','cms','documents','authn','security'].map((s,i)=>({name:String(i+4).padStart(2,'0')+'-'+s,set:tables.filter(t=>t.schema===s)}))];
 const diagramDir=path.join(root,'database/dbeaver/diagrams');
 for(const g of groups){const own=new Set(g.set.map(t=>t.oid));const rs=relations.filter(r=>own.has(r.child_oid));const included=new Set([...own,...rs.map(r=>r.parent_oid)]);const entities=tables.filter(t=>included.has(t.oid));let xml='<?xml version="1.0" encoding="utf-8"?>\n<diagram version="1" name="COMECORE - '+esc(g.name)+'"><entities><data-source id="'+connection+'">';for(const t of entities)xml+='<entity id="'+t.oid+'" name="'+esc(t.name)+'" fq-name="'+esc(t.key)+'" showAttrs="KEYS"><path name="'+esc(t.schema)+'"/><path name="comecore"/></entity>';xml+='</data-source></entities><relations>';for(const r of rs)xml+='<relation name="'+esc(r.name)+'" fq-name="'+esc(r.child+'.'+r.name)+'" type="fk" pk-ref="'+r.parent_oid+'" fk-ref="'+r.child_oid+'"/>';xml+='</relations><notes/></diagram>\n';fs.writeFileSync(path.join(diagramDir,'COMECORE-'+g.name+'.erd'),xml);}
 const mermaid=['erDiagram',...relations.filter(r=>!['created_by','updated_by','organization_id','actor_user_id'].some(k=>r.child_columns.length===1&&r.child_columns[0]===k)).map(r=>`  ${r.parent.replaceAll('.','_')} ${r.optional?'o|':'||'}--${r.cardinality==='1:1'?'o|':'o{'} ${r.child.replaceAll('.','_')} : "${r.child_columns.filter(c=>c!=='organization_id').join(', ')}"`)];
 fs.writeFileSync(path.join(out,'relationships.mmd'),mermaid.join('\n')+'\n');
 let html=fs.readFileSync(path.join(__dirname,'database-model-template.html'),'utf8');html=html.replace('__CATALOG__',()=>JSON.stringify(model).replaceAll('<','\\u003c'));fs.writeFileSync(path.join(out,'index.html'),html);
 console.log(`Catálogo y diagramas generados: ${tables.length} tablas, ${relations.length} FK, ${groups.length} diagramas DBeaver.`);
 }finally{await p.end();}
}
main().catch(()=>{console.error('No se pudo generar el modelo del catálogo local.');process.exitCode=1;});
