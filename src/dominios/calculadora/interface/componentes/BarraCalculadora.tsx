import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsBarraCalculadora {
  modo: 'completo' | 'rapido'
}

/** Cabecalho compacto da calculadora; a navegacao entre modulos fica no menu global. */
export default function BarraCalculadora({
  modo,
}: PropsBarraCalculadora) {
  const { t } = useI18n()

  return (
    <div className={`cabecalho-secao cabecalho-calculadora cabecalho-calculadora-${modo}`}>
      <div className="titulo-calculadora">
        <i className="fas fa-calculator icone-secao" aria-hidden="true" />
        <div>
          <h2>{modo === 'rapido' ? t('calculator.quickTitle') : t('calculator.title')}</h2>
          <p className="subtitulo-secao">
            {modo === 'rapido' ? t('calculator.subtitleQuick') : t('calculator.subtitleComplete')}
          </p>
        </div>
      </div>
    </div>
  )
}
