import { useMemo, useState } from 'react'
import {
  calcularRanking,
  posicoesDoRanking,
  type FiltroPeriodo,
} from '../../logica/ranking'
import { usePartidas } from './usePartidas'

/** Filtros da tela e o ranking calculado a partir das partidas salvas. */
export function useRankingGeral() {
  const { partidas } = usePartidas()
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('tudo')

  const linhas = useMemo(
    () => calcularRanking(partidas, { periodo, origem: 'todas' }, new Date()),
    [partidas, periodo],
  )

  return {
    periodo,
    setPeriodo,
    linhas,
    posicoes: useMemo(() => posicoesDoRanking(linhas), [linhas]),
  }
}
