import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ChipMeldMao } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/ChipMeldMao'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { ESTILO_MELD } from '@/dominios/calculadora-mao/interface/constantes'
import BotaoYakus from '@/dominios/calculadora-mao/interface/modais/yakus/BotaoYakus'
import {
  pedrasContadas,
  pedrasDaChamada,
  type Chamada,
  type Flor,
  type MaoChinesa,
} from '../logica/montagem'
import { PedraChinesa, PedraFlor } from './PedraChinesa'
import { nomePedra } from './pedras'

/** Pedras do conjunto como na mesa: a chamada de lado e, no kan fechado, as pontas viradas. */
export function PedrasChamada({ chamada }: { chamada: Chamada }) {
  const pedras = pedrasDaChamada(chamada)
  return (
    <span className="meld-pedras">
      {pedras.map((id, indice) => {
        const virada = chamada.tipo === 'kanFechado' && (indice === 0 || indice === 3)
        const deLado = chamada.tipo !== 'kanFechado' && indice === 0
        return (
          <span key={indice} className={`meld-tile${deLado ? ' de-lado' : ''}`}>
            {/* O verso é o mesmo das pedras do Riichi. */}
            {virada ? <PedraSvg virada /> : <PedraChinesa id={id} />}
          </span>
        )
      })}
    </span>
  )
}

/**
 * A mão montada, com o mesmo visual da Calculadora de Mão japonesa: pedras soltas,
 * conjuntos e, no MCR, as flores. Na montagem um toque remove; na finalização,
 * tocar numa pedra a escolhe como a da batida.
 */
export default function MaoChinesaAtual({
  mao,
  contexto,
  acoesCabecalho,
  aoTocarPedra,
  selecionandoBatida = false,
  aoRemoverChamada,
  aoRemoverFlor,
  aoLimpar,
}: {
  mao: MaoChinesa
  contexto: 'montagem' | 'finalizacao'
  acoesCabecalho?: ReactNode
  aoTocarPedra: (indice: number) => void
  /** Montagem com "Mudar batida" ligado: o toque escolhe a batida, não remove. */
  selecionandoBatida?: boolean
  aoRemoverChamada: (indice: number) => void
  aoRemoverFlor: (flor: Flor) => void
  aoLimpar: () => void
}) {
  const { t } = useI18n()
  const total = Math.min(pedrasContadas(mao), 14)
  const ultima = mao.pedras.length - 1
  const montagem = contexto === 'montagem'
  const titulo = montagem
    ? t('calculator.buildTitle', { total })
    : `${t('calculator.completeHand')} ${total}/14`

  return (
    <div className="mao-editor-fixo">
      <div className="cabecalho-mao-editor">
        <div className="titulo-mao-linha">
          <h3 className="titulo-mao-editor">
            <i className="fas fa-layer-group" style={{ marginRight: 6 }} aria-hidden="true" />
            {titulo}
          </h3>
        </div>
        <div className="acoes-cabecalho-mao">
          {acoesCabecalho}
          {/* Guia de bolso: o mesmo do Riichi, com os fan do MCR. */}
          {montagem && <BotaoYakus classeBase="btn-configuracao-mao-cabecalho" />}
          {(pedrasContadas(mao) > 0 || mao.flores.length > 0) && (
            <button
              className="btn-limpar-mao-cabecalho"
              type="button"
              onClick={aoLimpar}
              aria-label={t('actions.clear')}
              title={t('actions.clear')}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className={`pedras-selecionadas${selecionandoBatida ? ' modo-agari-ativo' : ''}`}>
        <div className={`grade-pedras-mao${montagem ? '' : ' mao-principal-finalizacao'}`}>
          {mao.pedras.map((id, indice) => {
            const ehBatida = indice === ultima && (!montagem || pedrasContadas(mao) === 14)
            const tile = nomePedra(id)
            const rotulo =
              montagem && !selecionandoBatida
                ? ehBatida
                  ? t('calculator.removeWinningTile', { tile })
                  : t('calculator.removeTile', { tile })
                : t('calculator.selectWinningTile', { tile })
            return (
              <button
                key={indice}
                type="button"
                className={`chip-pedra pedra-mao${ehBatida ? ' agari' : ''}`}
                title={rotulo}
                aria-label={rotulo}
                onClick={() => aoTocarPedra(indice)}
              >
                <PedraChinesa id={id} />
                {ehBatida && (
                  <span className="badge-pedra-agari">{t('calculator.winningTile')}</span>
                )}
              </button>
            )
          })}
        </div>

        {mao.chamadas.map((chamada, indice) => {
          const tipo = chamada.tipo === 'chi' ? 'chii' : chamada.tipo
          return (
            <ChipMeldMao
              key={`chamada-${indice}`}
              tipo={tipo}
              titulo={t('calculator.removeMeld', { meld: t(ESTILO_MELD[tipo].rotulo) })}
              aoClicar={() => montagem && aoRemoverChamada(indice)}
            >
              <PedrasChamada chamada={chamada} />
            </ChipMeldMao>
          )
        })}

        {mao.flores.length > 0 && (
          <div
            className="grade-pedras-mao mcr-flores-mao"
            role="group"
            aria-label={t('mcr.entrada.flores')}
          >
            {mao.flores.map((flor) => (
              <button
                key={flor}
                type="button"
                className="chip-pedra pedra-mao mcr-flor-mao"
                aria-label={t('mcr.entrada.removerFlor', { flor: t(`mcr.flores.${flor}`) })}
                title={t(`mcr.flores.${flor}`)}
                onClick={() => aoRemoverFlor(flor)}
              >
                <PedraFlor flor={flor} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
