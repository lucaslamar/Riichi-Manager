/** Constantes do torneio. */
import type { Vento } from './tipos'

export const VENTOS: Vento[] = ['Leste', 'Sul', 'Oeste', 'Norte']

/** Rodadas oferecidas na criação; 4 é o Torneio Fast. */
export const OPCOES_RODADAS = [2, 3, 4, 5, 6, 8] as const
export const RODADAS_PADRAO = 4

/** Máximo de tentativas de sorteio antes de aceitar a melhor grade encontrada. */
export const MAX_TENTATIVAS_SORTEIO = 2200

/** Mínimo de jogadores para ativar o critério de dispersão de repetições. */
export const MIN_JOGADORES_DISPERSAO = 20

/** Máximo de adversários repetidos por jogador (em torneios grandes). */
export const MAX_ADVERSARIOS_REPETIDOS = 1

export const SEGUNDOS_RODADA_PADRAO = 90 * 60
export const SEGUNDOS_ACRESCIMO_MESA = 5 * 60
export const OPCOES_TEMPO_RODADA = [60 * 60, SEGUNDOS_RODADA_PADRAO, 120 * 60] as const

export const MINIMO_JOGADORES = 8
