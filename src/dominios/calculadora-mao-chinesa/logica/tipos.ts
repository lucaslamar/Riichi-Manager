import type { ChaveFan } from './motor/fan'

export type FormaBatida = 'ron' | 'tsumo'

export interface FanContado {
  /** Número oficial (1 a 81), o mesmo do guia do CMC. */
  id: number
  chave: ChaveFan
  nomeChines: string
  valor: number
  vezes: number
}

export interface ResultadoFanMcr {
  batida: boolean
  fans: FanContado[]
  fanSemFlores: number
  flores: number
  fanTotal: number
  /** No MCR a mão precisa de 8 fan sem contar as flores. */
  valido: boolean
}

export interface PagamentoMcr {
  quem: 'descartador' | 'outro'
  valor: number
}

export interface ResultadoPagamentoMcr {
  ganhadorRecebe: number
  pagamentos: PagamentoMcr[]
}
