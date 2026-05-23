import type { Mao, VentoMao } from '../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../constantes'
import { PedraSvg } from './PedraSvg'

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
  const renderizarSeletor = (
    titulo: string,
    valorAtual: VentoMao,
    opcoes: { valor: VentoMao; nome: string }[],
    aoSelecionar: (rascunho: Mao, valor: VentoMao) => void,
  ) => (
    <div className="campo-vento-mao">
      <span>{titulo}</span>
      <div className="pedras-vento-mao" role="group" aria-label={titulo}>
        {opcoes.map((vento) => {
          const selecionado = valorAtual === vento.valor
          const ventoIgual = mao.ventoRodada === mao.ventoAssento && selecionado

          return (
            <button
              key={vento.valor}
              type="button"
              className={`btn-vento-pedra ${selecionado ? 'ativo' : ''} ${
                ventoIgual ? 'vento-igual' : ''
              }`}
              aria-pressed={selecionado}
              title={vento.nome}
              onClick={() =>
                atualizarMao((rascunho: Mao) => {
                  aoSelecionar(rascunho, vento.valor)
                })
              }
            >
              <PedraSvg pedra={`${vento.valor}z`} />
              <small>{vento.nome}</small>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="seletores-vento-mao">
      {mostrarVentoRodada &&
        renderizarSeletor('Vento da rodada', mao.ventoRodada, VENTOS_RODADA, (rascunho, valor) => {
          rascunho.ventoRodada = valor
        })}

      {mostrarAssento &&
        renderizarSeletor('Seu vento', mao.ventoAssento, VENTOS_ASSENTO, (rascunho, valor) => {
          rascunho.ventoAssento = valor
        })}
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
