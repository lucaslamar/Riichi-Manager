import { useEffect, useState } from 'react'
import {
  calcularEsperasPossiveis,
  type ConfiguracaoCalculo,
  type EsperaPossivel,
  type Mao,
} from '../../../logica/mao'
import type { EstadoEsperasCalculadora } from './tipos'

interface ParametrosEsperasMao {
  mao: Mao
  configuracao: ConfiguracaoCalculo
  slotsUsados: number
}

/**
 * Calcula esperas apenas quando a mão está em 13 slots.
 * Usa um timeout curto para não bloquear o clique que acabou de alterar a mão.
 *
 * Como ler este arquivo:
 * - fora de 13 slots, esperas são limpas;
 * - em 13 slots, o cálculo roda de forma assíncrona no próximo ciclo do navegador;
 * - o estado `calculandoEsperas` existe para a interface poder sinalizar espera futura.
 */
export function useEsperasMao({
  mao,
  configuracao,
  slotsUsados,
}: ParametrosEsperasMao): EstadoEsperasCalculadora {
  const [esperasPossiveis, setEsperasPossiveis] = useState<EsperaPossivel[]>([])
  const [calculandoEsperas, setCalculandoEsperas] = useState(false)

  useEffect(() => {
    setEsperasPossiveis([])
    setCalculandoEsperas(false)
    if (slotsUsados !== 13) return

    setCalculandoEsperas(true)
    const id = window.setTimeout(() => {
      setEsperasPossiveis(calcularEsperasPossiveis(mao, configuracao, slotsUsados))
      setCalculandoEsperas(false)
    }, 0)

    return () => window.clearTimeout(id)
  }, [mao, configuracao, slotsUsados])

  return { esperasPossiveis, calculandoEsperas }
}
