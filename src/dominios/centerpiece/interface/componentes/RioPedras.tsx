import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { descartesDe, type Lance } from '../../logica/descartes'
import { descreverPedra, descreverRio } from '../../logica/descreverPedras'
import type { Cadeira } from '../../logica/partida'

/** Rio de um jogador, em ordem; a pedra chamada fica atenuada, como na mesa. */
export default function RioPedras({
  lances,
  cadeira,
  nomeDe,
}: {
  lances: readonly Lance[]
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
}) {
  const { t } = useI18n()
  const descartes = descartesDe(lances, cadeira)
  if (descartes.length === 0) return <p className="ptd-vazio">{t('match.discards.empty')}</p>

  return (
    <ol className="dsc-rio" aria-label={descreverRio(nomeDe(cadeira), descartes, nomeDe, t)}>
      {descartes.map((descarte) => {
        const classes = [
          'dsc-pedra',
          descarte.riichi ? 'dsc-pedra--riichi' : '',
          descarte.chamadaPor ? 'dsc-pedra--chamada' : '',
        ]
          .filter(Boolean)
          .join(' ')
        const nome = [
          t('match.discards.tileOrder', { order: descarte.ordem }),
          descreverPedra(descarte.pedra, t),
          ...(descarte.riichi ? [t('spokenTiles.riichiMark')] : []),
          ...(descarte.chamadaPor
            ? [
                t('spokenTiles.calledMark', {
                  name: nomeDe(descarte.chamadaPor.cadeira),
                  call: t(`match.discards.call.${descarte.chamadaPor.tipo}`),
                }),
              ]
            : []),
        ].join(', ')
        return (
          <li key={descarte.ordem}>
            <span className={classes} role="img" aria-label={nome}>
              <PedraSvg pedra={descarte.pedra} deLado={descarte.riichi} />
            </span>
          </li>
        )
      })}
    </ol>
  )
}
