/**
 * Tela cheia pelo navegador (Fullscreen API). Só entra a partir de um toque da
 * pessoa, e o Safari do iPhone não tem para páginas. No React Native este arquivo some.
 */
export function suportaTelaCheia(): boolean {
  return document.fullscreenEnabled === true
}

export function estaEmTelaCheia(): boolean {
  return document.fullscreenElement !== null
}

export function entrarTelaCheia(): void {
  if (!suportaTelaCheia() || estaEmTelaCheia()) return
  // Recusa do navegador (fora de um toque, por exemplo): segue como está.
  void document.documentElement.requestFullscreen().catch(() => {})
}

export function sairTelaCheia(): void {
  if (estaEmTelaCheia()) void document.exitFullscreen().catch(() => {})
}

/** Avisa também quando a pessoa sai pelo gesto de voltar ou pelo Esc. */
export function aoMudarTelaCheia(aoMudar: () => void): () => void {
  document.addEventListener('fullscreenchange', aoMudar)
  return () => document.removeEventListener('fullscreenchange', aoMudar)
}
