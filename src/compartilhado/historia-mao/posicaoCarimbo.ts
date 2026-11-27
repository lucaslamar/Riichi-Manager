import { useLayoutEffect, useState, type RefObject } from 'react'

interface Caixa {
  x: number
  y: number
  w: number
  h: number
}

export interface PosicaoCarimbo {
  x: number
  y: number
  lado: number
}

/** O carimbo pode invadir a lista de yaku em até 35% da área dele. */
const INVASAO_MAXIMA = 0.35
const LADO_MINIMO = 110

/** Fração do círculo que cai dentro da caixa (amostragem em grade). */
function fracaoSobre(cx: number, cy: number, raio: number, caixa: Caixa): number {
  const passos = 24
  let dentro = 0
  let sobre = 0
  for (let i = 0; i < passos; i++) {
    for (let j = 0; j < passos; j++) {
      const x = cx - raio + ((i + 0.5) * 2 * raio) / passos
      const y = cy - raio + ((j + 0.5) * 2 * raio) / passos
      if ((x - cx) ** 2 + (y - cy) ** 2 > raio ** 2) continue
      dentro++
      if (x >= caixa.x && x <= caixa.x + caixa.w && y >= caixa.y && y <= caixa.y + caixa.h) sobre++
    }
  }
  return dentro ? sobre / dentro : 0
}

/**
 * À esquerda do mascote, com o centro um pouco acima da base dele, no maior
 * tamanho (até `ladoMaximo`) que não cobre o topo do resultado (título e
 * pontos), o QR nem passa do painel, e invade os yaku em até 35%. Com
 * `podeSubir` (card dividido), se não couber ao lado do mascote, o carimbo sobe
 * para cima dele e invade mais a lista, ainda sem cobrir título, pontos nem QR.
 * Abaixo de 110px, não cabe (`null`).
 */
export function posicionarCarimbo(
  medidas: {
    painel: { w: number; h: number }
    texto: Caixa
    yaku: Caixa | null
    mascote: Caixa
    qr: Caixa
  },
  ladoMaximo: number,
  podeSubir = false,
): PosicaoCarimbo | null {
  const { painel, texto, yaku, mascote, qr } = medidas
  for (let lado = ladoMaximo; lado >= LADO_MINIMO; lado -= 2) {
    const raio = lado / 2
    const direita = Math.min(mascote.x + mascote.w * 0.12, qr.x - 6)
    const cx = direita - raio
    const cy = Math.min(mascote.y + mascote.h * 0.8, painel.h - raio - 4)
    if (cx - raio < 4) continue
    if (cy - raio < texto.y + texto.h + 4) continue
    if (yaku && fracaoSobre(cx, cy, raio, yaku) > INVASAO_MAXIMA) continue
    return { x: cx - raio, y: cy - raio, lado }
  }
  if (!podeSubir) return null
  for (let lado = ladoMaximo; lado >= LADO_MINIMO; lado -= 2) {
    const raio = lado / 2
    const cx = Math.min(mascote.x + mascote.w / 2, painel.w - raio - 4)
    const cy = mascote.y - raio * 0.6
    if (cx - raio < 4) continue
    if (cy - raio < texto.y + texto.h + 4) continue
    if (cy + raio > qr.y - 4) continue
    return { x: cx - raio, y: cy - raio, lado }
  }
  return null
}

function caixaNoPainel(elemento: HTMLElement | null): Caixa | null {
  if (!elemento) return null
  return {
    x: elemento.offsetLeft,
    y: elemento.offsetTop,
    w: elemento.offsetWidth,
    h: elemento.offsetHeight,
  }
}

/**
 * Mede o painel (caixas sem as transformações das animações) e reposiciona o
 * carimbo quando qualquer parte muda de tamanho.
 */
export function usePosicaoCarimbo(
  painelRef: RefObject<HTMLDivElement>,
  ativo: boolean,
): PosicaoCarimbo | null {
  const [posicao, setPosicao] = useState<PosicaoCarimbo | null>(null)

  useLayoutEffect(() => {
    const painel = painelRef.current
    if (!ativo || !painel) return
    const medir = () => {
      const mascote = painel.querySelector<HTMLElement>('.historia-mao-mascote')
      const qrElemento = painel.querySelector<HTMLElement>('.historia-mao-mascote-qr')
      const texto = caixaNoPainel(painel.querySelector('.historia-mao-painel-texto'))
      const caixaMascote = caixaNoPainel(mascote)
      if (!caixaMascote || !qrElemento || !texto) return setPosicao(null)
      const qr = {
        x: caixaMascote.x + qrElemento.offsetLeft,
        y: caixaMascote.y + qrElemento.offsetTop,
        w: qrElemento.offsetWidth,
        h: qrElemento.offsetHeight,
      }
      // Cada layout diz o tamanho máximo no CSS (160 empilhado, 170 lado a lado, 150 no card).
      const estilo = getComputedStyle(painel)
      const ladoMaximo = parseFloat(estilo.getPropertyValue('--carimbo-max')) || 160
      const podeSubir = estilo.getPropertyValue('--carimbo-sobe').trim() === '1'
      setPosicao(
        posicionarCarimbo(
          {
            painel: { w: painel.clientWidth, h: painel.clientHeight },
            texto,
            yaku: caixaNoPainel(painel.querySelector('.historia-mao-yaku')),
            mascote: caixaMascote,
            qr,
          },
          ladoMaximo,
          podeSubir,
        ),
      )
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(painel)
    painel
      .querySelectorAll('.historia-mao-painel-texto, .historia-mao-yaku, .historia-mao-mascote')
      .forEach((elemento) => observador.observe(elemento))
    return () => observador.disconnect()
  }, [painelRef, ativo])

  return posicao
}
