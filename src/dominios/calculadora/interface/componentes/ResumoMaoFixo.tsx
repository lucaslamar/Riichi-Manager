import type { Mao } from '../../logica/mao'
import { PedraSvg, PedrasMeld } from './PedraSvg'

export default function ResumoMaoFixo({
  mao,
  totalPedras,
  slotsUsados,
}: {
  mao: Mao
  totalPedras: number
  slotsUsados: number
}) {
  if (totalPedras === 0 && mao.dora.length === 0 && mao.uradora.length === 0) return null

  return (
    <div className="resumo-mao-fixo" aria-label="Resumo da mão">
      <div className="resumo-mao-linha">
        <strong>Mão</strong>
        <span>
          {totalPedras} pedras · {slotsUsados}/14 slots
        </span>
      </div>
      <div className="resumo-mao-pedras">
        {mao.pedras.map((pedra, i) => (
          <span
            key={`mao-${i}`}
            className={`chip-pedra mini ${i === mao.indiceAgari ? 'agari' : ''}`}
          >
            <PedraSvg pedra={pedra} />
          </span>
        ))}
        {mao.melds.map((meld, i) => (
          <span key={`meld-resumo-${i}`} className="resumo-meld">
            <PedrasMeld meld={meld} />
          </span>
        ))}
      </div>
      {(mao.dora.length > 0 || mao.uradora.length > 0) && (
        <div className="resumo-mao-doras">
          {mao.dora.length > 0 && (
            <span>
              <strong>Dora</strong>{' '}
              {mao.dora.map((pedraDora, i) => (
                <PedraSvg key={`d-${i}`} pedra={pedraDora} />
              ))}
            </span>
          )}
          {mao.uradora.length > 0 && (
            <span>
              <strong>Uradora</strong>{' '}
              {mao.uradora.map((pedraUradora, i) => (
                <PedraSvg key={`u-${i}`} pedra={pedraUradora} />
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
