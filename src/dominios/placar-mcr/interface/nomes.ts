import { nomeExibido, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import type { Cadeira } from '../logica/placar'

export const CHAVES_VENTO: Record<Cadeira, string> = {
  0: 'winds.east',
  1: 'winds.south',
  2: 'winds.west',
  3: 'winds.north',
}

/**
 * Nome do jogador da cadeira. Convidado de torneio (sem cadastro) usa o nome da
 * lista. Quem saiu do cadastro aparece com o rótulo de removido.
 */
export function nomeDaCadeira(
  jogadores: readonly Jogador[],
  id: string,
  rotuloRemovido: string,
  convidados?: Record<string, string>,
) {
  const jogador = jogadores.find((candidato) => candidato.id === id)
  return jogador ? nomeExibido(jogador) : (convidados?.[id] ?? rotuloRemovido)
}
