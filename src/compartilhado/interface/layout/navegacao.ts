/**
 * Ordem da navegação: as páginas da barra inferior, que também são a ordem dos
 * gestos de deslizar (da última volta para a primeira). 'aprender' é o guia, que
 * abre por cima da tela. Idioma e os ajustes do app ficam na engrenagem de cada
 * tela; a tela Ajustes (com o Sobre e o Instalar) fica só no menu lateral.
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
    // Ranking logo depois de Partida: abre direto na lista, com Jogadores no cabeçalho.
    { destino: 'ranking', chave: 'menu.ranking', icone: 'fa-ranking-star' },
    { destino: 'sorteadorVentos', chave: 'menu.windDraw', icone: 'chapeu-helice', chaveCurta: 'menu.windDrawShort' },
    { destino: 'aprender', chave: 'learn.title', icone: 'fa-book-open', chaveCurta: 'learn.short' },
  ],
]

/** Telas de dentro da Mesa partida que o menu lateral abre direto. */
export type SubtelaPartida = 'setup' | 'torneio' | 'listaClube' | 'andamento' | 'historico' | 'registrarFinalizada'

export interface SubitemNavegacao {
  tela: SubtelaPartida
  chave: string
  icone: string
}

/** Subitens da Mesa partida no menu lateral, na ordem dos cards da tela. */
export const SUBITENS_PARTIDA: readonly SubitemNavegacao[] = [
  { tela: 'setup', chave: 'match.home.newGame', icone: 'fa-plus' },
  { tela: 'torneio', chave: 'tournament.title', icone: 'fa-trophy' },
  { tela: 'listaClube', chave: 'match.home.clubTitle', icone: 'fa-table-cells-large' },
  { tela: 'andamento', chave: 'match.home.inProgress', icone: 'fa-hourglass-half' },
  { tela: 'historico', chave: 'match.home.history', icone: 'fa-clock-rotate-left' },
  { tela: 'registrarFinalizada', chave: 'match.manual.title', icone: 'fa-clipboard-check' },
]

/** Menu lateral (Mais e sidebar): as telas da barra e, no fim, a tela Ajustes. */
export const ITENS_NAVEGACAO: readonly ItemNavegacao[] = [
  ...PAGINAS_NAVEGACAO.flat(),
  { destino: 'regras', chave: 'menu.rules', icone: 'fa-gear', chaveCurta: 'menu.rulesShort' },
]

/** Ordem do carrossel de telas ao deslizar: só as telas da barra. */
export const ORDEM_TELAS: readonly DestinoTela[] = PAGINAS_NAVEGACAO.flat().flatMap(({ destino }) =>
  destino === 'idioma' ? [] : [destino],
)

export function paginaDoDestino(destino: DestinoTela): number {
  return PAGINAS_NAVEGACAO.findIndex((pagina) => pagina.some((item) => item.destino === destino))
}
