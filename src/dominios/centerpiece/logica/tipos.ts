export type Vento = 'leste' | 'sul' | 'oeste' | 'norte'
export type PosicaoMesa = 'topo' | 'direita' | 'baixo' | 'esquerda'
export type TipoVitoria = 'ron' | 'tsumo'
export type RodadaVento = 'leste' | 'sul'
export type ModoAtribuicaoVentos = 'aleatorio' | 'ordemNomes'

export interface JogadorCenterpiece {
  id: string
  nome: string
  pontos: number
  posicao: PosicaoMesa
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
  modoAtribuicaoVentos: ModoAtribuicaoVentos
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
