import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { fanMcrPorId } from '@/compartilhado/mahjong/mcr/fans-mcr'
import '@/dominios/calculadora-mao/interface/modais/yakus/modal-yakus.css'
import { PedraFlor } from '@/dominios/calculadora-mao-chinesa/interface/PedraChinesa'
import type { Flor } from '@/dominios/calculadora-mao-chinesa/logica/montagem'
import { CartaoFanMcr } from '@/dominios/guia-bolso/mcr/ConteudoGuiaMcr'

const FLORES: Flor[] = [1, 2, 3, 4, 5, 6, 7, 8]

/** Os cartões do Guia de bolso dentro do livro. Um fan citado abre por cima. */
export default function BlocoFansMcr({ ids }: { ids: number[] }) {
  const { t } = useI18n()
  const [citado, setCitado] = useState<number | null>(null)
  const fanCitado = citado === null ? undefined : fanMcrPorId(citado)

  return (
    <div className="yaku-lista guia-fans-mcr">
      {ids.map((id) => {
        const fan = fanMcrPorId(id)
        return fan && <CartaoFanMcr key={id} fan={fan} aoIrPara={setCitado} />
      })}
      {fanCitado && (
        <Modal
          titulo={fanCitado.pt}
          aoFechar={() => setCitado(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <CartaoFanMcr fan={fanCitado} aoIrPara={setCitado} />
        </Modal>
      )}
    </div>
  )
}

export function BlocoFloresMcr({ legenda }: { legenda?: string }) {
  return (
    <figure className="guia-mao guia-flores-mcr">
      <div className="guia-flores-mcr__pedras">
        {FLORES.map((flor) => (
          <span key={flor} className="chip-pedra guia-flores-mcr__pedra">
            <PedraFlor flor={flor} />
          </span>
        ))}
      </div>
      {legenda && <figcaption className="guia-mao__legenda">{legenda}</figcaption>}
    </figure>
  )
}
