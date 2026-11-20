import { useSyncExternalStore } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import type { TorneioMcr } from '../logica/torneio'
import { carregarTorneiosMcr, salvarTorneiosMcr } from '../persistencia/repositorioTorneiosMcr'

let torneios: TorneioMcr[] | null = null
const ouvintes = new Set<() => void>()

export function lerTorneiosMcr() {
  torneios ??= carregarTorneiosMcr(armazenamentoLocal)
  return torneios
}

function definir(proximos: TorneioMcr[]) {
  torneios = proximos
  salvarTorneiosMcr(armazenamentoLocal, proximos)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export const acoesTorneiosMcr = {
  criar: (torneio: TorneioMcr) => definir([torneio, ...lerTorneiosMcr()]),
  atualizar: (id: string, transformar: (torneio: TorneioMcr) => TorneioMcr) =>
    definir(
      lerTorneiosMcr().map((torneio) => (torneio.id === id ? transformar(torneio) : torneio)),
    ),
  excluir: (id: string) => definir(lerTorneiosMcr().filter((torneio) => torneio.id !== id)),
}

export function useTorneiosMcr() {
  return useSyncExternalStore(assinar, lerTorneiosMcr)
}
