/**
 * Classificação do torneio a partir das partidas ligadas a ele. Serve para montar
 * as mesas do Suíço e das fases eliminatórias, e para o ranking (item 10).
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { Torneio } from './tipos'

export interface LinhaClassificacao {
  jogadorId: string
  pontos: number
  partidas: number
  /** 0 sem partidas. */
  mediaColocacao: number
}

const arredondar = (valor: number) => Math.round(valor * 10) / 10

/**
 * Soma dos pontos finais (com uma e oka) das mesas finalizadas. `rodadas` limita
 * quais rodadas contam (números começando em 1), para os cortes com pontos zerados.
 * Quem ainda não jogou entra com zero. Desempate: média de colocação, depois a
 * ordem da lista (estável).
 */
export function classificar(
  torneio: Torneio,
  partidas: readonly Partida[],
  rodadas?: ReadonlySet<number>,
): LinhaClassificacao[] {
  const acumulado = new Map(
    torneio.jogadorIds.map((id) => [id, { pontos: 0, partidas: 0, colocacoes: 0 }]),
  )
  for (const partida of partidas) {
    const vinculo = partida.vinculoTorneio
    if (vinculo?.torneioId !== torneio.id || partida.status !== 'finalizada') continue
    if (rodadas && !rodadas.has(vinculo.rodada + 1)) continue
    for (const linha of partida.resultado ?? []) {
      const atual = acumulado.get(linha.jogadorId)
      if (!atual) continue
      atual.pontos += linha.final
      atual.partidas += 1
      atual.colocacoes += linha.colocacao
    }
  }
  const ordemOriginal = new Map(torneio.jogadorIds.map((id, indice) => [id, indice]))
  return [...acumulado.entries()]
    .map(([jogadorId, dados]) => ({
      jogadorId,
      pontos: arredondar(dados.pontos),
      partidas: dados.partidas,
      mediaColocacao: dados.partidas ? Math.round((dados.colocacoes / dados.partidas) * 100) / 100 : 0,
    }))
    .sort(
      (uma, outra) =>
        outra.pontos - uma.pontos ||
        (uma.mediaColocacao || 5) - (outra.mediaColocacao || 5) ||
        (ordemOriginal.get(uma.jogadorId) ?? 0) - (ordemOriginal.get(outra.jogadorId) ?? 0),
    )
}
