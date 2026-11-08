/**
 * Testes dos formatos do torneio: ninguém em duas mesas na mesma rodada, ventos
 * equilibrados e repetição de adversários mínima.
 *
 * Uso: npm run test:formatos
 */
import assert from 'node:assert/strict'
import { qualidadeDasRodadas, gerarRodizio } from '../src/dominios/torneio/logica/formatos/rodizio/rodizio'
import type { Partida } from '../src/dominios/centerpiece/logica/partida'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import { classificar } from '../src/dominios/torneio/logica/classificacao'
import { contarPares, contarVentos, custoDaMesa } from '../src/dominios/torneio/logica/formatos/comum'
import { proximaRodada, rodadaFechada, rodadasIniciais } from '../src/dominios/torneio/logica/formatos'
import {
  classificacaoDaFase,
  ehMesaFinal,
  faseDaRodada,
  rankingEliminatorio,
} from '../src/dominios/torneio/logica/formatos/eliminatorio'
import { podeSortearDeNovo, sortearDeNovo, textoDaRodada } from '../src/dominios/torneio/logica/mesas'
import { acrescentar, formatarRelogio, iniciar, pausar, segundosRestantes } from '../src/dominios/torneio/logica/relogio'
import { relogioParado } from '../src/dominios/torneio/logica/torneio'
import { rankingDoTorneio, textoDoRanking } from '../src/dominios/torneio/logica/ranking'
import { rankingTemporada } from '../src/dominios/torneio/logica/temporada'
import { exportarTorneio, importarTorneio, pacoteParaCodigo, codigoParaPacote, planejarImportacao } from '../src/dominios/torneio/logica/exportacao'
import { criarRascunho, iniciarTorneio } from '../src/dominios/torneio/logica/torneio'
import type { ConfigFormato, RodadaTorneio, Torneio } from '../src/dominios/torneio/logica/tipos'

const agora = '2026-11-08T14:00:00.000Z'
const jogadores = (total: number) => Array.from({ length: total }, (_, indice) => `j${indice + 1}`)

/** Todo mundo uma vez por rodada, mesas de 4. */
export function conferirRodadas(rodadas: readonly RodadaTorneio[], ids: readonly string[]) {
  for (const rodada of rodadas) {
    const sentados = rodada.mesas.flatMap((mesa) => mesa.assentos)
    assert.equal(rodada.mesas.length, ids.length / 4, `rodada ${rodada.numero}: mesas de 4`)
    assert.deepEqual([...sentados].sort(), [...ids].sort(), `rodada ${rodada.numero}: cada um uma vez`)
  }
}

/** Quantas vezes cada um sentou em cada vento. */
export function contagemDeVentos(rodadas: readonly RodadaTorneio[]) {
  const contagem = new Map<string, number[]>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      mesa.assentos.forEach((jogador, vento) => {
        const linha = contagem.get(jogador) ?? [0, 0, 0, 0]
        linha[vento] += 1
        contagem.set(jogador, linha)
      })
    }
  }
  return contagem
}

// ─── Rodízio ────────────────────────────────────────────────────────────────
for (const total of [8, 12, 16]) {
  const ids = jogadores(total)
  const { rodadas, qualidade } = gerarRodizio(ids, 4, agora)
  assert.equal(rodadas.length, 4)
  conferirRodadas(rodadas, ids)
  for (const [jogador, ventos] of contagemDeVentos(rodadas)) {
    assert.deepEqual(ventos, [1, 1, 1, 1], `Rodízio ${total}: ${jogador} uma vez em cada vento`)
  }
  const convertida = qualidadeDasRodadas(rodadas, total)
  assert.equal(convertida.score, qualidade.score, 'conversão da grade não muda a nota')
  assert.equal(convertida.quantidadeParesRepetidos, qualidade.quantidadeParesRepetidos)
  // Com 8 jogadores e 4 rodadas a repetição é inevitável; com mais, cada par se cruza no máximo 2 vezes.
  assert.ok(qualidade.maxRepeticioesPar <= (total === 8 ? 3 : 2), `Rodízio ${total}: repetição máxima ${qualidade.maxRepeticioesPar}`)
  console.log(
    `Rodízio ${total}: pares repetidos ${qualidade.quantidadeParesRepetidos} (ideal ${qualidade.quantidadeIdealRepetidos}), máx ${qualidade.maxRepeticioesPar}`,
  )
}

