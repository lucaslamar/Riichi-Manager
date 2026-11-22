import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { FormatoTorneio } from '../../logica/tipos'

/** Conteúdo do ? do Formato: o que é cada um e para quem é indicado. */
export default function GuiaFormatos({
  formatos,
  atual,
  porMesa,
}: {
  formatos: readonly FormatoTorneio[]
  atual: FormatoTorneio
  porMesa: 3 | 4
}) {
  const { t } = useI18n()
  return (
    <>
      <p>
        <strong>{t('tournament.formatGuide.intro')}</strong>
      </p>
      <ul className="trn-guia-formatos">
        {formatos.map((tipo) => (
          <li key={tipo} aria-current={tipo === atual ? 'true' : undefined}>
            <strong>{t(`tournament.formats.${tipo}`)}</strong>
            <span>{t(`tournament.formatGuide.${tipo}.what`)}</span>
            <span>{t(`tournament.formatGuide.${tipo}.for`)}</span>
          </li>
        ))}
      </ul>
      <p>{t(porMesa === 3 ? 'tournament.settings.multipleOfThree' : 'tournament.settings.multipleOfFour')}</p>
    </>
  )
}
