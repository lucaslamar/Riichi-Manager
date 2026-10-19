import {
  CardResultadoHanFu,
  ControleFu,
  ControleHan,
  ControleHonba,
  SeletorDealer,
  SeletorTipoVitoria,
  TabelaReferenciaRapida,
} from '../componentes/ControlesHanFu'
import { useCalculadoraHanFu } from '../hooks/useCalculadoraHanFu'
import '../estilos/han-fu.css'

/** Renderiza a calculadora direta por Han/Fu, sem montar a mao pedra por pedra. */
export default function PaginaCalculadoraHanFu() {
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
  } = useCalculadoraHanFu()

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
      </section>

      <TabelaReferenciaRapida referencia={referenciaRapida} />
    </main>
  )
}
