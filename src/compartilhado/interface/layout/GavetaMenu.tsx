import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

const SELETOR_FOCAVEIS = 'button:not([disabled]), a[href], select:not([disabled]), input:not([disabled])'

/**
 * Menu lateral do celular deitado, onde a barra inferior tomaria boa parte da altura.
 * Prende o foco, fecha com Esc e ao tocar fora, e devolve o foco a quem abriu.
 */
export default function GavetaMenu({ aoFechar, children }: { aoFechar: () => void; children: ReactNode }) {
  const { t } = useI18n()
  const gaveta = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const elemento = gaveta.current
    elemento?.querySelector<HTMLElement>(SELETOR_FOCAVEIS)?.focus()

    const aoPressionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        aoFechar()
        return
      }
      if (evento.key !== 'Tab' || !elemento) return
      const focaveis = [...elemento.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS)]
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', aoPressionar)
    return () => {
      document.removeEventListener('keydown', aoPressionar)
      focoAnterior?.focus()
    }
  }, [aoFechar])

  return createPortal(
    <div
      className="gaveta-menu-fundo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        ref={gaveta}
        className="gaveta-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('global.navigation')}
      >
        <div className="gaveta-menu-cabecalho">
          <strong>{t('global.appName')}</strong>
          <button
            type="button"
            className="gaveta-menu-fechar"
            aria-label={t('global.closeMenu')}
            onClick={aoFechar}
          >
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
