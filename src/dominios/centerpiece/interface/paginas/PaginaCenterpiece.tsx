import { useRef, useState, type RefObject } from 'react'
import { entrarTelaCheia } from '@/compartilhado/adaptadores/telaCheia'
import { useGestoHorizontal } from '@/compartilhado/interface/hooks/useGestoHorizontal'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import PaginaJogadores from '@/dominios/jogadores/interface/paginas/PaginaJogadores'
import { CADEIRAS, KANJI_VENTO } from '../../logica/partida'
import { usoDoJogadorNasPartidas } from '../../logica/ranking'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { usePartidas } from '../hooks/usePartidas'
import CenterpieceSimples from './CenterpieceSimples'
import PaginaHistorico from './PaginaHistorico'
import PaginaRanking from './PaginaRanking'
import PlacarPartida from './PlacarPartida'
import RegistrarFinalizada from './RegistrarFinalizada'
import SetupPartida from './SetupPartida'
import '../mesa.css'
import '../partida.css'

type TelaModulo =
  | { nome: 'inicio' }
  | { nome: 'setup' }
  | { nome: 'registrarFinalizada' }
  | { nome: 'simples' }
  | { nome: 'andamento' }
  | { nome: 'jogadores' }
  | { nome: 'historico' }
  | { nome: 'ranking' }
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
  const { t } = useI18n()
  const { partidas, abertas, descartar, guardarNome } = usePartidas()
  const { jogadores } = useJogadores()
  const [tela, setTela] = useState<TelaModulo>({ nome: modo === 'simples' ? 'simples' : 'inicio' })
  const [paraDescartar, setParaDescartar] = useState<string | null>(null)
  const irInicio = () => setTela({ nome: 'inicio' })
  const { telaCheiaMesa } = usePreferencias()

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

  const nomesDa = (id: string) => {
    const partida = partidas.find((item) => item.id === id)
    if (!partida) return ''
    return CADEIRAS.map((cadeira) => {
      const jogador = jogadores.find((item) => item.id === partida.assentos[cadeira].jogadorId)
      return jogador ? nomeExibido(jogador) : '—'
    }).join(' · ')
  }

  if (tela.nome === 'setup') {
    return <SetupPartida aoVoltar={irInicio} aoIniciar={(id) => abrirMesa({ nome: 'mesa', id })} />
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
  if (tela.nome === 'historico') return <PaginaHistorico aoVoltar={irInicio} />
  if (tela.nome === 'ranking') return <PaginaRanking aoVoltar={irInicio} />

  if (tela.nome === 'andamento') {
    return (
      <section className="ptd-inicio">
        <TituloTela titulo={t('match.home.inProgress')} aoVoltar={irInicio} />
        {abertas.length === 0 ? (
          <p className="ptd-vazio">{t('match.home.noneOpen')}</p>
        ) : (
          <ul className="ptd-lista-mesas">
            {abertas.map((partida, indice) => (
              <li key={partida.id}>
                <button
                  type="button"
                  className="ptd-mesa-aberta"
                  onClick={() => abrirMesa({ nome: 'mesa', id: partida.id })}
                >
                  <strong>
                    {t('match.table.number', { number: indice + 1 })} ·{' '}
                    {KANJI_VENTO[partida.placar.rodadaVento]}
                    {partida.placar.rodadaNumero}
                  </strong>
                  <span className="ptd-apoio">{nomesDa(partida.id)}</span>
                </button>
                <button
                  type="button"
                  className="ptd-btn-icone"
                  aria-label={t('match.home.discardNamed', { number: indice + 1 })}
                  onClick={() => setParaDescartar(partida.id)}
                >
                  <i className="fas fa-trash" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
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
