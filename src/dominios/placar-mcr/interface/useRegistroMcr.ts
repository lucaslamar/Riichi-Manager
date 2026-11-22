import { useCallback, useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { REGISTRO_EM_BRANCO, type RascunhoRegistro } from '../logica/registroFinalizado'
import {
  carregarRegistroDaMesa,
  carregarRegistroMcr,
  salvarRegistroMcr,
} from '../persistencia/repositorioRegistroMcr'

/**
 * Os totais do Registrar partida finalizada, gravados a cada mudança. Com `mesa`,
 * os daquela mesa sorteada, que começam por `inicial`.
 */
export function useRegistroMcr(mesa?: { chave: string; inicial: RascunhoRegistro }) {
  const chave = mesa?.chave
  const [registro, setRegistro] = useState(() =>
    mesa
      ? (carregarRegistroDaMesa(armazenamentoLocal, mesa.chave) ?? mesa.inicial)
      : carregarRegistroMcr(armazenamentoLocal),
  )
  const mudar = useCallback(
    (proximo: RascunhoRegistro) => {
      setRegistro(proximo)
      salvarRegistroMcr(armazenamentoLocal, proximo, chave)
    },
    [chave],
  )
  /** Depois de registrar: tudo em branco. */
  const descartar = useCallback(() => {
    setRegistro(REGISTRO_EM_BRANCO)
    salvarRegistroMcr(armazenamentoLocal, null, chave)
  }, [chave])
  return [registro, mudar, descartar] as const
}
