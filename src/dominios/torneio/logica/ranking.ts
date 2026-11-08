/**
 * Ranking do torneio: classificação com posição (empatados dividem a posição) e,
 * no Eliminatório, a fase em que cada um parou.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { classificar, type LinhaClassificacao } from './classificacao'
import { rankingEliminatorio } from './formatos/eliminatorio'
import type { Torneio } from './tipos'

export interface LinhaRankingTorneio extends LinhaClassificacao {
  posicao: number
  /** Só no Eliminatório: 0 = parou na classificatória. */
  fase?: number
}

export function rankingDoTorneio(torneio: Torneio, partidas: readonly Partida[]): LinhaRankingTorneio[] {
  const linhas: (LinhaClassificacao & { fase?: number })[] =
    torneio.formato.tipo === 'eliminatorio' ? rankingEliminatorio(torneio, partidas) : classificar(torneio, partidas)
  return linhas.map((linha, indice) => {
    // Mesma fase e mesmos pontos: mesma posição (1, 2, 2, 4).
    let primeiro = indice
    while (
      primeiro > 0 &&
      linhas[primeiro - 1].pontos === linha.pontos &&
      linhas[primeiro - 1].fase === linha.fase
    ) {
      primeiro--
    }
    return { ...linha, posicao: primeiro + 1 }
  })
}

/** Texto do ranking para o WhatsApp. */
export function textoDoRanking(
  linhas: readonly LinhaRankingTorneio[],
  rotulos: { titulo: string; nome: (id: string) => string; pontos: (valor: number) => string; fase?: (fase: number) => string },
): string {
  const corpo = linhas.map(
    (linha) =>
      `${linha.posicao}. ${rotulos.nome(linha.jogadorId)} ${rotulos.pontos(linha.pontos)}${
        linha.fase !== undefined && rotulos.fase ? ` · ${rotulos.fase(linha.fase)}` : ''
      }`,
  )
  return [rotulos.titulo, '', ...corpo].join('\n')
}
