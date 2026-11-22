import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CHAVE_VENTO } from '../../logica/partida'
import type { Andamento } from '../../logica/partidaPausada'

/** "Leste 3 · honba 1 · riichi na mesa: 2". */
export function useTextoAndamento() {
  const { t } = useI18n()
  return ({ rodada, honba, palitos }: Andamento) =>
    [
      `${t(CHAVE_VENTO[rodada.vento])} ${rodada.numero}`,
      honba ? t('match.cards.honba', { count: honba }) : null,
      palitos ? t('match.paused.sticksShort', { count: palitos }) : null,
    ]
      .filter(Boolean)
      .join(' · ')
}
