import { segundosRestantesBase } from './acoes'
import type { Torneio } from './tipos'

/** Para o cronômetro guardando o que faltava. */
export function pausarTorneio(torneio: Torneio, agora: number): Torneio {
  const { timer } = torneio
  if (!timer.rodando) return torneio
  return {
    ...torneio,
    timer: {
      ...timer,
      segundosRestantes: segundosRestantesBase(timer, agora),
      rodando: false,
      iniciadoEm: null,
    },
  }
}
