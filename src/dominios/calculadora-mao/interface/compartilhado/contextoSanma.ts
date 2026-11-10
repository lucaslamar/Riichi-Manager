import { createContext, useContext } from 'react'
import type { MaoSanma } from '../../logica/tipos'

/**
 * Sanma da mão em montagem (`mao.sanma`), para os componentes da calculadora
 * esconderem o que não existe com 3 jogadores. `null` = yonma, tudo como sempre.
 */
export const ContextoSanmaMao = createContext<MaoSanma | null>(null)

export function useSanmaMao(): MaoSanma | null {
  return useContext(ContextoSanmaMao)
}
