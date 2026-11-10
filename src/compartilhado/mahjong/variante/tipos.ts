/** Variante da partida: 4 jogadores (yonma) ou 3 jogadores (sanma). */
export type Variante = 'yonma' | 'sanma'

/** Como fica a parte do jogador ausente (o Norte) num tsumo de Sanma. */
export type ModoPagamentoTsumo = 'tsumo-son' | 'divisao-norte'

export interface RegrasSanma {
  kitaNukidora: boolean
  norteYakuhai: boolean
  pagamentoTsumo: ModoPagamentoTsumo
  pontosIniciais: number
  pontosRetorno: number
  uma: [number, number, number]
  honbaRon: number
  honbaTsumoPorJogador: number
  notenTotal: number
}

export const VARIANTES: readonly Variante[] = ['yonma', 'sanma']

export function ehVariante(valor: unknown): valor is Variante {
  return valor === 'yonma' || valor === 'sanma'
}

/** Registro antigo, sem o campo, é sempre de 4 jogadores. */
export function lerVariante(valor: unknown): Variante {
  return valor === 'sanma' ? 'sanma' : 'yonma'
}

export function jogadoresDaVariante(variante: Variante): 3 | 4 {
  return variante === 'sanma' ? 3 : 4
}
