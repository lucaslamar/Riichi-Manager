import type { ConfiguracaoCalculo, ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import type { Variante } from '@/compartilhado/mahjong/variante'
import type { ResultadoPontuacaoHanFu } from '@/dominios/calculadora-han-fu/logica/tipos'
import type { CodigoPedra, Mao, VentoMao } from '@/dominios/calculadora-mao/logica/mao'
import { gerarNotacaoCompleta } from '@/dominios/calculadora-mao/logica/notacao'
import type { DadosDaPartida } from './dadosDaPartida'

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
  /** Só em "Montar mão": a mão como foi calculada, para o histórico. */
  maoMontada?: MaoMontada
}

/** Só dados: o histórico mostra isto sem recalcular nada. */
export interface MaoMontada {
  notacao: string
  mao: Mao
  resultado: ResultadoMao
  /** Regras ativas na hora; mãos antigas não têm. */
  regras?: ConfiguracaoCalculo
}

export function montarMaoParaHistorico(
  mao: Mao,
  resultado: ResultadoMao,
  regras?: ConfiguracaoCalculo,
): MaoMontada {
  return {
    notacao: gerarNotacaoCompleta(mao.pedras, mao.indiceAgari, mao.melds),
    mao,
    resultado,
    ...(regras ? { regras } : {}),
  }
}

/** O que a Calculadora de Mão recebe quando é aberta pelo modal de batida. */
export interface ContextoCenterpieceMao {
  tipoVitoria: 'ron' | 'tsumo'
  ventoRodada: VentoMao
  ventoAssento: VentoMao
  honba: number
  rodadaNumero?: number
  vencedorId?: string
  pagadorId?: string
  vencedorEhLeste?: boolean
  vencedorNome?: string
  jogadorRiichi?: boolean
  /** Regras da mesa: a calculadora não oferece a engrenagem. */
  regras?: ConfiguracaoCalculo
  /** Ron pelo descarte: a pedra que vira a batida, já marcada e sem troca. */
  pedraBatida?: CodigoPedra
  /** O que a linha do tempo da mão já diz: vem preenchido, mas dá para mudar. */
  dados?: DadosDaPartida
  /** Variante da mesa (Sanma = 3 jogadores). Ausente = yonma. */
  variante?: Variante
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
