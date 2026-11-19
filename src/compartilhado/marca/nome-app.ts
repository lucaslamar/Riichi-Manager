import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'

/** Nome exibido do app. Repositório, endereço, manifesto e ícones não mudam. */
export function nomeApp(modo: ModoJogo): string {
  return modo === 'mcr' ? 'Mahjong Manager' : 'Riichi Manager'
}
