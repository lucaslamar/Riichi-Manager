import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { ExibicaoRapida, SeletorFu, SeletorHan } from './CalculadoraRapida'
import { ToggleAgari } from './SeletoresMao'

interface PropsModoRapido {
  estado: EstadoCalculadoraMao
}

/** Renderiza a calculadora por han/fu, sem montar a mão pedra por pedra. */
export default function ModoRapidoCalculadora({ estado }: PropsModoRapido) {
  const { mao, atualizarMao, han, setHan, fu, setFu, fuDisponiveis, resultadoRapido } = estado

  return (
    <div className="card">
      <div className="seletores-rapidos-mao">
        <div className="campo-vitoria-mao">
          <span>É leste?</span>
          <div className="toggle-agari-mao">
            {[
              { valor: '1' as const, rotulo: 'Leste' },
              { valor: '2' as const, rotulo: 'Não leste' },
            ].map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                className={mao.ventoRodada === opcao.valor ? 'ativo' : undefined}
                onClick={() =>
                  atualizarMao((rascunho) => {
                    rascunho.ventoRodada = opcao.valor
                  })
                }
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="campo-vitoria-mao">
          <span>Vitória</span>
          <ToggleAgari mao={mao} atualizarMao={atualizarMao} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 32,
          justifyContent: 'center',
          margin: '24px 0',
          flexWrap: 'wrap',
        }}
      >
        <SeletorHan
          han={han}
          fu={fu}
          fuDisponiveis={fuDisponiveis}
          aoMudarHan={setHan}
          aoMudarFu={setFu}
        />
        <SeletorFu han={han} fu={fu} fuDisponiveis={fuDisponiveis} aoMudarFu={setFu} />
      </div>

      <ExibicaoRapida
        resultado={resultadoRapido}
        isOya={mao.ventoRodada === '1'}
        agari={mao.agari}
        han={han}
        fu={fu}
      />
    </div>
  )
}
