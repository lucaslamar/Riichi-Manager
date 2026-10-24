import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as EventoToque,
} from 'react'
import { createPortal } from 'react-dom'
import { useDeslizePaginas } from '../../hooks/useDeslizePaginas'
import { useDeslizeParaFechar } from '../../hooks/useDeslizeParaFechar'
import { ContextoNavegacaoModal, type TelaModal } from './navegacaoModal'
import { empilharCamada } from './pilhaCamadas'
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
  /**
   * Botões de ícone no cabeçalho, antes do X (classe `modal-acao`). Como o
   * rodapé, são da tela principal: somem nas telas internas.
   */
  acoes?: ReactNode
  /**
   * Esconde o X quando uma das `acoes` já fecha a modal (ex.: o lápis do
   * Resultado). Esc, toque fora e arrastar continuam fechando.
   */
  semBotaoFechar?: boolean
  /**
   * Conteúdo em páginas (ex.: tutorial): o corpo mostra a página `atual` e o
   * rodapé ganha Anterior/Próximo com os pontos das páginas. Deslizar o dedo
   * para o lado também troca de página.
   */
  paginacao?: PaginacaoModal
  /** Classe da modal específica, para os estilos e funcionalidades próprios dela. */
  className?: string
  children: ReactNode
}

export interface PaginacaoModal {
  total: number
  /** Índice da página aberta, a partir de 0. */
  atual: number
  aoMudar: (indice: number) => void
  rotuloAnterior: string
  rotuloProximo: string
  /** Nome acessível do ponto de cada página (ex.: "Página 2 de 9"). */
  rotuloPagina: (indice: number) => string
}

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Deslize para a direita (px), bem mais horizontal que vertical, volta uma tela. */
const DISTANCIA_VOLTAR = 60
const PROPORCAO_HORIZONTAL = 1.5
/** Um pouco mais que a animação de saída da tela (modal.css). */
const DURACAO_SAIDA = 300

interface TelaAberta extends TelaModal {
  id: number
  /** Onde estava o foco ao abrir a tela; volta para lá ao sair dela. */
  foco: HTMLElement | null
}

