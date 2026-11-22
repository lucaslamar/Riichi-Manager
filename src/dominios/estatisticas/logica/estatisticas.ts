/**
 * Números de um jogador num conjunto de partidas já escolhido pelo escopo. Sem tela.
 * As taxas só usam partidas com mão a mão: quem só registrou o resultado não tem mãos.
 */
import {
  distribuicaoDeColocacoes,
  resumoDoJogador,
} from '@/dominios/centerpiece/logica/analiseJogador'
import { CADEIRAS, type Cadeira, type Partida } from '@/dominios/centerpiece/logica/partida'
import {
  forcaDaMao,
  resumoDasMaos,
  type MaoDestacada,
} from '@/dominios/centerpiece/logica/resumoPartida'

export interface MaiorMaoDoEscopo extends MaoDestacada {
  jogadorId: string
  /** O nome guardado na partida, para quem saiu do cadastro. */
  nome?: string
}

export interface EstatisticasDoJogador {
  partidas: number
  colocacoes: [number, number, number, number]
  /** null sem partidas. */
  mediaPontos: number | null
  /** Frações de 0 a 1 sobre as mãos jogadas. null sem mão a mão. */
  taxas: { vitoria: number; dealIn: number; riichi: number } | null
  partidasComMaos: number
  maior: MaiorMaoDoEscopo | null
}

const cadeiraDe = (partida: Partida, jogadorId: string): Cadeira | undefined =>
  CADEIRAS.find((cadeira) => partida.assentos[cadeira]?.jogadorId === jogadorId)

/** A maior mão, ou a maior de um jogador. No empate fica a primeira que saiu. */
export function maiorMaoDoEscopo(
  partidas: readonly Partida[],
  jogadorId?: string,
): MaiorMaoDoEscopo | null {
  const emOrdem = [...partidas].sort((uma, outra) =>
    (uma.finalizadaEm ?? '').localeCompare(outra.finalizadaEm ?? ''),
  )
  let maior: MaiorMaoDoEscopo | null = null
  for (const partida of emOrdem) {
    for (const mao of resumoDasMaos(partida)?.maiores ?? []) {
      const assento = partida.assentos[mao.cadeira]
      if (jogadorId && assento.jogadorId !== jogadorId) continue
      if (maior && forcaDaMao(mao) <= forcaDaMao(maior)) continue
      maior = { ...mao, jogadorId: assento.jogadorId, nome: assento.nome }
    }
  }
  return maior
}

export function estatisticasDoJogador(
  partidas: readonly Partida[],
  jogadorId: string,
): EstatisticasDoJogador {
  const dele = partidas.filter((partida) =>
    partida.resultado?.some((linha) => linha.jogadorId === jogadorId),
  )
  const { partidas: jogadas, pontuacaoTotal } = resumoDoJogador(dele, jogadorId)

  const soma = { maos: 0, vitorias: 0, dealIn: 0, riichi: 0 }
  let partidasComMaos = 0
  for (const partida of dele) {
    const maos = resumoDasMaos(partida)
    const cadeira = cadeiraDe(partida, jogadorId)
    if (!maos || cadeira === undefined) continue
    partidasComMaos += 1
    soma.maos += maos.jogadas
    soma.vitorias += maos.porCadeira[cadeira].vitorias
    soma.dealIn += maos.porCadeira[cadeira].dealIn
    soma.riichi += maos.porCadeira[cadeira].riichi
  }

  return {
    partidas: jogadas,
    colocacoes: distribuicaoDeColocacoes(dele, jogadorId),
    mediaPontos: jogadas ? pontuacaoTotal / jogadas : null,
    taxas: soma.maos
      ? {
          vitoria: soma.vitorias / soma.maos,
          dealIn: soma.dealIn / soma.maos,
          riichi: soma.riichi / soma.maos,
        }
      : null,
    partidasComMaos,
    maior: maiorMaoDoEscopo(dele, jogadorId),
  }
}
