import { useLayoutEffect, useState, type RefObject } from 'react'

const BOLINHAS_POR_TRILHA = 11
const RAIO_PERTO_DO_BALAO = 7.5
const RAIO_PERTO_DA_BOCA = 3
/** Quanto (px) a curva abre para fora (afasta as trilhas da hélice, no meio). */
const ABERTURA_CURVA = 10
const MARGEM_LATERAL = 12

interface Bolinha {
  x: number
  y: number
  r: number
}

interface Medida {
  largura: number
  altura: number
  bolinhas: Bolinha[]
}

/**
 * Posição do elemento dentro da raiz pela cadeia de `offsetParent`. Ignora
 * `transform`, então mede o lugar final do balãozinho mesmo durante o voo.
 */
function posicaoEm(elemento: HTMLElement, raiz: HTMLElement) {
  let x = 0
  let y = 0
  let atual: HTMLElement | null = elemento
  while (atual && atual !== raiz) {
    x += atual.offsetLeft
    y += atual.offsetTop
    atual = atual.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(Math.max(valor, minimo), maximo)
}

/**
 * Bolinhas de balão de pensamento (como nos gibis) ligando a cabeça do gato ao
 * balãozinho do vento que acabou de sair: menores perto da cabeça, maiores
 * perto do balão. Terminam logo fora da cabeça, do lado do balão. Só a trilha do último aparece (as 4 juntas poluíam a tela); a
 * próxima nasce da boca de novo. A raiz precisa ser posicionada.
 */
export default function TrilhasBalao({
  raizRef,
  quantidade,
  completo,
}: {
  raizRef: RefObject<HTMLElement>
  /** Quantos balõezinhos existem (refaz a medida quando muda). */
  quantidade: number
  /** No fim os balõezinhos crescem, então a medida muda também. */
  completo: boolean
}) {
  const [medida, setMedida] = useState<Medida | null>(null)

  useLayoutEffect(() => {
    const raiz = raizRef.current
    if (!raiz) return

    const medir = () => {
      const boca = raiz.querySelector<HTMLElement>('.gato-helice__boca')
      // No fim a trilha sai do balão gigante; antes, do último balãozinho.
      const baloes = raiz.querySelectorAll<HTMLElement>('.sorteio-historico__quadrado')
      const balao = completo
        ? raiz.querySelector<HTMLElement>('.sorteio-historico--completo')
        : baloes[baloes.length - 1]
      if (!boca || !balao) {
        setMedida(null)
        return
      }

      const largura = raiz.clientWidth
      const centro = posicaoEm(boca, raiz)
      const topo = posicaoEm(balao, raiz)
      // No balão gigante, sai mais à direita para a curva contornar a hélice.
      const saida = completo ? 0.8 : 0.5
      const inicio = {
        x: topo.x + balao.offsetWidth * saida,
        y: topo.y + balao.offsetHeight + 4,
      }
      // Termina fora da cabeça, do lado do balão (como nos gibis), em vez de
      // atravessar o boné e o rosto até a boca.
      const lado = inicio.x < centro.x ? 'esquerda' : 'direita'
      const pensamento = raiz.querySelector<HTMLElement>(`.gato-helice__pensamento--${lado}`)
      const fim = pensamento ? posicaoEm(pensamento, raiz) : centro
      // Em pé a curva abre para fora (longe da hélice). Deitado o balão fica
      // mais longe na horizontal: a curva passa por cima, longe do balão de fala.
      const deitado = Math.abs(inicio.x - fim.x) > Math.abs(inicio.y - fim.y)
      const externo = lado === 'esquerda' ? Math.min(inicio.x, fim.x) : Math.max(inicio.x, fim.x)
      const controle = deitado
        ? { x: (inicio.x + fim.x) / 2, y: inicio.y }
        : {
            x: limitar(
              externo + (lado === 'esquerda' ? -1 : 1) * ABERTURA_CURVA,
              MARGEM_LATERAL,
              largura - MARGEM_LATERAL,
            ),
            y: inicio.y + (fim.y - inicio.y) * 0.3,
          }

      // Curva de Bézier quadrática do balão até perto da cabeça.
      const bolinhas = Array.from({ length: BOLINHAS_POR_TRILHA }, (_, indice) => {
        const fracao = indice / (BOLINHAS_POR_TRILHA - 1)
        const passo = 0.05 + fracao * 0.9
        const resto = 1 - passo
        return {
          x: resto * resto * inicio.x + 2 * resto * passo * controle.x + passo * passo * fim.x,
          y: resto * resto * inicio.y + 2 * resto * passo * controle.y + passo * passo * fim.y,
          r: RAIO_PERTO_DO_BALAO - fracao * (RAIO_PERTO_DO_BALAO - RAIO_PERTO_DA_BOCA),
        }
      })

      setMedida({ largura, altura: raiz.clientHeight, bolinhas })
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(raiz)
    return () => observador.disconnect()
  }, [raizRef, quantidade, completo])

  if (!medida) return null

  return (
    <svg
      className="sorteio-trilhas"
      width={medida.largura}
      height={medida.altura}
      viewBox={`0 0 ${medida.largura} ${medida.altura}`}
      aria-hidden="true"
    >
      {/* A chave refaz a trilha (e a animação) a cada vento novo. */}
      <g key={completo ? 'gigante' : quantidade}>
        {medida.bolinhas.map((bolinha, indice) => (
          <circle
            key={indice}
            className="sorteio-trilhas__bolinha"
            cx={bolinha.x}
            cy={bolinha.y}
            r={bolinha.r}
            // Saem da cabeça para fora: a mais perto da cabeça aparece primeiro.
            style={{ animationDelay: `${(BOLINHAS_POR_TRILHA - 1 - indice) * 35}ms` }}
          />
        ))}
      </g>
    </svg>
  )
}
