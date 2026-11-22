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
import type { FormaDoJogador } from '../logica/forma'
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
  forma,
}: {
  partidas: readonly Partida[]
  jogadorId: string
  escopo: EscopoEstatisticas['tipo']
  modo: ModoJogo
  nome: (jogadorId: string, guardado?: string) => string
  semPosicoes: boolean
  semMaiorDeTodos: boolean
  forma: FormaDoJogador | null
}) {
  const { t, numero } = useI18n()
  const { comSinal, percentual } = useFormatoEstatisticas()

  const [semWo, setSemWo] = useState(false)
  const comWo = partidasComSaida(todas, jogadorId)
  const partidas = semWo && comWo > 0 ? semSaidas(todas) : todas
  const numeros = estatisticasDoJogador(partidas, jogadorId)
  const maiorDeTodos = semMaiorDeTodos ? null : maiorMaoDoEscopo(partidas)
  const { taxas } = numeros

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
        {forma && (
          <div>
            <dt>{t('stats.form.usualShort')}</dt>
            <dd>
              {numero(forma.pontosNaMesa)}
              <small>{t('stats.form.basedOn', { count: forma.jogos })}</small>
            </dd>
          </div>
        )}
        {/* Sem mão lançada (o normal em torneio), o que depende de mão nem aparece. */}
        {taxas && (
          <>
            <div>
              <dt>{t('stats.winRate')}</dt>
              <dd>{percentual(taxas.vitoria)}</dd>
            </div>
            <div>
              <dt>{t('stats.dealInRate')}</dt>
              <dd>{percentual(taxas.dealIn)}</dd>
            </div>
            {modo === 'riichi' && (
              <div>
                <dt>{t('stats.riichiRate')}</dt>
                <dd>{percentual(taxas.riichi)}</dd>
              </div>
            )}
          </>
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

      {(numeros.maior || maiorDeTodos) && (
        <dl className="est-maos">
          {numeros.maior && (
            <div>
              <dt>{t('stats.playerBest')}</dt>
              <dd>
                <TextoMao mao={numeros.maior} />
              </dd>
            </div>
          )}
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
      )}

      {taxas && numeros.partidasComMaos < numeros.partidas && (
        <p className="est-apoio">
          {t('stats.someHands', { count: numeros.partidasComMaos, total: numeros.partidas })}
        </p>
      )}
    </div>
  )
}
