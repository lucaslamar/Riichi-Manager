import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsAdSlot {
  ativo?: boolean
  posicao?: 'rodape' | 'lateral'
}

/**
 * Reserva um ponto unico para publicidade futura sem acoplar Google Ads ao layout.
 *
 * Quando `ativo` for falso, o componente some do fluxo e nao entra na arvore acessivel.
 * Isso permite validar a calculadora com e sem anuncios sem cobrir teclado, esperas ou Calcular.
 */
export default function AdSlot({ ativo = false, posicao = 'rodape' }: PropsAdSlot) {
  const { t } = useI18n()

  if (!ativo) {
    return <div className="ad-slot ad-slot-inativo" aria-hidden="true" />
  }

  return (
    <aside className={`ad-slot ad-slot-${posicao}`} aria-label={t('ad.label')}>
      <span>{t('ad.placeholder')}</span>
    </aside>
  )
}
