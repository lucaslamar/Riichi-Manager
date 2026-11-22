/**
 * Cenários de virada entre dois jogadores, em pontos do ranking. Sem tela.
 * Quem persegue é sempre quem está atrás, e `alvo` é quanto ele precisa ganhar.
 */
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import { calcularOka, type ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'
import type { ValoresUma } from '@/dominios/centerpiece/logica/uma'
import { maosParaCobrir } from '@/dominios/torneio/logica/distanciaPodio'

const umaCasa = (valor: number) => Math.round(valor * 10) / 10

export type Necessidade =
  | { situacao: 'jaPassa' | 'jaEmpata' }
  | { situacao: 'precisa'; terceiros: number; direto: number }

/** Ron direto conta em dobro: o que um ganha, o outro perde. */
export function necessidade(
  alvo: number,
  unidade: UnidadeDistancia,
  regras: RegrasDoModo,
): Necessidade {
  const arredondado = umaCasa(alvo)
  if (arredondado < 0) return { situacao: 'jaPassa' }
  if (arredondado === 0) return { situacao: 'jaEmpata' }
  return {
    situacao: 'precisa',
    terceiros: maosParaCobrir(arredondado, unidade, regras),
    direto: maosParaCobrir(arredondado, { ...unidade, valor: unidade.valor * 2 }, regras),
  }
}

type RegrasBonus = Pick<ConfigMesa, 'uma' | 'pontosPartida' | 'pontosRetorno'>

/**
 * O que cada colocação rende a quem termina com os pontos de partida: uma, oka e retorno.
 * A uma flutuante depende da mesa, então usa a linha de 2 jogadores acima do retorno.
 */
export function bonusDasPosicoes(config: RegrasBonus): ValoresUma {
  const uma = config.uma.tipo === 'fixa' ? config.uma.valores : config.uma.tabela.dois
  const base = (config.pontosPartida - config.pontosRetorno) / 1000
  const oka = calcularOka(config) / 1000
  return uma.map((valor, indice) =>
    umaCasa(valor + base + (indice === 0 ? oka : 0)),
  ) as ValoresUma
}

export interface CenarioLider {
  final: 'ultimo' | 'zero' | 'primeiro'
  /** Quanto o líder faz no próximo jogo. */
  variacao: number
  alvo: number
}

export function cenariosDoLider(diferenca: number, bonus: ValoresUma): CenarioLider[] {
  const finais = [
    ['ultimo', bonus[3]],
    ['zero', 0],
    ['primeiro', bonus[0]],
  ] as const
  return finais.map(([final, variacao]) => ({
    final,
    variacao,
    alvo: umaCasa(diferenca + variacao),
  }))
}

export interface CenarioComUma {
  colocacao: 1 | 2 | 3
  bonus: number
  alvo: number
}

/** Com o líder no zero: o que falta em mãos depois da uma da colocação de quem persegue. */
export function cenariosComUma(diferenca: number, bonus: ValoresUma): CenarioComUma[] {
  return ([1, 2, 3] as const).map((colocacao) => ({
    colocacao,
    bonus: bonus[colocacao - 1],
    alvo: umaCasa(diferenca - bonus[colocacao - 1]),
  }))
}
