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
      <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              color: '#607080',
              textTransform: 'uppercase',
            }}
          >
            É leste?
          </span>
          <select
            value={mao.ventoRodada}
            style={{
              minHeight: 42,
              border: '2px solid #dde1e7',
              borderRadius: 8,
              padding: '0 12px',
              fontWeight: 800,
              background: 'white',
            }}
            onChange={(evento) =>
              atualizarMao((rascunho) => {
                rascunho.ventoRodada = evento.target.value as '1' | '2'
              })
            }
          >
            <option value="1">Leste</option>
            <option value="2">Não leste</option>
          </select>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              color: '#607080',
              textTransform: 'uppercase',
            }}
          >
            Vitória
          </span>
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
