import { useId, useRef, type MouseEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Suit } from '../../../logica/parseHand'
import './mahjong-notation-input.css'

/* ---------- Componente ---------- */
const SUITS: { key: Suit; label: string; nome: string }[] = [
  { key: 'm', label: 'm 萬', nome: 'calculator.suitMan' },
  { key: 'p', label: 'p 筒', nome: 'calculator.suitPin' },
  { key: 's', label: 's 索', nome: 'calculator.suitSou' },
  { key: 'z', label: 'z 字', nome: 'calculator.honors' },
]

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
  /** Texto abaixo do campo: contagem de pedras ou o erro já traduzido. */
  mensagem: string
  erro?: boolean
}

/**
 * Campo de notação (`2388m447p2458889s`) com o teclado numérico nativo do
 * celular e uma barra de naipes. Os botões não tiram o foco do campo, então o
 * teclado continua aberto enquanto a mão é digitada.
 */
export default function MahjongNotationInput({
  value,
  onChange,
  onSubmit,
  mensagem,
  erro = false,
}: Props) {
  const { t } = useI18n()
  const ref = useRef<HTMLInputElement>(null)
  const idMensagem = useId()

  // Insere texto na posição do cursor sem fechar o teclado
  const insert = (text: string) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + text + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const backspace = () => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const from = start === end ? Math.max(0, start - 1) : start
    onChange(value.slice(0, from) + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(from, from)
    })
  }

  // Impede que o toque no botão tire o foco do input (teclado continua aberto)
  const keepFocus = (evento: MouseEvent) => evento.preventDefault()

  return (
    <div className="entrada-notacao">
      <input
        ref={ref}
        className={`campo-notacao ${erro ? 'com-erro' : ''}`.trim()}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={t('notation.fieldLabel')}
        aria-invalid={erro}
        aria-describedby={idMensagem}
        placeholder={t('notation.placeholder', { example: '2388m447p2458889s' })}
        value={value}
        onChange={(evento) =>
          onChange(evento.target.value.toLowerCase().replace(/[^0-9mpsz]/g, ''))
        }
        onKeyDown={(evento) => evento.key === 'Enter' && onSubmit?.()}
      />

      <div className="barra-naipes-notacao" role="group" aria-label={t('notation.suitBar')}>
        {SUITS.map((naipe) => (
          <button
            key={naipe.key}
            className="botao-naipe-notacao"
            type="button"
            aria-label={t('notation.insertSuit', { suit: t(naipe.nome), key: naipe.key })}
            onMouseDown={keepFocus}
            onClick={() => insert(naipe.key)}
          >
            {naipe.label}
          </button>
        ))}
        <button
          className="botao-naipe-notacao botao-apagar-notacao"
          type="button"
          onMouseDown={keepFocus}
          onClick={backspace}
          aria-label={t('notation.backspace')}
        >
          ⌫
        </button>
      </div>

      <small
        id={idMensagem}
        className={`mensagem-notacao ${erro ? 'com-erro' : ''}`.trim()}
        role={erro ? 'alert' : undefined}
      >
        {mensagem}
      </small>
    </div>
  )
}
