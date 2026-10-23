import { useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import ModalTutorialHanFu from './ModalTutorialHanFu'

/**
 * Retângulo que abre o tutorial, com o chapéu de formatura no canto direito:
 * o cabeçalho da Tabela rápida e a caixa cinza do verbete Fu no Guia de bolso.
 */
export default function BotaoTutorialHanFu({
  className,
  children,
  aoVerTabela,
}: {
  className?: string
  /** Conteúdo do retângulo (título e subtítulo da Tabela rápida). */
  children: ReactNode
  /** Leva até a Tabela rápida; fora da calculadora fica sem (ex.: Guia de bolso). */
  aoVerTabela?: () => void
}) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const rotulo = t('hanFuTutorial.title')

  const fechar = () => {
    setAberto(false)
    // Como no "?" das seções: no toque o botão nem sempre recebe foco.
    setTimeout(() => botaoRef.current?.focus({ preventScroll: true }))
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className={['botao-tutorial-han-fu', className].filter(Boolean).join(' ')}
        title={rotulo}
        aria-haspopup="dialog"
        onClick={() => setAberto(true)}
      >
        {children}
        <span className="botao-tutorial-han-fu__icone">
          <i className="fas fa-graduation-cap" aria-hidden="true" />
          <span className="sr-only">{rotulo}</span>
        </span>
      </button>
      {aberto && (
        <ModalTutorialHanFu
          aoFechar={fechar}
          // Rola depois de a modal sair, com a rolagem da página já destravada.
          aoVerTabela={
            aoVerTabela &&
            (() => {
              fechar()
              setTimeout(aoVerTabela)
            })
          }
        />
      )}
    </>
  )
}