// ─── Simulação: resultado de todas as mesas de uma rodada ───────────────────
let semente = Number(process.env.SEMENTE ?? 7)
const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647)
let contadorPartidas = 0

function jogarRodada(torneio: Torneio, rodada: RodadaTorneio): Partida[] {
  return rodada.mesas.map((mesa) => {
    const pontos = [48000, 32000, 24000, 16000].sort(() => aleatorio() - 0.5) as [number, number, number, number]
    return {
      ...criarPartidaManual(
        `p${++contadorPartidas}`,
        torneio.config,
        {
          jogadorIds: mesa.assentos,
          nomes: mesa.assentos,
          pontos,
          pontosPartida: torneio.config.pontosPartida,
          pontosRetorno: torneio.config.pontosRetorno,
          uma: torneio.config.uma,
        },
        agora,
      ),
      vinculoTorneio: { torneioId: torneio.id, rodada: rodada.numero - 1, mesa: mesa.numero - 1 },
    }
  })
}

/** Joga o torneio inteiro até não haver próxima rodada. */
export function simular(formato: ConfigFormato, total: number, limite = 12) {
  const ids = jogadores(total)
  const base = { ...criarRascunho({ id: `t-${formato.tipo}-${total}`, agora: new Date(agora), nome: 'Teste' }), formato }
  let torneio = iniciarTorneio(base, ids, rodadasIniciais(base, ids, agora), agora)
  let partidas: Partida[] = []
  for (let volta = 0; volta < limite; volta++) {
    for (const rodada of torneio.rodadas) {
      const jogadas = new Set(partidas.map((partida) => partida.vinculoTorneio?.rodada))
      if (!jogadas.has(rodada.numero - 1)) partidas = [...partidas, ...jogarRodada(torneio, rodada)]
    }
    assert.ok(rodadaFechada(torneio, partidas))
    const proxima = proximaRodada(torneio, partidas, agora)
    if (!proxima) break
    torneio = { ...torneio, rodadas: [...torneio.rodadas, proxima] }
  }
  return { torneio, partidas, ids }
}

function repetidos(rodadas: readonly RodadaTorneio[]) {
  return [...contarPares(rodadas).values()].filter((vezes) => vezes > 1).length
}

function lesteEquilibrado(rodadas: readonly RodadaTorneio[], nome: string) {
  const leste = [...contarVentos(rodadas).values()].map((ventos) => ventos[0])
  assert.ok(Math.max(...leste) - Math.min(...leste) <= 1, `${nome}: Leste equilibrado (${leste.join(',')})`)
}

// ─── Suíço ──────────────────────────────────────────────────────────────────
for (const total of [8, 12, 16]) {
  const { torneio, partidas, ids } = simular({ tipo: 'suico', rodadas: 4 }, total)
  assert.equal(torneio.rodadas.length, 4, `Suíço ${total}: 4 rodadas`)
  conferirRodadas(torneio.rodadas, ids)
  lesteEquilibrado(torneio.rodadas, `Suíço ${total}`)

  // Rodada 2 pela classificação depois da rodada 1: o líder está na mesa 1.
  const depoisDa1 = classificar(torneio, partidas, new Set([1]))
  assert.ok(torneio.rodadas[1].mesas[0].assentos.includes(depoisDa1[0].jogadorId), `Suíço ${total}: 1º na mesa 1`)

  // As trocas nunca deixam pior do que agrupar de 4 em 4 sem olhar.
  const anteriores = torneio.rodadas.slice(0, 1)
  const ingenuo = depoisDa1.map((linha) => linha.jogadorId)
  const pares = contarPares(anteriores)
  const custoIngenuo = Array.from({ length: total / 4 }, (_, mesa) => custoDaMesa(ingenuo.slice(mesa * 4, mesa * 4 + 4), pares)).reduce((a, b) => a + b, 0)
  const custoReal = torneio.rodadas[1].mesas.reduce((soma, mesa) => soma + custoDaMesa(mesa.assentos, pares), 0)
  assert.ok(custoReal <= custoIngenuo, `Suíço ${total}: trocas reduzem repetição (${custoReal} ≤ ${custoIngenuo})`)
  if (total >= 16) assert.equal(custoReal, 0, 'Suíço 16: rodada 2 sem repetir adversário')
  console.log(`Suíço ${total}: pares repetidos em 4 rodadas ${repetidos(torneio.rodadas)}`)
}

