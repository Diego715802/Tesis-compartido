#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {Pool}=require('pg');
async function main(){
 const name=process.argv[2];if(!/^\d{3}_[a-z0-9_]+\.sql$/.test(name||''))throw new Error('Indicar una migración SQL del proyecto.');
 const pool=new Pool({host:path.join(os.homedir(),'Library/Application Support/ComeCore/PostgreSQL18/socket'),user:os.userInfo().username,database:'comecore'});
 const c=await pool.connect();try{
  await c.query("SELECT pg_advisory_lock(hashtext('comecore_schema_migrations'))");
  for(const row of (await c.query('SELECT version,checksum FROM app_private.schema_migrations')).rows){
   const file=path.join(__dirname,'../database/migrations',row.version);
   if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==row.checksum)throw new Error('Historial de migraciones no coincide con archivos; se conserva la base.');
  }
  const content=fs.readFileSync(path.join(__dirname,'../database/migrations',name),'utf8');
  const digest=crypto.createHash('sha256').update(content).digest('hex');
  const found=await c.query('SELECT checksum FROM app_private.schema_migrations WHERE version=$1',[name]);
  if(found.rowCount){if(found.rows[0].checksum!==digest)throw new Error('Migración aplicada modificada.');console.log('Migración ya aplicada: '+name);return;}
  if(!/COMMIT;\s*$/i.test(content))throw new Error('Migración exige COMMIT final.');
  // SQL local versionado; la única interpolación es el nombre validado y digest hexadecimal.
  await c.query(content.replace(/COMMIT;\s*$/i,"INSERT INTO app_private.schema_migrations(version,checksum)VALUES('"+name+"','"+digest+"'); COMMIT;"));
  console.log('Migración confirmada: '+name);
 }catch(error){await c.query('ROLLBACK');throw error;}finally{await c.query("SELECT pg_advisory_unlock(hashtext('comecore_schema_migrations'))");c.release();await pool.end();}
}
main().catch(error=>{console.error('Migración no confirmada: '+(error.code||error.message));process.exitCode=1;});
