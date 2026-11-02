import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { descartesDe, type Lance } from '../../logica/descartes'
import { descreverPedra, descreverRio } from '../../logica/descreverPedras'
import type { Cadeira } from '../../logica/partida'

/** Para onde a seta aponta: a posição de quem chamou, vista de quem descartou. */
const SETA_POR_POSICAO: Record<number, string> = {
  1: 'fa-arrow-right',
  2: 'fa-arrow-up',
  3: 'fa-arrow-left',
}

/**
 * Rio de um jogador, em linhas de 6 e na ordem, como na mesa: a pedra de Riichi fica
 * deitada e a chamada, atenuada, com a seta para quem chamou. Com `destacarAposRiichi`,
 * marca o que saiu depois do Riichi, para quem está decidindo o que é seguro.
 */
export default function RioPedras({
  lances,
  cadeira,
  nomeDe,
  destacarAposRiichi = false,
}: {
  lances: readonly Lance[]
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  destacarAposRiichi?: boolean
}) {
  const { t } = useI18n()
  const descartes = descartesDe(lances, cadeira)
  if (descartes.length === 0) return <p className="ptd-vazio">{t('match.discards.empty')}</p>

  const indiceRiichi = descartes.findIndex((descarte) => descarte.riichi)

  return (
    <>
      {destacarAposRiichi && indiceRiichi >= 0 && (
        <p className="dsc-riichi-desde">{t('match.discards.riichiSince', { order: indiceRiichi + 1 })}</p>
      )}
      <ol className="dsc-rio" aria-label={descreverRio(nomeDe(cadeira), descartes, nomeDe, t)}>
        {descartes.map((descarte, indice) => {
          const classes = [
            'chip-pedra',
            'dsc-pedra',
            descarte.riichi ? 'dsc-pedra--riichi' : '',
            descarte.chamadaPor ? 'dsc-pedra--chamada' : '',
            destacarAposRiichi && indiceRiichi >= 0 && indice > indiceRiichi ? 'dsc-pedra--apos-riichi' : '',
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
          const seta = descarte.chamadaPor
            ? SETA_POR_POSICAO[(descarte.chamadaPor.cadeira - cadeira + 4) % 4]
            : undefined
          return (
            <li key={descarte.ordem} className="dsc-rio-lugar">
              <span className={classes} role="img" aria-label={nome}>
                <PedraSvg pedra={descarte.pedra} />
              </span>
              {seta && <i className={`fas ${seta} dsc-pedra-seta`} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </>
  )
}
