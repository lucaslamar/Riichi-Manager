import { useSyncExternalStore } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import type { PlacarMcr } from '../logica/placar'
import { carregarPlacaresMcr, salvarPlacaresMcr } from '../persistencia/repositorioPlacaresMcr'

let placares: PlacarMcr[] | null = null
const ouvintes = new Set<() => void>()

export function lerPlacaresMcr() {
  placares ??= carregarPlacaresMcr(armazenamentoLocal)
  return placares
}

function definir(proximos: PlacarMcr[]) {
  placares = proximos
  salvarPlacaresMcr(armazenamentoLocal, proximos)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export const acoesPlacaresMcr = {
  criar: (placar: PlacarMcr) => definir([placar, ...lerPlacaresMcr()]),
  atualizar: (id: string, transformar: (placar: PlacarMcr) => PlacarMcr) =>
    definir(lerPlacaresMcr().map((placar) => (placar.id === id ? transformar(placar) : placar))),
  excluir: (id: string) => definir(lerPlacaresMcr().filter((placar) => placar.id !== id)),
}

export function usePlacaresMcr() {
  return useSyncExternalStore(assinar, lerPlacaresMcr)
}
