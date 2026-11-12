/**
 * Partida jogada fora do app e registrada depois só com o resultado: entra no
 * histórico e no ranking como qualquer outra, sem mãos.
 */
import { alterarConfig, type ConfigMesa } from './configMesa'
import { calcularResultado, criarPartida, type Partida } from './partida'
import type { UmaMesa } from './uma'

export interface DadosPartidaManual {
  jogadorIds: readonly [string, string, string, string]
  nomes: readonly string[]
  pontos: readonly [number, number, number, number]
  pontosPartida: number
  pontosRetorno: number
  uma: UmaMesa
  /** A lista segue Leste, Sul, Oeste e Norte: a partida conta nas estatísticas por vento. */
  ordemDosVentos?: boolean
}

export function criarPartidaManual(
  id: string,
  base: ConfigMesa,
  dados: DadosPartidaManual,
  agora: string,
): Partida {
  const config = alterarConfig(base, {
    pontosPartida: dados.pontosPartida,
    pontosRetorno: dados.pontosRetorno,
    uma: dados.uma,
  })
  const partida = criarPartida(id, config, dados.jogadorIds, agora, dados.nomes)
  const comPontos: Partida = {
    ...partida,
    placar: {
      ...partida.placar,
      pontos: { 0: dados.pontos[0], 1: dados.pontos[1], 2: dados.pontos[2], 3: dados.pontos[3] },
    },
    status: 'finalizada',
    finalizadaEm: agora,
    registradaManual: true,
    ordemDosVentos: !!dados.ordemDosVentos,
  }
  return { ...comPontos, resultado: calcularResultado(comPontos) }
}
