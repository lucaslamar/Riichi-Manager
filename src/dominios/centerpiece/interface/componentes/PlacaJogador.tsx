import { useRef, type PointerEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CHAVE_VENTO, KANJI_VENTO, type Vento } from '../../logica/partida'
import AnelTimer from './AnelTimer'

const TEMPO_SEGURAR_MS = 500
/** Andar mais que isso é deslize, não tocar e segurar. */
const MOVIMENTO_SEGURAR = 10

interface PropsPlacaJogador {
  nome: string
  vento: Vento
  pontos: number
  emRiichi: boolean
  /** Checagem de furiten ativa: só um ícone, para não entregar a espera à mesa. */
  checagem?: { rotulo: string; aoTocar: () => void }
  /** Presente só na placa da vez, com o timer ligado. */
  timer?: { segundos: number; fracao: number; esgotado: boolean }
  /** A vez é dele; com o timer desligado, é o único sinal na placa. */
  daVez?: boolean
  aoAbrirMenu: () => void
  aoSegurar: () => void
}

/**
 * Placa de LED do jogador: tocar em qualquer ponto abre as ações dele, e tocar e
 * segurar mostra a diferença de pontos. Descartar fica no botão da mesa.
 */
export default function PlacaJogador({
  nome,
  vento,
  pontos,
  emRiichi,
  checagem,
  timer,
  daVez = false,
  aoAbrirMenu,
  aoSegurar,
}: PropsPlacaJogador) {
  const { t, numero } = useI18n()
  const temporizador = useRef<number | undefined>(undefined)
  const segurou = useRef(false)
  const inicioToque = useRef({ x: 0, y: 0 })

  const iniciarSegurar = (evento: PointerEvent<HTMLButtonElement>) => {
    segurou.current = false
    inicioToque.current = { x: evento.clientX, y: evento.clientY }
    temporizador.current = window.setTimeout(() => {
      segurou.current = true
      aoSegurar()
    }, TEMPO_SEGURAR_MS)
  }
  const cancelarSegurar = () => window.clearTimeout(temporizador.current)
  const aoMover = (evento: PointerEvent<HTMLButtonElement>) => {
    const { x, y } = inicioToque.current
    if (Math.hypot(evento.clientX - x, evento.clientY - y) > MOVIMENTO_SEGURAR) cancelarSegurar()
  }

  const classes = [
    'mesa-placa',
    timer || daVez ? 'mesa-placa--vez' : '',
    timer?.esgotado ? 'mesa-placa--esgotado' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes}>
      <button
        type="button"
        className="mesa-placa-menu"
        aria-label={t('match.card.label', {
          name: nome,
          wind: t(CHAVE_VENTO[vento]),
          points: numero(pontos),
        })}
        onPointerDown={iniciarSegurar}
        onPointerMove={aoMover}
        onPointerUp={cancelarSegurar}
        onPointerLeave={cancelarSegurar}
        onPointerCancel={cancelarSegurar}
        onContextMenu={(evento) => evento.preventDefault()}
        onClick={() => {
          if (segurou.current) segurou.current = false
          else aoAbrirMenu()
        }}
      >
        <span className="mesa-placa-topo">
          <span className={`mesa-placa-kanji mesa-led-vento--${vento}`} aria-hidden="true">
            {KANJI_VENTO[vento]}
          </span>
          <span className="mesa-placa-nome">{nome}</span>
          {vento === 'leste' && (
            <span className="mesa-placa-dealer" title={t('match.card.dealer')} aria-hidden="true">
              親
            </span>
          )}
          {emRiichi && <span className="sr-only">{t('calculator.riichi')}</span>}
        </span>
        <span className="mesa-placa-pontos">{numero(pontos)}</span>
      </button>

      {checagem && (
        <button
          type="button"
          className={`mesa-placa-checagem${timer ? ' mesa-placa-checagem--com-timer' : ''}`}
          aria-label={checagem.rotulo}
          onClick={checagem.aoTocar}
        >
          <i className="fas fa-eye-slash" aria-hidden="true" />
        </button>
      )}

      {timer && <AnelTimer segundos={timer.segundos} fracao={timer.fracao} aoTocar={aoAbrirMenu} />}
    </article>
  )
}
