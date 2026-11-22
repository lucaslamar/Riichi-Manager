import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { lerPartidaPausada, type PartidaPausada } from '../logica/partidaPausada'

export const CHAVE_PARTIDAS_PAUSADAS = 'riichi-manager-partidas-pausadas'
const VERSAO = 1

export function carregarPartidasPausadas(armazenamento: ArmazenamentoChaveValor): PartidaPausada[] {
  const salvo = armazenamento.ler(CHAVE_PARTIDAS_PAUSADAS)
  if (!salvo) return []
  try {
    const { partidas } = JSON.parse(salvo) as { partidas?: unknown }
    if (!Array.isArray(partidas)) return []
    return partidas.flatMap((partida) => lerPartidaPausada(partida) ?? [])
  } catch (erro) {
    console.error('Não foi possível ler as partidas salvas para continuar', erro)
    return []
  }
}

export function salvarPartidasPausadas(
  armazenamento: ArmazenamentoChaveValor,
  partidas: readonly PartidaPausada[],
) {
  armazenamento.gravar(CHAVE_PARTIDAS_PAUSADAS, JSON.stringify({ versao: VERSAO, partidas }))
}
