import { useMemo, useState } from 'react'
import {
  calcularPontuacaoHanFu,
  montarReferenciaRapida,
  normalizarFu,
  obterFuValidos,
  type TipoVitoriaHanFu,
} from '../../logica'

export type AgariHanFu = TipoVitoriaHanFu

export function useCalculadoraHanFu() {
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)
  const [agari, setAgari] = useState<AgariHanFu>('ron')
  const [isOya, setIsOya] = useState(false)
  const [honba, setHonba] = useState(0)

  const fuDisponiveis = useMemo(() => obterFuValidos(han), [han])
  const fuNormalizado = useMemo(() => normalizarFu(han, fu), [han, fu])
  const resultado = useMemo(
    () =>
      calcularPontuacaoHanFu({
        han,
        fu: fuNormalizado,
        ehDealer: isOya,
        tipoVitoria: agari,
        honba,
      }),
    [agari, fuNormalizado, han, honba, isOya],
  )
  const referenciaRapida = useMemo(
    () =>
      montarReferenciaRapida({
        han,
        fu: fuNormalizado,
      }),
    [fuNormalizado, han],
  )

  const mudarHan = (proximoHan: number) => {
    setHan(proximoHan)
    setFu((fuAtual) => normalizarFu(proximoHan, fuAtual))
  }

  const mudarFu = (proximoFu: number) => {
    setFu(normalizarFu(han, proximoFu))
  }

  return {
    agari,
    setAgari,
    fu: fuNormalizado,
    setFu: mudarFu,
    fuDisponiveis,
    han,
    setHan: mudarHan,
    honba,
    setHonba,
    isOya,
    setIsOya,
    referenciaRapida,
    resultado,
  }
}

export type EstadoCalculadoraHanFu = ReturnType<typeof useCalculadoraHanFu>
