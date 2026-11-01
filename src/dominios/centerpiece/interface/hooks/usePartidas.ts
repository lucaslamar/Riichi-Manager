import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { garantirJogadoresPorNomes } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { criarPartida, type Partida } from '../../logica/partida'
import type { ConfigMesa } from '../../logica/configMesa'
import { carregarPartidas, salvarPartidas } from '../../persistencia/repositorioPartidas'

/** Lista única do app, salva a cada ação. */
let partidas: Partida[] | null = null
const ouvintes = new Set<() => void>()

function lerPartidas() {
  partidas ??= carregarPartidas(armazenamentoLocal, {
    idDoNome: garantirJogadoresPorNomes,
    gerarId,
    agora: Date.now(),
  })
  return partidas
}

function definirPartidas(proximas: Partida[]) {
  partidas = proximas
  salvarPartidas(armazenamentoLocal, proximas)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

const acoes = {
  criar(config: ConfigMesa, jogadorIds: readonly [string, string, string, string]) {
    const partida = criarPartida(gerarId(), config, jogadorIds, new Date().toISOString())
    definirPartidas([...lerPartidas(), partida])
    return partida.id
  },
  atualizar(id: string, transformar: (partida: Partida) => Partida) {
    const atuais = lerPartidas()
    const proximas = atuais.map((partida) => (partida.id === id ? transformar(partida) : partida))
    if (proximas.some((partida, indice) => partida !== atuais[indice])) definirPartidas(proximas)
  },
  descartar(id: string) {
    definirPartidas(lerPartidas().filter((partida) => partida.id !== id))
  },
}

export function usePartidas() {
  const lista = useSyncExternalStore(assinar, lerPartidas)
  return {
    partidas: lista,
    abertas: lista.filter((partida) => partida.status === 'em_andamento'),
    ...acoes,
  }
}
