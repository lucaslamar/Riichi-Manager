import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Minutos de atraso no registro da mesa do torneio. Opcional, por isso começa fechado. */
export default function AtrasoRegistro({
  jogadores,
  minutos,
  limite,
  porMinuto,
  aoMudar,
}: {
  jogadores: readonly { id: string; nome: string }[]
  minutos: Readonly<Record<string, number>>
  limite: number
  porMinuto: number
  aoMudar: (jogadorId: string, minutos: number) => void
}) {
  const { t, numero } = useI18n()
  const [aberto, setAberto] = useState(() => Object.values(minutos).some((valor) => valor > 0))

  return (
    <details className="fin-atraso" open={aberto} onToggle={(evento) => setAberto(evento.currentTarget.open)}>
      <summary>{t('tournament.wo.late')}</summary>
      <p className="cfg-ajuda">{t('tournament.wo.lateHelp', { rate: numero(porMinuto), max: limite })}</p>
      {jogadores.map(({ id, nome }) => (
        <label key={id} className="fin-atraso-linha">
          <span>{nome}</span>
          <select value={minutos[id] ?? 0} onChange={(evento) => aoMudar(id, Number(evento.target.value))}>
            {Array.from({ length: limite + 1 }, (_, valor) => (
              <option key={valor} value={valor}>
                {t('tournament.wo.minutesShort', { minutes: valor })}
              </option>
            ))}
          </select>
        </label>
      ))}
    </details>
  )
}
