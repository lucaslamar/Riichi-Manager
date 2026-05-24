import type { Mao, VentoMao } from '../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../constantes'
import { PedraSvg } from './PedraSvg'

export type AtualizarMao = (receita: (rascunho: Mao) => void) => void

export function SeletorVentos({
  mao,
  atualizarMao,
  mostrarVentoRodada = true,
  mostrarAssento = true,
  ventoRodadaDefinido = true,
  ventoAssentoDefinido = true,
  aoDefinirVentoRodada,
  aoDefinirVentoAssento,
}: {
  mao: Mao
  atualizarMao: AtualizarMao
  mostrarVentoRodada?: boolean
  mostrarAssento?: boolean
  ventoRodadaDefinido?: boolean
  ventoAssentoDefinido?: boolean
  aoDefinirVentoRodada?: () => void
  aoDefinirVentoAssento?: () => void
}) {
  const renderizarSeletor = (
    titulo: string,
    valorAtual: VentoMao,
    valorDefinido: boolean,
    opcoes: { valor: VentoMao; nome: string }[],
    aoSelecionar: (rascunho: Mao, valor: VentoMao) => void,
    aoDefinir?: () => void,
  ) => (
    <div className="campo-vento-mao">
      <span>{titulo}</span>
      <div className="pedras-vento-mao" role="group" aria-label={titulo}>
        {opcoes.map((vento) => {
          const selecionado = valorDefinido && valorAtual === vento.valor
          const ventoIgual =
            ventoRodadaDefinido &&
            ventoAssentoDefinido &&
            mao.ventoRodada === mao.ventoAssento &&
            selecionado

          return (
            <button
              key={vento.valor}
              type="button"
              className={`btn-vento-pedra ${selecionado ? 'ativo' : ''} ${
                ventoIgual ? 'vento-igual' : ''
              }`}
              aria-pressed={selecionado}
              title={vento.nome}
              onClick={() => {
                atualizarMao((rascunho: Mao) => {
                  aoSelecionar(rascunho, vento.valor)
                })
                aoDefinir?.()
              }}
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
        renderizarSeletor(
          'Vento da rodada',
          mao.ventoRodada,
          ventoRodadaDefinido,
          VENTOS_RODADA,
          (rascunho, valor) => {
            rascunho.ventoRodada = valor
          },
          aoDefinirVentoRodada,
        )}

      {mostrarAssento &&
        renderizarSeletor(
          'Seu vento',
          mao.ventoAssento,
          ventoAssentoDefinido,
          VENTOS_ASSENTO,
          (rascunho, valor) => {
            rascunho.ventoAssento = valor
          },
          aoDefinirVentoAssento,
        )}
    </div>
  )
}

/** Toggle Tsumo / Ron. */
export function ToggleAgari({
  mao,
  atualizarMao,
  definido = true,
  aoDefinir,
}: {
  mao: Mao
  atualizarMao: AtualizarMao
  definido?: boolean
  aoDefinir?: () => void
}) {
  return (
    <div className="toggle-agari-mao">
      {(['tsumo', 'ron'] as const).map((tipo) => (
        <button
          key={tipo}
          type="button"
          className={definido && mao.agari === tipo ? 'ativo' : undefined}
          aria-pressed={definido && mao.agari === tipo}
          onClick={() => {
            atualizarMao((rascunho: Mao) => {
              rascunho.agari = tipo
            })
            aoDefinir?.()
          }}
        >
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
      ))}
    </div>
  )
}
