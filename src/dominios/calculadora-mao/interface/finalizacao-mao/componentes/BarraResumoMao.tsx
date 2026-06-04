import type { Mao } from '../../../logica/mao'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

interface PropsBarraResumoMao {
  mao: Mao
}

export function BarraResumoMao({ mao }: PropsBarraResumoMao) {
  const todosTiles = [
    ...mao.pedras.map((pedra, i) => ({ pedra, agari: i === mao.indiceAgari, key: `m${i}` })),
    ...mao.melds.flatMap((meld, im) =>
      meld.pedras.map((pedra, ip) => ({
        pedra,
        agari: mao.agariMeld?.indiceMeld === im && mao.agariMeld?.indicePedra === ip,
        key: `meld${im}-${ip}`,
      })),
    ),
  ]

  return (
    <div className="barra-resumo-mao">
      <div className="barra-resumo-linha">
        <span className="barra-resumo-rotulo">MÃO</span>
        <div className="barra-resumo-tiles">
          {todosTiles.map(({ pedra, agari, key }) => (
            <span key={key} className={`barra-resumo-tile ${agari ? 'barra-resumo-tile-agari' : ''}`}>
              <PedraSvg pedra={pedra} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
