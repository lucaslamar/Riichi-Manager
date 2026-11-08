import { useMemo } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotoesOpcao from '@/dominios/centerpiece/interface/componentes/BotoesOpcao'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { encontrosDaTemporada, novoEncontro, rankingTemporada } from '../../logica/temporada'
import type { CriterioTemporada, Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import { useSubtituloTorneio } from '../textoTorneio'
import '../torneio.css'
import { nomeNoTorneio } from '../../logica/torneio'

const OPCOES_MINIMO = [2, 4, 6, 8, 10] as const
const OPCOES_MELHORES = [3, 5, 8, 10, 15] as const

/** Temporada: ranking acumulado, encontros passados e o botão Novo encontro. */
export default function PaginaTemporada({
  temporadaId,
  aoVoltar,
  aoAbrirEncontro,
}: {
  temporadaId: string
  aoVoltar: () => void
  aoAbrirEncontro: (encontro: Torneio) => void
}) {
  const { t, idioma, numero } = useI18n()
  const { torneios, temporadas, salvar, salvarTemporada } = useTorneios()
  const { partidas } = usePartidas()
  const { jogadores } = useJogadores()
  const subtitulo = useSubtituloTorneio()
  const temporada = temporadas.find((item) => item.id === temporadaId)
  const encontros = useMemo(() => encontrosDaTemporada(torneios, temporadaId), [torneios, temporadaId])
  const ranking = useMemo(
    () => (temporada ? rankingTemporada(encontros, partidas, temporada.criterio) : []),
    [temporada, encontros, partidas],
  )

  if (!temporada) {
    return (
      <section className="ptd-inicio trn-pagina">
        <TituloTela titulo={t('tournament.season.title')} aoVoltar={aoVoltar} />
      </section>
    )
  }

  const data = (dia: string) =>
    new Intl.DateTimeFormat(idioma, { dateStyle: 'medium' }).format(new Date(`${dia}T12:00:00`))
  // Convidados: o nome vem do encontro em que jogaram.
  const nomeDe = (id: string) =>
    nomeNoTorneio({ convidados: Object.assign({}, ...torneios.map((item) => item.convidados ?? {})) }, jogadores, id)
  const emAberto = encontros.find((encontro) => encontro.status !== 'finalizado')
  const mudarCriterio = (criterio: CriterioTemporada) => salvarTemporada({ ...temporada, criterio })

  const criarEncontro = () => {
    const agora = new Date()
    const nome = t('tournament.season.meetupName', {
      season: temporada.nome,
      number: encontros.length + 1,
    })
    const encontro = novoEncontro(temporada, { id: gerarId(), agora, nome })
    salvar(encontro)
    aoAbrirEncontro(encontro)
  }

  return (
    <section className="ptd-inicio trn-pagina">
      <TituloTela titulo={temporada.nome} aoVoltar={aoVoltar} />
      <p className="cfg-ajuda">
        {data(temporada.inicio)} – {data(temporada.fim)} ·{' '}
        {t('tournament.season.meetups', { count: encontros.length })}
      </p>

      <button
        type="button"
        className="btn-primario ptd-btn-largo"
        onClick={() => (emAberto ? aoAbrirEncontro(emAberto) : criarEncontro())}
      >
        <i className={`fas ${emAberto ? 'fa-play' : 'fa-plus'}`} aria-hidden="true" />{' '}
        {t(emAberto ? 'tournament.season.continueMeetup' : 'tournament.season.newMeetup')}
      </button>

      <h3 className="ptd-rotulo">{t('tournament.season.criterion')}</h3>
      <BotoesOpcao<CriterioTemporada['tipo']>
        rotulo={t('tournament.season.criterion')}
        valor={temporada.criterio.tipo}
        aoEscolher={(tipo) =>
          mudarCriterio(
            tipo === 'media'
              ? { tipo, minimoPartidas: 4 }
              : tipo === 'melhores'
                ? { tipo, quantidade: 5 }
                : { tipo },
          )
        }
        opcoes={[
          { valor: 'soma', rotulo: t('tournament.season.criterionSum') },
          { valor: 'media', rotulo: t('tournament.season.criterionAverage') },
          { valor: 'melhores', rotulo: t('tournament.season.criterionBest') },
        ]}
      />
      {temporada.criterio.tipo === 'media' && (
        <BotoesOpcao<number>
          rotulo={t('tournament.season.minimum')}
          valor={temporada.criterio.minimoPartidas}
          aoEscolher={(minimoPartidas) => mudarCriterio({ tipo: 'media', minimoPartidas })}
          opcoes={OPCOES_MINIMO.map((valor) => ({ valor, rotulo: String(valor) }))}
        />
      )}
      {temporada.criterio.tipo === 'melhores' && (
        <BotoesOpcao<number>
          rotulo={t('tournament.season.best')}
          valor={temporada.criterio.quantidade}
          aoEscolher={(quantidade) => mudarCriterio({ tipo: 'melhores', quantidade })}
          opcoes={OPCOES_MELHORES.map((valor) => ({ valor, rotulo: String(valor) }))}
        />
      )}
      <p className="cfg-ajuda">
        {temporada.criterio.tipo === 'soma'
          ? t('tournament.season.criterionSumHelp')
          : temporada.criterio.tipo === 'media'
            ? t('tournament.season.criterionAverageHelp', { count: temporada.criterio.minimoPartidas })
            : t('tournament.season.criterionBestHelp', { count: temporada.criterio.quantidade })}
      </p>

      <h3 className="ptd-rotulo">{t('tournament.season.ranking')}</h3>
      {ranking.length === 0 ? (
        <p className="ptd-vazio">{t('tournament.season.noResults')}</p>
      ) : (
        <div className="trn-tabela-rolagem">
          <table className="trn-tabela-temporada">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{t('tournament.ranking.player')}</th>
                <th scope="col">{t('tournament.season.points')}</th>
                <th scope="col">{t('tournament.season.games')}</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((linha, indice) => (
                <tr key={linha.jogadorId} className={linha.abaixoDoMinimo ? 'trn-abaixo-minimo' : undefined}>
                  <td>{linha.abaixoDoMinimo ? '–' : indice + 1}</td>
                  <td>{nomeDe(linha.jogadorId)}</td>
                  <td className={linha.valor >= 0 ? 'trn-positivo' : 'trn-negativo'}>
                    {new Intl.NumberFormat(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(linha.valor)}
                  </td>
                  <td>{numero(linha.partidas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="ptd-rotulo">{t('tournament.season.meetupsTitle')}</h3>
      {encontros.length === 0 ? (
        <p className="ptd-vazio">{t('tournament.season.noMeetups')}</p>
      ) : (
        <ul className="cm-lista">
          {[...encontros].reverse().map((encontro) => (
            <li key={encontro.id}>
              <button type="button" className="trn-card" onClick={() => aoAbrirEncontro(encontro)}>
                <i className="fas fa-calendar-day" aria-hidden="true" />
                <strong>{encontro.nome}</strong>
                <span>
                  {data(encontro.data)} · {subtitulo(encontro)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
