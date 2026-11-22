import { useEffect, useRef, type RefObject } from 'react'

/** Distância do dedo, em px, a partir da qual soltar fecha a modal. */
const LIMIAR_DISTANCIA = 120
/** Velocidade, em px/s, que fecha mesmo antes da distância (arrasto rápido). */
const LIMIAR_VELOCIDADE = 1000
/** Movimento mínimo, em px, para decidir se o gesto é vertical ou horizontal. */
const FOLGA_DIRECAO = 8
/** Janela, em ms, usada para medir a velocidade no fim do arrasto. */
const JANELA_VELOCIDADE = 100
const DURACAO_SAIDA = 220
const DURACAO_VOLTA = 380
/** Curva com leve passada do ponto: aproxima a mola da sheet do iPhone. */
const CURVA_MOLA = 'cubic-bezier(0.34, 1.4, 0.64, 1)'
/** Com "Reduzir movimento": só um fade curto, sem deslocamento. */
const DURACAO_FADE = 150

/** Onde o toque não vira gesto de fechar: campos e áreas marcadas. */
function toqueIgnorado(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof Element)) return true
  return !!alvo.closest(
    'input, select, textarea, [role="slider"], [contenteditable="true"], [data-sem-deslize]',
  )
}

/** Primeira área com rolagem vertical entre o toque e o diálogo (normalmente o corpo). */
function areaRolavel(alvo: Element, dialogo: HTMLElement): HTMLElement | null {
  for (let elemento: Element | null = alvo; elemento; elemento = elemento.parentElement) {
    if (elemento instanceof HTMLElement) {
      const { overflowY } = getComputedStyle(elemento)
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        elemento.scrollHeight > elemento.clientHeight + 1
      ) {
        return elemento
      }
    }
    if (elemento === dialogo) break
  }
  return null
}

/** `1` = dedo descendo (precisa estar no topo); `-1` = subindo (precisa estar no fim). */
function noLimite(rolavel: HTMLElement | null, direcao: 1 | -1): boolean {
  if (!rolavel) return true
  if (direcao > 0) return rolavel.scrollTop <= 0
  return rolavel.scrollTop + rolavel.clientHeight >= rolavel.scrollHeight - 1
}

/** Resistência leve (rubber band): acompanha o dedo e fica mais firme quanto mais longe. */
function elastico(distancia: number, limite: number): number {
  const absoluta = Math.abs(distancia)
  return Math.sign(distancia) * limite * (1 - 1 / ((absoluta * 0.9) / limite + 1))
}

/** O modal.css encosta a modal na direita no celular deitado. */
function painelNaDireita(fundo: HTMLElement): boolean {
  return getComputedStyle(fundo).justifyContent === 'flex-end'
}

