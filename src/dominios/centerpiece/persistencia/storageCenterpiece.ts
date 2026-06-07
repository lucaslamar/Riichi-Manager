import type {
  EstadoCenterpiece,
  JogadorCenterpiece,
  PosicaoMesa,
  SnapshotCenterpiece,
} from '../logica/tipos'
import { criarMesaVazia } from '../logica/criarMesa'

const CHAVE_STORAGE = 'riichi-manager-centerpiece'

/**
 * Versão do esquema de dados.
 * Incrementar quando o formato do estado mudar de forma incompatível.
 * Isso força a limpeza de estados antigos que podem ter posicao baseada em vento.
 */
const SCHEMA_VERSION = 3

const POSICOES_MESA: PosicaoMesa[] = ['topo', 'direita', 'baixo', 'esquerda']

/** Orientação inicial correta dos assentos vista na tela. */
const POSICAO_CANONICA_POR_VENTO: Record<string, PosicaoMesa> = {
  leste: 'esquerda',
  sul: 'baixo',
  oeste: 'direita',
  norte: 'topo',
}

function migrarJogadores(
  jogadores: JogadorCenterpiece[] | undefined,
  corrigirOrientacao: boolean,
): JogadorCenterpiece[] {
  if (!Array.isArray(jogadores)) return []

  return jogadores.map((jogador, indice) => {
    const posicaoValida = POSICOES_MESA.includes(jogador.posicao)
    if (corrigirOrientacao) {
      return {
        ...jogador,
        posicao: POSICAO_CANONICA_POR_VENTO[jogador.vento] ?? jogador.posicao,
      }
    }

    if (posicaoValida) {
      return jogador
    }

    return {
      ...jogador,
      posicao: POSICOES_MESA[indice] ?? 'topo',
    }
  })
}

function migrarHistorico(
  historico: SnapshotCenterpiece[] | undefined,
  corrigirOrientacao: boolean,
): SnapshotCenterpiece[] {
  if (!Array.isArray(historico)) return []
  return historico.map((snapshot) => ({
    ...snapshot,
    jogadores: migrarJogadores(snapshot.jogadores, corrigirOrientacao),
  }))
}

export function carregarMesa(): EstadoCenterpiece {
  const salvo = window.localStorage.getItem(CHAVE_STORAGE)
  if (!salvo) return criarMesaVazia()

  try {
    const lido = JSON.parse(salvo) as Partial<EstadoCenterpiece> & { _schemaVersion?: number }

    const versaoSalva = lido._schemaVersion ?? 1

    if (versaoSalva < 2) {
      window.localStorage.removeItem(CHAVE_STORAGE)
      return criarMesaVazia()
    }

    const corrigirOrientacao = versaoSalva < SCHEMA_VERSION
    const base = criarMesaVazia()
    return {
      ...base,
      ...lido,
      jogadores: migrarJogadores(lido.jogadores, corrigirOrientacao),
      historico: migrarHistorico(lido.historico, corrigirOrientacao),
    }
  } catch {
    return criarMesaVazia()
  }
}

export function salvarMesa(estado: EstadoCenterpiece): void {
  const comVersao = { ...estado, _schemaVersion: SCHEMA_VERSION }
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(comVersao))
}

export function temMesaAtiva(): boolean {
  return carregarMesa().iniciada
}

export function apagarMesaSalva(): void {
  window.localStorage.removeItem(CHAVE_STORAGE)
}
