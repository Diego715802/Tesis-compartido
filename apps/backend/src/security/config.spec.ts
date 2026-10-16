import {describe,it,expect} from 'vitest';
import {securityConfig} from './config.js';
const env = {
 AUTH_PUBLIC_ORIGIN:'http://localhost:3000',AUTH_DEPLOYMENT:'local',BETTER_AUTH_SECRET:'x'.repeat(43),AUTH_GATEWAY_SECRET:'y'.repeat(43),WORKSPACE_ENCRYPTION_KEY:'z'.repeat(43),
 AUTH_DATABASE_URL:'postgresql://fake@localhost/comecore',DATABASE_URL:'postgresql://fake@localhost/comecore',
};
describe('configuración de frontera pública',()=>{
 it('MikroTik configurado exige organización y huella',()=>{expect(()=>securityConfig({...env,MIKROTIK_HOST:'192.0.2.1'})).toThrow('organización');});
 it('acepta binding UUID y SHA256 verificado',()=>{const c=securityConfig({...env,MIKROTIK_HOST:'192.0.2.1',MIKROTIK_ORGANIZATION_ID:'73000000-0000-4000-8000-000000000001',MIKROTIK_SSH_HOST_HASH:'a'.repeat(64)});expect(c.mikrotikEnabled).toBe(true);});
 it('publicación rechaza HTTP',()=>{expect(()=>securityConfig({...env,AUTH_DEPLOYMENT:'public'})).toThrow('HTTPS');});
 it('publicación rechaza PostgreSQL sin verify-full',()=>{expect(()=>securityConfig({...env,AUTH_PUBLIC_ORIGIN:'https://erp.example.invalid',AUTH_DEPLOYMENT:'public',AUTH_TRUST_PROXY_HEADER:'x-real-ip',SMTP_HOST:'smtp.example.invalid',SMTP_USER:'fake',SMTP_PASSWORD:'fake',SMTP_FROM:'fake@example.invalid'})).toThrow('TLS verify-full');});
});
