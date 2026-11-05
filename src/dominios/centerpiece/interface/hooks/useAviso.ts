import { useCallback, useEffect, useRef, useState } from 'react'

const DURACAO_MS = 2500

/** Aviso curto no rodapé (toast), que some sozinho. Usa a classe `.ptd-aviso`. */
export function useAviso() {
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const mostrar = useCallback((texto: string) => {
    window.clearTimeout(temporizador.current)
    setAviso(texto)
    temporizador.current = window.setTimeout(() => setAviso(null), DURACAO_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  return { aviso, mostrar }
}
