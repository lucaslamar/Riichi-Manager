/**
 * O Ranking do modo Chinês usa a mesma tela e o mesmo cálculo do Riichi: os
 * placares MCR finalizados viram partidas só com o que o ranking lê (resultado,
 * data e origem). Pontos são os do MCR; não há uma, oka nem multa.
 */
import {
  ORDEM_VENTOS,
  type Partida,
  type ResultadoFinal,
} from '@/dominios/centerpiece/logica/partida'
import {
  CADEIRAS,
  colocacoes,
  dealerDaMao,
  MAOS_POR_RODADA,
  TOTAL_MAOS,
  totais,
  ventoDaRodada,
  type PlacarMcr,
} from './placar'

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
        // A análise do jogador lê o vento de cada um na primeira mão.
        assentos: Object.fromEntries(
          CADEIRAS.map((cadeira) => [
            cadeira,
            { jogadorId: placar.jogadorIds[cadeira], ventoInicial: ORDEM_VENTOS[cadeira] },
          ]),
        ),
      } as unknown as Partida
    })
}

/**
 * Placares em jogo (fora de torneio) como as mesas abertas do Em andamento do
 * Riichi: o card lê o dealer, a rodada, os pontos e os ron e tsumo de cada um.
 */
export function partidasAbertasMcr(placares: readonly PlacarMcr[]): Partida[] {
  return placares
    .filter((placar) => placar.finalizadoEm === null && !placar.torneio)
    .map((placar) => {
      const indiceMao = Math.min(placar.maos.length, TOTAL_MAOS - 1)
      const eventos = placar.maos.flatMap((mao) =>
        mao.tipo === 'empate'
          ? []
          : [
              {
                tipo: mao.forma,
                detalhe: { vencedores: [mao.vencedor], pagador: mao.descartador },
              },
            ],
      )
      return {
        id: placar.id,
        status: 'em_andamento',
        criadaEm: placar.criadoEm,
        variante: 'yonma',
        registradaManual: false,
        config: {},
        eventos,
        assentos: Object.fromEntries(
          CADEIRAS.map((cadeira) => [
            cadeira,
            {
              jogadorId: placar.jogadorIds[cadeira],
              ventoInicial: ORDEM_VENTOS[cadeira],
              nome: placar.convidados?.[placar.jogadorIds[cadeira]],
            },
          ]),
        ),
        placar: {
          cadeiraDealer: dealerDaMao(placar.maos.length),
          pontos: totais(placar),
          rodadaVento: ORDEM_VENTOS[ventoDaRodada(indiceMao)],
          rodadaNumero: (indiceMao % MAOS_POR_RODADA) + 1,
          honba: 0,
        },
      } as unknown as Partida
    })
}
