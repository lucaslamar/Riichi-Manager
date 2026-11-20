import type { ChaveFan } from './motor/fan'

export type FormaBatida = 'ron' | 'tsumo'

export interface FanContado {
  /** Número oficial (1 a 81), o mesmo do guia do CMC. */
  id: number
  chave: ChaveFan
  nomeChines: string
  valor: number
  vezes: number
  /**
   * As pedras (ids do motor) de cada vez que o fan conta. `null`: vale para a mão
   * inteira ou para a situação da batida (a interface decide o destaque).
   */
  ocorrencias: (number[] | null)[]
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
