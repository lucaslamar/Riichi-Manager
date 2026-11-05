import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import { KANJI_VENTO, ORDEM_VENTOS, type Cadeira } from '../../logica/partida'
import '../cena-mesa.css'

/**
 * Cenas animadas da ajuda do Centerpiece simples: uma mesa em miniatura, com as
 * cores da mesa de verdade, e um anel onde o dedo toca. Cadeira 0 é a de baixo
 * (quem segura o celular), 1 a da direita, 2 a de cima e 3 a da esquerda, como
 * 東 南 西 北 na mesa de verdade.
 */
export type NomeCenaMesa = 'timer' | 'acoes' | 'honba'

type ChaveLegendaMesa =
  | 'timerTap'
  | 'timerRuns'
  | 'timerOut'
  | 'timerNext'
  | 'tapTable'
  | 'nextRound'
  | 'dealerMoved'
  | 'rotate'
  | 'honbaPlus'
  | 'honbaUp'

interface QuadroMesa {
  dealer: Cadeira
  rodada: number
  honba: number
  /** Segundos no centro; sem ele, o centro mostra a rodada grande. */
  timer?: number
  esgotado?: boolean
  /** Graus para girar a mesa, como quando o celular gira para o novo dealer. */
  giro?: number
  /** Folha de ações aberta. */
  acoes?: boolean
  /** 'placa:0'…'placa:3', 'mesa', 'acao:proxima' ou 'acao:honba'. */
  toque?: string
  legenda: ChaveLegendaMesa
}

const TIMER_CHEIO = 30

const CENAS: Record<NomeCenaMesa, QuadroMesa[]> = {
  timer: [
    { dealer: 0, rodada: 1, honba: 0, timer: TIMER_CHEIO, toque: 'placa:0', legenda: 'timerTap' },
    { dealer: 0, rodada: 1, honba: 0, timer: 12, legenda: 'timerRuns' },
    { dealer: 0, rodada: 1, honba: 0, timer: 0, esgotado: true, legenda: 'timerOut' },
    { dealer: 0, rodada: 1, honba: 0, timer: TIMER_CHEIO, toque: 'placa:1', legenda: 'timerNext' },
  ],
  acoes: [
    { dealer: 0, rodada: 1, honba: 0, toque: 'mesa', legenda: 'tapTable' },
    { dealer: 0, rodada: 1, honba: 0, acoes: true, toque: 'acao:proxima', legenda: 'nextRound' },
    { dealer: 1, rodada: 2, honba: 0, legenda: 'dealerMoved' },
    // O novo dealer está à direita: girar 90° no sentido horário o traz para baixo.
    { dealer: 1, rodada: 2, honba: 0, giro: 90, legenda: 'rotate' },
  ],
  honba: [
    { dealer: 0, rodada: 1, honba: 0, toque: 'mesa', legenda: 'tapTable' },
    { dealer: 0, rodada: 1, honba: 0, acoes: true, toque: 'acao:honba', legenda: 'honbaPlus' },
    { dealer: 0, rodada: 1, honba: 1, legenda: 'honbaUp' },
  ],
}

const DURACAO_QUADRO_MS = 1600
const DURACAO_ULTIMO_QUADRO_MS = 2800
const CADEIRAS_CENA: Cadeira[] = [0, 1, 2, 3]

export default function CenaMesa({ nome }: { nome: NomeCenaMesa }) {
  const { t } = useI18n()
  const quadros = CENAS[nome]
  const semMovimento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [indice, setIndice] = useState(0)
  const ultimo = quadros.length - 1

  useEffect(() => {
    if (semMovimento) return
    const espera = indice === ultimo ? DURACAO_ULTIMO_QUADRO_MS : DURACAO_QUADRO_MS
    const timer = window.setTimeout(() => setIndice((atual) => (atual >= ultimo ? 0 : atual + 1)), espera)
    return () => window.clearTimeout(timer)
  }, [indice, ultimo, semMovimento])

  const passos = quadros.map((quadro) => t(`match.simple.demo.${quadro.legenda}`))
  const quadro = quadros[semMovimento ? ultimo : indice]
  const toque = semMovimento ? undefined : quadro.toque
  const tocando = (alvo: string) => (toque === alvo ? ' cena-mesa__tocando' : '')
  const rodada = `${KANJI_VENTO.leste}${quadro.rodada}`

  return (
    <figure className="cena-mesa" aria-label={passos.join('. ')}>
      <div className={`cena-mesa__palco${tocando('mesa')}`} aria-hidden="true">
        {/* Só o giro de ida anima: ao recomeçar a cena, a mesa volta direto, sem girar para trás. */}
        <div
          className={`cena-mesa__mesa${quadro.giro ? ' cena-mesa__mesa--girando' : ''}`}
          style={{ transform: `rotate(${quadro.giro ?? 0}deg)` }}
        >
          {CADEIRAS_CENA.map((cadeira) => {
            const vento = ORDEM_VENTOS[(cadeira - quadro.dealer + 4) % 4]
            return (
              <span
                key={cadeira}
                className={`cena-mesa__placa cena-mesa__placa--${cadeira}${
                  vento === 'leste' ? ' cena-mesa__placa--dealer' : ''
                }${tocando(`placa:${cadeira}`)}`}
              >
                <strong className={`mesa-led-vento--${vento}`}>{KANJI_VENTO[vento]}</strong>
              </span>
            )
          })}
          <span className={`cena-mesa__domo${quadro.esgotado ? ' cena-mesa__domo--esgotado' : ''}`}>
            {quadro.timer !== undefined ? (
              <>
                <svg viewBox="0 0 48 48">
                  <circle className="cena-mesa__anel-fundo" cx="24" cy="24" r="21" />
                  <circle
                    className="cena-mesa__anel"
                    cx="24"
                    cy="24"
                    r="21"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={100 - (quadro.timer / TIMER_CHEIO) * 100}
                  />
                </svg>
                <b>{quadro.timer}</b>
                <small>
                  {rodada} 本{quadro.honba}
                </small>
              </>
            ) : (
              <>
                <b>{rodada}</b>
                <small>本{quadro.honba}</small>
              </>
            )}
          </span>
        </div>

        {quadro.acoes && (
          <div className="cena-mesa__acoes">
            <strong>{t('match.simple.actions')}</strong>
            <span className={`cena-mesa__acao cena-mesa__acao--principal${tocando('acao:proxima')}`}>
              {t('match.simple.nextRound')}
            </span>
            <span className="cena-mesa__acao cena-mesa__acao--honba">
              {t('match.simple.honba')}
              <span className="cena-mesa__honba-botoes">
                <span>−</span>
                <span className={`cena-mesa__mais${tocando('acao:honba')}`}>+</span>
              </span>
            </span>
          </div>
        )}
      </div>

      {semMovimento ? (
        <ol className="cena-mesa__passos">
          {passos.map((passo, posicao) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
            <li key={posicao}>{passo}</li>
          ))}
        </ol>
      ) : (
        <figcaption className="cena-mesa__legenda" aria-hidden="true">
          <span className="cena-mesa__contador">
            {indice + 1}/{quadros.length}
          </span>{' '}
          {passos[indice]}
        </figcaption>
      )}
    </figure>
  )
}
