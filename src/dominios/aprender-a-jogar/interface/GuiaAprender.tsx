import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as EventoPonteiro,
  type TouchEvent as EventoToque,
} from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import { useDeslizePaginas } from '@/compartilhado/interface/hooks/useDeslizePaginas'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import { conteudoPtBR } from '../conteudo/pt-BR'
import type { FerramentaGuia } from '../conteudo/tipos'
import { fimDoModulo, montarLivro, moduloDaPagina, type PaginaLivro } from '../logica/livro'
import { ehDan, nomeRank, rankDaParte, rankPorConcluidos, type RankGuia } from '../logica/rank'
import { lerProgressoGuia, salvarProgressoGuia } from '../persistencia/progressoGuia'
import BlocosGuia from './componentes/BlocosGuia'
import IndiceGuia from './componentes/IndiceGuia'
// Mesma animação de página da Modal em páginas (modal-pagina--avancar/voltar).
import '@/compartilhado/interface/componentes/modal/modal.css'
import './guia-aprender.css'

// Hoje só há o conteúdo em pt-BR; os outros idiomas usam ele até ganharem o seu.
const CONTEUDO = conteudoPtBR
const LIVRO = montarLivro(CONTEUDO)
/** Quanto tempo o aviso de estrela ou de "Subiu de rank!" fica na tela. */
const TEMPO_RANK = 3500

/** A barra de cima some sozinha depois deste tempo sem uso. */
const TEMPO_BARRA = 4000
/** Terço da largura de cada lado em que um toque vira a página, como nos leitores de e-book. */
const FAIXA_TOQUE = 1 / 3
/** Até quantos px o dedo pode andar e ainda contar como toque (mais que isso é deslize). */
const MOVIMENTO_TOQUE = 10

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

/** Elementos em que o toque é deles (não passa página nem mostra a barra). */
const SELETOR_INTERATIVOS = 'a, button, input, select, textarea, summary, label, [role="button"]'

type Vista = { tipo: 'livro' } | { tipo: 'glossario' }

const VISTA_LIVRO: Vista = { tipo: 'livro' }

/** O React 18 não conhece `inert`: liga direto no elemento (tira do foco e dos toques o que está coberto). */
function useInerte<T extends HTMLElement>(ativo: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (ref.current) ref.current.inert = ativo
  })
  return ref
}

/**
 * Guia Aprender a jogar: um livro em tela cheia, lido passando as páginas
 * para o lado (o mesmo gesto e a mesma animação das modais em páginas).
 *
 * Na leitura a tela mostra só a página. Um toque no meio mostra a barra de
 * cima (fechar, módulo, índice e progresso), que some sozinha; toques nas
 * bordas, setas do teclado e botões só para leitor de tela também viram a
 * página. O livro tem três partes, e Aprofundando é a última: só o
 * Glossário fica fora, como página de consulta com voltar. Sorteador e Han e
 * Fu abrem por cima e, ao fechar, o guia continua na mesma página.
 */
