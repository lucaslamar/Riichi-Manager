/**
 * Testes do histórico e do ranking geral.
 *
 * Uso: npm run test:ranking
 */
import assert from 'node:assert/strict'
import { alterarConfig, configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import {
  criarPartida,
  finalizarPartida,
  registrarRon,
  type Partida,
} from '../src/dominios/centerpiece/logica/partida'
import {
  calcularRanking,
  origemDaPartida,
  partidasDoHistorico,
  posicoesDoRanking,
} from '../src/dominios/centerpiece/logica/ranking'

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

const AGORA = new Date(2026, 10, 15, 12)
const TUDO = { periodo: 'tudo', origem: 'todas' } as const
const CTX = { id: 'e', agora: '2026-11-01T12:00:00.000Z' }

/** Partida finalizada em que `b` ganha um ron de `c`. */
function finalizada(
  quando: Date,
  dados: { pontos?: number; config?: ReturnType<typeof configDoPreset>; torneio?: boolean } = {},
): Partida {
  const inicio = criarPartida(
    quando.toISOString(),
    dados.config ?? configDoPreset('padrao'),
    ['a', 'b', 'c', 'd'],
    quando.toISOString(),
  )
  const jogada = registrarRon(
    inicio,
    { pagador: 2, vencedores: [{ cadeira: 1, pontos: dados.pontos ?? 8000 }] },
    CTX,
  )
  return finalizarPartida(
    dados.torneio ? { ...jogada, vinculoTorneio: { torneioId: 't', rodada: 0, mesa: 0 } } : jogada,
    quando.toISOString(),
  )
}

const linhaDe = (linhas: ReturnType<typeof calcularRanking>, id: string) => {
  const linha = linhas.find((item) => item.jogadorId === id)
  assert.ok(linha, id)
  return linha
}

teste('histórico: só finalizadas, da mais recente para a mais antiga', () => {
  const antiga = finalizada(new Date(2026, 0, 1))
  const nova = finalizada(new Date(2026, 10, 1))
  const aberta = criarPartida('x', configDoPreset('padrao'), ['a', 'b', 'c', 'd'], CTX.agora)
  assert.deepEqual(partidasDoHistorico([antiga, aberta, nova]), [nova, antiga])
})

teste('origem: casual ou torneio', () => {
  assert.equal(origemDaPartida(finalizada(AGORA)), 'casual')
  assert.equal(origemDaPartida(finalizada(AGORA, { torneio: true })), 'torneio')
})

teste('soma a pontuação e calcula as métricas', () => {
  const linhas = calcularRanking([finalizada(AGORA), finalizada(AGORA)], TUDO, AGORA)
  const b = linhaDe(linhas, 'b')
  assert.equal(linhas[0].jogadorId, 'b')
  assert.equal(b.partidas, 2)
  // (33.000 − 30.000)/1000 + uma 15 + oka 20 = 38, duas vezes.
  assert.equal(b.pontuacaoTotal, 76)
  assert.equal(b.mediaColocacao, 1)
  assert.equal(b.percentualPrimeiro, 100)
  assert.equal(linhaDe(linhas, 'c').percentualQuarto, 100)
})

teste('cada partida é pontuada com a própria config', () => {
  const wrc = finalizada(AGORA, { config: configDoPreset('wrc') })
  const padrao = finalizada(AGORA)
  // WRC: (38.000 − 30.000)/1000 + 15 = 23. Padrão: 38.
  assert.equal(linhaDe(calcularRanking([wrc, padrao], TUDO, AGORA), 'b').pontuacaoTotal, 61)
})

teste('empate: a uma dividida soma para os dois e eles ficam na mesma colocação', () => {
  const linhas = calcularRanking([finalizada(AGORA)], TUDO, AGORA)
  // a e d empatam em 2º: (5 − 5) / 2 = 0 de uma; (25.000 − 30.000)/1000 = −5.
  assert.equal(linhaDe(linhas, 'a').pontuacaoTotal, -5)
  assert.equal(linhaDe(linhas, 'd').pontuacaoTotal, -5)
  assert.equal(linhaDe(linhas, 'a').mediaColocacao, 2)
  assert.deepEqual(posicoesDoRanking(linhas), [1, 2, 2, 4])
})

teste('% de tobi conta quem terminou abaixo de zero', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tobi: true })
  const comTobi = finalizada(AGORA, { config, pontos: 32000 })
  const linhas = calcularRanking([comTobi, finalizada(AGORA)], TUDO, AGORA)
  assert.equal(linhaDe(linhas, 'c').percentualTobi, 50)
  assert.equal(linhaDe(linhas, 'b').percentualTobi, 0)
})

teste('filtro de período: mês, ano e tudo', () => {
  const partidas = [
    finalizada(new Date(2026, 10, 2)),
    finalizada(new Date(2026, 2, 2)),
    finalizada(new Date(2025, 10, 2)),
  ]
  const contar = (periodo: 'mes' | 'ano' | 'tudo') =>
    linhaDe(calcularRanking(partidas, { periodo, origem: 'todas' }, AGORA), 'b').partidas
  assert.equal(contar('mes'), 1)
  assert.equal(contar('ano'), 2)
  assert.equal(contar('tudo'), 3)
})

teste('filtro de origem: casuais e torneios', () => {
  const partidas = [finalizada(AGORA), finalizada(AGORA), finalizada(AGORA, { torneio: true })]
  const contar = (origem: 'todas' | 'casuais' | 'torneios') =>
    linhaDe(calcularRanking(partidas, { periodo: 'tudo', origem }, AGORA), 'b').partidas
  assert.equal(contar('todas'), 3)
  assert.equal(contar('casuais'), 2)
  assert.equal(contar('torneios'), 1)
})

teste('sem partidas no filtro, ranking vazio', () => {
  assert.deepEqual(calcularRanking([], TUDO, AGORA), [])
  assert.deepEqual(
    calcularRanking([finalizada(AGORA)], { periodo: 'tudo', origem: 'torneios' }, AGORA),
    [],
  )
})

console.log(`Ranking ok: ${testes} testes.`)
