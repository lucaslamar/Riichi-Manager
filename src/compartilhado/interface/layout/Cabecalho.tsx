import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TelaPrincipal } from '@/app/App'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import { IconeMenu } from './IconeMenu'
import {
  ITENS_NAVEGACAO,
  PAGINAS_NAVEGACAO,
  paginaDoDestino,
  type DestinoNavegacao,
  type DestinoTela,
} from './navegacao'
import MarcaAplicacao from './MarcaAplicacao'
import { ID_TITULO_TELA } from './TituloTela'

interface PropsCabecalho {
  /** 'aprender' com o guia aberto: o item Tutorial fica marcado. */
  telaAtual: DestinoTela
  aoNavegar: (tela: TelaPrincipal) => void
  /** Abre o guia Aprender a jogar, em tela cheia por cima de qualquer tela. */
  aoAbrirAprender: () => void
  /** Abre a folha de idiomas (o App a controla, porque ela também é parada do carrossel). */
  aoAbrirIdioma: () => void
}

/**
 * Cabeçalho, barra inferior (celular em pé e tablet; no celular deitado o CSS a põe
 * de pé, como trilho à esquerda) e sidebar fixa (telas grandes).
 * A barra mostra as telas principais, e "Mais" abre o menu lateral com todas as
 * telas (nome completo e a atual marcada). O deslizar entre telas segue igual.
 */
