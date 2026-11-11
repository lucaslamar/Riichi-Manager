import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CADEIRAS, KANJI_VENTO, ventoDaCadeira, type Cadeira } from '../../logica/partida'
import '../mesa.css'

/** Quanto dura o giro da mesa quando o dealer troca. */
const DURACAO_GIRO_MS = 700

interface LadoMesa {
  placa: ReactNode
  /** Conteúdo da ranhura do palito de Riichi. */
  ranhura?: ReactNode
}

interface PropsMesaQuadrada {
  cadeiraDealer: Cadeira
  lado: (cadeira: Cadeira) => LadoMesa
  domo: ReactNode
  /** Graus para girar a mesa inteira, sem mudar o layout em volta. */
  giro?: number
  /** Toque em qualquer ponto da mesa. O domo continua sendo o acesso por teclado. */
  aoTocarMesa?: () => void
  /** Com ação, o domo vira botão (ex.: pausar o timer); o toque não chega à mesa. */
  aoTocarDomo?: () => void
  rotuloDomo?: string
  /** Sanma: as 3 cadeiras com jogador. A que sobra mostra `ladoVazio`. */
  cadeiras?: readonly Cadeira[]
  /** Painel neutro no lado sem jogador (rodada, honba, palitos), no lugar de um buraco. */
  ladoVazio?: ReactNode
}

/**
 * Centerpiece de mesa automática: feltro, painel quadrado, 4 lados e disco central.
 * Cada lado é a mesma camada quadrada, escrita para o lado de baixo e girada, então
 * os 4 ficam idênticos. A ordem no DOM segue os ventos (東 南 西 北), para o leitor de
 * tela e o foco não dependerem da rotação.
 */
export default function MesaQuadrada({
  cadeiraDealer,
  lado,
  domo,
  aoTocarMesa,
  giro = 0,
  aoTocarDomo,
  rotuloDomo,
  cadeiras = CADEIRAS,
  ladoVazio,
}: PropsMesaQuadrada) {
  const jogadores = cadeiras.length === 3 ? 3 : 4
  const { t } = useI18n()
  const painelRef = useRef<HTMLDivElement>(null)
  const dealerAnterior = useRef(cadeiraDealer)

  // Troca de dealer: a mesa já nasce com o novo dealer, mas começa girada onde o 東
  // estava e volta a zero, então o 東 anda até o novo dealer (90° por cadeira),
  // como na ajuda. Renchan não gira. Com movimento reduzido, só troca.
  useLayoutEffect(() => {
    const passos = (cadeiraDealer - dealerAnterior.current + 4) % 4
    dealerAnterior.current = cadeiraDealer
    const painel = painelRef.current
    if (!passos || !painel || typeof painel.animate !== 'function') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    painel.animate([{ transform: `rotate(${passos * 90}deg)` }, { transform: 'rotate(0deg)' }], {
      duration: DURACAO_GIRO_MS,
      easing: 'ease-in-out',
    })
  }, [cadeiraDealer])

  return (
    <div
      className={`mesa-feltro${aoTocarMesa ? ' mesa-feltro--tocavel' : ''}`}
      style={giro ? { transform: `rotate(${giro}deg)` } : undefined}
      onClick={aoTocarMesa}
    >
      <div ref={painelRef} className="mesa-painel">
        <div className="mesa-disco" aria-hidden="true" />
        {CADEIRAS.map((passo) => {
          const cadeira = ((cadeiraDealer + passo) % 4) as Cadeira
          if (!cadeiras.includes(cadeira)) {
            return (
              <div key={cadeira} className={`mesa-lado mesa-lado--${cadeira} mesa-lado--vazio`}>
                <div className="mesa-lugar-placa">{ladoVazio}</div>
              </div>
            )
          }
          const vento = ventoDaCadeira(cadeira, cadeiraDealer, jogadores)
          const { placa, ranhura } = lado(cadeira)
          return (
            <div key={cadeira} className={`mesa-lado mesa-lado--${cadeira}`}>
              <span className={`mesa-anel-vento mesa-vento--${vento}`} aria-hidden="true">
                {KANJI_VENTO[vento]}
              </span>
              <div className="mesa-ranhura">{ranhura}</div>
              <div className="mesa-lugar-placa">{placa}</div>
            </div>
          )
        })}
        {aoTocarDomo ? (
          <button
            type="button"
            className="mesa-domo"
            aria-label={rotuloDomo}
            onClick={(evento) => {
              evento.stopPropagation()
              aoTocarDomo()
            }}
          >
            {domo}
          </button>
        ) : (
          <div className="mesa-domo" aria-label={t('match.table.center')}>
            {domo}
          </div>
        )}
      </div>
    </div>
  )
}
