import type { CodigoPedra } from '../../../logica/mao'
import { PedraSvg } from '../PedraSvg'

interface PropsDescartesMao {
  descartes: CodigoPedra[]
  aoRemoverDescarte: (indiceDescarte: number) => void
}

/** Lista os descartes próprios usados pela checagem de furiten. */
export function DescartesMao({ descartes, aoRemoverDescarte }: PropsDescartesMao) {
  if (descartes.length === 0) return null

  return (
    <div className="descartes-selecionados">
      <span>Descartes</span>
      {descartes.map((pedraDescarte, indiceDescarte) => (
        <button
          key={`${pedraDescarte}-${indiceDescarte}`}
          className="chip-pedra descarte"
          type="button"
          title="Descarte proprio - clique para remover"
          onClick={() => aoRemoverDescarte(indiceDescarte)}
        >
          <PedraSvg pedra={pedraDescarte} />
        </button>
      ))}
    </div>
  )
}
