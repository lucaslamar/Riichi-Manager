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

export interface Mao {
  pedras: CodigoPedra[]
  melds: Meld[]
  indiceAgari: number
  agari: 'ron' | 'tsumo'
  dora: CodigoPedra[]
  uradora: CodigoPedra[]
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

export function criarAcao(tipo: Acao['tipo']): Acao {
  if (tipo === 'chii') return { tipo, pedras: [] }
  return { tipo } as Acao
}
