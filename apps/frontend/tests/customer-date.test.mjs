import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatCustomerDate} from '../src/features/clientes/customer-date.ts';
test('cliente persistido admite timestamp ISO sin concatenar otra hora',()=>{
 assert.equal(formatCustomerDate('2026-10-12T16:45:00.000Z'),formatCustomerDate('2026-10-12'));
});
test('fecha vacía o inválida no derriba el directorio',()=>{
 assert.equal(formatCustomerDate(''),'Sin fecha');assert.equal(formatCustomerDate('no-es-fecha'),'Sin fecha');
});
