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
  registrarFalsoHu,
  registrarMao,
  totais,
  validarMao,
  ventoDaRodada,
} from '../src/dominios/placar-mcr/logica/placar'
import { partidasDoTorneioMcr, pontosDeMesa } from '../src/dominios/placar-mcr/logica/torneio'
import {
  anotarFalsoHu,
  anotarMao,
  apagarMao,
  digitarTotal,
  fecharMaoEscrita,
  normalizarSumula,
  placarDaSumula,
  pontosDaSumula,
  SUMULA_VAZIA,
  type RascunhoSumula,
} from '../src/dominios/placar-mcr/logica/sumula'
import { classificar } from '../src/dominios/torneio/logica/classificacao'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'

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
  const mesa = (id: string, numero: number, mao: Parameters<typeof registrarMao>[1]) => ({
    ...registrarMao(novoPlacar(id, ['a', 'b', 'c', 'd'], 0, '2026-11-20'), mao),
    finalizadoEm: '2026-11-20',
    torneio: { id: 't1', rodada: numero, mesa: 0 },
  })
  // a vence a 1ª mesa (tsumo 8: +48) e b a 2ª (tsumo 24: +96): os dois somam 4 + 0 de mesa.
  const partidas = partidasDoTorneioMcr([
    mesa('m1', 0, { tipo: 'vitoria', vencedor: 0, forma: 'tsumo', fan: 8 }),
    mesa('m2', 1, { tipo: 'vitoria', vencedor: 1, forma: 'tsumo', fan: 24 }),
    { ...novoPlacar('fora', ['a', 'b', 'c', 'd'], 0, '2026-11-20'), finalizadoEm: '2026-11-20' },
  ])
  assert.equal(partidas.length, 2, 'Só os placares de torneio viram partidas dele')
  const torneio = {
    ...criarRascunho({ id: 't1', agora: new Date('2026-11-20'), nome: 'T' }),
    jogadorIds: ['a', 'b', 'c', 'd'],
  }
  const tabela = classificar(torneio, partidas)
  assert.deepEqual(
    tabela.map((linha) => linha.jogadorId).slice(0, 2),
    ['b', 'a'],
    'Mesmos pontos de mesa: desempata pela soma das partidas',
  )
  assert.equal(tabela[0].pontos, tabela[1].pontos)
  assert.equal(tabela[0].partidas, 2)
}
{
  // Falso Hu (regra da EMA): paga 10 a cada um, a mão e o dealer não mudam.
  const base = novoPlacar('f', ['a', 'b', 'c', 'd'], 0, '2026-11-21')
  const comErro = registrarFalsoHu(base, 2)
  assert.deepEqual(totais(comErro), [10, 10, -30, 10])
  assert.equal(comErro.maos.length, 0, 'Falso Hu não encerra a mão')
  assert.equal(desfazerUltimaMao(comErro).falsosHu?.length, 0, 'Desfazer tira o Falso Hu')
}
console.log('Placar MCR ok: 25 testes.')

{
  // Súmula do Registrar partida finalizada: papel e caneta com a conta feita.
  let s: RascunhoSumula = { ...SUMULA_VAZIA, assentos: ['a', 'b', 'c', 'd'] }
  assert.deepEqual(pontosDaSumula(s), [null, null, null, null])
  s = anotarMao(s, { tipo: 'vitoria', vencedor: 1, forma: 'ron', descartador: 2, fan: 24 })
  assert.deepEqual(pontosDaSumula(s), [-8, 48, -32, -8], 'a mão calculada desconta dos outros')
  s = anotarMao(s, { tipo: 'anotada', pontos: [30, -10, -10, -10] })
  assert.deepEqual(pontosDaSumula(s), [22, 38, -42, -18])
  assert.equal(anotarMao(s, { tipo: 'anotada', pontos: [1, 0, 0, 0] }), s, 'linha que não fecha')
  assert.deepEqual(fecharMaoEscrita([30, -10, -10, null]), [30, -10, -10, -10])
  assert.equal(fecharMaoEscrita([30, null, null, 0]), null)
  assert.equal(fecharMaoEscrita([1, 0, 0, 0]), null)

  s = anotarFalsoHu(s, 0)
  assert.deepEqual(pontosDaSumula(s), [-8, 48, -32, -8], 'Falso Hu: 10 a cada um')
  const digitada = digitarTotal(s, 0, 100)
  assert.equal(pontosDaSumula(digitada)[0], 100, 'o total digitado vale')
  assert.equal(pontosDaSumula(anotarMao(digitada, { tipo: 'anotada', pontos: [5, -5, 0, 0] }))[0], 105)
  assert.deepEqual(apagarMao(s, 0).falsosHu, [{ cadeira: 0, aposMao: 1 }])

  const final = placarDaSumula(digitada, 'sumula', '2026-11-22T10:00:00.000Z')
  assert.deepEqual(totais(final), [100, 48, -32, -8])
  assert.equal(final.finalizadoEm, '2026-11-22T10:00:00.000Z')
  assert.equal(final.registradoManual, true)
  assert.deepEqual(final.falsosHu, [{ cadeira: 0, aposMao: 2 }])
  assert.deepEqual(JSON.parse(JSON.stringify(final)), final, 'volta igual do backup')
  assert.deepEqual(normalizarSumula(JSON.parse(JSON.stringify(digitada))), digitada)
  assert.deepEqual(normalizarSumula({ maos: 3 }), SUMULA_VAZIA)
}
console.log('Súmula MCR ok.')
