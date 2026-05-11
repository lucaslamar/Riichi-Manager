/**
 * @fileoverview Tipos centrais do módulo de torneio.
 *
 * Todos os dados que trafegam entre componentes e são salvos no localStorage
 * estão definidos aqui. Alterar um tipo aqui quebra o TypeScript em qualquer
 * lugar que o use — isso é proposital: o compilador vira seu par de programação.
 */

// ─── Vento ────────────────────────────────────────────────────────────────────

/** Os quatro ventos de uma mesa de mahjong, em ordem de rotação. */
export type Vento = 'Leste' | 'Sul' | 'Oeste' | 'Norte'

// ─── Mesa ─────────────────────────────────────────────────────────────────────

/** Um assento dentro de uma mesa: quem está sentado, em qual vento e pontuação. */
export type Assento = {
  vento: Vento
  jogador: string
  pontuacao: number
}

/** Uma mesa com ID e seus quatro assentos. */
export type Mesa = {
  id: number
  assentos: Assento[]
}

/** Uma rodada com ID e suas mesas. */
export type Rodada = {
  id: number
  mesas: Mesa[]
}

// ─── Qualidade da grade ────────────────────────────────────────────────────────

/** Par de jogadores que se repetiram em alguma mesa. */
export type ParRepetido = {
  jogadores: [string, string]
  vezes: number
}

/** Jogador com repetição de adversários concentrada. */
export type RepetidosPorJogador = {
  jogador: string
  quantidade: number
  adversarios: string[]
}

/**
 * Relatório de qualidade gerado após o sorteio da grade.
 * Quanto mais baixo o `score`, melhor a grade.
 */
export type RelatorioQualidade = {
  score: number
  maxRepeticioesPar: number
  paresRepetidos: ParRepetido[]
  quantidadeParesRepetidos: number
  quantidadeIdealRepetidos: number
  quantidadeDuasVezes: number
  quantidadeTresVezesMais: number
  lesteExato: boolean
  repeticoesVento: number
  mesasCompletasRepetidas: number
  limiteRepetidosPorJogador: number | null
  maxRepetidosPorJogador: number
  jogadoresComExcesso: RepetidosPorJogador[]
}

/** Par de candidatos de grade para escolher o melhor sorteio. */
export type CandidatoGrade = {
  rodadas: Rodada[]
  qualidade: RelatorioQualidade
}

// ─── Timer da rodada ──────────────────────────────────────────────────────────

/**
 * Estado do cronômetro persistido no localStorage.
 * Usamos `startedAt` (timestamp) ao invés de decrementar a cada segundo,
 * assim o timer sobrevive a reloads da página.
 */
export type TimerRodada = {
  /** Duração total configurada pelo juiz, em segundos. */
  totalSegundos: number
  /** Segundos restantes na última pausa ou criação. */
  segundosRestantes: number
  /** Índice (base zero) da rodada que está sendo cronometrada. */
  indiceRodada: number
  /** `true` quando o cronômetro está correndo. */
  rodando: boolean
  /** Epoch em ms do momento em que o timer foi iniciado/retomado. `null` = pausado. */
  iniciadoEm: number | null
  /** Acréscimos individuais por mesa: chave `"rodada_mesa"` → quantas vezes foi acrescido. */
  acrescimosPorMesa: Record<string, number>
}

// ─── Estado global do torneio ─────────────────────────────────────────────────

/**
 * Estado completo de um torneio. Tudo que o app precisa para funcionar está aqui.
 * Este objeto é salvo no localStorage a cada mudança.
 */
export type EstadoTorneio = {
  jogadores: string[]
  grade: Rodada[]
  qualidade: RelatorioQualidade | null
  classificacao: Record<string, number>
  mesasConcluidas: Record<string, boolean>
  pontuacoesPorMesa: Record<string, string[]>
  timer: TimerRodada
}

// ─── Tipos auxiliares para PDF ────────────────────────────────────────────────

/** Interface mínima da API do jsPDF, exposta pelo script carregado no index.html. */
export type DocumentoPdf = {
  setFontSize: (tamanho: number) => void
  setTextColor: (...cor: number[]) => void
  text: (texto: string, x: number, y: number) => void
  autoTable: (opcoes: Record<string, unknown>) => void
  save: (nomeArquivo: string) => void
  internal: {
    getNumberOfPages: () => number
    pageSize: { height: number }
  }
}

/** Window com a biblioteca jsPDF injetada pelo CDN. */
export type JanelaPdf = Window & {
  jspdf?: {
    jsPDF: new () => DocumentoPdf
  }
}
