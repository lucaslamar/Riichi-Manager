import type { ConfiguracaoCalculo } from './configuracao'
import type { PontosCalculados } from './resultado'

// ─── Calculadora rápida ───────────────────────────────────────────────────────

export function arredondar100(valor: number): number {
  return Math.ceil(valor / 100) * 100
}

export function calcularPatamarHanFu(
  han: number,
  fu: number,
  config: ConfiguracaoCalculo,
): { base: number; nome: string | null; yakuman: number } {
  const base = fu * Math.pow(2, han + 2)
  if (!(config.kiriageMangan ? base >= 1920 : base > 2000)) {
    return { base, nome: null, yakuman: 0 }
  }

  if (config.kazoeYakuman && han >= 13) return { base: 8000, nome: 'Kazoe Yakuman', yakuman: 1 }
  if (han >= 11) return { base: 6000, nome: 'Sanbaiman', yakuman: 0 }
  if (han >= 8) return { base: 4000, nome: 'Baiman', yakuman: 0 }
  if (han >= 6) return { base: 3000, nome: 'Haneman', yakuman: 0 }
  return { base: 2000, nome: 'Mangan', yakuman: 0 }
}

/**
 * Calcula pontos diretamente de han+fu sem precisar montar uma mão.
 */
export function calcularHanFu(
  han: number,
  fu: number,
  config: ConfiguracaoCalculo,
): { tsumoOya: number; tsumoKo: number; ronOya: number; ronKo: number } {
  const { base } = calcularPatamarHanFu(han, fu, config)
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
