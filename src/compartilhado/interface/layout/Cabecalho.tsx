import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { TelaPrincipal } from '@/app/App'
import { useI18n, type IdiomaSuportado } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import packageJson from '../../../../package.json'

interface PropsCabecalho {
  telaAtual: TelaPrincipal
  torneioAtivo: boolean
  aoNavegar: (tela: TelaPrincipal) => void
}

interface ItemMenuGlobal {
  tela: TelaPrincipal
  chave: string
  icone: string
}

const MODULOS_MENU: ItemMenuGlobal[] = [
  { tela: 'calculadora', chave: 'menu.handCalculator', icone: 'fa-chess-board' },
  { tela: 'calculadoraRapida', chave: 'menu.quickCalculator', icone: 'fa-bolt' },
  { tela: 'sorteadorVentos', chave: 'menu.windDraw', icone: 'fa-wind' },
  { tela: 'centerpiece', chave: 'menu.centerpiece', icone: 'fa-table' },
  { tela: 'configuracaoTorneio', chave: 'menu.fastTournament', icone: 'fa-trophy' },
]

const APP_MENU: ItemMenuGlobal[] = [
  { tela: 'regras', chave: 'menu.rules', icone: 'fa-sliders-h' },
  { tela: 'sobre', chave: 'menu.about', icone: 'fa-info-circle' },
]

const TODOS_ITENS = [...MODULOS_MENU, ...APP_MENU]
const LIMIAR_GESTO_DRAWER = 64
const BORDA_GESTO_DRAWER = 28

type ModoGestoDrawer = 'abrir' | 'fechar'

interface EstadoGestoDrawer {
  modo: ModoGestoDrawer
  inicioX: number
  inicioY: number
  ativo: boolean
}

function elementosFocaveis(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((elemento) => !elemento.hasAttribute('aria-hidden'))
}

/**
 * Header compacto e drawer global do app.
 *
 * O drawer concentra navegacao entre modulos, idioma e versao. Quando aberto,
 * prende foco, fecha com Escape e fecha ao selecionar item ou clicar no overlay.
 */
