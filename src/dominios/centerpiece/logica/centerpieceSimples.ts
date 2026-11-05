/** Centerpiece simples: só a rodada, o dealer e o honba, sem pontos nem jogadores. */
import { OPCOES_TIMER_VEZ, type ConfigMesa } from './configMesa'
import { ORDEM_VENTOS, type Cadeira, type Vento } from './partida'

export interface EstadoSimples {
  cadeiraDealer: Cadeira
  rodadaVento: Vento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
  /** Timer de vez opcional, em segundos; 0 = desligado. */
  timerVez: ConfigMesa['timerVez']
}

export const SIMPLES_INICIAL: EstadoSimples = {
  cadeiraDealer: 0,
  rodadaVento: 'leste',
  rodadaNumero: 1,
  honba: 0,
  timerVez: 30,
}

export function proximoDealer(estado: EstadoSimples): EstadoSimples {
  const cadeiraDealer = ((estado.cadeiraDealer + 1) % 4) as Cadeira
  if (estado.rodadaNumero < 4) {
    return {
      ...estado,
      cadeiraDealer,
      rodadaVento: estado.rodadaVento,
      rodadaNumero: (estado.rodadaNumero + 1) as EstadoSimples['rodadaNumero'],
      honba: 0,
    }
  }
  const indice = ORDEM_VENTOS.indexOf(estado.rodadaVento)
  return { ...estado, cadeiraDealer, rodadaVento: ORDEM_VENTOS[(indice + 1) % 4], rodadaNumero: 1, honba: 0 }
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
  if (!valido) return SIMPLES_INICIAL
  // Salvo antes do timer existir: fica no padrão, 30 s. Quem desligou continua desligado.
  const timerVez = OPCOES_TIMER_VEZ.includes(lido.timerVez as ConfigMesa['timerVez'])
    ? (lido.timerVez as ConfigMesa['timerVez'])
    : SIMPLES_INICIAL.timerVez
  return {
    cadeiraDealer: lido.cadeiraDealer as Cadeira,
    rodadaVento: lido.rodadaVento as Vento,
    rodadaNumero: lido.rodadaNumero as EstadoSimples['rodadaNumero'],
    honba: lido.honba as number,
    timerVez,
  }
}

/**
 * Giro da mesa, em graus, para ela seguir o aparelho quando o sistema gira a tela.
 * Conta a partir de como a tela estava ao abrir, para a mesa começar sempre reta.
 */
export function giroDaMesa(anguloInicial: number, anguloAtual: number): number {
  return ((anguloInicial - anguloAtual) % 360 + 360) % 360
}
