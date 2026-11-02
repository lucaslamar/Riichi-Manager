/**
 * Ângulo da tela em relação ao aparelho, de quando o sistema gira a tela sozinho.
 * No React Native basta trocar este arquivo (lá dá para travar de verdade).
 */
export function lerAnguloTela(): number {
  if (typeof screen.orientation?.angle === 'number') return screen.orientation.angle
  // Safari antigo só tem a propriedade antiga.
  const antiga = (window as Window & { orientation?: number }).orientation
  return typeof antiga === 'number' ? antiga : 0
}

export function aoMudarAnguloTela(ouvinte: () => void): () => void {
  screen.orientation?.addEventListener('change', ouvinte)
  window.addEventListener('orientationchange', ouvinte)
  return () => {
    screen.orientation?.removeEventListener('change', ouvinte)
    window.removeEventListener('orientationchange', ouvinte)
  }
}
