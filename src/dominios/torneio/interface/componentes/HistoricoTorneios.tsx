import { useMemo } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { historicoDeTorneios, type FiltroHistorico } from '../../logica/torneio'
import type { FormatoTorneio, Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import '../torneio.css'
import { filtrarLista, type FiltrosLista } from '@/dominios/centerpiece/logica/filtrosAndamento'
import { nomeNoTorneio } from '../../logica/torneio'

export const FORMATOS_TORNEIO: readonly FormatoTorneio[] = [
  'rodizio',
  'suico',
  'eliminatorio',
  'corridos',
  'temporada',
]

/**
 * Torneios finalizados e temporadas. A busca e os filtros vêm do Histórico,
 * que mostra esta lista quando o tipo escolhido é Torneios.
 */
export default function HistoricoTorneios({
  aoAbrir,
  aoAbrirTemporada,
  busca,
  filtrosLista,
}: {
  aoAbrir: (torneio: Torneio) => void
  aoAbrirTemporada: (temporadaId: string) => void
  busca: string
  filtrosLista: FiltrosLista
}) {
  const { t, idioma } = useI18n()
  const { torneios, temporadas } = useTorneios()
  const { jogadores } = useJogadores()
  const filtro: FiltroHistorico = {
    busca,
    formato: (filtrosLista.formato ?? 'todos') as FiltroHistorico['formato'],
    de: '',
    ate: '',
  }

  const finalizados = torneios.filter((torneio) => torneio.status === 'finalizado')
  const historico = useMemo(() => {
    const convidados = Object.assign({}, ...torneios.map((item) => item.convidados ?? {}))
    const nomeDe = (id: string) => nomeNoTorneio({ convidados }, jogadores, id)
    const encontrados = historicoDeTorneios(torneios, filtro, nomeDe)
    // Período e ordem da folha de filtros, pelo dia do torneio.
    return filtrarLista(
      encontrados.map((torneio) => ({
        torneio,
        data: `${torneio.data}T12:00:00`,
        nome: torneio.nome,
        textos: [],
      })),
      '',
      filtrosLista,
      new Date(),
      idioma,
    ).map((item) => item.torneio)
    // filtro sai de busca e filtrosLista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneios, busca, filtrosLista, jogadores, idioma])
  const data = (dia: string) =>
    new Intl.DateTimeFormat(idioma, { dateStyle: 'medium' }).format(new Date(`${dia}T12:00:00`))

  return (
    <div className="trn-pagina trn-historico">
      {temporadas.length > 0 && (
        <>
          <h3 className="ptd-rotulo">{t('tournament.season.listTitle')}</h3>
          <ul className="cm-lista">
            {[...temporadas].reverse().map((temporada) => (
              <li key={temporada.id}>
                <button
                  type="button"
                  className="trn-card"
                  onClick={() => aoAbrirTemporada(temporada.id)}
                >
                  <i className="fas fa-calendar-days" aria-hidden="true" />
                  <strong>{temporada.nome}</strong>
                  <span>
                    {data(temporada.inicio)} – {data(temporada.fim)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <h3 className="ptd-rotulo">{t('tournament.history.title')}</h3>
        </>
      )}
      {finalizados.length === 0 ? (
        <p className="ptd-vazio">{t('tournament.history.empty')}</p>
      ) : (
        <>
          {historico.length === 0 ? (
            <p className="ptd-vazio">{t('tournament.history.noMatch')}</p>
          ) : (
            <ul className="cm-lista">
              {historico.map((torneio) => (
                <li key={torneio.id}>
                  <button type="button" className="trn-card" onClick={() => aoAbrir(torneio)}>
                    <i className="fas fa-trophy" aria-hidden="true" />
                    <strong>{torneio.nome}</strong>
                    <span>
                      {data(torneio.data)} · {t(`tournament.formats.${torneio.formato.tipo}`)} ·{' '}
                      {t('tournament.history.players', { count: torneio.jogadorIds.length })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
