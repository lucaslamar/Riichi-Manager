/**
 * Pontos corridos: liga em um encontro. Cada rodada é sorteada na hora (botão Nova
 * rodada) pelo sorteio mitigado, que espalha as repetições de adversários.
 * Não há número de rodadas: o organizador encerra quando quiser.
 */
import { sortearRodada, type OpcoesDoSorteio } from '@/compartilhado/sorteio/rodada'
import type { RodadaTorneio } from '../tipos'

export function rodadaCorridos(
  jogadorIds: readonly string[],
  anteriores: readonly RodadaTorneio[],
  numero: number,
  agora: string,
  opcoes?: OpcoesDoSorteio,
): RodadaTorneio {
  return { numero, geradaEm: agora, mesas: sortearRodada(jogadorIds, anteriores, opcoes) }
}
