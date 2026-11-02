import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import type { CodigoPedra, Meld } from '@/dominios/calculadora-mao/logica/tipos'
import { descreverPedra } from '../../logica/descreverPedras'

/** Mão numa linha: pedras fechadas, chamadas separadas e a batida destacada. */
export default function LinhaPedras({
  pedras,
  melds = [],
  batida,
  grande = false,
}: {
  pedras: readonly CodigoPedra[]
  melds?: readonly Meld[]
  batida?: CodigoPedra
  grande?: boolean
}) {
  const { t } = useI18n()
  const nomes = [
    ...pedras.map((pedra) => descreverPedra(pedra, t)),
    ...melds.map(
      (meld) =>
        `${t(`melds.${meld.tipo}`)}: ${meld.pedras.map((pedra) => descreverPedra(pedra, t)).join(', ')}`,
    ),
    ...(batida ? [t('match.hands.winningTile', { tile: descreverPedra(batida, t) })] : []),
  ].join('; ')

  if (nomes === '') return null

  return (
    <div className={`linha-pedras${grande ? ' linha-pedras--grande' : ''}`} role="img" aria-label={nomes}>
      <span className="linha-pedras-grupo">
        {pedras.map((pedra, indice) => (
          <span key={`${pedra}-${indice}`} className="linha-pedras-pedra">
            <PedraSvg pedra={pedra} />
          </span>
        ))}
      </span>
      {melds.map((meld, indiceMeld) => (
        <span key={indiceMeld} className="linha-pedras-grupo linha-pedras-grupo--chamada">
          {meld.pedras.map((pedra, indice) => (
            <span key={`${pedra}-${indice}`} className="linha-pedras-pedra">
              <PedraSvg
                pedra={pedra}
                virada={meld.tipo === 'kanFechado' && (indice === 0 || indice === 3)}
              />
            </span>
          ))}
        </span>
      ))}
      {batida && (
        <span className="linha-pedras-grupo">
          <span className="linha-pedras-pedra linha-pedras-pedra--batida">
            <PedraSvg pedra={batida} />
          </span>
        </span>
      )}
    </div>
  )
}
