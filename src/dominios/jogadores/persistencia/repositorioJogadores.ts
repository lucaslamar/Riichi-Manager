import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { JOGADORES_PADRAO, type Jogador } from '../logica/jogadores'

const CHAVE = 'riichi-manager-jogadores'
const VERSAO = 1

function ehJogador(valor: unknown): valor is Jogador {
  const jogador = valor as Jogador | null
  return (
    !!jogador &&
    typeof jogador.id === 'string' &&
    typeof jogador.nome === 'string' &&
    typeof jogador.arquivado === 'boolean'
  )
}

export function carregarJogadores(armazenamento: ArmazenamentoChaveValor): Jogador[] {
  const salvo = armazenamento.ler(CHAVE)
  // Nada salvo = primeiro uso. Depois de salvo, o padrão não volta sozinho.
  if (!salvo) return [...JOGADORES_PADRAO]
  try {
    const lido = JSON.parse(salvo) as { jogadores?: unknown }
    return Array.isArray(lido.jogadores) ? lido.jogadores.filter(ehJogador) : []
  } catch {
    return []
  }
}

export function salvarJogadores(armazenamento: ArmazenamentoChaveValor, jogadores: Jogador[]) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, jogadores }))
}
