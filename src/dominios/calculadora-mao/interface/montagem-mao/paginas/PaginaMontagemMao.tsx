import type { ReactNode } from 'react'
import ConstrutorMao from '../componentes/ConstrutorMao'
import ResultadoMaoCalculada from '../../finalizacao-mao/componentes/ResultadoMaoCalculada'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

export function PaginaMontagemMao({
  estado,
  mostrandoEsperas,
  aoAbrirRegras,
  aoCalcularDireto,
  aoVoltar,
}: {
  estado: EstadoCalculadoraMao
  mostrandoEsperas: boolean
  aoAbrirRegras: () => void
  cabecalho?: ReactNode
  aoCalcularDireto?: () => void
  aoVoltar?: () => void
}) {
  return (
    <div className={`layout-montagem-calculadora ${mostrandoEsperas ? 'com-esperas' : 'sem-esperas'}`}>
      <ConstrutorMao estado={estado} embutido contexto="montagem" aoAbrirRegras={aoAbrirRegras} aoCalcularDireto={aoCalcularDireto} aoVoltar={aoVoltar} />
      <ResultadoMaoCalculada estado={estado} embutido modoFluxo="montagem" />
    </div>
  )
}
