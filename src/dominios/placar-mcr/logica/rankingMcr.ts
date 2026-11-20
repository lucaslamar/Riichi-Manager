/**
 * O Ranking do modo Chinês usa a mesma tela e o mesmo cálculo do Riichi: os
 * placares MCR finalizados viram partidas só com o que o ranking lê (resultado,
 * data e origem). Pontos são os do MCR; não há uma, oka nem multa.
 */
import type { Partida, ResultadoFinal } from '@/dominios/centerpiece/logica/partida'
import { CADEIRAS, colocacoes, totais, type PlacarMcr } from './placar'

export function partidasDoRankingMcr(placares: readonly PlacarMcr[]): Partida[] {
  return placares
    .filter((placar) => placar.finalizadoEm !== null)
    .map((placar) => {
      const pontos = totais(placar)
      const lugares = colocacoes(pontos)
      const resultado: ResultadoFinal[] = CADEIRAS.map((cadeira) => ({
        cadeira,
        jogadorId: placar.jogadorIds[cadeira],
        colocacao: lugares[cadeira],
        pontosBrutos: pontos[cadeira],
        uma: 0,
        oka: 0,
        multa: 0,
        final: pontos[cadeira],
      }))
      // Só os campos que o cálculo do ranking usa; o resto da Partida não existe no MCR.
      return {
        id: placar.id,
        status: 'finalizada',
        finalizadaEm: placar.finalizadoEm,
        resultado,
        variante: 'yonma',
        registradaManual: false,
        config: {},
        assentos: {},
      } as unknown as Partida
    })
}
