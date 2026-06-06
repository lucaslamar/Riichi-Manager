import {
  CardResultadoHanFu,
  ControleFu,
  ControleHan,
  ControleHonba,
  SeletorDealer,
  SeletorTipoVitoria,
  TabelaReferenciaRapida,
} from '../componentes/ControlesHanFu'
import { useCalculadoraHanFu, type AgariHanFu } from '../hooks/useCalculadoraHanFu'
import type { ResultadoCalculoParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'
import { converterHanFuParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'
import '../estilos/han-fu.css'

interface PropsPaginaCalculadoraHanFu {
  aoUsarResultado?: (resultado: ResultadoCalculoParaCenterpiece) => void
  initialIsOya?: boolean
  initialAgari?: AgariHanFu
  initialHonba?: number
}

/** Renderiza a calculadora direta por Han/Fu, sem montar a mao pedra por pedra. */
export default function PaginaCalculadoraHanFu({
  aoUsarResultado,
  initialIsOya,
  initialAgari,
  initialHonba,
}: PropsPaginaCalculadoraHanFu = {}) {
  const {
    agari,
    setAgari,
    fu,
    setFu,
    fuDisponiveis,
    han,
    setHan,
    honba,
    setHonba,
    isOya,
    setIsOya,
    referenciaRapida,
    resultado,
  } = useCalculadoraHanFu({ initialIsOya, initialAgari, initialHonba })

  const podeUsar =
    !!aoUsarResultado &&
    resultado != null &&
    (agari === 'ron' ? resultado.ron != null : resultado.tsumo != null)

  const handleUsarResultado = () => {
    if (!aoUsarResultado || !resultado) return
    aoUsarResultado(converterHanFuParaCenterpiece(resultado))
  }

  return (
    <main className="calculadora-han-fu">
      <section className="painel-principal-han-fu">
        <div className="seletores-topo-han-fu">
          <SeletorDealer isOya={isOya} aoMudar={setIsOya} />
          <SeletorTipoVitoria agari={agari} aoMudar={setAgari} />
        </div>

        <CardResultadoHanFu resultado={resultado} />

        <div className="controles-principais-han-fu" aria-label="Controles de han e fu">
          <ControleHan han={han} aoMudarHan={setHan} />
          <ControleFu han={han} fu={fu} fuDisponiveis={fuDisponiveis} aoMudarFu={setFu} />
        </div>

        <div className="controle-honba-linha-han-fu">
          <ControleHonba honba={honba} aoMudarHonba={setHonba} />
        </div>

        {aoUsarResultado && (
          <button
            type="button"
            className="btn-primario cp-btn-usar-resultado"
            onClick={handleUsarResultado}
            disabled={!podeUsar}
          >
            <i className="fas fa-check" aria-hidden="true" />
            Usar resultado no Centerpiece
          </button>
        )}
      </section>

      <TabelaReferenciaRapida referencia={referenciaRapida} />
    </main>
  )
}
