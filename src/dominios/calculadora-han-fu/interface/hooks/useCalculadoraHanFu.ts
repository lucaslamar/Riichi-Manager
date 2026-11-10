import { useMemo, useState } from 'react'
import type { RegrasSanma, Variante } from '@/compartilhado/mahjong/variante'
import {
  calcularPontuacaoHanFu,
  montarReferenciaRapida,
  normalizarFu,
  obterFuValidos,
  type TipoVitoriaHanFu,
} from '../../logica'

export type AgariHanFu = TipoVitoriaHanFu

interface OpcionsIniciaisCalculadoraHanFu {
  initialHan?: number
  initialFu?: number
  initialAgari?: AgariHanFu
  initialIsOya?: boolean
  initialHonba?: number
  basengo?: boolean
  /** Sanma: pagamentos de 3 jogadores e tabela rápida do Sanma. Ausente = yonma. */
  variante?: Variante
  regrasSanma?: RegrasSanma
}

export function useCalculadoraHanFu(opcoes?: OpcionsIniciaisCalculadoraHanFu) {
  const [han, setHan] = useState(opcoes?.initialHan ?? 1)
  const [fu, setFu] = useState(opcoes?.initialFu ?? 30)
  const [agari, setAgari] = useState<AgariHanFu>(opcoes?.initialAgari ?? 'ron')
  const [isOya, setIsOya] = useState(opcoes?.initialIsOya ?? false)
  const [honba, setHonba] = useState(opcoes?.initialHonba ?? 0)

  const sanma = opcoes?.variante === 'sanma'
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
        basengo: opcoes?.basengo,
        ...(sanma ? { variante: 'sanma' as const, regrasSanma: opcoes?.regrasSanma } : {}),
      }),
    [agari, fuNormalizado, han, honba, isOya, opcoes?.basengo, sanma, opcoes?.regrasSanma],
  )
  const referenciaRapida = useMemo(
    () =>
      montarReferenciaRapida(
        {
          han,
          fu: fuNormalizado,
        },
        sanma ? opcoes?.regrasSanma : undefined,
      ),
    [fuNormalizado, han, sanma, opcoes?.regrasSanma],
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
