import { useEffect, useRef, type RefObject } from 'react'
import { SELETOR_CAMADAS } from '../componentes/modal/pilhaCamadas'
import { toqueIgnorado } from './useDeslizeHorizontal'

/** Quanto o dedo precisa andar para o gesto valer. */
const DISTANCIA = 60
/** A partir daqui o gesto é horizontal e a tela acompanha o dedo. */
const INICIO = 10
const DURACAO_MS = 180
/** Onde o toque é de outro componente (arrastar pedra, teclado). */
const AREAS_DESLIGADAS = '.teclado-pedras, .dsc-teclado'

/**
 * Deslize horizontal com Pointer Events: a tela (`alvo`) acompanha o dedo e, se
 * soltar antes do limite, volta para o lugar. Com `bordaEsquerda`, só vale
 * começando perto da borda. É atalho: tudo também existe em botão.
 */
export function useGestoHorizontal({
  ativo = true,
  alvo,
  bordaEsquerda,
  aoDireita,
  aoEsquerda,
}: {
  ativo?: boolean
  alvo: RefObject<HTMLElement | null>
  bordaEsquerda?: number
  aoDireita?: () => void
  aoEsquerda?: () => void
}) {
  // Ref: os listeners ficam fixos e sempre chamam a versão atual das ações.
  const atual = useRef({ bordaEsquerda, aoDireita, aoEsquerda })
  atual.current = { bordaEsquerda, aoDireita, aoEsquerda }

  useEffect(() => {
    if (!ativo) return

    const semAnimacao = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let toque: { id: number; x: number; y: number; arrastando: boolean } | null = null

    const mover = (distancia: number, transicao: boolean) => {
      const elemento = alvo.current
      if (!elemento || semAnimacao()) return
      elemento.style.transition = transicao ? `transform ${DURACAO_MS}ms ease-out` : 'none'
      elemento.style.transform = distancia ? `translateX(${distancia}px)` : ''
    }

    const aoPressionar = (evento: PointerEvent) => {
      toque = null
      if (!evento.isPrimary || (evento.pointerType === 'mouse' && evento.button !== 0)) return
      const elemento = alvo.current
      if (!elemento || elemento.getClientRects().length === 0) return
      const { bordaEsquerda: borda, aoDireita: direita, aoEsquerda: esquerda } = atual.current
      if (!direita && !esquerda) return
      if (borda !== undefined && evento.clientX > borda) return
      if (document.querySelector(SELETOR_CAMADAS)) return
      if (toqueIgnorado(evento.target)) return
      if (evento.target instanceof Element && evento.target.closest(AREAS_DESLIGADAS)) return
      toque = { id: evento.pointerId, x: evento.clientX, y: evento.clientY, arrastando: false }
    }

    const aoMover = (evento: PointerEvent) => {
      if (!toque || evento.pointerId !== toque.id) return
      const deltaX = evento.clientX - toque.x
      const deltaY = evento.clientY - toque.y
      if (!toque.arrastando) {
        if (Math.abs(deltaY) > INICIO && Math.abs(deltaY) > Math.abs(deltaX)) {
          toque = null
          return
        }
        toque.arrastando = Math.abs(deltaX) > INICIO
      }
      if (!toque.arrastando) return
      // Com borda, só existe o gesto para a direita. Sem ação no sentido, resiste: é o quique.
      const { bordaEsquerda: borda, aoDireita: direita, aoEsquerda: esquerda } = atual.current
      if (borda !== undefined && deltaX < 0) {
        mover(0, false)
        return
      }
      const temAcao = deltaX > 0 ? direita : esquerda
      mover(temAcao ? deltaX : deltaX * 0.2, false)
    }

    const aoSoltar = (evento: PointerEvent) => {
      if (!toque || evento.pointerId !== toque.id) return
      const deltaX = evento.clientX - toque.x
      const deltaY = evento.clientY - toque.y
      const arrastando = toque.arrastando
      toque = null
      if (!arrastando) return

      // Arrastar em cima de um card não pode abrir o card ao soltar.
      const engolirClique = (clique: MouseEvent) => {
        clique.stopPropagation()
        clique.preventDefault()
      }
      document.addEventListener('click', engolirClique, { capture: true, once: true })
      window.setTimeout(() => document.removeEventListener('click', engolirClique, { capture: true }), 0)

      const { bordaEsquerda: borda, aoDireita: direita, aoEsquerda: esquerda } = atual.current
      const acao = deltaX > 0 ? direita : borda === undefined ? esquerda : undefined
      if (!acao || Math.abs(deltaX) < DISTANCIA || Math.abs(deltaX) <= Math.abs(deltaY)) {
        mover(0, true)
        return
      }
      if (semAnimacao()) {
        acao()
        return
      }
      mover(Math.sign(deltaX) * window.innerWidth, true)
      window.setTimeout(() => {
        acao()
        const elemento = alvo.current
        if (elemento) {
          elemento.style.transition = 'none'
          elemento.style.transform = ''
        }
      }, DURACAO_MS)
    }

    const aoCancelar = () => {
      if (toque?.arrastando) mover(0, true)
      toque = null
    }

    document.addEventListener('pointerdown', aoPressionar, { passive: true })
    document.addEventListener('pointermove', aoMover, { passive: true })
    document.addEventListener('pointerup', aoSoltar, { passive: true })
    document.addEventListener('pointercancel', aoCancelar, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', aoPressionar)
      document.removeEventListener('pointermove', aoMover)
      document.removeEventListener('pointerup', aoSoltar)
      document.removeEventListener('pointercancel', aoCancelar)
    }
  }, [ativo, alvo])
}