// Próxima rodada só com todas as mesas com resultado.
{
  const ids = jogadores(8)
  const base = { ...criarRascunho({ id: 't-espera', agora: new Date(agora), nome: 'T' }), formato: { tipo: 'suico', rodadas: 3 } as ConfigFormato }
  const torneio = iniciarTorneio(base, ids, rodadasIniciais(base, ids, agora), agora)
  const metade = jogarRodada(torneio, torneio.rodadas[0]).slice(0, 1)
  assert.equal(proximaRodada(torneio, metade, agora), null, 'Suíço: espera todas as mesas')
}

// ─── Eliminatório ───────────────────────────────────────────────────────────
for (const [total, classificatoria, cortes] of [
  [16, 'suico', [8, 4]],
  [12, 'rodizio', [8, 4]],
  [8, 'suico', [4]],
] as const) {
  for (const pontosCarregados of [true, false]) {
    const formato = {
      tipo: 'eliminatorio' as const,
      classificatoria,
      rodadasClassificatoria: classificatoria === 'rodizio' ? 4 : 3,
      cortes: [...cortes],
      rodadasPorFase: 1,
      pontosCarregados,
    }
    const nome = `Eliminatório ${total} ${classificatoria} ${pontosCarregados ? 'carregados' : 'zerados'}`
    const { torneio, partidas, ids } = simular(formato, total)
    const fases = torneio.rodadas.map(faseDaRodada)
    assert.deepEqual(
      fases,
      [...Array(formato.rodadasClassificatoria).fill(0), ...cortes.map((_, indice) => indice + 1)],
      `${nome}: fases`,
    )
    conferirRodadas(torneio.rodadas.filter((rodada) => faseDaRodada(rodada) === 0), ids)
    // Cada corte: entram exatamente os N primeiros da fase anterior.
    cortes.forEach((corte, indice) => {
      const anterior = classificacaoDaFase(torneio, partidas, indice, formato).slice(0, corte).map((linha) => linha.jogadorId)
      const rodada = torneio.rodadas.find((item) => faseDaRodada(item) === indice + 1)!
      assert.deepEqual(rodada.mesas.flatMap((mesa) => mesa.assentos).sort(), [...anterior].sort(), `${nome}: corte ${corte}`)
    })
    assert.ok(ehMesaFinal(torneio, torneio.rodadas[torneio.rodadas.length - 1]), `${nome}: mesa final`)
    const ranking = rankingEliminatorio(torneio, partidas)
    assert.equal(ranking.length, total)
    assert.deepEqual(ranking.slice(0, 4).map((linha) => linha.fase), [cortes.length, cortes.length, cortes.length, cortes.length], `${nome}: finalistas no topo`)
    assert.equal(ranking[ranking.length - 1].fase, 0)
  }
}

// Zerados x carregados: com pontos zerados, a fase só conta as rodadas dela.
{
  const formato = { tipo: 'eliminatorio' as const, classificatoria: 'suico' as const, rodadasClassificatoria: 2, cortes: [4], rodadasPorFase: 1, pontosCarregados: false }
  const { torneio, partidas } = simular(formato, 8)
  const final = classificacaoDaFase(torneio, partidas, 1, formato)
  assert.ok(final.every((linha) => linha.partidas === 1), 'zerados: só a partida da final')
  const carregados = classificacaoDaFase(torneio, partidas, 1, { ...formato, pontosCarregados: true })
  assert.ok(carregados.every((linha) => linha.partidas === 3), 'carregados: classificatória + final')
}
console.log('Eliminatório ok.')

