import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import FolhaConfiguracoes, { type AbaConfiguracoes } from './FolhaConfiguracoes'

/**
 * Engrenagem do cabeçalho das telas principais: abre as Configurações com as abas
 * da tela (se houver) e a "Ajustes do app". Uma por cabeçalho.
 */
export default function BotaoConfiguracoes({ abas }: { abas?: readonly AbaConfiguracoes[] }) {
  const { t } = useI18n()
  const [aberta, setAberta] = useState(false)
  return (
    <>
      <button
        type="button"
        className="botao-voltar-tela botao-configuracoes-tela"
        aria-label={t('menu.rules')}
        title={t('menu.rules')}
        aria-haspopup="dialog"
        onClick={() => setAberta(true)}
      >
        <i className="fas fa-gear" aria-hidden="true" />
      </button>
      {aberta && <FolhaConfiguracoes abas={abas} aoFechar={() => setAberta(false)} />}
    </>
  )
}
