import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import { necessidade, pontosDeMesa, tirarPorJogo } from '../logica/viradas'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

/** As mãos que cobrem a diferença de agora, sem olhar o histórico de ninguém. */
export default function MaosSemMedia({
  diferenca,
  lider,
  regras,
  unidades,
  restantes = null,
}: {
  diferenca: number
  lider: string
  regras: RegrasDoModo
  unidades: readonly UnidadeDistancia[]
  /** Jogos que faltam para quem persegue, quando se sabe. */
  restantes?: number | null
}) {
  const { t, numero } = useI18n()
  const { decimal } = useFormatoEstatisticas()
  const emPontos = (valor: number) => numero(pontosDeMesa(valor, regras))
  const porJogo = restantes ? tirarPorJogo(diferenca, restantes) : 0
  const maosPor = (caminho: 'terceiros' | 'direto') =>
    unidades
      .map((unidade) => {
        const precisa = necessidade(diferenca, unidade, regras)
        return precisa.situacao === 'precisa'
          ? t(`tournament.podiumGap.hands.${unidade.id}`, { count: precisa[caminho] })
          : ''
      })
      .join(' · ')

  return (
    <div className="est-bloco">
      <strong className="est-bloco-titulo">
        {t('stats.turn.withoutAverage', {
          value: decimal(diferenca),
          points: emPontos(diferenca),
        })}
      </strong>
      <dl className="est-caminhos">
        <dt>{t('stats.turn.thirdParty')}</dt>
        <dd>{maosPor('terceiros')}</dd>
        <dt>{t('stats.turn.direct', { name: lider })}</dt>
        <dd>{maosPor('direto')}</dd>
      </dl>
      <p className="est-apoio">{t('stats.turn.directHelp')}</p>
      {restantes !== null && restantes > 1 && (
        <p className="est-apoio">
          {t('stats.turn.perGame', {
            games: restantes,
            value: decimal(porJogo),
            points: emPontos(porJogo),
          })}
        </p>
      )}
    </div>
  )
}
