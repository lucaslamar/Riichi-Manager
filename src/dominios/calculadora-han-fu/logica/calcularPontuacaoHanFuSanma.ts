import { calcularPagamentos, REGRAS_SANMA_PADRAO } from '@/compartilhado/mahjong/variante'
import { formatarPontos, formatarResultadoHanFu } from './formatarResultadoHanFu'
import type { ResultadoPontuacaoHanFu } from './tipos'

type Comum = Omit<
  ResultadoPontuacaoHanFu,
  'principal' | 'totalBase' | 'totalComHonba' | 'ron' | 'tsumo' | 'detalhePagamento' | 'totalFormatado'
>

/**
 * Pontuação de Sanma a partir da categoria já resolvida (mesma base do yonma):
 * Ron igual, Tsumo pago por 2 jogadores, conforme as regras de Sanma.
 */
export function calcularPontuacaoHanFuSanma(
  comum: Comum,
  regras = REGRAS_SANMA_PADRAO,
): ResultadoPontuacaoHanFu {
  const entrada = {
    han: comum.han,
    fu: comum.fu,
    dealer: comum.ehDealer,
    tipo: comum.tipoVitoria,
    variante: 'sanma' as const,
    regras,
    base: comum.base,
  }
  const comHonba = calcularPagamentos({ ...entrada, honba: comum.honba })
  const semHonba = calcularPagamentos({ ...entrada, honba: 0 })

  if (comum.tipoVitoria === 'ron') {
    return formatarResultadoHanFu({
      ...comum,
      variante: 'sanma',
      principal: comHonba.total,
      totalBase: semHonba.total,
      totalComHonba: comHonba.total,
      ron: comHonba.total,
      detalhePagamento: `Ron ${formatarPontos(comHonba.total)}`,
    })
  }

  const tsumo = comHonba.tsumo ?? { dealer: 0, naoDealer: 0 }
  return formatarResultadoHanFu({
    ...comum,
    variante: 'sanma',
    principal: comHonba.total,
    totalBase: semHonba.total,
    totalComHonba: comHonba.total,
    tsumo: { dealer: tsumo.dealer, nonDealer: tsumo.naoDealer, all: tsumo.todos },
    detalhePagamento: comum.ehDealer
      ? `Dealer ${formatarPontos(tsumo.dealer)} x2`
      : `Tsumo: dealer ${formatarPontos(tsumo.dealer)} / nao dealer ${formatarPontos(tsumo.naoDealer)}`,
  })
}
