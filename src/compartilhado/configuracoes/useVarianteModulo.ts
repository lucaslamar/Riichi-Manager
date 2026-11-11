import { useState } from 'react'
import type { Variante } from '@/compartilhado/mahjong/variante'

export type ModuloVariante = 'calculadora-mao' | 'han-fu' | 'partida' | 'torneio' | 'ranking' | 'registro'

/**
 * Variante escolhida na tela. Sempre começa em `yonma` (4 jogadores): o Sanma é
 * escolhido de propósito, a cada vez, e não fica lembrado entre aberturas.
 */
export function useVarianteModulo(_modulo: ModuloVariante): [Variante, (variante: Variante) => void] {
  return useState<Variante>('yonma')
}
