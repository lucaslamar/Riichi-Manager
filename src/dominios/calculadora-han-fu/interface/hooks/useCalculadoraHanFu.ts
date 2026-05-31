import { useMemo, useState } from 'react'
import {
  aplicarHonba,
  calcularHanFu,
  calcularPatamarHanFu,
  configuracaoPadrao,
  fuValidos,
  montarPontosRapidos,
} from '@/compartilhado/mahjong/pontuacao'

export type AgariHanFu = 'tsumo' | 'ron'

export function useCalculadoraHanFu() {
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)
  const [agari, setAgari] = useState<AgariHanFu>('tsumo')
  const [isOya, setIsOya] = useState(false)
  const [honba, setHonba] = useState(0)

  const fuDisponiveis = useMemo(() => fuValidos(agari), [agari])
  const tabela = calcularHanFu(han, fu, configuracaoPadrao)
  const resultado = aplicarHonba(montarPontosRapidos(isOya, agari, tabela), honba)
  const patamar = calcularPatamarHanFu(han, fu, configuracaoPadrao)

  return {
    agari,
    setAgari,
    configuracao: configuracaoPadrao,
    fu,
    setFu,
    fuDisponiveis,
    han,
    setHan,
    honba,
    setHonba,
    isOya,
    setIsOya,
    patamar,
    resultado,
  }
}

export type EstadoCalculadoraHanFu = ReturnType<typeof useCalculadoraHanFu>
