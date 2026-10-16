#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const base=path.join(__dirname,'../database/checks');
const old=fs.readFileSync(path.join(base,'007_erp_checks.sql'),'utf8');
const added=fs.readFileSync(path.join(base,'008_module_checks.sql'),'utf8');
const content=old.replace(/ROLLBACK;\s*\\echo[^\n]*\s*$/i,added+'\nROLLBACK;\n');
if(content===old)throw new Error('No se encontró final transaccional de checks 007.');
const r=spawnSync('/Applications/Postgres.app/Contents/Versions/18/bin/psql',['-X','-w','-q','-v','ON_ERROR_STOP=1','-h',path.join(os.homedir(),'Library/Application Support/ComeCore/PostgreSQL18/socket'),'-U',os.userInfo().username,'-d','comecore'],{input:content,encoding:'utf8',maxBuffer:4*1024*1024});
if(r.status!==0){process.stderr.write(r.stderr||'Fallo SQL; conexión cerrada y fixtures revertidos.\n');process.exitCode=1;}else{console.log('Checks 007 + 008 aprobados; transacción de pruebas revertida, sin fixtures de negocio.');process.stdout.write(r.stdout.split('\n').filter(l=>l.startsWith('Checks ')).join('\n')+'\n');}
