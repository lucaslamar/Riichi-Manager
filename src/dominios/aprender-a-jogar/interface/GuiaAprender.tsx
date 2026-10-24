import { useEffect, useMemo, useRef, useState, type PointerEvent as EventoPonteiro } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import { useDeslizePaginas } from '@/compartilhado/interface/hooks/useDeslizePaginas'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import { conteudoPtBR } from '../conteudo/pt-BR'
import type { FerramentaGuia, ReferenceTopic } from '../conteudo/tipos'
import { montarLivro, moduloDaPagina, resolverDestino, type PaginaLivro } from '../logica/livro'
import { lerProgressoGuia, salvarProgressoGuia } from '../persistencia/progressoGuia'
import BlocosGuia from './componentes/BlocosGuia'
import IndiceGuia from './componentes/IndiceGuia'
// Mesma animação de página da Modal em páginas (modal-pagina--avancar/voltar).
import '@/compartilhado/interface/componentes/modal/modal.css'
import './guia-aprender.css'

// Hoje só há o conteúdo em pt-BR; os outros idiomas usam ele até ganharem o seu.
const CONTEUDO = conteudoPtBR
const LIVRO = montarLivro(CONTEUDO)

/** Logo do CMC nos Créditos, só se o arquivo existir no projeto. */
const LOGO_CMC = Object.values(
  import.meta.glob<string>('/src/assets/credits/cmc-logo.png', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)[0]

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

type Vista =
  | { tipo: 'livro' }
  | { tipo: 'regras' }
  | { tipo: 'regra'; topico: ReferenceTopic }
  | { tipo: 'glossario' }

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
 * página. Regras à parte e Glossário ficam fora do livro, como páginas de
 * consulta com voltar. Sorteador e Han e Fu abrem por cima e, ao fechar, o
 * guia continua na mesma página.
 */
export default function GuiaAprender({
  destino,
  aoFechar,
  aoAbrirCalculadora,
}: {
  /** Id de página ou de tópico de Regras à parte (ver DESTINO_GUIA); sem ele, abre na capa. */
  destino?: string
  aoFechar: () => void
  /** Fecha o guia e vai para a Calculadora de Mão (ela não abre por cima). */
  aoAbrirCalculadora: () => void
}) {
  const { t } = useI18n()
  const [progressoInicial] = useState(lerProgressoGuia)
  const inicio = useMemo(
    () => (destino ? resolverDestino(LIVRO, CONTEUDO, destino) : null),
    [destino],
  )
  const [indice, setIndice] = useState(() => (inicio && 'livro' in inicio ? inicio.livro : 0))
  const [vista, setVista] = useState<Vista>(() =>
    inicio && 'regra' in inicio ? { tipo: 'regra', topico: inicio.regra } : VISTA_LIVRO,
  )
  const [concluidos, setConcluidos] = useState(progressoInicial.concluidos)
  const [barraVisivel, setBarraVisivel] = useState(true)
  const [indiceAberto, setIndiceAberto] = useState(false)
  const [ferramenta, setFerramenta] = useState<FerramentaGuia | null>(null)
  const raizRef = useRef<HTMLDivElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)
  const consultaRef = useRef<HTMLDivElement>(null)
  const livroRef = useInerte<HTMLDivElement>(!!ferramenta || indiceAberto)
  const consultaInerteRef = useInerte<HTMLDivElement>(!!ferramenta)

  const pagina = LIVRO[indice]
  const modulo = moduloDaPagina(pagina)
  const { mudarPagina, sentido, propsToque } = useDeslizePaginas({
    atual: vista.tipo === 'livro' && !ferramenta ? indice : undefined,
    total: LIVRO.length,
    aoMudar: setIndice,
  })

  // Página nova começa do topo; o lugar e o módulo concluído (ao chegar no quiz) ficam salvos.
  useEffect(() => {
    palcoRef.current?.scrollTo({ top: 0 })
    if (pagina.tipo === 'quiz') {
      setConcluidos((atuais) =>
        atuais.includes(pagina.modulo.id) ? atuais : [...atuais, pagina.modulo.id],
      )
    }
  }, [pagina])

  // Na capa (onde o guia sempre abre) o lugar salvo não muda: o "Continuar" segue valendo.
  useEffect(() => {
    salvarProgressoGuia({
      pagina: pagina.tipo === 'capaGuia' ? progressoInicial.pagina : pagina.id,
      concluidos,
    })
  }, [pagina, concluidos, progressoInicial])

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

  // Refs: o listener de teclado fica fixo e sempre vê o estado atual.
  const estado = useRef({ ferramenta, indiceAberto, vista, mudarPagina, aoFechar })
  estado.current = { ferramenta, indiceAberto, vista, mudarPagina, aoFechar }

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
        else if (atual.vista.tipo === 'regra') setVista({ tipo: 'regras' })
        else if (atual.vista.tipo !== 'livro') setVista(VISTA_LIVRO)
        else atual.aoFechar()
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
  const tocarPalco = {
    onPointerDown: (evento: EventoPonteiro<HTMLDivElement>) => {
      toque.current =
        evento.isPrimary && evento.button === 0 ? { x: evento.clientX, y: evento.clientY } : null
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

  const rotuloPagina = (alvo: PaginaLivro) => {
    switch (alvo.tipo) {
      case 'pagina':
        return alvo.pagina.number
      case 'quiz':
        return `${alvo.modulo.number} · ${t('learn.quiz')}`
      case 'capaModulo':
        return t('learn.module', { number: alvo.modulo.number })
      default:
        return ''
    }
  }

  const tituloPagina = (alvo: PaginaLivro) => {
    switch (alvo.tipo) {
      case 'capaGuia':
        return t('learn.title')
      case 'capaModulo':
        return alvo.modulo.title
      case 'pagina':
        return alvo.pagina.title
      case 'quiz':
        return `${t('learn.quiz')}: ${alvo.modulo.title}`
      case 'conclusao':
        return t('learn.conclusionTitle')
      case 'creditos':
        return t('learn.credits')
    }
  }

  const paginaSalva = LIVRO.findIndex((item) => item.id === progressoInicial.pagina)

  const conteudoPagina = () => {
    switch (pagina.tipo) {
      case 'capaGuia':
        return (
          <div className="guia-capa">
            <i className="fas fa-book-open guia-capa__icone" aria-hidden="true" />
            <h1 className="guia-capa__titulo">{t('learn.title')}</h1>
            <p className="guia-capa__frase">{t('learn.tagline')}</p>
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
            <p className="guia-capa__colaboracao">{t('learn.collaboration')}</p>
          </div>
        )
      case 'capaModulo':
        return (
          <div className="guia-capitulo">
            <span className="guia-capitulo__numero">{pagina.modulo.number}</span>
            <h1 className="guia-capitulo__titulo">{pagina.modulo.title}</h1>
            <p className="guia-capitulo__frase">{pagina.modulo.cover}</p>
          </div>
        )
      case 'pagina':
        return (
          <>
            <h1 className="guia-titulo">{pagina.pagina.title}</h1>
            <BlocosGuia
              blocos={pagina.pagina.blocks}
              termos={pagina.pagina.termos}
              // Só na página em que o guia abriu pelo "Ver em Aprender a jogar".
              cartaoAberto={
                inicio && 'livro' in inicio && inicio.livro === indice ? inicio.cartao : undefined
              }
              aoAbrirFerramenta={abrirFerramenta}
            />
          </>
        )
      case 'quiz':
        return (
          <>
            <p className="guia-sobretitulo">{pagina.modulo.title}</p>
            <h1 className="guia-titulo">{t('learn.quiz')}</h1>
            {pagina.modulo.quiz && (
              <BlocosGuia blocos={[pagina.modulo.quiz]} aoAbrirFerramenta={abrirFerramenta} />
            )}
          </>
        )
      case 'conclusao':
        return (
          <div className="guia-capitulo">
            <i className="fas fa-trophy guia-capa__icone" aria-hidden="true" />
            <h1 className="guia-capitulo__titulo">{t('learn.conclusionTitle')}</h1>
            <p className="guia-capitulo__frase">{t('learn.conclusionText')}</p>
            <div className="guia-capa__acoes">
              <button
                type="button"
                className="btn-primario"
                onClick={() => setVista({ tipo: 'regras' })}
              >
                {t('learn.reference')}
              </button>
              <button
                type="button"
                className="btn-contorno"
                onClick={() => abrirFerramenta('calculadora')}
              >
                {t('learn.openHandCalculator')}
              </button>
            </div>
          </div>
        )
      case 'creditos':
        return (
          <>
            <h1 className="guia-titulo">{t('learn.credits')}</h1>
            {LOGO_CMC && (
              <img className="guia-creditos__logo" src={LOGO_CMC} alt={t('learn.cmcLogo')} />
            )}
            <BlocosGuia blocos={CONTEUDO.credits} aoAbrirFerramenta={abrirFerramenta} />
            <h2 className="guia-subtitulo">{t('learn.furtherReading')}</h2>
            <BlocosGuia
              blocos={CONTEUDO.furtherReading}
              // Riichi aqui é o nome do jogo, não a declaração.
              termos={['riichi']}
              aoAbrirFerramenta={abrirFerramenta}
            />
          </>
        )
    }
  }

  const conteudoConsulta = () => {
    if (vista.tipo === 'regra') {
      return (
        <>
          <h1 className="guia-titulo">{vista.topico.title}</h1>
          <BlocosGuia
            blocos={vista.topico.blocks}
            termos={vista.topico.termos}
            aoAbrirFerramenta={abrirFerramenta}
          />
        </>
      )
    }
    if (vista.tipo === 'regras') {
      return (
        <>
          <h1 className="guia-titulo">{t('learn.reference')}</h1>
          <p className="guia-paragrafo">{t('learn.referenceIntro')}</p>
          {CONTEUDO.referenceSections.map((secao) => (
            <section key={secao.id} aria-labelledby={`guia-secao-${secao.id}`}>
              <h2 id={`guia-secao-${secao.id}`} className="guia-subtitulo">
                {secao.title}
              </h2>
              {secao.intro && <p className="guia-secao-intro">{secao.intro}</p>}
              <ul className="guia-lista-topicos">
                {CONTEUDO.referenceTopics
                  .filter((topico) => topico.section === secao.id)
                  .map((topico) => (
                    <li key={topico.id}>
                      <button type="button" onClick={() => setVista({ tipo: 'regra', topico })}>
                        {topico.title}
                        <i className="fas fa-chevron-right" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </>
      )
    }
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

  const voltarConsulta = () => setVista(vista.tipo === 'regra' ? { tipo: 'regras' } : VISTA_LIVRO)
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
              onClick={aoFechar}
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

          <div ref={palcoRef} className="guia-palco" {...tocarPalco} {...propsToque}>
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
            <span className="guia-barra__titulo">
              {vista.tipo === 'glossario' ? t('learn.glossary') : t('learn.reference')}
            </span>
            <button
              type="button"
              className="guia-botao-icone"
              aria-label={t('learn.close')}
              title={t('learn.close')}
              onClick={aoFechar}
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
          aoIrPara={irPara}
          aoAbrirRegra={(topico) => {
            setIndiceAberto(false)
            setVista({ tipo: 'regra', topico })
          }}
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
    </div>,
    document.body,
  )
}
