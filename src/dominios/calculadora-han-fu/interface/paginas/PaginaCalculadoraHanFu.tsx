import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
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
import {
  converterHanFuParaCenterpiece,
  type ResultadoCalculoParaCenterpiece,
} from '@/dominios/centerpiece/logica/tipos-integracao'
import '../estilos/han-fu.css'

interface PropsPaginaCalculadoraHanFu {
  /** Aberta pelo modal de batida do Centerpiece: oya e vitória vêm da mesa. */
  aoUsarResultado?: (resultado: ResultadoCalculoParaCenterpiece) => void
  initialIsOya?: boolean
  initialAgari?: AgariHanFu
  initialHonba?: number
  /** Regra da mesa, quando aberta pela partida. */
  basengo?: boolean
  vencedorId?: string
  pagadorId?: string
}

/** Renderiza a calculadora direta por Han/Fu, sem montar a mao pedra por pedra. */
export default function PaginaCalculadoraHanFu({
  aoUsarResultado,
  initialIsOya,
  initialAgari,
  initialHonba,
  basengo,
  vencedorId,
  pagadorId,
}: PropsPaginaCalculadoraHanFu = {}) {
  const { t } = useI18n()
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
  } = useCalculadoraHanFu({ initialIsOya, initialAgari, initialHonba, basengo })

  const podeUsar =
    !!aoUsarResultado &&
    resultado != null &&
    (agari === 'ron' ? resultado.ron != null : resultado.tsumo != null)

  const usarResultado = () => {
    if (!aoUsarResultado || !resultado) return
    aoUsarResultado(
      converterHanFuParaCenterpiece(resultado, {
        vencedorId,
        pagadorId,
        vencedorEhLeste: isOya,
      }),
    )
  }

  return (
    <main className="calculadora-han-fu">
      {/* Engrenagem no cabeçalho do app (aberta pelo Centerpiece, a tela é da mesa). */}
      {!aoUsarResultado && <TituloTela acoes={<BotaoConfiguracoes />} />}
      <section className="painel-principal-han-fu">
        {!aoUsarResultado && (
          <div className="seletores-topo-han-fu">
            <SeletorDealer isOya={isOya} aoMudar={setIsOya} />
            <SeletorTipoVitoria agari={agari} aoMudar={setAgari} />
          </div>
        )}

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
            onClick={usarResultado}
            disabled={!podeUsar}
          >
            <i className="fas fa-check" aria-hidden="true" />
            {t('centerpiece.win.useResult')}
          </button>
        )}
      </section>

      <TabelaReferenciaRapida referencia={referenciaRapida} />
    </main>
  )
}
