import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { CodigoPedra } from '../../../logica/mao'
import { nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

interface PropsDescartesMao {
  descartes: CodigoPedra[]
  aoRemoverDescarte: (indiceDescarte: number) => void
}

/** Lista os descartes proprios usados pela checagem de furiten. */
export function DescartesMao({ descartes, aoRemoverDescarte }: PropsDescartesMao) {
  const { t } = useI18n()
  if (descartes.length === 0) return null

  return (
    <div className="descartes-selecionados">
      <span>{t('calculator.discardsFuriten')}</span>
      {descartes.map((pedraDescarte, indiceDescarte) => (
        <button
          key={`${pedraDescarte}-${indiceDescarte}`}
          className="chip-pedra descarte"
          type="button"
          title={t('calculator.removeDiscard', { tile: nomePedraAcessivel(pedraDescarte) })}
          aria-label={t('calculator.removeDiscard', {
            tile: nomePedraAcessivel(pedraDescarte),
          })}
          onClick={() => aoRemoverDescarte(indiceDescarte)}
        >
          <PedraSvg pedra={pedraDescarte} />
        </button>
      ))}
    </div>
  )
}
