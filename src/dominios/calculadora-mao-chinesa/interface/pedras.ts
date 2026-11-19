import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/mao'
import { nomePedraAcessivel } from '@/dominios/calculadora-mao/interface/constantes'

/** Honras do motor (E S W N C F P) na notação das artes de pedra (1z a 7z). */
const HONRAS: Record<number, CodigoPedra> = { 28: '1z', 29: '2z', 30: '3z', 31: '4z', 32: '7z', 33: '6z', 34: '5z' }

export function codigoPedra(id: number): CodigoPedra {
  if (id <= 9) return `${id}m` as CodigoPedra
  if (id <= 18) return `${id - 9}s` as CodigoPedra
  if (id <= 27) return `${id - 18}p` as CodigoPedra
  return HONRAS[id]
}

export const nomePedra = (id: number) => nomePedraAcessivel(codigoPedra(id))
