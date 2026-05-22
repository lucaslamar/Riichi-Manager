interface PropsBarraCalculadora {
  modo: 'completo' | 'rapido'
  aoVoltar: () => void
  aoAbrirRegras: () => void
  aoAlternarModo: () => void
}

/** Cabecalho e acoes globais da calculadora. */
export default function BarraCalculadora({
  modo,
  aoVoltar,
  aoAbrirRegras,
  aoAlternarModo,
}: PropsBarraCalculadora) {
  const iconeModo = modo === 'rapido' ? 'fa-chess-board' : 'fa-bolt'

  return (
    <div className={`cabecalho-secao cabecalho-calculadora cabecalho-calculadora-${modo}`}>
      <div className="titulo-calculadora">
        <i className="fas fa-calculator icone-secao" aria-hidden="true" />
        <div>
          <h2>Calculadora de Mão</h2>
          <p className="subtitulo-secao">
            {modo === 'rapido'
              ? 'Calcule pontos direto por han e fu.'
              : 'Monte a mão, configure a vitória e acompanhe o valor em tempo real.'}
          </p>
        </div>
      </div>

      <div className="acoes-calculadora">
        <button className="btn-contorno" type="button" onClick={aoVoltar}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        {modo === 'completo' && (
          <button
            className="btn-contorno"
            type="button"
            onClick={aoAbrirRegras}
            title="Configurar regras de cálculo"
          >
            <i className="fas fa-sliders-h" /> Regras
          </button>
        )}
        <button
          className={modo === 'rapido' ? 'btn-primario' : 'btn-contorno'}
          type="button"
          onClick={aoAlternarModo}
        >
          <i className={`fas ${iconeModo}`} />
          {modo === 'rapido' ? ' Modo Completo' : ' Modo Rápido'}
        </button>
      </div>
    </div>
  )
}
