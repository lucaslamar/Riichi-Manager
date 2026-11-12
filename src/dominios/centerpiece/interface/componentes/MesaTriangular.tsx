import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CADEIRAS_SANMA, type Cadeira } from '../../logica/partida'
import '../mesa.css'

/** Quanto dura o giro quando a banca passa. */
const DURACAO_GIRO_MS = 700

interface PropsMesaTriangular {
  cadeiraDealer: Cadeira
  /** Placa de cada lado (vento e somas dos dados). */
  placa: (cadeira: Cadeira) => ReactNode
  domo: ReactNode
  /** Graus da orientação do celular, como na mesa quadrada. */
  giro?: number
  aoTocarMesa?: () => void
}

/**
 * Peça do meio do Sanma: um triângulo com um vento em cada lado, para deixar no
 * centro da mesa de 3. Fica parada, com cada lado virado para um jogador: quem
 * gira é o celular. Quando a banca passa (Próxima rodada), o 東 anda até o novo
 * dealer, 120° por cadeira, como na mesa quadrada.
 */
export default function MesaTriangular({ cadeiraDealer, placa, domo, giro = 0, aoTocarMesa }: PropsMesaTriangular) {
  const { t } = useI18n()
  const pecaRef = useRef<HTMLDivElement>(null)
  const dealerAnterior = useRef(cadeiraDealer)

  useLayoutEffect(() => {
    const passos = (cadeiraDealer - dealerAnterior.current + 3) % 3
    dealerAnterior.current = cadeiraDealer
    const peca = pecaRef.current
    if (!passos || !peca || typeof peca.animate !== 'function') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    peca.animate([{ transform: `rotate(${passos * 120}deg)` }, { transform: 'rotate(0deg)' }], {
      duration: DURACAO_GIRO_MS,
      easing: 'ease-in-out',
    })
  }, [cadeiraDealer])

  return (
    <div className="mesa-tri">
      <div
        className={`mesa-tri-caixa${aoTocarMesa ? ' mesa-feltro--tocavel' : ''}`}
        style={giro ? { transform: `rotate(${giro}deg)` } : undefined}
        onClick={aoTocarMesa}
      >
        <div ref={pecaRef} className="mesa-tri-peca">
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
        </div>
        <div className="mesa-tri-domo mesa-domo" aria-label={t('match.table.center')}>
          {domo}
        </div>
      </div>
    </div>
  )
}
