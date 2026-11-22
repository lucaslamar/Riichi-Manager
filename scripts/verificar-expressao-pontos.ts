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
  digitadoSobre,
  digitarSobre,
  expressaoDigitada,
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
// Teclado do sistema: mesmas regras das teclas
assert.equal(expressaoDigitada('-12300'), '-12300')
assert.equal(expressaoDigitada('-12.300'), '-12300')
assert.equal(expressaoDigitada('+500'), '500')
assert.equal(expressaoDigitada('30000--800'), '30000-800')
// Folha recém-aberta: o primeiro dígito troca o valor inteiro
assert.equal(digitarSobre('25000', '3', true), '3')
assert.equal(digitarSobre('-1200', '4', true), '4')
assert.equal(digitarSobre('25000', '0', true), '0')
assert.equal(digitarSobre('', '3', true), '3')
assert.equal(digitarSobre('25000', '000', true), '25000', '000 não abre número')
assert.equal(digitarSobre('3', '2', false), '32', 'depois continua')
assert.equal(digitarSobre('0', '7', false), '7')
// O mesmo pelo teclado do sistema, com o cursor em qualquer lugar
assert.equal(digitadoSobre('25000', '250003', true), '3')
assert.equal(digitadoSobre('25000', '325000', true), '3')
assert.equal(digitadoSobre('25000', '25500', true), '25500', 'trocar um dígito é correção')
assert.equal(digitadoSobre('25000', '2500', true), '2500', 'apagar tira só o último')
assert.equal(digitadoSobre('25000', '25000-', true), '25000-', 'operador continua a conta')
assert.equal(digitadoSobre('25000', '250003', false), '250003')
assert.equal(digitadoSobre('', '4', true), '4')
assert.equal(expressaoDigitada('007'), '7')
assert.equal(expressaoDigitada('12a3'), '123')
console.log('Expressão de pontos ok.')

assert.equal(digitar('3', '00'), '300', '00 completa o número')
assert.equal(digitar('', '00'), '', '00 não abre número')
assert.equal(digitar('0', '00'), '0', '00 não acumula zero à esquerda')
