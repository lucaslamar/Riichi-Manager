/**
 * Filtros do ranking geral e confronto direto (Rivais e Fregueses). Tudo puro:
 * recebe as partidas e os filtros e devolve as linhas, sem nada pré-somado.
 */
import type { Partida } from './partida'
import { partidasDoHistorico, type LinhaRanking } from './ranking'

export type PeriodoRanking = 'mes' | 'ano' | 'tudo' | 'personalizado'
export type DuracaoRanking = 'todas' | 'hanchan' | 'leste'
/** `app`: jogada com o placar do app. `fora`: registrada depois, só com o resultado. */
export type OrigemRanking = 'todas' | 'app' | 'fora'
export type OrdemRanking = 'pontuacao' | 'media' | 'primeiro' | 'partidas'

export interface FiltrosRankingGeral {
  /** Só as partidas em que ele jogou. */
  jogadorId?: string
  periodo: PeriodoRanking
  /** Datas `AAAA-MM-DD`, usadas só no período personalizado. Inclusivas. */
  inicio?: string
  fim?: string
  duracao: DuracaoRanking
  origem: OrigemRanking
  minimoPartidas: 0 | 3 | 5 | 10
  ordenarPor: OrdemRanking
}

export const FILTROS_PADRAO: FiltrosRankingGeral = {
  periodo: 'tudo',
  duracao: 'todas',
  origem: 'todas',
  minimoPartidas: 0,
  ordenarPor: 'pontuacao',
}

/** Quais filtros fogem do padrão (o período é atalho fixo da tela, não conta). */
export function filtrosAtivos(filtros: FiltrosRankingGeral) {
  const ativos: ('jogador' | 'duracao' | 'origem' | 'minimo' | 'ordem' | 'periodo')[] = []
  if (filtros.jogadorId) ativos.push('jogador')
  if (filtros.periodo === 'personalizado') ativos.push('periodo')
  if (filtros.duracao !== 'todas') ativos.push('duracao')
  if (filtros.origem !== 'todas') ativos.push('origem')
  if (filtros.minimoPartidas > 0) ativos.push('minimo')
  if (filtros.ordenarPor !== 'pontuacao') ativos.push('ordem')
  return ativos
}

