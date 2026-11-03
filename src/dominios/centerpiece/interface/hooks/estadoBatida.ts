import type { Cadeira } from '../../logica/partida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'

export const MAXIMO_VENCEDORES = { atamaHane: 1, duploTriploAborta: 2, duploTriploPermitidos: 3 }

export type PassoBatida = 'tipo' | 'vencedor' | 'pagador' | 'calculo' | 'confirmacao'

export interface EstadoBatida {
  tipo: 'ron' | 'tsumo'
  passo: PassoBatida
  vencedorAtual: Cadeira | null
  pagador: Cadeira | null
  /** Abre a calculadora no lugar da mesa: Han e Fu, teclado de pedras ou notação MPSZ. */
  calculadora: 'hanFu' | 'pedras' | 'notacao' | null
  vencedores: { cadeira: Cadeira; resultado: ResultadoCalculoParaCenterpiece }[]
  /** Ron vindo do descarte: quem falta calcular e a pedra que fica marcada. */
  pendentes?: Cadeira[]
  ordemDescarte?: number
  /** Tsumo de quem está na vez: começa no cálculo, sem tipo, vencedor e pagador. */
  atalhoTsumo?: boolean
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

/** Ron sai da pergunta depois do descarte; o botão de batida fica para o tsumo de quem está na vez. */
export function iniciarTsumoDaVez(vencedor: Cadeira): EstadoBatida {
  return { ...iniciarBatida({ tipo: 'tsumo', vencedor }), atalhoTsumo: true }
}

/** Ron perguntado depois do descarte: vencedor e pagador já vêm preenchidos. */
export function iniciarRonDoDescarte(pagador: Cadeira, vencedores: Cadeira[], ordemDescarte: number): EstadoBatida {
  return {
    tipo: 'ron',
    passo: 'calculo',
    vencedorAtual: vencedores[0],
    pagador,
    calculadora: null,
    vencedores: [],
    pendentes: vencedores.slice(1),
    ordemDescarte,
  }
}
