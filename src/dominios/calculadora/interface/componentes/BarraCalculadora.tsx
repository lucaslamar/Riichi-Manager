interface PropsBarraCalculadora {
  modo: 'completo' | 'rapido'
  caminhosAtivos: boolean
  aoVoltar: () => void
  aoAbrirRegras: () => void
  aoAlternarCaminhos: () => void
  aoAlternarModo: () => void
}

/** Barra de navegação e ações globais da calculadora. */
export default function BarraCalculadora({
  modo,
  caminhosAtivos,
  aoVoltar,
  aoAbrirRegras,
  aoAlternarCaminhos,
  aoAlternarModo,
}: PropsBarraCalculadora) {
  const iconeModo = modo === 'rapido' ? 'fa-chess-board' : 'fa-bolt'

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <button
        className="btn-contorno"
        type="button"
        onClick={aoVoltar}
        style={{ minHeight: 40, padding: '8px 16px' }}
      >
        <i className="fas fa-arrow-left" /> Voltar
      </button>
      <h2 style={{ margin: 0, flex: 1 }}>Calculadora de Mão</h2>
      <button
        className="btn-contorno"
        type="button"
        onClick={aoAbrirRegras}
        title="Configurar regras de cálculo"
        style={{ minHeight: 40, padding: '8px 16px' }}
      >
        <i className="fas fa-sliders-h" /> Regras
      </button>
      {modo === 'completo' && (
        <button
          className={caminhosAtivos ? 'btn-primario' : 'btn-contorno'}
          type="button"
          onClick={aoAlternarCaminhos}
          title="Mostrar ou esconder sugestoes de yaku"
          style={{ minHeight: 40, padding: '8px 16px' }}
        >
          <i className="fas fa-route" /> Caminhos
        </button>
      )}
      <button
        className={modo === 'rapido' ? 'btn-primario' : 'btn-contorno'}
        type="button"
        onClick={aoAlternarModo}
        style={{ minHeight: 40, padding: '8px 16px' }}
      >
        <i className={`fas ${iconeModo}`} />
        {modo === 'rapido' ? ' Modo Completo' : ' Modo Rápido'}
      </button>
    </div>
  )
}
