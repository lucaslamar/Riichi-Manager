import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { historicoDeTorneios, type FiltroHistorico } from '../../logica/torneio'
import type { FormatoTorneio, Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import '../torneio.css'

const FORMATOS: readonly FormatoTorneio[] = ['rodizio', 'suico', 'eliminatorio', 'corridos', 'temporada']

/** Torneios finalizados, com busca por jogador, formato e datas. Fica na aba do Histórico. */
export default function HistoricoTorneios({
  aoAbrir,
  aoAbrirTemporada,
}: {
  aoAbrir: (torneio: Torneio) => void
  aoAbrirTemporada: (temporadaId: string) => void
}) {
  const { t, idioma } = useI18n()
  const { torneios, temporadas } = useTorneios()
  const { jogadores } = useJogadores()
  const [filtro, setFiltro] = useState<FiltroHistorico>({ busca: '', formato: 'todos', de: '', ate: '' })

  const finalizados = torneios.filter((torneio) => torneio.status === 'finalizado')
  const historico = useMemo(() => {
    const nomeDe = (id: string) => {
      const jogador = jogadores.find((item) => item.id === id)
      return jogador ? nomeExibido(jogador) : ''
    }
    return historicoDeTorneios(torneios, filtro, nomeDe)
  }, [torneios, filtro, jogadores])
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
                <button type="button" className="trn-card" onClick={() => aoAbrirTemporada(temporada.id)}>
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
            <div className="trn-filtros">
              <input
                type="search"
                className="trn-campo trn-busca"
                value={filtro.busca}
                placeholder={t('tournament.history.search')}
                aria-label={t('tournament.history.search')}
                onChange={(evento) => setFiltro({ ...filtro, busca: evento.target.value })}
              />
              <select
                className="trn-campo"
                value={filtro.formato}
                aria-label={t('tournament.history.format')}
                onChange={(evento) =>
                  setFiltro({ ...filtro, formato: evento.target.value as FiltroHistorico['formato'] })
                }
              >
                <option value="todos">{t('tournament.history.allFormats')}</option>
                {FORMATOS.map((formato) => (
                  <option key={formato} value={formato}>
                    {t(`tournament.formats.${formato}`)}
                  </option>
                ))}
              </select>
              <label className="trn-data">
                <span>{t('tournament.history.from')}</span>
                <input
                  type="date"
                  className="trn-campo"
                  value={filtro.de}
                  onChange={(evento) => setFiltro({ ...filtro, de: evento.target.value })}
                />
              </label>
              <label className="trn-data">
                <span>{t('tournament.history.to')}</span>
                <input
                  type="date"
                  className="trn-campo"
                  value={filtro.ate}
                  onChange={(evento) => setFiltro({ ...filtro, ate: evento.target.value })}
                />
              </label>
            </div>
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
