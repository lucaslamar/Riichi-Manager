import { useSyncExternalStore } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import {
  adicionarJogador,
  definirArquivado,
  editarJogador,
  type DadosJogador,
  type Jogador,
  type ResultadoJogador,
} from '../../logica/jogadores'
import { carregarJogadores, salvarJogadores } from '../../persistencia/repositorioJogadores'

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

const acoes = {
  adicionar: (dados: DadosJogador) =>
    aplicar(adicionarJogador(lerCadastro(), dados, gerarId(), new Date().toISOString())),
  editar: (id: string, dados: DadosJogador) => aplicar(editarJogador(lerCadastro(), id, dados)),
  arquivar: (id: string) => definirCadastro(definirArquivado(lerCadastro(), id, true)),
  restaurar: (id: string) => definirCadastro(definirArquivado(lerCadastro(), id, false)),
}

export function useJogadores() {
  const jogadores = useSyncExternalStore(assinar, lerCadastro)
  return { jogadores, ...acoes }
}
