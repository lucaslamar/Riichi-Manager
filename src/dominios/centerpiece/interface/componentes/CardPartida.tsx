import { useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CHAVE_VENTO, KANJI_VENTO, type Vento } from '../../logica/partida'

const TEMPO_SEGURAR_MS = 500
/** Circunferência do anel do timer (raio 22 no viewBox de 48). */
const CIRCUNFERENCIA = 2 * Math.PI * 22

interface PropsCardPartida {
  nome: string
  vento: Vento
  pontos: number
  emRiichi: boolean
  /** Presente só no card da vez, com o timer ligado. */
  timer?: { segundos: number; fracao: number; esgotado: boolean; aoTocar: () => void }
  aoAbrirMenu: () => void
  aoSegurar: () => void
}

/**
 * Card do jogador. O toque no timer (passa a vez) é separado do toque no resto
 * (abre o menu); tocar e segurar mostra a diferença de pontos.
 */
export default function CardPartida({
  nome,
  vento,
  pontos,
  emRiichi,
  timer,
  aoAbrirMenu,
  aoSegurar,
}: PropsCardPartida) {
  const { t, numero } = useI18n()
  const temporizador = useRef<number | undefined>(undefined)
  const segurou = useRef(false)
  const nomeVento = t(CHAVE_VENTO[vento])

  const iniciarSegurar = () => {
    segurou.current = false
    temporizador.current = window.setTimeout(() => {
      segurou.current = true
      aoSegurar()
    }, TEMPO_SEGURAR_MS)
  }
  const cancelarSegurar = () => window.clearTimeout(temporizador.current)

  const classes = [
    'centerpiece-card-jogador',
    `vento-${vento}`,
    vento === 'leste' ? 'eh-dealer' : '',
    emRiichi ? 'em-riichi' : '',
    timer ? 'ptd-card--vez' : '',
    timer?.esgotado ? 'ptd-card--esgotado' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes}>
      <button
        type="button"
        className="ptd-card-menu"
        aria-label={t('match.card.label', {
          name: nome,
          wind: nomeVento,
          points: numero(pontos),
        })}
        onPointerDown={iniciarSegurar}
        onPointerUp={cancelarSegurar}
        onPointerLeave={cancelarSegurar}
        onPointerCancel={cancelarSegurar}
        onContextMenu={(evento) => evento.preventDefault()}
        onClick={() => {
          if (segurou.current) segurou.current = false
          else aoAbrirMenu()
        }}
      >
        <span className="ptd-card-topo">
          <span className="ptd-card-kanji" aria-hidden="true">
            {KANJI_VENTO[vento]}
          </span>
          <span className="card-jogador-nome">{nome}</span>
          {vento === 'leste' && (
            <span className="ptd-card-dealer" title={t('match.card.dealer')} aria-hidden="true">
              親
            </span>
          )}
        </span>
        <span className="card-jogador-pontos">{numero(pontos)}</span>
        {emRiichi && <span className="ptd-card-riichi">{t('calculator.riichi')}</span>}
      </button>

      {timer && (
        <button
          type="button"
          className="ptd-timer"
          aria-label={t('match.timer.passTurn', { seconds: timer.segundos })}
          onClick={timer.aoTocar}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <circle className="ptd-timer-fundo" cx="24" cy="24" r="22" />
            <circle
              className="ptd-timer-progresso"
              cx="24"
              cy="24"
              r="22"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA * (1 - timer.fracao)}
            />
          </svg>
          <span aria-hidden="true">{timer.segundos}</span>
        </button>
      )}
    </article>
  )
}
