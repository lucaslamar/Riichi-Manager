import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import { retornoComOka } from '../../logica/configMesa'
import BotoesOpcao from './BotoesOpcao'

/** Com ou sem oka, igual nas Configurações de mesa e em Registrar partida. */
export default function EscolhaOka({
  pontosPartida,
  pontosRetorno,
  aoMudarRetorno,
}: {
  pontosPartida: number
  pontosRetorno: number
  aoMudarRetorno: (pontosRetorno: number) => void
}) {
  const { t, numero } = useI18n()
  const oka = (pontosRetorno - pontosPartida) * 4
  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {t('tableConfig.okaLabel')}
        <AjudaCampo rotulo={t('tableConfig.okaLabel')}>
          <p>{t('tableConfig.okaHelp')}</p>
          <p>{t('tableConfig.okaOffHelp')}</p>
        </AjudaCampo>
      </span>
      <BotoesOpcao
        rotulo={t('tableConfig.okaLabel')}
        valor={oka > 0 ? 'com' : 'sem'}
        aoEscolher={(escolha) => aoMudarRetorno(retornoComOka(pontosPartida, escolha === 'com'))}
        opcoes={[
          { valor: 'com', rotulo: t('tableConfig.okaWith') },
          { valor: 'sem', rotulo: t('tableConfig.okaWithout') },
        ]}
      />
      {oka > 0 && <p className="cfg-ajuda cfg-ajuda--grupo">{t('tableConfig.okaValue', { points: numero(oka) })}</p>}
    </div>
  )
}
