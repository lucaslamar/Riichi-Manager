import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { VentoSorteado } from '../../logica/tipos'

interface PropsResultadoVentos {
  ventosSorteados: VentoSorteado[]
  sorteioCompleto: boolean
}

export default function ResultadoVentos({ ventosSorteados, sorteioCompleto }: PropsResultadoVentos) {
  const { t } = useI18n()

  if (ventosSorteados.length === 0) return null

  return (
    <section className="resultado-ventos" aria-live="polite" aria-atomic="false">
      <h3 className="resultado-ventos__titulo">
        {sorteioCompleto ? t('windDraw.drawComplete') : t('windDraw.result')}
      </h3>
      <ol className="resultado-ventos__lista">
        {ventosSorteados.map((vs) => (
          <li key={vs.vento.codigo} className={`resultado-ventos__item resultado-ventos__item--${vs.vento.codigo}`}>
            <span className="resultado-ventos__kanji" aria-hidden="true">
              {vs.vento.kanji}
            </span>
            <span className="resultado-ventos__nome">{t(vs.vento.chaveNome)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
