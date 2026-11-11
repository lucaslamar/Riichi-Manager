/**
 * Geração das rodadas de cada formato. Tudo puro: a tela chama e salva.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { jogadoresPorMesa, progressoDaRodada } from '../torneio'
import type { RodadaTorneio, Torneio } from '../tipos'
import { rodadaCorridos } from './corridos'
import { proximaRodadaEliminatoria } from './eliminatorio'
import { proximaRodadaSuica } from './suico'
import { rodadaAleatoria } from './rodadaAleatoria'
import { gerarRodizio } from './rodizio/rodizio'

/**
 * Rodízio de Sanma: cada rodada evita repetir adversários e põe de Leste quem ainda
 * não foi (mesmas regras do Suíço e de Pontos corridos), então em 3 rodadas todos são
 * Leste uma vez. O Rodízio de 4 segue com a grade do Torneio antigo.
 */
export function gerarRodizioSanma(jogadorIds: readonly string[], totalRodadas: number, agora: string): RodadaTorneio[] {
  const rodadas: RodadaTorneio[] = []
  for (let numero = 1; numero <= totalRodadas; numero++) {
    rodadas.push(rodadaCorridos(jogadorIds, rodadas, numero, agora, undefined, 3))
  }
  return rodadas
}

/** Rodadas que já saem no sorteio da Lista. */
export function rodadasIniciais(torneio: Torneio, jogadorIds: readonly string[], agora: string): RodadaTorneio[] {
  const { formato } = torneio
  const porMesa = jogadoresPorMesa(torneio)
  // Sanma: o Rodízio sai rodada a rodada, com cada um Leste uma vez (mesas de 3).
  const rodizio = (rodadas: number) =>
    porMesa === 3 ? gerarRodizioSanma(jogadorIds, rodadas, agora) : gerarRodizio(jogadorIds, rodadas, agora).rodadas
  if (formato.tipo === 'rodizio') return rodizio(formato.rodadas)
  if (formato.tipo === 'eliminatorio' && formato.classificatoria === 'rodizio') {
    return rodizio(formato.rodadasClassificatoria).map((rodada) => ({
      ...rodada,
      fase: 0,
    }))
  }
  const primeira = rodadaAleatoria(jogadorIds, 1, agora, undefined, porMesa)
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
    return rodadaCorridos(
      torneio.jogadorIds,
      torneio.rodadas,
      torneio.rodadas.length + 1,
      agora,
      undefined,
      jogadoresPorMesa(torneio),
    )
  }
  return null
}
