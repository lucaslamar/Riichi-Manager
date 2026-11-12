import { useSyncExternalStore } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'

/**
 * "Este sou eu": o jogador deste aparelho, que fica em evidência no Ranking e no
 * seletor. Só deste aparelho (não vai no backup): no celular de outra pessoa, o
 * "eu" é outro.
 */
const CHAVE_EU = 'riichi-manager-eu'
const ouvintes = new Set<() => void>()

function lerEu(): string | null {
  return armazenamentoLocal.ler(CHAVE_EU) || null
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export function definirEu(jogadorId: string | null) {
  if (jogadorId) armazenamentoLocal.gravar(CHAVE_EU, jogadorId)
  else armazenamentoLocal.remover?.(CHAVE_EU)
  ouvintes.forEach((avisar) => avisar())
}

export function useEu() {
  const euId = useSyncExternalStore(assinar, lerEu)
  return { euId, definirEu }
}
