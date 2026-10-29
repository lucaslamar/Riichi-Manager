import { useEffect, useId, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BotaoAjuda from '../../modais/ajuda-secoes/BotaoAjuda'
import './campo-notacao-mao.css'

interface PropsCampoNotacaoMao {
  valor: string
  aoMudar: (texto: string) => void
  aoConfirmar?: () => void
  /** Volta para o teclado de pedras (o mesmo que deslizar para a esquerda). */
  aoVoltar: () => void
  /** Texto abaixo do campo: contagem de pedras ou o erro já traduzido. */
  mensagem: string
  erro?: boolean
}

/**
 * Campo para digitar a mão em notação (`2388m447p2458889s`) com o teclado
 * padrão do aparelho, sem teclado nem botões próprios. Aceita maiúsculas e
 * espaços; quem interpreta o texto é o `ConstrutorMao`. No topo, o botão de
 * voltar às pedras e o "?" com a explicação da notação.
 */
export function CampoNotacaoMao({
  valor,
  aoMudar,
  aoConfirmar,
  aoVoltar,
  mensagem,
  erro = false,
}: PropsCampoNotacaoMao) {
  const { t } = useI18n()
  const idMensagem = useId()
  const campoRef = useRef<HTMLInputElement>(null)

  // Aberto pelo botão Notação: já entra com o foco, e o teclado do celular sobe.
  useEffect(() => {
    campoRef.current?.focus()
  }, [])

  return (
    <div className="campo-notacao-mao">
      <div className="cabecalho-campo-notacao-mao">
        <button className="botao-voltar-pedras-notacao" type="button" onClick={aoVoltar}>
          <i className="fas fa-chevron-left" aria-hidden="true" />
          <span>{t('notation.backToTiles')}</span>
        </button>
        <span className="titulo-campo-notacao-mao">{t('notation.toggle')}</span>
        <BotaoAjuda topico="notacao" />
      </div>
      <input
        ref={campoRef}
        className={`entrada-campo-notacao-mao ${erro ? 'com-erro' : ''}`.trim()}
        type="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label={t('notation.fieldLabel')}
        aria-invalid={erro}
        aria-describedby={idMensagem}
        placeholder={t('notation.placeholder', { example: '2388m447p 123mc 111pc' })}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key !== 'Enter') return
          evento.currentTarget.blur()
          aoConfirmar?.()
        }}
      />
      <small
        id={idMensagem}
        className={`mensagem-campo-notacao-mao ${erro ? 'com-erro' : ''}`.trim()}
        aria-live="polite"
      >
        {mensagem}
      </small>
    </div>
  )
}
