import { useEffect, useId, useRef, type ReactNode } from 'react'
import './abas-modal.css'

/** Distância mínima do dedo, em px, para trocar de aba. */
const DISTANCIA_MINIMA = 60
/** O movimento tem que ser bem mais horizontal que vertical (não briga com a rolagem). */
const PROPORCAO_HORIZONTAL = 1.5

export interface AbaModal<Chave extends string> {
  chave: Chave
  rotulo: string
}

/**
 * Abas dentro do corpo de uma Modal: a fileira fica presa no topo enquanto o
 * conteúdo rola, e deslizar o dedo para o lado passa para a aba vizinha (da
 * última volta para a primeira).
 * Ao trocar de aba o conteúdo volta para o topo.
 */
export default function AbasModal<Chave extends string>({
  abas,
  ativa,
  aoEscolher,
  rotulo,
  colunas = abas.length,
  fixo,
  className,
  children,
}: {
  abas: AbaModal<Chave>[]
  ativa: Chave
  aoEscolher: (chave: Chave) => void
  /** Nome acessível da lista de abas. */
  rotulo: string
  /** Abas por linha; as que sobram quebram para a linha de baixo. */
  colunas?: number
  /** Fica preso junto com as abas, logo abaixo delas (ex.: o campo de busca). */
  fixo?: ReactNode
  className?: string
  children: ReactNode
}) {
  const id = useId()
  const raizRef = useRef<HTMLDivElement>(null)
  const indiceAtivo = abas.findIndex((aba) => aba.chave === ativa)
  const navegar = useRef<(passo: number) => void>(() => {})
  // Em círculo: depois da última aba volta para a primeira, e vice-versa.
  navegar.current = (passo) => {
    const destino = abas[(indiceAtivo + passo + abas.length) % abas.length]
    if (destino) aoEscolher(destino.chave)
  }

  useEffect(() => {
    raizRef.current?.closest('.modal-corpo')?.scrollTo({ top: 0 })
  }, [ativa])

  useEffect(() => {
    const raiz = raizRef.current
    if (!raiz) return
    let inicio: { x: number; y: number } | null = null

    const aoTocar = (evento: TouchEvent) => {
      inicio =
        evento.touches.length === 1
          ? { x: evento.touches[0].clientX, y: evento.touches[0].clientY }
          : null
    }
    const aoSoltar = (evento: TouchEvent) => {
      if (!inicio) return
      const deltaX = evento.changedTouches[0].clientX - inicio.x
      const deltaY = evento.changedTouches[0].clientY - inicio.y
      inicio = null
      if (Math.abs(deltaX) < DISTANCIA_MINIMA) return
      if (Math.abs(deltaX) < Math.abs(deltaY) * PROPORCAO_HORIZONTAL) return
      // Dedo para a esquerda = próxima aba, como virar página.
      navegar.current(deltaX < 0 ? 1 : -1)
    }

    raiz.addEventListener('touchstart', aoTocar, { passive: true })
    raiz.addEventListener('touchend', aoSoltar, { passive: true })
    return () => {
      raiz.removeEventListener('touchstart', aoTocar)
      raiz.removeEventListener('touchend', aoSoltar)
    }
  }, [])

  return (
    <div ref={raizRef} className={['abas-modal', className].filter(Boolean).join(' ')}>
      {/* Topo preso: as abas e o que vier em `fixo` (ex.: a busca) logo abaixo. */}
      <div className="abas-modal__topo">
        <div
          className="abas-modal__lista"
          role="tablist"
          aria-label={rotulo}
          style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
        >
          {abas.map(({ chave, rotulo: rotuloAba }) => (
            <button
              key={chave}
              id={`${id}-aba-${chave}`}
              type="button"
              role="tab"
              aria-selected={ativa === chave}
              aria-controls={`${id}-painel`}
              className={`abas-modal__aba${ativa === chave ? ' abas-modal__aba--ativa' : ''}`}
              onClick={() => aoEscolher(chave)}
            >
              {rotuloAba}
            </button>
          ))}
        </div>
        {fixo && <div className="abas-modal__fixo">{fixo}</div>}
      </div>
      <div
        id={`${id}-painel`}
        className="abas-modal__painel"
        role="tabpanel"
        aria-labelledby={`${id}-aba-${ativa}`}
      >
        {children}
      </div>
    </div>
  )
}
