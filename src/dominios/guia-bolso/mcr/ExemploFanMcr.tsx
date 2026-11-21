import { useMemo } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { fanMcrPorId, type FanMcr } from '@/compartilhado/mahjong/mcr/fans-mcr'
import '@/dominios/calculadora-mao/interface/modais/yakus/pedras-exemplo.css'
import {
  linhasDoResultado,
  pedrasAcesas,
  type PedraNaTela,
} from '@/dominios/calculadora-mao-chinesa/interface/ModalResultadoMcr'
import { PedraChinesa, PedraFlor } from '@/dominios/calculadora-mao-chinesa/interface/PedraChinesa'
import { nomePedra } from '@/dominios/calculadora-mao-chinesa/interface/pedras'
import { pedrasDaChamada } from '@/dominios/calculadora-mao-chinesa/logica/montagem'
import { calcularNotacaoMcr } from '@/dominios/calculadora-mao-chinesa/logica/notacao-mcr'

const CHAVE_VENTO: Record<number, string> = {
  28: 'winds.east',
  29: 'winds.south',
  30: 'winds.west',
  31: 'winds.north',
}

/**
 * Mão de exemplo de um fan no Guia de bolso, no tamanho dos exemplos do Riichi.
 * A mão vem da notação em `fans-mcr.ts` e é calculada pelo motor: as pedras do
 * fan acendem, as outras ficam apagadas, e embaixo vão as condições, os outros
 * fan da mão e o total.
 */
export default function ExemploFanMcr({
  fan,
  aoIrPara,
}: {
  fan: FanMcr
  aoIrPara: (id: number) => void
}) {
  const { t, numero } = useI18n()
  const resultado = useMemo(() => calcularNotacaoMcr(fan.exemplo), [fan.exemplo])
  const { mao, condicoes } = resultado
  const linhas = linhasDoResultado(resultado.fans, resultado.flores)
  const linha = linhas.find((candidata) => candidata.id === fan.id)
  const ocultas = mao.pedras.slice(0, -1)
  const batida = mao.pedras[mao.pedras.length - 1]
  const ordem: PedraNaTela[] = [
    { chave: 'batida', id: batida },
    ...ocultas.map((id, indice) => ({ chave: `oculta-${indice}`, id })),
    ...mao.chamadas.flatMap((chamada, indice) =>
      pedrasDaChamada(chamada).map((id, posicao) => ({
        chave: `chamada-${indice}-${posicao}`,
        id,
      })),
    ),
  ]
  const acesas = linha ? pedrasAcesas(linha.destaque, ordem) : new Set<string>()
  const classe = (chave: string) => `yaku-tile${acesas.has(chave) ? ' destaque-yaku' : ' apagada'}`
  const outros = [...new Set(linhas.map((outra) => outra.id))].filter((id) => id !== fan.id)

  const chips = [
    t(condicoes.forma === 'tsumo' ? 'mcr.condicoes.tsumo' : 'mcr.condicoes.ron'),
    ...(condicoes.ventoRodada !== 28 || condicoes.ventoAssento !== 28
      ? [
          `${t('mcr.condicoes.ventoRodada')}: ${t(CHAVE_VENTO[condicoes.ventoRodada])}`,
          `${t('mcr.condicoes.ventoAssento')}: ${t(CHAVE_VENTO[condicoes.ventoAssento])}`,
        ]
      : []),
    ...(condicoes.ultimaPedra
      ? [
          t(
            condicoes.forma === 'tsumo'
              ? 'mcr.condicoes.ultimaParede'
              : 'mcr.condicoes.ultimoDescarte',
          ),
        ]
      : []),
    ...(condicoes.ultimaDoTipo ? [t('mcr.condicoes.ultimaDoTipo')] : []),
    ...(condicoes.kan
      ? [t(condicoes.forma === 'tsumo' ? 'mcr.condicoes.reposicaoKan' : 'mcr.condicoes.rouboKan')]
      : []),
  ]
  const rotulo = t('guiaBolso.mcr.exemplo', {
    pedras: [...mao.chamadas.flatMap(pedrasDaChamada), ...mao.pedras].map(nomePedra).join(', '),
  })

  return (
    <div className="exemplo-fan-mcr">
      <div className="yaku-tiles" role="img" aria-label={rotulo}>
        {mao.chamadas.map((chamada, indice) => (
          <span key={`chamada-${indice}`} className="yaku-tiles__grupo exemplo-fan-mcr__chamada">
            {pedrasDaChamada(chamada).map((id, posicao) => (
              <span key={posicao} className={classe(`chamada-${indice}-${posicao}`)}>
                <PedraChinesa id={id} />
              </span>
            ))}
          </span>
        ))}
        <span className="yaku-tiles__grupo">
          {ocultas.map((id, indice) => (
            <span key={indice} className={classe(`oculta-${indice}`)}>
              <PedraChinesa id={id} />
            </span>
          ))}
          {/* A batida fecha a linha, com o selo da montagem da mão. */}
          <span className={classe('batida') + ' exemplo-fan-mcr__batida'}>
            <PedraChinesa id={batida} />
            <span className="badge-pedra-agari">{t('calculator.winningTile')}</span>
          </span>
        </span>
        {mao.flores.length > 0 && (
          <span className="yaku-tiles__grupo">
            {mao.flores.map((flor) => (
              <span
                key={flor}
                className={`yaku-tile${acesas.has('flores') ? ' destaque-yaku' : ' apagada'}`}
              >
                <PedraFlor flor={flor} />
              </span>
            ))}
          </span>
        )}
      </div>
      <ul className="exemplo-fan-mcr__chips" aria-label={t('guiaBolso.mcr.condicoes')}>
        {chips.map((chip) => (
          <li key={chip} className="exemplo-fan-mcr__chip">
            {chip}
          </li>
        ))}
      </ul>
      {outros.length > 0 && (
        <p className="exemplo-fan-mcr__outros">
          {t('guiaBolso.mcr.tambemContam')}{' '}
          {outros.map((id, indice) => {
            const outro = fanMcrPorId(id)
            return (
              <span key={id}>
                {indice > 0 && ', '}
                {outro ? (
                  <button type="button" className="fan-mcr__link" onClick={() => aoIrPara(id)}>
                    {outro.pt}
                  </button>
                ) : (
                  t(`mcr.fan.${linhas.find((candidata) => candidata.id === id)?.nomeMotor}`)
                )}
              </span>
            )
          })}
        </p>
      )}
      <p className="exemplo-fan-mcr__total">
        {t('guiaBolso.mcr.totalExemplo', { total: numero(resultado.fanTotal) })}
      </p>
    </div>
  )
}
