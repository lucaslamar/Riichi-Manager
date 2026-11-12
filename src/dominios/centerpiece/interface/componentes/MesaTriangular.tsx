import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CADEIRAS_SANMA, type Cadeira } from '../../logica/partida'
import '../mesa.css'

/** Quanto o toque precisa girar (em graus) para virar arraste e não abrir as ações. */
const LIMIAR_ARRASTE = 6

interface PropsMesaTriangular {
  /** Placa de cada lado (vento e somas dos dados). */
  placa: (cadeira: Cadeira) => ReactNode
  domo: ReactNode
  /** Graus da orientação do celular, como na mesa quadrada. */
  giro?: number
  aoTocarMesa?: () => void
}

/**
 * Peça do meio do Sanma: um triângulo com um vento em cada lado, para deixar no
 * centro da mesa de 3. Gira arrastando com o dedo (o triângulo acompanha o ângulo
 * do toque em volta do centro) ou pelos botões embaixo, de um lado em um lado.
 */
export default function MesaTriangular({ placa, domo, giro = 0, aoTocarMesa }: PropsMesaTriangular) {
  const { t } = useI18n()
  const [angulo, setAngulo] = useState(0)
  const [arrastando, setArrastando] = useState(false)
  const caixaRef = useRef<HTMLDivElement>(null)
  const toque = useRef<{ inicio: number; anguloInicial: number; moveu: boolean } | null>(null)

  const anguloDoPonteiro = (evento: PointerEvent) => {
    const caixa = caixaRef.current?.getBoundingClientRect()
    if (!caixa) return 0
    const x = evento.clientX - (caixa.left + caixa.width / 2)
    const y = evento.clientY - (caixa.top + caixa.height / 2)
    return (Math.atan2(y, x) * 180) / Math.PI
  }

  const aoPressionar = (evento: PointerEvent<HTMLDivElement>) => {
    toque.current = { inicio: anguloDoPonteiro(evento), anguloInicial: angulo, moveu: false }
  }

  const aoMover = (evento: PointerEvent<HTMLDivElement>) => {
    const atual = toque.current
    if (!atual) return
    let delta = anguloDoPonteiro(evento) - atual.inicio
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    if (!atual.moveu && Math.abs(delta) < LIMIAR_ARRASTE) return
    if (!atual.moveu) {
      atual.moveu = true
      setArrastando(true)
      evento.currentTarget.setPointerCapture?.(evento.pointerId)
    }
    setAngulo(atual.anguloInicial + delta)
  }

  const aoSoltar = (evento: PointerEvent<HTMLDivElement>) => {
    const atual = toque.current
    toque.current = null
    if (!atual) return
    if (atual.moveu) {
      setArrastando(false)
      return
    }
    // Toque na placa (com timer) já é tratado por ela.
    if ((evento.target as HTMLElement).closest('button')) return
    aoTocarMesa?.()
  }

  const girar = (passo: number) => setAngulo((atual) => Math.round((atual + passo) / 120) * 120)

  return (
    <div className="mesa-tri">
      <div
        ref={caixaRef}
        className={`mesa-tri-caixa${aoTocarMesa ? ' mesa-feltro--tocavel' : ''}${arrastando ? ' mesa-tri-caixa--arrastando' : ''}`}
        style={{ transform: `rotate(${angulo + giro}deg)` }}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={() => {
          toque.current = null
          setArrastando(false)
        }}
      >
        <svg className="mesa-tri-fundo" viewBox="0 0 100 100" aria-hidden="true">
          <polygon className="mesa-tri-feltro" points="50,0.35 93,74.8 7,74.8" />
          <polygon className="mesa-tri-painel" points="50,6.1 88,71.9 12,71.9" />
        </svg>
        {CADEIRAS_SANMA.map((cadeira, indice) => (
          // A próxima cadeira fica à direita de quem está embaixo: gira no sentido anti-horário.
          <div key={cadeira} className="mesa-tri-lado" style={{ transform: `rotate(${-indice * 120}deg)` }}>
            <div className="mesa-tri-placa">{placa(cadeira)}</div>
          </div>
        ))}
        <div className="mesa-tri-domo mesa-domo" aria-label={t('match.table.center')}>
          {domo}
        </div>
      </div>
      <div className="mesa-tri-giro">
        <button type="button" className="ptd-btn-icone" aria-label={t('match.simple.rotateLeft')} onClick={() => girar(-120)}>
          <i className="fas fa-rotate-left" aria-hidden="true" />
        </button>
        <button type="button" className="ptd-btn-icone" aria-label={t('match.simple.rotateRight')} onClick={() => girar(120)}>
          <i className="fas fa-rotate-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
