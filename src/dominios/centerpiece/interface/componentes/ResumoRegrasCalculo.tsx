import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao/configuracao'

/** Regras ativas em uma linha ("Aka dora · Kuitan"), só para ler: mudam na criação da mesa. */
export default function ResumoRegrasCalculo({
  regras,
  className,
}: {
  regras: ConfiguracaoCalculo
  className?: string
}) {
  const { t } = useI18n()
  const ativas = [
    regras.akadora && t('rulesModal.akadora.title'),
    regras.akadora && regras.doraFlamejante && t('rulesModal.doraFlamejante.title'),
    regras.tanyaoAberto && t('tableConfig.ruleKuitan'),
    regras.basengo && t('rulesModal.basengo.title'),
    regras.kiriageMangan && t('rulesModal.kiriageMangan.title'),
  ].filter(Boolean)
  if (ativas.length === 0) return null
  return <span className={className}>{ativas.join(' · ')}</span>
}
