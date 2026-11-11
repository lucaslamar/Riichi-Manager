import { useEffect, useMemo, useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { posicoesDoRanking } from '../../logica/ranking'
import {
  computeRanking,
  lerFiltros,
  partidasFiltradas,
  rivaisEFregueses,
  type FiltrosRankingGeral,
} from '../../logica/filtrosRanking'
import { usePartidas } from './usePartidas'

/** Os filtros ficam salvos até a pessoa limpar. */
const CHAVE_FILTROS = 'riichi-manager-ranking-filtros'

/** Filtros da tela e o ranking calculado a partir das partidas salvas. */
export function useRankingGeral() {
  const { partidas } = usePartidas()
  const [filtros, setFiltros] = useState<FiltrosRankingGeral>(() =>
    lerFiltros(armazenamentoLocal.ler(CHAVE_FILTROS)),
  )

  useEffect(() => {
    armazenamentoLocal.gravar(CHAVE_FILTROS, JSON.stringify(filtros))
  }, [filtros])

  const linhas = useMemo(() => computeRanking(partidas, filtros, new Date()), [partidas, filtros])

  /** Confronto direto do jogador filtrado, nas partidas que passam nos demais filtros. */
  const confrontos = useMemo(
    () =>
      filtros.jogadorId
        ? rivaisEFregueses(partidasFiltradas(partidas, filtros, new Date()), filtros.jogadorId)
        : null,
    [partidas, filtros],
  )

  return {
    filtros,
    setFiltros,
    linhas,
    confrontos,
    posicoes: useMemo(() => posicoesDoRanking(linhas), [linhas]),
  }
}
