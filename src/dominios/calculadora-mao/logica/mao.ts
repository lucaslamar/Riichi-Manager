/**
 * @fileoverview Índice público da lógica da calculadora de mão.
 *
 * Os detalhes foram divididos por responsabilidade para facilitar estudo e
 * manutenção: tipos, configuração, tradução, conversão para a lib, cálculo,
 * calculadora rápida e ordenação/contadores.
 */

export type { Acao, CodigoPedra, Mao, Meld, VentoMao } from './tipos'
export { criarAcao } from './tipos'
export type { ConfiguracaoCalculo, DetalheFu, PontosCalculados, ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
export { configuracaoPadrao } from '@/compartilhado/mahjong/pontuacao'
export { calcularMao } from './calculo-mao'
export {
  aplicarHonba,
  calcularHanFu,
  calcularPatamarHanFu,
  fuValidos,
  montarPontosRapidos,
  arredondar100,
} from '@/compartilhado/mahjong/pontuacao'
export {
  ordenarPedras,
  ordenarMelds,
  contarPedrasTotais,
  contarSlotsLogicos,
  pedrasFisicasRestantes,
} from './ordenacao'
export { traduzirPatamares, traduzirYaku } from './traducoes'
export { converterMaoParaString } from './conversor-riichi'
export type { EsperaPossivel } from './esperas'
export { calcularEsperasPossiveis } from './esperas'
