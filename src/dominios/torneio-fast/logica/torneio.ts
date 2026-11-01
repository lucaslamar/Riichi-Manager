/**
 * Torneio ligado às partidas: cada mesa jogada é uma Partida com `vinculoTorneio`,
 * então placar, histórico e ranking são os mesmos das partidas casuais.
 */
import { alterarConfig, configDoPreset, type ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'
import {
  corrigirPontosFinais,
  criarPartida,
  porCadeira,
  type Partida,
} from '@/dominios/centerpiece/logica/partida'
import { calcularRanking, type LinhaRanking } from '@/dominios/centerpiece/logica/ranking'
import { criarTimerVazio } from './acoes'
import { chaveMesa } from './chaves'
import { RODADAS_PADRAO, SEGUNDOS_RODADA_PADRAO, VENTOS } from './constantes'
import { avaliarGrade } from './qualidade'
import type { RascunhoTorneio, Rodada, Torneio } from './tipos'

export type StatusMesa = 'nao_iniciada' | 'em_andamento' | 'finalizada' | 'guardada'

/** Padrão do torneio: 30.000 de partida e de retorno, sem oka. */
export function configPadraoTorneio(): ConfigMesa {
  return alterarConfig(configDoPreset('padrao'), { pontosPartida: 30000 })
}

export function rascunhoInicial(): RascunhoTorneio {
  return {
    passo: 0,
    linhas: [''],
    config: configPadraoTorneio(),
    segundosRodada: SEGUNDOS_RODADA_PADRAO,
    rodadas: RODADAS_PADRAO,
    equilibrarVentos: true,
    sorteio: null,
  }
}

/** Troca os nomes da grade do rascunho pelos ids do cadastro. */
export function gradeComIds(grade: Rodada[], idDoNome: Map<string, string>): Rodada[] {
  return grade.map((rodada) => ({
    ...rodada,
    mesas: rodada.mesas.map((mesa) => ({
      ...mesa,
      assentos: mesa.assentos.map((assento) => ({
        ...assento,
        jogador: idDoNome.get(assento.jogador) ?? assento.jogador,
      })),
    })),
  }))
}

export function criarTorneio(
  rascunho: RascunhoTorneio,
  nomes: readonly string[],
  ids: readonly string[],
  contexto: { id: string; agora: string },
): Torneio | null {
  if (!rascunho.sorteio) return null
  const idDoNome = new Map(nomes.map((nome, indice) => [nome, ids[indice]]))
  const grade = gradeComIds(rascunho.sorteio.rodadas, idDoNome)
  return {
    id: contexto.id,
    criadoEm: contexto.agora,
    status: 'em_andamento',
    config: rascunho.config,
    jogadorIds: [...ids],
    grade,
    qualidade: avaliarGrade(grade, ids.length),
    timer: criarTimerVazio(0, rascunho.segundosRodada),
  }
}

export function partidaDaMesa(
  partidas: readonly Partida[],
  torneioId: string,
  rodada: number,
  mesa: number,
): Partida | undefined {
  return partidas.find(({ vinculoTorneio: vinculo }) =>
    vinculo?.torneioId === torneioId && vinculo.rodada === rodada && vinculo.mesa === mesa,
  )
}

export function statusDaMesa(partida: Partida | undefined): StatusMesa {
  if (!partida) return 'nao_iniciada'
  if (partida.status === 'em_andamento') return 'em_andamento'
  return partida.vinculoTorneio?.guardada ? 'guardada' : 'finalizada'
}

/** Mesa do sorteio vira partida: ordem Leste, Sul, Oeste, Norte nas cadeiras 0 a 3. */
export function criarPartidaDaMesa(
  torneio: Torneio,
  rodada: number,
  mesa: number,
  contexto: { id: string; agora: string },
): Partida {
  // O sorteio não guarda os assentos na ordem dos ventos.
  const jogadorDoVento = (indice: number) =>
    torneio.grade[rodada].mesas[mesa].assentos.find((assento) => assento.vento === VENTOS[indice])
      ?.jogador ?? ''
  const jogadorIds = [0, 1, 2, 3].map(jogadorDoVento) as [string, string, string, string]
  return {
    ...criarPartida(contexto.id, torneio.config, jogadorIds, contexto.agora),
    vinculoTorneio: { torneioId: torneio.id, rodada, mesa },
  }
}

/** Mesa jogada no papel: partida finalizada só com os pontos do fim. */
export function criarPartidaManual(
  torneio: Torneio,
  rodada: number,
  mesa: number,
  pontos: readonly [number, number, number, number],
  contexto: { id: string; agora: string },
): Partida {
  return corrigirPontosFinais(criarPartidaDaMesa(torneio, rodada, mesa, contexto), pontos, contexto.agora)
}

export function guardarPartida(partida: Partida): Partida {
  return partida.vinculoTorneio
    ? { ...partida, vinculoTorneio: { ...partida.vinculoTorneio, guardada: true } }
    : partida
}

export function reabrirPartida(partida: Partida): Partida {
  return partida.vinculoTorneio
    ? { ...partida, vinculoTorneio: { ...partida.vinculoTorneio, guardada: false } }
    : partida
}

export function progressoDaRodada(partidas: readonly Partida[], torneio: Torneio, rodada: number) {
  const mesas = torneio.grade[rodada]?.mesas ?? []
  const guardadas = mesas.filter(
    (_, mesa) => statusDaMesa(partidaDaMesa(partidas, torneio.id, rodada, mesa)) === 'guardada',
  ).length
  return { guardadas, total: mesas.length }
}

/** Rodada completa: o timer passa para a seguinte, parado e com o tempo cheio. */
export function avancarSeRodadaCompleta(torneio: Torneio, partidas: readonly Partida[]): Torneio {
  const { timer, grade } = torneio
  const { guardadas, total } = progressoDaRodada(partidas, torneio, timer.indiceRodada)
  if (guardadas < total || timer.indiceRodada + 1 >= grade.length) return torneio
  return {
    ...torneio,
    timer: criarTimerVazio(timer.indiceRodada + 1, timer.totalSegundos, timer.acrescimosPorMesa),
  }
}

/** Só as mesas guardadas deste torneio; quem ainda não jogou aparece com zero. */
export function rankingDoTorneio(partidas: readonly Partida[], torneio: Torneio): LinhaRanking[] {
  const doTorneio = partidas.filter((partida) => partida.vinculoTorneio?.torneioId === torneio.id)
  const linhas = calcularRanking(doTorneio, { periodo: 'tudo', origem: 'todas' }, new Date())
  const presentes = new Set(linhas.map((linha) => linha.jogadorId))
  return [
    ...linhas,
    ...torneio.jogadorIds
      .filter((id) => !presentes.has(id))
      .map((jogadorId) => ({
        jogadorId,
        partidas: 0,
        pontuacaoTotal: 0,
        mediaColocacao: 0,
        percentualPrimeiro: 0,
        percentualQuarto: 0,
        percentualTobi: 0,
      })),
  ].sort((uma, outra) => outra.pontuacaoTotal - uma.pontuacaoTotal)
}

/** Pontos prontos para o lançamento: os da partida, senão os de partida da config. */
export function pontosIniciaisDaMesa(partida: Partida | undefined, config: ConfigMesa) {
  const pontos = porCadeira(() => config.pontosPartida)
  if (partida?.resultado) {
    for (const linha of partida.resultado) pontos[linha.cadeira] = linha.pontosBrutos
  } else if (partida) {
    return partida.placar.pontos
  }
  return pontos
}

export { chaveMesa }
