import './ranking-filtros.css'

/** Grupo de opções em segmentos, como os atalhos de período da tela. */
export default function Segmentos<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  texto,
}: {
  rotulo: string
  opcoes: readonly T[]
  valor: T
  aoMudar: (valor: T) => void
  texto: (opcao: T) => string
}) {
  return (
    <fieldset className="rkf-grupo">
      <legend className="rkf-titulo">{rotulo}</legend>
      <div className="ptd-segmentos rkf-segmentos">
        {opcoes.map((opcao) => (
          <button
            key={opcao}
            type="button"
            className={`ptd-segmento${valor === opcao ? ' ptd-segmento--ativo' : ''}`}
            aria-pressed={valor === opcao}
            onClick={() => aoMudar(opcao)}
          >
            {texto(opcao)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
