import { useState } from 'react'

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
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  return (
    <div className={`cabecalho-secao cabecalho-calculadora cabecalho-calculadora-${modo}`}>
      <div className="titulo-calculadora">
        <i className="fas fa-calculator icone-secao" aria-hidden="true" />
        <div>
          <h2>Calculadora de Mão</h2>
          <p className="subtitulo-secao">
            {modo === 'rapido'
              ? 'Calcule pontos direto por han e fu.'
              : 'Monte a mão,e acompanhe o valor em tempo real.'}
          </p>
        </div>
      </div>

      <div className="acoes-calculadora">
        {modo === 'completo' && (
          <>
            <button
              className="btn-contorno btn-voltar-calculadora"
              type="button"
              onClick={aoVoltar}
            >
              <i className="fas fa-arrow-left" /> Voltar
            </button>
            <button
              className="btn-contorno"
              type="button"
              onClick={aoAbrirRegras}
              title="Configurar regras de cálculo"
            >
              <i className="fas fa-sliders-h" /> Regras
            </button>
          </>
        )}
        <button
          className={modo === 'rapido' ? 'btn-primario' : 'btn-contorno'}
          type="button"
          onClick={aoAlternarModo}
          title={modo === 'rapido' ? 'Modo completo' : 'Modo rápido'}
          aria-label={modo === 'rapido' ? 'Modo completo' : 'Modo rápido'}
        >
          <i className={`fas ${modo === 'rapido' ? 'fa-chess-board' : 'fa-bolt'}`} />
          {modo === 'rapido' ? ' Modo Completo' : ' Modo Rápido'}
        </button>
      </div>

      {modo === 'rapido' ? (
        <div className="menu-acoes-mobile menu-acoes-mobile-direto">
          <button
            className="btn-primario btn-menu-acoes"
            type="button"
            title="Modo completo"
            aria-label="Modo completo"
            onClick={aoAlternarModo}
          >
            <i className="fas fa-chess-board" />
          </button>
        </div>
      ) : (
        <div className={`menu-acoes-mobile ${menuMobileAberto ? 'aberto' : ''}`}>
          <button
            className="btn-acao-flutuante opcao-regras"
            type="button"
            title="Regras"
            aria-label="Regras"
            onClick={() => {
              setMenuMobileAberto(false)
              aoAbrirRegras()
            }}
          >
            <i className="fas fa-sliders-h" />
          </button>
          <button
            className="btn-acao-flutuante opcao-voltar"
            type="button"
            title="Voltar"
            aria-label="Voltar"
            onClick={() => {
              setMenuMobileAberto(false)
              aoVoltar()
            }}
          >
            <i className="fas fa-arrow-left" />
          </button>
          <button
            className="btn-acao-flutuante opcao-modo"
            type="button"
            title="Modo rápido"
            aria-label="Modo rápido"
            onClick={() => {
              setMenuMobileAberto(false)
              aoAlternarModo()
            }}
          >
            <i className="fas fa-bolt" />
          </button>
          <button
            className="btn-primario btn-menu-acoes"
            type="button"
            aria-expanded={menuMobileAberto}
            aria-label="Ações da calculadora"
            onClick={() => setMenuMobileAberto((aberto) => !aberto)}
          >
            <i className="fas fa-calculator" />
          </button>
        </div>
      )}
    </div>
  )
}
