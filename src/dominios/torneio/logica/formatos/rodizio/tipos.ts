/** Tipos da grade do Rodízio, os mesmos do Torneio antigo. `jogador` é o id do cadastro. */
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
