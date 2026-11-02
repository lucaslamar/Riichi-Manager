/**
 * Ordem da navegação: uma lista só, usada pela barra inferior, pela sidebar e
 * pelos gestos de deslizar. 'aprender' é o guia, que abre por cima da tela.
 */
import type { TelaPrincipal } from '@/app/App'

export type DestinoTela = TelaPrincipal | 'aprender'

export interface ItemNavegacao {
  destino: DestinoTela
  chave: string
  icone: string
  /** Rótulo curto da barra inferior, onde o nome completo seria cortado. */
  chaveCurta?: string
}

export const PAGINAS_NAVEGACAO: readonly (readonly ItemNavegacao[])[] = [
  [
    { destino: 'calculadora', chave: 'menu.handCalculator', icone: 'um-pin', chaveCurta: 'menu.handCalculatorShort' },
    { destino: 'calculadoraRapida', chave: 'menu.quickCalculator', icone: 'palito-riichi', chaveCurta: 'menu.quickCalculatorShort' },
    { destino: 'sorteadorVentos', chave: 'menu.windDraw', icone: 'chapeu-helice', chaveCurta: 'menu.windDrawShort' },
    { destino: 'centerpiece', chave: 'menu.centerpiece', icone: 'centerpiece' },
  ],
  [
    { destino: 'aprender', chave: 'learn.title', icone: 'fa-book-open', chaveCurta: 'learn.short' },
    { destino: 'regras', chave: 'menu.rules', icone: 'fa-gear', chaveCurta: 'menu.rulesShort' },
  ],
]

export const ITENS_NAVEGACAO: readonly ItemNavegacao[] = PAGINAS_NAVEGACAO.flat()

/** Ordem do carrossel de telas ao deslizar. */
export const ORDEM_TELAS: readonly DestinoTela[] = ITENS_NAVEGACAO.map(({ destino }) => destino)

export function paginaDoDestino(destino: DestinoTela): number {
  return PAGINAS_NAVEGACAO.findIndex((pagina) => pagina.some((item) => item.destino === destino))
}
