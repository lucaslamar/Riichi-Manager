/**
 * O Ranking do modo Chinês usa a mesma tela e o mesmo cálculo do Riichi: os
 * placares MCR finalizados viram partidas só com o que o ranking lê (resultado,
 * data e origem). Pontos são os do MCR; não há uma, oka nem multa.
 */
import {
  ORDEM_VENTOS,
  type EventoPartida,
  type Partida,
  type ResultadoFinal,
} from '@/dominios/centerpiece/logica/partida'
import {
  CADEIRAS,
  colocacoes,
  dealerDaMao,
  MAOS_POR_RODADA,
  pontosDaMao,
  pontosDoFalsoHu,
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
        registradaManual: !!placar.pontosRegistrados,
        eventos: eventosDoPlacarMcr(placar),
        ordemDosVentos: true,
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
      const eventos = eventosDoPlacarMcr(placar)
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

/**
 * Placar finalizado como a partida que o card do Histórico do Riichi lê: o
 * resultado, as cadeiras com os nomes dos convidados e os ron e tsumo da partida.
 */
export function partidaDoHistoricoMcr(placar: PlacarMcr): Partida {
  const [base] = partidasDoRankingMcr([placar])
  return {
    ...base,
    // Como no Riichi: o card lista do 1º ao 4º.
    resultado: [...(base.resultado ?? [])].sort((uma, outra) => uma.colocacao - outra.colocacao),
    criadaEm: placar.criadoEm,
    eventos: eventosDoPlacarMcr(placar),
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
    ...(placar.torneio?.rodada !== undefined && placar.torneio.mesa !== undefined
      ? {
          vinculoTorneio: {
            torneioId: placar.torneio.id,
            rodada: placar.torneio.rodada,
            mesa: placar.torneio.mesa,
          },
        }
      : {}),
  } as unknown as Partida
}

/** Mãos, empates e Falsos Hu na ordem, no formato de evento da partida do Riichi. */
export function eventosDoPlacarMcr(placar: PlacarMcr): EventoPartida[] {
  const rodada = (indice: number) => {
    const mao = Math.min(indice, TOTAL_MAOS - 1)
    return {
      vento: ORDEM_VENTOS[ventoDaRodada(mao)],
      numero: (mao % MAOS_POR_RODADA) + 1,
      honba: 0,
    }
  }
  const eventos: EventoPartida[] = []
  const falsosAte = (indice: number) =>
    (placar.falsosHu ?? [])
      .filter((falso) => falso.aposMao === indice)
      .forEach((falso, ordem) =>
        eventos.push({
          id: `${placar.id}-f${indice}-${ordem}`,
          em: placar.criadoEm,
          tipo: 'chombo',
          rodada: rodada(indice),
          variacao: pontosDoFalsoHu(falso.cadeira),
          detalhe: { cadeira: falso.cadeira },
        } as unknown as EventoPartida),
      )
  placar.maos.forEach((mao, indice) => {
    falsosAte(indice)
    eventos.push({
      id: `${placar.id}-m${indice}`,
      em: placar.criadoEm,
      tipo: mao.tipo === 'empate' ? 'ryukyoku' : mao.forma,
      rodada: rodada(indice),
      variacao: pontosDaMao(mao),
      detalhe:
        mao.tipo === 'empate'
          ? {}
          : { vencedores: [mao.vencedor], pagador: mao.descartador, fan: mao.fan },
      lances: mao.lances,
    } as unknown as EventoPartida)
  })
  falsosAte(placar.maos.length)
  return eventos
}
