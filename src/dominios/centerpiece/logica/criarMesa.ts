import type { EstadoCenterpiece } from './tipos'

export function criarMesaVazia(): EstadoCenterpiece {
  return {
    iniciada: false,
    jogadores: [],
    rodadaVento: 'leste',
    rodadaNumero: 1,
    honba: 0,
    riichiSticks: 0,
    pontosIniciais: 25000,
    historico: [],
  }
}
