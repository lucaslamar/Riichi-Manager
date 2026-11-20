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
import { useModoJogo } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { partidasDoRankingMcr } from '@/dominios/placar-mcr/logica/rankingMcr'
import { usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'

/** Os filtros ficam salvos até a pessoa limpar. */
const CHAVE_FILTROS = 'riichi-manager-ranking-filtros'

/**
 * Filtros da tela e o ranking calculado a partir das partidas salvas. No modo
 * Chinês, as partidas são os placares MCR finalizados, sem filtro de duração.
 */
export function useRankingGeral() {
  const { partidas: partidasRiichi } = usePartidas()
  const { isChines } = useModoJogo()
  const placaresMcr = usePlacaresMcr()
  const partidas = useMemo(
    () => (isChines ? partidasDoRankingMcr(placaresMcr) : partidasRiichi),
    [isChines, placaresMcr, partidasRiichi],
  )
  const [filtros, setFiltros] = useState<FiltrosRankingGeral>(() =>
    lerFiltros(armazenamentoLocal.ler(CHAVE_FILTROS)),
  )

  useEffect(() => {
    armazenamentoLocal.gravar(CHAVE_FILTROS, JSON.stringify(filtros))
  }, [filtros])

  const filtrosDoModo = useMemo(
    () => (isChines ? { ...filtros, duracao: 'todas' as const } : filtros),
    [isChines, filtros],
  )
  const linhas = useMemo(() => computeRanking(partidas, filtrosDoModo, new Date()), [partidas, filtrosDoModo])

  /** Confronto direto do jogador filtrado, nas partidas que passam nos demais filtros. */
  const confrontos = useMemo(
    () =>
      filtros.jogadorId
        ? rivaisEFregueses(partidasFiltradas(partidas, filtrosDoModo, new Date()), filtros.jogadorId)
        : null,
    [partidas, filtros, filtrosDoModo],
  )

  return {
    filtros,
    setFiltros,
    linhas,
    confrontos,
    posicoes: useMemo(() => posicoesDoRanking(linhas), [linhas]),
  }
}
