import { useEffect } from 'react'
import { lerSobDemanda, pararFala, repetirUltimo } from '@/compartilhado/adaptadores/voz'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useConfigNarracao } from './useNarracao'

/** Atalhos da Narração: Alt+M lê a mão, Alt+D os descartes, Alt+R repete e Alt+S para. */
export default function AtalhosNarracao() {
  const { t } = useI18n()
  const { ativa } = useConfigNarracao().config

  useEffect(() => {
    if (!ativa) return
    const teclar = (evento: KeyboardEvent) => {
      if (!evento.altKey || evento.ctrlKey || evento.metaKey) return
      const acoes: Record<string, () => void> = {
        KeyM: () => lerSobDemanda('mao', t('narration.noHand')),
        KeyD: () => lerSobDemanda('descartes', t('narration.noDiscards')),
        KeyR: repetirUltimo,
        KeyS: pararFala,
      }
      const acao = acoes[evento.code]
      if (!acao) return
      evento.preventDefault()
      acao()
    }
    window.addEventListener('keydown', teclar)
    return () => window.removeEventListener('keydown', teclar)
  }, [ativa, t])

  return null
}
