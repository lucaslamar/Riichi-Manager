import { useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import CardMesa from '@/dominios/centerpiece/interface/componentes/CardMesa'
import ListaResultado from '@/dominios/centerpiece/interface/componentes/ListaResultado'
import {
  ListaMaos,
  ModalConfirmacao,
} from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { useAviso } from '@/dominios/centerpiece/interface/hooks/useAviso'
import { textoDaPartida } from '@/dominios/centerpiece/interface/textoPartida'
import type { Cadeira } from '@/dominios/centerpiece/logica/partida'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import { partidaDoHistoricoMcr } from '../logica/rankingMcr'
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
  const { t, idioma, numero } = useI18n()
  const { torneios } = useTorneios()
  const { aviso, mostrar } = useAviso()
  const [paraExcluir, setParaExcluir] = useState<string | null>(null)
  const [abertoId, setAbertoId] = useState<string | null>(null)
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

  // A partida finalizada aberta: a mesma tela do Histórico do Riichi.
  const aberto = finalizados.find((placar) => placar.id === abertoId)
  if (aberto) {
    const partida = partidaDoHistoricoMcr(aberto)
    const nomeNa = (cadeira: Cadeira) =>
      nomeDaCadeira(
        jogadores,
        aberto.jogadorIds[cadeira],
        t('placar.mcr.jogadorRemovido'),
        aberto.convidados,
      )
    return (
      <section className="ptd-inicio ptd-detalhe-historico">
        <TituloTela
          titulo={new Intl.DateTimeFormat(idioma, {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(aberto.finalizadoEm ?? aberto.criadoEm))}
          aoVoltar={() => setAbertoId(null)}
        />
        <ListaResultado linhas={partida.resultado ?? []} nomeDe={nomeNa} />
        {/* Registrada só com os totais, a partida não tem mãos para listar. */}
        {!aberto.pontosRegistrados && (
          <>
            <h3 className="ptd-rotulo">{t('match.hands.title')}</h3>
            <ListaMaos partida={partida} nomeDe={nomeNa} />
          </>
        )}
        <button
          type="button"
          className="btn-contorno ptd-btn-largo"
          onClick={() => aoAbrir(aberto.id)}
        >
          <i className="fas fa-table-cells-large" aria-hidden="true" /> {t('placar.mcr.verMesa')}
        </button>
      </section>
    )
  }

  return (
    <section className="ptd-inicio cm-pagina">
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
          {/* Os mesmos cards do Histórico do Riichi. */}
          <ul className="cm-lista ptd-lista-historico">
            {lista.map((placar) => {
              const partida = partidaDoHistoricoMcr(placar)
              const nomeNa = (cadeira: Cadeira) =>
                nomeDaCadeira(
                  jogadores,
                  placar.jogadorIds[cadeira],
                  t('placar.mcr.jogadorRemovido'),
                  placar.convidados,
                )
              const titulo = placar.torneio
                ? (torneios.find((torneio) => torneio.id === placar.torneio?.id)?.nome ??
                  t('match.types.torneio'))
                : t('placar.mcr.regrasMcr')
              const apoio =
                placar.torneio?.rodada !== undefined && placar.torneio.mesa !== undefined
                  ? t('match.types.roundTable', {
                      round: placar.torneio.rodada + 1,
                      table: placar.torneio.mesa + 1,
                    })
                  : undefined
              return (
                <li key={placar.id}>
                  <CardMesa
                    partida={partida}
                    modo="historico"
                    titulo={titulo}
                    apoio={apoio}
                    nomeDe={nomeNa}
                    semRiichi
                    aoAbrir={() => setAbertoId(placar.id)}
                    aoExcluir={() => setParaExcluir(placar.id)}
                    aoCompartilhar={async () => {
                      const resultado = await compartilharTexto(
                        textoDaPartida(partida, titulo, nomeNa, t, numero, 'Mahjong Manager'),
                      )
                      if (resultado === 'copiado') mostrar(t('match.club.copied'))
                      if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
                    }}
                  />
                </li>
              )
            })}
          </ul>
        </>
      )}
      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {paraExcluir && (
        <ModalConfirmacao
          titulo={t('placar.mcr.excluir')}
          texto={t('placar.mcr.confirmarExcluir')}
          rotuloConfirmar={t('placar.mcr.excluir')}
          perigo
          aoFechar={() => setParaExcluir(null)}
          aoConfirmar={() => {
            acoesPlacaresMcr.excluir(paraExcluir)
            setParaExcluir(null)
          }}
        />
      )}
    </section>
  )
}
