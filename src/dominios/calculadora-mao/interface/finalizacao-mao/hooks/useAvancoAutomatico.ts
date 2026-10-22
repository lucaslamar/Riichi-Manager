import { useCallback, useEffect, useRef } from 'react'

const ATRASO_PADRAO_MS = 250
const ESPERA_FIM_ROLAGEM_MS = 900
const FOLGA_PX = 8

type Alinhamento = 'topo' | 'base'

/** Faixa da janela livre do cabeçalho fixo (e da barra de resumo, quando presa) e da navegação inferior. */
function areaLivreDaJanela() {
  let topo = document.querySelector('.cabecalho-principal')?.getBoundingClientRect().bottom ?? 0
  const resumo = document.querySelector('.cabecalho-sticky-finalizacao')
  if (resumo && getComputedStyle(resumo).position === 'sticky') {
    const caixa = resumo.getBoundingClientRect()
    if (caixa.top <= topo + 1) topo = Math.max(topo, caixa.bottom)
  }
  let base = window.innerHeight
  const nav = document.querySelector('.barra-navegacao-inferior')
  if (nav && getComputedStyle(nav).position === 'fixed') {
    const caixa = nav.getBoundingClientRect()
    if (caixa.height > 0) base = Math.min(base, caixa.top)
  }
  return { topo, base }
}

/** Quanto falta rolar (para baixo) para o alvo chegar ao topo ou à base da área livre. */
function distanciaAteAlvo(alvo: HTMLElement, alinhamento: Alinhamento) {
  const caixa = alvo.getBoundingClientRect()
  const { topo, base } = areaLivreDaJanela()
  return alinhamento === 'base' ? caixa.bottom - base + FOLGA_PX : caixa.top - topo - FOLGA_PX
}

/**
 * Rolagem guiada da finalização: depois de uma escolha, leva a próxima seção
 * para o topo da área visível (ou, com alinhamento 'base', mostra o alvo
 * inteiro logo acima da navegação inferior).
 *
 * Só rola para baixo, ignora alvos já inteiros na tela (comum no tablet) e
 * espera um instante para o destaque da escolha aparecer. Se a pessoa rolar
 * antes ou durante o movimento, o avanço é cancelado. A página rola pela janela.
 */
export function useAvancoAutomatico(atraso = ATRASO_PADRAO_MS) {
  const temporizador = useRef<number | null>(null)

  const cancelar = useCallback(() => {
    if (temporizador.current !== null) {
      window.clearTimeout(temporizador.current)
      temporizador.current = null
    }
    // touchmove (e não touchstart): o próprio toque que agendou não cancela.
    window.removeEventListener('wheel', cancelar)
    window.removeEventListener('touchmove', cancelar)
  }, [])

  useEffect(() => cancelar, [cancelar])

  /** Agenda o avanço para o primeiro id da lista que estiver na página. */
  return useCallback(
    (ids: string | string[], alinhamento: Alinhamento = 'topo') => {
      cancelar()
      const opcoes = { passive: true } as const
      window.addEventListener('wheel', cancelar, opcoes)
      window.addEventListener('touchmove', cancelar, opcoes)

      const agendamento = window.setTimeout(() => {
        const alvo = ([] as string[])
          .concat(ids)
          .map((id) => document.getElementById(id))
          .find((elemento) => elemento !== null)
        const caixa = alvo?.getBoundingClientRect()
        const { topo, base } = areaLivreDaJanela()
        const inteiroNaTela = !!caixa && caixa.top >= topo && caixa.bottom <= base
        if (!alvo || !caixa || inteiroNaTela || caixa.top < topo) {
          cancelar()
          return
        }

        const comportamento: ScrollBehavior = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
          ? 'auto'
          : 'smooth'
        const rolarAteAlvo = () => {
          const distancia = distanciaAteAlvo(alvo, alinhamento)
          if (distancia <= 2) return false
          window.scrollTo({ top: window.scrollY + distancia, behavior: comportamento })
          return true
        }
        if (!rolarAteAlvo()) {
          cancelar()
          return
        }

        // Quando a mão sai da tela, a barra de resumo entra no topo da página e
        // empurra o conteúdo para baixo no meio da rolagem. Ao fim dela, um
        // ajuste curto (sempre para baixo) recoloca o alvo no lugar.
        const aoTerminar = () => {
          window.removeEventListener('scrollend', aoTerminar)
          if (temporizador.current !== reserva) return
          cancelar()
          rolarAteAlvo()
        }
        const reserva = window.setTimeout(aoTerminar, ESPERA_FIM_ROLAGEM_MS)
        temporizador.current = reserva
        window.addEventListener('scrollend', aoTerminar)
      }, atraso)
      temporizador.current = agendamento
    },
    [atraso, cancelar],
  )
}
