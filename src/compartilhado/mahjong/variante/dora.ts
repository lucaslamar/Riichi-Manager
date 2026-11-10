import type { Variante } from './tipos'

/**
 * Dora apontada pelo indicador (código mpsz, `0` = 5 vermelho). Ventos seguem
 * E→S→W→N→E e dragões, branco→verde→vermelho. No Sanma, 1m aponta 9m e 9m aponta 1m.
 */
export function proximaDora(indicador: string, variante: Variante): string {
  const base = indicador[0] === '0' ? `5${indicador[1]}` : indicador
  const valor = Number(base[0])
  const naipe = base[1]
  if (variante === 'sanma' && naipe === 'm') return valor === 1 ? '9m' : '1m'
  if (naipe === 'm' || naipe === 'p' || naipe === 's') return `${valor === 9 ? 1 : valor + 1}${naipe}`
  if (valor <= 4) return `${valor === 4 ? 1 : valor + 1}z`
  return `${valor === 7 ? 5 : valor + 1}z`
}

/**
 * Dora vinda do Kita: cada Norte retirado vale 1 (nukidora) mais 1 para cada
 * indicador que aponta o Norte (indicador Oeste, `3z`).
 */
export function dorasDoKita(kita: number, indicadores: readonly string[]): number {
  if (kita <= 0) return 0
  const apontamNorte = indicadores.filter((indicador) => indicador === '3z').length
  return kita * (1 + apontamNorte)
}
