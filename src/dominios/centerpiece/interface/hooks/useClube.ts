import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { configDoPreset } from '../../logica/configMesa'
import { marcarMesaRegistrada, type MesaDoSorteio, type SorteioClube } from '../../logica/encontroClube'
import { PREFIXO_CONVIDADO, type EntradaLista } from '../../logica/listaClube'
import { sortearMesas } from '../../logica/sorteioClube'
import { carregarClube, salvarClube, type EstadoClube } from '../../persistencia/repositorioClube'

/** Lista do clube, último sorteio e encontros: um estado só, salvo a cada mudança. */
let estado: EstadoClube | null = null
const ouvintes = new Set<() => void>()

function lerEstado() {
  estado ??= carregarClube(armazenamentoLocal)
  return estado
}

function definir(proximo: EstadoClube) {
  estado = proximo
  salvarClube(armazenamentoLocal, proximo)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

/** Ids e nomes dos 4 assentos; quem não tem cadastro ganha um id de convidado. */
export function assentosDaMesa(mesa: MesaDoSorteio) {
  const ids = mesa.assentos.map(
    ({ jogador }) => jogador.jogadorId ?? `${PREFIXO_CONVIDADO}${gerarId()}`,
  ) as unknown as readonly [string, string, string, string]
  return { ids, nomes: mesa.assentos.map(({ jogador }) => jogador.nome) }
}

/** Regras padrão de clube: Leste, sem abortivos, sem prorrogação, timer de 1 minuto. */
export const configDoClube = () => configDoPreset('padrao')

export const acoesClube = {
  definirLista(lista: string) {
    const atual = lerEstado()
    if (atual.lista !== lista) definir({ ...atual, lista })
  },
  /** Novo encontro com a lista dada; devolve false se a conta de mesas não fecha. */
  sortear(jogadores: EntradaLista[]): boolean {
    const resultado = sortearMesas(jogadores)
    if (!resultado.ok) return false
    const atual = lerEstado()
    const encontro = { id: gerarId(), criadoEm: new Date().toISOString(), jogadores }
    const sorteio: SorteioClube = { encontro, mesas: resultado.mesas }
    // Encontro que não chegou a começar nenhuma mesa não precisa ficar guardado.
    const anterior = atual.sorteio
    const encontros = atual.encontros.filter(
      (item) => !(anterior && item.id === anterior.encontro.id && anterior.mesas.every((mesa) => !mesa.partidaId)),
    )
    definir({ ...atual, sorteio, encontros: [...encontros, encontro] })
    return true
  },
  /** "Novo sorteio" de um encontro: mesma lista, próxima rodada. */
  sortearDeNovo(encontroId: string): boolean {
    const encontro = lerEstado().encontros.find((item) => item.id === encontroId)
    return encontro ? acoesClube.sortear(encontro.jogadores) : false
  },
  limpar() {
    definir({ ...lerEstado(), lista: '', sorteio: null })
  },
  /** A mesa já teve a partida registrada: o card mostra isso em vez do botão. */
  marcarRegistrada(numero: number, partidaId: string) {
    const atual = lerEstado()
    if (atual.sorteio) definir({ ...atual, sorteio: marcarMesaRegistrada(atual.sorteio, numero, partidaId) })
  },
}

export function useClube() {
  const atual = useSyncExternalStore(assinar, lerEstado)
  return { ...atual, ...acoesClube }
}
