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
const SCHEMA_VERSION = 2

const POSICOES_MESA: PosicaoMesa[] = ['topo', 'direita', 'baixo', 'esquerda']

/**
 * Mapeia um vento para a posicao que o código ANTIGO atribuía a ele.
 * Ventos não são posições — mas versões antigas podiam ter feito esse mapeamento.
 * Usado para detectar e corrigir estados legados.
 */
const POSICAO_LEGADA_POR_VENTO: Record<string, PosicaoMesa> = {
  leste:  'topo',
  sul:    'baixo',
  oeste:  'esquerda',
  norte:  'direita',
}

function migrarJogadores(jogadores: JogadorCenterpiece[] | undefined): JogadorCenterpiece[] {
  if (!Array.isArray(jogadores)) return []

  return jogadores.map((jogador, indice) => {
    // Se a posicao armazenada é válida E não corresponde à posicao legada baseada em vento,
    // mantém. Se corresponde à posicao legada (posicao foi definida por vento no passado),
    // corrige pela posição de índice.
    const posicaoValida = POSICOES_MESA.includes(jogador.posicao)
    const posicaoEraBaseadaEmVento =
      posicaoValida && POSICAO_LEGADA_POR_VENTO[jogador.vento] === jogador.posicao

    if (posicaoValida && !posicaoEraBaseadaEmVento) {
      // Posicao válida e não é o mapeamento vento→posicao antigo: manter.
      return jogador
    }

    // Posicao inválida OU era baseada em vento: atribuir pela ordem do array.
    return {
      ...jogador,
      posicao: POSICOES_MESA[indice] ?? 'topo',
    }
  })
}

function migrarHistorico(historico: SnapshotCenterpiece[] | undefined): SnapshotCenterpiece[] {
  if (!Array.isArray(historico)) return []
  return historico.map((snapshot) => ({
    ...snapshot,
    jogadores: migrarJogadores(snapshot.jogadores),
  }))
}

export function carregarMesa(): EstadoCenterpiece {
  const salvo = window.localStorage.getItem(CHAVE_STORAGE)
  if (!salvo) return criarMesaVazia()

  try {
    const lido = JSON.parse(salvo) as Partial<EstadoCenterpiece> & { _schemaVersion?: number }

    // Schema incompatível: descartar estado antigo para evitar layout por vento.
    if ((lido._schemaVersion ?? 1) < SCHEMA_VERSION) {
      window.localStorage.removeItem(CHAVE_STORAGE)
      return criarMesaVazia()
    }

    const base = criarMesaVazia()
    return {
      ...base,
      ...lido,
      jogadores: migrarJogadores(lido.jogadores),
      historico: migrarHistorico(lido.historico),
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
