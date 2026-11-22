import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import {
  estatisticasDoJogador,
  maiorMaoDoEscopo,
  partidasComSaida,
  semSaidas,
} from '../logica/estatisticas'
import type { EscopoEstatisticas } from '../logica/escopo'
import TextoMao from './TextoMao'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

const LUGARES = [1, 2, 3, 4] as const

/** Média, taxas, posições e maior mão. */
export default function NumerosJogador({
  partidas: todas,
  jogadorId,
  escopo,
  modo,
  nome,
  semPosicoes,
  semMaiorDeTodos,
}: {
  partidas: readonly Partida[]
  jogadorId: string
  escopo: EscopoEstatisticas['tipo']
  modo: ModoJogo
  nome: (jogadorId: string, guardado?: string) => string
  semPosicoes: boolean
  semMaiorDeTodos: boolean
}) {
  const { t, numero } = useI18n()
  const { comSinal, percentual } = useFormatoEstatisticas()

  const [semWo, setSemWo] = useState(false)
  const comWo = partidasComSaida(todas, jogadorId)
  const partidas = semWo && comWo > 0 ? semSaidas(todas) : todas
  const numeros = estatisticasDoJogador(partidas, jogadorId)
  const maiorDeTodos = semMaiorDeTodos ? null : maiorMaoDoEscopo(partidas)
  const taxa = (valor: number | undefined) => (valor === undefined ? '—' : percentual(valor))

  return (
    <div className="est-numeros">
      {comWo > 0 && (
        <label className="est-filtro-wo">
          <input type="checkbox" checked={semWo} onChange={() => setSemWo(!semWo)} />
          <span>{t('stats.withoutWo', { count: comWo })}</span>
        </label>
      )}
      <dl className="est-metricas">
        <div>
          <dt>{t(escopo === 'torneio' ? 'stats.averageHanchan' : 'stats.averageGame')}</dt>
          <dd>{numeros.mediaPontos === null ? '—' : comSinal(numeros.mediaPontos)}</dd>
        </div>
        <div>
          <dt>{t('stats.winRate')}</dt>
          <dd>{taxa(numeros.taxas?.vitoria)}</dd>
        </div>
        <div>
          <dt>{t('stats.dealInRate')}</dt>
          <dd>{taxa(numeros.taxas?.dealIn)}</dd>
        </div>
        {modo === 'riichi' && (
          <div>
            <dt>{t('stats.riichiRate')}</dt>
            <dd>{taxa(numeros.taxas?.riichi)}</dd>
          </div>
        )}
      </dl>

      {!semPosicoes && (
        <dl className="est-posicoes" aria-label={t('stats.positions')}>
          {LUGARES.map((lugar) => (
            <div key={lugar}>
              <dt>{t('match.result.place', { place: lugar })}</dt>
              <dd>
                {numero(numeros.colocacoes[lugar - 1])}
                <small>
                  {numeros.partidas
                    ? percentual(numeros.colocacoes[lugar - 1] / numeros.partidas)
                    : '—'}
                </small>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <dl className="est-maos">
        <div>
          <dt>{t('stats.playerBest')}</dt>
          <dd>{numeros.maior ? <TextoMao mao={numeros.maior} /> : '—'}</dd>
        </div>
        {maiorDeTodos && (
          <div>
            <dt>{t(`stats.best.${escopo}`)}</dt>
            <dd>
              <TextoMao mao={maiorDeTodos} />
              <small>{nome(maiorDeTodos.jogadorId, maiorDeTodos.nome)}</small>
            </dd>
          </div>
        )}
      </dl>

      {numeros.partidasComMaos < numeros.partidas && (
        <p className="est-apoio">
          {numeros.partidasComMaos === 0
            ? t('stats.noHands')
            : t('stats.someHands', { count: numeros.partidasComMaos, total: numeros.partidas })}
        </p>
      )}
    </div>
  )
}
