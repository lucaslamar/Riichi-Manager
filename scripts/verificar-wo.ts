/**
 * Testes do WO e do atraso no torneio.
 *
 * Uso: npm run test:wo
 */
import assert from 'node:assert/strict'
import { regrasDoModo } from '../src/compartilhado/modo-jogo/regrasDoModo'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import { partidasDoHistorico } from '../src/dominios/centerpiece/logica/ranking'
import type { Cadeira } from '../src/dominios/centerpiece/logica/partida'
import { classificar } from '../src/dominios/torneio/logica/classificacao'
import { novoEncontro, criarTemporada } from '../src/dominios/torneio/logica/temporada'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'
import type { Torneio } from '../src/dominios/torneio/logica/tipos'
import {
  aplicarAtrasos,
  ausenciasPorWo,
  criarPartidaWo,
  regrasWoDe,
  regrasWoValidas,
  remontagemPossivel,
} from '../src/dominios/torneio/logica/wo'
import { dividirPartida, montarPartida } from '../src/services/storage/partidaArmazenada'

let testes = 0
function teste(nome: string, corpo: () => void) {
  try {
    corpo()
    testes += 1
  } catch (erro) {
    console.error(`Falhou: ${nome}`)
    throw erro
  }
}

const AGORA = '2026-11-22T15:00:00.000Z'
const TORNEIO: Torneio = {
  ...criarRascunho({ id: 't', agora: new Date(AGORA), nome: 'T' }),
  status: 'em_andamento',
  jogadorIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  rodadas: [{ numero: 1, geradaEm: AGORA, mesas: [
    { numero: 1, assentos: ['a', 'b', 'c', 'd'] },
    { numero: 2, assentos: ['e', 'f', 'g', 'h'] },
  ] }],
}
const [RODADA] = TORNEIO.rodadas
const REGRAS = regrasWoDe(TORNEIO)!
const wo = (ausentes: Cadeira[], mesa = RODADA.mesas[0]) =>
  criarPartidaWo(TORNEIO, RODADA, mesa, ausentes, { id: 'wo' + mesa.numero, agora: AGORA, nomes: [...mesa.assentos], regras: REGRAS })
const finais = (ausentes: Cadeira[]) =>
  [...wo(ausentes).resultado!].sort((uma, outra) => uma.cadeira - outra.cadeira).map((linha) => linha.final)

teste('1 a 4 ausentes', () => {
  assert.deepEqual(finais([3]), [10, 10, 10, -30])
  assert.deepEqual(finais([2, 3]), [10, 10, -30, -30])
  assert.deepEqual(finais([1, 2, 3]), [10, -30, -30, -30])
  assert.deepEqual(finais([0, 1, 2, 3]), [-30, -30, -30, -30])
})

teste('só Riichi de 4', () => {
  assert.equal(regrasWoDe({ jogo: 'mcr' }), null)
  assert.equal(regrasWoDe({ variante: 'sanma' }), null)
  assert.equal(regrasDoModo('mcr').woPadrao, null)
})

teste('os valores do torneio valem', () => {
  const regras = regrasWoDe({ wo: { penalidade: 20, presente: 5, toleranciaMinutos: 15, porMinuto: 2 } })!
  assert.equal(regras.penalidade, 20)
  assert.ok(regrasWoValidas(regras))
  assert.ok(!regrasWoValidas({ ...regras, presente: -1 }))
})

teste('atraso de 5 minutos, com teto na tolerância', () => {
  const previa = criarPartidaManual('p', TORNEIO.config, {
    jogadorIds: ['a', 'b', 'c', 'd'],
    nomes: ['A', 'B', 'C', 'D'],
    pontos: [40000, 35000, 25000, 20000],
    pontosPartida: 30000,
    pontosRetorno: 30000,
    uma: TORNEIO.config.uma,
  }, AGORA)
  const com = aplicarAtrasos(previa, { b: 5, c: 99 }, REGRAS).resultado!
  const diferenca = (id: string) => {
    const antes = previa.resultado!.find((linha) => linha.jogadorId === id)!
    const depois = com.find((linha) => linha.jogadorId === id)!
    assert.equal(depois.colocacao, antes.colocacao)
    return Math.round((antes.final - depois.final) * 10) / 10
  }
  assert.deepEqual(['a', 'b', 'c'].map(diferenca), [0, 5, 10])
  assert.equal(com.find((linha) => linha.jogadorId === 'b')!.atraso, 5)
})

teste('remontar: 1 ausente em cada mesa vira uma mesa completa', () => {
  const feito = remontagemPossivel(TORNEIO, [wo([3], RODADA.mesas[1])], RODADA, RODADA.mesas[0], [1])!
  const [um, dois] = feito.torneio.rodadas[0].mesas
  assert.deepEqual(um.assentos, ['a', 'e', 'c', 'd'])
  assert.deepEqual(dois.assentos, ['b', 'f', 'g', 'h'])
  assert.deepEqual(feito.ausentes, [0, 3])
  assert.equal(feito.substituirId, 'wo2')
  assert.deepEqual([...um.assentos, ...dois.assentos].sort(), TORNEIO.jogadorIds)
})

teste('sem presentes suficientes não remonta', () => {
  assert.equal(remontagemPossivel(TORNEIO, [wo([1, 2, 3], RODADA.mesas[1])], RODADA, RODADA.mesas[0], [0, 1]), null)
  assert.equal(remontagemPossivel(TORNEIO, [], RODADA, RODADA.mesas[0], [0]), null)
})

teste('ranking soma o WO sem contar colocação', () => {
  const linhas = classificar(TORNEIO, [wo([3])])
  const ausente = linhas.find((linha) => linha.jogadorId === 'd')!
  assert.deepEqual([ausente.pontos, ausente.partidas, ausente.mediaColocacao], [-30, 1, 0])
  assert.deepEqual([...ausenciasPorWo(TORNEIO, [wo([3])])], [['d', 1]])
})

teste('fora do histórico e preservado ao guardar', () => {
  assert.equal(partidasDoHistorico([wo([3])]).length, 0)
  assert.deepEqual(montarPartida(dividirPartida(wo([3])).resumo).wo, { ausentes: [3] })
})

teste('encontro novo herda o WO da temporada', () => {
  const temporada = { ...criarTemporada({ id: 's', nome: 'S', inicio: '', fim: '', agora: AGORA }), wo: { ...REGRAS, presente: 8 } }
  assert.equal(novoEncontro(temporada, { id: 'n', agora: new Date(AGORA), nome: 'N' }).wo?.presente, 8)
})

console.log(`WO: ${testes} testes passaram.`)
