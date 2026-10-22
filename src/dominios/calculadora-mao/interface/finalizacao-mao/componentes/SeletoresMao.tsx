import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Mao } from '../../../logica/mao'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '../../constantes'
import { GradeVentos } from '../../compartilhado/componentes/GradeVentos'

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
  const { t } = useI18n()
  const ventoDuplo =
    ventoRodadaDefinido && ventoAssentoDefinido && mao.ventoRodada === mao.ventoAssento

  return (
    <div className="seletores-vento-mao">
      {mostrarAssento && (
        <GradeVentos
          titulo={t('calculator.seatWind')}
          opcoes={VENTOS_ASSENTO}
          selecionado={ventoAssentoDefinido ? mao.ventoAssento : null}
          destacarIgual={ventoDuplo}
          rotuloAcessivel={(nomeVento) => t('calculator.chooseSeatWind', { wind: nomeVento })}
          aoEscolher={(valor) => {
            atualizarMao((rascunho) => {
              rascunho.ventoAssento = valor
            })
            aoDefinirVentoAssento?.()
          }}
        />
      )}

      {mostrarVentoRodada && (
        <GradeVentos
          id="secao-vento-rodada"
          titulo={t('calculator.roundWind')}
          opcoes={VENTOS_RODADA}
          selecionado={ventoRodadaDefinido ? mao.ventoRodada : null}
          destacarIgual={ventoDuplo}
          rotuloAcessivel={(nomeVento) => t('calculator.chooseRoundWind', { wind: nomeVento })}
          aoEscolher={(valor) => {
            atualizarMao((rascunho) => {
              rascunho.ventoRodada = valor
            })
            aoDefinirVentoRodada?.()
          }}
        />
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
