import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { codigoBase } from '../../constantes'
import ModalResultado from '../../modais/resultado/ModalResultado'

interface PropsResultadoMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  modoFluxo?: 'montagem' | 'finalizacao'
}

/** Resultado da mao montada, incluindo esperas, botao Calcular e modal final. */
export default function ResultadoMaoCalculada({
  estado,
  modoFluxo = 'montagem',
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
        <ModalResultado
          mao={mao}
          resultado={resultado}
          chomboFuriten={chomboFuriten}
          maoInvalida={resultadoMaoInvalida}
          chomboMangan={estado.configuracao.chomboMangan}
          descricaoAcessivel={descreverResultado()}
          aoFechar={fecharModalResultado}
          aoNovaMao={() => {
            fecharModalResultado()
            estado.limpar()
          }}
        />
      )}
    </>
  )
}
