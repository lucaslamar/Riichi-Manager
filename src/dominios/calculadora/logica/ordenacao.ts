import type { CodigoPedra, Mao, Meld } from './tipos'

// ─── Ordenação ────────────────────────────────────────────────────────────────

const ORDEM_NAIPE: Record<string, number> = { m: 0, p: 1, s: 2, z: 3 }

export function ordenarPedras(pedras: CodigoPedra[]): CodigoPedra[] {
  const valorOrdenacao = (pedra: CodigoPedra) => (pedra[0] === '0' ? 5 : Number(pedra[0]) || 4.9)
  return pedras.sort(
    (a, b) =>
      (ORDEM_NAIPE[a[1]] ?? 9) - (ORDEM_NAIPE[b[1]] ?? 9) || valorOrdenacao(a) - valorOrdenacao(b),
  )
}

export function ordenarMelds(melds: Meld[]): Meld[] {
  return melds.sort(
    (a, b) =>
      (ORDEM_NAIPE[a.pedras[0]?.[1] ?? ''] ?? 9) - (ORDEM_NAIPE[b.pedras[0]?.[1] ?? ''] ?? 9),
  )
}

/**
 * Conta o total de pedras da mão para fins de exibição.
 * Kans têm 4 pedras físicas mas só ocupam 3 "slots" na estrutura de 14.
 */
export function contarPedrasTotais(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  return mao.pedras.length + mao.melds.reduce((soma, meld) => soma + meld.pedras.length, 0)
}

/**
 * Conta os "slots" lógicos ocupados — kans ocupam 3 slots (como trinca),
 * mas têm 4 pedras físicas. Usado para saber se a mão está completa (14 slots).
 *
 * Estrutura de uma mão completa:
 *   - Normal: 4 grupos×3 + 1 par = 14 pedras
 *   - Com 1 kan: 3 grupos×3 + 1 kan×4 + 1 par = 15 pedras físicas, mas 14 slots
 *   - Com 4 kans: 4 kans×4 + 1 par = 18 pedras físicas, mas 14 slots
 *
 * @param mao - Estado da mão.
 * @returns Número de slots lógicos (meta = 14).
 */
export function contarSlotsLogicos(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  const slotsEmMelds = mao.melds.reduce((soma, meld) => {
    // Kan tem 4 pedras físicas mas ocupa 3 slots (como uma trinca)
    const ehKan = meld.tipo === 'kanAberto' || meld.tipo === 'kanFechado'
    return soma + (ehKan ? 3 : meld.pedras.length)
  }, 0)
  return mao.pedras.length + slotsEmMelds
}

/**
 * Conta quantas pedras físicas ainda cabem na mão.
 * Leva em conta que kans adicionam 4 pedras físicas por 3 slots.
 *
 * @param mao - Estado da mão.
 * @returns Número de pedras que ainda podem ser adicionadas à mão.
 */
export function pedrasFisicasRestantes(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  const slotsLivres = 14 - contarSlotsLogicos(mao)
  return slotsLivres // 1 slot = 1 pedra na mão (melds já foram contados)
}
