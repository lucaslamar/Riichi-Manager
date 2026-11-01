import type { EstadoCenterpiece } from './tipos'
import { salvarSnapshot } from './historico'

export function aplicarRiichi(estado: EstadoCenterpiece, jogadorId: string): EstadoCenterpiece {
  const jogador = estado.jogadores.find((j) => j.id === jogadorId)
  if (!jogador || jogador.riichi || jogador.pontos < 1000) return estado

  const comSnapshot = salvarSnapshot(estado, 'Riichi')

  return {
    ...comSnapshot,
    jogadores: comSnapshot.jogadores.map((j) =>
      j.id === jogadorId ? { ...j, pontos: j.pontos - 1000, riichi: true } : j,
    ),
    riichiSticks: comSnapshot.riichiSticks + 1,
  }
}
