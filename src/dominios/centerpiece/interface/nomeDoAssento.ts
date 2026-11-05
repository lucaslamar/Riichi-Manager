import { nomeExibido, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import { ehConvidado } from '../logica/listaClube'
import type { Partida } from '../logica/partida'

type Assento = Partida['assentos'][0]

/**
 * Nome do assento: o do cadastro; para convidado do clube, o nome guardado na
 * partida; para quem saiu do cadastro, o nome guardado com a marca de excluído.
 */
export function nomeDoAssento(
  jogadores: readonly Jogador[],
  assento: Assento,
  excluido: (nome: string) => string,
) {
  const jogador = jogadores.find((item) => item.id === assento.jogadorId)
  if (jogador) return nomeExibido(jogador)
  if (ehConvidado(assento.jogadorId)) return assento.nome ?? '—'
  return excluido(assento.nome ?? '—')
}
