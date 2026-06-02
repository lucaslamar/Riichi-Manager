export type TipoJogadorHanFu = 'dealer' | 'nonDealer'
export type TipoVitoriaHanFu = 'ron' | 'tsumo'

export type CategoriaPontuacaoHanFu =
  | 'normal'
  | 'mangan'
  | 'haneman'
  | 'baiman'
  | 'sanbaiman'
  | 'yakuman'

export interface EntradaPontuacaoHanFu {
  han: number
  fu: number
  ehDealer: boolean
  tipoVitoria: TipoVitoriaHanFu
  honba: number
}

export interface PagamentoTsumoHanFu {
  dealer: number
  nonDealer: number
  all?: number
}

export interface ResultadoPontuacaoHanFu {
  han: number
  fu: number
  yakumanMultiplo: number
  ehDealer: boolean
  tipoVitoria: TipoVitoriaHanFu
  honba: number
  categoria: CategoriaPontuacaoHanFu
  nomeCategoria: string | null
  base: number
  principal: number
  totalBase: number
  totalComHonba: number
  ron?: number
  tsumo?: PagamentoTsumoHanFu
  descricao: string
  detalhePagamento: string
  totalFormatado: string
  ehLimite: boolean
  modoYakuman: boolean
}

export interface PagamentosReferenciaHanFu {
  ronNaoLeste: string
  ronLeste: string
  tsumoNaoLeste: string
  tsumoLeste: string
}

export interface CelulaReferenciaHanFu {
  han: number
  fu: number
  categoria: CategoriaPontuacaoHanFu
  ativa: boolean
  disponivel: boolean
  pagamentos: PagamentosReferenciaHanFu | null
}

export interface LinhaReferenciaHanFu {
  han: number
  celulas: CelulaReferenciaHanFu[]
}

export interface LimiteReferenciaHanFu {
  han: number
  faixa: string
  categoria: CategoriaPontuacaoHanFu
  pagamentos: PagamentosReferenciaHanFu
  ativo: boolean
}

export interface ReferenciaRapidaHanFu {
  linhas: LinhaReferenciaHanFu[]
  limites: LimiteReferenciaHanFu[]
}
