/**
 * O que as estatísticas enxergam em cada escopo: partidas, classificação e o tipo
 * de virada (cenários com fim ou projeção sem fim). Sem tela.
 */
import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'
import {
  computeRanking,
  partidasFiltradas,
  type FiltrosRankingGeral,
} from '@/dominios/centerpiece/logica/filtrosRanking'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import {
  partidasDoHistorico,
  posicoesDoRanking,
  semExcluidos,
} from '@/dominios/centerpiece/logica/ranking'
import type { ValoresUma } from '@/dominios/centerpiece/logica/uma'
import { jogosRestantes } from '@/dominios/torneio/logica/jogosRestantes'
import {
  rankingDoTorneio,
  recorteAteRodada,
  type LinhaRankingTorneio,
} from '@/dominios/torneio/logica/ranking'
import { rankingTemporada } from '@/dominios/torneio/logica/temporada'
import { dataDoDia } from '@/dominios/torneio/logica/torneio'
import type { Temporada, Torneio } from '@/dominios/torneio/logica/tipos'
import type { BaseDaForma } from './forma'
import { bonusDasPosicoes } from './viradas'

export type EscopoEstatisticas =
  | {
      tipo: 'torneio'
      id: string
      /** Como estava no fim desta rodada. Ausente ou null: agora. */
      ateRodada?: number | null
    }
  | { tipo: 'temporada'; id: string }
  | { tipo: 'geral' }

export type ViradasDoEscopo =
  | { tipo: 'projecao' }
  | {
      tipo: 'cenarios'
      /** null: só as distâncias, sem cenários. */
      bonus: ValoresUma | null
      restantesDe: (jogadorId: string) => number | null
      /** Fim por data (AAAA-MM-DD): os jogos que faltam são uma estimativa. */
      ate?: string
    }

export interface VisaoDoEscopo {
  partidas: Partida[]
  linhas: LinhaRankingTorneio[]
  viradas: ViradasDoEscopo
  /** null no Chinês, onde pontos de mesa e de partida não se misturam. */
  forma: BaseDaForma | null
}

const DIA_MS = 86_400_000
/** Com menos que isto o ritmo de jogos ainda não quer dizer nada. */
const MINIMO_DE_DIAS = 7
const MINIMO_DE_JOGOS = 3

/** Jogada de verdade: quem não apareceu (WO) não tem colocação nem mãos. */
const jogadas = (partidas: readonly Partida[]) =>
  partidas.filter(({ status, resultado, wo }) => status === 'finalizada' && resultado && !wo)

/** As mesas do escopo mais as outras finalizadas, de 4, sem repetir. */
function mesasParaForma(doEscopo: readonly Partida[], todas: readonly Partida[]): Partida[] {
  const ids = new Set(doEscopo.map((partida) => partida.id))
  const outras = partidasDoHistorico(todas).filter(
    (partida) => !ids.has(partida.id) && partida.variante !== 'sanma',
  )
  return [...doEscopo, ...outras]
}

export function visaoDoTorneio(
  torneio: Torneio,
  partidas: readonly Partida[],
  ateRodada: number | null = null,
): VisaoDoEscopo {
  const doTorneio = partidas.filter((partida) => partida.vinculoTorneio?.torneioId === torneio.id)
  const recorte = recorteAteRodada(torneio, doTorneio, ateRodada)
  // "Até a rodada" volta no tempo: ali o torneio ainda não tinha acabado.
  const naquelaHora: Torneio =
    ateRodada === null ? torneio : { ...recorte.torneio, status: 'em_andamento' }
  const mesas = jogadas(recorte.partidas)
  // "Até a rodada" só conhece o que tinha terminado até ali.
  const limite = mesas.reduce((maior, { finalizadaEm = '' }) => (finalizadaEm > maior ? finalizadaEm : maior), '')
  const conhecidas =
    ateRodada === null
      ? partidas
      : partidas.filter(
          ({ finalizadaEm, vinculoTorneio }) =>
            vinculoTorneio?.torneioId !== torneio.id && (finalizadaEm ?? '') <= limite,
        )
  return {
    partidas: mesas,
    forma:
      torneio.jogo === 'mcr'
        ? null
        : {
            partidas: mesasParaForma(mesas, conhecidas),
            pontosPartida: torneio.config.pontosPartida,
            bonus: bonusDasPosicoes(torneio.config),
          },
    linhas: rankingDoTorneio(recorte.torneio, recorte.partidas),
    viradas: {
      tipo: 'cenarios',
      bonus: torneio.jogo === 'mcr' ? null : bonusDasPosicoes(torneio.config),
      restantesDe: (id) => jogosRestantes(naquelaHora, recorte.partidas, id),
    },
  }
}

