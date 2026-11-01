/**
 * Tipos do torneio. Na grade, `jogador` é o id do cadastro (no rascunho, antes de
 * existir cadastro, é o nome digitado). Os resultados não ficam aqui: cada mesa
 * jogada é uma Partida com `vinculoTorneio`.
 */
import type { ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'

export type Vento = 'Leste' | 'Sul' | 'Oeste' | 'Norte'

export type Assento = {
  vento: Vento
  jogador: string
}

export type Mesa = {
  id: number
  assentos: Assento[]
}

export type Rodada = {
  id: number
  mesas: Mesa[]
}

export type ParRepetido = {
  jogadores: [string, string]
  vezes: number
}

export type RepetidosPorJogador = {
  jogador: string
  quantidade: number
  adversarios: string[]
}

/** Quanto menor o `score`, melhor a grade. */
export type RelatorioQualidade = {
  score: number
  maxRepeticioesPar: number
  paresRepetidos: ParRepetido[]
  quantidadeParesRepetidos: number
  quantidadeIdealRepetidos: number
  quantidadeDuasVezes: number
  quantidadeTresVezesMais: number
  /** Todos foram Leste o mesmo número de vezes (ou com diferença de 1). */
  lesteExato: boolean
  repeticoesVento: number
  mesasCompletasRepetidas: number
  limiteRepetidosPorJogador: number | null
  maxRepetidosPorJogador: number
  jogadoresComExcesso: RepetidosPorJogador[]
}

export type CandidatoGrade = {
  rodadas: Rodada[]
  qualidade: RelatorioQualidade
}

/** Guarda o instante em vez de descontar a cada segundo: sobrevive a fechar o app. */
export type TimerRodada = {
  totalSegundos: number
  segundosRestantes: number
  indiceRodada: number
  rodando: boolean
  iniciadoEm: number | null
  /** Chave `"rodada_mesa"` → quantas vezes a mesa recebeu acréscimo. */
  acrescimosPorMesa: Record<string, number>
}

export type Torneio = {
  id: string
  criadoEm: string
  status: 'em_andamento' | 'encerrado'
  config: ConfigMesa
  jogadorIds: string[]
  grade: Rodada[]
  qualidade: RelatorioQualidade | null
  timer: TimerRodada
}

export type PassoAssistente = 0 | 1 | 2 | 3

/** Criação em andamento: fica salva se o app fechar no meio. */
export type RascunhoTorneio = {
  passo: PassoAssistente
  linhas: string[]
  config: ConfigMesa
  segundosRodada: number
  rodadas: number
  equilibrarVentos: boolean
  /** Sorteio com os nomes digitados; os ids só existem ao começar o torneio. */
  sorteio: CandidatoGrade | null
}
