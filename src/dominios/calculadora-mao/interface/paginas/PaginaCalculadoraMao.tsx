import { useEffect } from 'react'
import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import ModalRegras from '../componentes/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'
import type { VentoMao } from '../../logica/mao'
import type { ResultadoCalculoParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'
import { converterMaoParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'

interface ContextoCenterpieceMao {
  tipoVitoria: 'ron' | 'tsumo'
  ventoRodada: VentoMao
  ventoAssento: VentoMao
  honba: number
}

interface PropsPaginaCalculadoraMao {
  aoUsarResultado?: (resultado: ResultadoCalculoParaCenterpiece) => void
  contextoCenterpiece?: ContextoCenterpieceMao
  aoVoltar?: () => void
}

export default function PaginaCalculadoraMao({
  aoUsarResultado,
  contextoCenterpiece,
  aoVoltar,
}: PropsPaginaCalculadoraMao = {}) {
  const calculadora = useCalculadoraMao(
    contextoCenterpiece
      ? {
          initialMao: {
            agari: contextoCenterpiece.tipoVitoria,
            ventoRodada: contextoCenterpiece.ventoRodada,
            ventoAssento: contextoCenterpiece.ventoAssento,
            honba: contextoCenterpiece.honba,
          },
          fluxoCompleto: true,
        }
      : undefined,
  )

  // No contexto centerpiece: usa o resultado automaticamente ao calcular, sem mostrar tela de resultado
  useEffect(() => {
    if (!contextoCenterpiece || !calculadora.resultado || !aoUsarResultado) return
    const convertido = converterMaoParaCenterpiece(calculadora.resultado)
    if (convertido) aoUsarResultado(convertido)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculadora.resultado])

  const cabecalho = contextoCenterpiece ? null : <BarraCalculadora modo="completo" />

  const aoUsarMao = aoUsarResultado && !contextoCenterpiece
    ? () => {
        if (!calculadora.resultado) return
        const convertido = converterMaoParaCenterpiece(calculadora.resultado)
        if (convertido) aoUsarResultado(convertido)
      }
    : undefined

  return (
    <div>
      <ModoCompletoCalculadora
        estado={calculadora}
        cabecalho={cabecalho}
        aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
        aoUsarMao={aoUsarMao}
        ocultarOpcoesMao={!!contextoCenterpiece}
        aoCalcularDireto={contextoCenterpiece ? calculadora.calcularMaoAtual : undefined}
        aoVoltar={contextoCenterpiece ? aoVoltar : undefined}
      />

      {calculadora.modalRegrasAberto && (
        <ModalRegras
          configuracao={calculadora.configuracao}
          aoMudar={calculadora.setConfiguracao}
          aoFechar={() => calculadora.setModalRegrasAberto(false)}
        />
      )}
    </div>
  )
}
