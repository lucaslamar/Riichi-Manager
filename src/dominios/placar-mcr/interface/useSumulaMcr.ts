import { useCallback, useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import type { RascunhoSumula } from '../logica/sumula'
import { carregarSumulaMcr, salvarSumulaMcr } from '../persistencia/repositorioSumulaMcr'

/** A súmula do Registrar partida finalizada, gravada a cada mudança. */
export function useSumulaMcr() {
  const [sumula, setSumula] = useState(() => carregarSumulaMcr(armazenamentoLocal))
  const mudar = useCallback((proxima: RascunhoSumula) => {
    setSumula(proxima)
    salvarSumulaMcr(armazenamentoLocal, proxima)
  }, [])
  return [sumula, mudar] as const
}
