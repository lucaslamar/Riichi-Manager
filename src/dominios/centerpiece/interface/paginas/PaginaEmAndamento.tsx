import { useMemo, useState } from 'react'
import { nomeApp } from '@/compartilhado/marca/nome-app'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { acoesPlacaresMcr, usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { partidasAbertasMcr } from '@/dominios/placar-mcr/logica/rankingMcr'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import { useSubtituloTorneio } from '@/dominios/torneio/interface/textoTorneio'
import { mesasRegistradas } from '../../logica/encontroClube'
import type { FiltroTipoMesa } from '../../logica/tipoDaMesa'
import FiltroTipo from '../componentes/FiltroTipo'
import BuscaFiltrosLista from '../componentes/BuscaFiltrosLista'
import {
  FILTROS_LISTA_PADRAO,
  filtrarLista,
  type FiltrosLista,
} from '../../logica/filtrosAndamento'
import { nomeNoTorneio } from '@/dominios/torneio/logica/torneio'
import type { ReactNode } from 'react'
import type { Cadeira, Partida } from '../../logica/partida'
import CardMesa from '../componentes/CardMesa'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import { usePartidasPausadas } from '../hooks/usePartidasPausadas'
import { useTextoAndamento } from '../hooks/useTextoAndamento'
import CardPausada from '../componentes/CardPausada'
import '../config-mesa.css'
import { nomeDoAssento } from '../nomeDoAssento'
import { textoDaPartida } from '../textoPartida'

/**
 * O que está em andamento: partidas avulsas abertas no placar, o encontro do
 * clube com mesas sem resultado e os torneios em jogo. Um filtro separa os três.
 * Clube e torneio só registram o resultado: o card abre as mesas deles. Mesa de
 * clube aberta no placar (de versões antigas) entra como partida, para terminar
 * ou descartar.
 */
export default function PaginaEmAndamento({
  aoVoltar,
  aoAbrirMesa,
  aoAbrirSorteio,
  aoAbrirTorneio,
  aoRetomar,
}: {
  aoVoltar: () => void
  aoAbrirMesa: (id: string) => void
  aoAbrirSorteio: () => void
  aoAbrirTorneio: (id: string) => void
  /** Retomar uma salva para continuar. Sem ela (MCR), a lista não mostra salvas. */
  aoRetomar?: (id: string) => void
}) {
  const { t, numero, idioma } = useI18n()
  const riichi = usePartidas()
  // Modo Chinês: as mesas são os placares MCR abertos, e não há Clube.
  const chines = useModoJogoAtual() === 'mcr'
  const placaresMcr = usePlacaresMcr()
  const abertasMcr = useMemo(() => partidasAbertasMcr(placaresMcr), [placaresMcr])
  const partidas = chines
    ? (placaresMcr.filter(
        (placar) => placar.finalizadoEm !== null,
      ) as unknown as typeof riichi.partidas)
    : riichi.partidas
  const abertas = chines ? abertasMcr : riichi.abertas
  const descartar = chines ? acoesPlacaresMcr.excluir : riichi.descartar
  const { jogadores } = useJogadores()
  const clube = useClube()
  const { sorteio } = clube
  const { torneios } = useTorneios()
  const subtituloTorneio = useSubtituloTorneio()
  const [filtro, setFiltro] = useState<FiltroTipoMesa>('todas')
  const [busca, setBusca] = useState('')
  const [filtrosLista, setFiltrosLista] = useState<FiltrosLista>(FILTROS_LISTA_PADRAO)
  const torneiosEmJogo = torneios.filter(
    (torneio) => torneio.status === 'em_andamento' && !torneio.transferidoEm,
  )
  const registradas = sorteio ? mesasRegistradas(sorteio, partidas) : 0
  const sorteioPendente = sorteio && registradas < sorteio.mesas.length ? sorteio : null
  const mostra = (tipo: FiltroTipoMesa) => filtro === 'todas' || filtro === tipo
  const dataHora = (iso: string) =>
    new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(iso),
    )
  const { pausadas, descartar: descartarPausada } = usePartidasPausadas()
  const salvas = aoRetomar && !chines ? pausadas : []
  const textoAndamento = useTextoAndamento()
  const [pausadaParaDescartar, setPausadaParaDescartar] = useState<string | null>(null)
  const { aviso, mostrar } = useAviso()
  const [paraDescartar, setParaDescartar] = useState<string | null>(null)

  // Nome completo e apelido do cadastro: a busca acha por qualquer um dos dois.
  const nomesDe = (id: string | undefined) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? [jogador.nome, jogador.apelido ?? ''] : []
  }

  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoAssento(jogadores, partida.assentos[cadeira], (nome) =>
      t('players.deletedName', { name: nome }),
    )
  // O mesmo número do seletor "Mesa N" do placar.
  const rotuloDa = (partida: Partida) =>
    t('match.table.number', { number: abertas.indexOf(partida) + 1 })

  const compartilhar = async (partida: Partida) => {
    const texto = textoDaPartida(
      partida,
      rotuloDa(partida),
      nomeNa(partida),
      t,
      numero,
      nomeApp(chines ? 'mcr' : 'riichi'),
    )
    const resultado = await compartilharTexto(texto)
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  const card = (partida: Partida) => (
    <li key={partida.id}>
      <CardMesa
        partida={partida}
        modo="andamento"
        titulo={rotuloDa(partida)}
        nomeDe={nomeNa(partida)}
        aoAbrir={() => aoAbrirMesa(partida.id)}
        aoCompartilhar={() => void compartilhar(partida)}
        aoExcluir={() => setParaDescartar(partida.id)}
        semRiichi={chines}
      />
    </li>
  )

  // Mesas abertas no placar: todas são partidas (clube e torneio só registram resultado).
  const mesas = mostra('avulsa') ? abertas : []
  const nada =
    abertas.length === 0 && salvas.length === 0 && !sorteioPendente && torneiosEmJogo.length === 0

  // Um item por card, com o que a busca enxerga (nome, jogadores e data escrita).
  const itens: { chave: string; data: string; nome: string; textos: string[]; card: ReactNode }[] =
    [
      ...(mostra('torneio')
        ? torneiosEmJogo.map((torneio) => ({
            chave: `t-${torneio.id}`,
            data: torneio.criadoEm,
            nome: torneio.nome,
            textos: [
              torneio.nome,
              subtituloTorneio(torneio),
              t(`tournament.formatsShort.${torneio.formato.tipo}`),
              dataHora(torneio.criadoEm),
              ...torneio.jogadorIds.flatMap((id) => [
                nomeNoTorneio(torneio, jogadores, id, riichi.partidas) ?? '',
                ...nomesDe(id),
              ]),
            ],
            card: (
              <button
                type="button"
                className="cm-andamento-item"
                onClick={() => aoAbrirTorneio(torneio.id)}
              >
                <i className="fas fa-trophy" aria-hidden="true" />
                <span>
                  <span className="cm-andamento-titulo">
                    <strong>{torneio.nome}</strong>
                    <span className="cm-andamento-tipo">{t(`tournament.formatsShort.${torneio.formato.tipo}`)}</span>
                  </span>
                  <small>{subtituloTorneio(torneio)}</small>
                </span>
                <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
              </button>
            ),
          }))
        : []),
      ...(mostra('clube') && sorteioPendente
        ? [
            {
              chave: 'encontro',
              data: sorteioPendente.encontro.criadoEm,
              nome: t('match.club.meeting'),
              textos: [
                t('match.club.meeting'),
                dataHora(sorteioPendente.encontro.criadoEm),
                ...sorteioPendente.encontro.jogadores.flatMap((entrada) => [
                  entrada.nome,
                  ...nomesDe(entrada.jogadorId),
                ]),
              ],
              card: (
                <button type="button" className="cm-andamento-item" onClick={aoAbrirSorteio}>
                  <i className="fas fa-people-group" aria-hidden="true" />
                  <span>
                    <strong>{t('match.club.meeting')}</strong>
                    <small>
                      {dataHora(sorteioPendente.encontro.criadoEm)} ·{' '}
                      {t('match.types.registeredOf', {
                        count: registradas,
                        total: sorteioPendente.mesas.length,
                      })}
                    </small>
                  </span>
                  <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
                </button>
              ),
            },
          ]
        : []),
      ...salvas
        .filter((pausada) => mostra(pausada.encontro ? 'clube' : 'avulsa'))
        .map((pausada) => {
          const nomeDe = (cadeira: number) => {
            const { jogadorId, nome } = pausada.assentos[cadeira]
            const jogador = jogadores.find((item) => item.id === jogadorId)
            return (jogador ? nomeExibido(jogador) : nome) || '—'
          }
          return {
            chave: `p-${pausada.id}`,
            data: pausada.salvaEm,
            nome: textoAndamento(pausada),
            textos: [
              textoAndamento(pausada),
              dataHora(pausada.salvaEm),
              ...pausada.assentos.flatMap(({ cadeira, jogadorId }) => [
                nomeDe(cadeira),
                ...nomesDe(jogadorId ?? undefined),
              ]),
            ],
            card: (
              <CardPausada
                pausada={pausada}
                nomeDe={nomeDe}
                aoRetomar={() => aoRetomar?.(pausada.id)}
                aoDescartar={() => setPausadaParaDescartar(pausada.id)}
              />
            ),
          }
        }),
      ...mesas.map((partida) => ({
        chave: `m-${partida.id}`,
        data: partida.criadaEm,
        nome: rotuloDa(partida),
        textos: [
          rotuloDa(partida),
          dataHora(partida.criadaEm),
          ...([0, 1, 2, 3] as const).flatMap((cadeira) => [
            nomeNa(partida)(cadeira),
            ...nomesDe(partida.assentos[cadeira].jogadorId),
          ]),
        ],
        card: <ul className="cm-lista ptd-lista-mesas">{card(partida)}</ul>,
      })),
    ]
  // Sempre em grupos, na ordem dos botões: Partidas, Clube e Torneios. A ordem
  // dos filtros vale dentro de cada grupo (o sort é estável).
  const grupo = (chave: string) =>
    chave.startsWith('p-') ? 0 : chave.startsWith('m-') ? 1 : chave === 'encontro' ? 2 : 3
  const visiveis = filtrarLista(itens, busca, filtrosLista, new Date(), idioma).sort(
    (um, outro) => grupo(um.chave) - grupo(outro.chave),
  )

  return (
    <section className="ptd-inicio cm-pagina">
      <TituloTela titulo={t('match.home.inProgress')} aoVoltar={aoVoltar} />
      {!nada && (
        <BuscaFiltrosLista
          busca={busca}
          aoBuscar={setBusca}
          filtros={filtrosLista}
          aoFiltrar={setFiltrosLista}
        />
      )}
      {!nada && <FiltroTipo valor={filtro} aoMudar={setFiltro} />}
      {nada ? (
        <p className="ptd-vazio">{t('match.home.noneOpen')}</p>
      ) : visiveis.length === 0 ? (
        <p className="ptd-vazio">{t('match.listFilters.noResults')}</p>
      ) : (
        <div className="cm-grupos">
          {visiveis.map((item, indice) => (
            <div key={item.chave}>
              {indice === 0 && item.chave.startsWith('p-') && (
                <h3 className="ptd-rotulo">{t('match.paused.list')}</h3>
              )}
              {item.card}
            </div>
          ))}
        </div>
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {pausadaParaDescartar && (
        <ModalConfirmacao
          titulo={t('match.paused.discardTitle')}
          texto={t('match.home.discardHelp')}
          rotuloConfirmar={t('match.home.discard')}
          perigo
          aoFechar={() => setPausadaParaDescartar(null)}
          aoConfirmar={() => {
            descartarPausada(pausadaParaDescartar)
            setPausadaParaDescartar(null)
          }}
        />
      )}

      {paraDescartar && (
        <ModalConfirmacao
          titulo={t('match.home.discardTitle')}
          texto={t('match.home.discardHelp')}
          rotuloConfirmar={t('match.home.discard')}
          perigo
          aoFechar={() => setParaDescartar(null)}
          aoConfirmar={() => {
            descartar(paraDescartar)
            setParaDescartar(null)
          }}
        />
      )}
    </section>
  )
}
