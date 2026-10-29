/**
 * @fileoverview Parser da notação compacta de mão (`2388m447p2458889s`).
 * Veio pronto com o componente `MahjongNotationInput`; a conversão para o
 * formato da calculadora fica em `notacao.ts`, não aqui.
 */

export type Suit = 'm' | 'p' | 's' | 'z'
export interface Tile {
  suit: Suit
  num: number // 1-9 (z: 1-7)
  red: boolean // 0 = cinco vermelho
}

/* ---------- Parser: "2388m447p2458889s" -> Tile[] ---------- */
export function parseHand(input: string): { tiles: Tile[]; error?: string } {
  const tiles: Tile[] = []
  let pending: string[] = []

  for (const ch of input.toLowerCase().replace(/\s/g, '')) {
    if (/[0-9]/.test(ch)) {
      pending.push(ch)
      continue
    }
    if ('mpsz'.includes(ch)) {
      if (!pending.length) return { tiles, error: `Naipe "${ch}" sem números antes` }
      for (const d of pending) {
        const n = Number(d)
        if (ch === 'z' && (n < 1 || n > 7))
          return { tiles, error: `${d}z não existe (honras vão de 1z a 7z)` }
        tiles.push({ suit: ch as Suit, num: n === 0 ? 5 : n, red: n === 0 })
      }
      pending = []
      continue
    }
    return { tiles, error: `Caractere inválido: "${ch}"` }
  }

  if (pending.length) return { tiles, error: 'Faltou o naipe no final (m, p, s ou z)' }

  const count = new Map<string, number>()
  for (const t of tiles) {
    const k = `${t.num}${t.suit}`
    const c = (count.get(k) ?? 0) + 1
    if (c > 4) return { tiles, error: `Mais de 4 peças ${k}` }
    count.set(k, c)
  }
  return { tiles }
}
