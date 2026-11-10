import type { Variante } from './tipos'

export type VentoLetra = 'E' | 'S' | 'W' | 'N'

export function ventosDaVariante(variante: Variante): VentoLetra[] {
  return variante === 'sanma' ? ['E', 'S', 'W'] : ['E', 'S', 'W', 'N']
}
