/**
 * @fileoverview Algoritmo de sorteio de grade balanceada (Riichi Fast Tournament).
 *
 * Objetivo: distribuir os jogadores em mesas de 4, para N rodadas,
 * minimizando repetições de pares e garantindo que cada jogador
 * jogue exatamente uma vez como Leste.
 *
 * Estratégia:
 * 1. Embaralha a lista de jogadores.
 * 2. Tenta gerar a grade várias vezes (MAX_TENTATIVAS_SORTEIO).
 * 3. Guarda a melhor grade encontrada (menor score de qualidade).
 */

import { MAX_TENTATIVAS_SORTEIO, TOTAL_RODADAS, PONTUACAO_INICIAL, VENTOS } from '../torneio/constantes'
import { avaliarGrade, chavePar } from './qualidade'
import { embaralhar } from '../torneio/aleatorio'
import type { CandidatoGrade, Mesa, Rodada, Assento, Vento } from '../torneio/tipos'

type ChavePar = string

/** Penalidade de par: quanto maior a repetição, mais cara fica a combinação. */
function penalPar(jogadores: string[], contagem: Map<ChavePar, number>): number {
  let penalidade = 0
  for (let i = 0; i < jogadores.length; i++) {
    for (let j = i + 1; j < jogadores.length; j++) {
      const encontros = contagem.get(chavePar(jogadores[i], jogadores[j])) ?? 0
      penalidade += encontros * encontros
    }
  }
  return penalidade
}

/** Registra todos os pares de uma mesa no mapa de contagem. */
function registrarParesMesa(jogadores: string[], contagem: Map<ChavePar, number>): void {
  for (let i = 0; i < jogadores.length; i++) {
    for (let j = i + 1; j < jogadores.length; j++) {
      const chave = chavePar(jogadores[i], jogadores[j])
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
    }
  }
}

/**
 * Constrói uma rodada do torneio.
 * Cada mesa recebe exatamente um jogador de cada vento, escolhido
 * para minimizar repetições de pares.
 */
function construirRodada(
  indiceRodada: number,
  jogadores: string[],
  offsetVentoPorJogador: Map<string, number>,
  contagemPares: Map<ChavePar, number>,
): Rodada {
  // Agrupa jogadores pelo vento que lhes cabe nesta rodada.
  const jogadoresPorVento = new Map<Vento, string[]>(VENTOS.map((v) => [v, []]))

  for (const jogador of jogadores) {
    const vento = VENTOS[(indiceRodada + (offsetVentoPorJogador.get(jogador) ?? 0)) % VENTOS.length]
    jogadoresPorVento.get(vento)!.push(jogador)
  }

  // Embaralha dentro de cada vento para variar a distribuição entre mesas.
  const embaralhados = new Map<Vento, string[]>(
    VENTOS.map((v) => [v, embaralhar(jogadoresPorVento.get(v)!)]),
  )

  const totalMesas = jogadores.length / VENTOS.length
  const mesas: Mesa[] = []

  for (let m = 0; m < totalMesas; m++) {
    const assentos: Assento[] = []

    // Escolhe um jogador de cada vento para esta mesa, priorizando o de menor penalidade.
    for (const vento of embaralhar([...VENTOS])) {
      const candidatos = embaralhados.get(vento)!
      const jaEscolhidos = assentos.map((a) => a.jogador)

      let melhorIndice = 0
      let melhorPenalidade = Infinity

      for (let c = 0; c < candidatos.length; c++) {
        const penalidade = penalPar([...jaEscolhidos, candidatos[c]], contagemPares)
        if (penalidade < melhorPenalidade) {
          melhorPenalidade = penalidade
          melhorIndice = c
        }
      }

      // Remove o jogador escolhido da lista de disponíveis para este vento.
      const [escolhido] = candidatos.splice(melhorIndice, 1)
      assentos.push({ vento, jogador: escolhido, pontuacao: PONTUACAO_INICIAL })
    }

    mesas.push({ id: m + 1, assentos })
    registrarParesMesa(assentos.map((a) => a.jogador), contagemPares)
  }

  return { id: indiceRodada + 1, mesas }
}

/**
 * Gera a grade completa do torneio fast, tentando várias vezes e guardando
 * a melhor versão encontrada.
 *
 * @param jogadores - Array embaralhado de nomes dos jogadores.
 * @returns O melhor candidato de grade encontrado.
 */
export function gerarGrade(jogadores: string[]): CandidatoGrade {
  let melhorCandidato: CandidatoGrade | null = null

  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_SORTEIO; tentativa++) {
    // Cada jogador recebe um "offset" que determina em qual vento ele começa.
    // Dividir igualmente garante que exatamente 1/4 começa em cada vento.
    const ordemEmbaralhada = embaralhar(jogadores)
    const offsetPorJogador = new Map<string, number>(
      ordemEmbaralhada.map((j, i) => [j, i % VENTOS.length]),
    )

    const contagemPares = new Map<ChavePar, number>()
    const rodadas: Rodada[] = []

    for (let r = 0; r < TOTAL_RODADAS; r++) {
      rodadas.push(construirRodada(r, jogadores, offsetPorJogador, contagemPares))
    }

    const qualidade = avaliarGrade(rodadas, jogadores.length)
    const candidato: CandidatoGrade = { rodadas, qualidade }

    if (melhorCandidato === null || qualidade.score < melhorCandidato.qualidade.score) {
      melhorCandidato = candidato
    }

    // Se a grade for perfeita, para cedo.
    if (qualidade.score === 0) break
  }

  return melhorCandidato!
}
