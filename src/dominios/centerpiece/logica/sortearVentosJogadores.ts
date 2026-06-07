import type {
  Vento,
  PosicaoMesa,
  JogadorCenterpiece,
  EntradaSetupCenterpiece,
} from './tipos'

const ORDEM_VENTOS: Vento[] = ['leste', 'sul', 'oeste', 'norte']

/**
 * Posições físicas na mesa, na ordem de entrada dos nomes.
 * Primeiro nome → topo, segundo → direita, terceiro → baixo, quarto → esquerda.
 *
 * REGRA: posicao representa a cadeira física e NUNCA muda durante a partida.
 * Vento é o estado da rodada e muda a cada passagem de dealer.
 */
const POSICOES_MESA: PosicaoMesa[] = ['topo', 'direita', 'baixo', 'esquerda']

export function sortearVentosJogadores(entrada: EntradaSetupCenterpiece): JogadorCenterpiece[] {
  // Embaralha os ventos aleatoriamente (Fisher-Yates).
  // O vento sorteado é independente da posição física.
  const ventos: Vento[] = [...ORDEM_VENTOS]
  for (let i = ventos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ventos[i], ventos[j]] = [ventos[j], ventos[i]]
  }

  return entrada.nomes.map((nome, indice) => ({
    id: String(indice + 1),
    nome: nome.trim() || `Jogador ${indice + 1}`,
    pontos: entrada.pontosIniciais,
    // posicao = cadeira física (por ordem de entrada) — nunca muda
    posicao: POSICOES_MESA[indice],
    // vento = sorteado aleatoriamente — independente da posicao
    vento: ventos[indice],
    riichi: false,
  }))
}
