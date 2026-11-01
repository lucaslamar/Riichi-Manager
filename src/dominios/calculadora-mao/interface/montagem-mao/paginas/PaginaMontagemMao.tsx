import type { ReactNode } from 'react'
import ConstrutorMao from '../componentes/ConstrutorMao'
import ResultadoMaoCalculada from '../../finalizacao-mao/componentes/ResultadoMaoCalculada'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

export function PaginaMontagemMao({
  estado,
  mostrandoEsperas,
  aoAbrirRegras,
  aoCalcularDireto,
  entradaNotacao,
  aoMudarEntradaNotacao,
}: {
  estado: EstadoCalculadoraMao
  mostrandoEsperas: boolean
  aoAbrirRegras: () => void
  cabecalho?: ReactNode
  aoCalcularDireto?: () => void
  entradaNotacao?: boolean
  aoMudarEntradaNotacao?: (ativa: boolean) => void
}) {
  return (
    <div className={`layout-montagem-calculadora ${mostrandoEsperas ? 'com-esperas' : 'sem-esperas'}`}>
      <ConstrutorMao estado={estado} embutido contexto="montagem" aoAbrirRegras={aoAbrirRegras} aoCalcularDireto={aoCalcularDireto} entradaNotacao={entradaNotacao} aoMudarEntradaNotacao={aoMudarEntradaNotacao} />
      <ResultadoMaoCalculada estado={estado} embutido modoFluxo="montagem" />
    </div>
  )
}
