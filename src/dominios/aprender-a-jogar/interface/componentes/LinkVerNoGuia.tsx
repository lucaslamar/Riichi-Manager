import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { DESTINO_GUIA } from '../../conteudo/destinos'
import { useAprender } from '../ContextoAprender'
import './link-ver-no-guia.css'

/**
 * Link discreto "Ver em Aprender a jogar" no fim de uma ajuda curta (botão
 * "?", verbete, cartão de yaku). Abre o guia por cima, na página que explica
 * o assunto por extenso; ao fechar o guia, a ajuda continua aberta.
 *
 * Some quando o assunto não tem página ou quando a ajuda já foi aberta de
 * dentro do guia (ex.: um termo tocado numa página).
 */
export default function LinkVerNoGuia({ chave }: { chave: string }) {
  const { t } = useI18n()
  const aprender = useAprender()
  const destino = DESTINO_GUIA[chave]
  if (!aprender || aprender.aberto || !destino) return null

  return (
    <button type="button" className="link-ver-no-guia" onClick={() => aprender.abrir(destino)}>
      <i className="fas fa-book-open" aria-hidden="true" />
      {t('learn.seeInGuide')}
      <i className="fas fa-chevron-right link-ver-no-guia__seta" aria-hidden="true" />
    </button>
  )
}
