/**
 * Torneio MCR: cada mesa é um placar ligado ao torneio. A classificação soma os
 * pontos de mesa (4, 2, 1 e 0 pela colocação), com o empate dividindo os pontos
 * das colocações empatadas, como nas regras de torneio MCR da EMA. Desempate da
 * classificação: a soma dos pontos das partidas.
 */
import { colocacoes, totais, type PlacarMcr } from './placar'

export const PONTOS_DE_MESA = [4, 2, 1, 0] as const
export const DURACAO_SESSAO_PADRAO_MIN = 120

export interface TorneioMcr {
  id: string
  nome: string
  criadoEm: string
  /** Tempo de cada sessão (mesa), em minutos. 0 = sem limite, só as 4 rodadas. */
  duracaoSessaoMin: number
  encerradoEm: string | null
}

export function novoTorneio(
  id: string,
  nome: string,
  duracaoSessaoMin: number,
  agora: string,
): TorneioMcr {
  return { id, nome: nome.trim(), criadoEm: agora, duracaoSessaoMin, encerradoEm: null }
}

/**
 * Pontos de mesa de cada cadeira pelos totais da partida. Empatados dividem
 * igualmente os pontos das colocações que ocupam juntos: dois em 1º ficam com
 * (4 + 2) ÷ 2 = 3 cada.
 */
export function pontosDeMesa(pontos: readonly number[]): number[] {
  const lugares = colocacoes(pontos)
  return pontos.map((_, cadeira) => {
    const lugar = lugares[cadeira]
    const empatados = lugares.filter((outro) => outro === lugar).length
    const ocupados = PONTOS_DE_MESA.slice(lugar - 1, lugar - 1 + empatados)
    return ocupados.reduce<number>((soma, valor) => soma + valor, 0) / empatados
  })
}

export interface LinhaClassificacaoMcr {
  jogadorId: string
  pontosMesa: number
  pontosPartidas: number
  mesas: number
}

/** Classificação do torneio com as mesas finalizadas: pontos de mesa e, no empate, a soma das partidas. */
export function classificacao(
  torneioId: string,
  placares: readonly PlacarMcr[],
): LinhaClassificacaoMcr[] {
  const linhas = new Map<string, LinhaClassificacaoMcr>()
  for (const placar of placares) {
    if (placar.torneio?.id !== torneioId || !placar.finalizadoEm) continue
    const pontos = totais(placar)
    const mesa = pontosDeMesa(pontos)
    placar.jogadorIds.forEach((jogadorId, cadeira) => {
      const atual = linhas.get(jogadorId) ?? {
        jogadorId,
        pontosMesa: 0,
        pontosPartidas: 0,
        mesas: 0,
      }
      atual.pontosMesa += mesa[cadeira]
      atual.pontosPartidas += pontos[cadeira]
      atual.mesas += 1
      linhas.set(jogadorId, atual)
    })
  }
  return [...linhas.values()].sort(
    (uma, outra) => outra.pontosMesa - uma.pontosMesa || outra.pontosPartidas - uma.pontosPartidas,
  )
}

/** Quando a sessão de uma mesa nova acaba, ou `null` se o torneio não tem limite de tempo. */
export function fimDaSessao(torneio: TorneioMcr, agora: Date): string | null {
  if (!torneio.duracaoSessaoMin) return null
  return new Date(agora.getTime() + torneio.duracaoSessaoMin * 60_000).toISOString()
}

/** Minutos que faltam na sessão (0 quando acabou); `null` sem limite. */
export function minutosRestantes(
  fimSessaoEm: string | null | undefined,
  agora: Date,
): number | null {
  if (!fimSessaoEm) return null
  return Math.max(0, Math.ceil((Date.parse(fimSessaoEm) - agora.getTime()) / 60_000))
}
