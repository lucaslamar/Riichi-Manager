import type { ReactNode } from 'react'

interface PropsContadorOpcao {
  className: string
  rotulo: ReactNode
  rotuloMenos: string
  rotuloMais: string
  valor: number
  desabilitarMenos: boolean
  desabilitarMais: boolean
  aoDiminuir: () => void
  aoAumentar: () => void
  rotuloGrupo?: string
  anunciarValor?: boolean
}

export function ContadorOpcao({
  className,
  rotulo,
  rotuloMenos,
  rotuloMais,
  valor,
  desabilitarMenos,
  desabilitarMais,
  aoDiminuir,
  aoAumentar,
  rotuloGrupo,
  anunciarValor = false,
}: PropsContadorOpcao) {
  return (
    <div className={className} role={rotuloGrupo ? 'group' : undefined} aria-label={rotuloGrupo}>
      {rotulo}
      <div>
        <button
          type="button"
          aria-label={rotuloMenos}
          disabled={desabilitarMenos}
          onClick={aoDiminuir}
        >
          -
        </button>
        <strong aria-live={anunciarValor ? 'polite' : undefined}>{valor}</strong>
        <button
          type="button"
          aria-label={rotuloMais}
          disabled={desabilitarMais}
          onClick={aoAumentar}
        >
          +
        </button>
      </div>
    </div>
  )
}
