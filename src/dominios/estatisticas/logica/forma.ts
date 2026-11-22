/**
 * Como cada um costuma terminar, só pelo resultado das mesas, e a chance de virar se
 * continuar assim. Não usa mão nenhuma: em torneio ninguém lança mão. Sem tela.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { ValoresUma } from '@/dominios/centerpiece/logica/uma'

/** Com menos jogos que isto o app projeta, mas não dá porcentagem. */
export const MINIMO_PARA_CHANCE = 3

const media = (valores: readonly number[]) =>
  valores.reduce((soma, valor) => soma + valor, 0) / valores.length

/** De onde sai a forma, e as regras que valem para o próximo jogo. */
export interface BaseDaForma {
  partidas: readonly Partida[]
  pontosPartida: number
  bonus: ValoresUma
}

export interface FormaDoJogador {
  jogos: number
  /** Com quantos pontos de mesa costuma terminar, nas regras atuais. */
  pontosNaMesa: number
  /** Quanto costuma fazer por jogo no ranking, com a uma das regras atuais. */
  porJogo: number
  /** O quanto varia de um jogo para o outro. */
  variancia: number
}

/**
 * Cada mesa entra pelo saldo (final − partida) e pela colocação, para juntar mesas de
 * 25.000 e de 30.000, com umas diferentes. A saída por W.O. do próprio jogador não conta.
 */
export function formaDoJogador(base: BaseDaForma, jogadorId: string): FormaDoJogador | null {
  const jogos = base.partidas.flatMap(({ resultado = [], config }) => {
    const linha = resultado.find((item) => item.jogadorId === jogadorId)
    if (!linha || linha.saiu) return []
    const empatados = resultado.filter((item) => item.colocacao === linha.colocacao).length
    const lugares = base.bonus.slice(linha.colocacao - 1, linha.colocacao - 1 + empatados)
    const saldo = (linha.pontosBrutos - config.pontosPartida) / 1000
    return [{ saldo, resultado: saldo + media(lugares) }]
  })
  if (jogos.length === 0) return null

  const porJogo = media(jogos.map((jogo) => jogo.resultado))
  const desvios = jogos.reduce((soma, jogo) => soma + (jogo.resultado - porJogo) ** 2, 0)
  const saldoMedio = media(jogos.map((jogo) => jogo.saldo))
  return {
    jogos: jogos.length,
    pontosNaMesa: Math.round((base.pontosPartida + saldoMedio * 1000) / 100) * 100,
    porJogo,
    variancia: jogos.length > 1 ? desvios / (jogos.length - 1) : 0,
  }
}

/** Probabilidade acumulada da normal padrão (Abramowitz e Stegun, 26.2.17). */
function normalAcumulada(desvios: number): number {
  const fator = 1 / (1 + 0.2316419 * Math.abs(desvios))
  const polinomio =
    fator *
    (0.31938153 + fator * (-0.356563782 + fator * (1.781477937 + fator * (-1.821255978 + fator * 1.330274429))))
  const cauda = (Math.exp((-desvios * desvios) / 2) / Math.sqrt(2 * Math.PI)) * polinomio
  return desvios >= 0 ? 1 - cauda : cauda
}

export interface ProjecaoPelaForma {
  /** Até o fim do torneio, ou só o próximo jogo quando não há fim conhecido. */
  ate: 'fim' | 'proximo'
  /** O que ainda falta se os dois terminarem como costumam. Negativo: passa com folga. */
  falta: number
  /** De 0 a 1. null: poucos jogos para dar porcentagem. */
  chance: number | null
}

interface LadoDaProjecao {
  forma: FormaDoJogador | null
  /** null: sem número de jogos definido. */
  restantes: number | null
}

/**
 * Os dois jogam o que falta no ritmo deles. A chance trata os jogos como independentes
 * e a soma como uma curva normal: é estimativa.
 */
export function projetarPelaForma(
  diferenca: number,
  perseguidor: LadoDaProjecao,
  lider: LadoDaProjecao,
): ProjecaoPelaForma | null {
  const temFim = perseguidor.restantes !== null && lider.restantes !== null
  const jogosDele = temFim ? perseguidor.restantes! : 1
  const jogosDoLider = temFim ? lider.restantes! : 1
  if (jogosDele === 0 && jogosDoLider === 0) return null
  // Quem não joga mais não precisa de histórico.
  if ((jogosDele > 0 && !perseguidor.forma) || (jogosDoLider > 0 && !lider.forma)) return null

  const lados = [
    { jogos: jogosDele, forma: perseguidor.forma, sinal: 1 },
    { jogos: jogosDoLider, forma: lider.forma, sinal: -1 },
  ].filter((lado) => lado.jogos > 0)
  let ganho = 0
  let variancia = 0
  for (const { jogos, forma, sinal } of lados) {
    ganho += sinal * jogos * forma!.porJogo
    variancia += jogos * forma!.variancia
  }

  const falta = Math.round((diferenca - ganho) * 10) / 10
  const bastante = lados.every((lado) => lado.forma!.jogos >= MINIMO_PARA_CHANCE)
  const chance = !bastante
    ? null
    : variancia === 0
      ? Number(falta < 0)
      : normalAcumulada(-falta / Math.sqrt(variancia))
  return { ate: temFim ? 'fim' : 'proximo', falta, chance }
}
