import { createContext, useContext } from 'react'

export interface AcoesAprender {
  /** Abre o guia na página do destino (ver DESTINO_GUIA) ou, sem destino, na capa. */
  abrir: (destino?: string) => void
  aberto: boolean
}

/** Liga as ajudas do app ao guia Aprender a jogar (montado no App). */
export const ContextoAprender = createContext<AcoesAprender | null>(null)

export function useAprender() {
  return useContext(ContextoAprender)
}
