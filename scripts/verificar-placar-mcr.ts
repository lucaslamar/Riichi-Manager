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
import {
  classificacao,
  minutosRestantes,
  pontosDeMesa,
} from '../src/dominios/placar-mcr/logica/torneio'

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
// Torneio: pontos de mesa 4/2/1/0, empate dividindo as colocações (regra da EMA).
assert.deepEqual(pontosDeMesa([100, 50, 0, -150]), [4, 2, 1, 0])
assert.deepEqual(pontosDeMesa([60, 60, -40, -80]), [3, 3, 1, 0], 'Dois em 1º dividem 4 e 2')
assert.deepEqual(pontosDeMesa([80, 0, 0, -80]), [4, 1.5, 1.5, 0], 'Dois em 2º dividem 2 e 1')
assert.deepEqual(pontosDeMesa([0, 0, 0, 0]), [1.75, 1.75, 1.75, 1.75], 'Quatro empatados')
{
  const mesa = (id: string, mao: Parameters<typeof registrarMao>[1]) => ({
    ...registrarMao(novoPlacar(id, ['a', 'b', 'c', 'd'], 0, '2026-11-20'), mao),
    finalizadoEm: '2026-11-20',
    torneio: { id: 't1', fimSessaoEm: null },
  })
  // a vence a 1ª mesa (tsumo 8: +48) e b a 2ª (tsumo 24: +96): os dois somam 4 + 0 de mesa.
  const mesas = [
    mesa('m1', { tipo: 'vitoria', vencedor: 0, forma: 'tsumo', fan: 8 }),
    mesa('m2', { tipo: 'vitoria', vencedor: 1, forma: 'tsumo', fan: 24 }),
    { ...novoPlacar('fora', ['a', 'b', 'c', 'd'], 0, '2026-11-20'), finalizadoEm: '2026-11-20' },
  ]
  const tabela = classificacao('t1', mesas)
  assert.deepEqual(
    tabela.map((linha) => linha.jogadorId).slice(0, 2),
    ['b', 'a'],
    'Mesmos pontos de mesa: desempata pela soma das partidas',
  )
  assert.equal(tabela[0].pontosMesa, tabela[1].pontosMesa)
  assert.equal(tabela[0].mesas, 2, 'Só as mesas do torneio contam')
}
assert.equal(minutosRestantes(null, new Date()), null)
assert.equal(minutosRestantes('2026-11-20T10:30:00Z', new Date('2026-11-20T10:00:00Z')), 30)
assert.equal(minutosRestantes('2026-11-20T10:00:00Z', new Date('2026-11-20T11:00:00Z')), 0)
console.log('Placar MCR ok: 24 testes.')
