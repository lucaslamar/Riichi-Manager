import type { Vento, JogadorCenterpiece, EntradaSetupCenterpiece } from './tipos'

const ORDEM_VENTOS: Vento[] = ['leste', 'sul', 'oeste', 'norte']

export function sortearVentosJogadores(entrada: EntradaSetupCenterpiece): JogadorCenterpiece[] {
  const ventos: Vento[] = [...ORDEM_VENTOS]
  for (let i = ventos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ventos[i], ventos[j]] = [ventos[j], ventos[i]]
  }

  return entrada.nomes.map((nome, indice) => ({
    id: String(indice + 1),
    nome: nome.trim() || `Jogador ${indice + 1}`,
    pontos: entrada.pontosIniciais,
    vento: ventos[indice],
    riichi: false,
  }))
}
