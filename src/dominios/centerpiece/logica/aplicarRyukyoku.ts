import type { EstadoCenterpiece } from './tipos'
import { salvarSnapshot } from './historico'
import { avancarRodada } from './avancarRodada'

export function calcularPagamentosRyukyoku(tenpais: number): {
  ganhoPorTenpai: number
  perdaPorNoten: number
} {
  const notens = 4 - tenpais
  if (tenpais === 0 || tenpais === 4 || notens === 0) {
    return { ganhoPorTenpai: 0, perdaPorNoten: 0 }
  }
  return {
    ganhoPorTenpai: 3000 / tenpais,
    perdaPorNoten: 3000 / notens,
  }
}

export function aplicarRyukyoku(
  estado: EstadoCenterpiece,
  tenpaiIds: string[],
): EstadoCenterpiece {
  const comSnapshot = salvarSnapshot(estado, 'Empate')
  const { ganhoPorTenpai, perdaPorNoten } = calcularPagamentosRyukyoku(tenpaiIds.length)

  const jogadores = comSnapshot.jogadores.map((j) => {
    const ehTenpai = tenpaiIds.includes(j.id)
    return {
      ...j,
      pontos: j.pontos + (ehTenpai ? ganhoPorTenpai : -perdaPorNoten),
      riichi: false,
    }
  })

  const leste = comSnapshot.jogadores.find((j) => j.vento === 'leste')
  const lesteEhTenpai = leste ? tenpaiIds.includes(leste.id) : false

  const estadoComJogadores = { ...comSnapshot, jogadores, honba: comSnapshot.honba + 1 }

  if (lesteEhTenpai) {
    return estadoComJogadores
  }

  return avancarRodada(estadoComJogadores)
}
