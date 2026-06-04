import { useRef, useState } from 'react'
import type { CodigoPedra } from '../../../logica/mao'
import { nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

const ABAS_TECLADO = [
  {
    id: 'man',
    rotulo: 'MAN',
    pedras: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'] as CodigoPedra[],
  },
  {
    id: 'pin',
    rotulo: 'PIN',
    pedras: ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'] as CodigoPedra[],
  },
  {
    id: 'sou',
    rotulo: 'SOU',
    pedras: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'] as CodigoPedra[],
  },
  {
    id: 'honras',
    rotulo: 'HONRAS',
    pedras: ['1z', '2z', '3z', '4z', '5z', '6z', '7z'] as CodigoPedra[],
  },
]

interface PropsDorasNaMao {
  valor: number
  aoAlterarValor: (novo: number) => void
}

export default function DorasNaMao({ valor, aoAlterarValor }: PropsDorasNaMao) {
  const [expandido, setExpandido] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('man')
  const [tooltipAberto, setTooltipAberto] = useState(false)
  const [pedrasSelecionadas, setPedrasSelecionadas] = useState<CodigoPedra[]>([])
  const tooltipRef = useRef<HTMLDivElement>(null)

  const totalSelecionado = pedrasSelecionadas.length

  const alternarPedra = (pedra: CodigoPedra) => {
    setPedrasSelecionadas((prev) => {
      const indice = prev.indexOf(pedra)
      if (indice >= 0) return prev.filter((_, i) => i !== indice)
      return [...prev, pedra]
    })
  }

  const removerPedra = (indice: number) => {
    setPedrasSelecionadas((prev) => prev.filter((_, i) => i !== indice))
  }

  const pedrasDaAba = ABAS_TECLADO.find((a) => a.id === abaAtiva)!.pedras

  return (
    <div className="doras-na-mao">
      <div className="doras-na-mao-linha">
        <span className="doras-na-mao-rotulo">DORAS NA MÃO</span>

        <div className="doras-na-mao-acoes">
          <div className="doras-na-mao-tooltip-wrapper" ref={tooltipRef}>
            <button
              type="button"
              className="doras-na-mao-btn-info"
              aria-label="Informação sobre Dora e Ura Dora"
              aria-expanded={tooltipAberto}
              onClick={() => setTooltipAberto((v) => !v)}
            >
              i
            </button>
            {tooltipAberto && (
              <div className="doras-na-mao-tooltip" role="tooltip">
                <button
                  type="button"
                  className="doras-na-mao-tooltip-fechar"
                  aria-label="Fechar"
                  onClick={() => setTooltipAberto(false)}
                >
                  ×
                </button>
                <p>
                  <strong>Dora</strong> é uma pedra bônus definida pela pedra seguinte ao indicador
                  virado no início da partida. Cada dora na mão vale +1 han.
                </p>
                <p>
                  <strong>Ura Dora</strong> funciona igual ao dora, mas o indicador só é revelado ao
                  declarar Riichi e vencer.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            className={`doras-na-mao-btn-teclado ${expandido ? 'ativo' : ''}`}
            aria-label={expandido ? 'Fechar teclado de doras' : 'Abrir teclado de doras'}
            aria-expanded={expandido}
            onClick={() => setExpandido((v) => !v)}
          >
            <i className="fas fa-border-all" aria-hidden="true" />
            {totalSelecionado > 0 && (
              <span className="doras-na-mao-badge" aria-label={`${totalSelecionado} pedras selecionadas`}>
                {totalSelecionado}
              </span>
            )}
          </button>
        </div>

        <div className="doras-na-mao-contador">
          <button
            type="button"
            aria-label="DORAS NA MÃO −"
            disabled={valor <= 0}
            onClick={() => aoAlterarValor(Math.max(0, valor - 1))}
          >
            −
          </button>
          <strong>{valor}</strong>
          <button
            type="button"
            aria-label="DORAS NA MÃO +"
            disabled={valor >= 13}
            onClick={() => aoAlterarValor(Math.min(13, valor + 1))}
          >
            +
          </button>
        </div>
      </div>

      {expandido && (
        <div className="doras-na-mao-teclado">
          <div className="doras-na-mao-abas" role="tablist">
            {ABAS_TECLADO.map((aba) => (
              <button
                key={aba.id}
                type="button"
                role="tab"
                aria-selected={abaAtiva === aba.id}
                className={`doras-na-mao-aba ${abaAtiva === aba.id ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.rotulo}
              </button>
            ))}
          </div>

          <div className="doras-na-mao-grade" role="group" aria-label={`Pedras ${abaAtiva}`}>
            {pedrasDaAba.map((pedra) => {
              const selecionada = pedrasSelecionadas.includes(pedra)
              return (
                <button
                  key={pedra}
                  type="button"
                  className={`doras-na-mao-pedra ${selecionada ? 'selecionada' : ''}`}
                  aria-label={nomePedraAcessivel(pedra)}
                  aria-pressed={selecionada}
                  onClick={() => alternarPedra(pedra)}
                >
                  <PedraSvg pedra={pedra} />
                </button>
              )
            })}
          </div>

          {pedrasSelecionadas.length > 0 && (
            <div className="doras-na-mao-barra-selecionadas" aria-label="Pedras selecionadas">
              {pedrasSelecionadas.map((pedra, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: posição importa para remoção individual
                  key={i}
                  type="button"
                  className="doras-na-mao-chip"
                  aria-label={`Remover ${nomePedraAcessivel(pedra)}`}
                  onClick={() => removerPedra(i)}
                >
                  <PedraSvg pedra={pedra} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
