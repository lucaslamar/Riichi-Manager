import type { VentoMesa } from './tipos'

export const VENTOS: VentoMesa[] = [
  { codigo: 'leste', kanji: '東', chaveNome: 'windDraw.east' },
  { codigo: 'sul', kanji: '南', chaveNome: 'windDraw.south' },
  { codigo: 'oeste', kanji: '西', chaveNome: 'windDraw.west' },
  { codigo: 'norte', kanji: '北', chaveNome: 'windDraw.north' },
]

export function sortearVento(ventosDisponiveis: VentoMesa[]): VentoMesa | null {
  if (ventosDisponiveis.length === 0) return null
  if (ventosDisponiveis.length === 1) return ventosDisponiveis[0]
  const indice = Math.floor(Math.random() * ventosDisponiveis.length)
  return ventosDisponiveis[indice]
}
