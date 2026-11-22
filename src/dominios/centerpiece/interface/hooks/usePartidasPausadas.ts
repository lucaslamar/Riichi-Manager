import { useSyncExternalStore } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import type { PartidaPausada } from '../../logica/partidaPausada'
import {
  carregarPartidasPausadas,
  salvarPartidasPausadas,
} from '../../persistencia/repositorioPartidasPausadas'

/** Lista única das salvas para continuar, gravada a cada ação. */
let pausadas: PartidaPausada[] | null = null
const ouvintes = new Set<() => void>()

function ler() {
  pausadas ??= carregarPartidasPausadas(armazenamentoLocal)
  return pausadas
}

function definir(proximas: PartidaPausada[]) {
  pausadas = proximas
  salvarPartidasPausadas(armazenamentoLocal, proximas)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

const acoes = {
  /** O mesmo id substitui: salvar de novo não duplica. */
  salvar(partida: PartidaPausada) {
    definir([partida, ...ler().filter((item) => item.id !== partida.id)])
  },
  descartar(id: string) {
    definir(ler().filter((item) => item.id !== id))
  },
}

export function usePartidasPausadas() {
  return { pausadas: useSyncExternalStore(assinar, ler), ...acoes }
}
