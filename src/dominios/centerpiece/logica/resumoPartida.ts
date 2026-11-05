/**
 * Dados dos cards de placar ("Em andamento" e "Histórico"), tirados da partida e
 * do registro de mãos. Em TypeScript puro.
 */
import { CADEIRAS, ORDEM_VENTOS, ventoDaCadeira, type Cadeira, type Partida, type Vento } from './partida'

export type Patamar = 'mangan' | 'haneman' | 'baiman' | 'sanbaiman' | 'yakuman'

const ORDEM_PATAMAR: readonly Patamar[] = ['mangan', 'haneman', 'baiman', 'sanbaiman', 'yakuman']

/** Patamar de uma mão pelo han e fu; abaixo de Mangan não ganha selo. */
export function patamarDaMao(han?: number, fu?: number, yakuman?: number): Patamar | null {
  if (yakuman && yakuman > 0) return 'yakuman'
  if (!han) return null
  if (han >= 13) return 'yakuman'
  if (han >= 11) return 'sanbaiman'
  if (han >= 8) return 'baiman'
  if (han >= 6) return 'haneman'
  if (han >= 5) return 'mangan'
  // 4 han 40 fu e 3 han 70 fu já passam do limite do Mangan.
  if (fu && ((han === 4 && fu >= 40) || (han === 3 && fu >= 70))) return 'mangan'
  return null
}

/** Maior mão da partida e quem a fez; empate no patamar fica com a primeira. */
export function maiorMao(partida: Partida): { cadeira: Cadeira; patamar: Patamar } | null {
  let melhor: { cadeira: Cadeira; patamar: Patamar } | null = null
  for (const evento of partida.eventos) {
    if (evento.tipo !== 'ron' && evento.tipo !== 'tsumo') continue
    const detalhe = evento.detalhe
    const vencedor = detalhe?.vencedores?.length === 1 ? detalhe.vencedores[0] : undefined
    if (vencedor === undefined) continue
    const patamar = patamarDaMao(detalhe?.han, detalhe?.fu, detalhe?.yakuman)
    if (!patamar) continue
    if (!melhor || ORDEM_PATAMAR.indexOf(patamar) > ORDEM_PATAMAR.indexOf(melhor.patamar)) {
      melhor = { cadeira: vencedor, patamar }
    }
  }
  return melhor
}

export interface ContadoresJogador {
  riichi: number
  ron: number
  tsumo: number
  /** Vezes que pagou o ron de alguém. */
  dealIn: number
}

/**
 * Riichi, ron, tsumo e deal-in de cada cadeira. `null` quando a partida não tem
 * registro de mãos (registrada à mão, depois de jogada fora do app).
 */
export function contadoresDaPartida(partida: Partida): Record<Cadeira, ContadoresJogador> | null {
  if (partida.registradaManual) return null
  const contadores = Object.fromEntries(
    CADEIRAS.map((cadeira) => [cadeira, { riichi: 0, ron: 0, tsumo: 0, dealIn: 0 }]),
  ) as Record<Cadeira, ContadoresJogador>
  for (const evento of partida.eventos) {
    const detalhe = evento.detalhe
    if (evento.tipo === 'riichi' && detalhe?.cadeira !== undefined) contadores[detalhe.cadeira].riichi += 1
    if (evento.tipo === 'ron') {
      for (const cadeira of detalhe?.vencedores ?? []) contadores[cadeira].ron += 1
      if (detalhe?.pagador !== undefined) contadores[detalhe.pagador].dealIn += 1
    }
    if (evento.tipo === 'tsumo') {
      for (const cadeira of detalhe?.vencedores ?? []) contadores[cadeira].tsumo += 1
    }
  }
  return contadores
}

export interface LinhaCardMesa {
  cadeira: Cadeira
  /** Vento atual (em andamento). */
  vento: Vento
  /** Colocação final (histórico). */
  colocacao?: number
  pontos: number
  /** Pontuação final com uma e oka (histórico). */
  delta?: number
  destaque: boolean
}

/** Em andamento: na ordem dos ventos (東 南 西 北), com o dealer em destaque. */
export function linhasEmAndamento(partida: Partida): LinhaCardMesa[] {
  const { placar } = partida
  return [...CADEIRAS]
    .sort(
      (uma, outra) =>
        ORDEM_VENTOS.indexOf(ventoDaCadeira(uma, placar.cadeiraDealer)) -
        ORDEM_VENTOS.indexOf(ventoDaCadeira(outra, placar.cadeiraDealer)),
    )
    .map((cadeira) => ({
      cadeira,
      vento: ventoDaCadeira(cadeira, placar.cadeiraDealer),
      pontos: placar.pontos[cadeira],
      destaque: cadeira === placar.cadeiraDealer,
    }))
}

/** Histórico: na ordem da colocação, com o 1º lugar em destaque. */
export function linhasDoHistorico(partida: Partida): LinhaCardMesa[] {
  return (partida.resultado ?? []).map((linha) => ({
    cadeira: linha.cadeira,
    vento: partida.assentos[linha.cadeira].ventoInicial,
    colocacao: linha.colocacao,
    pontos: linha.pontosBrutos,
    delta: linha.final,
    destaque: linha.colocacao === 1,
  }))
}
