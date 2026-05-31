import type { ReactNode } from 'react'
import ConstrutorMao from '../../montagem-mao/componentes/ConstrutorMao'
import OpcoesMao from '../componentes/OpcoesMao'
import ResultadoMaoCalculada from '../componentes/ResultadoMaoCalculada'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

export function PaginaFinalizacaoMao({
  estado,
  acoesCabecalho,
}: {
  estado: EstadoCalculadoraMao
  acoesCabecalho?: ReactNode
}) {
  return (
    <div className="layout-finalizacao-calculadora">
      <div className="coluna-finalizacao-mao">
        <ConstrutorMao
          estado={estado}
          embutido
          contexto="finalizacao"
          acoesCabecalho={acoesCabecalho}
        />
      </div>
      <div className="coluna-finalizacao-opcoes">
        <OpcoesMao estado={estado} embutido />
        <ResultadoMaoCalculada estado={estado} embutido modoFluxo="finalizacao" />
      </div>
    </div>
  )
}
