/**
 * Exemplo da ajuda de "Pontos de retorno", calculado com os valores da tela.
 * Os pontos saem da partida para a soma da mesa sempre fechar.
 */
import { calcularOka, type ConfigMesa } from './configMesa'
import { valoresDaUma } from './uma'

export interface LinhaExemplo {
  colocacao: number
  pontos: number
  menosRetorno: number
  uma: number
  oka: number
  final: number
}

/** Quanto cada colocação ganhou ou perdeu em relação aos pontos de partida. */
const DIFERENCAS = [17000, 3000, -7000, -13000]

export function exemploPontuacao(
  config: Pick<ConfigMesa, 'pontosPartida' | 'pontosRetorno' | 'uma'>,
): LinhaExemplo[] {
  const oka = calcularOka(config) / 1000
  const finais = DIFERENCAS.map((diferenca) => config.pontosPartida + diferenca)
  const umas = valoresDaUma(config.uma, finais, config.pontosRetorno)
  return DIFERENCAS.map((diferenca, indice) => {
    const pontos = config.pontosPartida + diferenca
    const menosRetorno = (pontos - config.pontosRetorno) / 1000
    const uma = umas[indice]
    const okaAqui = indice === 0 ? oka : 0
    return {
      colocacao: indice + 1,
      pontos,
      menosRetorno,
      uma,
      oka: okaAqui,
      final: menosRetorno + uma + okaAqui,
    }
  })
}
