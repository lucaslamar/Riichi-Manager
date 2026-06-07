import { useEffect, useRef, useState, type ReactNode } from 'react'
import ConstrutorMao from '../../montagem-mao/componentes/ConstrutorMao'
import OpcoesMao from '../componentes/OpcoesMao'
import ResultadoMaoCalculada from '../componentes/ResultadoMaoCalculada'
import { BarraResumoMao } from '../componentes/BarraResumoMao'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

export function PaginaFinalizacaoMao({
  estado,
  acoesCabecalho,
  aoUsarMao,
  contextoCenterpiece,
}: {
  estado: EstadoCalculadoraMao
  acoesCabecalho?: ReactNode
  aoUsarMao?: () => void
  contextoCenterpiece?: {
    tipoVitoria: 'ron' | 'tsumo'
    ventoRodada: string
    ventoAssento: string
    honba: number
    rodadaNumero?: number
    vencedorNome?: string
    vencedorEhLeste?: boolean
    jogadorRiichi?: boolean
  }
}) {
  const maoRef = useRef<HTMLDivElement>(null)
  const [maoVisivelNaTela, setMaoVisivelNaTela] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setMaoVisivelNaTela(entry.isIntersecting),
      { threshold: 0.1 },
    )
    if (maoRef.current) observer.observe(maoRef.current)
    return () => observer.disconnect()
  }, [])

  const mostrarResumo =
    !maoVisivelNaTela && estado.maoCompleta && estado.fluxoOpcoes.vitoriaDefinida

  return (
    <div className="pagina-finalizacao-mao">
      {mostrarResumo && (
        <div className="cabecalho-sticky-finalizacao">
          <BarraResumoMao mao={estado.mao} />
        </div>
      )}

      <div className="layout-finalizacao-calculadora">
        <div ref={maoRef} id="secao-mao" className="coluna-finalizacao-mao">
          <ConstrutorMao
            estado={estado}
            embutido
            contexto="finalizacao"
            acoesCabecalho={acoesCabecalho}
          />
        </div>
        <div className="coluna-finalizacao-opcoes">
          <OpcoesMao estado={estado} embutido contextoCenterpiece={contextoCenterpiece} />
          <ResultadoMaoCalculada estado={estado} embutido modoFluxo="finalizacao" aoUsarMao={aoUsarMao} contextoCenterpiece={contextoCenterpiece} />
        </div>
      </div>
    </div>
  )
}
