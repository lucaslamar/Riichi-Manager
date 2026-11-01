import type { Vento } from '../../logica/tipos'
import { KANJI_VENTO, NOME_VENTO } from './ventoVisual'

interface PropsIndicadorVento {
  vento: Vento
  tamanho?: 'pequeno' | 'medio' | 'grande'
  mostrarTexto?: boolean
  className?: string
}

export default function IndicadorVento({
  vento,
  tamanho = 'medio',
  mostrarTexto = false,
  className = '',
}: PropsIndicadorVento) {
  return (
    <span
      className={`indicador-vento indicador-vento--${vento} indicador-vento--${tamanho} ${className}`.trim()}
      aria-label={NOME_VENTO[vento]}
    >
      <span className="indicador-vento-kanji" aria-hidden="true">
        {KANJI_VENTO[vento]}
      </span>
      {mostrarTexto && <span className="indicador-vento-texto">{NOME_VENTO[vento]}</span>}
    </span>
  )
}
