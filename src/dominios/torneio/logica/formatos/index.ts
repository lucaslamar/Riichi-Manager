/**
 * Geração das rodadas de cada formato. Tudo puro: a tela chama e salva.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { progressoDaRodada } from '../torneio'
import type { RodadaTorneio, Torneio } from '../tipos'
import { rodadaCorridos } from './corridos'
import { proximaRodadaEliminatoria } from './eliminatorio'
import { proximaRodadaSuica } from './suico'
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

/** Todas as mesas da última rodada gerada têm resultado. */
export function rodadaFechada(torneio: Torneio, partidas: readonly Partida[]): boolean {
  const ultima = torneio.rodadas[torneio.rodadas.length - 1]
  if (!ultima) return false
  const { finalizadas, total } = progressoDaRodada(partidas, torneio, ultima)
  return finalizadas === total
}

/**
 * A próxima rodada, se o formato tiver uma e a atual estiver fechada. `null` quando
 * ainda falta resultado ou o formato acabou (o Rodízio já sai inteiro no sorteio).
 */
export function proximaRodada(torneio: Torneio, partidas: readonly Partida[], agora: string): RodadaTorneio | null {
  if (!rodadaFechada(torneio, partidas)) return null
  const { formato } = torneio
  if (formato.tipo === 'suico' && torneio.rodadas.length < formato.rodadas) {
    return proximaRodadaSuica(torneio, partidas, agora)
  }
  if (formato.tipo === 'eliminatorio') return proximaRodadaEliminatoria(torneio, formato, partidas, agora)
  if (formato.tipo === 'corridos' || formato.tipo === 'temporada') {
    return rodadaCorridos(torneio.jogadorIds, torneio.rodadas, torneio.rodadas.length + 1, agora)
  }
  return null
}
