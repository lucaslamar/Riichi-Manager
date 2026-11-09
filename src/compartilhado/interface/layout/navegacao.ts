/**
 * Ordem da navegação: uma lista só, usada pela barra inferior, pela sidebar e
 * pelos gestos de deslizar. 'aprender' é o guia, que abre por cima da tela, e
 * 'idioma' é uma folha: fica na barra, mas não é tela. Nos gestos ela é a parada
 * entre a última tela e a primeira (o App fecha o carrossel por ela).
 */
import type { TelaPrincipal } from '@/app/App'

export type DestinoTela = TelaPrincipal | 'aprender'
export type DestinoNavegacao = DestinoTela | 'idioma'

export interface ItemNavegacao {
  destino: DestinoNavegacao
  chave: string
  icone: string
  /** Rótulo curto da barra inferior, onde o nome completo seria cortado. */
  chaveCurta?: string
}

export const PAGINAS_NAVEGACAO: readonly (readonly ItemNavegacao[])[] = [
  [
    { destino: 'calculadora', chave: 'menu.handCalculator', icone: 'um-pin', chaveCurta: 'menu.handCalculatorShort' },
    { destino: 'calculadoraRapida', chave: 'menu.quickCalculator', icone: 'palito-riichi', chaveCurta: 'menu.quickCalculatorShort' },
    { destino: 'centerpiece', chave: 'menu.centerpiece', icone: 'centerpiece' },
    // Partidas com pontos, histórico, jogadores e ranking (o simples fica no Centerpiece).
    { destino: 'partidas', chave: 'menu.matches', icone: 'fa-gamepad', chaveCurta: 'menu.matchesShort' },
  ],
  [
    { destino: 'sorteadorVentos', chave: 'menu.windDraw', icone: 'chapeu-helice', chaveCurta: 'menu.windDrawShort' },
    { destino: 'aprender', chave: 'learn.title', icone: 'fa-book-open', chaveCurta: 'learn.short' },
    { destino: 'regras', chave: 'menu.rules', icone: 'fa-gear', chaveCurta: 'menu.rulesShort' },
    { destino: 'idioma', chave: 'menu.language', icone: 'fa-globe' },
  ],
]

export const ITENS_NAVEGACAO: readonly ItemNavegacao[] = PAGINAS_NAVEGACAO.flat()

/** Ordem do carrossel de telas ao deslizar. */
export const ORDEM_TELAS: readonly DestinoTela[] = ITENS_NAVEGACAO.flatMap(({ destino }) =>
  destino === 'idioma' ? [] : [destino],
)

export function paginaDoDestino(destino: DestinoTela): number {
  return PAGINAS_NAVEGACAO.findIndex((pagina) => pagina.some((item) => item.destino === destino))
}
