/**
 * @fileoverview Avaliação de qualidade da grade de sorteio.
 *
 * Após gerar uma grade, calculamos uma pontuação de qualidade para saber se
 * os emparelhamentos são balanceados. O algoritmo tenta minimizar:
 * - Repetição de pares (mesmos dois jogadores se enfrentam mais de uma vez)
 * - Repetição de ventos (mesma posição em rodadas consecutivas)
 * - Mesas completamente iguais (todos os 4 jogadores repetidos)
 */

import { MAX_ADVERSARIOS_REPETIDOS, MIN_JOGADORES_DISPERSAO, VENTOS } from './constantes'
import type { ParRepetido, RelatorioQualidade, RepetidosPorJogador, Rodada } from './tipos'

/** Tipo opaco para chaves de par de jogadores. */
type ChavePar = string

/**
 * Cria uma chave única e ordenada para um par de jogadores.
 * "Alice::Bob" é a mesma chave que "Bob::Alice".
 *
 * @param a - Nome do primeiro jogador.
 * @param b - Nome do segundo jogador.
 * @returns Chave canônica do par.
 */
export function chavePar(a: string, b: string): ChavePar {
  return [a, b].sort((x, y) => x.localeCompare(y)).join('::')
}

/**
 * Cria uma chave única para uma mesa inteira (todos os 4 jogadores).
 * Usada para detectar mesas completamente repetidas.
 *
 * @param jogadores - Nomes dos 4 jogadores da mesa.
 * @returns Chave canônica da mesa.
 */
export function chaveMesaCompleta(jogadores: string[]): string {
  return [...jogadores].sort((a, b) => a.localeCompare(b)).join('::')
}

/**
 * Constrói um mapa de quantas vezes cada par de jogadores se enfrentou.
 *
 * @param rodadas - Grade completa do torneio.
 * @returns Map de ChavePar → número de encontros.
 */
export function contarPares(rodadas: Rodada[]): Map<ChavePar, number> {
  const pares = new Map<ChavePar, number>()

  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      const jogadores = mesa.assentos.map((a) => a.jogador)

      for (let i = 0; i < jogadores.length; i++) {
        for (let j = i + 1; j < jogadores.length; j++) {
          const chave = chavePar(jogadores[i], jogadores[j])
          pares.set(chave, (pares.get(chave) ?? 0) + 1)
        }
      }
    }
  }

  return pares
}

/**
 * Avalia a qualidade de uma grade gerada e retorna um relatório detalhado.
 *
 * @param rodadas - Grade completa do torneio.
 * @param totalJogadores - Número total de jogadores (para calcular o ideal).
 * @returns RelatorioQualidade com métricas e pontuação.
 */
