/**
 * Testes da distância para o pódio, com totais e nomes fictícios.
 *
 * Uso: npm run test:distancia-podio
 */
import assert from 'node:assert/strict'
import { regrasDoModo } from '../src/compartilhado/modo-jogo/regrasDoModo'
import type { Partida } from '../src/dominios/centerpiece/logica/partida'
import {
  candidatosAoPrimeiro,
  compararCom,
  distanciaParaPodio,
  distanciasDoPodio,
  maosParaCobrir,
  vizinhosDoJogador,
} from '../src/dominios/torneio/logica/distanciaPodio'
import { FILTROS_PADRAO_TORNEIO, filtrosAtivos } from '../src/dominios/torneio/logica/filtrosRankingTorneio'
import { rankingAteRodada, rankingDoTorneio, type LinhaRankingTorneio } from '../src/dominios/torneio/logica/ranking'
import { relatorioDaDisputa, relatorioDoJogador } from '../src/dominios/torneio/logica/relatorios'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'
import type { Torneio } from '../src/dominios/torneio/logica/tipos'

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

const linhasDe = (totais: readonly number[], posicoes?: readonly number[]) =>
  totais.map(
    (pontos, indice): LinhaRankingTorneio => ({
      jogadorId: `p${indice + 1}`,
      pontos,
      partidas: 3,
      desempate: 0,
      mediaColocacao: 2,
      posicao: posicoes?.[indice] ?? indice + 1,
    }),
  )

const DOZE = linhasDe([70, 54.6, 28, 17.1, 8, 1, -5, -9, -20, -30, -39.6, -43.8])
const RIICHI = regrasDoModo('riichi')
const MCR = regrasDoModo('mcr')
const [mangan] = RIICHI.unidadesDistancia
const torneio = (formato: Torneio['formato']): Torneio => ({
  ...criarRascunho({ id: 't', agora: new Date(2026, 10, 22), nome: 'T' }),
  formato,
  status: 'em_andamento',
})

teste('o último para o 1º e o 3º', () => {
  const { faltam, vantagem } = distanciaParaPodio(DOZE, 'p12')
  assert.deepEqual(faltam.map((alvo) => alvo.diferenca), [113.8, 98.4, 71.8])
  assert.deepEqual(RIICHI.unidadesDistancia.map((unidade) => maosParaCobrir(113.8, unidade, RIICHI)), [15, 10, 8, 4])
  assert.equal(maosParaCobrir(71.8, mangan, RIICHI), 9)
  assert.equal(vantagem.length, 0)
})

teste('quem lidera vê a vantagem até o 4º', () => {
  const { faltam, vantagem } = distanciaParaPodio(DOZE, 'p1')
  assert.equal(faltam.length, 0)
  assert.deepEqual(vantagem.map((alvo) => [alvo.posicao, alvo.diferenca]), [[2, 15.4], [3, 42], [4, 52.9]])
  assert.equal(maosParaCobrir(15.4, mangan, RIICHI), 2)
})

teste('diferença cheia não ganha mão a mais', () => {
  assert.equal(maosParaCobrir(67.9 - 51.9, mangan, RIICHI), 2)
})

teste('empate e jogador sem partidas', () => {
  assert.equal(distanciaParaPodio(linhasDe([30, 10, 10, -50], [1, 2, 2, 4]), 'p3').faltam[1].diferenca, 0)
  const semJogar = [...linhasDe([10, 0]), { ...linhasDe([0])[0], jogadorId: 'novo', partidas: 0 }]
  assert.deepEqual(distanciaParaPodio(semJogar, 'novo'), { faltam: [], vantagem: [] })
  assert.deepEqual(vizinhosDoJogador(semJogar, 'novo'), [])
})

teste('vizinhos', () => {
  const ultimo = vizinhosDoJogador(DOZE, 'p12')
  assert.equal(ultimo.length, 1)
  assert.deepEqual([ultimo[0].relacao, ultimo[0].jogadorId, ultimo[0].diferenca], ['sairDoUltimo', 'p11', 4.2])
  assert.equal(maosParaCobrir(4.2, mangan, RIICHI), 1)
  const penultimo = vizinhosDoJogador(DOZE, 'p11')
  assert.deepEqual(penultimo.map((alvo) => alvo.relacao), ['subir', 'sobreOUltimo'])
  assert.equal(penultimo[1].diferenca, 4.2)
  assert.equal(vizinhosDoJogador(DOZE, 'p1').length, 0, 'o pódio já mostra')
  assert.deepEqual(vizinhosDoJogador(DOZE, 'p4').map((alvo) => alvo.relacao), ['vantagem'], 'o 3º não repete')
  assert.equal(compararCom(DOZE, 'p12', 'p7')?.relacao, 'falta')
  assert.equal(compararCom(DOZE, 'p1', 'p9')?.relacao, 'vantagem')
})

teste('faixa geral', () => {
  const { faixa, porJogador } = distanciasDoPodio(DOZE)
  assert.deepEqual(
    faixa.map(({ distancia }) => [distancia.diferenca, maosParaCobrir(distancia.diferenca, mangan, RIICHI)]),
    [[15.4, 2], [26.6, 4], [10.9, 2]],
  )
  assert.equal(porJogador.get('p2')?.sobreOQuarto?.diferenca, 37.5)
  assert.equal(porJogador.get('p12')?.paraTerceiro?.diferenca, 71.8)
  assert.equal(porJogador.get('p1')?.paraPrimeiro, null)
})

