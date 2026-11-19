/**
 * Testes do placar MCR: pontos de cada mão, totais, colocações e rodízio do dealer.
 *
 * Uso: npm run test:placar-mcr
 */
import assert from 'node:assert/strict'
import {
  colocacoes,
  dealerDaMao,
  desfazerUltimaMao,
  finalizar,
  novoPlacar,
  pontosDaMao,
  registrarMao,
  totais,
  validarMao,
  ventoDaRodada,
} from '../src/dominios/placar-mcr/logica/placar'

assert.deepEqual(
  pontosDaMao({ tipo: 'vitoria', vencedor: 0, forma: 'ron', descartador: 2, fan: 8 }),
  [32, -8, -16, -8],
)
assert.deepEqual(
  pontosDaMao({ tipo: 'vitoria', vencedor: 1, forma: 'tsumo', fan: 24 }),
  [-32, 96, -32, -32],
)
assert.deepEqual(pontosDaMao({ tipo: 'empate' }), [0, 0, 0, 0])
assert.deepEqual(
  pontosDaMao({ tipo: 'vitoria', vencedor: 0, forma: 'ron', fan: 8 }),
  [0, 0, 0, 0],
  'Ron sem descartador não pontua',
)

assert.equal(
  validarMao({ tipo: 'vitoria', vencedor: 0, forma: 'ron', descartador: 1, fan: 7 }),
  'fanMinimo',
)
assert.equal(validarMao({ tipo: 'vitoria', vencedor: 0, forma: 'ron', fan: 8 }), 'semDescartador')
assert.equal(
  validarMao({ tipo: 'vitoria', vencedor: 0, forma: 'ron', descartador: 0, fan: 8 }),
  'descartadorVencedor',
)

let placar = novoPlacar('p', ['a', 'b', 'c', 'd'], 30, '2026-11-19')
placar = registrarMao(placar, {
  tipo: 'vitoria',
  vencedor: 0,
  forma: 'ron',
  descartador: 2,
  fan: 8,
})
placar = registrarMao(placar, { tipo: 'vitoria', vencedor: 1, forma: 'tsumo', fan: 24 })
placar = registrarMao(placar, {
  tipo: 'vitoria',
  vencedor: 3,
  forma: 'ron',
  descartador: 0,
  fan: 5,
})
assert.equal(placar.maos.length, 2, 'Mão inválida não entra')
assert.deepEqual(totais(placar), [0, 88, -48, -40])
assert.equal(
  totais(placar).reduce((a, b) => a + b, 0),
  0,
  'A soma do placar é zero',
)
assert.deepEqual(colocacoes([10, 10, -5, -15]), [1, 1, 3, 4])
assert.equal(placar.vez.cadeira, 2, 'A vez da próxima mão é do novo dealer')
assert.equal(desfazerUltimaMao(placar).maos.length, 1)

assert.deepEqual([0, 3, 4, 15].map(dealerDaMao), [0, 3, 0, 3])
assert.deepEqual([0, 3, 4, 15].map(ventoDaRodada), [0, 0, 1, 3])

const fechado = finalizar(placar, '2026-11-19')
assert.equal(registrarMao(fechado, { tipo: 'empate' }).maos.length, 2, 'Finalizado não recebe mãos')
console.log('Placar MCR ok: 15 testes.')
