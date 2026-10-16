import {describe,it,expect,vi} from 'vitest';
import type {Pool} from 'pg';
import {verifyDatabaseBoundary} from './database-boundaries.js';
const pool=(row:object)=>({query:vi.fn().mockResolvedValue({rows:[row]})}) as unknown as Pool;
describe('frontera de privilegios SQL',()=>{
 it('acepta runtime sin poderes elevados ni propiedad',async()=>{await expect(verifyDatabaseBoundary(pool({elevated:false,owns_business:false,internal_member:false}),true)).resolves.toBeUndefined();});
 it.each(['elevated','owns_business','internal_member'])('rechaza runtime con %s',async field=>{await expect(verifyDatabaseBoundary(pool({elevated:false,owns_business:false,internal_member:false,[field]:true}),true)).rejects.toThrow('privilegios');});
 it('también rechaza bypass en conexión auth',async()=>{await expect(verifyDatabaseBoundary(pool({elevated:true,owns_business:false,internal_member:false}),false)).rejects.toThrow();});
});
