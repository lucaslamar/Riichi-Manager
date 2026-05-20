import type { Mao, VentoMao } from '../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../constantes'

export type AtualizarMao = (receita: (rascunho: Mao) => void) => void

export function SeletorVentos({ mao, atualizarMao }: { mao: Mao; atualizarMao: AtualizarMao }) {
  return (
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
          Vento da Rodada
        </span>
        {/* Só Leste e Sul — regra padrão de riichi yonma */}
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

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 900,
            color: '#607080',
            textTransform: 'uppercase',
          }}
        >
          Assento
        </span>
        {/* Assento tem os 4 ventos */}
        <select
          value={mao.ventoAssento}
          style={{
            minHeight: 42,
            border: '2px solid #dde1e7',
            borderRadius: 8,
            padding: '0 12px',
            fontWeight: 800,
            background: 'white',
          }}
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
    </div>
  )
}

/** Toggle Tsumo / Ron. */
export function ToggleAgari({ mao, atualizarMao }: { mao: Mao; atualizarMao: AtualizarMao }) {
  return (
    <div
      style={{
        display: 'flex',
        background: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
        width: 'fit-content',
        marginBottom: 4,
      }}
    >
      {(['tsumo', 'ron'] as const).map((tipo) => (
        <button
          key={tipo}
          type="button"
          style={{
            padding: '8px 24px',
            fontWeight: 900,
            border: 'none',
            background: mao.agari === tipo ? 'var(--primario)' : 'transparent',
            color: mao.agari === tipo ? 'white' : 'var(--escuro)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontSize: '0.9rem',
          }}
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

/** Botão de ação de meld/dora com cor própria. */