teste('eliminatório compara na mesma fase', () => {
  const linhas = DOZE.map((linha, indice) => ({ ...linha, fase: indice < 4 ? 1 : 0 }))
  assert.equal(distanciaParaPodio(linhas, 'p5').faltam.length, 0)
  assert.equal(distanciasDoPodio(linhas).porJogador.size, 4)
})

teste('candidatos e quem ainda alcança', () => {
  const partidas = [1, 2, 3].map((rodada) => ({
    status: 'finalizada',
    vinculoTorneio: { torneioId: 't', rodada: rodada - 1, mesa: 0 },
    resultado: DOZE.map((linha) => ({ jogadorId: linha.jogadorId, final: rodada === 1 && linha.jogadorId === 'p1' ? 35.3 : 1 })),
  })) as unknown as Partida[]
  const candidatos = candidatosAoPrimeiro(torneio({ tipo: 'rodizio', rodadas: 4 }), partidas, DOZE)
  assert.equal(candidatos.length, 6)
  assert.deepEqual(candidatos.map((candidato) => candidato.alcanca), [null, true, false, false, false, false])
  const livre = candidatosAoPrimeiro(torneio({ tipo: 'corridos' }), partidas, DOZE)
  assert.ok(livre.every((candidato) => candidato.alcanca === null), 'sem número de rodadas não marca')
  assert.equal(candidatosAoPrimeiro(torneio({ tipo: 'corridos' }), [], linhasDe([3, 2, 1])).length, 3)
})

teste('até a rodada', () => {
  const base = {
    ...torneio({ tipo: 'corridos' }),
    jogadorIds: ['a', 'b', 'c', 'd'],
    rodadas: [1, 2, 3].map((numero) => ({
      numero,
      geradaEm: '',
      mesas: [{ numero: 1, assentos: ['a', 'b', 'c', 'd'] as [string, string, string, string] }],
    })),
  }
  const partidas = [[10, 5, -5, -10], [1, 2, 3, -6], [-40, 0, 0, 40]].map((finais, rodada) => ({
    status: 'finalizada',
    vinculoTorneio: { torneioId: 't', rodada, mesa: 0 },
    resultado: base.jogadorIds.map((jogadorId, indice) => ({ jogadorId, final: finais[indice], colocacao: indice + 1 })),
  })) as unknown as Partida[]
  const ate2 = rankingAteRodada(base, partidas, 2)
  assert.deepEqual(ate2.map((linha) => [linha.jogadorId, linha.pontos]), [['a', 11], ['b', 7], ['c', -2], ['d', -16]])
  assert.notEqual(rankingDoTorneio(base, partidas)[0].jogadorId, 'a')
})

teste('MCR: vitórias de mesa e desempate', () => {
  const [vitorias] = MCR.unidadesDistancia
  assert.equal(maosParaCobrir(9, vitorias, MCR), 3)
  assert.equal(maosParaCobrir(8, vitorias, MCR), 2)
  assert.equal(maosParaCobrir(0.5, vitorias, MCR), 1)
  const linhas = linhasDe([8, 8]).map((linha, indice) => ({ ...linha, desempate: indice ? 20 : 57 }))
  assert.equal(distanciaParaPodio(linhas, 'p2').faltam[0].desempate, 37)
})

const ROTULOS = {
  titulo: 'T',
  subtitulo: 'S',
  chamada: 'C',
  nome: (id: string) => id,
  pontos: String,
  lugar: String,
  rotulo: (alvo: { relacao: string }) => alvo.relacao,
  valor: (alvo: { diferenca: number }) => String(alvo.diferenca),
  detalhe: () => 'maos',
  resumo: (alvo: { diferenca: number }) => String(alvo.diferenca),
}

teste('relatório da disputa', () => {
  const relatorio = relatorioDaDisputa(torneio({ tipo: 'corridos' }), [], DOZE, null, {
    ...ROTULOS,
    podio: 'P',
    candidatos: 'K',
    fundo: 'F',
    versus: (a, b) => a + 'x' + b,
    soComAjuda: 'A',
    vantagemNoFundo: (valor) => 'v' + valor,
    paraSair: (valor) => 's' + valor,
  })
  assert.deepEqual(relatorio.blocos.map((bloco) => [bloco.titulo, bloco.linhas.length]), [['P', 3], ['K', 6], ['F', 2]])
  assert.deepEqual(relatorio.blocos[2].linhas.map((linha) => [linha.esquerda, linha.direita]), [['11 p11', 'v4.2'], ['12 p12', 's4.2']])
  assert.equal(relatorio.chamada, 'C')
})

teste('relatório do jogador', () => {
  const relatorio = relatorioDoJogador(DOZE, 'p12', 'p7', ROTULOS)
  assert.deepEqual(relatorio.blocos.map((bloco) => bloco.linhas.length), [6, 2, 2], 'cada distância em 2 linhas')
  assert.equal(relatorio.blocos[1].linhas[0].esquerda, 'sairDoUltimo')
})

teste('filtros ativos', () => {
  assert.equal(filtrosAtivos(FILTROS_PADRAO_TORNEIO), 0)
  assert.equal(filtrosAtivos({ ...FILTROS_PADRAO_TORNEIO, visao: 'disputa', ateRodada: 2 }), 2)
})

console.log(`Distância para o pódio: ${testes} testes passaram.`)
