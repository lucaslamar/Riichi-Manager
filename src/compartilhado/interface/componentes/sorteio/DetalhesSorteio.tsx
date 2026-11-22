import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { EstatisticaDaGrade } from '@/compartilhado/sorteio/estatistica'
import './qualidade-sorteio.css'

/** Sem acento e sem maiúscula, para a busca. */
const paraBusca = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function Metrica({ rotulo, valor, ajuda }: { rotulo: string; valor: string; ajuda: string }) {
  return (
    <div className="qds-metrica">
      <dt>{rotulo}</dt>
      <dd>{valor}</dd>
      <p>{ajuda}</p>
    </div>
  )
}

/** Folha com a qualidade do sorteio por métrica, por jogador e por vento. */
export default function DetalhesSorteio({
  estatistica,
  nomeDe,
  aoFechar,
}: {
  estatistica: EstatisticaDaGrade
  nomeDe: (id: string) => string
  aoFechar: () => void
}) {
  const { t, idioma, numero } = useI18n()
  const [busca, setBusca] = useState('')
  const { adversariosDiferentes, indiretos, paresRepetidos, ventos } = estatistica
  const procurado = paraBusca(busca.trim())
  const linhas = estatistica.porJogador.filter((linha) => paraBusca(nomeDe(linha.jogadorId)).includes(procurado))
  const media = new Intl.NumberFormat(idioma, { maximumFractionDigits: 1 }).format(adversariosDiferentes.media)
  const metricas: [chave: string, valor: string][] = [
    ['repeatedPairs', numero(estatistica.duplasRepetidas)],
    ['maxMeetings', numero(estatistica.maxVezesMesmaDupla)],
    ['repeatedTrios', numero(estatistica.triosRepetidos)],
    ['sameTables', numero(estatistica.mesasIguais)],
    ['maxPerPlayer', numero(estatistica.maxRepetidosPorJogador)],
    ['differentOpponents', t('tournament.diagnosis.averageAndLowest', { average: media, lowest: adversariosDiferentes.menor })],
    ...(ventos ? [['eastTimes', `${ventos.minLeste}–${ventos.maxLeste}`] as [string, string]] : []),
    [
      'indirect',
      indiretos.semEncontro === 0
        ? t('tournament.diagnosis.indirectAll')
        : `${numero(indiretos.comIndireto)}/${numero(indiretos.semEncontro)}`,
    ],
  ]

  return (
    <Modal
      titulo={t('tournament.gridStats.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
    >
      <p className="qds-nota">
        <span className={`qds-pilula qds-pilula--${estatistica.nota}`}>
          {t(`tournament.gridStats.grade.${estatistica.nota}`)}
        </span>
        {estatistica.minimoPossivel !== null && (
          <span>{t('tournament.gridStats.aboveMinimum', { min: estatistica.minimoPossivel })}</span>
        )}
      </p>

      <dl className="qds-metricas">
        {metricas.map(([chave, valor]) => (
          <Metrica
            key={chave}
            rotulo={t(`tournament.diagnosis.${chave}`)}
            valor={valor}
            ajuda={t(`tournament.diagnosis.${chave}Help`)}
          />
        ))}
      </dl>

      <h4 className="qds-subtitulo">{t('tournament.gridStats.perPlayer')}</h4>
      <input
        type="search"
        className="qds-busca"
        value={busca}
        placeholder={t('tournament.gridStats.searchPlayer')}
        aria-label={t('tournament.gridStats.searchPlayer')}
        autoComplete="off"
        onChange={(evento) => setBusca(evento.target.value)}
      />
      <ul className="qds-jogadores">
        {linhas.map((linha) => (
          <li key={linha.jogadorId}>
            <strong>{nomeDe(linha.jogadorId)}</strong>
            <span className="qds-apoio">
              {t('tournament.gridStats.opponents', { count: linha.adversariosDiferentes })}
              {linha.vezesLeste !== null && ` · ${t('tournament.gridStats.eastCount', { count: linha.vezesLeste })}`}
            </span>
            {linha.repetiuCom.length > 0 && (
              <span className="qds-chips">
                <span className="qds-apoio">{t('tournament.gridStats.repeatedWith')}</span>
                {linha.repetiuCom.map((id) => (
                  <span key={id} className="qds-chip">
                    {nomeDe(id)}
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>

      {paresRepetidos.length > 0 && (
        <>
          <h4 className="qds-subtitulo">{t('tournament.diagnosis.pairsTitle')}</h4>
          <div className="qds-chips">
            {paresRepetidos.map(({ jogadores, vezes }) => (
              <span key={jogadores.join('+')} className="qds-chip">
                {nomeDe(jogadores[0])} + {nomeDe(jogadores[1])} · {vezes}×
              </span>
            ))}
          </div>
        </>
      )}

      {ventos && (
        <>
          <h4 className="qds-subtitulo">{t('tournament.diagnosis.windsTitle')}</h4>
          <div className="qds-rolagem">
            <table className="qds-ventos">
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
                {ventos.porJogador.map(([jogador, contagem]) => (
                  <tr key={jogador}>
                    <td>{nomeDe(jogador)}</td>
                    {contagem.map((vezes, vento) => (
                      <td key={vento}>{vezes}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  )
}
