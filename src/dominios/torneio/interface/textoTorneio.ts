import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { mesasDoTorneio, rodadaAtual, totalDeRodadas } from '../logica/torneio'
import type { Torneio } from '../logica/tipos'

/** "Rodada 2 de 4 · 3 mesas", ou a lista em preparo enquanto é rascunho. */
export function useSubtituloTorneio() {
  const { t } = useI18n()
  return (torneio: Torneio) => {
    if (torneio.status === 'rascunho') {
      return t('tournament.draft', { count: torneio.jogadorIds.length })
    }
    const rodada = rodadaAtual(torneio)?.numero ?? 1
    const total = totalDeRodadas(torneio.formato)
    const tables = mesasDoTorneio(torneio)
    return total
      ? t('tournament.roundOf', { round: rodada, total, tables })
      : t('tournament.roundOpen', { round: rodada, tables })
  }
}