export function avaliarGrade(rodadas: Rodada[], totalJogadores: number): RelatorioQualidade {
  const pares = contarPares(rodadas)
  const mesasVistas = new Set<string>()
  let mesasRepetidas = 0
  let repeticoesVento = 0

  // Detectar mesas completamente repetidas.
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      const chave = chaveMesaCompleta(mesa.assentos.map((assento) => assento.jogador))
      if (mesasVistas.has(chave)) mesasRepetidas++
      else mesasVistas.add(chave)
    }
  }

  // Calcular repetições de vento por jogador entre rodadas consecutivas.
  for (let indiceRodada = 1; indiceRodada < rodadas.length; indiceRodada++) {
    const ventoAnterior = new Map<string, string>()
    for (const mesa of rodadas[indiceRodada - 1].mesas) {
      for (const assento of mesa.assentos) {
        ventoAnterior.set(assento.jogador, assento.vento)
      }
    }
    for (const mesa of rodadas[indiceRodada].mesas) {
      for (const assento of mesa.assentos) {
        if (ventoAnterior.get(assento.jogador) === assento.vento) repeticoesVento++
      }
    }
  }

  // Analisar pares repetidos.
  const paresRepetidos: ParRepetido[] = []
  let maxRepeticoes = 0
  let duasVezes = 0
  let tresVezesMais = 0

  for (const [chave, vezes] of pares) {
    if (vezes > 1) {
      const [a, b] = chave.split('::') as [string, string]
      paresRepetidos.push({ jogadores: [a, b], vezes })
      if (vezes >= 3) tresVezesMais++
      else duasVezes++
    }
    if (vezes > maxRepeticoes) maxRepeticoes = vezes
  }

  // Número de repetições que se espera em um torneio round-robin incompleto.
  const mesas = totalJogadores / VENTOS.length
  const totalPares = (totalJogadores * (totalJogadores - 1)) / 2
  const paresPorRodada = mesas * 6 // C(4,2) = 6 pares por mesa
  const idealRepetidos = Math.max(0, paresPorRodada * rodadas.length - totalPares)

  // Verificar se cada jogador jogou exatamente uma vez como Leste.
  const contadorLeste = new Map<string, number>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      for (const assento of mesa.assentos) {
        if (assento.vento === 'Leste') {
          contadorLeste.set(assento.jogador, (contadorLeste.get(assento.jogador) ?? 0) + 1)
        }
      }
    }
  }
  const vezesLeste = [...contadorLeste.values()]
  const lesteExato =
    contadorLeste.size === totalJogadores || rodadas.length < VENTOS.length
      ? vezesLeste.every((vezes) => vezes <= Math.ceil(rodadas.length / VENTOS.length))
      : false

  // Verificar dispersão de adversários repetidos por jogador (torneios grandes).
  const limiteRepetidos =
    totalJogadores >= MIN_JOGADORES_DISPERSAO ? MAX_ADVERSARIOS_REPETIDOS : null
  const adversariosRepetidosPorJogador = new Map<string, Set<string>>()

  for (const [chave, vezes] of pares) {
    if (vezes > 1) {
      const [a, b] = chave.split('::') as [string, string]
      if (!adversariosRepetidosPorJogador.has(a)) adversariosRepetidosPorJogador.set(a, new Set())
      if (!adversariosRepetidosPorJogador.has(b)) adversariosRepetidosPorJogador.set(b, new Set())
      adversariosRepetidosPorJogador.get(a)!.add(b)
      adversariosRepetidosPorJogador.get(b)!.add(a)
    }
  }

  let maxRepetidosPorJogador = 0
  const jogadoresComExcesso: RepetidosPorJogador[] = []

  for (const [jogador, adversarios] of adversariosRepetidosPorJogador) {
    const quantidade = adversarios.size
    if (quantidade > maxRepetidosPorJogador) maxRepetidosPorJogador = quantidade
    if (limiteRepetidos !== null && quantidade > limiteRepetidos) {
      jogadoresComExcesso.push({ jogador, quantidade, adversarios: [...adversarios] })
    }
  }

  // Pontuação de qualidade: quanto menor, melhor.
  const score =
    tresVezesMais * 1000 +
    duasVezes * 10 +
    repeticoesVento +
    mesasRepetidas * 500 +
    (lesteExato ? 0 : 50)

  return {
    score,
    maxRepeticioesPar: maxRepeticoes,
    paresRepetidos: paresRepetidos.sort((a, b) => b.vezes - a.vezes),
    quantidadeParesRepetidos: paresRepetidos.length,
    quantidadeIdealRepetidos: idealRepetidos,
    quantidadeDuasVezes: duasVezes,
    quantidadeTresVezesMais: tresVezesMais,
    lesteExato,
    repeticoesVento,
    mesasCompletasRepetidas: mesasRepetidas,
    limiteRepetidosPorJogador: limiteRepetidos,
    maxRepetidosPorJogador,
    jogadoresComExcesso,
  }
}

export type NotaGrade = 'perfeita' | 'boa' | 'regular' | 'ruim'

export function notaDaGrade(qualidade: RelatorioQualidade): NotaGrade {
  if (qualidade.quantidadeTresVezesMais > 0 || qualidade.mesasCompletasRepetidas > 0) return 'ruim'
  if (qualidade.quantidadeDuasVezes === 0) return 'perfeita'
  if (qualidade.quantidadeDuasVezes <= qualidade.quantidadeIdealRepetidos) return 'boa'
  return 'regular'
}

/** Quantas vezes cada jogador ficou em cada vento, nesta ordem: Leste, Sul, Oeste, Norte. */
export function distribuicaoDeVentos(rodadas: Rodada[]): Map<string, [number, number, number, number]> {
  const contagem = new Map<string, [number, number, number, number]>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      for (const assento of mesa.assentos) {
        const linha = contagem.get(assento.jogador) ?? [0, 0, 0, 0]
        linha[VENTOS.indexOf(assento.vento)] += 1
        contagem.set(assento.jogador, linha)
      }
    }
  }
  return contagem
}

/**
 * Encontros indiretos: pares que não jogam juntos, mas enfrentam ao menos um
 * adversário em comum. Devolve quantos pares nunca se enfrentam e quantos deles
 * têm adversário em comum.
 */
export function coberturaIndireta(rodadas: Rodada[]) {
  const adversarios = new Map<string, Set<string>>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      for (const assento of mesa.assentos) {
        const conjunto = adversarios.get(assento.jogador) ?? new Set<string>()
        for (const outro of mesa.assentos) {
          if (outro.jogador !== assento.jogador) conjunto.add(outro.jogador)
        }
        adversarios.set(assento.jogador, conjunto)
      }
    }
  }
  const jogadores = [...adversarios.keys()]
  let semEncontro = 0
  let comIndireto = 0
  for (let primeiro = 0; primeiro < jogadores.length; primeiro += 1) {
    for (let segundo = primeiro + 1; segundo < jogadores.length; segundo += 1) {
      const deA = adversarios.get(jogadores[primeiro])
      const deB = adversarios.get(jogadores[segundo])
      if (!deA || !deB || deA.has(jogadores[segundo])) continue
      semEncontro += 1
      if ([...deA].some((nome) => deB.has(nome))) comIndireto += 1
    }
  }
  return { semEncontro, comIndireto }
}
