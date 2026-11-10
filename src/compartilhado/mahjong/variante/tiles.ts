import type { Variante } from './tipos'

const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Pedras (código mpsz, sem vermelhas) que existem na variante. */
export function tilesDaVariante(variante: Variante): string[] {
  const manzu = variante === 'sanma' ? [1, 9] : NUMEROS
  return [
    ...manzu.map((numero) => `${numero}m`),
    ...NUMEROS.map((numero) => `${numero}p`),
    ...NUMEROS.map((numero) => `${numero}s`),
    ...[1, 2, 3, 4, 5, 6, 7].map((numero) => `${numero}z`),
  ]
}

/** Aceita código mpsz (`5m`, `0p`). No Sanma, 2m–8m (e o 5m vermelho) não existem. */
export function tileExisteNaVariante(codigo: string, variante: Variante): boolean {
  if (variante === 'yonma' || codigo[1] !== 'm') return true
  return codigo[0] === '1' || codigo[0] === '9'
}

/** Naipes com 5 vermelho na variante. */
export function akaDaVariante(variante: Variante): ('m' | 'p' | 's')[] {
  return variante === 'sanma' ? ['p', 's'] : ['m', 'p', 's']
}
