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

// ─── Paarenchan ───────────────────────────────────────────────────────────────

/**
 * Sequência que conta para o Paarenchan agora, e de quem é.
 * 1: vitórias seguidas do mesmo jogador · 2: vitórias seguidas como dealer, sem
 * empate no meio · 3: honba acumulado pelo dealer (empates contam).
 */
export function sequenciaPaarenchan(
  partida: Pick<Partida, 'eventos' | 'placar'>,
  variacao: 1 | 2 | 3,
): { cadeira: Cadeira; quantas: number } | null {
  if (variacao === 3) {
    return partida.placar.honba > 0 ? { cadeira: partida.placar.cadeiraDealer, quantas: partida.placar.honba } : null
  }
  let cadeira: Cadeira | null = null
  let quantas = 0
  for (const evento of [...partida.eventos].reverse()) {
    if (evento.tipo === 'riichi' || evento.tipo === 'chombo') continue
    if (evento.tipo !== 'ron' && evento.tipo !== 'tsumo') break
    const vencedores = evento.detalhe?.vencedores ?? []
    if (vencedores.length !== 1) break
    const vencedor = vencedores[0]
    if (variacao === 2 && vencedor !== evento.placarAntes.cadeiraDealer) break
    if (cadeira === null) cadeira = vencedor
    else if (cadeira !== vencedor) break
    quantas += 1
  }
  return cadeira === null ? null : { cadeira, quantas }
}

/** Depois de uma vitória que fecha 8 seguidas, o histórico ganha a linha do Paarenchan. */
export function anotarPaarenchan(antes: Partida, depois: Partida, variacao: 1 | 2 | 3, agora: string): Partida {
  if (depois.eventos.length <= antes.eventos.length) return depois
  const ultimo = depois.eventos[depois.eventos.length - 1]
  if (ultimo.tipo !== 'ron' && ultimo.tipo !== 'tsumo') return depois
  // Na variação 3, conta o honba de antes da vitória (a mão vencida com 8 honba).
  const sequencia =
    variacao === 3
      ? { cadeira: ultimo.placarAntes.cadeiraDealer, quantas: ultimo.placarAntes.honba }
      : sequenciaPaarenchan(depois, variacao)
  const venceu = ultimo.detalhe?.vencedores?.includes(sequencia?.cadeira as Cadeira)
  if (!sequencia || !venceu || sequencia.quantas < 8) return depois
  return anotarAcao(depois, { em: agora, tipo: 'paarenchan', rodada: ultimo.rodada, cadeira: sequencia.cadeira })
}
