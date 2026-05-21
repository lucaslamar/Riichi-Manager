import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import ConstrutorMao from './ConstrutorMao'
import OpcoesMao from './OpcoesMao'
import OrientacaoYaku from './OrientacaoYaku'
import ResultadoMaoCalculada from './ResultadoMaoCalculada'

interface PropsModoCompleto {
  estado: EstadoCalculadoraMao
}

/** Junta os blocos do modo completo sem concentrar toda a tela em um único arquivo. */
export default function ModoCompletoCalculadora({ estado }: PropsModoCompleto) {
  return (
    <>
      <div className="card card-mao-completa">
        <ConstrutorMao estado={estado} embutido />
        <OpcoesMao estado={estado} embutido />
      </div>
      <ResultadoMaoCalculada estado={estado} />
      {estado.caminhosAtivos && <OrientacaoYaku estado={estado} />}
    </>
  )
}