export default function Cabecalho({
  telaAtual,
  aoNavegar,
  aoAbrirAprender,
  aoAbrirIdioma,
}: PropsCabecalho) {
  const { t } = useI18n()
  // A tela aberta está fora da barra (no menu do Mais): o Mais ganha o ponto.
  const foraDaBarra = paginaDoDestino(telaAtual) !== 0
  const [maisAberto, setMaisAberto] = useState(false)
  const botaoMaisRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)
  // Deslize de fechar: onde o dedo começou e quanto o menu já acompanhou.
  const toqueRef = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null)
  const [arrasto, setArrasto] = useState(0)

  const escolher = (destino: DestinoNavegacao) => {
    setMaisAberto(false)
    if (destino === 'idioma') aoAbrirIdioma()
    else if (destino === 'aprender') aoAbrirAprender()
    else aoNavegar(destino)
  }

  /**
   * Arrastar o dedo para o lado (direita ou esquerda) fecha o menu. Para a esquerda
   * o menu acompanha o dedo, como uma gaveta, e um gesto vertical só rola a lista.
   */
  const aoTocar = (evento: React.TouchEvent) => {
    const toque = evento.touches[0]
    toqueRef.current = { x: toque.clientX, y: toque.clientY, horizontal: null }
  }
  const aoMoverToque = (evento: React.TouchEvent) => {
    const inicio = toqueRef.current
    if (!inicio) return
    const toque = evento.touches[0]
    const dx = toque.clientX - inicio.x
    const dy = toque.clientY - inicio.y
    if (inicio.horizontal === null && Math.hypot(dx, dy) > 10) {
      inicio.horizontal = Math.abs(dx) > Math.abs(dy)
    }
    if (inicio.horizontal) setArrasto(Math.min(0, dx))
  }
  const aoSoltarToque = (evento: React.TouchEvent) => {
    const inicio = toqueRef.current
    toqueRef.current = null
    setArrasto(0)
    if (!inicio?.horizontal) return
    const dx = evento.changedTouches[0].clientX - inicio.x
    if (Math.abs(dx) > 50) setMaisAberto(false)
  }

  // Menu aberto: Esc fecha, o foco vai para a tela marcada e volta ao Mais ao fechar.
  useEffect(() => {
    if (!maisAberto) return
    const camada = empilharCamada()
    const botaoMais = botaoMaisRef.current
    menuRef.current
      ?.querySelector<HTMLElement>('.item-menu-global.ativo, .item-menu-global')
      ?.focus()
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape' || !camada.noTopo()) return
      evento.stopPropagation()
      setMaisAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      camada.remover()
      botaoMais?.focus({ preventScroll: true })
    }
  }, [maisAberto])

  const botaoMais = (
    <button
      ref={botaoMaisRef}
      className={`item-tab-inferior item-tab-mais${foraDaBarra ? ' ativo' : ''}`}
      type="button"
      aria-label={t('menu.moreOptions')}
      aria-haspopup="dialog"
      aria-expanded={maisAberto}
      title={t('menu.moreOptions')}
      onClick={() => setMaisAberto(true)}
    >
      <i className="fas fa-ellipsis" aria-hidden="true" />
      <span>{t('menu.more')}</span>
      {foraDaBarra && <span className="item-tab-ponto" aria-hidden="true" />}
    </button>
  )

  const listaItens = (
    <section className="drawer-secao">
      <h2>{t('menu.app')}</h2>
      <div className="drawer-itens">
        {ITENS_NAVEGACAO.map((item) => {
          const ativo = item.destino === telaAtual
          return (
            <button
              key={item.destino}
              className={`item-menu-global ${ativo ? 'ativo' : ''}`}
              type="button"
              aria-current={ativo ? 'page' : undefined}
              onClick={() => escolher(item.destino)}
            >
              <IconeMenu icone={item.icone} />
              <span>{t(item.chave)}</span>
            </button>
          )
        })}
      </div>
    </section>
  )

  const barraInferior = createPortal(
    <nav className="barra-navegacao-inferior" aria-label={t('global.navigation')}>
      <div className="barra-pagina">
        {PAGINAS_NAVEGACAO[0].map((item) => {
          const ativo = item.destino === telaAtual
          return (
            <button
              key={item.destino}
              className={`item-tab-inferior ${ativo ? 'ativo' : ''}`}
              type="button"
              aria-current={ativo ? 'page' : undefined}
              aria-label={t(item.chave)}
              title={t(item.chave)}
              onClick={() => escolher(item.destino)}
            >
              <IconeMenu icone={item.icone} />
              <span>{t(item.chaveCurta ?? item.chave)}</span>
            </button>
          )
        })}
        {botaoMais}
      </div>
    </nav>,
    document.body,
  )

  /** Menu do Mais: todas as telas, deslizando da esquerda por cima do app. */
  const menuMais =
    maisAberto &&
    createPortal(
      <div
        className="menu-mais-fundo"
        role="presentation"
        onTouchStart={aoTocar}
        onTouchMove={aoMoverToque}
        onTouchEnd={aoSoltarToque}
        onTouchCancel={() => {
          toqueRef.current = null
          setArrasto(0)
        }}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) setMaisAberto(false)
        }}
      >
        <nav
          ref={menuRef}
          className={`menu-mais${arrasto ? ' arrastando' : ''}`}
          style={arrasto ? { transform: `translateX(${arrasto}px)` } : undefined}
          role="dialog"
          aria-modal="true"
          aria-label={t('global.navigation')}
        >
          <div className="menu-mais__topo">
            <MarcaAplicacao />
            <button
              type="button"
              className="menu-mais__fechar"
              aria-label={t('actions.close')}
              title={t('actions.close')}
              onClick={() => setMaisAberto(false)}
            >
              <i className="fas fa-xmark" aria-hidden="true" />
            </button>
          </div>
          {listaItens}
        </nav>
      </div>,
      document.body,
    )

  return (
    <>
      <header className="cabecalho-principal">
        <div className="conteudo-cabecalho">
          <div className="barra-marca-aplicacao">
            <div className="marca-aplicacao">
              <MarcaAplicacao />
            </div>

            <div id={ID_TITULO_TELA} className="cabecalho-tela" />

            <nav className="sidebar-navegacao-desktop" aria-label={t('global.navigation')}>
              {listaItens}
            </nav>
          </div>
        </div>
      </header>
      {barraInferior}
      {menuMais}
    </>
  )
}
