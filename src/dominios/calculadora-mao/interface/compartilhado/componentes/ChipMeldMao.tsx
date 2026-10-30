import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Meld } from '../../../logica/mao'
import { ESTILO_MELD } from '../../constantes'

/**
 * Moldura de um meld na mão: rótulo e borda na cor da chamada, e um toque que
 * remove. Serve ao meld de verdade (com `PedrasMeld`) e ao meld ainda sem naipe
 * da notação (`pendente`, borda tracejada e pedras brancas).
 */
export function ChipMeldMao({
  tipo,
  titulo,
  pendente = false,
  aoClicar,
  children,
}: {
  tipo: Meld['tipo']
  /** Texto do title/aria-label (ex.: "Remover Pon"). */
  titulo: string
  pendente?: boolean
  aoClicar: () => void
  children: ReactNode
}) {
  const { t } = useI18n()
  const estilo = ESTILO_MELD[tipo]

  return (
    <button
      className={`chip-meld-mao chip-meld-mao-${tipo} ${pendente ? 'chip-meld-pendente' : ''}`.trim()}
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={aoClicar}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 5px',
        borderRadius: 7,
        border: `1.5px ${pendente ? 'dashed' : 'solid'} ${estilo.borda}`,
        background: 'transparent',
        boxShadow: 'none',
        fontWeight: 900,
        fontFamily: 'monospace',
        fontSize: '0.78rem',
        cursor: 'pointer',
      }}
    >
      <span
        className="rotulo-meld-chip"
        style={{
          fontWeight: 900,
          color: estilo.borda,
          marginRight: 1,
          letterSpacing: 0,
        }}
      >
        {t(estilo.rotulo)}
      </span>
      {children}
    </button>
  )
}
