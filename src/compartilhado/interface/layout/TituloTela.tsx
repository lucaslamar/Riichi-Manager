import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { narrar } from '@/compartilhado/adaptadores/voz'
import { traduzirGlobal } from '@/compartilhado/i18n/tradutorGlobal'

/** Espaço no Cabecalho que recebe o título da tela aberta. */
export const ID_TITULO_TELA = 'cabecalho-tela'

// Só depois do primeiro toque ou tecla: ao abrir o app, o foco fica onde o sistema pôs.
let pessoaInteragiu = false
if (typeof window !== 'undefined') {
  const marcar = () => {
    pessoaInteragiu = true
  }
  window.addEventListener('pointerdown', marcar, { once: true, capture: true })
  window.addEventListener('keydown', marcar, { once: true, capture: true })
}

/**
 * Troca de tela para o leitor de tela: o foco vai para o título da tela nova, que é
 * lido ("Nova partida, título"), e a pessoa segue navegando dali (WAI-ARIA, WCAG
 * 2.4.3), como o `screenChanged` do iPhone. Com a Narração na voz do app, o título
 * também é falado.
 */
export function focarTituloTela() {
  if (!pessoaInteragiu) return
  const titulo = document.querySelector<HTMLElement>(`#${ID_TITULO_TELA} .titulo-tela`)
  if (!titulo || document.activeElement === titulo) return
  titulo.focus({ preventScroll: true })
  narrar(titulo.textContent ?? '')
}

/**
 * Coloca o título da tela no cabeçalho do app. Com `aoVoltar`, a seta e o título
 * ficam no lugar da marca; sem ele, o título aparece ao lado da marca. Sem título,
 * só as ações vão para o cabeçalho (ex.: a engrenagem da Han e Fu).
 */
export default function TituloTela({
  titulo,
  aoVoltar,
  acoes,
}: {
  titulo?: ReactNode
  aoVoltar?: () => void
  /** Botões à direita do título. */
  acoes?: ReactNode
}) {
  const [destino, setDestino] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setDestino(document.getElementById(ID_TITULO_TELA))
  }, [])

  const textoTitulo = typeof titulo === 'string' ? titulo : null
  useEffect(() => {
    if (destino && textoTitulo) focarTituloTela()
  }, [destino, textoTitulo])

  if (!destino) return null

  return createPortal(
    <>
      {aoVoltar && (
        <button
          type="button"
          className="botao-voltar-tela"
          aria-label={traduzirGlobal('actions.back')}
          title={traduzirGlobal('actions.back')}
          onClick={aoVoltar}
        >
          <i className="fas fa-arrow-left" aria-hidden="true" />
        </button>
      )}
      {/* tabIndex -1: recebe o foco da troca de tela, mas não entra no Tab. */}
      {titulo && (
        <h2 className="titulo-tela" tabIndex={-1}>
          {titulo}
        </h2>
      )}
      {acoes}
    </>,
    destino,
  )
}
