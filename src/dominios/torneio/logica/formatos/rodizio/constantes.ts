/** Constantes do sorteio do Rodízio (as mesmas do Torneio antigo). */
import type { Vento } from './tipos'

export const VENTOS: Vento[] = ['Leste', 'Sul', 'Oeste', 'Norte']

export const RODADAS_PADRAO = 4

/** Máximo de tentativas de sorteio antes de aceitar a melhor grade encontrada. */
export const MAX_TENTATIVAS_SORTEIO = 2200

/** Mínimo de jogadores para ativar o critério de dispersão de repetições. */
export const MIN_JOGADORES_DISPERSAO = 20

/** Máximo de adversários repetidos por jogador (em torneios grandes). */
export const MAX_ADVERSARIOS_REPETIDOS = 1
