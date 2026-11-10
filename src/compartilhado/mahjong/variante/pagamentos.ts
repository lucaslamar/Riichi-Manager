import {
  aplicarHonba,
  arredondar100,
  calcularHanFu,
  calcularPatamarHanFu,
  configuracaoPadrao,
  montarPontosRapidos,
  valorPorHonba,
  type ConfiguracaoCalculo,
} from '../pontuacao'
import { REGRAS_SANMA_PADRAO } from './regras-padrao'
import type { RegrasSanma, Variante } from './tipos'

export interface EntradaPagamentos {
  han: number
  fu: number
  dealer: boolean
  tipo: 'ron' | 'tsumo'
  honba: number
  variante: Variante
  regras?: RegrasSanma
  config?: ConfiguracaoCalculo
  /** Pontos base já resolvidos (yakuman múltiplo etc.); senão saem de han e fu. */
  base?: number
}

export interface Pagamentos {
  /** Ron: quanto o descartador paga. */
  ron?: number
  /** Tsumo: quanto paga o dealer e cada não dealer (dealer venceu: `todos`). */
  tsumo?: { dealer: number; naoDealer: number; todos?: number }
  total: number
  /** Parte só do honba, já somada ao total. */
  honbaTotal: number
}

function tabelaDaBase(base: number) {
  return {
    tsumoOya: arredondar100(base * 2),
    tsumoKo: arredondar100(base),
    ronOya: arredondar100(base * 6),
    ronKo: arredondar100(base * 4),
  }
}

/** Yonma: delega para a pontuação existente e devolve os mesmos números de sempre. */
function pagamentosYonma(entrada: EntradaPagamentos, config: ConfiguracaoCalculo, honba: number): Pagamentos {
  const tabela =
    entrada.base === undefined ? calcularHanFu(entrada.han, entrada.fu, config) : tabelaDaBase(entrada.base)
  const semHonba = montarPontosRapidos(entrada.dealer, entrada.tipo, tabela)
  const comHonba = aplicarHonba(semHonba, honba, valorPorHonba(config))
  if (comHonba.agari === null) throw new Error('agari inválido')
  const honbaTotal = comHonba.pontos.total - semHonba.pontos.total
  if (comHonba.agari === 'ron') return { ron: comHonba.pontos.total, total: comHonba.pontos.total, honbaTotal }
  const tsumo = entrada.dealer
    ? { dealer: comHonba.pontos.oya.ko, naoDealer: comHonba.pontos.oya.ko, todos: comHonba.pontos.oya.ko }
    : { dealer: comHonba.pontos.ko.oya, naoDealer: comHonba.pontos.ko.ko }
  return { tsumo, total: comHonba.pontos.total, honbaTotal }
}

/**
 * Pagamentos de uma vitória. No Sanma, o tsumo é pago por 2 jogadores: com
 * Tsumo-son a parte do Norte se perde; com Divisão do Norte ela é dividida entre
 * os dois pagantes (arredondada para cima, de 100 em 100).
 */
export function calcularPagamentos(entrada: EntradaPagamentos): Pagamentos {
  const config = entrada.config ?? configuracaoPadrao
  const honba = Number.isFinite(entrada.honba) && entrada.honba > 0 ? entrada.honba : 0
  if (entrada.variante === 'yonma') return pagamentosYonma(entrada, config, honba)

  const regras = entrada.regras ?? REGRAS_SANMA_PADRAO
  const base = entrada.base ?? calcularPatamarHanFu(entrada.han, entrada.fu, config).base

  if (entrada.tipo === 'ron') {
    const honbaTotal = honba * regras.honbaRon
    const ron = arredondar100(base * (entrada.dealer ? 6 : 4)) + honbaTotal
    return { ron, total: ron, honbaTotal }
  }

  const honbaCada = honba * regras.honbaTsumoPorJogador
  const divisao = regras.pagamentoTsumo === 'divisao-norte'

  if (entrada.dealer) {
    const cada = arredondar100(base * 2)
    const paga = cada + (divisao ? arredondar100(cada / 2) : 0) + honbaCada
    return { tsumo: { dealer: paga, naoDealer: paga, todos: paga }, total: paga * 2, honbaTotal: honbaCada * 2 }
  }

  const doNaoDealer = arredondar100(base)
  const extra = divisao ? arredondar100(doNaoDealer / 2) : 0
  const dealer = arredondar100(base * 2) + extra + honbaCada
  const naoDealer = doNaoDealer + extra + honbaCada
  return { tsumo: { dealer, naoDealer }, total: dealer + naoDealer, honbaTotal: honbaCada * 2 }
}
