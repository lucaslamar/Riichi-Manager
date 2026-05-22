import type { ReactNode } from 'react'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import ConstrutorMao from './ConstrutorMao'
import OpcoesMao from './OpcoesMao'
import ResultadoMaoCalculada from './ResultadoMaoCalculada'

interface PropsModoCompleto {
  estado: EstadoCalculadoraMao
  cabecalho: ReactNode
}

/** Junta os blocos do modo completo sem concentrar toda a tela em um único arquivo. */
export default function ModoCompletoCalculadora({ estado, cabecalho }: PropsModoCompleto) {
  return (
    <>
      <div className="card card-mao-completa">
        {cabecalho}
        <ConstrutorMao estado={estado} embutido />
        <OpcoesMao estado={estado} embutido />
      </div>
      <ResultadoMaoCalculada estado={estado} />
    </>
  )
}
