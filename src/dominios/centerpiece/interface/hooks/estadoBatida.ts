import type { Cadeira } from '../../logica/partida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'

export type PassoBatida = 'tipo' | 'vencedor' | 'pagador' | 'calculo' | 'confirmacao'

export interface EstadoBatida {
  tipo: 'ron' | 'tsumo'
  passo: PassoBatida
  vencedorAtual: Cadeira | null
  pagador: Cadeira | null
  /** Abre a calculadora no lugar da mesa. */
  calculadora: 'hanFu' | 'mao' | null
  vencedores: { cadeira: Cadeira; resultado: ResultadoCalculoParaCenterpiece }[]
}

export function iniciarBatida(inicial?: { tipo: 'ron' | 'tsumo'; vencedor: Cadeira }): EstadoBatida {
  return {
    tipo: inicial?.tipo ?? 'ron',
    passo: !inicial ? 'tipo' : inicial.tipo === 'ron' ? 'pagador' : 'calculo',
    vencedorAtual: inicial?.vencedor ?? null,
    pagador: null,
    calculadora: null,
    vencedores: [],
  }
}
