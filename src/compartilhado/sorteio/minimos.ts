import type { JogadoresPorMesa } from './contagens'

/**
 * Mínimo de duplas repetidas por jogadores e rodadas, sem ninguém jogar 3 vezes junto.
 * Provado por busca exaustiva em 21 e 22/11/2026 (o de 16 é o plano afim de ordem 4).
 */
const MINIMO_REPETIDOS: Record<JogadoresPorMesa, Record<number, Record<number, number>>> = {
  4: {
    8: { 1: 0, 2: 4, 3: 12, 4: 24 },
    12: { 1: 0, 2: 3, 3: 9, 4: 18 },
    16: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  3: {
    6: { 1: 0, 2: 2, 3: 6, 4: 12 },
    9: { 1: 0, 2: 0, 3: 0, 4: 0 },
    12: { 1: 0, 2: 0, 3: 0, 4: 0 },
  },
}

/** null: o mínimo não é conhecido. */
export function minimoDeRepetidas(jogadores: number, rodadas: number, porMesa: JogadoresPorMesa): number | null {
  return MINIMO_REPETIDOS[porMesa][jogadores]?.[rodadas] ?? null
}
