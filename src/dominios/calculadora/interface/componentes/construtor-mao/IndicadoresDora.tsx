import type { Updater } from 'use-immer'
import type { Mao } from '../../../logica/mao'
import { PedraSvg } from '../PedraSvg'

interface PropsIndicadoresDora {
  mao: Mao
  atualizarMao: Updater<Mao>
}

/**
 * Exibe os indicadores de dora/uradora já escolhidos e permite removê-los.
 * A dora manual continua visível aqui para deixar claro que indicadores serão ignorados.
 */
export function IndicadoresDora({ mao, atualizarMao }: PropsIndicadoresDora) {
  if (mao.dora.length === 0 && mao.uradora.length === 0 && mao.doraManual === 0) return null

  return (
    <div className={`indicadores-dora-selecionados ${mao.doraManual > 0 ? 'ignorado' : ''}`}>
      {mao.doraManual > 0 && (
        <div className="grupo-indicador-dora">
          <span>Dora manual</span>
          <strong>{mao.doraManual}</strong>
        </div>
      )}
      {mao.dora.length > 0 && (
        <div className="grupo-indicador-dora">
          <span>Dora</span>
          {mao.dora.map((pedraDora, indiceDora) => (
            <button
              key={indiceDora}
              className="chip-pedra dora"
              type="button"
              onClick={() =>
                atualizarMao((rascunho) => {
                  rascunho.dora.splice(indiceDora, 1)
                })
              }
            >
              <PedraSvg pedra={pedraDora} />
            </button>
          ))}
        </div>
      )}
      {mao.uradora.length > 0 && (
        <div className="grupo-indicador-dora">
          <span>Uradora</span>
          {mao.uradora.map((pedraUradora, indiceUradora) => (
            <button
              key={indiceUradora}
              className="chip-pedra dora"
              type="button"
              onClick={() =>
                atualizarMao((rascunho) => {
                  rascunho.uradora.splice(indiceUradora, 1)
                })
              }
            >
              <PedraSvg pedra={pedraUradora} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
