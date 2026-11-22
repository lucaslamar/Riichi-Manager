import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import BotoesOpcao from './BotoesOpcao'

/** Se a partida acaba quando alguém fica negativado, no Registrar e no torneio. */
export default function CampoTobi({
  tobi,
  aoMudar,
}: {
  tobi: boolean
  aoMudar: (tobi: boolean) => void
}) {
  const { t } = useI18n()
  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {t('tableConfig.negative.title')}
        <AjudaCampo rotulo={t('tableConfig.negative.title')}>
          <p>{t('tableConfig.negative.helpEnds')}</p>
          <p>{t('tableConfig.negative.helpGoesOn')}</p>
        </AjudaCampo>
      </span>
      <BotoesOpcao<'acaba' | 'continua'>
        rotulo={t('tableConfig.negative.title')}
        valor={tobi ? 'acaba' : 'continua'}
        aoEscolher={(valor) => aoMudar(valor === 'acaba')}
        opcoes={[
          { valor: 'acaba', rotulo: t('tableConfig.negative.ends') },
          { valor: 'continua', rotulo: t('tableConfig.negative.goesOn') },
        ]}
      />
    </div>
  )
}
