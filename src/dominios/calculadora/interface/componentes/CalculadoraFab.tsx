import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

export interface AcaoFab {
  chave: string
  rotulo: string
  icone: string
  aoClicar: () => void
  destaque?: boolean
}

interface PropsCalculadoraFab {
  acoes: AcaoFab[]
  variante?: 'padrao' | 'teclado'
}

/** Menu contextual pequeno da calculadora, separado da navegacao global do app. */
export default function CalculadoraFab({ acoes, variante = 'padrao' }: PropsCalculadoraFab) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState(false)

  if (acoes.length === 0) return null

  return (
    <div className={`fab-calculadora fab-calculadora-${variante} ${aberto ? 'aberto' : ''}`}>
      {aberto && (
        <div className="fab-calculadora-acoes">
          {acoes.map((acao) => (
            <button
              key={acao.chave}
              className={acao.destaque ? 'acao-fab destaque' : 'acao-fab'}
              type="button"
              aria-label={acao.rotulo}
              onClick={() => {
                acao.aoClicar()
                setAberto(false)
              }}
            >
              <i className={`fas ${acao.icone}`} aria-hidden="true" />
              <span>{acao.rotulo}</span>
            </button>
          ))}
        </div>
      )}
      <button
        className="botao-fab-calculadora"
        type="button"
        aria-expanded={aberto}
        aria-label={t('calculator.actionsMenu')}
        onClick={() => setAberto((atual) => !atual)}
      >
        <i className={`fas ${aberto ? 'fa-xmark' : 'fa-sliders-h'}`} aria-hidden="true" />
      </button>
    </div>
  )
}
