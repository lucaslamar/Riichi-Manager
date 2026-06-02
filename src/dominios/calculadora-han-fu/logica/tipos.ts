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

export interface CelulaReferenciaHanFu {
  han: number
  fu: number
  rotulo: string
  categoria: CategoriaPontuacaoHanFu
  ativa: boolean
}

export interface LinhaReferenciaHanFu {
  han: number
  celulas: CelulaReferenciaHanFu[]
}
