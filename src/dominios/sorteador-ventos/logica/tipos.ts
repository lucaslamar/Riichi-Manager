export type CodigoVento = 'leste' | 'sul' | 'oeste' | 'norte'

export interface VentoMesa {
  codigo: CodigoVento
  kanji: string
  chaveNome: string
}

export interface VentoSorteado {
  vento: VentoMesa
  ordem: number
}

export interface EstadoSorteadorVentos {
  ventosDisponiveis: VentoMesa[]
  ventosSorteados: VentoSorteado[]
  ventoAnimado: CodigoVento | null
  sorteando: boolean
}
