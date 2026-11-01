import type { EstadoCenterpiece, JogadorCenterpiece, Vento } from './tipos'

/**
 * Rotação padrão de Riichi Mahjong ao passar o dealer:
 * Leste → Norte → Oeste → Sul → Leste
 *
 * A posição visual é derivada do vento (não da cadeira física):
 *   Leste → direita | Sul → topo | Oeste → esquerda | Norte → baixo
 */
function proximoVento(vento: Vento): Vento {
  switch (vento) {
    case 'leste': return 'norte'
    case 'norte': return 'oeste'
    case 'oeste': return 'sul'
    case 'sul':   return 'leste'
  }
}

export function girarVentosParaDireita(
  jogadores: JogadorCenterpiece[],
): JogadorCenterpiece[] {
  return jogadores.map((j) => ({ ...j, vento: proximoVento(j.vento), riichi: false }))
}

export function avancarRodada(estado: EstadoCenterpiece): EstadoCenterpiece {
  const jogadores = girarVentosParaDireita(estado.jogadores)

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
