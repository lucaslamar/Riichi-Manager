import type { Mao, VentoMao } from '../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../constantes'

export type AtualizarMao = (receita: (rascunho: Mao) => void) => void

export function SeletorVentos({
  mao,
  atualizarMao,
  mostrarVentoRodada = true,
  mostrarAssento = true,
}: {
  mao: Mao
  atualizarMao: AtualizarMao
  mostrarVentoRodada?: boolean
  mostrarAssento?: boolean
}) {
  return (
    <div className="seletores-vento-mao">
      {mostrarVentoRodada && (
        <label className="campo-vento-mao">
          <span>Vento da Rodada</span>
          <select
            value={mao.ventoRodada}
            className="select-vento-mao"
            onChange={(evento) =>
              atualizarMao((rascunho: Mao) => {
                rascunho.ventoRodada = evento.target.value as VentoMao
              })
            }
          >
            {VENTOS_RODADA.map((vento) => (
              <option key={vento.valor} value={vento.valor}>
                {vento.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      {mostrarAssento && (
        <label className="campo-vento-mao">
          <span>Assento</span>
          <select
            value={mao.ventoAssento}
            className="select-vento-mao"
            onChange={(evento) =>
              atualizarMao((rascunho: Mao) => {
                rascunho.ventoAssento = evento.target.value as VentoMao
              })
            }
          >
            {VENTOS_ASSENTO.map((vento) => (
              <option key={vento.valor} value={vento.valor}>
                {vento.nome}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}

/** Toggle Tsumo / Ron. */
export function ToggleAgari({ mao, atualizarMao }: { mao: Mao; atualizarMao: AtualizarMao }) {
  return (
    <div className="toggle-agari-mao">
      {(['tsumo', 'ron'] as const).map((tipo) => (
        <button
          key={tipo}
          type="button"
          className={mao.agari === tipo ? 'ativo' : undefined}
          onClick={() =>
            atualizarMao((rascunho: Mao) => {
              rascunho.agari = tipo
            })
          }
        >
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
      ))}
    </div>
  )
}
