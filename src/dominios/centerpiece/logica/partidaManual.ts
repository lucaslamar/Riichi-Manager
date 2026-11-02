/**
 * Partida jogada fora do app e registrada depois só com o resultado: entra no
 * histórico e no ranking como qualquer outra, sem mãos.
 */
import { alterarConfig, type ConfigMesa } from './configMesa'
import { calcularResultado, criarPartida, type Partida } from './partida'

export interface DadosPartidaManual {
  jogadorIds: readonly [string, string, string, string]
  nomes: readonly string[]
  pontos: readonly [number, number, number, number]
  uma: ConfigMesa['uma']
  /** Total que vai para o 1º, em pontos (20.000). */
  oka: number
}

/**
 * A partida não pergunta os pontos iniciais: saem da soma da mesa. Arredonda para
 * cima porque palitos que ninguém ganhou fazem a soma ficar um pouco abaixo.
 */
function pontosIniciais(pontos: readonly number[]) {
  const soma = pontos.reduce((total, valor) => total + valor, 0)
  return Math.ceil(soma / 4 / 1000) * 1000
}

export function criarPartidaManual(
  id: string,
  base: ConfigMesa,
  dados: DadosPartidaManual,
  agora: string,
): Partida {
  const pontosPartida = pontosIniciais(dados.pontos)
  const config = alterarConfig(base, {
    pontosPartida,
    pontosRetorno: pontosPartida + dados.oka / 4,
    uma: [...dados.uma],
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
  }
  return { ...comPontos, resultado: calcularResultado(comPontos) }
}
