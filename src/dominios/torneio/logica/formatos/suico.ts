/**
 * Suíço: a rodada 1 é sorteada e, da 2 em diante, as mesas seguem a classificação
 * (1º ao 4º na mesa 1, 5º ao 8º na mesa 2…), com trocas entre vizinhos para não
 * repetir adversários.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { classificar } from '../classificacao'
import type { RodadaTorneio, Torneio } from '../tipos'
import { mesasPelaOrdem } from './comum'

export function rodadaSuica(
  ordem: readonly string[],
  anteriores: readonly RodadaTorneio[],
  numero: number,
  agora: string,
): RodadaTorneio {
  return { numero, geradaEm: agora, mesas: mesasPelaOrdem(ordem, anteriores) }
}

export function proximaRodadaSuica(torneio: Torneio, partidas: readonly Partida[], agora: string) {
  const ordem = classificar(torneio, partidas).map((linha) => linha.jogadorId)
  return rodadaSuica(ordem, torneio.rodadas, torneio.rodadas.length + 1, agora)
}
