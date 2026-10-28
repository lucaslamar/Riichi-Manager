import { useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import ModalYakus from './ModalYakus'
import './botao-yakus.css'

/**
 * Botão com chapéu de formatura que abre a referência de yakus.
 * Recebe a classe do botão de configuração ao lado dele (`classeBase`), para
 * herdar exatamente o mesmo tamanho, área de toque e regra de visibilidade
 * em cada tela.
 */
export default function BotaoYakus({ classeBase }: { classeBase: string }) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)

  const fechar = () => {
    setAberto(false)
    // No toque o botão nem sempre recebe foco; garante a volta do foco a ele.
    setTimeout(() => botaoRef.current?.focus())
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className={`${classeBase} yaku-btn`}
        aria-label={t('calculator.pocketGuide')}
        title={t('calculator.pocketGuide')}
        aria-haspopup="dialog"
        onClick={() => setAberto(true)}
      >
        <i className="fas fa-graduation-cap" aria-hidden="true" />
      </button>
      {aberto && <ModalYakus aoFechar={fechar} />}
    </>
  )
}