/**
 * Modal base do app. Toda modal nasce daqui e só define o próprio conteúdo:
 * cabeçalho, corpo rolável e rodapé opcional seguem o mesmo layout fluido em
 * qualquer tela (celular, tablet, desktop), sem regras por aparelho.
 *
 * Comportamentos comuns já incluídos: portal no body, fundo que fecha ao
 * clicar fora, Escape, arrastar para fechar no limite da rolagem
 * (useDeslizeParaFechar), foco preso dentro da modal e devolvido ao fechar,
 * trava de rolagem da página, modais empilhadas e ligação aria do
 * título/subtítulo.
 *
 * Telas internas (ContextoNavegacaoModal): o conteúdo pode abrir outra tela
 * na mesma modal, que entra deslizando da direita, com botão de voltar (Esc
 * ou deslizar para a direita também voltam). As telas de baixo continuam
 * montadas, então cada uma volta com a rolagem onde estava.
 *
 * Páginas (`paginacao`): o conteúdo é uma página de várias (ex.: tutorial),
 * trocada por Anterior/Próximo, pelos pontos do rodapé ou deslizando o dedo.
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
  acoes,
  semBotaoFechar = false,
  paginacao,
  className,
  children,
}: PropsModal) {
  const id = useId()
  const idTitulo = `${id}-titulo`
  const idSubtitulo = `${id}-subtitulo`
  const fundoRef = useRef<HTMLDivElement | null>(null)
  const dialogoRef = useRef<HTMLDivElement | null>(null)
  const botaoFecharRef = useRef<HTMLButtonElement | null>(null)
  const aoFecharRef = useRef(aoFechar)
  const [telas, setTelas] = useState<TelaAberta[]>([])
  // Tela que está saindo (animação de volta); some ao fim da animação.
  const [saindo, setSaindo] = useState<TelaAberta | null>(null)
  const proximoId = useRef(0)
  const telasRef = useRef(telas)
  telasRef.current = telas
  const inicioToque = useRef<{ x: number; y: number } | null>(null)
  const corpoRef = useRef<HTMLDivElement | null>(null)
  const paginaAtual = paginacao?.atual
  const { mudarPagina, sentido, propsToque } = useDeslizePaginas({
    atual: paginaAtual,
    total: paginacao?.total ?? 0,
    aoMudar: (indice) => paginacao?.aoMudar(indice),
  })

  useEffect(() => {
    aoFecharRef.current = aoFechar
  }, [aoFechar])

  // Página nova começa do topo.
  useEffect(() => {
    corpoRef.current?.scrollTo({ top: 0 })
  }, [paginaAtual])

  useDeslizeParaFechar(dialogoRef, fundoRef, aoFechar)

  const abrirTela = (tela: TelaModal) => {
    const foco = document.activeElement instanceof HTMLElement ? document.activeElement : null
    proximoId.current += 1
    setSaindo(null)
    setTelas((atuais) => [...atuais, { ...tela, id: proximoId.current, foco }])
  }

  const voltarRef = useRef(() => {})
  voltarRef.current = () => {
    const atual = telasRef.current[telasRef.current.length - 1]
    if (!atual) return
    setTelas((atuais) => atuais.slice(0, -1))
    setSaindo(atual)
    // Garantia se o `animationend` não vier (aba em segundo plano pausa a animação).
    window.setTimeout(() => setSaindo((tela) => (tela === atual ? null : tela)), DURACAO_SAIDA)
    atual.foco?.focus({ preventScroll: true })
  }

  // Foco na tela nova, para o leitor de tela anunciar e o Tab seguir dela.
  const ultimaTela = telas[telas.length - 1]
  useEffect(() => {
    if (!ultimaTela) return
    dialogoRef.current
      ?.querySelector<HTMLElement>(`[data-tela="${ultimaTela.id}"]`)
      ?.focus({ preventScroll: true })
  }, [ultimaTela])

  useEffect(() => {
    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Foco inicial no próprio diálogo (não no X): leitores de tela anunciam o
    // título e o X não abre com o anel de foco aceso; o Tab leva ao X.
    dialogoRef.current?.focus()
    const camada = empilharCamada()

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (!camada.noTopo()) return
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        // Numa tela interna, o Esc volta uma tela; senão fecha.
        if (telasRef.current.length > 0) voltarRef.current()
        else aoFecharRef.current()
        return
      }

      const dialogo = dialogoRef.current
      if (evento.key !== 'Tab' || !dialogo) return

      // Só o que está visível: telas cobertas ficam com `visibility: hidden`.
      const focaveis = Array.from(
        dialogo.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS),
      ).filter((elemento) => getComputedStyle(elemento).visibility !== 'hidden')
      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const fora = !focaveis.includes(document.activeElement as HTMLElement)
      if (fora) {
        evento.preventDefault()
        ;(evento.shiftKey ? ultimo : primeiro).focus()
      } else if (evento.shiftKey && document.activeElement === primeiro) {
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
      camada.remover()
      document.body.style.overflow = overflowAnterior
      // Sem rolar: a modal de baixo (se houver) fica exatamente onde estava.
      focoAnterior?.focus({ preventScroll: true })
    }
  }, [])

  const aoTocarTela = (evento: EventoToque) => {
    const toque = evento.touches[0]
    inicioToque.current =
      evento.touches.length === 1 && toque ? { x: toque.clientX, y: toque.clientY } : null
  }

  const aoSoltarTela = (evento: EventoToque) => {
    const inicio = inicioToque.current
    inicioToque.current = null
    const toque = evento.changedTouches[0]
    if (!inicio || !toque) return
    const deltaX = toque.clientX - inicio.x
    const deltaY = toque.clientY - inicio.y
    if (deltaX >= DISTANCIA_VOLTAR && deltaX >= Math.abs(deltaY) * PROPORCAO_HORIZONTAL) {
      voltarRef.current()
    }
  }

  const navegando = telas.length > 0
  const classes = [
    'modal',
    `modal--${tamanho}`,
    `modal--${tom}`,
    `modal--titulo-${estiloTitulo}`,
    navegando ? 'modal--navegando' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const renderizarTela = (tela: TelaAberta, estado: 'ativa' | 'coberta' | 'saindo') => (
    <div
      key={tela.id}
      data-tela={tela.id}
      className={`modal-tela modal-tela--${estado}`}
      tabIndex={-1}
      aria-hidden={estado === 'ativa' ? undefined : true}
      onTouchStart={estado === 'ativa' ? aoTocarTela : undefined}
      onTouchEnd={estado === 'ativa' ? aoSoltarTela : undefined}
      onAnimationEnd={estado === 'saindo' ? () => setSaindo(null) : undefined}
    >
      {tela.conteudo}
    </div>
  )

  return createPortal(
    <div
      ref={fundoRef}
      className="modal-fundo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
      // Eventos do React atravessam o portal: sem isso, um clique numa modal
      // aberta de dentro de um botão também o acionaria.
      onClick={(evento) => evento.stopPropagation()}
    >
      <div
        ref={dialogoRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={idTitulo}
        aria-describedby={subtitulo && !navegando ? idSubtitulo : undefined}
      >
        <header className="modal-cabecalho">
          {navegando && (
            <button
              className="modal-voltar"
              type="button"
              aria-label="Voltar"
              title="Voltar"
              onClick={() => voltarRef.current()}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
          )}
          <div className="modal-titulos">
            <h2 id={idTitulo} className="modal-titulo">
              {ultimaTela ? ultimaTela.titulo : titulo}
            </h2>
            {subtitulo && !navegando && (
              <p id={idSubtitulo} className="modal-subtitulo">
                {subtitulo}
              </p>
            )}
          </div>
          {acoes && !navegando && <div className="modal-acoes">{acoes}</div>}
          {/* Nas telas internas as `acoes` somem, então o X volta mesmo com `semBotaoFechar`. */}
          {(!semBotaoFechar || navegando) && (
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
          )}
        </header>

        <ContextoNavegacaoModal.Provider value={abrirTela}>
          <div className={`modal-palco${navegando || saindo ? ' modal-palco--navegando' : ''}`}>
            <div
              ref={corpoRef}
              className={`modal-corpo${navegando ? ' modal-corpo--coberta' : ''}`}
              aria-hidden={navegando || undefined}
              onTouchStart={paginacao ? propsToque.onTouchStart : undefined}
              onTouchEnd={paginacao ? propsToque.onTouchEnd : undefined}
            >
              {paginacao ? (
                <div
                  key={paginacao.atual}
                  className={`modal-pagina modal-pagina--${sentido}`}
                >
                  {children}
                </div>
              ) : (
                children
              )}
            </div>
            {telas.map((tela, indice) =>
              renderizarTela(tela, indice === telas.length - 1 ? 'ativa' : 'coberta'),
            )}
            {saindo && renderizarTela(saindo, 'saindo')}
          </div>
        </ContextoNavegacaoModal.Provider>

        {/* O rodapé é da tela principal (ex.: Aplicar das Regras): some nas telas internas. */}
        {rodape && !navegando && <footer className="modal-rodape">{rodape}</footer>}
        {paginacao && !navegando && (
          <footer className="modal-rodape modal-paginacao">
            <button
              type="button"
              className="btn-contorno"
              disabled={paginacao.atual === 0}
              onClick={() => mudarPagina(-1)}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
              {paginacao.rotuloAnterior}
            </button>
            <div className="modal-paginacao__pontos">
              {Array.from({ length: paginacao.total }, (_, indice) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: um ponto por página, fixos
                  key={indice}
                  type="button"
                  className={`modal-paginacao__ponto${
                    indice === paginacao.atual ? ' modal-paginacao__ponto--ativo' : ''
                  }`}
                  aria-label={paginacao.rotuloPagina(indice)}
                  aria-current={indice === paginacao.atual ? 'step' : undefined}
                  onClick={() => paginacao.aoMudar(indice)}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn-primario"
              disabled={paginacao.atual === paginacao.total - 1}
              onClick={() => mudarPagina(1)}
            >
              {paginacao.rotuloProximo}
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
