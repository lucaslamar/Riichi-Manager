import type { EstadoCenterpiece, Vento } from './tipos'

const ROTACAO_VENTO: Record<Vento, Vento> = {
  leste: 'norte',
  sul: 'leste',
  oeste: 'sul',
  norte: 'oeste',
}

export function avancarRodada(estado: EstadoCenterpiece): EstadoCenterpiece {
  const jogadores = estado.jogadores.map((j) => ({
    ...j,
    vento: ROTACAO_VENTO[j.vento],
    riichi: false,
  }))

  let novaRodadaNumero = estado.rodadaNumero as 1 | 2 | 3 | 4
  let novaRodadaVento = estado.rodadaVento

  if (novaRodadaNumero >= 4) {
    novaRodadaNumero = 1
    novaRodadaVento = novaRodadaVento === 'leste' ? 'sul' : 'leste'
  } else {
    novaRodadaNumero = (novaRodadaNumero + 1) as 1 | 2 | 3 | 4
  }

  return { ...estado, jogadores, rodadaNumero: novaRodadaNumero, rodadaVento: novaRodadaVento }
}

export function processarPosVitoria(
  estado: EstadoCenterpiece,
  vencedorId: string,
): EstadoCenterpiece {
  const vencedor = estado.jogadores.find((j) => j.id === vencedorId)
  if (!vencedor) return estado

  if (vencedor.vento === 'leste') {
    return { ...estado, honba: estado.honba + 1 }
  }
  return { ...avancarRodada(estado), honba: 0 }
}
