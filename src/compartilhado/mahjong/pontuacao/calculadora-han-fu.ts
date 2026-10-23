import type { ConfiguracaoCalculo } from './configuracao'
import type { PontosCalculados } from './resultado'

// ─── Calculadora rápida ───────────────────────────────────────────────────────

/** Pontos base de cada patamar: o ron do ko vale 4× a base e o do oya, 6×. */
export const BASE_PATAMAR = {
  mangan: 2000,
  haneman: 3000,
  baiman: 4000,
  sanbaiman: 6000,
  yakuman: 8000,
} as const

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

  if (config.kazoeYakuman && han >= 13)
    return { base: BASE_PATAMAR.yakuman, nome: 'Kazoe Yakuman', yakuman: 1 }
  if (han >= 11) return { base: BASE_PATAMAR.sanbaiman, nome: 'Sanbaiman', yakuman: 0 }
  if (han >= 8) return { base: BASE_PATAMAR.baiman, nome: 'Baiman', yakuman: 0 }
  if (han >= 6) return { base: BASE_PATAMAR.haneman, nome: 'Haneman', yakuman: 0 }
  return { base: BASE_PATAMAR.mangan, nome: 'Mangan', yakuman: 0 }
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

/**
 * Soma o honba depois dos limites (mangan+) e fora do multiplicador do dealer.
 * `valorHonba` é quanto cada honba vale no Ron (300, ou 1500 no Basengo); no
 * Tsumo cada pagador paga um terço.
 */
export function aplicarHonba(
  pontos: PontosCalculados,
  honba: number,
  valorHonba = 300,
): PontosCalculados {
  const honbaValida = Number.isFinite(honba) ? honba : 0
  if (pontos.agari === null || honbaValida <= 0) return pontos

  const bonusRon = honbaValida * valorHonba
  const bonusTsumo = honbaValida * (valorHonba / 3)

  if (pontos.agari === 'ron') {
    return {
      agari: 'ron',
      pontos: {
        total: pontos.pontos.total + bonusRon,
        oya: { ron: pontos.pontos.oya.ron + bonusRon },
        ko: { ron: pontos.pontos.ko.ron + bonusRon },
      },
    }
  }

  return {
    agari: 'tsumo',
    pontos: {
      total: pontos.pontos.total + bonusTsumo * 3,
      oya: { ko: pontos.pontos.oya.ko + bonusTsumo },
      ko: {
        oya: pontos.pontos.ko.oya + bonusTsumo,
        ko: pontos.pontos.ko.ko + bonusTsumo,
      },
    },
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
