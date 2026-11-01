import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import {
  acoesPartidas,
  lerPartidas,
} from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { corrigirPontosFinais } from '@/dominios/centerpiece/logica/partida'
import { garantirJogadoresPorNomes } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomesPreenchidos } from '../../logica/blocoNotas'
import { migrarTorneioAntigo } from '../../logica/migrarTorneioAntigo'
import { pausarTorneio } from '../../logica/pausarTorneio'
import type { RascunhoTorneio, Torneio } from '../../logica/tipos'
import {
  avancarSeRodadaCompleta,
  criarPartidaDaMesa,
  criarPartidaManual,
  criarTorneio,
  guardarPartida,
  partidaDaMesa,
  rascunhoInicial,
  reabrirPartida,
} from '../../logica/torneio'
import {
  carregarTorneios,
  CHAVE_TORNEIO_ANTIGO,
  salvarTorneios,
  type DadosTorneios,
} from '../../persistencia/repositorioTorneios'

/** Torneios e rascunho, salvos a cada mudança. */
let dados: DadosTorneios | null = null
const ouvintes = new Set<() => void>()

function agoraIso() {
  return new Date().toISOString()
}

/**
 * Primeira leitura. Sem nada salvo, migra o torneio antigo, cuja chave fica intacta
 * como cópia. Chamada ao abrir o módulo, antes de qualquer tela assinar as listas.
 */
export function carregarTorneiosSeNecessario() {
  if (dados) return dados
  const salvos = carregarTorneios(armazenamentoLocal, Date.now())
  if (salvos) {
    dados = salvos
    return dados
  }
  const migrado = migrarTorneioAntigo(
    armazenamentoLocal.ler(CHAVE_TORNEIO_ANTIGO),
    garantirJogadoresPorNomes,
    { gerarId, agora: agoraIso() },
  )
  dados = { torneios: migrado ? [migrado.torneio] : [], rascunho: null }
  if (migrado) migrado.partidas.forEach(acoesPartidas.adicionar)
  salvarTorneios(armazenamentoLocal, dados)
  return dados
}

function definir(proximo: DadosTorneios) {
  dados = proximo
  salvarTorneios(armazenamentoLocal, proximo)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function torneioAtivo(lista: readonly Torneio[]) {
  return lista.find((torneio) => torneio.status === 'em_andamento')
}

function atualizarTorneio(id: string, transformar: (torneio: Torneio) => Torneio) {
  const atual = carregarTorneiosSeNecessario()
  definir({
    ...atual,
    torneios: atual.torneios.map((torneio) => (torneio.id === id ? transformar(torneio) : torneio)),
  })
}

const acoes = {
  atualizarTorneio,
  iniciarRascunho() {
    const atual = carregarTorneiosSeNecessario()
    if (!atual.rascunho) definir({ ...atual, rascunho: rascunhoInicial() })
  },
  mudarRascunho(mudanca: Partial<RascunhoTorneio>) {
    const atual = carregarTorneiosSeNecessario()
    definir({ ...atual, rascunho: { ...(atual.rascunho ?? rascunhoInicial()), ...mudanca } })
  },
  /** Cadastra quem falta, troca nomes por ids e começa o torneio. */
  comecarTorneio() {
    const atual = carregarTorneiosSeNecessario()
    if (!atual.rascunho) return
    const nomes = nomesPreenchidos(atual.rascunho.linhas)
    const torneio = criarTorneio(atual.rascunho, nomes, garantirJogadoresPorNomes(nomes), {
      id: gerarId(),
      agora: agoraIso(),
    })
    if (torneio) definir({ torneios: [...atual.torneios, torneio], rascunho: null })
  },
  encerrar(id: string) {
    atualizarTorneio(id, (torneio) => ({ ...pausarTorneio(torneio, Date.now()), status: 'encerrado' }))
  },
  /** Cria (ou retoma) a partida da mesa e devolve o id dela. */
  abrirMesa(torneio: Torneio, rodada: number, mesa: number) {
    const existente = partidaDaMesa(lerPartidas(), torneio.id, rodada, mesa)
    if (existente) return existente.id
    const partida = criarPartidaDaMesa(torneio, rodada, mesa, { id: gerarId(), agora: agoraIso() })
    acoesPartidas.adicionar(partida)
    return partida.id
  },
  /** Confere os pontos e guarda: vale tanto para mesa jogada quanto para o papel. */
  guardarMesa(
    torneio: Torneio,
    rodada: number,
    mesa: number,
    pontos: readonly [number, number, number, number],
  ) {
    const existente = partidaDaMesa(lerPartidas(), torneio.id, rodada, mesa)
    if (existente) {
      acoesPartidas.atualizar(existente.id, (partida) =>
        guardarPartida(corrigirPontosFinais(partida, pontos, agoraIso())),
      )
    } else {
      acoesPartidas.adicionar(
        guardarPartida(
          criarPartidaManual(torneio, rodada, mesa, pontos, { id: gerarId(), agora: agoraIso() }),
        ),
      )
    }
    atualizarTorneio(torneio.id, (atual) => avancarSeRodadaCompleta(atual, lerPartidas()))
  },
  reabrirMesa(torneio: Torneio, rodada: number, mesa: number) {
    const existente = partidaDaMesa(lerPartidas(), torneio.id, rodada, mesa)
    if (existente) acoesPartidas.atualizar(existente.id, reabrirPartida)
  },
}

export function useTorneios() {
  const atual = useSyncExternalStore(assinar, carregarTorneiosSeNecessario)
  return {
    torneios: atual.torneios,
    rascunho: atual.rascunho,
    ativo: torneioAtivo(atual.torneios),
    ...acoes,
  }
}
