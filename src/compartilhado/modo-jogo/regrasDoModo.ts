import type { ModoJogo } from './tipos'

/** Quanto vale uma mão (ou vitória) na conta da distância no ranking. */
export interface UnidadeDistancia {
  id: 'mangan' | 'haneman' | 'baiman' | 'yakuman' | 'vitorias'
  valor: number
  /** Aparece na linha resumida da distância. As outras, só escolhidas ou no leitor de tela. */
  resumida: boolean
}

/** Pontos do ranking no WO e no atraso. */
export interface RegrasWo {
  /** Perdido por quem faltou. */
  penalidade: number
  /** Ganho por cada presente. */
  presente: number
  /** Passou disso é WO. */
  toleranciaMinutos: number
  porMinuto: number
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
  /** null: o modo ainda não tem WO. */
  woPadrao: RegrasWo | null
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
    // Aprovado pelo clube: −30 da EMA, +10 da casa, atraso da WRC e da EMA.
    woPadrao: { penalidade: 30, presente: 10, toleranciaMinutos: 10, porMinuto: 1 },
  },
  mcr: {
    modo: 'mcr',
    rotuloPontos: 'tournament.podiumGap.tablePoints',
    escalaPontos: 1,
    // Vencer a mesa vale 4 pontos de mesa.
    unidadesDistancia: [{ id: 'vitorias', valor: 4, resumida: true }],
    woPadrao: null,
  },
}

export function regrasDoModo(modo: ModoJogo): RegrasDoModo {
  return REGRAS[modo]
}
