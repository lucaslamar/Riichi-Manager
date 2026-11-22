import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { pedeAtencao, type EstatisticaDaGrade } from '@/compartilhado/sorteio/estatistica'
import DetalhesSorteio from './DetalhesSorteio'
import './qualidade-sorteio.css'

interface AcaoDoPainel {
  /** Nome falado, com a rodada. */
  rotulo: string
  aoTocar: () => void
}

/**
 * Painel "Qualidade do sorteio" do Torneio e do Clube: fechado, uma linha com a nota.
 * Abre sozinho só quando a nota pede atenção e ninguém jogou a rodada ainda.
 */
export default function QualidadeSorteio({
  estatistica,
  nomeDe,
  antesDeJogar,
  rotulo,
  dica,
  sortear,
  voltar,
}: {
  estatistica: EstatisticaDaGrade
  nomeDe: (id: string) => string
  antesDeJogar: boolean
  /** Antes da nota (ex.: "Rodada 2 do dia"). */
  rotulo?: string
  /** Uma linha a mais no painel aberto. */
  dica?: string
  sortear?: AcaoDoPainel
  voltar?: AcaoDoPainel
}) {
  const { t } = useI18n()
  const atencao = pedeAtencao(estatistica)
  const [aberto, setAberto] = useState(atencao && antesDeJogar)
  const [detalhando, setDetalhando] = useState(false)
  const { duplasRepetidas, minimoPossivel, ventos } = estatistica

  let repeticao = t('tournament.gridStats.none')
  if (duplasRepetidas > 0) {
    repeticao = t('tournament.gridStats.repeats', { count: duplasRepetidas })
    if (minimoPossivel !== null) {
      repeticao += ` · ${
        duplasRepetidas <= minimoPossivel
          ? t('tournament.gridStats.atMinimum')
          : t('tournament.gridStats.aboveMinimum', { min: minimoPossivel })
      }`
    }
  }
  const regras = [
    t(estatistica.maxVezesMesmaDupla > 2 ? 'tournament.gridStats.hasTriple' : 'tournament.gridStats.noTriple'),
    ...(ventos ? [t(ventos.equilibrados ? 'tournament.gridStats.windsOk' : 'tournament.gridStats.windsBad')] : []),
  ].join(' · ')

  return (
    <section className={`qds-painel${aberto ? ' qds-painel--aberto' : ''}`}>
      <button type="button" className="qds-cabecalho" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        <strong>
          {rotulo ?? t('tournament.gridStats.title')}
          {rotulo && <span className="sr-only">, {t('tournament.gridStats.title')}</span>}
        </strong>
        <span className={`qds-pilula qds-pilula--${estatistica.nota}`}>
          {t(`tournament.gridStats.grade.${estatistica.nota}`)}
        </span>
        <i className={`fas fa-chevron-${aberto ? 'up' : 'down'}`} aria-hidden="true" />
      </button>

      {aberto && (
        <>
          <p className="qds-linha">{repeticao}</p>
          <p className="qds-linha qds-apoio">{regras}</p>
          {dica && <p className="qds-linha qds-apoio">{dica}</p>}
          <div className="qds-acoes">
            <button
              type="button"
              className="btn-contorno"
              aria-label={t('tournament.gridStats.detailsLabel')}
              aria-haspopup="dialog"
              onClick={() => setDetalhando(true)}
            >
              {t('tournament.gridStats.details')}
            </button>
            {sortear && (
              <button
                type="button"
                className={atencao || estatistica.nota === 'boa' ? 'btn-primario' : 'btn-contorno'}
                aria-label={sortear.rotulo}
                aria-haspopup="dialog"
                onClick={sortear.aoTocar}
              >
                <i className="fas fa-rotate" aria-hidden="true" /> {t('tournament.gridStats.redraw')}
              </button>
            )}
            {voltar && (
              <button type="button" className="btn-contorno" aria-label={voltar.rotulo} onClick={voltar.aoTocar}>
                <i className="fas fa-rotate-left" aria-hidden="true" /> {t('tournament.gridStats.undo')}
              </button>
            )}
          </div>
        </>
      )}

      {detalhando && (
        <DetalhesSorteio estatistica={estatistica} nomeDe={nomeDe} aoFechar={() => setDetalhando(false)} />
      )}
    </section>
  )
}
