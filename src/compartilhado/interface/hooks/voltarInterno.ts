import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * Tela interna (ex.: Ranking do torneio, aberto dentro da tela do torneio) que quer
 * voltar pelo deslize: enquanto está aberta, deslizar para qualquer lado chama o
 * voltar dela, em vez de sair da tela de cima.
 */
let atual: (() => void) | null = null
const ouvintes = new Set<() => void>()

function definir(voltar: (() => void) | null) {
  atual = voltar
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

/**
 * Quem abre a tela interna: deslizar volta por ela. Registra uma vez só, ao abrir,
 * e sempre chama o voltar mais novo (pela ref). Registrar a cada render fazia a
 * tela de cima redesenhar, a interna registrar de novo e assim sem parar.
 */
export function useVoltarPorDeslize(voltar: () => void) {
  const ref = useRef(voltar)
  ref.current = voltar
  useEffect(() => {
    const chamar = () => ref.current()
    definir(chamar)
    return () => {
      if (atual === chamar) definir(null)
    }
  }, [])
}

/** O voltar da tela interna aberta agora, ou null. */
export function useVoltarInterno() {
  return useSyncExternalStore(assinar, () => atual, () => null)
}
