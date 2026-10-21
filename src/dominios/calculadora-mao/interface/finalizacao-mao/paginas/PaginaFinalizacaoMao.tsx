import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import ConstrutorMao from '../../montagem-mao/componentes/ConstrutorMao'
import OpcoesMao from '../componentes/OpcoesMao'
import ResultadoMaoCalculada from '../componentes/ResultadoMaoCalculada'
import { BarraResumoMao } from '../componentes/BarraResumoMao'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

// Mesma faixa do layout de duas colunas do celular deitado em responsivo.css.
const MEDIA_CELULAR_DEITADO = '(orientation: landscape) and (max-height: 700px) and (max-width: 1200px)'

export function PaginaFinalizacaoMao({
  estado,
  acoesCabecalho,
}: {
  estado: EstadoCalculadoraMao
  acoesCabecalho?: ReactNode
}) {
  const maoRef = useRef<HTMLDivElement>(null)
  const [maoVisivelNaTela, setMaoVisivelNaTela] = useState(true)
  const celularDeitado = useMediaQuery(MEDIA_CELULAR_DEITADO)
  const [destinoFuriten, setDestinoFuriten] = useState<HTMLDivElement | null>(null)

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

  const resultado = <ResultadoMaoCalculada estado={estado} embutido modoFluxo="finalizacao" />

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
          {/* Celular deitado: abaixo das pedras vêm o Furiten (ver OpcoesMao) e
              o Calcular, em vez de no topo e no rodapé da coluna de opções. */}
          {celularDeitado && (
            <>
              <div ref={setDestinoFuriten} className="secoes-junto-da-mao" />
              {resultado}
            </>
          )}
        </div>
        <div className="coluna-finalizacao-opcoes">
          <OpcoesMao
            estado={estado}
            embutido
            destinoFuriten={celularDeitado ? destinoFuriten : null}
          />
          {!celularDeitado && resultado}
        </div>
      </div>
    </div>
  )
}
