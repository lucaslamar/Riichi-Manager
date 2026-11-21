/** Regras usadas em todo o app: Riichi (japonês) ou MCR / Guobiao (chinês). */
export type ModoJogo = 'riichi' | 'mcr'

export const MODO_JOGO_PADRAO: ModoJogo = 'riichi'
export const CHAVE_MODO_JOGO = 'rm.modoJogo'

export function lerModoJogo(valor: string | null): ModoJogo {
  return valor === 'mcr' ? 'mcr' : MODO_JOGO_PADRAO
}
