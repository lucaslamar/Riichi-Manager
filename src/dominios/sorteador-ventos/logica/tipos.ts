import type { VentoMao } from '../../calculadora-mao/logica/mao'

export type FaseSorteio = 'ciclando' | 'desacelerando' | 'revelado' | 'concluido'

export interface EstadoSorteadorVentos {
  /** Embaralhada uma vez ao iniciar/reiniciar; o jogador N recebe `ordem[N - 1]`. */
  ordem: VentoMao[]
  /** Quantos ventos já foram revelados (0..4). */
  reveladas: number
  fase: FaseSorteio
}
