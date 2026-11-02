import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CADEIRAS, KANJI_VENTO, ventoDaCadeira, type Cadeira } from '../../logica/partida'
import '../mesa.css'

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
}: PropsMesaQuadrada) {
  const { t } = useI18n()

  return (
    <div
      className={`mesa-feltro${aoTocarMesa ? ' mesa-feltro--tocavel' : ''}`}
      style={giro ? { transform: `rotate(${giro}deg)` } : undefined}
      onClick={aoTocarMesa}
    >
      <div className="mesa-painel">
        <div className="mesa-disco" aria-hidden="true" />
        {CADEIRAS.map((passo) => {
          const cadeira = ((cadeiraDealer + passo) % 4) as Cadeira
          const vento = ventoDaCadeira(cadeira, cadeiraDealer)
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
