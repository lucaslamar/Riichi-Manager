import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Updater } from 'use-immer'
import type { Mao } from '../../../logica/mao'
import { nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../PedraSvg'

interface PropsIndicadoresDora {
  mao: Mao
  atualizarMao: Updater<Mao>
}

/**
 * Exibe indicadores de dora/uradora escolhidos e permite remocao.
 * O texto deixa claro que o usuario seleciona indicadores, nao a dora real.
 */
export function IndicadoresDora({ mao, atualizarMao }: PropsIndicadoresDora) {
  const { t } = useI18n()
  if (mao.dora.length === 0 && mao.uradora.length === 0 && mao.doraManual === 0) return null

  return (
    <div className={`indicadores-dora-selecionados ${mao.doraManual > 0 ? 'ignorado' : ''}`}>
      {mao.doraManual > 0 && (
        <div className="grupo-indicador-dora">
          <span>{t('calculator.manualDoraShort')}</span>
          <strong>{mao.doraManual}</strong>
        </div>
      )}
      {mao.dora.length > 0 && (
        <div className="grupo-indicador-dora">
          <span>{t('calculator.doraIndicators')}</span>
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
      {mao.uradora.length > 0 && (
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
