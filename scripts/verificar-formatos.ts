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

console.log('Formatos ok.')
