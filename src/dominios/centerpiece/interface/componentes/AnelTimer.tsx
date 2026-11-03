import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Circunferência do anel (raio 22 no viewBox de 48). */
const CIRCUNFERENCIA = 2 * Math.PI * 22

/** Tempo que resta da vez, igual na placa do jogador e no modal de descarte. */
export default function AnelTimer({
  segundos,
  fracao,
  esgotado = false,
  aoTocar,
}: {
  segundos: number
  fracao: number
  esgotado?: boolean
  /** Na placa, o toque no anel é o mesmo da placa. */
  aoTocar?: () => void
}) {
  const { t } = useI18n()
  return (
    <span
      className={`mesa-timer${esgotado ? ' mesa-timer--esgotado' : ''}`}
      role="timer"
      aria-label={t('match.timer.remaining', { seconds: segundos })}
      onClick={aoTocar}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="mesa-timer-fundo" cx="24" cy="24" r="22" />
        <circle
          className="mesa-timer-progresso"
          cx="24"
          cy="24"
          r="22"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
        />
      </svg>
      <span aria-hidden="true">{segundos}</span>
    </span>
  )
}
