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
import { useConfigSanma } from '@/compartilhado/configuracoes/useConfigSanma'

/** Os filtros ficam salvos até a pessoa limpar. */
const CHAVE_FILTROS = 'riichi-manager-ranking-filtros'

/** Filtros da tela e o ranking calculado a partir das partidas salvas. */
export function useRankingGeral() {
  const { partidas } = usePartidas()
  const { sanmaHabilitado } = useConfigSanma()
  const [filtrosSalvos, setFiltros] = useState<FiltrosRankingGeral>(() =>
    lerFiltros(armazenamentoLocal.ler(CHAVE_FILTROS)),
  )

  useEffect(() => {
    armazenamentoLocal.gravar(CHAVE_FILTROS, JSON.stringify(filtrosSalvos))
  }, [filtrosSalvos])

  // Sanma desligado: o ranking é o de 4 jogadores, seja qual for o filtro guardado.
  const filtros = useMemo<FiltrosRankingGeral>(
    () => (sanmaHabilitado || !filtrosSalvos.variante ? filtrosSalvos : { ...filtrosSalvos, variante: undefined }),
    [sanmaHabilitado, filtrosSalvos],
  )

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
