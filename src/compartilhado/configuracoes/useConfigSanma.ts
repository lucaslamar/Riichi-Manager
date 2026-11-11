import { useCallback, useSyncExternalStore } from 'react'
import { localStorageDireto } from '@/compartilhado/persistencia/armazenamento'
import {
  normalizarRegrasSanma,
  REGRAS_SANMA_PADRAO,
  type RegrasSanma,
} from '@/compartilhado/mahjong/variante'

export const CHAVE_SANMA = 'mojoca:sanma'

interface ConfigSanma {
  regras: RegrasSanma
}

const ouvintes = new Set<() => void>()
let atual: ConfigSanma | null = null

function ler(): ConfigSanma {
  try {
    const salvo = JSON.parse(localStorageDireto.ler(CHAVE_SANMA) ?? 'null') as Partial<ConfigSanma> | null
    return { regras: normalizarRegrasSanma(salvo?.regras) }
  } catch {
    return { regras: { ...REGRAS_SANMA_PADRAO } }
  }
}

/** Config de Sanma de agora, fora do React (lógica, telas que só leem uma vez). */
export function lerConfigSanma(): ConfigSanma {
  atual ??= ler()
  return atual
}

function gravar(nova: ConfigSanma) {
  atual = nova
  localStorageDireto.gravar(CHAVE_SANMA, JSON.stringify(nova))
  for (const ouvinte of ouvintes) ouvinte()
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  const aoMudarOutraAba = (evento: StorageEvent) => {
    if (evento.key !== CHAVE_SANMA) return
    atual = ler()
    ouvinte()
  }
  window.addEventListener('storage', aoMudarOutraAba)
  return () => {
    ouvintes.delete(ouvinte)
    window.removeEventListener('storage', aoMudarOutraAba)
  }
}

/**
 * Regras de Sanma (as mesmas em todos os módulos), guardadas em
 * `mojoca:sanma`. Vale na hora em todas as telas abertas.
 */
export function useConfigSanma() {
  const config = useSyncExternalStore(inscrever, lerConfigSanma, lerConfigSanma)
  const setRegrasSanma = useCallback((regras: RegrasSanma) => {
    gravar({ ...lerConfigSanma(), regras: normalizarRegrasSanma(regras) })
  }, [])
  return {
    regrasSanma: config.regras,
    setRegrasSanma,
  }
}
