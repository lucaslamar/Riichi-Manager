import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { textoDaSeta, type MudancaPosicao } from '../../logica/ranking'

/** Mudança de posição junto do número da posição. */
export default function SetaPosicao({ mudanca }: { mudanca: MudancaPosicao | undefined }) {
  const { t } = useI18n()
  if (!mudanca) return null
  const { antes, variacao } = mudanca
  const falado =
    antes === null
      ? t('tournament.positionChange.new')
      : variacao === 0
        ? t('tournament.positionChange.same')
        : t(`tournament.positionChange.${variacao > 0 ? 'up' : 'down'}`, { count: Math.abs(variacao) })
  const visivel = antes === null ? t('tournament.positionChange.newShort') : textoDaSeta(mudanca) || '–'
  const tom = variacao > 0 ? ' trn-positivo' : variacao < 0 ? ' trn-negativo' : ''

  return (
    <span className={`trn-seta-posicao${tom}`}>
      <span aria-hidden="true">{visivel}</span>
      <span className="sr-only">{falado}</span>
    </span>
  )
}
