import type { ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import type { ResultadoPontuacaoHanFu } from '@/dominios/calculadora-han-fu/logica/tipos'

export interface ResultadoCalculoParaCenterpiece {
  origem?: 'calculadora-mao' | 'calculadora-han-fu'
  tipoVitoria: 'ron' | 'tsumo'
  vencedorId?: string
  pagadorId?: string
  vencedorEhLeste?: boolean
  pontosRon?: number
  pagamentoDealer?: number
  pagamentoNaoDealer?: number
  han?: number
  fu?: number
  yakuman?: number
  categoria?: string
  honbaUsado?: number
  incluiHonba: boolean
}

interface MetadadosCenterpiece {
  vencedorId?: string
  pagadorId?: string
  vencedorEhLeste?: boolean
  honbaUsado?: number
}

export function converterHanFuParaCenterpiece(
  resultado: ResultadoPontuacaoHanFu,
  metadados: MetadadosCenterpiece = {},
): ResultadoCalculoParaCenterpiece {
  const base = {
    origem: 'calculadora-han-fu' as const,
    ...metadados,
    han: resultado.han,
    fu: resultado.fu,
    yakuman: resultado.yakumanMultiplo,
    categoria: resultado.nomeCategoria ?? undefined,
    honbaUsado: resultado.honba,
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
  metadados: MetadadosCenterpiece = {},
): ResultadoCalculoParaCenterpiece | null {
  if (!resultado.agari) return null

  const base = {
    origem: 'calculadora-mao' as const,
    ...metadados,
    han: resultado.han,
    fu: resultado.fu,
    yakuman: resultado.yakuman,
    categoria: resultado.nome ?? undefined,
    honbaUsado: metadados.honbaUsado ?? 0,
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
