import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import ListaFan from './ListaFan'
import type { ResultadoCalculoMcr } from './useCalculadoraMaoChinesa'

/** Total de fan, lista e pagamentos MCR. Mão abaixo de 8 fan não mostra pagamento. */
export default function ResultadoFan({ resultado }: { resultado: ResultadoCalculoMcr }) {
  const { t, numero } = useI18n()
  const { fan, pagamento } = resultado
  const pontos = (valor: number) => t('mcr.resultado.pontos', { pontos: numero(valor) })

  return (
    <section className="card mcr-secao mcr-resultado" aria-labelledby="mcr-resultado-titulo" aria-live="polite">
      <h3 id="mcr-resultado-titulo" className="mcr-secao__titulo">
        {t('mcr.resultado.titulo')}
      </h3>
      {!fan.batida && <p className="mcr-aviso">{t('mcr.resultado.naoBate')}</p>}
      {fan.batida && (
        <>
          <p className="mcr-resultado__total">{t('mcr.resultado.fanTotal', { total: numero(fan.fanTotal) })}</p>
          {fan.flores > 0 && (
            <p className="mcr-resultado__detalhe">
              {t('mcr.resultado.semFlores', { fan: numero(fan.fanSemFlores), flores: numero(fan.flores) })}
            </p>
          )}
          <ListaFan fans={fan.fans} flores={fan.flores} />
          {!fan.valido && <p className="mcr-aviso">{t('mcr.resultado.invalida')}</p>}
        </>
      )}
      {pagamento && (
        <>
          <h4 className="mcr-secao__subtitulo">{t('mcr.resultado.pagamentos')}</h4>
          <dl className="mcr-pagamentos">
            <dt>{t('mcr.resultado.vencedorRecebe')}</dt>
            <dd>{pontos(pagamento.ganhadorRecebe)}</dd>
            {pagamento.pagamentos[0].quem === 'descartador' ? (
              <>
                <dt>{t('mcr.resultado.descartador')}</dt>
                <dd>{pontos(pagamento.pagamentos[0].valor)}</dd>
                <dt>{t('mcr.resultado.outro')}</dt>
                <dd>{pontos(pagamento.pagamentos[1].valor)}</dd>
              </>
            ) : (
              <>
                <dt>{t('mcr.resultado.cadaJogador')}</dt>
                <dd>{pontos(pagamento.pagamentos[0].valor)}</dd>
              </>
            )}
          </dl>
        </>
      )}
    </section>
  )
}
