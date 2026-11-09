import { useEffect } from 'react'

/** Encolhida mínima, em px, para contar como teclado (barra de endereço não conta). */
const LIMIAR_TECLADO = 120
/** Tempo para o teclado terminar de abrir antes de rolar até o campo. */
const ESPERA_ROLAGEM = 280

/** Campo que abre o teclado do sistema ao receber o foco. */
function abreTeclado(elemento: Element | null): elemento is HTMLElement {
  if (!(elemento instanceof HTMLElement)) return false
  if (elemento.isContentEditable || elemento instanceof HTMLTextAreaElement) return true
  if (!(elemento instanceof HTMLInputElement)) return false
  return !['button', 'checkbox', 'radio', 'range', 'color', 'file', 'submit', 'reset', 'image', 'hidden'].includes(
    elemento.type,
  )
}

/**
 * Teclado do sistema, para o app inteiro (chamado uma vez, no App). Escreve no :root:
 * - `--altura-teclado`: quanto o teclado cobre (iOS, onde a página não encolhe);
 * - `--vv-topo` e `--vv-altura`: a área visível de verdade, para as folhas;
 * e marca `body.teclado-aberto` enquanto um campo com teclado está em foco e a tela
 * encolheu. No Android, `interactive-widget=resizes-content` (index.html) já encolhe
 * a página, e a classe esconde a barra inferior e o que não cabe.
 * Também rola o campo em foco de uma folha para dentro da área visível.
 * No React Native: KeyboardAvoidingView / react-native-keyboard-controller.
 */
export function useAlturaTeclado() {
  useEffect(() => {
    const visual = window.visualViewport
    const raiz = document.documentElement
    let larguraBase = window.innerWidth
    let alturaBase = window.innerHeight
    let rolagem = 0

    const medir = () => {
      // Girou a tela: a altura de referência é outra.
      if (window.innerWidth !== larguraBase) {
        larguraBase = window.innerWidth
        alturaBase = window.innerHeight
      }
      const editando = abreTeclado(document.activeElement)
      if (!editando) alturaBase = Math.max(alturaBase, window.innerHeight)
      const alturaVisivel = visual?.height ?? window.innerHeight
      const topoVisivel = visual?.offsetTop ?? 0
      const coberto = Math.max(0, window.innerHeight - alturaVisivel - topoVisivel)
      const encolheu = alturaBase - window.innerHeight
      const aberto = editando && (coberto > LIMIAR_TECLADO || encolheu > LIMIAR_TECLADO)
      raiz.style.setProperty('--altura-teclado', `${aberto ? Math.round(coberto) : 0}px`)
      raiz.style.setProperty('--vv-topo', `${Math.round(topoVisivel)}px`)
      raiz.style.setProperty('--vv-altura', `${Math.round(alturaVisivel)}px`)
      document.body.classList.toggle('teclado-aberto', aberto)
    }

    /** Campo de folha em foco: rola até ele depois que o teclado abre. */
    const mostrarCampo = () => {
      const alvo = document.activeElement
      if (!abreTeclado(alvo) || !alvo.closest('.modal')) return
      window.clearTimeout(rolagem)
      rolagem = window.setTimeout(() => alvo.scrollIntoView({ block: 'nearest' }), ESPERA_ROLAGEM)
    }

    const aoFocar = () => {
      medir()
      mostrarCampo()
    }
    // O foco sai e entra de novo ao trocar de campo: espera o próximo antes de fechar.
    const aoDesfocar = () => window.setTimeout(medir, 50)
    const aoRedimensionar = () => {
      medir()
      mostrarCampo()
    }

    medir()
    visual?.addEventListener('resize', aoRedimensionar)
    visual?.addEventListener('scroll', medir)
    window.addEventListener('resize', aoRedimensionar)
    document.addEventListener('focusin', aoFocar)
    document.addEventListener('focusout', aoDesfocar)
    return () => {
      window.clearTimeout(rolagem)
      visual?.removeEventListener('resize', aoRedimensionar)
      visual?.removeEventListener('scroll', medir)
      window.removeEventListener('resize', aoRedimensionar)
      document.removeEventListener('focusin', aoFocar)
      document.removeEventListener('focusout', aoDesfocar)
      document.body.classList.remove('teclado-aberto')
    }
  }, [])
}
