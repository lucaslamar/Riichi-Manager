/** Timer da rodada, em funções puras: recebem o torneio e devolvem um novo. */
import { chaveMesa } from './chaves'
import { SEGUNDOS_ACRESCIMO_MESA, SEGUNDOS_RODADA_PADRAO } from './constantes'
import type { TimerRodada, Torneio } from './tipos'

export function criarTimerVazio(
  indiceRodada = 0,
  segundosBase: number = SEGUNDOS_RODADA_PADRAO,
  acrescimosPorMesa: Record<string, number> = {},
): TimerRodada {
  return {
    totalSegundos: segundosBase,
    segundosRestantes: segundosBase,
    indiceRodada,
    rodando: false,
    iniciadoEm: null,
    acrescimosPorMesa,
  }
}

export function segundosRestantesBase(timer: TimerRodada, agora: number): number {
  if (!timer.rodando || timer.iniciadoEm === null) return timer.segundosRestantes
  const decorridos = Math.max(0, Math.floor((agora - timer.iniciadoEm) / 1000))
  return Math.max(0, timer.segundosRestantes - decorridos)
}

/** Tempo da rodada mais os acréscimos da mesa. */
export function segundosRestantesMesa(
  timer: TimerRodada,
  indiceRodada: number,
  indiceMesa: number,
  agora: number,
): number {
  const acrescimos = timer.acrescimosPorMesa[chaveMesa(indiceRodada, indiceMesa)] ?? 0
  return segundosRestantesBase(timer, agora) + acrescimos * SEGUNDOS_ACRESCIMO_MESA
}

export function alternarTimer(torneio: Torneio, agora: number): Torneio {
  const { timer } = torneio
  return {
    ...torneio,
    timer: timer.rodando
      ? {
          ...timer,
          segundosRestantes: segundosRestantesBase(timer, agora),
          rodando: false,
          iniciadoEm: null,
        }
      : { ...timer, rodando: true, iniciadoEm: agora },
  }
}

export function resetarTimer(torneio: Torneio): Torneio {
  const { timer } = torneio
  return {
    ...torneio,
    timer: criarTimerVazio(timer.indiceRodada, timer.totalSegundos, timer.acrescimosPorMesa),
  }
}

export function selecionarRodadaTimer(torneio: Torneio, indiceRodada: number): Torneio {
  const { timer } = torneio
  return {
    ...torneio,
    timer: criarTimerVazio(indiceRodada, timer.totalSegundos, timer.acrescimosPorMesa),
  }
}

/** +5 min para todas as mesas. */
export function acrescentarTempoGlobal(torneio: Torneio, agora: number): Torneio {
  const { timer } = torneio
  return {
    ...torneio,
    timer: {
      ...timer,
      segundosRestantes: segundosRestantesBase(timer, agora) + SEGUNDOS_ACRESCIMO_MESA,
      iniciadoEm: timer.rodando ? agora : null,
    },
  }
}

/** +5 min só para uma mesa. */
export function acrescentarTempoMesa(
  torneio: Torneio,
  indiceRodada: number,
  indiceMesa: number,
): Torneio {
  const chave = chaveMesa(indiceRodada, indiceMesa)
  const { timer } = torneio
  return {
    ...torneio,
    timer: {
      ...timer,
      acrescimosPorMesa: {
        ...timer.acrescimosPorMesa,
        [chave]: (timer.acrescimosPorMesa[chave] ?? 0) + 1,
      },
    },
  }
}

/** Para no zero em vez de seguir contando no estado. */
export function sincronizarTimerExpirado(torneio: Torneio, agora: number): Torneio {
  const { timer } = torneio
  if (!timer.rodando || segundosRestantesBase(timer, agora) > 0) return torneio
  return { ...torneio, timer: { ...timer, segundosRestantes: 0, rodando: false, iniciadoEm: null } }
}
