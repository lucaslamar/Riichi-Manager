import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { CodigoVento, VentoMesa, VentoSorteado } from '../../logica/tipos'

interface PropsCardVento {
  vento: VentoMesa
  ventoAnimado: CodigoVento | null
  ventoSorteado: VentoSorteado | undefined
}

export default function CardVento({ vento, ventoAnimado, ventoSorteado }: PropsCardVento) {
  const { t } = useI18n()

  const animando = ventoAnimado === vento.codigo
  const sorteado = ventoSorteado !== undefined

  let estadoClasse = 'disponivel'
  if (animando) estadoClasse = 'animando'
  else if (sorteado) estadoClasse = 'sorteado'

  const nomeVento = t(vento.chaveNome)
  const statusTexto = sorteado
    ? t('windDraw.drawOrder', { order: String(ventoSorteado.ordem) })
    : t('windDraw.available')

  const ariaLabel = t('windDraw.cardLabel', { wind: nomeVento, status: statusTexto })

  return (
    <div
      className={`card-vento card-vento--${vento.codigo} card-vento--${estadoClasse}`}
      aria-label={ariaLabel}
      aria-disabled={sorteado}
    >
      <span className="card-vento__kanji" aria-hidden="true">
        {vento.kanji}
      </span>
      <span className="card-vento__nome">{nomeVento}</span>
      <span className="card-vento__status">{statusTexto}</span>
      {sorteado && (
        <span className="card-vento__ordem" aria-hidden="true">
          {ventoSorteado.ordem}
        </span>
      )}
    </div>
  )
}
