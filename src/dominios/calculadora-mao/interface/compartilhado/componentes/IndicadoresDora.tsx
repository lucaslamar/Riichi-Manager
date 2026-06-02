import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Updater } from 'use-immer'
import type { Mao } from '../../../logica/mao'
import { nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from './PedraSvg'

interface PropsIndicadoresDora {
  mao: Mao
  atualizarMao: Updater<Mao>
  tipo?: 'dora' | 'uradora' | 'todos'
  aoLimparIndicadores?: () => void
}

/**
 * Exibe indicadores de dora/uradora escolhidos e permite remocao.
 * O texto deixa claro que o usuario seleciona indicadores, nao a dora real.
 */
export function IndicadoresDora({
  mao,
  atualizarMao,
  tipo = 'todos',
  aoLimparIndicadores,
}: PropsIndicadoresDora) {
  const { t } = useI18n()
  const mostrarDora = tipo === 'todos' || tipo === 'dora'
  const mostrarUradora = tipo === 'todos' || tipo === 'uradora'
  if ((mostrarDora ? mao.dora.length : 0) === 0 && (mostrarUradora ? mao.uradora.length : 0) === 0) {
    return (
      <div className="indicadores-dora-selecionados">
        <div className="grupo-indicador-dora grupo-indicador-vazio">
          <span>{t('calculator.noDoraIndicatorSelected')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="indicadores-dora-selecionados">
      {mostrarDora && mao.dora.length > 0 && (
        <div className="grupo-indicador-dora">
          <span>{t('calculator.doraUraIndicators')}</span>
          {mao.dora.map((pedraDora, indiceDora) => (
            <button
              key={indiceDora}
              className="chip-pedra dora"
              type="button"
              aria-label={t('calculator.removeDoraIndicator', {
                tile: nomePedraAcessivel(pedraDora),
              })}
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
      {aoLimparIndicadores && (
        <button
          className="btn-limpar-grupo-pedras"
          type="button"
          aria-label={t('calculator.clearDoraIndicators')}
          title={t('calculator.clearDoraIndicators')}
          onClick={aoLimparIndicadores}
        >
          <i className="fas fa-trash" aria-hidden="true" />
        </button>
      )}
      {mostrarUradora && mao.uradora.length > 0 && (
        <div className="grupo-indicador-dora">
          <span>{t('calculator.uraDoraIndicators')}</span>
          {mao.uradora.map((pedraUradora, indiceUradora) => (
            <button
              key={indiceUradora}
              className="chip-pedra dora"
              type="button"
              aria-label={t('calculator.removeUraDoraIndicator', {
                tile: nomePedraAcessivel(pedraUradora),
              })}
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