// ─── Pontos corridos ─────────────────────────────────────────────────────────
for (const total of [8, 12, 16]) {
  const { torneio, ids } = simular({ tipo: 'corridos' }, total, 3)
  assert.equal(torneio.rodadas.length, 4, `Corridos ${total}: segue enquanto o organizador quiser`)
  conferirRodadas(torneio.rodadas, ids)
  lesteEquilibrado(torneio.rodadas, `Corridos ${total}`)
  // Rodada 2 sem repetir ninguém da rodada 1 quando dá (com 3 mesas ou menos, 4 lugares
  // para 3 mesas de origem obrigam alguma repetição).
  if (total >= 16) {
    const pares = contarPares(torneio.rodadas.slice(0, 1))
    const custo = torneio.rodadas[1].mesas.reduce((soma, mesa) => soma + custoDaMesa(mesa.assentos, pares), 0)
    assert.equal(custo, 0, `Corridos ${total}: rodada 2 sem repetir adversário`)
  }
  console.log(`Corridos ${total}: pares repetidos em 4 rodadas ${repetidos(torneio.rodadas)}`)
}

// ─── Temporada: dois encontros e ranking acumulado ──────────────────────────
{
  const formato = { tipo: 'temporada' as const, temporadaId: 'temp' }
  // simular joga `limite` rodadas e deixa a seguinte sorteada, sem resultado.
  const um = simular(formato, 8, 2) // j1..j8: 2 partidas
  const dois = simular(formato, 12, 1) // j1..j12: 1 partida
  const encontros = [um.torneio, dois.torneio]
  const partidas = [...um.partidas, ...dois.partidas]
  const finais = new Map<string, number[]>()
  for (const partida of partidas) {
    for (const linha of partida.resultado ?? []) finais.set(linha.jogadorId, [...(finais.get(linha.jogadorId) ?? []), linha.final])
  }
  const soma = rankingTemporada(encontros, partidas, { tipo: 'soma' })
  assert.equal(soma.length, 12, 'todos os presentes de qualquer encontro')
  const j1 = soma.find((linha) => linha.jogadorId === 'j1')!
  assert.equal(j1.partidas, 3, 'j1: 2 partidas no 1º encontro e 1 no 2º')
  assert.equal(j1.encontros, 2)
  assert.equal(j1.valor, Math.round(finais.get('j1')!.reduce((a, b) => a + b, 0) * 10) / 10)
  assert.ok(soma.every((linha, indice) => indice === 0 || soma[indice - 1].valor >= linha.valor), 'soma: ordenado')

  const media = rankingTemporada(encontros, partidas, { tipo: 'media', minimoPartidas: 2 })
  const abaixo = media.filter((linha) => linha.abaixoDoMinimo).map((linha) => linha.jogadorId).sort()
  assert.deepEqual(abaixo, ['j10', 'j11', 'j12', 'j9'], 'média: quem jogou 1 partida fica abaixo do mínimo')
  assert.ok(media.slice(-4).every((linha) => linha.abaixoDoMinimo), 'média: abaixo do mínimo no fim')

  const melhores = rankingTemporada(encontros, partidas, { tipo: 'melhores', quantidade: 2 })
  const esperadoJ1 = [...finais.get('j1')!].sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a + b, 0)
  assert.equal(melhores.find((linha) => linha.jogadorId === 'j1')!.valor, Math.round(esperadoJ1 * 10) / 10, 'melhores 2')
  console.log('Temporada ok.')
}

// ─── Mesas: relógio, sortear de novo e texto ────────────────────────────────
{
  let relogio = iniciar(relogioParado(60), 1_000)
  assert.equal(segundosRestantes(relogio, 31_000), 30)
  relogio = pausar(relogio, 31_000)
  assert.equal(segundosRestantes(relogio, 999_000), 30, 'pausado não desconta')
  relogio = acrescentar(relogio, 300)
  assert.equal(segundosRestantes(relogio, 0), 330)
  assert.equal(segundosRestantes(iniciar(relogio, 0), 1_000_000), 0)
  assert.equal(formatarRelogio(5400), '1:30:00')
  assert.equal(formatarRelogio(90), '1:30')

  const { torneio, partidas } = simular({ tipo: 'suico', rodadas: 3 }, 8, 1)
  assert.ok(podeSortearDeNovo(torneio, partidas), 'rodada 2 sem mesa aberta')
  const refeito = sortearDeNovo(torneio, partidas, agora)
  assert.equal(refeito.rodadas.length, 2)
  assert.deepEqual(refeito.rodadas[0], torneio.rodadas[0], 'rodada com resultado não muda')
  assert.ok(!podeSortearDeNovo({ ...torneio, rodadas: torneio.rodadas.slice(0, 1) }, partidas), 'rodada 1 já tem resultado')

  const texto = textoDaRodada(torneio.rodadas[0], {
    titulo: 'Rodada 1',
    mesa: (numero) => `Mesa ${numero}`,
    vento: (vento) => vento,
    nome: (id) => id.toUpperCase(),
  })
  assert.ok(texto.startsWith('Rodada 1\n\n*Mesa 1*\n東 leste: '), 'texto para WhatsApp')
  console.log('Mesas ok.')
}

