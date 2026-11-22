import { useI18n } from '@/compartilhado/i18n/I18nProvider'

const LINHAS = { 8: ['repeats', 'three', 'fewer'], 12: ['repeats', 'three', 'four', 'sixteen'] } as const

/** Conteúdo do ? do Número de rodadas: uma linha por caso, com o do formato em destaque. */
export default function GuiaRodadas({ jogadores, allLeste }: { jogadores: 8 | 12; allLeste: boolean }) {
  const { t } = useI18n()
  const chave = `tournament.idealRounds.guide${jogadores}`
  const destaque = jogadores === 12 ? (allLeste ? 'four' : 'three') : null
  return (
    <>
      <p>
        <strong>{t(`${chave}.title`)}</strong>
      </p>
      <ul className="trn-guia-formatos trn-guia-rodadas">
        {LINHAS[jogadores].map((linha) => (
          <li key={linha} className={linha === destaque ? 'trn-guia-rodadas--atual' : undefined}>
            <strong>{t(`${chave}.${linha}.label`)}</strong>
            <span>{t(`${chave}.${linha}.text`)}</span>
          </li>
        ))}
      </ul>
      <p className="cfg-ajuda">{t(`${chave}.why`)}</p>
    </>
  )
}