export default function Cabecalho({ telaAtual, torneioAtivo, aoNavegar }: PropsCabecalho) {
  const { t, idioma, idiomas, alterarIdioma } = useI18n()
  const [menuAberto, setMenuAberto] = useState(false)
  const [deslocamentoDrawer, setDeslocamentoDrawer] = useState(0)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const botaoMenuRef = useRef<HTMLButtonElement | null>(null)
  const gestoDrawerRef = useRef<EstadoGestoDrawer | null>(null)
  const deslocamentoDrawerRef = useRef(0)
  const itemAtual =
    TODOS_ITENS.find((item) => item.tela === telaAtual) ??
    (torneioAtivo ? MODULOS_MENU[2] : MODULOS_MENU[0])

  const navegar = (tela: TelaPrincipal) => {
    aoNavegar(tela)
    setMenuAberto(false)
  }

  const iniciarGestoDrawer = (modo: ModoGestoDrawer, evento: ReactPointerEvent<HTMLElement>) => {
    if (evento.pointerType === 'mouse') return

    if (modo === 'abrir' && evento.clientX > BORDA_GESTO_DRAWER) return

    gestoDrawerRef.current = {
      modo,
      inicioX: evento.clientX,
      inicioY: evento.clientY,
      ativo: false,
    }
    evento.currentTarget.setPointerCapture(evento.pointerId)
  }

  const moverGestoDrawer = (evento: ReactPointerEvent<HTMLElement>) => {
    const gesto = gestoDrawerRef.current
    if (!gesto) return

    const deltaX = evento.clientX - gesto.inicioX
    const deltaY = evento.clientY - gesto.inicioY

    if (!gesto.ativo) {
      if (Math.abs(deltaY) > 18 && Math.abs(deltaY) > Math.abs(deltaX)) {
        gestoDrawerRef.current = null
        return
      }

      gesto.ativo = Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)
    }

    if (!gesto.ativo) return

    if (gesto.modo === 'abrir' && deltaX > LIMIAR_GESTO_DRAWER) {
      setMenuAberto(true)
      gestoDrawerRef.current = null
      return
    }

    if (gesto.modo === 'fechar') {
      const deslocamento = Math.min(0, deltaX)
      deslocamentoDrawerRef.current = deslocamento
      setDeslocamentoDrawer(deslocamento)
    }
  }

  const finalizarGestoDrawer = () => {
    const gesto = gestoDrawerRef.current
    if (!gesto) return

    const deveFechar =
      gesto.modo === 'fechar' && deslocamentoDrawerRef.current <= -LIMIAR_GESTO_DRAWER

    gestoDrawerRef.current = null
    deslocamentoDrawerRef.current = 0
    setDeslocamentoDrawer(0)

    if (deveFechar) setMenuAberto(false)
  }

  useEffect(() => {
    if (!menuAberto) return

    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const drawer = drawerRef.current
    document.body.classList.add('drawer-global-aberto')

    window.setTimeout(() => {
      const primeiro = drawer ? elementosFocaveis(drawer)[0] : null
      primeiro?.focus()
    }, 0)

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setMenuAberto(false)
        return
      }

      if (evento.key !== 'Tab' || !drawer) return

      const focaveis = elementosFocaveis(drawer)
      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const ativo = document.activeElement

      if (evento.shiftKey && ativo === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && ativo === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)

    return () => {
      document.body.classList.remove('drawer-global-aberto')
      document.removeEventListener('keydown', aoPressionarTecla)
      focoAnterior?.focus()
    }
  }, [menuAberto])

  return (
    <header className="cabecalho-principal">
      <div className="conteudo-cabecalho">
        <div className="barra-marca-aplicacao">
          <button
            ref={botaoMenuRef}
            className="botao-menu-global"
            type="button"
            aria-label={menuAberto ? t('global.closeMenu') : t('global.openMenu')}
            aria-expanded={menuAberto}
            aria-controls="drawer-global"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <i className={`fas ${menuAberto ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
          </button>

          <div className="marca-aplicacao">
            <div className="pedra-mahjong" aria-hidden="true">
              中
            </div>
            <div className="container-titulo">
              <h1 className="titulo-principal">{t('global.appName')}</h1>
              <span className="modulo-atual" aria-label={t('global.currentModule')}>
                {t(itemAtual.chave)}
              </span>
            </div>
          </div>

          <nav className="sidebar-navegacao-desktop" aria-label={t('global.navigation')}>
            <MenuSecao
              titulo={t('menu.modules')}
              itens={MODULOS_MENU}
              telaAtual={telaAtual}
              aoNavegar={aoNavegar}
              t={t}
            />
            <MenuSecao
              titulo={t('menu.app')}
              itens={APP_MENU}
              telaAtual={telaAtual}
              aoNavegar={aoNavegar}
              t={t}
            />
          </nav>
        </div>

        {menuAberto &&
          createPortal(
            <div
              className="drawer-global-overlay"
              role="presentation"
              onPointerDown={(evento) => iniciarGestoDrawer('fechar', evento)}
              onPointerMove={moverGestoDrawer}
              onPointerCancel={finalizarGestoDrawer}
              onPointerUp={finalizarGestoDrawer}
              onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) setMenuAberto(false)
              }}
            >
              <div
                ref={drawerRef}
                id="drawer-global"
                className="drawer-global"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-drawer-global"
                style={{
                  transform: deslocamentoDrawer ? `translateX(${deslocamentoDrawer}px)` : undefined,
                }}
              >
                <div className="drawer-cabecalho">
                  <div>
                    <strong id="titulo-drawer-global">{t('global.appName')}</strong>
                    <span>{t('global.tagline')}</span>
                  </div>
                  <button
                    className="botao-fechar-drawer"
                    type="button"
                    aria-label={t('global.closeMenu')}
                    onClick={() => setMenuAberto(false)}
                  >
                    <i className="fas fa-xmark" aria-hidden="true" />
                  </button>
                </div>

                <nav className="drawer-navegacao" aria-label={t('global.navigation')}>
                  <MenuSecao
                    titulo={t('menu.modules')}
                    itens={MODULOS_MENU}
                    telaAtual={telaAtual}
                    aoNavegar={navegar}
                    t={t}
                  />
                  <MenuSecao
                    titulo={t('menu.app')}
                    itens={APP_MENU}
                    telaAtual={telaAtual}
                    aoNavegar={navegar}
                    t={t}
                  />
                </nav>

                <label className="seletor-idioma seletor-idioma-drawer">
                  <span>
                    <i className="fas fa-globe" aria-hidden="true" />
                    {t('menu.language')}
                  </span>
                  <select
                    value={idioma}
                    aria-label={t('menu.language')}
                    onChange={(evento) => alterarIdioma(evento.target.value as IdiomaSuportado)}
                  >
                    {idiomas.map((opcaoIdioma) => (
                      <option key={opcaoIdioma} value={opcaoIdioma}>
                        {ROTULOS_IDIOMA[opcaoIdioma]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="drawer-rodape">v{packageJson.version}</div>
              </div>
            </div>,
            document.body,
          )}

        {!menuAberto && (
          <div
            className="zona-gesto-drawer"
            aria-hidden="true"
            onPointerDown={(evento) => iniciarGestoDrawer('abrir', evento)}
            onPointerMove={moverGestoDrawer}
            onPointerCancel={finalizarGestoDrawer}
            onPointerUp={finalizarGestoDrawer}
          />
        )}
      </div>
    </header>
  )
}

function MenuSecao({
  titulo,
  itens,
  telaAtual,
  aoNavegar,
  t,
}: {
  titulo: string
  itens: ItemMenuGlobal[]
  telaAtual: TelaPrincipal
  aoNavegar: (tela: TelaPrincipal) => void
  t: (chave: string) => string
}) {
  return (
    <section className="drawer-secao">
      <h2>{titulo}</h2>
      <div className="drawer-itens">
        {itens.map((item) => {
          const ativo = item.tela === telaAtual
          return (
            <button
              key={item.tela}
              className={`item-menu-global ${ativo ? 'ativo' : ''}`}
              type="button"
              aria-current={ativo ? 'page' : undefined}
              onClick={() => aoNavegar(item.tela)}
            >
              <i className={`fas ${item.icone}`} aria-hidden="true" />
              <span>{t(item.chave)}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
