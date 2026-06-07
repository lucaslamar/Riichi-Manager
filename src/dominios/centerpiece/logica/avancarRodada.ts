import type { EstadoCenterpiece, JogadorCenterpiece, Vento } from './tipos'

/**
 * Retorna o vento do jogador após um giro para a direita (passagem de dealer).
 * Leste → Norte → Oeste → Sul → Leste
 *
 * POSIÇÃO FÍSICA NUNCA MUDA. Só o vento muda.
 */
export function ventoDepoisDoGiroParaDireita(vento: Vento): Vento {
  switch (vento) {
    case 'leste': return 'norte'
    case 'norte': return 'oeste'
    case 'oeste': return 'sul'
    case 'sul':   return 'leste'
  }
}

/**
 * Gira os ventos de todos os jogadores para a direita.
 * NÃO altera posicao, id, nome, pontos nem riichi — só vento.
 */
export function girarVentosParaDireita(
  jogadores: JogadorCenterpiece[],
): JogadorCenterpiece[] {
  return jogadores.map((j) => ({
    ...j,
    vento: ventoDepoisDoGiroParaDireita(j.vento),
    riichi: false,
  }))
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
