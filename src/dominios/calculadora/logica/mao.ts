/**
 * @fileoverview Índice público da lógica da calculadora de mão.
 *
 * Os detalhes foram divididos por responsabilidade para facilitar estudo e
 * manutenção: tipos, configuração, tradução, conversão para a lib, cálculo,
 * calculadora rápida e ordenação/contadores.
 */

export type { Acao, CodigoPedra, Mao, Meld, VentoMao } from './tipos'
export { criarAcao } from './tipos'
export type { ConfiguracaoCalculo } from './configuracao'
export { configuracaoPadrao } from './configuracao'
export type { DetalheFu, PontosCalculados, ResultadoMao } from './resultado'
export { calcularMao } from './calculo-mao'
export {
  calcularHanFu,
  calcularPatamarHanFu,
  fuValidos,
  montarPontosRapidos,
  arredondar100,
} from './calculadora-rapida'
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