/** Data local `AAAA-MM-DD`, para comparar com as datas do período personalizado. */
function diaLocal(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

function dentroDoPeriodo(iso: string, filtros: FiltrosRankingGeral, agora: Date) {
  const data = new Date(iso)
  switch (filtros.periodo) {
    case 'tudo':
      return true
    case 'ano':
      return data.getFullYear() === agora.getFullYear()
    case 'mes':
      return data.getFullYear() === agora.getFullYear() && data.getMonth() === agora.getMonth()
    case 'personalizado': {
      const dia = diaLocal(data)
      return (!filtros.inicio || dia >= filtros.inicio) && (!filtros.fim || dia <= filtros.fim)
    }
  }
}

/**
 * Partidas do histórico que passam nos filtros de período, duração e origem.
 * `comJogador` liga o filtro de jogador (o confronto direto precisa dele desligado
 * para enxergar as partidas dos adversários entre si).
 */
export function partidasFiltradas(
  partidas: readonly Partida[],
  filtros: FiltrosRankingGeral,
  agora: Date,
  comJogador = true,
): Partida[] {
  return partidasDoHistorico(partidas).filter((partida) => {
    if (!dentroDoPeriodo(partida.finalizadaEm ?? '', filtros, agora)) return false
    if (filtros.duracao !== 'todas' && partida.config.tipoPartida !== filtros.duracao) return false
    if (filtros.origem === 'app' && partida.registradaManual) return false
    if (filtros.origem === 'fora' && !partida.registradaManual) return false
    if (comJogador && filtros.jogadorId) {
      return (partida.resultado ?? []).some((linha) => linha.jogadorId === filtros.jogadorId)
    }
    return true
  })
}

const arredondar = (valor: number) => Math.round(valor * 100) / 100

const COMPARADORES: Record<OrdemRanking, (uma: LinhaRanking, outra: LinhaRanking) => number> = {
  pontuacao: (uma, outra) => outra.pontuacaoTotal - uma.pontuacaoTotal,
  media: (uma, outra) => uma.mediaColocacao - outra.mediaColocacao,
  primeiro: (uma, outra) => outra.percentualPrimeiro - uma.percentualPrimeiro,
  partidas: (uma, outra) => outra.partidas - uma.partidas,
}

/** Ranking geral respeitando todos os filtros. Desempate: pontuação e depois média. */
export function computeRanking(
  partidas: readonly Partida[],
  filtros: FiltrosRankingGeral,
  agora: Date = new Date(),
): LinhaRanking[] {
  const acumulado = new Map<
    string,
    { partidas: number; total: number; colocacoes: number; primeiros: number; quartos: number; tobis: number }
  >()
  for (const partida of partidasFiltradas(partidas, filtros, agora)) {
    for (const linha of partida.resultado ?? []) {
      const atual = acumulado.get(linha.jogadorId) ?? {
        partidas: 0,
        total: 0,
        colocacoes: 0,
        primeiros: 0,
        quartos: 0,
        tobis: 0,
      }
      atual.partidas += 1
      atual.total += linha.final
      atual.colocacoes += linha.colocacao
      if (linha.colocacao === 1) atual.primeiros += 1
      if (linha.colocacao === 4) atual.quartos += 1
      if (linha.pontosBrutos < 0) atual.tobis += 1
      acumulado.set(linha.jogadorId, atual)
    }
  }
  const comparar = COMPARADORES[filtros.ordenarPor]
  return [...acumulado.entries()]
    .filter(([, dados]) => dados.partidas >= filtros.minimoPartidas)
    .map(([jogadorId, dados]) => ({
      jogadorId,
      partidas: dados.partidas,
      pontuacaoTotal: arredondar(dados.total),
      mediaColocacao: arredondar(dados.colocacoes / dados.partidas),
      percentualPrimeiro: arredondar((dados.primeiros / dados.partidas) * 100),
      percentualQuarto: arredondar((dados.quartos / dados.partidas) * 100),
      percentualTobi: arredondar((dados.tobis / dados.partidas) * 100),
    }))
    .sort(
      (uma, outra) =>
        comparar(uma, outra) ||
        outra.pontuacaoTotal - uma.pontuacaoTotal ||
        uma.mediaColocacao - outra.mediaColocacao,
    )
}

export interface Confronto {
  adversarioId: string
  /** A terminou melhor que o adversário. */
  vitorias: number
  derrotas: number
  partidas: number
}

/** Mínimo de partidas juntos para entrar em Rivais ou Fregueses. */
export const MINIMO_CONFRONTO = 2
const LIMITE_LISTA = 3

/** Confronto direto do jogador com cada adversário, nas partidas que jogaram juntos. */
export function confrontosDoJogador(partidas: readonly Partida[], jogadorId: string): Confronto[] {
  const porAdversario = new Map<string, Confronto>()
  for (const partida of partidas) {
    const resultado = partida.resultado ?? []
    const meu = resultado.find((linha) => linha.jogadorId === jogadorId)
    if (!meu) continue
    for (const outro of resultado) {
      if (outro.jogadorId === jogadorId) continue
      const atual = porAdversario.get(outro.jogadorId) ?? {
        adversarioId: outro.jogadorId,
        vitorias: 0,
        derrotas: 0,
        partidas: 0,
      }
      atual.partidas += 1
      if (meu.colocacao < outro.colocacao) atual.vitorias += 1
      else if (meu.colocacao > outro.colocacao) atual.derrotas += 1
      porAdversario.set(outro.jogadorId, atual)
    }
  }
  return [...porAdversario.values()]
}

/**
 * Maiores rivais (quem mais vence o jogador) e fregueses (quem ele mais vence),
 * até 3 cada, pelo saldo e depois pelas partidas juntos. Saldo zero não entra.
 */
export function rivaisEFregueses(partidas: readonly Partida[], jogadorId: string) {
  const elegiveis = confrontosDoJogador(partidas, jogadorId).filter(
    (confronto) => confronto.partidas >= MINIMO_CONFRONTO,
  )
  const lista = (saldo: (confronto: Confronto) => number) =>
    elegiveis
      .filter((confronto) => saldo(confronto) > 0)
      .sort((um, outro) => saldo(outro) - saldo(um) || outro.partidas - um.partidas)
      .slice(0, LIMITE_LISTA)
  return {
    rivais: lista((confronto) => confronto.derrotas - confronto.vitorias),
    fregueses: lista((confronto) => confronto.vitorias - confronto.derrotas),
  }
}

/** Lê os filtros salvos, descartando o que não for válido. */
export function lerFiltros(texto: string | null): FiltrosRankingGeral {
  if (!texto) return FILTROS_PADRAO
  try {
    const lido = JSON.parse(texto) as Partial<FiltrosRankingGeral>
    const umDe = <T>(valor: unknown, opcoes: readonly T[], padrao: T) =>
      opcoes.includes(valor as T) ? (valor as T) : padrao
    const data = (valor: unknown) =>
      typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : undefined
    return {
      ...(typeof lido.jogadorId === 'string' && lido.jogadorId ? { jogadorId: lido.jogadorId } : {}),
      periodo: umDe(lido.periodo, ['mes', 'ano', 'tudo', 'personalizado'] as const, 'tudo'),
      ...(data(lido.inicio) ? { inicio: data(lido.inicio) } : {}),
      ...(data(lido.fim) ? { fim: data(lido.fim) } : {}),
      duracao: umDe(lido.duracao, ['todas', 'hanchan', 'leste'] as const, 'todas'),
      origem: umDe(lido.origem, ['todas', 'app', 'fora'] as const, 'todas'),
      minimoPartidas: umDe(lido.minimoPartidas, [0, 3, 5, 10] as const, 0),
      ordenarPor: umDe(lido.ordenarPor, ['pontuacao', 'media', 'primeiro', 'partidas'] as const, 'pontuacao'),
    }
  } catch {
    return FILTROS_PADRAO
  }
}
