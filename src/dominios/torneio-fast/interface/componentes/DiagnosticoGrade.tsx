import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { coberturaIndireta, distribuicaoDeVentos, notaDaGrade } from '../../logica/qualidade'
import type { RelatorioQualidade, Rodada } from '../../logica/tipos'

/** Diagnóstico da Grade: nota, termos explicados, ventos e encontros indiretos. */
export default function DiagnosticoGrade({
  qualidade,
  grade,
  nomeDe,
  abertoAoIniciar = false,
}: {
  qualidade: RelatorioQualidade
  grade: Rodada[]
  nomeDe: (jogador: string) => string
  abertoAoIniciar?: boolean
}) {
  const { t, numero } = useI18n()
  const [aberto, setAberto] = useState(abertoAoIniciar)
  const nota = notaDaGrade(qualidade)
  const indireta = useMemo(() => coberturaIndireta(grade), [grade])
  const ventos = useMemo(() => [...distribuicaoDeVentos(grade).entries()], [grade])

  const Metrica = ({ chave, valor }: { chave: string; valor: string }) => (
    <div className="trn-metrica">
      <dt>{t(`tournament.diagnosis.${chave}`)}</dt>
      <dd>{valor}</dd>
      <p>{t(`tournament.diagnosis.${chave}Help`)}</p>
    </div>
  )

  return (
    <section className="trn-bloco-painel">
      <button
        type="button"
        className="trn-cabecalho-painel"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
      >
        <strong>{t('tournament.diagnosis.title')}</strong>
        <span className={`trn-pilula trn-pilula--${nota}`}>{t(`tournament.diagnosis.grade.${nota}`)}</span>
        <i className={`fas fa-chevron-${aberto ? 'up' : 'down'}`} aria-hidden="true" />
      </button>

      {aberto && (
        <>
          <dl className="trn-metricas">
            <Metrica chave="maxMeetings" valor={numero(qualidade.maxRepeticioesPar)} />
            <Metrica chave="repeatedPairs" valor={numero(qualidade.quantidadeParesRepetidos)} />
            <Metrica chave="sameTables" valor={numero(qualidade.mesasCompletasRepetidas)} />
            <Metrica
              chave="indirect"
              valor={
                indireta.semEncontro === 0
                  ? t('tournament.diagnosis.indirectAll')
                  : `${numero(indireta.comIndireto)}/${numero(indireta.semEncontro)}`
              }
            />
          </dl>

          {qualidade.paresRepetidos.length > 0 && (
            <>
              <h4 className="trn-subtitulo">{t('tournament.diagnosis.pairsTitle')}</h4>
              <div className="trn-chips">
                {qualidade.paresRepetidos.map((par) => (
                  <span key={par.jogadores.join('+')} className="trn-chip">
                    {nomeDe(par.jogadores[0])} + {nomeDe(par.jogadores[1])} · {par.vezes}×
                  </span>
                ))}
              </div>
            </>
          )}

          <h4 className="trn-subtitulo">{t('tournament.diagnosis.windsTitle')}</h4>
          <div className="trn-tabela-rolagem">
            <table className="trn-tabela-ventos">
              <thead>
                <tr>
                  <th scope="col">{t('tournament.ranking.player')}</th>
                  <th scope="col" aria-label={t('winds.east')}>東</th>
                  <th scope="col" aria-label={t('winds.south')}>南</th>
                  <th scope="col" aria-label={t('winds.west')}>西</th>
                  <th scope="col" aria-label={t('winds.north')}>北</th>
                </tr>
              </thead>
              <tbody>
                {ventos.map(([jogador, contagem]) => (
                  <tr key={jogador}>
                    <td>{nomeDe(jogador)}</td>
                    {contagem.map((vezes, indice) => (
                      <td key={indice}>{vezes}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
