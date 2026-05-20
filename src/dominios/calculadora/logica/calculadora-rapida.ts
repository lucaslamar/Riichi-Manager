import type { ConfiguracaoCalculo } from './configuracao'
import type { PontosCalculados } from './resultado'

// ─── Calculadora rápida ───────────────────────────────────────────────────────

export function arredondar100(valor: number): number {
  return Math.ceil(valor / 100) * 100
}

/**
 * Calcula pontos diretamente de han+fu sem precisar montar uma mão.
 */
export function calcularHanFu(
  han: number,
  fu: number,
  config: ConfiguracaoCalculo,
): { tsumoOya: number; tsumoKo: number; ronOya: number; ronKo: number } {
  let base = fu * Math.pow(2, han + 2)
  if (config.kiriageMangan ? base >= 1920 : base > 2000) {
    if (config.kazoeYakuman && han >= 13) base = 8000
    else if (han >= 11) base = 6000
    else if (han >= 8) base = 4000
    else if (han >= 6) base = 3000
    else base = 2000
  }
  return {
    tsumoOya: arredondar100(base * 2),
    tsumoKo: arredondar100(base),
    ronOya: arredondar100(base * 6),
    ronKo: arredondar100(base * 4),
  }
}

export function fuValidos(agari: 'tsumo' | 'ron'): Map<number, number[]> {
  const incluirSe = (condicao: boolean, valor: number) => (condicao ? [valor] : [])
  return new Map([
    [1, [30, 40, 50, 60, 70, 80, 90, 100, 110]],
    [
      2,
      [
        ...incluirSe(agari === 'tsumo', 20),
        ...incluirSe(agari === 'ron', 25),
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100,
        110,
      ],
    ],
    [3, [...incluirSe(agari === 'tsumo', 20), 25, 30, 40, 50, 60]],
    [4, [...incluirSe(agari === 'tsumo', 20), 25, 30]],
  ])
}

export function montarPontosRapidos(
  isOya: boolean,
  agari: 'tsumo' | 'ron',
  tabela: ReturnType<typeof calcularHanFu>,
): Exclude<PontosCalculados, { agari: null }> {
  const { tsumoOya, tsumoKo, ronOya, ronKo } = tabela
  return agari === 'ron'
    ? {
        agari: 'ron',
        pontos: { total: isOya ? ronOya : ronKo, oya: { ron: ronOya }, ko: { ron: ronKo } },
      }
    : {
        agari: 'tsumo',
        pontos: {
          total: isOya ? tsumoOya * 3 : tsumoOya + tsumoKo * 2,
          oya: { ko: tsumoOya },
          ko: { oya: tsumoOya, ko: tsumoKo },
        },
      }
}
