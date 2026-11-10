/**
 * Testes do histórico e do ranking geral.
 *
 * Uso: npm run test:ranking
 */
import assert from 'node:assert/strict'
import { umaFixa } from '../src/dominios/centerpiece/logica/uma'
import { alterarConfig, configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import {
  criarPartida,
  finalizarPartida,
  registrarRon,
  type Partida,
} from '../src/dominios/centerpiece/logica/partida'
import {
  calcularRanking,
  mudancaNoRanking,
  origemDaPartida,
  partidasDoHistorico,
  posicoesDoRanking,
  semExcluidos,
} from '../src/dominios/centerpiece/logica/ranking'
import {
  FILTROS_PADRAO,
  computeRanking,
  filtrosAtivos,
  lerFiltros,
  rivaisEFregueses,
} from '../src/dominios/centerpiece/logica/filtrosRanking'
import {
  comparacaoDeFormatos,
  detalheDoConfronto,
  distribuicaoDeColocacoes,
  evolucaoDaPontuacao,
  maisJogouCom,
  mediaPorMes,
  mediaPorVento,
  redeDeConfrontos,
  resumoDoJogador,
} from '../src/dominios/centerpiece/logica/analiseJogador'
import { filtrarHistorico, tipoDaMesa } from '../src/dominios/centerpiece/logica/tipoDaMesa'

/**
 * Base dos testes: 25.000/30.000 (com oka) e uma 15/5, fixa aqui para os testes
 * não mudarem quando o preset Clube mudar.
 */
const BASE = alterarConfig(configDoPreset('padrao'), { pontosRetorno: 30000, uma: umaFixa([15, 5, -5, -15]) })

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
    dados.config ?? BASE,
    ['a', 'b', 'c', 'd'],
    quando.toISOString(),
  )
  const jogada = registrarRon(
    inicio,
    { pagador: 2, vencedores: [{ cadeira: 1, pontos: dados.pontos ?? 8000 }] },
    CTX,
  )
  return finalizarPartida(
    dados.torneio
      ? { ...jogada, vinculoTorneio: { torneioId: 't', rodada: 0, mesa: 0, guardada: true } }
      : jogada,
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
  const aberta = criarPartida('x', BASE, ['a', 'b', 'c', 'd'], CTX.agora)
  assert.deepEqual(partidasDoHistorico([antiga, aberta, nova]), [nova, antiga])
})

