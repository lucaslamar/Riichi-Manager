import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TelaPrincipal } from '@/app/App'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { IconeMenu } from './IconeMenu'
import {
  ITENS_NAVEGACAO,
  PAGINAS_NAVEGACAO,
  paginaDoDestino,
  type DestinoNavegacao,
  type DestinoTela,
} from './navegacao'
import MarcaAplicacao from './MarcaAplicacao'
import ModalIdioma from './ModalIdioma'
import { ID_TITULO_TELA } from './TituloTela'

interface PropsCabecalho {
  /** 'aprender' com o guia aberto: o item Tutorial fica marcado. */
  telaAtual: DestinoTela
  aoNavegar: (tela: TelaPrincipal) => void
  /** Abre o guia Aprender a jogar, em tela cheia por cima de qualquer tela. */
  aoAbrirAprender: () => void
}

/**
 * Cabeçalho, barra inferior (celular em pé e tablet; no celular deitado o CSS a põe
 * de pé, como trilho à esquerda) e sidebar fixa (telas grandes).
 * A barra tem duas páginas: "Mais" troca os itens no mesmo lugar, nada abre por cima.
 */
export default function Cabecalho({ telaAtual, aoNavegar, aoAbrirAprender }: PropsCabecalho) {
  const { t } = useI18n()
  const paginaAtiva = paginaDoDestino(telaAtual)
  const [pagina, setPagina] = useState(paginaAtiva)
  const [idiomaAberto, setIdiomaAberto] = useState(false)
  const barraRef = useRef<HTMLElement | null>(null)
  const focarPrimeiro = useRef(false)
  // Só anima ao trocar de página, não ao abrir o app.
  const paginaInicial = useRef(paginaAtiva)
  const trocou = useRef(false)
  if (pagina !== paginaInicial.current) trocou.current = true

  // A barra acompanha a tela aberta, inclusive ao trocar de tela deslizando.
  useEffect(() => setPagina(paginaAtiva), [paginaAtiva])

  // Trocou de página pelo botão: o foco vai para o primeiro item da nova.
  useEffect(() => {
    if (!focarPrimeiro.current) return
    focarPrimeiro.current = false
    barraRef.current?.querySelector<HTMLElement>('.item-tab-inferior:not(.item-tab-mais)')?.focus()
  }, [pagina])

  const escolher = (destino: DestinoNavegacao) => {
    if (destino === 'idioma') setIdiomaAberto(true)
    else if (destino === 'aprender') aoAbrirAprender()
    else aoNavegar(destino)
  }

  const trocarPagina = () => {
    focarPrimeiro.current = true
    setPagina((atual) => (atual === 0 ? 1 : 0))
  }

  const naSegunda = pagina === 1

  const botaoPagina = (
    <button
      className="item-tab-inferior item-tab-mais"
      type="button"
      aria-label={t(naSegunda ? 'menu.backToMain' : 'menu.moreOptions')}
      aria-expanded={naSegunda}
      title={t(naSegunda ? 'menu.backToMain' : 'menu.moreOptions')}
      onClick={trocarPagina}
    >
      <i className={`fas ${naSegunda ? 'fa-chevron-left' : 'fa-ellipsis'}`} aria-hidden="true" />
      <span>{t(naSegunda ? 'actions.back' : 'menu.more')}</span>
      {paginaAtiva !== pagina && <span className="item-tab-ponto" aria-hidden="true" />}
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
    <nav ref={barraRef} className="barra-navegacao-inferior" aria-label={t('global.navigation')}>
      <div key={pagina} className={`barra-pagina${trocou.current ? ` barra-pagina--${naSegunda ? 'segunda' : 'primeira'}` : ''}`}>
        {PAGINAS_NAVEGACAO[pagina].map((item) => {
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
        {botaoPagina}
      </div>
    </nav>,
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

      {idiomaAberto && <ModalIdioma aoFechar={() => setIdiomaAberto(false)} />}
    </>
  )
}
