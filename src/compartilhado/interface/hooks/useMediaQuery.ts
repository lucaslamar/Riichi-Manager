import { useEffect, useState } from 'react'

/**
 * Observa uma media query e devolve se ela casa no momento.
 *
 * Baseado no viewport (largura/orientação/altura), não em user-agent: é a forma
 * responsiva correta de variar comportamento por tamanho de tela. Reage a
 * redimensionamento e rotação.
 */
export function useMediaQuery(consulta: string): boolean {
  const [casa, setCasa] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(consulta).matches
      : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const lista = window.matchMedia(consulta)
    const aoMudar = () => setCasa(lista.matches)
    aoMudar()
    lista.addEventListener('change', aoMudar)
    return () => lista.removeEventListener('change', aoMudar)
  }, [consulta])

  return casa
}
