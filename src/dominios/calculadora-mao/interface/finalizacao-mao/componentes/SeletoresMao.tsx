import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Mao, VentoMao } from '../../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

export type AtualizarMao = (receita: (rascunho: Mao) => void) => void

function chaveVento(valor: VentoMao) {
  return valor === '1' ? 'winds.east' : valor === '2' ? 'winds.south' : valor === '3' ? 'winds.west' : 'winds.north'
}

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
  const { t } = useI18n()

  const renderizarSeletor = (
    titulo: string,
    valorAtual: VentoMao,
    valorDefinido: boolean,
    opcoes: { valor: VentoMao; nome: string }[],
    aoSelecionar: (rascunho: Mao, valor: VentoMao) => void,
    aoDefinir?: () => void,
  ) => (
    <div className="campo-vento-mao secao-vento-finalizacao">
      <span>{titulo}</span>
      <div
        className="pedras-vento-mao grade-ventos-finalizacao"
        role="group"
        aria-label={titulo}
      >
        {opcoes.map((vento) => {
          const nomeVento = t(chaveVento(vento.valor))
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
              className={`btn-vento-pedra botao-vento-finalizacao ${selecionado ? 'ativo' : ''} ${
                ventoIgual ? 'vento-igual' : ''
              }`}
              aria-pressed={selecionado}
              aria-label={
                titulo === t('calculator.roundWind')
                  ? t('calculator.chooseRoundWind', { wind: nomeVento })
                  : t('calculator.chooseSeatWind', { wind: nomeVento })
              }
              title={nomeVento}
              onClick={() => {
                atualizarMao((rascunho: Mao) => {
                  aoSelecionar(rascunho, vento.valor)
                })
                aoDefinir?.()
              }}
            >
              <PedraSvg pedra={`${vento.valor}z`} />
              <small className="label-vento">{nomeVento}</small>
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
          t('calculator.roundWind'),
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
          t('calculator.seatWind'),
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
  const { t } = useI18n()

  return (
    <div className="toggle-agari-mao">
      {(['tsumo', 'ron'] as const).map((tipo) => {
        const ativo = definido && mao.agari === tipo
        return (
          <button
            key={tipo}
            type="button"
            className={ativo ? 'ativo' : undefined}
            aria-pressed={ativo}
            aria-label={tipo === 'ron' ? t('calculator.chooseRon') : t('calculator.chooseTsumo')}
            onClick={() => {
              atualizarMao((rascunho: Mao) => {
                rascunho.agari = tipo
              })
              aoDefinir?.()
            }}
          >
            {tipo === 'ron' ? t('calculator.ron') : t('calculator.tsumo')}
          </button>
        )
      })}
    </div>
  )
}
