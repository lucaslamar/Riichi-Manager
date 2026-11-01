/** Centerpiece simples: só a rodada, o dealer e o honba, sem pontos nem jogadores. */
import { ORDEM_VENTOS, type Cadeira, type Vento } from './partida'

export interface EstadoSimples {
  cadeiraDealer: Cadeira
  rodadaVento: Vento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
}

export const SIMPLES_INICIAL: EstadoSimples = {
  cadeiraDealer: 0,
  rodadaVento: 'leste',
  rodadaNumero: 1,
  honba: 0,
}

export function proximoDealer(estado: EstadoSimples): EstadoSimples {
  const cadeiraDealer = ((estado.cadeiraDealer + 1) % 4) as Cadeira
  if (estado.rodadaNumero < 4) {
    return {
      cadeiraDealer,
      rodadaVento: estado.rodadaVento,
      rodadaNumero: (estado.rodadaNumero + 1) as EstadoSimples['rodadaNumero'],
      honba: 0,
    }
  }
  const indice = ORDEM_VENTOS.indexOf(estado.rodadaVento)
  return { cadeiraDealer, rodadaVento: ORDEM_VENTOS[(indice + 1) % 4], rodadaNumero: 1, honba: 0 }
}

/** Renchan: o dealer fica e o honba sobe. */
export function repetirDealer(estado: EstadoSimples): EstadoSimples {
  return { ...estado, honba: estado.honba + 1 }
}

export function ajustarHonba(estado: EstadoSimples, passo: 1 | -1): EstadoSimples {
  return { ...estado, honba: Math.max(0, estado.honba + passo) }
}

/** Lê o estado salvo sem confiar nele. */
export function normalizarSimples(salvo: unknown): EstadoSimples {
  const lido = (salvo ?? {}) as Partial<EstadoSimples>
  const valido =
    [0, 1, 2, 3].includes(lido.cadeiraDealer as number) &&
    ORDEM_VENTOS.includes(lido.rodadaVento as Vento) &&
    [1, 2, 3, 4].includes(lido.rodadaNumero as number) &&
    Number.isInteger(lido.honba) &&
    (lido.honba as number) >= 0
  return valido ? (lido as EstadoSimples) : SIMPLES_INICIAL
}