/** Jogos até a data, no ritmo do jogador. 0 depois do fim, null sem ritmo conhecido. */
export function jogosAteOFim(
  periodo: { inicio: string; fim: string },
  jogados: number,
  agora: Date,
): number | null {
  const hoje = dataDoDia(agora)
  if (hoje > periodo.fim) return 0
  const dia = (data: string) => Date.parse(`${data}T12:00:00Z`)
  const passados = (dia(hoje) - dia(periodo.inicio)) / DIA_MS + 1
  if (!(passados >= MINIMO_DE_DIAS) || jogados < MINIMO_DE_JOGOS) return null
  const faltam = (dia(periodo.fim) - dia(hoje)) / DIA_MS + 1
  return Math.max(1, Math.round((jogados / passados) * faltam))
}

export function visaoDaTemporada(
  temporada: Temporada,
  encontros: readonly Torneio[],
  partidas: readonly Partida[],
  agora: Date,
): VisaoDoEscopo {
  const ids = new Set(encontros.map((encontro) => encontro.id))
  const daTemporada = partidas.filter(
    (partida) => partida.vinculoTorneio && ids.has(partida.vinculoTorneio.torneioId),
  )
  const classificados = rankingTemporada(encontros, daTemporada, temporada.criterio).filter(
    (linha) => !linha.abaixoDoMinimo,
  )
  const linhas = classificados.map(
    ({ jogadorId, valor, partidas: quantas }, indice): LinhaRankingTorneio => ({
      jogadorId,
      pontos: valor,
      partidas: quantas,
      desempate: 0,
      mediaColocacao: 0,
      posicao: indice + 1,
    }),
  )
  // Na média e nos melhores N, mãos não viram pontos da temporada um para um.
  const somaPontos = temporada.criterio.tipo === 'soma' && temporada.jogo !== 'mcr'
  const mesas = jogadas(daTemporada)
  return {
    partidas: mesas,
    forma:
      temporada.jogo === 'mcr'
        ? null
        : {
            partidas: mesasParaForma(mesas, partidas),
            pontosPartida: temporada.config.pontosPartida,
            bonus: bonusDasPosicoes(temporada.config),
          },
    linhas,
    viradas: {
      tipo: 'cenarios',
      bonus: somaPontos ? bonusDasPosicoes(temporada.config) : null,
      ate: temporada.fim,
      restantesDe: (id) => {
        const jogados = linhas.find((linha) => linha.jogadorId === id)?.partidas ?? 0
        return jogosAteOFim(temporada, jogados, agora)
      },
    },
  }
}

/** O Ranking geral só tem fim com o período personalizado com data final. */
export function visaoGeral(
  partidas: readonly Partida[],
  filtros: FiltrosRankingGeral,
  opcoes: { modo: ModoJogo; agora: Date; existe: (jogadorId: string) => boolean },
): VisaoDoEscopo {
  const { modo, agora, existe } = opcoes
  const semJogador: FiltrosRankingGeral = {
    ...filtros,
    jogadorId: undefined,
    ordenarPor: 'pontuacao',
  }
  const filtradas = partidasFiltradas(partidas, semJogador, agora)
  const ranking = semExcluidos(computeRanking(partidas, semJogador, agora), existe)
  const posicoes = posicoesDoRanking(ranking)
  const linhas = ranking.map(
    (linha, indice): LinhaRankingTorneio => ({
      jogadorId: linha.jogadorId,
      pontos: linha.pontuacaoTotal,
      partidas: linha.partidas,
      desempate: 0,
      mediaColocacao: linha.mediaColocacao,
      posicao: posicoes[indice],
    }),
  )

  const { periodo, inicio, fim } = filtros
  // `partidasFiltradas` vem da mais recente para a mais antiga.
  const recente = filtradas[0]
  const forma: BaseDaForma | null =
    modo === 'mcr' || !recente
      ? null
      : {
          partidas: filtradas,
          pontosPartida: recente.config.pontosPartida,
          bonus: bonusDasPosicoes(recente.config),
        }
  if (modo === 'mcr' || periodo !== 'personalizado' || !fim || !recente) {
    return { partidas: filtradas, linhas, forma, viradas: { tipo: 'projecao' } }
  }
  const primeira = filtradas[filtradas.length - 1]
  const desde = inicio ?? dataDoDia(new Date(primeira.finalizadaEm ?? agora))
  return {
    partidas: filtradas,
    linhas,
    forma,
    viradas: {
      tipo: 'cenarios',
      // As partidas podem ter regras diferentes: valem as da mais recente.
      bonus: bonusDasPosicoes(recente.config),
      ate: fim,
      restantesDe: (id) => {
        const jogados = linhas.find((linha) => linha.jogadorId === id)?.partidas ?? 0
        return jogosAteOFim({ inicio: desde, fim }, jogados, agora)
      },
    },
  }
}
