import { useCallback, useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { SUMULA_VAZIA, type RascunhoSumula } from '../logica/sumula'
import {
  carregarSumulaMcr,
  carregarSumulaMesa,
  salvarSumulaMcr,
} from '../persistencia/repositorioSumulaMcr'

/**
 * A súmula do Registrar partida finalizada, gravada a cada mudança. Com `mesa`,
 * a daquela mesa sorteada, que começa por `inicial`.
 */
export function useSumulaMcr(mesa?: { chave: string; inicial: RascunhoSumula }) {
  const chave = mesa?.chave
  const [sumula, setSumula] = useState(() =>
    mesa
      ? (carregarSumulaMesa(armazenamentoLocal, mesa.chave) ?? mesa.inicial)
      : carregarSumulaMcr(armazenamentoLocal),
  )
  const mudar = useCallback(
    (proxima: RascunhoSumula) => {
      setSumula(proxima)
      salvarSumulaMcr(armazenamentoLocal, proxima, chave)
    },
    [chave],
  )
  /** Depois de registrar: a folha em branco. */
  const descartar = useCallback(() => {
    setSumula(SUMULA_VAZIA)
    salvarSumulaMcr(armazenamentoLocal, null, chave)
  }, [chave])
  return [sumula, mudar, descartar] as const
}
