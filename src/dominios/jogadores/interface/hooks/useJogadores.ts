import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import {
  adicionarJogador,
  definirArquivado,
  definirFavorito,
  editarJogador,
  garantirPorNomes,
  removerJogador,
  tirarPreCadastrados,
  type DadosJogador,
  type Jogador,
  type ResultadoJogador,
} from '../../logica/jogadores'
import { carregarJogadores, salvarJogadores } from '../../persistencia/repositorioJogadores'
import { lerPartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { lerTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'

/**
 * Cadastro único para o app inteiro: um jogador criado no SeletorJogador já
 * aparece em qualquer outra tela aberta.
 */
let cadastro: Jogador[] | null = null
const ouvintes = new Set<() => void>()

function lerCadastro() {
  cadastro ??= carregarJogadores(armazenamentoLocal)
  return cadastro
}

function definirCadastro(proximo: Jogador[]) {
  cadastro = proximo
  salvarJogadores(armazenamentoLocal, proximo)
  ouvintes.forEach((avisar) => avisar())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function aplicar(resultado: ResultadoJogador) {
  if (resultado.ok) definirCadastro(resultado.jogadores)
  return resultado
}

export const acoesJogadores = {
  adicionar: (dados: DadosJogador) => {
    const resultado = adicionarJogador(lerCadastro(), dados, gerarId(), new Date().toISOString())
    if (!resultado.ok) return resultado
    // O primeiro jogador real tira os pré-cadastrados que nunca jogaram.
    return aplicar({ ...resultado, jogadores: tirarPreCadastrados(resultado.jogadores, idsEmUso()) })
  },
  editar: (id: string, dados: DadosJogador) => aplicar(editarJogador(lerCadastro(), id, dados)),
  arquivar: (id: string) => definirCadastro(definirArquivado(lerCadastro(), id, true)),
  restaurar: (id: string) => definirCadastro(definirArquivado(lerCadastro(), id, false)),
  favoritar: (id: string, favorito: boolean) => definirCadastro(definirFavorito(lerCadastro(), id, favorito)),
  excluir: (id: string) => definirCadastro(removerJogador(lerCadastro(), id)),
  /** Desfazer da exclusão: o jogador volta como estava. */
  devolver: (jogador: Jogador) => definirCadastro([...lerCadastro(), jogador]),
  /** Importação: entra quem ainda não existe aqui (pelo id). */
  incluir: (novos: readonly Jogador[]) => {
    const atual = lerCadastro()
    const faltam = novos.filter((novo) => !atual.some((jogador) => jogador.id === novo.id))
    if (faltam.length) definirCadastro([...atual, ...faltam])
  },
}

/** Quem aparece em alguma partida ou torneio: esses não somem com os pré-cadastrados. */
function idsEmUso(): Set<string> {
  const ids = new Set<string>()
  for (const partida of lerPartidas()) {
    for (const assento of Object.values(partida.assentos)) ids.add(assento.jogadorId)
  }
  for (const torneio of lerTorneios().torneios) torneio.jogadorIds.forEach((id) => ids.add(id))
  return ids
}

/** Ids de uma lista de nomes, cadastrando quem faltar. Usado pelas migrações. */
export function garantirJogadoresPorNomes(nomes: string[]) {
  const atual = lerCadastro()
  const resultado = garantirPorNomes(atual, nomes, gerarId, new Date().toISOString())
  if (resultado.jogadores !== atual) definirCadastro(resultado.jogadores)
  return resultado.ids
}

export function useJogadores() {
  const jogadores = useSyncExternalStore(assinar, lerCadastro)
  return { jogadores, ...acoesJogadores }
}
