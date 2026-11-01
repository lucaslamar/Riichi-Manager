import type {
  Vento,
  PosicaoMesa,
  JogadorCenterpiece,
  EntradaSetupCenterpiece,
} from './tipos'

const ORDEM_VENTOS: Vento[] = ['leste', 'sul', 'oeste', 'norte']

/**
 * Posição visual inicial conforme o vento do jogador.
 * Leste → direita | Sul → topo | Oeste → esquerda | Norte → baixo
 * (coincide com o mapeamento usado em MesaCenterpiece para renderização)
 */
const POSICAO_INICIAL_POR_VENTO: Record<Vento, PosicaoMesa> = {
  leste: 'direita',
  sul: 'topo',
  oeste: 'esquerda',
  norte: 'baixo',
}

export function sortearVentosJogadores(entrada: EntradaSetupCenterpiece): JogadorCenterpiece[] {
  const ventos: Vento[] = [...ORDEM_VENTOS]

  if (entrada.modoAtribuicaoVentos === 'aleatorio') {
    for (let i = ventos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ventos[i], ventos[j]] = [ventos[j], ventos[i]]
    }
  }

  return entrada.nomes.map((nome, indice) => ({
    id: String(indice + 1),
    nome: nome.trim() || `Jogador ${indice + 1}`,
    pontos: entrada.pontosIniciais,
    // A cadeira inicial segue a orientação real da mesa e depois permanece fixa.
    posicao: POSICAO_INICIAL_POR_VENTO[ventos[indice]],
    // O vento gira normalmente nas passagens de dealer.
    vento: ventos[indice],
    riichi: false,
  }))
}
