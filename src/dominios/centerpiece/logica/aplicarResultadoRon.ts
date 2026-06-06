import type { EstadoCenterpiece, ResultadoRon } from './tipos'
import { salvarSnapshot } from './historico'
import { processarPosVitoria } from './avancarRodada'

export function aplicarResultadoRon(
  estado: EstadoCenterpiece,
  resultado: ResultadoRon,
): EstadoCenterpiece {
  const comSnapshot = salvarSnapshot(estado, 'Ron')
  const sticksBonus = comSnapshot.riichiSticks * 1000

  const jogadores = comSnapshot.jogadores.map((j) => {
    if (j.id === resultado.vencedorId) {
      return { ...j, pontos: j.pontos + resultado.pontos + sticksBonus, riichi: false }
    }
    if (j.id === resultado.pagadorId) {
      return { ...j, pontos: j.pontos - resultado.pontos, riichi: false }
    }
    return { ...j, riichi: false }
  })

  const posVitoria = processarPosVitoria(
    { ...comSnapshot, jogadores, riichiSticks: 0 },
    resultado.vencedorId,
  )

  return posVitoria
}
