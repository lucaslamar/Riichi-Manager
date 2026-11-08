/**
 * Geração das rodadas de cada formato. Tudo puro: a tela chama e salva.
 */
import type { RodadaTorneio, Torneio } from '../tipos'
import { rodadaAleatoria } from './rodadaAleatoria'
import { gerarRodizio } from './rodizio/rodizio'

/** Rodadas que já saem no sorteio da Lista. */
export function rodadasIniciais(torneio: Torneio, jogadorIds: readonly string[], agora: string): RodadaTorneio[] {
  const { formato } = torneio
  if (formato.tipo === 'rodizio') return gerarRodizio(jogadorIds, formato.rodadas, agora).rodadas
  if (formato.tipo === 'eliminatorio' && formato.classificatoria === 'rodizio') {
    return gerarRodizio(jogadorIds, formato.rodadasClassificatoria, agora).rodadas.map((rodada) => ({
      ...rodada,
      fase: 0,
    }))
  }
  const primeira = rodadaAleatoria(jogadorIds, 1, agora)
  return [formato.tipo === 'eliminatorio' ? { ...primeira, fase: 0 } : primeira]
}
