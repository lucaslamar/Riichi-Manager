/**
 * @fileoverview Ações puras do torneio — timer e pontuação.
 *
 * "Função pura" significa: recebe um estado, devolve um estado NOVO.
 * Nunca modifica o objeto original (imutabilidade).
 *
 * Por que isso importa no React?
 * O React detecta mudanças comparando referências de objetos.
 * Se modificarmos o objeto original (mutação), o React não "vê" a mudança
 * e não re-renderiza. Ao retornar um objeto novo ({ ...estado, campo: novoValor }),
 * a referência muda e o React sabe que precisa atualizar a tela.
 */

import { SEGUNDOS_ACRESCIMO_MESA } from './constantes'
import { criarTimerVazio } from '../persistencia/armazenamento'
import { chaveMesa } from './chaves'
import type { EstadoTorneio, TimerRodada } from './tipos'

// ─── Helpers do timer ─────────────────────────────────────────────────────────

/**
 * Calcula quantos segundos restam no timer base da rodada.
 *
 * Usamos `startedAt` (timestamp) para calcular o tempo decorrido ao invés de
 * decrementar a cada segundo. Isso significa que o timer funciona mesmo se
 * a aba ficar em background ou o navegador pausar o JavaScript.
 *
 * @param timer - Estado atual do cronômetro.
 * @returns Segundos restantes (mínimo 0).
 */
export function segundosRestantesBase(timer: TimerRodada): number {
  if (!timer.rodando || timer.iniciadoEm === null) {
    return timer.segundosRestantes
  }
  const decorridos = Math.floor((Date.now() - timer.iniciadoEm) / 1000)
  return Math.max(0, timer.segundosRestantes - decorridos)
}

/**
 * Calcula os segundos restantes para uma mesa específica,
 * somando os acréscimos individuais que ela recebeu.
 *
 * @param timer - Estado atual do cronômetro.
 * @param indiceRodada - Índice da rodada (base zero).
 * @param indiceMesa - Índice da mesa dentro da rodada (base zero).
 * @returns Segundos totais restantes para aquela mesa.
 */
export function segundosRestantesMesa(
  timer: TimerRodada,
  indiceRodada: number,
  indiceMesa: number,
): number {
  const chave = chaveMesa(indiceRodada, indiceMesa)
  const acrescimos = timer.acrescimosPorMesa[chave] ?? 0
  return segundosRestantesBase(timer) + acrescimos * SEGUNDOS_ACRESCIMO_MESA
}

// ─── Ações do timer ───────────────────────────────────────────────────────────

/**
 * Alterna o timer entre rodando e pausado.
 * Se estiver rodando, salva os segundos restantes calculados antes de parar.
 *
 * @param estado - Estado atual do torneio.
 * @returns Novo estado com timer alternado.
 */
export function alternarTimer(estado: EstadoTorneio): EstadoTorneio {
  const { timer } = estado

  if (timer.rodando) {
    // Pausar: calcula os segundos restantes e congela.
    return {
      ...estado,
      timer: {
        ...timer,
        segundosRestantes: segundosRestantesBase(timer),
        rodando: false,
        iniciadoEm: null,
      },
    }
  }

  // Iniciar: anota o timestamp atual para calcular o tempo decorrido depois.
  return {
    ...estado,
    timer: { ...timer, rodando: true, iniciadoEm: Date.now() },
  }
}

/**
 * Reseta o timer para a duração total (sem acréscimos globais).
 *
 * @param estado - Estado atual do torneio.
 * @returns Novo estado com timer zerado.
 */
export function resetarTimer(estado: EstadoTorneio): EstadoTorneio {
  const { timer } = estado
  return {
    ...estado,
    timer: criarTimerVazio(timer.indiceRodada, timer.totalSegundos, timer.acrescimosPorMesa),
  }
}

/**
 * Muda qual rodada está sendo cronometrada.
 * O timer é resetado para a duração base ao trocar de rodada.
 *
 * @param estado - Estado atual do torneio.
 * @param indiceRodada - Nova rodada a cronometrar.
 * @returns Novo estado com timer apontando para a rodada escolhida.
 */
export function selecionarRodadaTimer(estado: EstadoTorneio, indiceRodada: number): EstadoTorneio {
  return {
    ...estado,
    timer: criarTimerVazio(
      indiceRodada,
      estado.timer.totalSegundos,
      estado.timer.acrescimosPorMesa,
    ),
  }
}

/**
 * Altera a duração total do timer e reseta a contagem.
 *
 * @param estado - Estado atual do torneio.
 * @param segundos - Nova duração base em segundos.
 * @returns Novo estado com timer configurado para a nova duração.
 */
