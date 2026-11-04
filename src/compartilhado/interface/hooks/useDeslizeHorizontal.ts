import { useEffect, useRef } from 'react'
import { SELETOR_CAMADAS } from '../componentes/modal/pilhaCamadas'

/** Distância mínima do dedo, em px, para contar como deslize. */
const DISTANCIA_MINIMA = 70
/** O movimento tem que ser bem mais horizontal que vertical (não briga com a rolagem). */
const PROPORCAO_HORIZONTAL = 1.5
/** Onde o toque não deve virar navegação: campos e áreas que rolam de lado. */
export function toqueIgnorado(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof Element)) return true
  if (alvo.closest('input, select, textarea, [role="slider"], [contenteditable="true"]')) {
    return true
  }
  for (let elemento: Element | null = alvo; elemento; elemento = elemento.parentElement) {
    const { overflowX } = getComputedStyle(elemento)
    if (
      (overflowX === 'auto' || overflowX === 'scroll') &&
      elemento.scrollWidth > elemento.clientWidth
    ) {
      return true
    }
  }
  return false
}

/**
 * Deslize horizontal com o dedo pela tela para navegar entre telas.
 * `aoDeslizarDireita` = dedo indo para a direita; `aoDeslizarEsquerda` = para a
 * esquerda. Não age com janela (modal) aberta, a não ser com `dentroDaCamada`,
 * usado pela própria modal que é parada do carrossel (Idioma).
 */
export function useDeslizeHorizontal({
  ativo = true,
  dentroDaCamada = false,
  aoDeslizarDireita,
  aoDeslizarEsquerda,
}: {
  ativo?: boolean
  dentroDaCamada?: boolean
  aoDeslizarDireita?: () => void
  aoDeslizarEsquerda?: () => void
}) {
  // Refs: os listeners ficam fixos e sempre chamam a versão atual das ações.
  const acoes = useRef({ aoDeslizarDireita, aoDeslizarEsquerda })
  acoes.current = { aoDeslizarDireita, aoDeslizarEsquerda }

  useEffect(() => {
    if (!ativo) return

    let inicio: { x: number; y: number } | null = null

    const aoTocar = (evento: TouchEvent) => {
      inicio = null
      if (evento.touches.length !== 1) return
      const toque = evento.touches[0]
      if (!dentroDaCamada && document.querySelector(SELETOR_CAMADAS)) return
      if (toqueIgnorado(evento.target)) return
      inicio = { x: toque.clientX, y: toque.clientY }
    }

    const aoSoltar = (evento: TouchEvent) => {
      if (!inicio) return
      const toque = evento.changedTouches[0]
      const deltaX = toque.clientX - inicio.x
      const deltaY = toque.clientY - inicio.y
      inicio = null

      if (Math.abs(deltaX) < DISTANCIA_MINIMA) return
      if (Math.abs(deltaX) < Math.abs(deltaY) * PROPORCAO_HORIZONTAL) return

      if (deltaX > 0) acoes.current.aoDeslizarDireita?.()
      else acoes.current.aoDeslizarEsquerda?.()
    }

    const aoCancelar = () => {
      inicio = null
    }

    document.addEventListener('touchstart', aoTocar, { passive: true })
    document.addEventListener('touchend', aoSoltar, { passive: true })
    document.addEventListener('touchcancel', aoCancelar, { passive: true })
    return () => {
      document.removeEventListener('touchstart', aoTocar)
      document.removeEventListener('touchend', aoSoltar)
      document.removeEventListener('touchcancel', aoCancelar)
    }
  }, [ativo, dentroDaCamada])
}
