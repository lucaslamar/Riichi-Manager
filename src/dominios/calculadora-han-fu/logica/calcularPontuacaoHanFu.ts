import {
  CATEGORIAS_PONTUACAO,
  arredondarCentena,
  normalizarFu,
  normalizarHan,
  normalizarHonba,
  obterYakumanMultiplo,
  resolverCategoria,
  rotularYakumanMultiplo,
} from './tabelaPontuacao'
import { formatarPontos, formatarResultadoHanFu } from './formatarResultadoHanFu'
import type { EntradaPontuacaoHanFu, ResultadoPontuacaoHanFu } from './tipos'

export function calcularPontuacaoHanFu(entrada: EntradaPontuacaoHanFu): ResultadoPontuacaoHanFu {
  const han = normalizarHan(entrada.han)
  const fu = normalizarFu(han, entrada.fu)
  const honba = normalizarHonba(entrada.honba)
  const { categoria, base } = resolverCategoria(han, fu)
  const yakumanMultiplo = obterYakumanMultiplo(han)
  const modoYakuman = yakumanMultiplo > 0
  const nomeCategoria =
    categoria === 'yakuman' ? rotularYakumanMultiplo(yakumanMultiplo) : CATEGORIAS_PONTUACAO[categoria].nome
  const ehLimite = categoria !== 'normal'
  const descricao = modoYakuman ? (han >= 14 ? `${yakumanMultiplo}Y` : '13 Han') : nomeCategoria ?? `${han} Han ${fu} Fu`

  if (entrada.tipoVitoria === 'ron') {
    const ronBase = arredondarCentena(base * (entrada.ehDealer ? 6 : 4))
    const ron = ronBase + honba * 300
    return formatarResultadoHanFu({
      han,
      fu,
      yakumanMultiplo,
      ehDealer: entrada.ehDealer,
      tipoVitoria: 'ron',
      honba,
      categoria,
      nomeCategoria,
      base,
      principal: ron,
      totalBase: ronBase,
      totalComHonba: ron,
      ron,
      descricao,
      detalhePagamento: `Ron ${formatarPontos(ron)}`,
      ehLimite,
      modoYakuman,
    })
  }

  if (entrada.ehDealer) {
    const pagamentoBase = arredondarCentena(base * 2)
    const all = pagamentoBase + honba * 100
    return formatarResultadoHanFu({
      han,
      fu,
      yakumanMultiplo,
      ehDealer: true,
      tipoVitoria: 'tsumo',
      honba,
      categoria,
      nomeCategoria,
      base,
      principal: all * 3,
      totalBase: pagamentoBase * 3,
      totalComHonba: all * 3,
      tsumo: { dealer: all, nonDealer: all, all },
      descricao,
      detalhePagamento: `Dealer ${formatarPontos(all)} all`,
      ehLimite,
      modoYakuman,
    })
  }

  const dealerBase = arredondarCentena(base * 2)
  const nonDealerBase = arredondarCentena(base)
  const dealer = dealerBase + honba * 100
  const nonDealer = nonDealerBase + honba * 100

  return formatarResultadoHanFu({
    han,
    fu,
    yakumanMultiplo,
    ehDealer: false,
    tipoVitoria: 'tsumo',
    honba,
    categoria,
    nomeCategoria,
    base,
    principal: dealer + nonDealer * 2,
    totalBase: dealerBase + nonDealerBase * 2,
    totalComHonba: dealer + nonDealer * 2,
    tsumo: { dealer, nonDealer },
    descricao,
    detalhePagamento: `Tsumo: dealer ${formatarPontos(dealer)} / nao dealer ${formatarPontos(nonDealer)}`,
    ehLimite,
    modoYakuman,
  })
}