export function alterarDuracaoTimer(estado: EstadoTorneio, segundos: number): EstadoTorneio {
  return {
    ...estado,
    timer: criarTimerVazio(estado.timer.indiceRodada, segundos, estado.timer.acrescimosPorMesa),
  }
}

/**
 * Adiciona +5 min globais a todas as mesas da rodada atual.
 *
 * @param estado - Estado atual do torneio.
 * @returns Novo estado com 5 min adicionados ao timer.
 */
export function adicionarCincoMinutosGlobal(estado: EstadoTorneio): EstadoTorneio {
  return adicionarSegundosAoTimer(estado, SEGUNDOS_ACRESCIMO_MESA)
}

/**
 * Adiciona +5 min apenas a uma mesa específica.
 *
 * @param estado - Estado atual do torneio.
 * @param indiceRodada - Índice da rodada da mesa.
 * @param indiceMesa - Índice da mesa dentro da rodada.
 * @returns Novo estado com acréscimo registrado para aquela mesa.
 */
export function adicionarCincoMinutosMesa(
  estado: EstadoTorneio,
  indiceRodada: number,
  indiceMesa: number,
): EstadoTorneio {
  const chave = chaveMesa(indiceRodada, indiceMesa)
  const acrescimosAtuais = estado.timer.acrescimosPorMesa[chave] ?? 0

  return {
    ...estado,
    timer: {
      ...estado.timer,
      acrescimosPorMesa: {
        ...estado.timer.acrescimosPorMesa,
        [chave]: acrescimosAtuais + 1,
      },
    },
  }
}

/**
 * Verifica se o timer expirou e o pausa caso sim.
 * Chamado periodicamente para evitar que o timer fique "negativo" no estado.
 *
 * @param estado - Estado atual do torneio.
 * @returns Novo estado (possivelmente com timer pausado no zero).
 */
export function sincronizarTimerExpirado(estado: EstadoTorneio): EstadoTorneio {
  const { timer } = estado
  if (!timer.rodando || segundosRestantesBase(timer) > 0) return estado

  return {
    ...estado,
    timer: { ...timer, segundosRestantes: 0, rodando: false, iniciadoEm: null },
  }
}

// ─── Helper interno ───────────────────────────────────────────────────────────

/** Adiciona segundos ao timer sem alterar acréscimos de mesa. */
function adicionarSegundosAoTimer(estado: EstadoTorneio, extra: number): EstadoTorneio {
  const { timer } = estado
  const restantes = segundosRestantesBase(timer) + extra

  return {
    ...estado,
    timer: {
      ...timer,
      totalSegundos: timer.totalSegundos + extra,
      segundosRestantes: restantes,
      // Se o timer estava rodando, atualiza o timestamp de início para não "perder" o extra.
      iniciadoEm: timer.rodando ? Date.now() : null,
    },
  }
}

// ─── Pontuação ────────────────────────────────────────────────────────────────

/**
 * Uma linha de resultado de mesa: jogador + pontuação final + texto formatado.
 */
export type ResultadoBruto = {
  jogador: string
  pontuacao: number
  texto: string
}

/**
 * Pontos de torneio atribuídos a um jogador ao fim de uma partida.
 */
export type PontosPartida = {
  jogador: string
  pontos: number
}

/**
 * Calcula os pontos de torneio (PT) a partir das pontuações finais de uma mesa.
 * Fórmula: diferença para 30.000 dividida por 1.000 + uma/cavalo por colocação.
 *
 * @param resultados - Array com jogador e pontuação de cada assento.
 * @returns Array com os PT calculados, do 1º ao 4º lugar.
 *
 * @example
 * calcularPontosPartida([
 *   { jogador: 'Alice', pontuacao: 40000 },
 *   { jogador: 'Bob', pontuacao: 30000 },
 *   { jogador: 'Carla', pontuacao: 25000 },
 *   { jogador: 'Daniel', pontuacao: 25000 },
 * ])
 * // Alice: 10 + 8 = 18, Bob: 0 + 4 = 4, Carla: -5 - 4 = -9, Daniel: -5 - 8 = -13
 */
export function calcularPontosPartida(
  resultados: Array<{ jogador: string; pontuacao: number }>,
): PontosPartida[] {
  const UMA = [8, 4, -4, -8] as const
  const ordenados = [...resultados].sort((a, b) => b.pontuacao - a.pontuacao)

  return ordenados.map((resultado, indice) => ({
    jogador: resultado.jogador,
    pontos: Number(((resultado.pontuacao - 30_000) / 1000 + UMA[indice]).toFixed(1)),
  }))
}