teste('mesa de torneio só entra no histórico depois de guardada', () => {
  const partida = finalizada(AGORA, { torneio: true })
  const naoGuardada = {
    ...partida,
    vinculoTorneio: { torneioId: 't', rodada: 0, mesa: 0, guardada: false },
  }
  assert.deepEqual(partidasDoHistorico([naoGuardada]), [])
  assert.deepEqual(partidasDoHistorico([partida]), [partida])
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
  const config = alterarConfig(BASE, { tobi: true })
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

teste('excluído sai do ranking e os outros ficam iguais', () => {
  const linhas = [
    { jogadorId: 'a', partidas: 1, pontuacaoTotal: 10, mediaColocacao: 1, percentualPrimeiro: 100, percentualQuarto: 0, percentualTobi: 0 },
    { jogadorId: 'b', partidas: 1, pontuacaoTotal: 5, mediaColocacao: 2, percentualPrimeiro: 0, percentualQuarto: 0, percentualTobi: 0 },
  ]
  const sobra = semExcluidos(linhas, (id) => id === 'b')
  assert.deepEqual(sobra.map((linha) => linha.pontuacaoTotal), [5])
  assert.deepEqual(posicoesDoRanking(sobra), [1])
})

teste('partida registrada à mão entra no histórico e no ranking', () => {
  const partida = criarPartidaManual(
    'm',
    BASE,
    {
      jogadorIds: ['a', 'b', 'c', 'd'],
      nomes: ['A', 'B', 'C', 'D'],
      pontos: [12000, 42000, 18000, 28000],
      pontosPartida: 25000,
      pontosRetorno: 30000,
      uma: umaFixa([15, 5, -5, -15]),
    },
    '2026-11-01T12:00:00.000Z',
  )
  assert.equal(partida.status, 'finalizada')
  assert.deepEqual(partida.resultado?.map((linha) => [linha.jogadorId, linha.final]), [
    ['b', 47],
    ['d', 3],
    ['c', -17],
    ['a', -33],
  ])
  assert.equal(partidasDoHistorico([partida]).length, 1)
  const ranking = calcularRanking([partida], { periodo: 'tudo', origem: 'todas' }, new Date('2026-11-02'))
  assert.equal(ranking[0].jogadorId, 'b')
  const semOka = criarPartidaManual('n', configDoPreset('wrc'), {
    jogadorIds: ['a', 'b', 'c', 'd'],
    nomes: [],
    pontos: [47000, 33000, 23000, -3000],
    pontosPartida: 25000,
    pontosRetorno: 25000,
    uma: umaFixa([15, 5, -5, -15]),
  }, 'x')
  assert.equal(semOka.config.pontosPartida, 25000)
  assert.equal(semOka.resultado?.reduce((soma, linha) => soma + linha.final, 0), 0)
})

teste('mudança no ranking: antes e depois da partida nova', () => {
  const primeira = finalizada(new Date(2026, 10, 1))
  const nova = criarPartidaManual('n', BASE, {
    jogadorIds: ['a', 'b', 'c', 'e'],
    nomes: [],
    pontos: [40000, 30000, 20000, 10000],
    pontosPartida: 25000,
    pontosRetorno: 30000,
    uma: umaFixa([15, 5, -5, -15]),
  }, '2026-11-02T12:00:00.000Z')
  // 'c' é convidado (fora do cadastro): não aparece.
  const mudancas = mudancaNoRanking([primeira], nova, AGORA, (id) => id !== 'c')
  assert.deepEqual(mudancas.map((item) => item.jogadorId), ['a', 'b', 'e'], 'ordem de colocação, sem convidado')
  const a = mudancas[0]
  assert.ok(a.antes, 'a já jogou')
  assert.ok(a.depois.total > a.antes.total, 'primeiro lugar soma pontos')
  assert.equal(mudancas[2].antes, null, 'estreia no ranking')
  assert.deepEqual([a.antes, a.depois], [{ total: -5, posicao: 2 }, { total: 40, posicao: 2 }])
  assert.deepEqual(mudancas[2].depois, { total: -35, posicao: 4 })
})

/** Partida registrada fora do app, com os pontos de a, b, c e d nessa ordem. */
function manual(id: string, pontos: [number, number, number, number], data: string, tipo: 'leste' | 'hanchan' = 'hanchan') {
  return criarPartidaManual(id, alterarConfig(BASE, { tipoPartida: tipo }), {
    jogadorIds: ['a', 'b', 'c', 'd'],
    nomes: [],
    pontos,
    pontosPartida: 25000,
    pontosRetorno: 30000,
    uma: umaFixa([15, 5, -5, -15]),
  }, data)
}

// 4 jogadores e 3 partidas: a vence c e d sempre, b vence a duas vezes.
const TRES = [
  manual('p1', [40000, 30000, 20000, 10000], '2026-11-01T12:00:00.000Z'),
  manual('p2', [30000, 40000, 20000, 10000], '2026-11-02T12:00:00.000Z', 'leste'),
  manual('p3', [30000, 40000, 10000, 20000], '2026-10-15T12:00:00.000Z'),
]

teste('rivais e fregueses: 4 jogadores e 3 partidas', () => {
  const { rivais, fregueses } = rivaisEFregueses(TRES, 'a')
  assert.deepEqual(rivais, [{ adversarioId: 'b', vitorias: 1, derrotas: 2, partidas: 3 }])
  assert.deepEqual(fregueses.map((item) => [item.adversarioId, item.vitorias, item.derrotas]), [['c', 3, 0], ['d', 3, 0]])
  const deB = rivaisEFregueses(TRES, 'b')
  assert.deepEqual(deB.rivais, [], 'ninguém vence b no saldo')
  assert.deepEqual(deB.fregueses.map((item) => item.adversarioId), ['c', 'd', 'a'])
  assert.deepEqual(rivaisEFregueses(TRES.slice(0, 1), 'a'), { rivais: [], fregueses: [] }, 'mínimo de 2 partidas juntos')
})

teste('computeRanking: filtros de duração, origem, período, jogador e mínimo', () => {
  const tudo = computeRanking(TRES, FILTROS_PADRAO, AGORA)
  assert.deepEqual(tudo.map((linha) => linha.jogadorId), ['b', 'a', 'c', 'd'])
  assert.equal(computeRanking(TRES, { ...FILTROS_PADRAO, duracao: 'leste' }, AGORA)[0].partidas, 1)
  assert.equal(computeRanking(TRES, { ...FILTROS_PADRAO, duracao: 'hanchan' }, AGORA)[0].partidas, 2)
  assert.deepEqual(computeRanking(TRES, { ...FILTROS_PADRAO, origem: 'app' }, AGORA), [], 'todas são manuais')
  assert.equal(computeRanking(TRES, { ...FILTROS_PADRAO, origem: 'fora' }, AGORA).length, 4)
  assert.equal(computeRanking(TRES, { ...FILTROS_PADRAO, periodo: 'mes' }, AGORA)[0].partidas, 2)
  const outubro = { ...FILTROS_PADRAO, periodo: 'personalizado' as const, inicio: '2026-10-01', fim: '2026-10-31' }
  assert.equal(computeRanking(TRES, outubro, AGORA)[0].partidas, 1)
  assert.deepEqual(computeRanking(TRES, { ...FILTROS_PADRAO, minimoPartidas: 5 }, AGORA), [])
  assert.deepEqual(computeRanking(TRES, { ...FILTROS_PADRAO, ordenarPor: 'media' }, AGORA)[0].jogadorId, 'b')
  assert.equal(computeRanking([...TRES, finalizada(new Date(2026, 10, 3))], { ...FILTROS_PADRAO, jogadorId: 'd' }, AGORA)[0].partidas, 4)
  assert.deepEqual(computeRanking(TRES, { ...FILTROS_PADRAO, jogadorId: 'x' }, AGORA), [], 'só partidas do jogador')
})

teste('filtros: ativos e leitura do salvo', () => {
  assert.deepEqual(filtrosAtivos(FILTROS_PADRAO), [])
  assert.deepEqual(filtrosAtivos({ ...FILTROS_PADRAO, periodo: 'mes', duracao: 'hanchan' }), ['periodo', 'duracao'])
  assert.deepEqual(lerFiltros('lixo'), FILTROS_PADRAO)
  assert.deepEqual(lerFiltros(JSON.stringify({ origem: 'app', minimoPartidas: 7 })), { ...FILTROS_PADRAO, origem: 'app' })
})

teste('análise do jogador: 4 jogadores e 3 partidas', () => {
  // a: 2º (15/10), 1º (01/11, hanchan), 2º (02/11, leste); sempre Leste.
  assert.deepEqual(resumoDoJogador(TRES, 'a'), { partidas: 3, mediaColocacao: 1.67, pontuacaoTotal: computeRanking(TRES, FILTROS_PADRAO, AGORA).find((linha) => linha.jogadorId === 'a')!.pontuacaoTotal })
  const evolucao = evolucaoDaPontuacao(TRES, 'a')
  assert.deepEqual(evolucao.map((ponto) => ponto.indice), [1, 2, 3])
  assert.equal(evolucao[2].acumulado, resumoDoJogador(TRES, 'a').pontuacaoTotal)
  assert.ok(evolucao[0].data < evolucao[1].data, 'da mais antiga para a mais recente')
  assert.deepEqual(distribuicaoDeColocacoes(TRES, 'a'), [1, 2, 0, 0])
  assert.deepEqual(mediaPorMes(TRES, 'a'), [
    { mes: '2026-10', media: 2, partidas: 1 },
    { mes: '2026-11', media: 1.5, partidas: 2 },
  ])
  assert.deepEqual(
    mediaPorVento(TRES, 'a').map((item) => [item.vento, item.media]),
    [['leste', 1.67], ['sul', null], ['oeste', null], ['norte', null]],
  )
  assert.deepEqual(comparacaoDeFormatos(TRES, 'a'), [
    { formato: 'hanchan', partidas: 2, media: 1.5, percentualPrimeiro: 50 },
    { formato: 'leste', partidas: 1, media: 2, percentualPrimeiro: 0 },
  ])
  assert.deepEqual(maisJogouCom(TRES, 'a').map((item) => item.partidas), [3, 3, 3])
})

teste('mapa de confrontos e detalhe do confronto', () => {
  const rede = redeDeConfrontos(TRES, 'a')
  assert.deepEqual(rede.nos.map((no) => [no.adversarioId, no.saldo]).sort(), [['b', -1], ['c', 3], ['d', 3]])
  assert.deepEqual(rede.arestas.map((aresta) => `${aresta.de}-${aresta.para}:${aresta.partidas}`).sort(), ['b-c:3', 'b-d:3', 'c-d:3'])
  assert.deepEqual(redeDeConfrontos(TRES, 'a', 5).nos, [], 'densidade baixa esconde quem tem poucas partidas')
  const detalhe = detalheDoConfronto(TRES, 'a', 'b')
  assert.equal(detalhe.partidas, 3)
  assert.equal(detalhe.a.vitorias, 1)
  assert.equal(detalhe.b.vitorias, 2)
  assert.equal(detalhe.a.mediaColocacao, 1.67)
  assert.equal(detalhe.b.mediaColocacao, 1.33)
  assert.equal(detalhe.a.mandouProTobi, 0, 'ninguém ficou abaixo de zero')
})

teste('tipo da mesa e filtro do histórico', () => {
  const [avulsa, outra, terceira] = TRES
  const torneio = { ...outra, vinculoTorneio: { torneioId: 't', rodada: 0, mesa: 0, guardada: true } }
  const clube = { ...terceira, encontro: { id: 'e', mesa: 1 } }
  assert.deepEqual([tipoDaMesa(avulsa), tipoDaMesa(torneio), tipoDaMesa(clube)], ['avulsa', 'torneio', 'clube'])
  const nomes = { a: 'José Silva', b: 'Ana', c: 'Bruno', d: 'Duda' } as Record<string, string>
  const nomesDa = (partida: Partida) => partida.resultado!.map((linha) => nomes[linha.jogadorId])
  const todas = [avulsa, torneio, clube]
  assert.deepEqual(filtrarHistorico(todas, { tipo: 'torneio', busca: '' }, nomesDa), [torneio])
  assert.deepEqual(filtrarHistorico(todas, { tipo: 'todas', busca: 'jose' }, nomesDa).length, 3, 'sem acento e maiúscula')
  assert.deepEqual(filtrarHistorico(todas, { tipo: 'clube', busca: 'xyz' }, nomesDa), [])
})

console.log(`Ranking ok: ${testes} testes.`)
