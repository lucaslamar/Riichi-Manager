import { useMemo, useState } from 'react'
import { exportarPdf } from '@/compartilhado/adaptadores/pdf'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { useAviso } from '@/dominios/centerpiece/interface/hooks/useAviso'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { rankingDoTorneio } from '../../logica/ranking'
import { relatorioDoRanking } from '../../logica/relatorios'
import AreaExportar from '../componentes/AreaExportar'
import { nomeDeArquivo } from '@/compartilhado/relatorio/relatorio'
import type { Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import '../torneio.css'
import { nomeNoTorneio } from '../../logica/torneio'

/**
 * Ranking do torneio: posição, jogador, pontos, média de colocação e partidas.
 * Top 3 em destaque. No Eliminatório, a fase em que cada um parou.
 */
export default function PaginaRankingTorneio({
  torneio,
  aoVoltar,
  aoAbrirTemporada,
}: {
  torneio: Torneio
  aoVoltar: () => void
  aoAbrirTemporada: (temporadaId: string) => void
}) {
  const { t, idioma, numero } = useI18n()
  const { partidas } = usePartidas()
  const { jogadores } = useJogadores()
  const { finalizar } = useTorneios()
  const { aviso, mostrar } = useAviso()
  const [encerrando, setEncerrando] = useState(false)
  const linhas = useMemo(() => rankingDoTorneio(torneio, partidas), [torneio, partidas])
  const eliminatorio = torneio.formato.tipo === 'eliminatorio'

  const nomeDe = (id: string) => nomeNoTorneio(torneio, jogadores, id)
  const pontos = (valor: number) =>
    `${valor > 0 ? '+' : ''}${new Intl.NumberFormat(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(valor)}`
  const media = (valor: number) =>
    valor ? new Intl.NumberFormat(idioma, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor) : '–'
  const fase = (valor: number) =>
    valor === 0 ? t('tournament.ranking.phaseQualifier') : t('tournament.ranking.phaseCut', { number: valor })

  const titulo = `${torneio.nome} · ${t('tournament.ranking.title')}`

  /** A classificação, para a área Exportar. */
  const relatorio = () =>
    relatorioDoRanking(linhas, {
      titulo: torneio.nome,
      subtitulo: t('tournament.ranking.title'),
      nome: nomeDe,
      valores: (linha) =>
        [
          pontos(linha.pontos),
          `${t('tournament.ranking.averagePlaceShort')} ${media(linha.mediaColocacao)}`,
          `${t('tournament.ranking.gamesShort')} ${numero(linha.partidas)}`,
          ...(eliminatorio ? [fase(linha.fase ?? 0)] : []),
        ].join(' · '),
    })

  const pdf = async () => {
    const ok = await exportarPdf({
      titulo,
      cabecalho: [
        '#',
        t('tournament.ranking.player'),
        t('tournament.ranking.points'),
        t('tournament.ranking.averagePlace'),
        t('tournament.ranking.games'),
        ...(eliminatorio ? [t('tournament.ranking.phase')] : []),
      ],
      linhas: linhas.map((linha) => [
        String(linha.posicao),
        nomeDe(linha.jogadorId),
        pontos(linha.pontos),
        media(linha.mediaColocacao),
        String(linha.partidas),
        ...(eliminatorio ? [fase(linha.fase ?? 0)] : []),
      ]),
      nomeArquivo: `${torneio.nome.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}-ranking.pdf`,
    })
    if (!ok) mostrar(t('tournament.ranking.pdfError'))
  }

  return (
    <section className="ptd-inicio trn-pagina trn-ranking">
      <TituloTela
        titulo={t('tournament.ranking.title')}
        aoVoltar={aoVoltar}
      />
      <p className="clb-encontro-data">{torneio.nome}</p>

      {torneio.formato.tipo === 'temporada' && (
        <button
          type="button"
          className="trn-card"
          onClick={() => torneio.formato.tipo === 'temporada' && aoAbrirTemporada(torneio.formato.temporadaId)}
        >
          <i className="fas fa-calendar-days" aria-hidden="true" />
          <strong>{t('tournament.ranking.seasonRanking')}</strong>
          <span>{t('tournament.ranking.seasonRankingHelp')}</span>
        </button>
      )}

      <div className="trn-tabela-rolagem">
        <table className="trn-tabela-temporada trn-tabela-ranking">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t('tournament.ranking.player')}</th>
              <th scope="col">{t('tournament.ranking.points')}</th>
              <th scope="col">
                <abbr title={t('tournament.ranking.averagePlace')}>{t('tournament.ranking.averagePlaceShort')}</abbr>
              </th>
              <th scope="col">
                <abbr title={t('tournament.ranking.games')}>{t('tournament.ranking.gamesShort')}</abbr>
              </th>
              {eliminatorio && <th scope="col">{t('tournament.ranking.phase')}</th>}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.jogadorId} className={linha.posicao <= 3 ? `trn-podio trn-podio--${linha.posicao}` : undefined}>
                <td>
                  {linha.posicao <= 3 ? (
                    <span className="trn-medalha" aria-label={t('tournament.ranking.place', { place: linha.posicao })}>
                      {linha.posicao}
                    </span>
                  ) : (
                    linha.posicao
                  )}
                </td>
                <td>{nomeDe(linha.jogadorId)}</td>
                <td className={linha.pontos > 0 ? 'trn-positivo' : linha.pontos < 0 ? 'trn-negativo' : undefined}>
                  {pontos(linha.pontos)}
                </td>
                <td>{media(linha.mediaColocacao)}</td>
                <td>{numero(linha.partidas)}</td>
                {eliminatorio && <td className="trn-fase">{fase(linha.fase ?? 0)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AreaExportar
        ajuda={t('tournament.share.rankingHelp')}
        relatorio={relatorio}
        nomeArquivo={nomeDeArquivo(torneio.nome, t('tournament.ranking.title'))}
        aoAvisar={mostrar}
        extras={
          <button type="button" className="btn-contorno" onClick={pdf}>
            <i className="fas fa-file-pdf" aria-hidden="true" /> PDF
          </button>
        }
      />

      {torneio.status === 'em_andamento' && !torneio.transferidoEm && (
        <button type="button" className="btn-contorno ptd-btn-largo trn-encerrar" onClick={() => setEncerrando(true)}>
          <i className="fas fa-flag-checkered" aria-hidden="true" /> {t('tournament.ranking.finish')}
        </button>
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {encerrando && (
        <ModalConfirmacao
          titulo={t('tournament.ranking.finishTitle')}
          texto={t('tournament.ranking.finishHelp')}
          rotuloConfirmar={t('tournament.ranking.finish')}
          aoFechar={() => setEncerrando(false)}
          aoConfirmar={() => {
            finalizar(torneio.id)
            setEncerrando(false)
            aoVoltar()
          }}
        />
      )}
    </section>
  )
}
