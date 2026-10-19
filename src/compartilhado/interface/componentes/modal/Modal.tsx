import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './modal.css'

export type TamanhoModal = 'pequena' | 'media' | 'grande'
export type TomModal = 'padrao' | 'alerta'

export interface PropsModal {
  /** Texto do cabeçalho. Também nomeia a modal para leitores de tela. */
  titulo: ReactNode
  /** Linha de apoio abaixo do título (some em telas muito baixas). */
  subtitulo?: ReactNode
  aoFechar: () => void
  /** Rótulo acessível do botão de fechar. */
  rotuloFechar: string
  /** Largura máxima: pequena 400px, media 560px, grande 860px. */
  tamanho?: TamanhoModal
  /** `alerta` pinta a modal de vermelho (chombo, mão inválida). */
  tom?: TomModal
  /**
   * `titulo`: título em destaque (ex.: Regras de cálculo).
   * `rotulo`: título pequeno em caixa alta, para modais cujo conteúdo é o destaque (ex.: Resultado).
   */
  estiloTitulo?: 'titulo' | 'rotulo'
  /** Área fixa abaixo do corpo rolável (botões de ação, referências etc.). */
  rodape?: ReactNode
  /** Classe da modal específica, para os estilos e funcionalidades próprios dela. */
  className?: string
  children: ReactNode
}

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal base do app. Toda modal nasce daqui e só define o próprio conteúdo:
 * cabeçalho, corpo rolável e rodapé opcional seguem o mesmo layout fluido em
 * qualquer tela (celular, tablet, desktop), sem regras por aparelho.
 *
 * Comportamentos comuns já incluídos: portal no body, fundo que fecha ao
 * clicar fora, Escape, foco preso dentro da modal e devolvido ao fechar,
 * trava de rolagem da página e ligação aria do título/subtítulo.
 */
export default function Modal({
  titulo,
  subtitulo,
  aoFechar,
  rotuloFechar,
  tamanho = 'media',
  tom = 'padrao',
  estiloTitulo = 'titulo',
  rodape,
  className,
  children,
}: PropsModal) {
  const id = useId()
  const idTitulo = `${id}-titulo`
  const idSubtitulo = `${id}-subtitulo`
  const dialogoRef = useRef<HTMLDivElement | null>(null)
  const botaoFecharRef = useRef<HTMLButtonElement | null>(null)
  const aoFecharRef = useRef(aoFechar)

  useEffect(() => {
    aoFecharRef.current = aoFechar
  }, [aoFechar])

  useEffect(() => {
    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    botaoFecharRef.current?.focus()

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        aoFecharRef.current()
        return
      }

      const dialogo = dialogoRef.current
      if (evento.key !== 'Tab' || !dialogo) return

      const focaveis = Array.from(dialogo.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS))
      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla)
      document.body.style.overflow = overflowAnterior
      focoAnterior?.focus()
    }
  }, [])

  const classes = [
    'modal',
    `modal--${tamanho}`,
    `modal--${tom}`,
    `modal--titulo-${estiloTitulo}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return createPortal(
    <div
      className="modal-fundo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        ref={dialogoRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={subtitulo ? idSubtitulo : undefined}
      >
        <header className="modal-cabecalho">
          <div className="modal-titulos">
            <h2 id={idTitulo} className="modal-titulo">
              {titulo}
            </h2>
            {subtitulo && (
              <p id={idSubtitulo} className="modal-subtitulo">
                {subtitulo}
              </p>
            )}
          </div>
          <button
            ref={botaoFecharRef}
            className="modal-fechar"
            type="button"
            aria-label={rotuloFechar}
            title={rotuloFechar}
            onClick={aoFechar}
          >
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="modal-corpo">{children}</div>

        {rodape && <footer className="modal-rodape">{rodape}</footer>}
      </div>
    </div>,
    document.body,
  )
}
