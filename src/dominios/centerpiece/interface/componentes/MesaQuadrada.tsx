import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CADEIRAS, KANJI_VENTO, ventoDaCadeira, type Cadeira } from '../../logica/partida'
import '../mesa.css'

export type ModoMesa = 'mesa' | 'lista'

interface LadoMesa {
  placa: ReactNode
  /** Conteúdo da ranhura do palito de Riichi. */
  ranhura?: ReactNode
}

interface PropsMesaQuadrada {
  modo: ModoMesa
  cadeiraDealer: Cadeira
  lado: (cadeira: Cadeira) => LadoMesa
  domo: ReactNode
  /** Com ação, o domo vira botão (ex.: pausar o timer). */
  aoTocarDomo?: () => void
  rotuloDomo?: string
}

/**
 * Centerpiece de mesa automática: feltro, painel quadrado, 4 lados e disco central.
 * Cada lado é a mesma camada quadrada, escrita para o lado de baixo e girada, então
 * os 4 ficam idênticos. No modo lista, as placas ficam sem rotação, lado a lado.
 */
export default function MesaQuadrada({
  modo,
  cadeiraDealer,
  lado,
  domo,
  aoTocarDomo,
  rotuloDomo,
}: PropsMesaQuadrada) {
  const { t } = useI18n()

  if (modo === 'lista') {
    return (
      <div className="mesa-lista">
        <div className="mesa-lista-domo">
          {aoTocarDomo ? (
            <button type="button" className="mesa-domo" aria-label={rotuloDomo} onClick={aoTocarDomo}>
              {domo}
            </button>
          ) : (
            <div className="mesa-domo">{domo}</div>
          )}
        </div>
        <div className="mesa-lista-placas">
          {CADEIRAS.map((cadeira) => (
            <div key={cadeira} className="mesa-lista-item">
              {lado(cadeira).placa}
              {lado(cadeira).ranhura && <div className="mesa-ranhura">{lado(cadeira).ranhura}</div>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mesa-feltro">
      <div className="mesa-painel">
        <div className="mesa-disco" aria-hidden="true" />
        {CADEIRAS.map((cadeira) => {
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
          <button type="button" className="mesa-domo" aria-label={rotuloDomo} onClick={aoTocarDomo}>
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
