import { useId } from 'react'
import './campo-busca.css'

/**
 * Campo de busca com lupa e botão de limpar (Guia de bolso, Guia de consulta
 * do tutorial de Han e Fu). Só o campo: quem usa decide o que buscar e onde
 * mostrar o resultado. Dentro de uma modal com abas, vai no `fixo` do
 * AbasModal para ficar preso logo abaixo delas.
 */
export default function CampoBusca({
  valor,
  aoMudar,
  rotulo,
  placeholder,
  rotuloLimpar,
  className,
}: {
  valor: string
  aoMudar: (valor: string) => void
  /** Nome acessível do campo (o rótulo visual é o placeholder). */
  rotulo: string
  placeholder: string
  rotuloLimpar: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={['campo-busca', className].filter(Boolean).join(' ')}>
      <i className="fas fa-magnifying-glass" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
      />
      {valor && (
        <button
          type="button"
          className="campo-busca__limpar"
          aria-label={rotuloLimpar}
          onClick={() => aoMudar('')}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
