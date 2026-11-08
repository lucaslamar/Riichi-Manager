import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  criarRascunho,
  historicoDeTorneios,
  torneioAtivo,
  type FiltroHistorico,
} from '../../logica/torneio'
import type { FormatoTorneio, Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import { useSubtituloTorneio } from '../textoTorneio'
import '../torneio.css'

const FORMATOS: readonly FormatoTorneio[] = ['rodizio', 'suico', 'eliminatorio', 'corridos', 'temporada']

/** Entrada do Torneio: o torneio em jogo (ou criar um) e o histórico dos finalizados. */
export default function PaginaTorneio({
  aoVoltar,
  aoAbrir,
}: {
  aoVoltar: () => void
  aoAbrir: (torneio: Torneio) => void
}) {
  const { t, idioma } = useI18n()
  const { torneios, salvar } = useTorneios()
  const { jogadores } = useJogadores()
  const subtitulo = useSubtituloTorneio()
  const [filtro, setFiltro] = useState<FiltroHistorico>({ busca: '', formato: 'todos', de: '', ate: '' })

  const ativo = torneioAtivo(torneios)
  const nomeDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : ''
  }
  const finalizados = torneios.filter((torneio) => torneio.status === 'finalizado')
  const historico = useMemo(
    () => historicoDeTorneios(torneios, filtro, nomeDe),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [torneios, filtro, jogadores],
  )
  const data = (dia: string) =>
    new Intl.DateTimeFormat(idioma, { dateStyle: 'medium' }).format(new Date(`${dia}T12:00:00`))

  const criar = () => {
    const agora = new Date()
    const nome = t('tournament.defaultName', {
      date: new Intl.DateTimeFormat(idioma, { day: '2-digit', month: '2-digit' }).format(agora),
    })
    const novo = criarRascunho({ id: gerarId(), agora, nome })
    salvar(novo)
    aoAbrir(novo)
  }

  return (
    <section className="ptd-inicio trn-pagina">
      <TituloTela titulo={t('tournament.title')} aoVoltar={aoVoltar} />

      <button type="button" className="trn-card" onClick={() => (ativo ? aoAbrir(ativo) : criar())}>
        <i className={`fas ${ativo ? 'fa-trophy' : 'fa-plus'}`} aria-hidden="true" />
        <strong>{ativo ? ativo.nome : t('tournament.create')}</strong>
        <span>{ativo ? subtitulo(ativo) : t('tournament.createHelp')}</span>
      </button>

      <h3 className="ptd-rotulo">{t('tournament.history.title')}</h3>
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
    </section>
  )
}
