/**
 * @fileoverview Tipos centrais da calculadora de mão.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CodigoPedra = string // ex: "1m", "5p", "3z"
export type VentoMao = '1' | '2' | '3' | '4'

export type Meld =
  | { tipo: 'chii'; pedras: CodigoPedra[] } // sequência
  | { tipo: 'pon'; pedras: CodigoPedra[] } // trinca aberta
  | { tipo: 'kanAberto'; pedras: CodigoPedra[] } // kan declarado (aberto)
  | { tipo: 'kanFechado'; pedras: CodigoPedra[] } // kan concealed (fechado)

export interface AgariMeld {
  indiceMeld: number
  indicePedra: number
  pedra: CodigoPedra
  tipo: Meld['tipo']
  pedrasConsumidasMao: CodigoPedra[]
}

export interface Mao {
  pedras: CodigoPedra[]
  melds: Meld[]
  indiceAgari: number
  agariMeld: AgariMeld | null
  agari: 'ron' | 'tsumo'
  dora: CodigoPedra[]
  uradora: CodigoPedra[]
  descartes: CodigoPedra[]
  doraManual: number
  uradoraManual: number
  honba: number
  riichi: { duplo: boolean; ippatsu: boolean } | null
  bencao: boolean
  ultimaPedra: boolean
  kan: boolean // rinshan (tsumo após kan) ou chankan (ron em kan)
  ventoRodada: VentoMao
  ventoAssento: VentoMao
}

export type Acao =
  | { tipo: 'chii'; pedras: CodigoPedra[] }
  | { tipo: 'pon' }
  | { tipo: 'kanAberto' }
  | { tipo: 'kanFechado' }
  | { tipo: 'dora' }
  | { tipo: 'uradora' }
  | { tipo: 'descarte' }

export function criarAcao(tipo: Acao['tipo']): Acao {
  if (tipo === 'chii') return { tipo, pedras: [] }
  return { tipo } as Acao
}
