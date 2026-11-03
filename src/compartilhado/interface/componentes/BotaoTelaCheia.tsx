import { useEffect, useState } from 'react'
import {
  aoMudarTelaCheia,
  entrarTelaCheia,
  estaEmTelaCheia,
  sairTelaCheia,
  suportaTelaCheia,
} from '@/compartilhado/adaptadores/telaCheia'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Entra e sai da tela cheia. Sem suporte (Safari do iPhone), não aparece. */
export default function BotaoTelaCheia() {
  const { t } = useI18n()
  const [ativa, setAtiva] = useState(estaEmTelaCheia)
  useEffect(() => aoMudarTelaCheia(() => setAtiva(estaEmTelaCheia())), [])

  if (!suportaTelaCheia()) return null

  const rotulo = t(ativa ? 'pages.fullscreenExit' : 'pages.fullscreenEnter')
  return (
    <button
      type="button"
      className="botao-voltar-tela botao-tela-cheia"
      aria-label={rotulo}
      title={rotulo}
      onClick={ativa ? sairTelaCheia : entrarTelaCheia}
    >
      <i className={`fas ${ativa ? 'fa-compress' : 'fa-expand'}`} aria-hidden="true" />
    </button>
  )
}
