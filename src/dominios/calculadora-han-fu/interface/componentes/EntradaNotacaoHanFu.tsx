import { useId, useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { interpretarNotacao, normalizarNotacao } from '@/dominios/calculadora-mao/logica/notacao'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import '../estilos/entrada-notacao-han-fu.css'

/**
 * Campo para digitar a mão em notação (`2388m447p2458889s`) com o teclado
 * padrão do aparelho. Mostra as pedras lidas; com erro, só a mensagem.
 */
export function EntradaNotacaoHanFu() {
  const { t } = useI18n()
  const idMensagem = useId()
  const [texto, setTexto] = useState('')
  const { pedras, erro } = useMemo(
    () => interpretarNotacao(normalizarNotacao(texto), { melds: [], akadora: true }),
    [texto],
  )
  const mensagem = erro
    ? t(erro.chave, erro.parametros)
    : t('notation.tileCount', { count: pedras.length })

  return (
    <div className="entrada-notacao-han-fu">
      <input
        className={`campo-notacao-han-fu ${erro ? 'com-erro' : ''}`.trim()}
        type="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label={t('notation.fieldLabel')}
        aria-invalid={!!erro}
        aria-describedby={idMensagem}
        placeholder={t('notation.placeholder', { example: '2388m447p2458889s' })}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') evento.currentTarget.blur()
        }}
      />

      <small
        id={idMensagem}
        className={`mensagem-notacao-han-fu ${erro ? 'com-erro' : ''}`.trim()}
        aria-live="polite"
      >
        {mensagem}
      </small>

      {!erro && pedras.length > 0 && (
        <div className="pedras-notacao-han-fu" role="list" aria-label={t('calculator.closedHand')}>
          {pedras.map((pedra, indice) => (
            <span key={`${pedra}-${indice}`} className="pedra-notacao-han-fu" role="listitem">
              <PedraSvg pedra={pedra} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