function movimentoReduzido(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Fechar a modal arrastando, como a sheet do iPhone (e igual no Android, que
 * não tem o bounce nativo):
 * - no topo da rolagem, arrastar para baixo fecha; no fim, arrastar para cima;
 * - sem rolagem (conteúdo cabe na tela) ou tocando no cabeçalho/rodapé, os dois;
 * - fora do limite a rolagem funciona normal, e gesto horizontal fica para as abas;
 * - com `paraOLado`, o painel da direita também fecha arrastando para a direita.
 *
 * A modal acompanha o dedo e o fundo clareia; ao soltar, fecha se passou de
 * ~120 px ou foi rápido (> 1000 px/s), saindo na direção do gesto, ou volta
 * com mola. Só toque: no mouse ficam o X, o Esc e o clique fora.
 *
 * Mexe direto no estilo do diálogo e do fundo (sem render a cada quadro). O
 * fundo usa `--modal-escurecido-opacidade` (ver modal.css).
 */
export function useDeslizeParaFechar(
  dialogoRef: RefObject<HTMLElement>,
  fundoRef: RefObject<HTMLElement>,
  aoFechar: () => void,
  paraOLado = false,
) {
  // Ref: os listeners ficam fixos e sempre chamam a versão atual.
  const aoFecharRef = useRef(aoFechar)
  aoFecharRef.current = aoFechar

  useEffect(() => {
    const dialogo = dialogoRef.current
    const fundo = fundoRef.current
    if (!dialogo || !fundo) return

    let gesto: {
      inicioX: number
      inicioY: number
      ultimoY: number
      eixo: 'x' | 'y'
      rolavel: HTMLElement | null
      decidido: boolean
      ativo: boolean
      /** Direção que ativou o gesto; `0` = sem rolagem, vale para os dois lados. */
      direcao: 1 | -1 | 0
      origem: number
      amostras: { posicao: number; tempo: number }[]
      reduzido: boolean
    } | null = null
    let fechando = false
    let limpeza: number | undefined

    const transicao = (duracao: number, curva: string, reduzido: boolean) => {
      const propriedade = reduzido ? 'opacity' : 'transform'
      dialogo.style.transition = duracao ? `${propriedade} ${duracao}ms ${curva}` : 'none'
      fundo.style.setProperty(
        '--modal-escurecido-transicao',
        duracao ? `opacity ${duracao}ms ${reduzido ? curva : 'ease-out'}` : 'none',
      )
    }

    const aplicar = (deslocamento: number, reduzido: boolean, eixo: 'x' | 'y') => {
      const tamanho = eixo === 'x' ? dialogo.offsetWidth : dialogo.offsetHeight
      const progresso = Math.min(1, Math.abs(deslocamento) / Math.max(tamanho, 1))
      if (reduzido) dialogo.style.opacity = String(1 - progresso * 0.6)
      else dialogo.style.transform = `translate${eixo.toUpperCase()}(${deslocamento}px)`
      fundo.style.setProperty('--modal-escurecido-opacidade', String(1 - progresso))
    }

    const limparEstilos = () => {
      dialogo.style.removeProperty('transition')
      dialogo.style.removeProperty('transform')
      dialogo.style.removeProperty('opacity')
      fundo.style.removeProperty('--modal-escurecido-transicao')
      fundo.style.removeProperty('--modal-escurecido-opacidade')
    }

    const voltar = (reduzido: boolean, eixo: 'x' | 'y') => {
      const duracao = reduzido ? DURACAO_FADE : DURACAO_VOLTA
      transicao(duracao, reduzido ? 'ease-out' : CURVA_MOLA, reduzido)
      aplicar(0, reduzido, eixo)
      window.clearTimeout(limpeza)
      limpeza = window.setTimeout(limparEstilos, duracao + 20)
    }

    const fechar = (direcao: 1 | -1, reduzido: boolean, eixo: 'x' | 'y') => {
      fechando = true
      const duracao = reduzido ? DURACAO_FADE : DURACAO_SAIDA
      transicao(duracao, 'ease-in', reduzido)
      if (reduzido) {
        dialogo.style.opacity = '0'
        fundo.style.setProperty('--modal-escurecido-opacidade', '0')
      } else {
        // Sai pela borda da tela na direção do gesto.
        const { top, bottom, left } = dialogo.getBoundingClientRect()
        const { m41, m42 } = new DOMMatrixReadOnly(getComputedStyle(dialogo).transform)
        if (eixo === 'x') aplicar(m41 + window.innerWidth - left, false, eixo)
        else aplicar(m42 + direcao * (direcao > 0 ? window.innerHeight - top : bottom), false, eixo)
        fundo.style.setProperty('--modal-escurecido-opacidade', '0')
      }
      window.clearTimeout(limpeza)
      limpeza = window.setTimeout(() => {
        aoFecharRef.current()
        // Se quem abriu decidiu manter a modal (ex.: confirmação), ela volta.
        window.requestAnimationFrame(() => {
          if (!dialogo.isConnected) return
          fechando = false
          voltar(reduzido, eixo)
        })
      }, duracao)
    }

    const aoTocar = (evento: TouchEvent) => {
      gesto = null
      if (fechando || evento.touches.length !== 1 || toqueIgnorado(evento.target)) return
      const toque = evento.touches[0]
      gesto = {
        inicioX: toque.clientX,
        inicioY: toque.clientY,
        ultimoY: toque.clientY,
        eixo: 'y',
        rolavel: areaRolavel(evento.target as Element, dialogo),
        decidido: false,
        ativo: false,
        direcao: 0,
        origem: 0,
        amostras: [],
        reduzido: movimentoReduzido(),
      }
    }

    const aoMover = (evento: TouchEvent) => {
      if (!gesto) return
      if (evento.touches.length !== 1) {
        if (gesto.ativo) voltar(gesto.reduzido, gesto.eixo)
        gesto = null
        return
      }
      const { clientX: x, clientY: y } = evento.touches[0]

      if (!gesto.decidido) {
        const deltaX = x - gesto.inicioX
        const deltaY = y - gesto.inicioY
        if (Math.abs(deltaX) < FOLGA_DIRECAO && Math.abs(deltaY) < FOLGA_DIRECAO) return
        gesto.decidido = true
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Fora do painel lateral, o horizontal fica para as abas (AbasModal) e áreas que rolam de lado.
          if (!paraOLado || deltaX < 0 || !evento.cancelable || !painelNaDireita(fundo)) {
            gesto = null
            return
          }
          gesto.eixo = 'x'
          gesto.ativo = true
          gesto.direcao = 1
          gesto.origem = gesto.inicioX
          window.clearTimeout(limpeza)
          transicao(0, '', gesto.reduzido)
        }
      }

      if (!gesto.ativo) {
        const passo = y - gesto.ultimoY
        gesto.ultimoY = y
        if (passo === 0) return
        const direcao = passo > 0 ? 1 : -1
        // Fora do limite a rolagem segue normal; o gesto assume quando ela
        // chega ao limite na direção do arrasto (se o navegador deixar cancelar).
        if (!noLimite(gesto.rolavel, direcao) || !evento.cancelable) return
        gesto.ativo = true
        gesto.direcao = gesto.rolavel ? direcao : 0
        gesto.origem = y
        window.clearTimeout(limpeza)
        transicao(0, '', gesto.reduzido)
      }

      evento.preventDefault()
      const posicao = gesto.eixo === 'x' ? x : y
      let distancia = posicao - gesto.origem
      // Com rolagem, só anda para o lado do limite (voltar o dedo não empurra o conteúdo).
      if (gesto.direcao > 0) distancia = Math.max(0, distancia)
      if (gesto.direcao < 0) distancia = Math.min(0, distancia)
      const limite = gesto.eixo === 'x' ? window.innerWidth : window.innerHeight
      aplicar(elastico(distancia, limite), gesto.reduzido, gesto.eixo)

      gesto.amostras.push({ posicao, tempo: evento.timeStamp })
      while (
        gesto.amostras.length > 2 &&
        evento.timeStamp - gesto.amostras[0].tempo > JANELA_VELOCIDADE
      ) {
        gesto.amostras.shift()
      }
    }

    const aoSoltar = (evento: TouchEvent) => {
      const atual = gesto
      gesto = null
      if (!atual?.ativo) return

      const ultima = atual.amostras[atual.amostras.length - 1]
      const primeira = atual.amostras[0]
      const distancia = (ultima?.posicao ?? atual.origem) - atual.origem
      const intervalo = ultima && primeira ? (ultima.tempo - primeira.tempo) / 1000 : 0
      const velocidade = intervalo > 0 ? (ultima.posicao - primeira.posicao) / intervalo : 0
      const direcao = distancia >= 0 ? 1 : -1
      const longe = Math.abs(distancia) > LIMIAR_DISTANCIA
      const rapido = Math.abs(velocidade) > LIMIAR_VELOCIDADE && Math.sign(velocidade) === direcao

      if (evento.type === 'touchend' && distancia !== 0 && (longe || rapido)) {
        fechar(direcao, atual.reduzido, atual.eixo)
      } else {
        voltar(atual.reduzido, atual.eixo)
      }
    }

    dialogo.addEventListener('touchstart', aoTocar, { passive: true })
    // Não passivo: precisa cancelar a rolagem enquanto a modal acompanha o dedo.
    dialogo.addEventListener('touchmove', aoMover, { passive: false })
    dialogo.addEventListener('touchend', aoSoltar)
    dialogo.addEventListener('touchcancel', aoSoltar)
    return () => {
      window.clearTimeout(limpeza)
      dialogo.removeEventListener('touchstart', aoTocar)
      dialogo.removeEventListener('touchmove', aoMover)
      dialogo.removeEventListener('touchend', aoSoltar)
      dialogo.removeEventListener('touchcancel', aoSoltar)
    }
  }, [dialogoRef, fundoRef, paraOLado])
}
