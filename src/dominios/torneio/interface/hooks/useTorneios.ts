import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { acoesPartidas, lerPartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { garantirJogadoresPorNomes } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { finalizarTorneio } from '../../logica/torneio'
import type { ListaSalva, Torneio } from '../../logica/tipos'
import {
  carregarLista,
  carregarTorneios,
  salvarLista,
  salvarTorneios,
  type DadosTorneios,
} from '../../persistencia/repositorioTorneios'

/** Estado único do torneio, salvo a cada ação: um celular controla o torneio inteiro. */
let dados: DadosTorneios | null = null
/** Rascunho da Lista do torneio. */
let lista: string | null = null
const ouvintes = new Set<() => void>()

export function lerTorneios(): DadosTorneios {
  if (!dados) {
    const carga = carregarTorneios(armazenamentoLocal, {
      idDoNome: garantirJogadoresPorNomes,
      gerarId,
      agora: new Date(),
    })
    const { partidasNovas, ...resto } = carga
    dados = resto
    // Fora da leitura: avisar as partidas no meio de um render quebra o React.
    if (partidasNovas.length > 0) {
      queueMicrotask(() => {
        const existentes = new Set(lerPartidas().map((partida) => partida.id))
        partidasNovas
          .filter((partida) => !existentes.has(partida.id))
          .forEach((partida) => acoesPartidas.adicionar(partida))
      })
    }
  }
  return dados
}

function definir(proximos: DadosTorneios) {
  dados = proximos
  salvarTorneios(armazenamentoLocal, proximos)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function lerLista() {
  lista ??= carregarLista(armazenamentoLocal)
  return lista
}

export const acoesTorneios = {
  definirLista(texto: string) {
    lista = texto
    salvarLista(armazenamentoLocal, texto)
    ouvintes.forEach((avisar) => avisar())
  },
  /** Cartão de memória: guarda a lista atual com um nome (mesmo nome substitui). */
  guardarLista(nome: string, texto: string) {
    const atual = lerTorneios()
    const salva: ListaSalva = { id: gerarId(), nome: nome.trim(), texto, salvaEm: new Date().toISOString() }
    const outras = atual.listas.filter((item) => item.nome.trim().toLowerCase() !== salva.nome.toLowerCase())
    definir({ ...atual, listas: [salva, ...outras] })
  },
  excluirLista(id: string) {
    const atual = lerTorneios()
    definir({ ...atual, listas: atual.listas.filter((item) => item.id !== id) })
  },
  salvar(torneio: Torneio) {
    const atual = lerTorneios()
    const existe = atual.torneios.some((item) => item.id === torneio.id)
    const comData = { ...torneio, atualizadoEm: new Date().toISOString() }
    definir({
      ...atual,
      torneios: existe
        ? atual.torneios.map((item) => (item.id === torneio.id ? comData : item))
        : [...atual.torneios, comData],
    })
  },
  atualizar(id: string, transformar: (torneio: Torneio) => Torneio) {
    const torneio = lerTorneios().torneios.find((item) => item.id === id)
    if (torneio) acoesTorneios.salvar(transformar(torneio))
  },
  finalizar(id: string) {
    acoesTorneios.atualizar(id, (torneio) => finalizarTorneio(torneio, new Date().toISOString()))
  },
  excluir(id: string) {
    const atual = lerTorneios()
    definir({ ...atual, torneios: atual.torneios.filter((item) => item.id !== id) })
  },
}

export function useTorneios() {
  const estado = useSyncExternalStore(assinar, lerTorneios)
  const texto = useSyncExternalStore(assinar, lerLista)
  return { ...estado, lista: texto, ...acoesTorneios }
}
