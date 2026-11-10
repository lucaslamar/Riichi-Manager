import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { FiltroTipoMesa } from '../../logica/tipoDaMesa'

const TIPOS: readonly FiltroTipoMesa[] = ['todas', 'avulsa', 'clube', 'torneio']

/** Todas · Partidas · Clube · Torneios, em etiquetas pequenas (Em andamento e Histórico). */
export default function FiltroTipo({
  valor,
  aoMudar,
}: {
  valor: FiltroTipoMesa
  aoMudar: (tipo: FiltroTipoMesa) => void
}) {
  const { t } = useI18n()
  return (
    <div className="ptd-filtro-tipo" role="group" aria-label={t('match.types.label')}>
      {TIPOS.map((opcao) => (
        <button
          key={opcao}
          type="button"
          className={`ptd-filtro-tipo-opcao${valor === opcao ? ' ptd-filtro-tipo-opcao--ativa' : ''}`}
          aria-pressed={valor === opcao}
          onClick={() => aoMudar(opcao)}
        >
          {t(`match.types.${opcao}`)}
        </button>
      ))}
    </div>
  )
}
