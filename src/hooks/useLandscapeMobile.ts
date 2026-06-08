import { useEffect } from 'react'

/**
 * Injeta /riichi-landscape.css de forma lazy apenas quando o dispositivo está em
 * modo landscape com altura reduzida (celular deitado).
 * Remove o link quando o dispositivo sai desse modo.
 */
export function useLandscapeMobile(): void {
  useEffect(() => {
    const query = window.matchMedia(
      '(orientation: landscape) and (max-height: 500px)',
    )

    function injetarCss(): void {
      if (document.getElementById('riichi-landscape-css')) return
      const link = document.createElement('link')
      link.id = 'riichi-landscape-css'
      link.rel = 'stylesheet'
      link.href = '/riichi-landscape.css'
      document.head.appendChild(link)
    }

    function removerCss(): void {
      document.getElementById('riichi-landscape-css')?.remove()
    }

    function handler(event: MediaQueryListEvent): void {
      if (event.matches) {
        injetarCss()
      } else {
        removerCss()
      }
    }

    if (query.matches) {
      injetarCss()
    }

    query.addEventListener('change', handler)

    return () => {
      query.removeEventListener('change', handler)
    }
  }, [])
}
