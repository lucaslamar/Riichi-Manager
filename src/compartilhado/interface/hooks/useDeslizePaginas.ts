import { useRef, type TouchEvent as EventoToque } from 'react'
import { toqueIgnorado } from './useDeslizeHorizontal'

/** Deslize (px), bem mais horizontal que vertical, para trocar de página. */
const DISTANCIA_MINIMA = 60
const PROPORCAO_HORIZONTAL = 1.5

/**
 * Páginas trocadas deslizando o dedo para o lado, como virar página: dedo para
 * a esquerda = próxima, sem dar a volta. Usado pela Modal em páginas (tutorial
 * de Han e Fu) e pelo guia Aprender a jogar, para o gesto e a animação serem
 * os mesmos.
 *
 * `sentido` diz de que lado a página nova entra (classes `modal-pagina
 * modal-pagina--avancar|voltar`, em modal.css). Toques em campos e em áreas
 * que rolam de lado (tabelas largas) não viram página.
 */
export function useDeslizePaginas({
  atual,
  total,
  aoMudar,
}: {
  /** Índice da página aberta; `undefined` desliga o gesto. */
  atual: number | undefined
  total: number
  aoMudar: (indice: number) => void
}) {
  const inicio = useRef<{ x: number; y: number } | null>(null)
  // Sentido da última troca de página, para a página nova entrar do lado certo.
  const ultima = useRef({ indice: atual, avancou: true })
  if (atual !== ultima.current.indice) {
    ultima.current = { indice: atual, avancou: (atual ?? 0) > (ultima.current.indice ?? 0) }
  }

  const mudarPagina = (passo: number) => {
    if (atual === undefined) return
    const destino = atual + passo
    if (destino >= 0 && destino < total) aoMudar(destino)
  }

  const onTouchStart = (evento: EventoToque) => {
    const toque = evento.touches[0]
    inicio.current =
      evento.touches.length === 1 && toque && !toqueIgnorado(evento.target)
        ? { x: toque.clientX, y: toque.clientY }
        : null
  }

  const onTouchEnd = (evento: EventoToque) => {
    const comeco = inicio.current
    inicio.current = null
    const toque = evento.changedTouches[0]
    if (!comeco || !toque) return
    const deltaX = toque.clientX - comeco.x
    const deltaY = toque.clientY - comeco.y
    if (Math.abs(deltaX) < DISTANCIA_MINIMA) return
    if (Math.abs(deltaX) < Math.abs(deltaY) * PROPORCAO_HORIZONTAL) return
    mudarPagina(deltaX < 0 ? 1 : -1)
  }

  return {
    mudarPagina,
    sentido: ultima.current.avancou ? ('avancar' as const) : ('voltar' as const),
    propsToque: { onTouchStart, onTouchEnd },
  }
}
