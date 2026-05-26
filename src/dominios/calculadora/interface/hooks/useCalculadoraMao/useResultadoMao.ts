import { useMemo } from 'react'
import {
  aplicarHonba,
  calcularEsperasPossiveis,
  calcularHanFu,
  calcularMao,
  calcularPatamarHanFu,
  fuValidos,
  montarPontosRapidos,
  type ConfiguracaoCalculo,
  type Mao,
} from '../../../logica/mao'

interface ParametrosResultadoMao {
  mao: Mao
  configuracao: ConfiguracaoCalculo
  han: number
  fu: number
  maoCompleta: boolean
  deveCalcularMao: boolean
}

/**
 * Calcula as saídas derivadas da mão sem alterar estado.
 * Mantém juntos o modo rápido, o modo completo e a checagem de furiten por descarte próprio.
 *
 * Como ler este arquivo:
 * - bloco rápido: han/fu manual vira tabela de pontos.
 * - bloco completo: mão montada tenta passar pelo motor de cálculo.
 * - bloco furiten: reconstrói a mão de 13 pedras para descobrir se o Ron final é inválido.
 */
export function useResultadoMao({
  mao,
  configuracao,
  han,
  fu,
  maoCompleta,
  deveCalcularMao,
}: ParametrosResultadoMao) {
  const tabelaRapida = calcularHanFu(han, fu, configuracao)
  const resultadoRapido = aplicarHonba(
    montarPontosRapidos(mao.ventoRodada === '1', mao.agari, tabelaRapida),
    mao.honba,
  )
  const patamarRapido = calcularPatamarHanFu(han, fu, configuracao)
  const fuDisponiveis = fuValidos(mao.agari)

  const resultado = maoCompleta && deveCalcularMao
    ? (() => {
        try {
          return calcularMao(mao, configuracao)
        } catch {
          return null
        }
      })()
    : null

  /**
   * Detecta o caso de Ron em furiten depois que a 14ª pedra já foi escolhida.
   * Para isso removemos temporariamente a pedra de agari e recalculamos as esperas da base.
   */
  const furitenRonCompleto = useMemo(() => {
    if (!deveCalcularMao || !maoCompleta || mao.agari !== 'ron' || mao.descartes.length === 0) {
      return null
    }
    if (!mao.agariMeld && (mao.indiceAgari < 0 || mao.indiceAgari >= mao.pedras.length)) return null

    const maoBase: Mao = mao.agariMeld
      ? {
          ...mao,
          pedras: [...mao.pedras, ...mao.agariMeld.pedrasConsumidasMao],
          melds: mao.melds.filter((_meld, indice) => indice !== mao.agariMeld?.indiceMeld),
          indiceAgari: -1,
          agariMeld: null,
        }
      : {
          ...mao,
          pedras: mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari),
          indiceAgari: -1,
          agariMeld: null,
        }
    const esperas = calcularEsperasPossiveis(maoBase, configuracao, 13)
    const esperasFuriten = esperas.filter((espera) => !espera.semYaku && espera.furiten)

    return esperasFuriten.length > 0 ? esperasFuriten : null
  }, [mao, maoCompleta, configuracao, deveCalcularMao])

  return {
    resultadoRapido,
    patamarRapido,
    fuDisponiveis,
    resultado,
    furitenRonCompleto,
  }
}
