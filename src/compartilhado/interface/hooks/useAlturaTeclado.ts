import { useEffect } from 'react'

/**
 * Altura do teclado do sistema em `--altura-teclado` no elemento, para um rodapé
 * fixo subir junto. Sem `visualViewport` (ou sem teclado) fica 0px.
 */
export function useAlturaTeclado(alvo: { current: HTMLElement | null }) {
  useEffect(() => {
    const visual = window.visualViewport
    const elemento = alvo.current
    if (!visual || !elemento) return
    const medir = () => {
      const altura = Math.max(0, window.innerHeight - visual.height - visual.offsetTop)
      elemento.style.setProperty('--altura-teclado', `${Math.round(altura)}px`)
    }
    medir()
    visual.addEventListener('resize', medir)
    visual.addEventListener('scroll', medir)
    return () => {
      visual.removeEventListener('resize', medir)
      visual.removeEventListener('scroll', medir)
    }
  }, [alvo])
}
