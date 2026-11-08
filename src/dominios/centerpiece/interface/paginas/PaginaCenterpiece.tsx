import { useRef, useState, type RefObject } from 'react'
import { entrarTelaCheia } from '@/compartilhado/adaptadores/telaCheia'
import { useGestoHorizontal } from '@/compartilhado/interface/hooks/useGestoHorizontal'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import PaginaJogadores from '@/dominios/jogadores/interface/paginas/PaginaJogadores'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import PaginaTemporada from '@/dominios/torneio/interface/paginas/PaginaTemporada'
import PaginaTorneio from '@/dominios/torneio/interface/paginas/PaginaTorneio'
import { useSubtituloTorneio } from '@/dominios/torneio/interface/textoTorneio'
import { criarRascunho, torneioAtivo } from '@/dominios/torneio/logica/torneio'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import type { MesaDoSorteio } from '../../logica/encontroClube'
import { usoDoJogadorNasPartidas } from '../../logica/ranking'
import { useClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import CenterpieceSimples from './CenterpieceSimples'
import PaginaEmAndamento from './PaginaEmAndamento'
import PaginaHistorico from './PaginaHistorico'
import PaginaListaClube from './PaginaListaClube'
import PaginaMesasSorteadas from './PaginaMesasSorteadas'
import PaginaRanking from './PaginaRanking'
import PlacarPartida from './PlacarPartida'
import RegistrarFinalizada from './RegistrarFinalizada'
import SetupPartida from './SetupPartida'
import '../mesa.css'
import '../partida.css'
import '../clube.css'

type TelaModulo =
  | { nome: 'inicio' }
  | { nome: 'setup' }
  | { nome: 'listaClube' }
  | { nome: 'mesasSorteadas' }
  | { nome: 'registrarClube'; mesa: MesaDoSorteio; encontroId: string }
  | { nome: 'registrarFinalizada' }
  | { nome: 'simples' }
  | { nome: 'andamento' }
  | { nome: 'jogadores' }
  | { nome: 'historico' }
  | { nome: 'ranking' }
  | { nome: 'torneio'; id: string }
  | { nome: 'temporada'; id: string }
  | { nome: 'mesa'; id: string }

/** Raiz do módulo: no celular o `main` é uma grade, que esticaria as telas sem isto. */
export default function PaginaCenterpiece(props: PropsCenterpiece) {
  const raiz = useRef<HTMLElement | null>(null)
  return (
    <section ref={raiz} className="ptd-modulo">
      <TelasCenterpiece {...props} raiz={raiz} />
    </section>
  )
}

interface PropsCenterpiece {
  aoAbrirSorteador: () => void
  /**
   * 'simples': o botão Centerpiece da barra, que abre direto a mesa simples.
   * 'partidas': Mesa partida, o menu das partidas com pontos.
   */
  modo: 'simples' | 'partidas'
  /** Vizinhos na barra inferior, para o deslize no menu do módulo. */
  aoTelaAnterior?: () => void
  aoProximaTela?: () => void
}

/** Tela inicial do módulo (cards) e a navegação entre as telas dele. */
function TelasCenterpiece({
  aoAbrirSorteador,
  modo,
  aoTelaAnterior,
  aoProximaTela,
  raiz,
}: PropsCenterpiece & { raiz: RefObject<HTMLElement | null> }) {
  const { t, idioma } = useI18n()
  const { partidas, abertas, guardarNome } = usePartidas()
  const { sorteio, marcarRegistrada } = useClube()
  const [tela, setTela] = useState<TelaModulo>({ nome: modo === 'simples' ? 'simples' : 'inicio' })
  const irInicio = () => setTela({ nome: 'inicio' })
  const { telaCheiaMesa } = usePreferencias()
  const { torneios, salvar: salvarTorneio } = useTorneios()
  const subtituloTorneio = useSubtituloTorneio()
  const ativo = torneioAtivo(torneios)
  /** Sem torneio em jogo, o card já cria o rascunho e abre a Lista do torneio. */
  const criarTorneio = () => {
    const agora = new Date()
    const data = new Intl.DateTimeFormat(idioma, { day: '2-digit', month: '2-digit' }).format(agora)
    const novo = criarRascunho({ id: gerarId(), agora, nome: t('tournament.defaultName', { date: data }) })
    salvarTorneio(novo)
    return novo.id
  }

  /** O navegador só deixa entrar em tela cheia dentro do toque, por isso fica aqui. */
  const abrirMesa = (mesa: TelaModulo) => {
    if (telaCheiaMesa) entrarTelaCheia()
    setTela(mesa)
  }

  // No menu e no simples (que agora é a raiz do Centerpiece) segue o carrossel da
  // barra inferior; dentro das outras telas, os dois sentidos voltam ao menu.
  const naRaiz = tela.nome === 'inicio' || tela.nome === 'simples'
  useGestoHorizontal({
    alvo: raiz,
    aoDireita: naRaiz ? aoTelaAnterior : irInicio,
    aoEsquerda: naRaiz ? aoProximaTela : irInicio,
  })

  if (tela.nome === 'setup') {
    return <SetupPartida aoVoltar={irInicio} aoIniciar={(id) => abrirMesa({ nome: 'mesa', id })} />
  }
  if (tela.nome === 'listaClube') {
    return (
      <PaginaListaClube
        aoVoltar={irInicio}
        aoSortear={() => setTela({ nome: 'mesasSorteadas' })}
      />
    )
  }
  if (tela.nome === 'mesasSorteadas') {
    return (
      <PaginaMesasSorteadas
        aoVoltar={() => setTela({ nome: 'listaClube' })}
        aoRegistrarMesa={(mesa) => {
          if (sorteio) setTela({ nome: 'registrarClube', mesa, encontroId: sorteio.encontro.id })
        }}
      />
    )
  }
  if (tela.nome === 'registrarClube') {
    return (
      <RegistrarFinalizada
        key={`${tela.encontroId}-${tela.mesa.numero}`}
        clube={{ mesa: tela.mesa, encontroId: tela.encontroId }}
        aoVoltar={() => setTela({ nome: 'mesasSorteadas' })}
        aoRegistrar={(id) => {
          // Volta às mesas: o organizador costuma registrar uma atrás da outra.
          marcarRegistrada(tela.mesa.numero, id)
          setTela({ nome: 'mesasSorteadas' })
        }}
      />
    )
  }
  if (tela.nome === 'registrarFinalizada') {
    return (
      <RegistrarFinalizada aoVoltar={irInicio} aoRegistrar={() => setTela({ nome: 'historico' })} />
    )
  }
  if (tela.nome === 'simples') return <CenterpieceSimples aoAbrirSorteador={aoAbrirSorteador} />
  if (tela.nome === 'mesa') {
    const partida = partidas.find((item) => item.id === tela.id)
    if (partida) {
      return (
        <PlacarPartida
          key={partida.id}
          partida={partida}
          aoSair={irInicio}
          aoFinalizar={irInicio}
          aoTrocarDeMesa={(id) => setTela({ nome: 'mesa', id })}
        />
      )
    }
  }
  if (tela.nome === 'jogadores') {
    return (
      <PaginaJogadores
        aoVoltar={irInicio}
        usoDoJogador={(id) => {
          const uso = usoDoJogadorNasPartidas(partidas, id)
          return {
            partidasFinalizadas: uso.partidasFinalizadas,
            mesasAbertas: uso.mesasAbertas.map((numero) => t('match.table.number', { number: numero })),
          }
        }}
        aoExcluir={(jogador) => guardarNome(jogador.id, nomeExibido(jogador))}
      />
    )
  }
  if (tela.nome === 'historico') {
    return <PaginaHistorico aoVoltar={irInicio} aoAbrirTorneio={(torneio) => setTela({ nome: 'torneio', id: torneio.id })}
        aoAbrirTemporada={(id) => setTela({ nome: 'temporada', id })}
      />
  }
  if (tela.nome === 'ranking') return <PaginaRanking aoVoltar={irInicio} />
  if (tela.nome === 'torneio') {
    return (
      <PaginaTorneio
        key={tela.id}
        torneioId={tela.id}
        aoVoltar={irInicio}
        aoAbrirTemporada={(id) => setTela({ nome: 'temporada', id })}
      />
    )
  }
  if (tela.nome === 'temporada') {
    return (
      <PaginaTemporada
        temporadaId={tela.id}
        aoVoltar={irInicio}
        aoAbrirEncontro={(encontro) => setTela({ nome: 'torneio', id: encontro.id })}
      />
    )
  }

  if (tela.nome === 'andamento') {
    return (
      <PaginaEmAndamento
        aoVoltar={irInicio}
        aoAbrirMesa={(id) => abrirMesa({ nome: 'mesa', id })}
        aoNovoSorteio={() => setTela({ nome: 'mesasSorteadas' })}
      />
    )
  }

  const cards: {
    chave: string
    icone: string
    titulo: string
    texto: string
    aoTocar: () => void
  }[] = [
    {
      chave: 'nova',
      icone: 'fa-plus',
      titulo: t('match.home.newGame'),
      texto: t('match.home.newGameHelp'),
      aoTocar: () => setTela({ nome: 'setup' }),
    },
    {
      chave: 'torneio',
      icone: 'fa-trophy',
      titulo: t('tournament.title'),
      texto: ativo ? subtituloTorneio(ativo) : t('tournament.create'),
      aoTocar: () => setTela({ nome: 'torneio', id: ativo?.id ?? criarTorneio() }),
    },
    {
      chave: 'clube',
      icone: 'fa-table-cells-large',
      titulo: t('match.home.clubTitle'),
      texto: t('match.home.clubHelp'),
      aoTocar: () => setTela({ nome: 'listaClube' }),
    },
    {
      chave: 'registrarFinalizada',
      icone: 'fa-clipboard-check',
      titulo: t('match.manual.title'),
      texto: t('match.manual.help'),
      aoTocar: () => setTela({ nome: 'registrarFinalizada' }),
    },
    {
      chave: 'andamento',
      icone: 'fa-hourglass-half',
      titulo: t('match.home.inProgress'),
      texto: t('match.home.openCount', { count: abertas.length }),
      aoTocar: () =>
        abertas.length === 1 ? abrirMesa({ nome: 'mesa', id: abertas[0].id }) : setTela({ nome: 'andamento' }),
    },
    {
      chave: 'historico',
      icone: 'fa-clock-rotate-left',
      titulo: t('match.home.history'),
      texto: t('match.home.historyHelp'),
      aoTocar: () => setTela({ nome: 'historico' }),
    },
    {
      chave: 'jogadores',
      icone: 'fa-users',
      titulo: t('players.title'),
      texto: t('match.home.playersHelp'),
      aoTocar: () => setTela({ nome: 'jogadores' }),
    },
    {
      chave: 'ranking',
      icone: 'fa-ranking-star',
      titulo: t('match.home.ranking'),
      texto: t('match.home.rankingHelp'),
      aoTocar: () => setTela({ nome: 'ranking' }),
    },
  ]

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={t('menu.matches')} />
      <div className="ptd-cards">
        {cards.map((card) => (
          <button
            key={card.chave}
            type="button"
            className="ptd-card-inicio"
            onClick={card.aoTocar}
          >
            <i className={`fas ${card.icone}`} aria-hidden="true" />
            <strong>{card.titulo}</strong>
            <span>{card.texto}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
