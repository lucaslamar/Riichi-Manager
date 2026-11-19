/**
 * Ordem da navegação: as páginas da barra inferior, que também são a ordem dos
 * gestos de deslizar (da última volta para a primeira). 'aprender' é o guia, que
 * abre por cima da tela. Idioma e os ajustes do app ficam na engrenagem de cada
 * tela; a tela Ajustes (com o Sobre e o Instalar) fica só no menu lateral.
 */
import type { TelaPrincipal } from '@/app/App'
import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'

export type DestinoTela = TelaPrincipal | 'aprender'
export type DestinoNavegacao = DestinoTela | 'idioma'

interface ItemNavegacao {
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

/** Telas de dentro da Mesa partida e do Ranking que o menu lateral abre direto. */
export type SubtelaPartida =
  | 'setup'
  | 'torneio'
  | 'listaClube'
  | 'andamento'
  | 'historico'
  | 'registrarFinalizada'
  | 'jogadores'

/** Itens do menu que têm subitens: as abas do módulo de partidas. */
export type DestinoComSubitens = 'partidas' | 'ranking'

interface SubitemNavegacao {
  tela: SubtelaPartida
  chave: string
  icone: string
}

/** Subitens no menu lateral: os da Mesa partida na ordem dos cards da tela. */
export const SUBITENS_NAVEGACAO: Record<DestinoComSubitens, readonly SubitemNavegacao[]> = {
  partidas: [
  { tela: 'setup', chave: 'match.home.newGame', icone: 'fa-plus' },
  { tela: 'torneio', chave: 'tournament.title', icone: 'fa-trophy' },
  { tela: 'listaClube', chave: 'match.home.clubTitle', icone: 'fa-table-cells-large' },
  { tela: 'andamento', chave: 'match.home.inProgress', icone: 'fa-hourglass-half' },
  { tela: 'historico', chave: 'match.home.history', icone: 'fa-clock-rotate-left' },
  { tela: 'registrarFinalizada', chave: 'match.manual.title', icone: 'fa-clipboard-check' },
  ],
  ranking: [
    { tela: 'jogadores', chave: 'players.title', icone: 'fa-user-plus' },
    { tela: 'registrarFinalizada', chave: 'match.manual.title', icone: 'fa-clipboard-check' },
  ],
}

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

/**
 * Telas que não existem no modo Chinês (MCR): Han e Fu (o MCR não tem fu),
 * Centerpiece, Partidas e Ranking (pontuação Riichi). O Tutorial mostra o MCR.
 */
const OCULTAS_NO_MCR: ReadonlySet<DestinoNavegacao> = new Set([
  'calculadoraRapida',
  'centerpiece',
  'partidas',
  'ranking',
])

/** Telas que só existem no modo Chinês. */
const SO_NO_MCR: ReadonlySet<DestinoNavegacao> = new Set(['guiaBolso', 'placarMcr'])

/** O Guia de Bolso do Riichi fica dentro da Calculadora de Mão; o do MCR é uma tela. */
const ITEM_GUIA_BOLSO_MCR: ItemNavegacao = {
  destino: 'guiaBolso',
  chave: 'menu.pocketGuideMcr',
  icone: 'fa-book-bookmark',
  chaveCurta: 'menu.pocketGuideMcrShort',
}

interface NavegacaoDoModo {
  paginas: readonly (readonly ItemNavegacao[])[]
  itens: readonly ItemNavegacao[]
  ordem: readonly DestinoTela[]
}

const NAVEGACAO_RIICHI: NavegacaoDoModo = { paginas: PAGINAS_NAVEGACAO, itens: ITENS_NAVEGACAO, ordem: ORDEM_TELAS }

/** No MCR, a Calculadora de Mão é a chinesa, no mesmo lugar da japonesa. */
const paraMcr = (item: ItemNavegacao): ItemNavegacao =>
  item.destino === 'calculadora' ? { ...item, chave: 'menu.handCalculatorChinese' } : item

/** Placar MCR: só os pontos, no lugar da Mesa partida do Riichi. */
const ITEM_PLACAR_MCR: ItemNavegacao = {
  destino: 'placarMcr',
  chave: 'menu.scoreMcr',
  icone: 'fa-gamepad',
  chaveCurta: 'menu.scoreMcrShort',
}

const comExtrasMcr = (itens: ItemNavegacao[]) => [itens[0], ITEM_PLACAR_MCR, ITEM_GUIA_BOLSO_MCR, ...itens.slice(1)]

const ITENS_BARRA_MCR = comExtrasMcr(
  PAGINAS_NAVEGACAO.flat()
    .filter((item) => !OCULTAS_NO_MCR.has(item.destino))
    .map(paraMcr),
)
/** Quatro telas por página na barra, como no Riichi: o Tutorial fica na segunda. */
const PAGINAS_MCR = [ITENS_BARRA_MCR.slice(0, 4), ITENS_BARRA_MCR.slice(4)]

const NAVEGACAO_MCR: NavegacaoDoModo = {
  paginas: PAGINAS_MCR,
  itens: comExtrasMcr(ITENS_NAVEGACAO.filter((item) => !OCULTAS_NO_MCR.has(item.destino)).map(paraMcr)),
  ordem: ITENS_BARRA_MCR.flatMap(({ destino }) => (destino === 'idioma' ? [] : [destino])),
}

export function navegacaoDoModo(modo: ModoJogo): NavegacaoDoModo {
  return modo === 'mcr' ? NAVEGACAO_MCR : NAVEGACAO_RIICHI
}

export function telaExisteNoModo(destino: DestinoNavegacao, modo: ModoJogo): boolean {
  return modo === 'riichi' ? !SO_NO_MCR.has(destino) : !OCULTAS_NO_MCR.has(destino)
}
