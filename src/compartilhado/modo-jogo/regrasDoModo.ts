import type { ModoJogo } from './tipos'

/** Quanto vale uma mão (ou vitória) na conta da distância no ranking. */
export interface UnidadeDistancia {
  id: 'mangan' | 'haneman' | 'baiman' | 'yakuman' | 'vitorias'
  valor: number
  /** Aparece na linha resumida da distância. As outras, só escolhidas ou no leitor de tela. */
  resumida: boolean
}

/** O que muda entre os modos fora da pontuação e dos yaku/fan. */
export interface RegrasDoModo {
  modo: ModoJogo
  /** Chave do nome dos pontos do ranking. */
  rotuloPontos: string
  /** Pontos do ranking × escala = a medida das unidades. */
  escalaPontos: number
  /** A primeira é a unidade de referência. */
  unidadesDistancia: readonly UnidadeDistancia[]
}

const REGRAS: Record<ModoJogo, RegrasDoModo> = {
  riichi: {
    modo: 'riichi',
    rotuloPontos: 'tournament.ranking.points',
    escalaPontos: 1000,
    // Ron fora do Leste: o valor mais conservador.
    unidadesDistancia: [
      { id: 'mangan', valor: 8000, resumida: true },
      { id: 'haneman', valor: 12000, resumida: true },
      { id: 'baiman', valor: 16000, resumida: false },
      { id: 'yakuman', valor: 32000, resumida: true },
    ],
  },
  mcr: {
    modo: 'mcr',
    rotuloPontos: 'tournament.podiumGap.tablePoints',
    escalaPontos: 1,
    // Vencer a mesa vale 4 pontos de mesa.
    unidadesDistancia: [{ id: 'vitorias', valor: 4, resumida: true }],
  },
}

export function regrasDoModo(modo: ModoJogo): RegrasDoModo {
  return REGRAS[modo]
}