// ─── Ranking do torneio: empatados dividem a posição ───────────────────────────
{
  const { torneio, partidas } = simular({ tipo: 'corridos' }, 8, 1)
  const ranking = rankingDoTorneio(torneio, partidas)
  ranking.forEach((linha, indice) => {
    if (indice === 0) return assert.equal(linha.posicao, 1)
    const anterior = ranking[indice - 1]
    assert.equal(linha.posicao, anterior.pontos === linha.pontos ? anterior.posicao : indice + 1, 'posição com empate')
  })
  const elim = simular({ tipo: 'eliminatorio', classificatoria: 'suico', rodadasClassificatoria: 2, cortes: [4], rodadasPorFase: 1, pontosCarregados: true }, 8)
  const comFase = rankingDoTorneio(elim.torneio, elim.partidas)
  assert.deepEqual(comFase.map((linha) => linha.fase), [1, 1, 1, 1, 0, 0, 0, 0], 'Eliminatório: fase atingida')
  assert.ok(textoDoRanking(comFase, { titulo: 'T', nome: (id) => id, pontos: String, fase: (fase) => `F${fase}` }).includes(' · F1'))
  console.log('Ranking ok.')
}


// Validação final (item 13): todos os formatos com 8, 12 e 16 jogadores, de ponta a ponta.
// Torneio inteiro jogado, ranking com todos, e ida e volta pelo código chega igual.
{
  const formatos: ConfigFormato[] = [
    { tipo: 'rodizio', rodadas: 4 },
    { tipo: 'suico', rodadas: 4 },
    { tipo: 'eliminatorio', classificatoria: 'suico', rodadasClassificatoria: 3, cortes: [4], rodadasPorFase: 1, pontosCarregados: true },
    { tipo: 'corridos' },
    { tipo: 'temporada', temporadaId: 'tmp' },
  ]
  for (const formato of formatos) {
    for (const total of [8, 12, 16]) {
      const nome = `${formato.tipo} ${total}`
      const { torneio, partidas, ids } = simular(formato, total, 4)
      assert.ok(torneio.rodadas.length > 0, `${nome}: rodadas`)
      for (const rodada of torneio.rodadas) {
        const sentados = rodada.mesas.flatMap((mesa) => mesa.assentos)
        assert.equal(new Set(sentados).size, sentados.length, `${nome}: ninguém em duas mesas`)
      }
      const ranking = rankingDoTorneio(torneio, partidas)
      assert.equal(ranking.length, total, `${nome}: ranking com todos`)
      assert.deepEqual([...ranking.map((linha) => linha.jogadorId)].sort(), [...ids].sort())
      const cadastro = ids.map((id) => ({ id, nome: id.toUpperCase(), criadoEm: agora, arquivado: false }))
      const pacote = exportarTorneio(torneio, { partidas, jogadores: cadastro, temporadas: [] }, { modo: 'copia', agora })
      const lido = codigoParaPacote(pacoteParaCodigo(pacote))
      assert.ok(lido.ok, `${nome}: código`)
      const plano = planejarImportacao(lido.pacote, { torneios: [], jogadores: [] })
      const volta = importarTorneio(lido.pacote, plano, { sufixoImportado: '(i)' }, { gerarId: () => 'x', agora })
      assert.deepEqual(volta.torneio.rodadas, torneio.rodadas, `${nome}: rodadas na volta`)
      assert.deepEqual(rankingDoTorneio(volta.torneio, volta.partidas), ranking, `${nome}: ranking na volta`)
    }
  }
  console.log('Validação de ponta a ponta ok.')
}

console.log('Formatos ok.')
