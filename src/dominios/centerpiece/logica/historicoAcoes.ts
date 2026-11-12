/**
 * Histórico de ações da partida: uma linha do tempo de tudo o que foi registrado
 * na mesa (riichi, ron, tsumo, ryukyoku, chombo, abortivo) e dos "Desfazer". Ao
 * contrário de `eventos`, nada sai daqui: o que foi desfeito fica marcado.
 *
 * É montado comparando a partida antes e depois de cada mudança, então qualquer
 * caminho que mexa nos eventos (menu do jogador, descarte, Desfazer, Voltar e
 * corrigir) entra no histórico sem precisar avisar.
 */
import type { Cadeira, EventoPartida, Partida, PorCadeira, TipoEvento, Vento } from './partida'

export type TipoAcao = TipoEvento | 'desfazer' | 'paarenchan'

export interface EntradaHistorico {
  id: string
  em: string
  tipo: TipoAcao
  rodada: { vento: Vento; numero: number; honba: number }
  /** Evento que gerou a linha: é por ele que o Desfazer a encontra. */
  eventoId?: string
  vencedores?: Cadeira[]
  pagador?: Cadeira
  cadeira?: Cadeira
  variacao?: PorCadeira<number>
  han?: number
  fu?: number
  yakuman?: number
  /** Desfazer: qual ação voltou. */
  alvo?: TipoAcao
  desfeita?: boolean
}

function entradaDoEvento(evento: EventoPartida): EntradaHistorico {
  const { detalhe } = evento
  return {
    id: `h-${evento.id}`,
    em: evento.em,
    tipo: evento.tipo,
    rodada: evento.rodada,
    eventoId: evento.id,
    vencedores: detalhe?.vencedores,
    pagador: detalhe?.pagador,
    cadeira: detalhe?.cadeira ?? detalhe?.multa?.cadeira,
    variacao: evento.variacao,
    han: detalhe?.han,
    fu: detalhe?.fu,
    yakuman: detalhe?.yakuman,
  }
}

/** Histórico de uma partida antiga, sem o campo: só o que ainda está em `eventos`. */
export function historicoDe(partida: Pick<Partida, 'eventos' | 'historico'>): EntradaHistorico[] {
  return partida.historico ?? partida.eventos.filter((evento) => evento.tipo !== 'legado').map(entradaDoEvento)
}

/** Junta ao histórico o que mudou de `antes` para `depois`. */
export function anotarHistorico(antes: Partida, depois: Partida, agora: string): Partida {
  if (antes.eventos === depois.eventos) return depois
  let historico = historicoDe(antes)
  const idsDepois = new Set(depois.eventos.map((evento) => evento.id))
  const removidos = antes.eventos.filter((evento) => !idsDepois.has(evento.id))
  const idsAntes = new Set(antes.eventos.map((evento) => evento.id))
  const novos = depois.eventos.filter((evento) => !idsAntes.has(evento.id) && evento.tipo !== 'legado')

  // Do mais recente para o mais antigo, como o Desfazer anda.
  for (const evento of [...removidos].reverse()) {
    historico = historico.map((entrada) =>
      entrada.eventoId === evento.id ? { ...entrada, desfeita: true } : entrada,
    )
    historico = [
      ...historico,
      { id: `d-${evento.id}-${agora}`, em: agora, tipo: 'desfazer', rodada: evento.rodada, alvo: evento.tipo },
    ]
  }
  historico = [...historico, ...novos.map(entradaDoEvento)]
  return { ...depois, historico }
}

/** Uma linha extra, sem evento por trás (ex.: Paarenchan alcançado). */
export function anotarAcao(partida: Partida, entrada: Omit<EntradaHistorico, 'id'>): Partida {
  return {
    ...partida,
    historico: [...historicoDe(partida), { ...entrada, id: `x-${entrada.em}-${entrada.tipo}` }],
  }
}
