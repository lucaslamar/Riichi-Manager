import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Como a foto exibida (contain) ocupa a coluna dela: inteira (`cheia`), na
 * largura toda mas mais baixa (`vertical`) ou na altura toda mas mais estreita
 * (`horizontal`). O card dividido usa isso para pôr os cantos arredondados na
 * foto ou na coluna, sem o fundo do card aparecer atrás da foto.
 */
export type EncaixeFoto = 'cheia' | 'vertical' | 'horizontal'

const FOLGA = 1

export function useEncaixeFoto(colunaRef: RefObject<HTMLDivElement>, ativo: boolean): EncaixeFoto {
  const [encaixe, setEncaixe] = useState<EncaixeFoto>('cheia')

  useLayoutEffect(() => {
    const coluna = colunaRef.current
    const foto = coluna?.querySelector<HTMLImageElement>('.historia-mao-foto-principal')
    if (!ativo || !coluna || !foto) return
    const medir = () => {
      const larguraCheia = foto.offsetWidth >= coluna.clientWidth - FOLGA
      const alturaCheia = foto.offsetHeight >= coluna.clientHeight - FOLGA
      setEncaixe(larguraCheia && alturaCheia ? 'cheia' : larguraCheia ? 'vertical' : 'horizontal')
    }
    medir()
    foto.addEventListener('load', medir)
    const observador = new ResizeObserver(medir)
    observador.observe(coluna)
    observador.observe(foto)
    return () => {
      foto.removeEventListener('load', medir)
      observador.disconnect()
    }
  }, [colunaRef, ativo])

  return encaixe
}
