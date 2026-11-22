import { useSyncExternalStore } from 'react'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import {
  comecarDiaDoZero,
  marcarMesaRegistrada,
  mesasParaGuardar,
  rodadasDoDia,
  sortearDoDia,
  type EncontroClube,
  type MesaDoSorteio,
  type SorteioClube,
} from '../../logica/encontroClube'
import { PREFIXO_CONVIDADO, type EntradaLista } from '../../logica/listaClube'
import { lerPlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { lerPartidas } from './usePartidas'
import { carregarClube, salvarClube, type EstadoClube } from '../../persistencia/repositorioClube'

/** Ids e nomes dos 4 assentos; quem não tem cadastro ganha um id de convidado. */
export function assentosDaMesa(mesa: MesaDoSorteio) {
  const ids = mesa.assentos.map(
    ({ jogador }) => jogador.jogadorId ?? `${PREFIXO_CONVIDADO}${gerarId()}`,
  ) as unknown as readonly [string, string, string, string]
  return { ids, nomes: mesa.assentos.map(({ jogador }) => jogador.nome) }
}
/**
 * Lista do clube, último sorteio e encontros: um estado só, salvo a cada mudança.
 * Cada modo de jogo tem o seu (o do MCR em chaves com '-mcr'), com as jogadas
 * dele: partidas no Riichi, placares no MCR.
 */
function criarClube(sufixo: string, lerJogadas: () => readonly { encontro?: { id: string } }[]) {
  let estado: EstadoClube | null = null
  const ouvintes = new Set<() => void>()

  function lerEstado() {
    estado ??= carregarClube(armazenamentoLocal, sufixo)
    return estado
  }

  function definir(proximo: EstadoClube) {
    estado = proximo
    salvarClube(armazenamentoLocal, proximo, sufixo)
    ouvintes.forEach((avisar) => avisar())
  }

  function assinar(ouvinte: () => void) {
    ouvintes.add(ouvinte)
    return () => {
      ouvintes.delete(ouvinte)
    }
  }

  const acoesClube = {
    definirLista(lista: string) {
      const atual = lerEstado()
      if (atual.lista !== lista) definir({ ...atual, lista })
    },
    /** Novo encontro com a lista dada; devolve false se a conta de mesas não fecha. */
    sortear(jogadores: EntradaLista[]): boolean {
      const atual = lerEstado()
      const jogadas = lerJogadas()
      const anterior = atual.sorteio
      // Encontro que não chegou a começar nenhuma mesa não precisa ficar guardado.
      const naoComecou =
        !!anterior &&
        anterior.mesas.every((mesa) => !mesa.partidaId) &&
        jogadas.every((jogada) => jogada.encontro?.id !== anterior.encontro.id)
      const agora = new Date()
      const anteriores = rodadasDoDia(atual.encontros, jogadas, agora, jogadores)
      const evitar = naoComecou && anterior ? mesasParaGuardar(anterior.mesas) : undefined
      const resultado = sortearDoDia(jogadores, anteriores, { evitar })
      if (!resultado.ok) return false
      const encontro = { id: gerarId(), criadoEm: agora.toISOString(), jogadores }
      const sorteio: SorteioClube = { encontro, mesas: resultado.mesas }
      const encontros = atual.encontros.filter((item) => !(naoComecou && item.id === anterior?.encontro.id))
      definir({
        ...atual,
        sorteio,
        encontros: [...encontros, { ...encontro, mesas: mesasParaGuardar(resultado.mesas) }],
      })
      return true
    },
    /** "Novo sorteio" de um encontro: mesma lista, próxima rodada. */
    sortearDeNovo(encontroId: string): boolean {
      const encontro = lerEstado().encontros.find((item) => item.id === encontroId)
      return encontro ? acoesClube.sortear(encontro.jogadores) : false
    },
    /** O próximo sorteio não considera quem já jogou junto hoje. */
    comecarDoZero() {
      const atual = lerEstado()
      definir({ ...atual, encontros: comecarDiaDoZero(atual.encontros, new Date()) })
    },
    limpar() {
      definir({ ...lerEstado(), lista: '', sorteio: null })
    },
    /**
     * Dados de teste (só em dev): troca os encontros com o `prefixo` no id pelos novos.
     * O sorteio atual vira o de teste, ou some se era de teste e não veio outro.
     */
    substituirTeste(
      prefixo: string,
      novos: { encontros: EncontroClube[]; sorteio: SorteioClube | null; lista?: string },
    ) {
      const atual = lerEstado()
      const sorteioAtualEhTeste = atual.sorteio?.encontro.id.startsWith(prefixo) ?? false
      definir({
        ...atual,
        lista: novos.lista ?? (sorteioAtualEhTeste ? '' : atual.lista),
        sorteio: novos.sorteio ?? (sorteioAtualEhTeste ? null : atual.sorteio),
        encontros: [
          ...atual.encontros.filter((item) => !item.id.startsWith(prefixo)),
          ...novos.encontros,
        ],
      })
    },
    /**
     * Aborta o encontro inteiro: o sorteio some e a lista volta para editar. As
     * partidas já registradas seguem no histórico. Sem nenhuma, o encontro some também.
     */
    abortarEncontro() {
      const atual = lerEstado()
      const sorteio = atual.sorteio
      if (!sorteio) return
      const semResultado = sorteio.mesas.every((mesa) => !mesa.partidaId)
      definir({
        ...atual,
        sorteio: null,
        encontros: semResultado
          ? atual.encontros.filter((item) => item.id !== sorteio.encontro.id)
          : atual.encontros,
      })
    },
    /** A mesa já teve a partida registrada: o card mostra isso em vez do botão. */
    marcarRegistrada(numero: number, partidaId: string) {
      const atual = lerEstado()
      if (atual.sorteio)
        definir({ ...atual, sorteio: marcarMesaRegistrada(atual.sorteio, numero, partidaId) })
    },
  }

  return { lerEstado, assinar, acoes: acoesClube }
}

const CLUBE_RIICHI = criarClube('', () => lerPartidas())
const CLUBE_MCR = criarClube('-mcr', () => lerPlacaresMcr())

export const acoesClube = CLUBE_RIICHI.acoes
export const acoesClubeMcr = CLUBE_MCR.acoes

export function useClube() {
  const clube = useModoJogoAtual() === 'mcr' ? CLUBE_MCR : CLUBE_RIICHI
  const atual = useSyncExternalStore(clube.assinar, clube.lerEstado)
  return { ...atual, ...clube.acoes }
}
