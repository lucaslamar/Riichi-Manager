import { useEffect, useRef, useState } from 'react'
import { vibrar } from '@/compartilhado/adaptadores/vibracao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  descreverDados,
  jogarDados,
  numerosDaParede,
  passosDaParede,
  type ResultadoDados,
} from '../../logica/dados'
import { CADEIRAS, KANJI_VENTO, ventoDaCadeira, type Cadeira } from '../../logica/partida'

const DURACAO_ANIMACAO_MS = 600

interface PropsJogarDados {
  cadeiraDealer: Cadeira
  className?: string
  /** Avisa a tela (o timer de vez pausa com a folha aberta). */
  aoMudarAberto?: (aberto: boolean) => void
  /** Cadeira da parede sorteada, para a tela também destacar o lado. */
  aoSortear?: (cadeira: Cadeira) => void
  /** Sanma: os ventos giram entre 3. A parede do lado vazio continua lá. */
  jogadores?: 3 | 4
}

/** Botão "Jogar 2 dados" e a folha com o resultado, a mesma em todas as mesas. */
export default function JogarDados({
  cadeiraDealer,
  className,
  aoMudarAberto,
  aoSortear,
  jogadores = 4,
}: PropsJogarDados) {
  const { t } = useI18n()
  const [resultado, setResultado] = useState<ResultadoDados | null>(null)
  const [rolando, setRolando] = useState(false)
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const jogar = () => {
    setRolando(true)
    vibrar(40)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => {
      const novo = jogarDados(Math.random)
      setResultado(novo)
      setRolando(false)
      aoSortear?.(((cadeiraDealer + passosDaParede(novo.parede)) % 4) as Cadeira)
    }, DURACAO_ANIMACAO_MS)
  }

  const aberto = rolando || resultado !== null
  const abrir = () => {
    aoMudarAberto?.(true)
    jogar()
  }
  const fechar = () => {
    window.clearTimeout(temporizador.current)
    setRolando(false)
    setResultado(null)
    aoMudarAberto?.(false)
  }

  const cadeiraDaParede =
    resultado && !rolando
      ? (((cadeiraDealer + passosDaParede(resultado.parede)) % 4) as Cadeira)
      : null

  return (
    <>
      <button type="button" className={className} onClick={abrir}>
        <i className="fas fa-dice" aria-hidden="true" /> {t('match.dice.roll')}
      </button>

      {aberto && (
        <Modal
          titulo={t('match.dice.title')}
          aoFechar={fechar}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <div className="ptd-acoes-folha">
              <button type="button" className="btn-primario" onClick={jogar} disabled={rolando}>
                {t('match.dice.rollAgain')}
              </button>
            </div>
          }
        >
          <div className="ptd-dados" aria-live="polite">
            <div
              className="ptd-mesa-dados"
              role={resultado && !rolando ? 'img' : undefined}
              aria-label={resultado && !rolando ? descreverDados(resultado, t) : undefined}
            >
              {CADEIRAS.map((cadeira) => {
                const passos = (cadeira - cadeiraDealer + 4) % 4
                return (
                  <div
                    key={cadeira}
                    className={`ptd-mesa-dados-lado ptd-mesa-dados-lado--${cadeira}${
                      cadeira === cadeiraDaParede ? ' ptd-mesa-dados-lado--sorteado' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <strong>
                      {jogadores === 3 && cadeira === 3 ? '–' : KANJI_VENTO[ventoDaCadeira(cadeira, cadeiraDealer, jogadores)]}
                    </strong>
                    <span>{numerosDaParede(passos).join(' · ')}</span>
                  </div>
                )
              })}
              <div className="ptd-mesa-dados-centro" aria-hidden="true">
                {rolando || !resultado ? (
                  <>
                    <span className="ptd-dado ptd-dado--rolando">
                      <i className="fas fa-dice-five" />
                    </span>
                    <span className="ptd-dado ptd-dado--rolando">
                      <i className="fas fa-dice-two" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="ptd-dado">{resultado.dado1}</span>
                    <span className="ptd-dado">{resultado.dado2}</span>
                    <strong className="ptd-dados-soma">= {resultado.soma}</strong>
                  </>
                )}
              </div>
            </div>
            {resultado && !rolando && (
              <p className="ptd-dados-parede" aria-hidden="true">
                {t(`match.dice.wall.${resultado.parede}`)}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
