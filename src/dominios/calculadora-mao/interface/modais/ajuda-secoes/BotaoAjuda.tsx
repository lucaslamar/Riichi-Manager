import { useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import ModalAjudaSecao from './ModalAjudaSecao'
import { TOPICOS_AJUDA, type TopicoAjuda } from './topicosAjuda'

/**
 * Botão "?" discreto ao lado do título de uma seção da finalização. Só abre a
 * explicação; não toca no estado da mão.
 */
export default function BotaoAjuda({
  topico,
  className,
}: {
  topico: TopicoAjuda
  className?: string
}) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)

  const fechar = () => {
    setAberto(false)
    // Ao tocar fora, o próprio toque tira o foco depois que a modal fecha; e no
    // toque o botão nem sempre recebe foco. Garante a volta do foco a ele.
    setTimeout(() => botaoRef.current?.focus())
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className={['botao-ajuda-secao', className].filter(Boolean).join(' ')}
        aria-label={t('sectionHelp.buttonLabel', { section: t(TOPICOS_AJUDA[topico].titulo) })}
        aria-haspopup="dialog"
        onClick={() => setAberto(true)}
      >
        <span className="botao-ajuda-secao-circulo" aria-hidden="true">
          ?
        </span>
      </button>
      {aberto && <ModalAjudaSecao topico={topico} aoFechar={fechar} />}
    </>
  )
}