export default function GuiaAprender({
  aoFechar,
  aoAbrirCalculadora,
}: {
  aoFechar: () => void
  /** Fecha o guia e vai para a Calculadora de Mão (ela não abre por cima). */
  aoAbrirCalculadora: () => void
}) {
  const { t } = useI18n()
  const [progressoInicial] = useState(lerProgressoGuia)
  // Sempre abre na capa (a tela Aprender a jogar).
  const [indice, setIndice] = useState(0)
  const [vista, setVista] = useState<Vista>(VISTA_LIVRO)
  const [concluidos, setConcluidos] = useState(progressoInicial.concluidos)
  const [barraVisivel, setBarraVisivel] = useState(true)
  const [indiceAberto, setIndiceAberto] = useState(false)
  const [ferramenta, setFerramenta] = useState<FerramentaGuia | null>(null)
  const raizRef = useRef<HTMLDivElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)
  const consultaRef = useRef<HTMLDivElement>(null)
  const livroRef = useInerte<HTMLDivElement>(!!ferramenta || indiceAberto)
  const consultaInerteRef = useInerte<HTMLDivElement>(!!ferramenta)

  // Rank por parte (Novato, Adepto, Especialista, 1º dan), com uma estrela por
  // módulo concluído. Ao concluir um módulo, aparece o aviso de estrela ou,
  // se a parte acabou, o de "Subiu de rank!".
  const rank = rankPorConcluidos(concluidos, CONTEUDO.tutorialParts)
  const [aviso, setAviso] = useState<{ rank: RankGuia; subiu: boolean } | null>(null)
  const { degrau, nivel } = rank
  const anterior = useRef({ degrau, nivel })
  useEffect(() => {
    if (degrau > anterior.current.degrau) {
      setAviso({
        rank: rankPorConcluidos(concluidos, CONTEUDO.tutorialParts),
        subiu: nivel > anterior.current.nivel,
      })
    }
    anterior.current = { degrau, nivel }
  }, [degrau, nivel, concluidos])
  useEffect(() => {
    if (!aviso) return
    const tempo = window.setTimeout(() => setAviso(null), TEMPO_RANK)
    return () => window.clearTimeout(tempo)
  }, [aviso])

  /** Selo com o rank atual (capa do guia e capas de módulo). */
  const seloRank = () => (
    <p className={`guia-rank${ehDan(rank) ? ' guia-rank--dan' : ''}`}>
      <i className={`fas ${ehDan(rank) ? 'fa-crown' : 'fa-medal'}`} aria-hidden="true" />
      {t('learn.yourRank', { rank: nomeRank(rank) })}
    </p>
  )

  const pagina = LIVRO[indice]
  const modulo = moduloDaPagina(pagina)
  const { mudarPagina, sentido, propsToque } = useDeslizePaginas({
    atual: vista.tipo === 'livro' && !ferramenta ? indice : undefined,
    total: LIVRO.length,
    aoMudar: setIndice,
  })

  // Página nova começa do topo; o lugar e o módulo concluído (ao chegar no
  // quiz ou, sem quiz, na última página) ficam salvos.
  useEffect(() => {
    palcoRef.current?.scrollTo({ top: 0 })
    if ((pagina.tipo === 'quiz' || pagina.tipo === 'pagina') && fimDoModulo(pagina)) {
      setConcluidos((atuais) =>
        atuais.includes(pagina.modulo.id) ? atuais : [...atuais, pagina.modulo.id],
      )
    }
  }, [pagina])

  // Na capa o lugar salvo não muda: o "Continuar" segue valendo, também
  // quando o X traz a pessoa de volta para ela.
  const [paginaSalvaId, setPaginaSalvaId] = useState(progressoInicial.pagina)
  useEffect(() => {
    if (pagina.tipo !== 'capaGuia') setPaginaSalvaId(pagina.id)
  }, [pagina])
  useEffect(() => {
    salvarProgressoGuia({ pagina: paginaSalvaId, concluidos })
  }, [paginaSalvaId, concluidos])

  useEffect(() => {
    consultaRef.current?.scrollTo({ top: 0 })
  }, [vista])

  // A barra some sozinha, menos com o índice aberto e na capa do guia: lá ela
  // fica à vista, para a pessoa saber onde estão o fechar e o índice.
  const naCapa = vista.tipo === 'livro' && pagina.tipo === 'capaGuia'
  useEffect(() => {
    if (naCapa) {
      setBarraVisivel(true)
      return
    }
    if (!barraVisivel || indiceAberto) return
    const tempo = window.setTimeout(() => setBarraVisivel(false), TEMPO_BARRA)
    return () => window.clearTimeout(tempo)
  }, [barraVisivel, indiceAberto, indice, naCapa])

  /**
   * O X sempre volta para a capa (a tela Aprender a jogar), de qualquer página
   * do livro ou da consulta. Só na própria capa ele fecha o guia e volta para o app.
   */
  const fechar = () => {
    if (naCapa) aoFechar()
    else irPara(0)
  }

  // Refs: o listener de teclado fica fixo e sempre vê o estado atual.
  const estado = useRef({ ferramenta, indiceAberto, vista, mudarPagina, fechar })
  estado.current = { ferramenta, indiceAberto, vista, mudarPagina, fechar }

  useEffect(() => {
    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    raizRef.current?.focus()
    const camada = empilharCamada()

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      // Uma modal aberta por cima do guia (ex.: um termo) cuida das teclas dela.
      if (!camada.noTopo()) return
      const atual = estado.current
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        if (atual.ferramenta) setFerramenta(null)
        else if (atual.indiceAberto) setIndiceAberto(false)
        else if (atual.vista.tipo !== 'livro') setVista(VISTA_LIVRO)
        else atual.fechar()
        return
      }

      const livroAtivo = atual.vista.tipo === 'livro' && !atual.ferramenta && !atual.indiceAberto
      const campo = (evento.target as Element | null)?.closest?.('input, select, textarea')
      if (livroAtivo && !campo && (evento.key === 'ArrowRight' || evento.key === 'ArrowLeft')) {
        evento.preventDefault()
        atual.mudarPagina(evento.key === 'ArrowRight' ? 1 : -1)
        return
      }

      const raiz = raizRef.current
      if (evento.key !== 'Tab' || !raiz) return
      const focaveis = Array.from(raiz.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS)).filter(
        (elemento) => elemento.getClientRects().length > 0 && !elemento.closest('[inert]'),
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const fora = !focaveis.includes(document.activeElement as HTMLElement)
      if (fora || (evento.shiftKey && document.activeElement === primeiro)) {
        evento.preventDefault()
        ;(evento.shiftKey || !fora ? ultimo : primeiro).focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla)
      camada.remover()
      document.body.style.overflow = overflowAnterior
      focoAnterior?.focus({ preventScroll: true })
    }
  }, [])

  const irPara = (destinoIndice: number) => {
    if (destinoIndice < 0) return
    setVista(VISTA_LIVRO)
    setIndiceAberto(false)
    setIndice(destinoIndice)
  }

  const abrirFerramenta = (qual: FerramentaGuia) => {
    if (qual === 'calculadora') aoAbrirCalculadora()
    else setFerramenta(qual)
  }

  // Toque (dedo ou mouse) no terço da direita avança, no da esquerda volta e
  // no meio mostra/esconde a barra. Pelo pointer, não pelo click: o toque vale
  // igual no celular, no tablet e no mouse, e arrastar (deslize ou seleção de
  // texto) não conta como toque.
  const toque = useRef<{ x: number; y: number } | null>(null)
  // Modais abertas por uma página (termo, cartão de yaku, tutorial de Han e
  // Fu) ficam num portal, mas os eventos delas sobem pela árvore do React até
  // aqui: só conta o que aconteceu dentro do palco, senão o toque na modal
  // viraria a página do livro por baixo dela.
  const doPalco = (evento: { currentTarget: Element; target: EventTarget }) =>
    evento.currentTarget.contains(evento.target as Node)
  const deslizarPalco = {
    onTouchStart: (evento: EventoToque<HTMLDivElement>) => {
      if (doPalco(evento)) propsToque.onTouchStart(evento)
    },
    onTouchEnd: (evento: EventoToque<HTMLDivElement>) => {
      if (doPalco(evento)) propsToque.onTouchEnd(evento)
    },
  }
  const tocarPalco = {
    onPointerDown: (evento: EventoPonteiro<HTMLDivElement>) => {
      toque.current =
        evento.isPrimary && evento.button === 0 && doPalco(evento)
          ? { x: evento.clientX, y: evento.clientY }
          : null
    },
    onPointerCancel: () => {
      toque.current = null
    },
    onPointerUp: (evento: EventoPonteiro<HTMLDivElement>) => {
      const comeco = toque.current
      toque.current = null
      if (!comeco) return
      if (Math.hypot(evento.clientX - comeco.x, evento.clientY - comeco.y) > MOVIMENTO_TOQUE) return
      if ((evento.target as Element).closest(SELETOR_INTERATIVOS)) return
      if (window.getSelection()?.toString()) return
      const largura = evento.currentTarget.clientWidth
      const x = evento.clientX - evento.currentTarget.getBoundingClientRect().left
      if (x < largura * FAIXA_TOQUE) mudarPagina(-1)
      else if (x > largura * (1 - FAIXA_TOQUE)) mudarPagina(1)
      else setBarraVisivel((visivel) => !visivel)
    },
  }

  /** "Quiz", ou "Quiz 2/3" quando o módulo tem mais de uma pergunta (uma por tela). */
  const nomeQuiz = (alvo: Extract<PaginaLivro, { tipo: 'quiz' }>) => {
    const total = alvo.modulo.quiz?.length ?? 0
    return total > 1 ? `${t('learn.quiz')} ${alvo.pergunta + 1}/${total}` : t('learn.quiz')
  }

  const rotuloPagina = (alvo: PaginaLivro) => {
    switch (alvo.tipo) {
      case 'pagina':
        return alvo.pagina.number
      case 'quiz':
        return `${alvo.modulo.number} · ${nomeQuiz(alvo)}`
      case 'capaModulo':
        return t('learn.module', { number: alvo.modulo.number })
      case 'capaParte':
        return t('learn.part', { number: alvo.parte.number })
      default:
        return ''
    }
  }

  const tituloPagina = (alvo: PaginaLivro) => {
    switch (alvo.tipo) {
      case 'capaGuia':
        return t('learn.title')
      case 'capaParte':
        return alvo.parte.title
      case 'marco':
        return alvo.parte.milestone?.title ?? alvo.parte.title
      case 'capaModulo':
        return alvo.modulo.title
      case 'pagina':
        return alvo.pagina.title
      case 'quiz':
        return `${nomeQuiz(alvo)}: ${alvo.modulo.title}`
      case 'conclusao':
        return t('learn.conclusionTitle')
    }
  }

  const paginaSalva = LIVRO.findIndex((item) => item.id === paginaSalvaId)

  const conteudoPagina = () => {
    switch (pagina.tipo) {
      case 'capaGuia':
        return (
          <div className="guia-capa">
            <i className="fas fa-book-open guia-capa__icone" aria-hidden="true" />
            <h1 className="guia-capa__titulo">{t('learn.title')}</h1>
            <p className="guia-capa__frase">
              {t('learn.tagline', { count: CONTEUDO.tutorialParts[0].modules.length })}
            </p>
            {seloRank()}
            {rank.degrau === 0 && <p className="guia-rank__dica">{t('learn.rankHint')}</p>}
            <div className="guia-capa__acoes">
              {paginaSalva > 1 ? (
                <>
                  <button
                    type="button"
                    className="btn-primario"
                    onClick={() => irPara(paginaSalva)}
                  >
                    {t('learn.continueFrom', {
                      page: rotuloPagina(LIVRO[paginaSalva]) || tituloPagina(LIVRO[paginaSalva]),
                    })}
                  </button>
                  <button type="button" className="btn-contorno" onClick={() => irPara(1)}>
                    {t('learn.startOver')}
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primario" onClick={() => irPara(1)}>
                  {t('learn.start')}
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="guia-capa__dica">{t('learn.howToRead')}</p>
          </div>
        )
      case 'marco':
        // Tela própria, fechando a parte anterior: o que a pessoa já consegue fazer.
        return (
          <div className="guia-capitulo guia-parte__marco">
            <i className="fas fa-trophy guia-capa__icone" aria-hidden="true" />
            <h1 className="guia-capitulo__titulo">{pagina.parte.milestone?.title}</h1>
            <BlocosGuia
              blocos={[{ type: 'text', md: pagina.parte.milestone?.md ?? '' }]}
              aoAbrirFerramenta={abrirFerramenta}
            />
          </div>
        )
      case 'capaParte':
        return (
          <div className="guia-capitulo guia-parte">
            <i className="fas fa-medal guia-capa__icone guia-parte__medalha" aria-hidden="true" />
            <span className="guia-parte__rotulo">{t('learn.rankTier')}</span>
            <h1 className="guia-capitulo__titulo">{rankDaParte(pagina.parte.number - 1)}</h1>
            <p className="guia-parte__nome">
              {t('learn.part', { number: pagina.parte.number })} · {pagina.parte.title}
            </p>
            <p className="guia-capitulo__frase">{pagina.parte.cover}</p>
          </div>
        )
      case 'capaModulo':
        return (
          <div className="guia-capitulo">
            <span className="guia-capitulo__numero">{pagina.modulo.number}</span>
            <h1 className="guia-capitulo__titulo">{pagina.modulo.title}</h1>
            <p className="guia-capitulo__frase">{pagina.modulo.cover}</p>
            {seloRank()}
          </div>
        )
      case 'pagina':
        return (
          <>
            <h1 className="guia-titulo">{pagina.pagina.title}</h1>
            <BlocosGuia
              blocos={pagina.pagina.blocks}
              termos={pagina.pagina.termos}
              aoAbrirFerramenta={abrirFerramenta}
            />
          </>
        )
      case 'quiz':
        return (
          <>
            <p className="guia-sobretitulo">{pagina.modulo.title}</p>
            <h1 className="guia-titulo">{nomeQuiz(pagina)}</h1>
            {pagina.modulo.quiz?.[pagina.pergunta] && (
              <BlocosGuia
                blocos={[pagina.modulo.quiz[pagina.pergunta]]}
                aoAbrirFerramenta={abrirFerramenta}
              />
            )}
          </>
        )
      case 'conclusao':
        return (
          <div className="guia-capitulo">
            <i className="fas fa-trophy guia-capa__icone" aria-hidden="true" />
            <h1 className="guia-capitulo__titulo">{t('learn.conclusionTitle')}</h1>
            <p className="guia-capitulo__frase">{t('learn.conclusionText')}</p>
            {/* O Guia de bolso (chapéu de formatura) é para as dúvidas rápidas durante o jogo. */}
            <p className="guia-conclusao__bolso">
              <i className="fas fa-graduation-cap" aria-hidden="true" />
              <span>{t('learn.conclusionPocketGuide')}</span>
            </p>
            {/* Recado secreto: só aparece para quem concluiu tudo (1º dan). */}
            {ehDan(rank) && (
              <p className="guia-conclusao__secreto">
                <i className="fas fa-crown" aria-hidden="true" />
                <span>{t('learn.conclusionSecret')}</span>
              </p>
            )}
            <div className="guia-capa__acoes">
              <button
                type="button"
                className="btn-primario"
                onClick={() => abrirFerramenta('calculadora')}
              >
                {t('learn.openHandCalculator')}
              </button>
            </div>
          </div>
        )
    }
  }

  const conteudoConsulta = () => {
    return (
      <>
        <h1 className="guia-titulo">{t('learn.glossary')}</h1>
        <dl className="guia-glossario">
          {CONTEUDO.glossary.map(({ term, definition }) => (
            <div key={term} className="guia-glossario__item">
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </>
    )
  }

  const voltarConsulta = () => setVista(VISTA_LIVRO)
  const progresso = indice / (LIVRO.length - 1)
  const tituloBarra = modulo ? `${modulo.number}. ${modulo.title}` : tituloPagina(pagina)

  return createPortal(
    <div
      ref={raizRef}
      className={`guia-aprender${barraVisivel ? ' guia-aprender--barra' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('learn.title')}
      tabIndex={-1}
    >
      {vista.tipo === 'livro' ? (
        <div ref={livroRef} className="guia-livro">
          {/* Só para leitor de tela e teclado: sem botões fixos na tela. */}
          <div className="sr-only" aria-live="polite">
            {t('learn.pageAnnounce', {
              page: rotuloPagina(pagina) || tituloPagina(pagina),
              title: tituloPagina(pagina),
            })}
          </div>

          <header
            className="guia-barra"
            // Escondida, a barra continua no teclado e no leitor de tela: o foco nela a mostra.
            onFocus={() => setBarraVisivel(true)}
          >
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.close')}
              title={t('learn.close')}
              onClick={fechar}
            >
              <i className="fas fa-xmark" aria-hidden="true" />
            </button>
            <span className="guia-barra__titulo">{tituloBarra}</span>
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.index')}
              title={t('learn.index')}
              aria-haspopup="dialog"
              onClick={() => setIndiceAberto(true)}
            >
              <i className="fas fa-list-ul" aria-hidden="true" />
            </button>
            <div
              className="guia-progresso"
              role="progressbar"
              aria-label={t('learn.progress')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progresso * 100)}
            >
              <span style={{ transform: `scaleX(${progresso})` }} />
            </div>
          </header>

          <div ref={palcoRef} className="guia-palco" {...tocarPalco} {...deslizarPalco}>
            <article
              key={indice}
              className={`guia-pagina guia-pagina--${pagina.tipo} modal-pagina modal-pagina--${sentido}`}
              aria-label={tituloPagina(pagina)}
            >
              <div className="guia-coluna">{conteudoPagina()}</div>
              <footer className="guia-rodape" aria-hidden="true">
                {rotuloPagina(pagina)}
              </footer>
            </article>
          </div>

          <button
            type="button"
            className="sr-only guia-sr-anterior"
            disabled={indice === 0}
            onClick={() => mudarPagina(-1)}
          >
            {t('learn.previousPage')}
          </button>
          <button
            type="button"
            className="sr-only guia-sr-proxima"
            disabled={indice === LIVRO.length - 1}
            onClick={() => mudarPagina(1)}
          >
            {t('learn.nextPage')}
          </button>
        </div>
      ) : (
        <div ref={consultaInerteRef} className="guia-consulta">
          <header className="guia-consulta__barra">
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.back')}
              title={t('learn.back')}
              onClick={voltarConsulta}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <span className="guia-barra__titulo">{t('learn.glossary')}</span>
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.close')}
              title={t('learn.close')}
              onClick={fechar}
            >
              <i className="fas fa-xmark" aria-hidden="true" />
            </button>
          </header>
          <div ref={consultaRef} className="guia-palco guia-palco--consulta">
            <article className="guia-pagina">
              <div className="guia-coluna">{conteudoConsulta()}</div>
            </article>
          </div>
        </div>
      )}

      {indiceAberto && (
        <IndiceGuia
          conteudo={CONTEUDO}
          livro={LIVRO}
          indiceAtual={indice}
          concluidos={concluidos}
          rotuloRank={t('learn.yourRank', { rank: nomeRank(rank) })}
          aoIrPara={irPara}
          aoAbrirGlossario={() => {
            setIndiceAberto(false)
            setVista({ tipo: 'glossario' })
          }}
          aoFechar={() => setIndiceAberto(false)}
        />
      )}

      {ferramenta && (
        <section
          className="guia-ferramenta"
          aria-label={ferramenta === 'sorteador' ? t('windDraw.title') : t('menu.quickCalculator')}
        >
          <header className="guia-consulta__barra">
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.closeTool')}
              title={t('learn.closeTool')}
              onClick={() => setFerramenta(null)}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <span className="guia-barra__titulo">
              {ferramenta === 'sorteador' ? t('windDraw.title') : t('menu.quickCalculator')}
            </span>
            <span className="guia-barra__espaco" aria-hidden="true" />
          </header>
          <div className="guia-ferramenta__corpo">
            {ferramenta === 'sorteador' ? <PaginaSorteadorVentos /> : <PaginaCalculadoraHanFu />}
          </div>
        </section>
      )}

      {/* Aviso de subida de rank, por cima de tudo, como nos jogos online. */}
      <div className="guia-rank-aviso__regiao" role="status" aria-live="polite">
        {aviso && (
          <div
            className={`guia-rank-aviso${ehDan(aviso.rank) ? ' guia-rank-aviso--dan' : ''}${
              aviso.subiu ? '' : ' guia-rank-aviso--estrela'
            }`}
          >
            <i
              className={`fas ${
                ehDan(aviso.rank) ? 'fa-crown' : aviso.subiu ? 'fa-medal' : 'fa-star'
              } guia-rank-aviso__icone`}
              aria-hidden="true"
            />
            <span>
              <span className="guia-rank-aviso__titulo">
                {aviso.subiu ? t('learn.rankUp') : t('learn.starUp')}
              </span>
              <strong className="guia-rank-aviso__rank">{nomeRank(aviso.rank)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
