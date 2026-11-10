import { REGRAS_SANMA_PADRAO } from './regras-padrao'
import type { RegrasSanma } from './tipos'

export interface ResultadoFinalVariante {
  colocacao: number
  uma: number
  oka: number
  final: number
}

const arredondar = (valor: number) => Math.round(valor * 100) / 100

/**
 * Resultado final de uma mesa de Sanma, na ordem de `pontos`: (pontos − retorno)/1000
 * + uma + oka (que vai para o 1º). Empates dividem a uma e a oka. O yonma segue com a
 * pontuação da mesa do Centerpiece (`calcularResultado`), que fica como está.
 */
export function calcularResultadoFinal(
  pontos: readonly number[],
  regras: RegrasSanma = REGRAS_SANMA_PADRAO,
): ResultadoFinalVariante[] {
  const ordenados = [...pontos].sort((um, outro) => outro - um)
  const oka = ((regras.pontosRetorno - regras.pontosIniciais) * pontos.length) / 1000
  return pontos.map((valor) => {
    const inicio = ordenados.indexOf(valor)
    const empatados = ordenados.filter((outro) => outro === valor).length
    const uma = regras.uma.slice(inicio, inicio + empatados).reduce((soma, item) => soma + item, 0) / empatados
    const okaAqui = inicio === 0 ? oka / empatados : 0
    return {
      colocacao: inicio + 1,
      uma: arredondar(uma),
      oka: arredondar(okaAqui),
      final: arredondar((valor - regras.pontosRetorno) / 1000 + uma + okaAqui),
    }
  })
}
