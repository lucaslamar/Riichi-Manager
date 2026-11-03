import { useMemo } from 'react'
import { maoSemBatida } from '../../../logica/batida'
import {
  calcularEsperasPossiveis,
  calcularMao,
  type ConfiguracaoCalculo,
  type Mao,
} from '../../../logica/mao'

interface ParametrosResultadoMao {
  mao: Mao
  configuracao: ConfiguracaoCalculo
  maoCompleta: boolean
  deveCalcularMao: boolean
}

/**
 * Calcula as saídas derivadas da mão sem alterar estado.
 * Mantém juntos o modo rápido, o modo completo e a checagem de furiten por descarte próprio.
 *
 * Como ler este arquivo:
 * - bloco completo: mão montada tenta passar pelo motor de cálculo.
 * - bloco furiten: reconstrói a mão de 13 pedras para descobrir se o Ron final é inválido.
 */
export function useResultadoMao({
  mao,
  configuracao,
  maoCompleta,
  deveCalcularMao,
}: ParametrosResultadoMao) {
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
    const maoBase = maoSemBatida(mao)
    if (!maoBase) return null

    const esperas = calcularEsperasPossiveis(maoBase, configuracao, 13)
    const esperasFuriten = esperas.filter((espera) => !espera.semYaku && espera.furiten)

    return esperasFuriten.length > 0 ? esperasFuriten : null
  }, [mao, maoCompleta, configuracao, deveCalcularMao])

  return {
    resultado,
    furitenRonCompleto,
  }
}
