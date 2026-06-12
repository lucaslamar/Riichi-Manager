import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { ESTILO_MELD, codigoBase } from '../../constantes'
import ExibicaoCompleta from './ExibicaoCompleta'
import { PedraSvg, PedrasMeld } from '../../compartilhado/componentes/PedraSvg'

const NOME_VENTO_RESULTADO: Record<string, string> = {
  '1': 'Leste', '2': 'Sul', '3': 'Oeste', '4': 'Norte',
}

const KANJI_VENTO_RESULTADO: Record<string, string> = {
  '1': '東', '2': '南', '3': '西', '4': '北',
}

interface ContextoCenterpiece {
  tipoVitoria: 'ron' | 'tsumo'
  ventoRodada: string
  ventoAssento: string
  honba: number
  rodadaNumero?: number
  vencedorNome?: string
}

interface PropsResultadoMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  modoFluxo?: 'montagem' | 'finalizacao'
  aoUsarMao?: () => void
  contextoCenterpiece?: ContextoCenterpiece
}

/** Resultado da mao montada, incluindo esperas, botao Calcular e modal final. */
export default function ResultadoMaoCalculada({
  estado,
  modoFluxo = 'montagem',
  aoUsarMao,
  contextoCenterpiece,
}: PropsResultadoMao) {
  const { t } = useI18n()
  const {
    mao,
    maoCompleta,
    resultado,
    furitenRonCompleto,
    slotsUsados,
    esperasPossiveis,
    calculandoEsperas,
    deveCalcularMao,
    podeCalcularMao,
    calcularMaoAtual,
    resultadoComYakuValido,
    resultadoMaoInvalida,
  } = estado
  const mostrarEsperas = slotsUsados === 13
  const temEsperaComYaku = esperasPossiveis.some((espera) => !espera.semYaku)
  const temFuriten = esperasPossiveis.some((espera) => !espera.semYaku && espera.furiten)
  const agariEmFuriten =
    deveCalcularMao &&
    maoCompleta &&
    mao.agari === 'ron' &&
    (mao.indiceAgari >= 0 || !!mao.agariMeld) &&
    mao.descartes.some((descarte) =>
      codigoBase(descarte) === codigoBase(mao.agariMeld?.pedra ?? mao.pedras[mao.indiceAgari]),
    )
  const chomboFuriten = agariEmFuriten || !!furitenRonCompleto
  const totalResultado = resultado?.agari != null ? resultado.pontos.total : 0
  const resultadoValido = totalResultado > 0 && resultadoComYakuValido && !chomboFuriten
  const assinaturaResultado =
    resultadoValido || chomboFuriten || resultadoMaoInvalida
      ? JSON.stringify({
          pedras: mao.pedras,
          melds: mao.melds,
          agari: mao.agari,
          indiceAgari: mao.indiceAgari,
          agariMeld: mao.agariMeld,
          honba: mao.honba,
          doraManual: mao.doraManual,
          uradoraManual: mao.uradoraManual,
          dora: mao.dora,
          uradora: mao.uradora,
          ventoRodada: mao.ventoRodada,
          ventoAssento: mao.ventoAssento,
          total: totalResultado,
          chomboFuriten,
          resultadoMaoInvalida,
        })
      : null
  const [modalResultadoAberto, setModalResultadoAberto] = useState(false)
  const [ultimoModalAberto, setUltimoModalAberto] = useState<string | null>(null)
  const [modalResultadoSolicitado, setModalResultadoSolicitado] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!modalResultadoSolicitado || !deveCalcularMao || !assinaturaResultado) return
    if (assinaturaResultado === ultimoModalAberto && modalResultadoAberto) return
    setModalResultadoAberto(true)
    setUltimoModalAberto(assinaturaResultado)
    setModalResultadoSolicitado(false)
  }, [
    assinaturaResultado,
    deveCalcularMao,
    modalResultadoAberto,
    modalResultadoSolicitado,
    ultimoModalAberto,
  ])

  useEffect(() => {
    if (modalResultadoAberto) modalRef.current?.focus()
  }, [modalResultadoAberto])

  /**
   * Chamado pelo botao Calcular da etapa Finalizar Mao.
   * Registra a assinatura para o hook de resultado e solicita abertura da modal.
   */
  const acionarCalculo = () => {
    calcularMaoAtual()
    setModalResultadoSolicitado(true)
  }

  const fecharModalResultado = () => {
    setModalResultadoAberto(false)
  }

  const descreverResultado = () => {
    if (chomboFuriten) return t('calculator.invalidFuritenAnnounce')
    if (resultadoMaoInvalida || !resultado) return t('calculator.invalidNoYakuAnnounce')
    const yaku =
      resultado.yaku?.map(([nome]: [string, number, boolean]) => nome).join(', ') ||
      t('calculator.noYaku')
    return t('calculator.resultAnnounce', {
      agari: mao.agari === 'ron' ? t('calculator.ron') : t('calculator.tsumo'),
      han: resultado.han,
      fu: resultado.fu,
      points: totalResultado.toLocaleString('pt-BR'),
      yaku,
    })
  }

  const pedraAgari = mao.agariMeld ? null : mao.pedras[mao.indiceAgari]
  const pedrasFechadas = mao.agariMeld
    ? mao.pedras
    : mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari)

  const maoRenderizada = (
    <div className="mao-calculada resultado-composicao-mao">
      {mao.pedras.length > 0 && (
        <div className="resultado-grupo-mao resultado-grupo-fechado" aria-label={t('calculator.closedHand')}>
          {pedrasFechadas.map((pedra, indice) => (
            <span key={`${pedra}-${indice}`} className="chip-pedra resultado-pedra">
              <PedraSvg pedra={pedra} />
            </span>
          ))}
          {pedraAgari && (
            <span className="chip-pedra resultado-pedra agari">
              <PedraSvg pedra={pedraAgari} />
            </span>
          )}
        </div>
      )}
      {mao.melds.map((meld, indice) => (
        <span
          key={`${meld.tipo}-${indice}`}
          className={`resultado-meld resultado-meld-${meld.tipo}`}
          style={{ borderColor: ESTILO_MELD[meld.tipo].borda }}
          aria-label={ESTILO_MELD[meld.tipo].rotulo}
        >
          <PedrasMeld
            meld={meld}
            indiceAgari={mao.agariMeld?.indiceMeld === indice ? mao.agariMeld.indicePedra : undefined}
          />
        </span>
      ))}
    </div>
  )
  const chomboOya = mao.ventoAssento === '1'
  const avisoChombo = (
    <div className="resultado-chombo-furiten resultado-chombo-modal">
      <strong>{t('calculator.furitenChomboTitle')}</strong>
      <div className="pontos-chombo">{chomboOya ? '-12.000' : '-8.000'}</div>
      <span>
        {chomboOya
          ? t('calculator.furitenChomboTextDealer')
          : t('calculator.furitenChomboTextNonDealer')}
      </span>
    </div>
  )
  const avisoSemYaku = (
    <div className="resultado-chombo-furiten resultado-chombo-modal">
      <strong>{t('calculator.noYakuTitle')}</strong>
      <div className="pontos-chombo">{chomboOya ? '-12.000' : '-8.000'}</div>
      <span>{t('calculator.invalidNoYakuAnnounce')}</span>
      <span>{chomboOya ? t('calculator.noYakuPenaltyDealer') : t('calculator.noYakuPenaltyNonDealer')}</span>
    </div>
  )
  const textoBotao =
    !maoCompleta
      ? t('calculator.notEnoughTiles')
      : deveCalcularMao
        ? resultadoMaoInvalida
          ? t('calculator.invalidNoYakuReview')
          : t('calculator.calculatedForCurrentOptions')
        : podeCalcularMao
          ? t('calculator.readyToCalculate')
          : t('calculator.missingPrefix', {
            items: [
              !estado.fluxoOpcoes.vitoriaDefinida ? t('calculator.missingVictory') : null,
              !estado.fluxoOpcoes.ventoRodadaDefinido ? t('calculator.missingRoundWind') : null,
              !estado.fluxoOpcoes.ventoAssentoDefinido ? t('calculator.missingSeatWind') : null,
            ]
              .filter(Boolean)
              .join(', '),
          })
  const resumoEsperasAcessivel = calculandoEsperas
    ? t('calculator.waitsCalculating')
    : esperasPossiveis.length > 0
      ? t('calculator.waitsAccessibleSummary', {
          count: esperasPossiveis.length,
          status: temFuriten
            ? t('calculator.furiten')
            : temEsperaComYaku
              ? t('calculator.tenpai')
              : t('calculator.noYaku'),
        })
      : t('calculator.waitsNone')

  return (
    <>
      {modoFluxo === 'finalizacao' && (
        <div
          id="secao-calcular"
          className="acao-calcular-mao acao-calcular-mao-ativa rodape-finalizacao-mao"
        >
          <button
            className="btn-calcular-mao botao-calcular-finalizacao"
            type="button"
            disabled={!podeCalcularMao}
            onClick={acionarCalculo}
          >
            {t('actions.calculate')}
          </button>
          <span
            className={`status-finalizacao-mao ${
              podeCalcularMao ? 'texto-calcular-pronto' : 'texto-calcular-incompleto'
            }`}
            role="status"
          >
            {textoBotao}
          </span>
        </div>
      )}

      {modoFluxo === 'montagem' && mostrarEsperas && (
        <div className="sr-only" aria-live="polite">
          {resumoEsperasAcessivel}
        </div>
      )}

      {(resultadoValido || chomboFuriten || resultadoMaoInvalida) && modalResultadoAberto && (
        <div
          className={`modal-resultado-mobile-fundo ${
            chomboFuriten || resultadoMaoInvalida ? 'modal-chombo-furiten-fundo' : ''
          }`}
          role="presentation"
          onClick={fecharModalResultado}
        >
          <div
            ref={modalRef}
            className={`modal-resultado-mobile ${
              chomboFuriten || resultadoMaoInvalida ? 'modal-chombo-furiten' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-resultado-mobile"
            tabIndex={-1}
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="modal-resultado-mobile-cabecalho">
              <strong id="titulo-resultado-mobile">
                {resultadoMaoInvalida
                  ? t('calculator.noYakuTitle')
                  : chomboFuriten
                    ? t('calculator.alert')
                    : t('calculator.result')}
              </strong>
              <button
                className="btn-fechar-resultado-mobile"
                type="button"
                aria-label={t('actions.close')}
                onClick={fecharModalResultado}
              >
                x
              </button>
            </div>
            <div className="sr-only" aria-live="polite">
              {descreverResultado()}
            </div>
            {maoRenderizada}
            {resultadoMaoInvalida ? (
              avisoSemYaku
            ) : chomboFuriten ? (
              avisoChombo
            ) : (
              <>
                <ExibicaoCompleta resultado={resultado} mao={mao} contextoCenterpiece={contextoCenterpiece} />
                {resultadoValido && aoUsarMao && (
                  <button
                    type="button"
                    className="btn-primario cp-btn-usar-resultado"
                    onClick={aoUsarMao}
                  >
                    <i className="fas fa-check" aria-hidden="true" />
                    Usar resultado no Centerpiece
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
