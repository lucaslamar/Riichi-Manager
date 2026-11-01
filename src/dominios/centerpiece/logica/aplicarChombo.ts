import type { EstadoCenterpiece } from './tipos'
import { salvarSnapshot } from './historico'

export function aplicarChombo(
  estado: EstadoCenterpiece,
  jogadorId: string,
  valorPorJogador: number,
): EstadoCenterpiece {
  const comSnapshot = salvarSnapshot(estado, 'Chombo')
  const penalizado = comSnapshot.jogadores.find((j) => j.id === jogadorId)
  if (!penalizado) return estado

  const outros = comSnapshot.jogadores.filter((j) => j.id !== jogadorId)
  const total = valorPorJogador * outros.length

  const jogadores = comSnapshot.jogadores.map((j) =>
    j.id === jogadorId
      ? { ...j, pontos: j.pontos - total }
      : { ...j, pontos: j.pontos + valorPorJogador },
  )

  return { ...comSnapshot, jogadores }
}

export function calcularChomboDealer(ehDealer: boolean): {
  dealer: number
  naoDealer: number
  total: number
} {
  if (ehDealer) {
    return { dealer: 0, naoDealer: 4000, total: 12000 }
  }
  return { dealer: 4000, naoDealer: 2000, total: 8000 }
}

export function aplicarChomboPadrao(
  estado: EstadoCenterpiece,
  jogadorId: string,
): EstadoCenterpiece {
  const comSnapshot = salvarSnapshot(estado, 'Chombo')
  const penalizado = comSnapshot.jogadores.find((j) => j.id === jogadorId)
  if (!penalizado) return estado

  const ehDealer = penalizado.vento === 'leste'
  let total = 0

  const jogadores = comSnapshot.jogadores.map((j) => {
    if (j.id === jogadorId) return j
    const recebe = ehDealer ? 4000 : j.vento === 'leste' ? 4000 : 2000
    total += recebe
    return { ...j, pontos: j.pontos + recebe }
  })

  return {
    ...comSnapshot,
    jogadores: jogadores.map((j) =>
      j.id === jogadorId ? { ...j, pontos: j.pontos - total } : j,
    ),
  }
}
