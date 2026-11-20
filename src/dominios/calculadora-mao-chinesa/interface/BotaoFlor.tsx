import { useEffect, useRef, type KeyboardEvent } from 'react'
import { vibrar } from '@/compartilhado/adaptadores/vibracao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Flor } from '../logica/montagem'
import { PedraFlor } from './PedraChinesa'

/** Quanto segurar para escolher qual flor, como o 5 vermelho na calculadora japonesa. */
const DURACAO_TOQUE_LONGO_MS = 450

export type TipoFlor = 'flor' | 'estacao'
export const FLORES_DO_TIPO: Record<TipoFlor, Flor[]> = {
  flor: [1, 2, 3, 4],
  estacao: [5, 6, 7, 8],
}

/**
 * Uma pedra para as flores e outra para as estações. O toque põe a próxima que
 * ainda não está na mão, e o desenho passa para a seguinte. Segurar (ou Shift+Enter)
 * abre a escolha das quatro. No MCR todas valem 1 fan: só o desenho muda.
 */
export default function BotaoFlor({
  tipo,
  temFlor,
  aoTocarFlor,
  aoEscolher,
}: {
  tipo: TipoFlor
  temFlor: (flor: Flor) => boolean
  aoTocarFlor: (flor: Flor) => void
  aoEscolher: (tipo: TipoFlor) => void
}) {
  const { t } = useI18n()
  const flores = FLORES_DO_TIPO[tipo]
  const proxima = flores.find((flor) => !temFlor(flor))
  const toque = useRef<{ timer: number | null; disparou: boolean }>({
    timer: null,
    disparou: false,
  })
  const cancelar = () => {
    if (toque.current.timer !== null) window.clearTimeout(toque.current.timer)
    toque.current.timer = null
  }
  useEffect(() => cancelar, [])

  const nomeTipo = t(tipo === 'flor' ? 'mcr.entrada.flor' : 'mcr.entrada.estacao')
  const rotulo = proxima
    ? `${t('mcr.entrada.adicionarFlor', { flor: t(`mcr.flores.${proxima}`) })}. ${t('mcr.entrada.segurarFlor')}`
    : t('calculator.disabledTile', { tile: nomeTipo })

  return (
    <button
      type="button"
      className={`btn-pedra btn-pedra-flor${proxima ? '' : ' indisponivel'}`}
      title={nomeTipo}
      aria-label={rotulo}
      disabled={!proxima}
      onPointerDown={() => {
        cancelar()
        toque.current.disparou = false
        toque.current.timer = window.setTimeout(() => {
          toque.current.timer = null
          toque.current.disparou = true
          vibrar(30)
          aoEscolher(tipo)
        }, DURACAO_TOQUE_LONGO_MS)
      }}
      onPointerUp={cancelar}
      onPointerLeave={cancelar}
      onPointerCancel={cancelar}
      onContextMenu={(evento) => evento.preventDefault()}
      onKeyDown={(evento: KeyboardEvent) => {
        if (evento.key === 'Enter' && evento.shiftKey) {
          evento.preventDefault()
          aoEscolher(tipo)
        }
      }}
      onClick={() => {
        if (toque.current.disparou) {
          toque.current.disparou = false
          return
        }
        if (proxima) aoTocarFlor(proxima)
      }}
    >
      <PedraFlor flor={proxima ?? flores[3]} />
    </button>
  )
}
