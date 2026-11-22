import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeNoTorneio } from '../../logica/torneio'
import type { Torneio } from '../../logica/tipos'
import { usePartidasDoTorneio } from './usePartidasDoTorneio'

/** Nome para mostrar. Sem registro nenhum, "Jogador N" pela posição na lista, nunca "?". */
export function useNomeNoTorneio() {
  const { t } = useI18n()
  const { jogadores } = useJogadores()
  const { partidas } = usePartidasDoTorneio()
  return (torneio: Pick<Torneio, 'convidados' | 'nomes' | 'jogadorIds'>, id: string): string =>
    nomeNoTorneio(torneio, jogadores, id, partidas) ??
    t('tournament.unknownPlayer', { number: torneio.jogadorIds.indexOf(id) + 1 })
}
