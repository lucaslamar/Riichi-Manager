import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { ExibicaoRapida, SeletorFu, SeletorHan } from './CalculadoraRapida'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

interface PropsModoRapido {
  estado: EstadoCalculadoraMao
}

/** Renderiza a calculadora por han/fu, sem montar a mão pedra por pedra. */
export default function ModoRapidoCalculadora({ estado }: PropsModoRapido) {
  const { mao, atualizarMao, han, setHan, fu, setFu, fuDisponiveis, resultadoRapido } = estado

  return (
    <div className="card">
      <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
      <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

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
        isOya={mao.ventoAssento === '1'}
        agari={mao.agari}
        han={han}
        fu={fu}
      />
    </div>
  )
}
