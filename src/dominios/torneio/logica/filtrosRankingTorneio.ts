import type { UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'

export type VisaoRanking = 'classificacao' | 'disputa'

export interface FiltrosRankingTorneio {
  visao: VisaoRanking
  /** Guardado por torneio em cada aparelho: cada um acompanha quem quiser. */
  acompanharId: string | null
  /** null: todas. */
  ateRodada: number | null
  unidade: 'pontos' | UnidadeDistancia['id']
}

export const FILTROS_PADRAO_TORNEIO: FiltrosRankingTorneio = {
  visao: 'classificacao',
  acompanharId: null,
  ateRodada: null,
  unidade: 'pontos',
}

export function filtrosAtivos(filtros: FiltrosRankingTorneio): number {
  const chaves = Object.keys(FILTROS_PADRAO_TORNEIO) as (keyof FiltrosRankingTorneio)[]
  return chaves.filter((chave) => filtros[chave] !== FILTROS_PADRAO_TORNEIO[chave]).length
}

export const chaveAcompanhar = (torneioId: string) => `riichi-manager-torneio-acompanhar-${torneioId}`
