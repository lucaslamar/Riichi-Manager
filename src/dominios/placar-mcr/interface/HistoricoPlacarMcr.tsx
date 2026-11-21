import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BuscaFiltrosLista from '@/dominios/centerpiece/interface/componentes/BuscaFiltrosLista'
import FiltroTipo from '@/dominios/centerpiece/interface/componentes/FiltroTipo'
import {
  FILTROS_LISTA_PADRAO,
  filtrarLista,
  type FiltrosLista,
} from '@/dominios/centerpiece/logica/filtrosAndamento'
import type { FiltroTipoMesa } from '@/dominios/centerpiece/logica/tipoDaMesa'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import HistoricoTorneios, {
  FORMATOS_TORNEIO,
} from '@/dominios/torneio/interface/componentes/HistoricoTorneios'
import type { PlacarMcr } from '../logica/placar'
import { nomeDaCadeira } from './nomes'
import { LinhaPlacar } from './PaginaPlacarMcr'
import { acoesPlacaresMcr } from './usePlacaresMcr'

/** O MCR não tem Clube: Todas, Partidas e Torneios. */
const TIPOS_MCR: readonly FiltroTipoMesa[] = ['todas', 'avulsa', 'torneio']

/**
 * Histórico do Placar MCR com a busca, os filtros e os tipos do Histórico do
 * Riichi. Em Torneios, a lista é a mesma dos torneios do Riichi (os do modo).
 */
export default function HistoricoPlacarMcr({
  finalizados,
  aoVoltar,
  aoAbrir,
  aoAbrirTorneio,
  aoAbrirTemporada,
}: {
  finalizados: readonly PlacarMcr[]
  aoVoltar: () => void
  aoAbrir: (id: string) => void
  aoAbrirTorneio: (id: string) => void
  aoAbrirTemporada: (id: string) => void
}) {
  const { t, idioma } = useI18n()
  const { jogadores } = useJogadores()
  const [tipo, setTipo] = useState<FiltroTipoMesa>('todas')
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState<FiltrosLista>(FILTROS_LISTA_PADRAO)

  const doTipo = finalizados.filter(
    (placar) => tipo === 'todas' || (tipo === 'avulsa') === !placar.torneio,
  )
  const lista = filtrarLista(
    doTipo.map((placar) => ({
      placar,
      data: placar.finalizadoEm ?? placar.criadoEm,
      nome: '',
      textos: placar.jogadorIds.map((id) => nomeDaCadeira(jogadores, id, '', placar.convidados)),
    })),
    busca,
    filtros,
    new Date(),
    idioma,
  ).map((item) => item.placar)

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={t('match.home.history')} aoVoltar={aoVoltar} />
      <div className="ptd-filtro-historico">
        <BuscaFiltrosLista
          busca={busca}
          aoBuscar={setBusca}
          filtros={filtros}
          aoFiltrar={setFiltros}
          placeholder={t(tipo === 'torneio' ? 'tournament.history.search' : 'match.history.search')}
          formatos={
            tipo === 'torneio'
              ? [
                  { valor: 'todos', rotulo: t('tournament.history.allFormats') },
                  ...FORMATOS_TORNEIO.map((formato) => ({
                    valor: formato,
                    rotulo: t(`tournament.formats.${formato}`),
                  })),
                ]
              : undefined
          }
        />
        <FiltroTipo
          valor={tipo}
          tipos={TIPOS_MCR}
          aoMudar={(novo) => {
            setTipo(novo)
            if (novo !== 'torneio') setFiltros((atuais) => ({ ...atuais, formato: 'todos' }))
          }}
        />
      </div>

      {tipo === 'torneio' ? (
        <HistoricoTorneios
          aoAbrir={(torneio) => aoAbrirTorneio(torneio.id)}
          aoAbrirTemporada={aoAbrirTemporada}
          busca={busca}
          filtrosLista={filtros}
        />
      ) : finalizados.length === 0 ? (
        <p className="ptd-vazio">{t('match.history.empty')}</p>
      ) : (
        <>
          {lista.length === 0 && <p className="ptd-vazio">{t('match.history.noMatch')}</p>}
          <ul className="placar-mcr__lista">
            {lista.map((placar) => (
              <LinhaPlacar key={placar.id} placar={placar} aoAbrir={() => aoAbrir(placar.id)} />
            ))}
          </ul>
          <button
            type="button"
            className="btn-perigo placar-mcr__apagar-tudo"
            onClick={() => {
              if (
                !window.confirm(
                  t('placar.mcr.confirmarApagarHistorico', { count: finalizados.length }),
                )
              )
                return
              finalizados.forEach((placar) => acoesPlacaresMcr.excluir(placar.id))
            }}
          >
            {t('placar.mcr.apagarHistorico')}
          </button>
        </>
      )}
    </section>
  )
}
