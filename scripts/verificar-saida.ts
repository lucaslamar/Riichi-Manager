/**
 * Testes do W.O. no meio da partida (quem saiu).
 *
 * Uso: npm run test:saida
 */
import assert from 'node:assert/strict'
import { configDoPreset, normalizarConfig, type ConfigMesa } from '../src/dominios/centerpiece/logica/configMesa'
import type { Cadeira } from '../src/dominios/centerpiece/logica/partida'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import { partidasDoHistorico } from '../src/dominios/centerpiece/logica/ranking'
import { fechamentoDoRegistro } from '../src/dominios/centerpiece/logica/saidaDaPartida'
import { partidasComSaida, semSaidas } from '../src/dominios/estatisticas/logica/estatisticas'
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

const IDS = ['a', 'b', 'c', 'd'] as const
const WRC = configDoPreset('wrc')
const CLUBE = configDoPreset('padrao')
type Pontos = [number, number, number, number]

function registrar(config: ConfigMesa, pontos: Pontos, saidas: Cadeira[] = []) {
  return criarPartidaManual(
    'p',
    config,
    {
      jogadorIds: IDS,
      nomes: IDS,
      pontos,
      pontosPartida: config.pontosPartida,
      pontosRetorno: config.pontosRetorno,
      uma: config.uma,
      saidas,
    },
    '2026-11-22T15:00:00.000Z',
  )
}

function porCadeira(config: ConfigMesa, pontos: Pontos, saidas: Cadeira[] = []) {
  return [...registrar(config, pontos, saidas).resultado!].sort((a, b) => a.cadeira - b.cadeira)
}

teste('padrão: 4º com os pontos da saída', () => {
  const linhas = porCadeira(WRC, [45000, 30000, 25000, 20000], [0])
  assert.deepEqual(linhas.map((linha) => linha.colocacao), [4, 1, 2, 3])
  assert.deepEqual(linhas.map((linha) => linha.pontosBrutos), [45000, 30000, 25000, 20000])
  assert.deepEqual(linhas.map((linha) => linha.uma), [-15, 15, 5, -5])
  assert.equal(linhas[0].final, 0)
  assert.equal(linhas[0].saiu, true)
  assert.equal(linhas[1].saiu, undefined)
})

teste('penalidade e colocação editáveis', () => {
  const pelosPontos = { ...WRC, saida: { ficaEmUltimo: false, penalidade: 10 } }
  const [saiu] = porCadeira(pelosPontos, [45000, 30000, 25000, 20000], [0])
  assert.deepEqual([saiu.colocacao, saiu.multa, saiu.final], [1, 10, 20])
})

teste('a flutuante conta pelos pontos de verdade', () => {
  // 2 no retorno ou acima, mesmo com um deles em 4º.
  const linhas = porCadeira(CLUBE, [35000, 30000, 20000, 15000], [0])
  assert.deepEqual(linhas.map((linha) => linha.uma), [-8, 8, 4, -4])
})

teste('empate com quem saiu não divide a uma', () => {
  const linhas = porCadeira(WRC, [30000, 30000, 30000, 30000], [3])
  assert.deepEqual(linhas.map((linha) => linha.colocacao), [1, 1, 1, 4])
  assert.deepEqual(linhas.map((linha) => linha.uma), [5, 5, 5, -15])
})

teste('dois W.O. se ordenam entre si', () => {
  const linhas = porCadeira(WRC, [45000, 35000, 25000, 15000], [0, 1])
  assert.deepEqual(linhas.map((linha) => linha.colocacao), [3, 4, 1, 2])
})

teste('a oka vai para quem ficou', () => {
  const linhas = porCadeira(configDoPreset('mleague'), [40000, 25000, 20000, 15000], [0])
  assert.deepEqual(linhas.map((linha) => linha.oka), [0, 20, 0, 0])
})

teste('sem W.O. nada muda', () => {
  const linhas = porCadeira(WRC, [45000, 30000, 25000, 20000])
  assert.deepEqual(linhas.map((linha) => linha.final), [30, 5, -10, -25])
  assert.ok(linhas.every((linha) => !('saiu' in linha)))
})

teste('a soma não trava com W.O.', () => {
  const mesa = { palitosRestantes: 'primeiro', comSaida: false } as const
  assert.equal(fechamentoDoRegistro(97000, 100000, mesa).fecha, false)
  const com = fechamentoDoRegistro(97000, 100000, { ...mesa, comSaida: true })
  assert.deepEqual([com.fecha, com.porSaida], [true, true])
  assert.equal(fechamentoDoRegistro(100000, 100000, { ...mesa, comSaida: true }).porSaida, false)
})

teste('no histórico, guardada e filtrável', () => {
  const com = registrar(WRC, [45000, 30000, 25000, 20000], [0])
  assert.equal(partidasDoHistorico([com]).length, 1)
  assert.deepEqual(montarPartida(dividirPartida(com).resumo).saidas, [0])
  assert.equal(partidasComSaida([com], 'b'), 1)
  assert.equal(semSaidas([com]).length, 0)
})

teste('a regra sobrevive à leitura', () => {
  const saida = { ficaEmUltimo: false, penalidade: 30 }
  assert.deepEqual(normalizarConfig({ ...WRC, saida }).saida, saida)
  assert.equal(normalizarConfig({ ...WRC, saida: { ...saida, penalidade: -1 } }).saida, undefined)
  assert.equal(normalizarConfig(WRC).saida, undefined)
})

console.log(`W.O. no meio da partida: ${testes} testes passaram.`)
