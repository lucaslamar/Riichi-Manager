import { useMemo, useState } from 'react'
import {
  calcularRanking,
  posicoesDoRanking,
  type FiltroOrigem,
  type FiltroPeriodo,
} from '../../logica/ranking'
import { usePartidas } from './usePartidas'

/** Filtros da tela e o ranking calculado a partir das partidas salvas. */
export function useRankingGeral() {
  const { partidas } = usePartidas()
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('tudo')
  const [origem, setOrigem] = useState<FiltroOrigem>('todas')

  const linhas = useMemo(
    () => calcularRanking(partidas, { periodo, origem }, new Date()),
    [partidas, periodo, origem],
  )

  return {
    periodo,
    setPeriodo,
    origem,
    setOrigem,
    linhas,
    posicoes: useMemo(() => posicoesDoRanking(linhas), [linhas]),
  }
}
