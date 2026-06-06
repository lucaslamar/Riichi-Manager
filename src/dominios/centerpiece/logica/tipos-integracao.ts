import type { ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import type { ResultadoPontuacaoHanFu } from '@/dominios/calculadora-han-fu/logica/tipos'

export interface ResultadoCalculoParaCenterpiece {
  tipoVitoria: 'ron' | 'tsumo'
  pontosRon?: number
  pagamentoDealer?: number
  pagamentoNaoDealer?: number
  han?: number
  fu?: number
  yakuman?: number
  categoria?: string
  incluiHonba: boolean
}

export function converterHanFuParaCenterpiece(
  resultado: ResultadoPontuacaoHanFu,
): ResultadoCalculoParaCenterpiece {
  const base = {
    han: resultado.han,
    fu: resultado.fu,
    yakuman: resultado.yakumanMultiplo,
    categoria: resultado.nomeCategoria ?? undefined,
    incluiHonba: true,
  }

  if (resultado.tipoVitoria === 'ron') {
    return { ...base, tipoVitoria: 'ron', pontosRon: resultado.ron ?? 0 }
  }

  if (resultado.ehDealer) {
    return {
      ...base,
      tipoVitoria: 'tsumo',
      pagamentoDealer: 0,
      pagamentoNaoDealer: resultado.tsumo?.all ?? resultado.tsumo?.dealer ?? 0,
    }
  }

  return {
    ...base,
    tipoVitoria: 'tsumo',
    pagamentoDealer: resultado.tsumo?.dealer ?? 0,
    pagamentoNaoDealer: resultado.tsumo?.nonDealer ?? 0,
  }
}

export function converterMaoParaCenterpiece(
  resultado: ResultadoMao,
): ResultadoCalculoParaCenterpiece | null {
  if (!resultado.agari) return null

  const base = {
    han: resultado.han,
    fu: resultado.fu,
    yakuman: resultado.yakuman,
    categoria: resultado.nome ?? undefined,
    incluiHonba: true,
  }

  if (resultado.agari === 'ron') {
    const pontosRon = resultado.isOya
      ? resultado.pontos.oya.ron
      : resultado.pontos.ko.ron
    return { ...base, tipoVitoria: 'ron', pontosRon }
  }

  if (resultado.agari === 'tsumo') {
    if (resultado.isOya) {
      return {
        ...base,
        tipoVitoria: 'tsumo',
        pagamentoDealer: 0,
        pagamentoNaoDealer: resultado.pontos.oya.ko,
      }
    }
    return {
      ...base,
      tipoVitoria: 'tsumo',
      pagamentoDealer: resultado.pontos.ko.oya,
      pagamentoNaoDealer: resultado.pontos.ko.ko,
    }
  }

  return null
}
