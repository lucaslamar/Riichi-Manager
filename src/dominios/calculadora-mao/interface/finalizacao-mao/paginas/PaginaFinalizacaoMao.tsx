import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import ConstrutorMao from '../../montagem-mao/componentes/ConstrutorMao'
import OpcoesMao from '../componentes/OpcoesMao'
import ResultadoMaoCalculada from '../componentes/ResultadoMaoCalculada'
import { AvisoDadosPartida } from '../componentes/AvisoDadosPartida'
import { BarraResumoMao } from '../componentes/BarraResumoMao'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import type { ContextoCenterpieceMao } from '@/dominios/centerpiece/logica/tipos-integracao'

// Mesma faixa do layout de duas colunas do celular deitado em responsivo.css.
const MEDIA_CELULAR_DEITADO =
  '(orientation: landscape) and (max-height: 700px) and (max-width: 1200px)'

export function PaginaFinalizacaoMao({
  estado,
  acoesCabecalho,
  aoUsarMao,
  contextoCenterpiece,
}: {
  estado: EstadoCalculadoraMao
  acoesCabecalho?: ReactNode
  aoUsarMao?: () => void
  contextoCenterpiece?: ContextoCenterpieceMao
}) {
  const maoRef = useRef<HTMLDivElement>(null)
  const [maoVisivelNaTela, setMaoVisivelNaTela] = useState(true)
  const celularDeitado = useMediaQuery(MEDIA_CELULAR_DEITADO)
  const [destinoFuriten, setDestinoFuriten] = useState<HTMLDivElement | null>(null)
  // O resultado troca de coluna quando o celular deita. Ele fica sempre na mesma
  // caixa (portal) e só a caixa muda de lugar: assim não é desmontado, e o
  // Resultado aberto e a foto do Compartilhar continuam ao girar a tela.
  const [caixaResultado] = useState(() => {
    const caixa = document.createElement('div')
    caixa.style.display = 'contents'
    return caixa
  })
  const lugarNaMao = useRef<HTMLDivElement>(null)
  const lugarNasOpcoes = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const lugar = celularDeitado ? lugarNaMao.current : lugarNasOpcoes.current
    lugar?.appendChild(caixaResultado)
  }, [celularDeitado, caixaResultado])

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

  const resultado = (
    <ResultadoMaoCalculada
      estado={estado}
      embutido
      modoFluxo="finalizacao"
      aoUsarMao={aoUsarMao}
      contextoCenterpiece={contextoCenterpiece}
    />
  )

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
              <div ref={lugarNaMao} style={{ display: 'contents' }} />
            </>
          )}
        </div>
        <div className="coluna-finalizacao-opcoes">
          {contextoCenterpiece && (
            <AvisoDadosPartida contexto={contextoCenterpiece} mao={estado.mao} />
          )}
          <OpcoesMao
            estado={estado}
            embutido
            destinoFuriten={celularDeitado ? destinoFuriten : null}
            contextoCenterpiece={contextoCenterpiece}
          />
          {!celularDeitado && <div ref={lugarNasOpcoes} style={{ display: 'contents' }} />}
        </div>
      </div>
      {createPortal(resultado, caixaResultado)}
    </div>
  )
}
