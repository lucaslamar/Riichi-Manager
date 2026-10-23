import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { VentoMao } from '../../../calculadora-mao/logica/mao'
import {
  PedraVento,
  chaveNomeVento,
} from '../../../calculadora-mao/interface/compartilhado/componentes/PedraVento'

interface PropsResultadoVentos {
  /** Ventos já revelados; o índice é o jogador (0 = J1). */
  ventosRevelados: VentoMao[]
  /** Sorteio terminado: os balõezinhos crescem para mostrar o nome do vento. */
  completo: boolean
}

function movimentoReduzido(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function BalaoResultado({
  jogador,
  vento,
  completo,
}: {
  jogador: number
  vento: VentoMao
  completo: boolean
}) {
  const { t } = useI18n()
  const itemRef = useRef<HTMLLIElement>(null)
  const nomeVento = t(chaveNomeVento(vento))

  // Ao aparecer, o balãozinho sai voando da boca do gato até o seu lugar.
  useLayoutEffect(() => {
    const item = itemRef.current
    const boca = document.querySelector('.gato-helice__boca')
    if (!item || !boca || movimentoReduzido() || !item.animate) return

    const destino = item.getBoundingClientRect()
    const origem = boca.getBoundingClientRect()
    const dx = origem.left - (destino.left + destino.width / 2)
    const dy = origem.top - (destino.top + destino.height / 2)

    item.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      { duration: 550, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.15)' },
    )
  }, [])

  return (
    <li
      ref={itemRef}
      className="sorteio-historico__quadrado"
      aria-label={t('windDraw.playerWind', { player: jogador, wind: nomeVento })}
    >
      <span className="sorteio-historico__jogador" aria-hidden="true">
        {t('windDraw.playerShort', { player: jogador })}
      </span>
      <span className="sorteio-historico__pedra" aria-hidden="true">
        <PedraVento vento={vento} mostrarNome={false} />
      </span>
      {completo && (
        <span className="sorteio-historico__nome" aria-hidden="true">
          {nomeVento}
        </span>
      )}
    </li>
  )
}

/**
 * Balõezinhos J1–J4 com a pedra de cada jogador. Só aparecem depois de
 * revelados (nada de espaço vazio) e, no fim, mostram também o nome do vento.
 */
export default function ResultadoVentos({ ventosRevelados, completo }: PropsResultadoVentos) {
  const { t } = useI18n()

  return (
    <ol
      className={`sorteio-historico${completo ? ' sorteio-historico--completo' : ''}`}
      aria-label={t('windDraw.historyLabel')}
    >
      {ventosRevelados.map((vento, indice) => (
        <BalaoResultado key={indice} jogador={indice + 1} vento={vento} completo={completo} />
      ))}
    </ol>
  )
}
