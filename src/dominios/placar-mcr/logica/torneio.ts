/**
 * Torneio do modo Chinês: o mesmo Torneio do Riichi (formatos, sorteio, mesas e
 * ranking), com cada mesa sendo um placar MCR. Aqui os placares viram as partidas
 * que o torneio lê. A pontuação de cada mesa são os pontos de mesa 4, 2, 1 e 0
 * pela colocação, com empatados dividindo os pontos das colocações que ocupam
 * juntos (regras de torneio MCR da EMA). O desempate é a soma dos pontos MCR.
 */
import {
  ORDEM_VENTOS,
  type Partida,
  type ResultadoFinal,
} from '@/dominios/centerpiece/logica/partida'
import {
  CADEIRAS,
  colocacoes,
  MAOS_POR_RODADA,
  TOTAL_MAOS,
  totais,
  ventoDaRodada,
  type PlacarMcr,
} from './placar'

export const PONTOS_DE_MESA = [4, 2, 1, 0] as const

/**
 * Pontos de mesa de cada cadeira pelos totais da partida. Empatados dividem
 * igualmente os pontos das colocações que ocupam juntos: dois em 1º ficam com
 * (4 + 2) ÷ 2 = 3 cada.
 */
export function pontosDeMesa(pontos: readonly number[]): number[] {
  const lugares = colocacoes(pontos)
  return pontos.map((_, cadeira) => {
    const lugar = lugares[cadeira]
    const empatados = lugares.filter((outro) => outro === lugar).length
    const ocupados = PONTOS_DE_MESA.slice(lugar - 1, lugar - 1 + empatados)
    return ocupados.reduce<number>((soma, valor) => soma + valor, 0) / empatados
  })
}

/** Os placares de torneio como as partidas que o Torneio do Riichi lê (vínculo, situação e resultado). */
export function partidasDoTorneioMcr(placares: readonly PlacarMcr[]): Partida[] {
  return placares.flatMap((placar) => {
    const vinculo = placar.torneio
    if (vinculo?.rodada === undefined || vinculo.mesa === undefined) return []
    const pontos = totais(placar)
    const lugares = colocacoes(pontos)
    const mesa = pontosDeMesa(pontos)
    const resultado: ResultadoFinal[] = CADEIRAS.map((cadeira) => ({
      cadeira,
      jogadorId: placar.jogadorIds[cadeira],
      colocacao: lugares[cadeira],
      pontosBrutos: pontos[cadeira],
      uma: 0,
      oka: 0,
      multa: 0,
      final: mesa[cadeira],
      desempate: pontos[cadeira],
    }))
    const finalizada = placar.finalizadoEm !== null
    // A mão em jogo, para o card da mesa mostrar "Em andamento · 南2".
    const indiceMao = Math.min(placar.maos.length, TOTAL_MAOS - 1)
    // Só os campos que o Torneio lê; o resto da Partida é do Riichi.
    return [
      {
        id: placar.id,
        status: finalizada ? 'finalizada' : 'em_andamento',
        criadaEm: placar.criadoEm,
        finalizadaEm: placar.finalizadoEm,
        resultado: finalizada ? resultado : undefined,
        placar: {
          rodadaVento: ORDEM_VENTOS[ventoDaRodada(indiceMao)],
          rodadaNumero: (indiceMao % MAOS_POR_RODADA) + 1,
          pontos,
        },
        vinculoTorneio: { torneioId: vinculo.id, rodada: vinculo.rodada, mesa: vinculo.mesa },
        variante: 'yonma',
        registradaManual: false,
        config: {},
        assentos: {},
      } as unknown as Partida,
    ]
  })
}
