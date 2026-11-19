import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Créditos do guia do Cerrado Mahjong Club, no Guia de Bolso e no Tutorial MCR. */
export default function CreditosCmc() {
  const { t } = useI18n()
  return <p className="creditos-cmc">{t('guiaBolso.mcr.creditos')}</p>
}
