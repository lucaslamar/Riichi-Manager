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
  rodadaNumero?: number
  vencedorId?: string
  pagadorId?: string
  vencedorEhLeste?: boolean
  vencedorNome?: string
  jogadorRiichi?: boolean
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
            riichi: contextoCenterpiece.jogadorRiichi
              ? { duplo: false, ippatsu: false }
              : null,
          },
          fluxoCompleto: true,
        }
      : undefined,
  )

  const cabecalho = contextoCenterpiece ? null : <BarraCalculadora modo="completo" />

  const aoUsarMao = aoUsarResultado
    ? () => {
        if (!calculadora.resultado) return
        const convertido = converterMaoParaCenterpiece(calculadora.resultado, {
          vencedorId: contextoCenterpiece?.vencedorId,
          pagadorId: contextoCenterpiece?.pagadorId,
          vencedorEhLeste: contextoCenterpiece?.vencedorEhLeste,
          honbaUsado: contextoCenterpiece?.honba,
        })
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
        contextoCenterpiece={contextoCenterpiece}
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
