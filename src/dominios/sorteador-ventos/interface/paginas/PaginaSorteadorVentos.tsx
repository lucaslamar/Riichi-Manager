import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import CardVento from '../componentes/CardVento'
import { useSorteadorVentos } from '../hooks/useSorteadorVentos'
import '../estilos/sorteador-ventos.css'

export default function PaginaSorteadorVentos() {
  const { t } = useI18n()
  const {
    ventos,
    ventosSorteados,
    ventoAnimado,
    sorteando,
    sorteioCompleto,
    sortearProximoVento,
    reiniciarSorteio,
  } = useSorteadorVentos()

  const botaoDesabilitado = sorteando || sorteioCompleto

  return (
    <main className="sorteador-ventos">
      <div className="cabecalho-secao sorteador-ventos__cabecalho">
        <i className="fas fa-wind icone-secao" aria-hidden="true" />
        <div>
          <h2>{t('windDraw.title')}</h2>
          <p className="subtitulo-secao">{t('windDraw.subtitle')}</p>
        </div>
      </div>

      <div className="sorteador-ventos__grade" role="list" aria-label={t('windDraw.title')}>
        {ventos.map((vento) => (
          <div key={vento.codigo} role="listitem">
            <CardVento
              vento={vento}
              ventoAnimado={ventoAnimado}
              ventoSorteado={ventosSorteados.find((vs) => vs.vento.codigo === vento.codigo)}
            />
          </div>
        ))}
      </div>

      <div className="sorteador-ventos__acoes">
        <button
          type="button"
          className="sorteador-ventos__btn-sortear btn-primario"
          onClick={sortearProximoVento}
          disabled={botaoDesabilitado}
          aria-label={t('windDraw.drawButtonLabel')}
          aria-busy={sorteando}
        >
          <i className="fas fa-shuffle" aria-hidden="true" />
          {t('windDraw.draw')}
        </button>

        <button
          type="button"
          className="sorteador-ventos__btn-reiniciar btn-contorno"
          onClick={reiniciarSorteio}
          aria-label={t('windDraw.restartButtonLabel')}
        >
          <i className="fas fa-rotate-left" aria-hidden="true" />
          {t('windDraw.restart')}
        </button>
      </div>
    </main>
  )
}
