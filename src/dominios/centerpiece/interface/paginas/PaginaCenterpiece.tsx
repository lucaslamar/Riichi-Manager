import { useRef, useState, type RefObject } from 'react'
import { entrarTelaCheia } from '@/compartilhado/adaptadores/telaCheia'
import { useGestoHorizontal } from '@/compartilhado/interface/hooks/useGestoHorizontal'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import PaginaJogadores from '@/dominios/jogadores/interface/paginas/PaginaJogadores'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import PaginaTemporada from '@/dominios/torneio/interface/paginas/PaginaTemporada'
import PaginaTorneio from '@/dominios/torneio/interface/paginas/PaginaTorneio'
import { criarRascunho, nomeNoTorneio } from '@/dominios/torneio/logica/torneio'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { mesasRegistradas, type MesaDoSorteio } from '../../logica/encontroClube'
import { usoDoJogadorNasPartidas } from '../../logica/ranking'
import { useClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import CenterpieceSimples from './CenterpieceSimples'
import PaginaEmAndamento from './PaginaEmAndamento'
import PaginaHistorico from './PaginaHistorico'
import PaginaListaClube from './PaginaListaClube'
import PaginaMesasSorteadas from './PaginaMesasSorteadas'
import PaginaJogador from './PaginaJogador'
import PaginaRanking from './PaginaRanking'
import PlacarPartida from './PlacarPartida'
import RegistrarFinalizada from './RegistrarFinalizada'
import SetupPartida from './SetupPartida'
import '../mesa.css'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
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
  | { nome: 'jogador'; id: string }
  | { nome: 'torneio'; id: string }
  | { nome: 'temporada'; id: string }
  /** `voltar`: de onde a mesa foi aberta (as Mesas sorteadas do torneio). */
  | { nome: 'mesa'; id: string; voltar?: TelaModulo }
  | {
      nome: 'registrarTorneio'
      torneioId: string
      rodada: number
      mesa: number
      /** Corrigir ou substituir: a partida que sai quando o novo resultado entra. */
      substituirId?: string
    }

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
  /** Atalhos de cálculo do simples: Calculadora de Mão, Han e Fu ou a Mão já na notação. */
  aoAbrirCalculo: (calculo: 'mao' | 'hanFu' | 'mpsz') => void
  /**
   * 'simples': o botão Centerpiece da barra, que abre direto a mesa simples.
   * 'partidas': Mesa partida, o menu das partidas com pontos.
   * 'ranking': o menu dos resultados (ranking, histórico, registrar e jogadores).
   */
  modo: 'simples' | 'partidas' | 'ranking'
  /** Vizinhos na barra inferior, para o deslize no menu do módulo. */
  aoTelaAnterior?: () => void
  aoProximaTela?: () => void
}

