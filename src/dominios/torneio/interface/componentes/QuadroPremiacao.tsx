import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { premiacaoDe } from '../../logica/premiacao'
import type { ConfigPremiacao } from '../../logica/tipos'
import { useDinheiro } from '../hooks/useDinheiro'

/** A conta da premiação, com a lista do momento. */
export default function QuadroPremiacao({ config, jogadores }: { config: ConfigPremiacao; jogadores: number }) {
  const { t, idioma } = useI18n()
  const emMoeda = useDinheiro()
  const resultado = premiacaoDe(config, jogadores)
  if (!resultado) return null

  const dinheiro = (valor: number) => emMoeda(valor, config.moeda)
  const percentual = (fracao: number) =>
    new Intl.NumberFormat(idioma, { style: 'percent', maximumFractionDigits: 1 }).format(fracao)
  const antecipados = Math.min(config.antecipada?.quantidade ?? 0, jogadores)

  return (
    <>
      <dl className="trn-quadro-premio" aria-live="polite">
        <div>
          <dt>
            {antecipados > 0
              ? t('tournament.prize.totalMixed', { count: jogadores })
              : t('tournament.prize.total', { players: jogadores, fee: dinheiro(config.inscricao) })}
          </dt>
          <dd>{dinheiro(resultado.total)}</dd>
        </div>
        <div>
          <dt>
            {t('tournament.prize.clubLine', { percent: percentual(config.parteClube) })}
            {resultado.arredondamento > 0 && (
              <small>{t('tournament.prize.rounding', { value: dinheiro(resultado.arredondamento) })}</small>
            )}
          </dt>
          <dd>{dinheiro(resultado.clube + resultado.arredondamento)}</dd>
        </div>
        <div>
          <dt>{t('tournament.prize.poolLine', { percent: percentual(1 - config.parteClube) })}</dt>
          <dd>{dinheiro(resultado.premio)}</dd>
        </div>
        {resultado.posicoes.map((posicao) => (
          <div key={posicao.posicao} className="trn-quadro-posicao">
            <dt>
              {t('tournament.podiumGap.ordinal', { place: posicao.posicao })} ({percentual(posicao.percentual / 100)})
            </dt>
            <dd>{dinheiro(posicao.valor)}</dd>
          </div>
        ))}
        {config.parcelas > 1 && (
          <div>
            <dt>{t('tournament.prize.installments')}</dt>
            <dd>{t('tournament.prize.installmentLine', { count: config.parcelas, value: dinheiro(resultado.parcela) })}</dd>
          </div>
        )}
      </dl>
      {resultado.faltamJogadores > 0 && (
        <p className="cfg-ajuda" role="status">
          {t('tournament.prize.missing', { count: resultado.faltamJogadores, min: config.minimoJogadores })}
        </p>
      )}
    </>
  )
}
