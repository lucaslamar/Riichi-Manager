/**
 * @fileoverview Constantes compartilhadas do módulo de torneio.
 *
 * Centralizar valores "mágicos" aqui facilita ajustar regras do torneio
 * sem precisar procurar número espalhado pelo código.
 */

import type { Vento } from './tipos'

/** Ordem canônica dos ventos em uma mesa de mahjong. */
export const VENTOS: Vento[] = ['Leste', 'Sul', 'Oeste', 'Norte']

/** Número de rodadas de um torneio fast padrão. */
export const TOTAL_RODADAS = 4

/** Pontuação inicial de cada jogador no começo de uma partida. */
export const PONTUACAO_INICIAL = 30_000

/** Chave usada para salvar o torneio no localStorage do navegador. */
export const CHAVE_STORAGE = 'riichi-manager-v5'

/** Número máximo de tentativas de sorteio antes de aceitar a melhor grade encontrada. */
export const MAX_TENTATIVAS_SORTEIO = 2200

/** Número mínimo de jogadores para ativar o critério de dispersão de repetições. */
export const MIN_JOGADORES_DISPERSAO = 20

/** Máximo de adversários repetidos por jogador (em torneios grandes). */
export const MAX_ADVERSARIOS_REPETIDOS = 1

/** Duração padrão de uma rodada em segundos (1h30). */
export const SEGUNDOS_RODADA_PADRAO = 90 * 60

/** Duração do acréscimo de tempo individual por mesa em segundos (5 min). */
export const SEGUNDOS_ACRESCIMO_MESA = 5 * 60

/** Opções de duração exibidas no seletor do timer. */
export const OPCOES_TIMER = [
  { rotulo: '1h', segundos: 60 * 60 },
  { rotulo: '1h30', segundos: SEGUNDOS_RODADA_PADRAO },
  { rotulo: '2h', segundos: 120 * 60 },
] as const

/**
 * Uma/cavalo aplicado por colocação (1º ao 4º).
 * O total sempre soma zero para não criar pontos do nada.
 */
export const UMA = [8, 4, -4, -8] as const
