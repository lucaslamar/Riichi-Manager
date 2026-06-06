export type Vento = 'leste' | 'sul' | 'oeste' | 'norte'
export type TipoVitoria = 'ron' | 'tsumo'
export type MetodoCalculo = 'hanFu' | 'manual'
export type RodadaVento = 'leste' | 'sul'

export interface JogadorCenterpiece {
  id: string
  nome: string
  pontos: number
  vento: Vento
  riichi: boolean
}

export interface SnapshotCenterpiece {
  descricao: string
  iniciada: boolean
  jogadores: JogadorCenterpiece[]
  rodadaVento: RodadaVento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
  riichiSticks: number
  pontosIniciais: number
}

export interface EstadoCenterpiece {
  iniciada: boolean
  jogadores: JogadorCenterpiece[]
  rodadaVento: RodadaVento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
  riichiSticks: number
  pontosIniciais: number
  historico: SnapshotCenterpiece[]
}

export interface EntradaSetupCenterpiece {
  nomes: [string, string, string, string]
  pontosIniciais: number
}

export interface ResultadoRon {
  vencedorId: string
  pagadorId: string
  pontos: number
}

export interface ResultadoTsumo {
  vencedorId: string
  pagamentoDealer: number
  pagamentoNaoDealer: number
}
