/**
 * Testes da calculadora de pontos da mesa do Torneio: expressão, atalhos e soma.
 *
 * Uso: npm run test:expressao-pontos
 */
import assert from 'node:assert/strict'
import {
  apagar,
  avaliar,
  digitar,
  inserirValor,
  operar,
  resolver,
  somaFecha,
  temOperacao,
} from '../src/dominios/centerpiece/logica/expressaoPontos'

// 30.000 − mangan
let e = inserirValor(operar('30000', '-'), 8000)
assert.equal(e, '30000-8000')
assert.equal(avaliar(e), 22000)
assert.ok(temOperacao(e))
assert.equal(resolver(e), '22000')
// Número direto ("chapado"): C e digita
e = digitar(digitar(digitar('', '2'), '5'), '000')
assert.equal(avaliar(e), 25000)
assert.equal(digitar('', '000'), '')
assert.equal(digitar('0', '7'), '7')
// Negativo
assert.equal(avaliar(inserirValor(operar('8000', '-'), 12000)), -4000)
assert.equal(avaliar(digitar(operar('', '-'), '5')), -5)
assert.equal(operar('', '+'), '')
// Troca de operador e apagar
assert.equal(operar('30000-', '+'), '30000+')
assert.equal(apagar('30000-8'), '30000-')
assert.equal(avaliar('30000-'), 30000)
// Atalho sem operador pendente soma
assert.equal(inserirValor('30000', 1000), '30000+1000')
// Soma
assert.deepEqual(somaFecha(120000, 120000, 'primeiro'), { fecha: true, depositosNaMesa: 0 })
assert.deepEqual(somaFecha(118000, 120000, 'primeiro'), { fecha: false, depositosNaMesa: 0 })
assert.deepEqual(somaFecha(118000, 120000, 'perdidos'), { fecha: true, depositosNaMesa: 2 })
assert.deepEqual(somaFecha(118500, 120000, 'perdidos'), { fecha: false, depositosNaMesa: 0 })
assert.deepEqual(somaFecha(121000, 120000, 'perdidos'), { fecha: false, depositosNaMesa: 0 })
console.log('Expressão de pontos ok.')