/** Tela inicial do módulo (cards) e a navegação entre as telas dele. */
function TelasCenterpiece({
  aoAbrirSorteador,
  aoAbrirCalculo,
  modo,
  aoTelaAnterior,
  aoProximaTela,
  raiz,
}: PropsCenterpiece & { raiz: RefObject<HTMLElement | null> }) {
  const { t, idioma } = useI18n()
  const { partidas, abertas, guardarNome, descartar } = usePartidas()
  const { sorteio, marcarRegistrada } = useClube()
  // A aba Ranking abre direto na lista: ela é a raiz desse modo.
  const telaRaiz: TelaModulo = { nome: modo === 'simples' ? 'simples' : modo === 'ranking' ? 'ranking' : 'inicio' }
  const [tela, setTela] = useState<TelaModulo>(telaRaiz)
  const irInicio = () => setTela(telaRaiz)
  const { telaCheiaMesa } = usePreferencias()
  const { torneios, salvar: salvarTorneio } = useTorneios()
  const { jogadores } = useJogadores()
  /** Rascunho ainda sem sorteio: o card Torneio continua nele em vez de criar outro. */
  const rascunho = [...torneios]
    .filter((torneio) => torneio.status === 'rascunho' && !torneio.transferidoEm)
    .sort((um, outro) => outro.atualizadoEm.localeCompare(um.atualizadoEm))[0]
  const torneiosEmJogo = torneios.filter((torneio) => torneio.status === 'em_andamento' && !torneio.transferidoEm)
  const clubePendente = sorteio && mesasRegistradas(sorteio, partidas) < sorteio.mesas.length ? 1 : 0
  /** O que o Em andamento lista: mesas abertas, o encontro pendente e os torneios em jogo. */
  const totalEmAndamento = abertas.length + clubePendente + torneiosEmJogo.length
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
  const naRaiz = tela.nome === telaRaiz.nome
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
      <RegistrarFinalizada aoVoltar={irInicio} aoRegistrar={() => setTela({ nome: 'ranking' })} />
    )
  }
  if (tela.nome === 'simples') {
    return <CenterpieceSimples aoAbrirSorteador={aoAbrirSorteador} aoAbrirCalculo={aoAbrirCalculo} />
  }
  if (tela.nome === 'mesa') {
    const partida = partidas.find((item) => item.id === tela.id)
    if (partida) {
      return (
        <PlacarPartida
          key={partida.id}
          partida={partida}
          aoSair={() => (tela.voltar ? setTela(tela.voltar) : irInicio())}
          aoFinalizar={() => (tela.voltar ? setTela(tela.voltar) : irInicio())}
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
  if (tela.nome === 'jogador') {
    return (
      <PaginaJogador
        key={tela.id}
        jogadorId={tela.id}
        aoVoltar={() => setTela({ nome: 'ranking' })}
        aoTrocarJogador={(id) => setTela({ nome: 'jogador', id })}
      />
    )
  }
  if (tela.nome === 'ranking') {
    return (
      <PaginaRanking
        aoVoltar={modo === 'ranking' ? undefined : irInicio}
        aoAbrirJogadores={() => setTela({ nome: 'jogadores' })}
        aoAbrirJogador={(id) => setTela({ nome: 'jogador', id })}
      />
    )
  }
  if (tela.nome === 'torneio') {
    return (
      <PaginaTorneio
        key={tela.id}
        torneioId={tela.id}
        aoVoltar={irInicio}
        aoAbrirTemporada={(id) => setTela({ nome: 'temporada', id })}
        aoAbrirTorneio={(id) => setTela({ nome: 'torneio', id })}
        aoLancarResultado={(rodada, mesa, substituir) =>
          setTela({
            nome: 'registrarTorneio',
            torneioId: tela.id,
            rodada: rodada.numero,
            mesa: mesa.numero,
            substituirId: substituir?.id,
          })
        }
      />
    )
  }
  if (tela.nome === 'registrarTorneio') {
    const torneio = torneios.find((item) => item.id === tela.torneioId)
    const mesa = torneio?.rodadas.find((item) => item.numero === tela.rodada)?.mesas.find((item) => item.numero === tela.mesa)
    const substituir = partidas.find((item) => item.id === tela.substituirId)
    const voltar = () => setTela({ nome: 'torneio', id: tela.torneioId })
    if (torneio && mesa) {
      return (
        <RegistrarFinalizada
          key={`${tela.torneioId}-${tela.rodada}-${tela.mesa}`}
          torneio={{
            titulo: t('tournament.tables.badge', { round: tela.rodada, table: tela.mesa }),
            config: torneio.config,
            jogadorIds: mesa.assentos,
            nomes: mesa.assentos.map((id) => nomeNoTorneio(torneio, jogadores, id)),
            vinculo: { torneioId: torneio.id, rodada: tela.rodada - 1, mesa: tela.mesa - 1, guardada: true },
            pontosIniciais: substituir
              ? [0, 1, 2, 3].map(
                  (cadeira) =>
                    substituir.resultado?.find((linha) => linha.cadeira === cadeira)?.pontosBrutos ??
                    substituir.placar.pontos[cadeira as 0 | 1 | 2 | 3],
                )
              : undefined,
          }}
          aoVoltar={voltar}
          aoRegistrar={() => {
            // O novo resultado substitui o anterior (ou a partida aberta no Centerpiece).
            if (substituir) descartar(substituir.id)
            voltar()
          }}
        />
      )
    }
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
        aoAbrirSorteio={() => setTela({ nome: 'mesasSorteadas' })}
        aoAbrirTorneio={(id) => setTela({ nome: 'torneio', id })}
      />
    )
  }

  type Card = {
    chave: string
    icone: string
    titulo: string
    texto: string
    aoTocar: () => void
  }
  const cardHistorico: Card = {
    chave: 'historico',
    icone: 'fa-clock-rotate-left',
    titulo: t('match.home.history'),
    texto: t('match.home.historyHelp'),
    aoTocar: () => setTela({ nome: 'historico' }),
  }
  const cardsPartida: Card[] = [
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
      texto: t('tournament.create'),
      // Sempre começa um torneio novo; um rascunho ainda sem sorteio é reaproveitado.
      aoTocar: () => setTela({ nome: 'torneio', id: rascunho?.id ?? criarTorneio() }),
    },
    {
      chave: 'clube',
      icone: 'fa-table-cells-large',
      titulo: t('match.home.clubTitle'),
      texto: t('match.home.clubHelp'),
      aoTocar: () => setTela({ nome: 'listaClube' }),
    },
    {
      chave: 'andamento',
      icone: 'fa-hourglass-half',
      titulo: t('match.home.inProgress'),
      texto: t('match.home.inProgressCount', { count: totalEmAndamento }),
      // Só uma partida aberta e nada mais: vai direto para ela.
      aoTocar: () =>
        abertas.length === 1 && totalEmAndamento === 1
          ? abrirMesa({ nome: 'mesa', id: abertas[0].id })
          : setTela({ nome: 'andamento' }),
    },
    // Histórico e Registrar ficam aqui, abaixo das opções de iniciar partida.
    cardHistorico,
    {
      chave: 'registrarFinalizada',
      icone: 'fa-clipboard-check',
      titulo: t('match.manual.title'),
      texto: t('match.manual.help'),
      aoTocar: () => setTela({ nome: 'registrarFinalizada' }),
    },
  ]
  const cards = cardsPartida

  return (
    <section className="ptd-inicio">
      <TituloTela
        titulo={t('menu.matchesShort')}
        acoes={<BotaoConfiguracoes />}
      />
      <div className="ptd-cards">
        {cards.map((card) => (
          <button key={card.chave} type="button" className="ptd-card-inicio" onClick={card.aoTocar}>
            <i className={`fas ${card.icone}`} aria-hidden="true" />
            <strong>{card.titulo}</strong>
            <span>{card.texto}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
