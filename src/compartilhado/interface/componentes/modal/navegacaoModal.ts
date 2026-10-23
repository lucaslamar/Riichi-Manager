import { createContext, type ReactNode } from 'react'

/** Tela que entra deslizando de lado dentro de uma Modal (ex.: definição de um termo). */
export interface TelaModal {
  titulo: ReactNode
  conteudo: ReactNode
}

/**
 * Dentro de uma Modal, abre uma tela por cima do conteúdo atual, na mesma
 * modal, com botão de voltar. Fora de uma Modal é `null`.
 */
export const ContextoNavegacaoModal = createContext<((tela: TelaModal) => void) | null>(null)
