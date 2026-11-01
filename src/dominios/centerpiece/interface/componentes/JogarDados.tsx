import { useEffect, useRef, useState } from 'react'
import { vibrar } from '@/compartilhado/adaptadores/vibracao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  descreverDados,
  jogarDados,
  passosDaParede,
  type ResultadoDados,
} from '../../logica/dados'
import type { Cadeira } from '../../logica/partida'

const DURACAO_ANIMACAO_MS = 600
/** Cadeira na tela: 0 embaixo, 1 à direita, 2 em cima, 3 à esquerda. */
const SETA_DA_CADEIRA = ['fa-arrow-down', 'fa-arrow-right', 'fa-arrow-up', 'fa-arrow-left']

interface PropsJogarDados {
  cadeiraDealer: Cadeira
  className?: string
  /** Avisa a tela (o timer de vez pausa com a folha aberta). */
  aoMudarAberto?: (aberto: boolean) => void
}

/** Botão "Jogar 2 dados" e a folha com o resultado, a mesma em todas as mesas. */
export default function JogarDados({ cadeiraDealer, className, aoMudarAberto }: PropsJogarDados) {
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
      setResultado(jogarDados(Math.random))
      setRolando(false)
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

  const descricao = resultado ? descreverDados(resultado, t) : ''
  const cadeiraDaParede = resultado
    ? (((cadeiraDealer + passosDaParede(resultado.parede)) % 4) as Cadeira)
    : null

  return (
    <>
      <button type="button" className={className} onClick={abrir}>
        <i className="fas fa-dice" aria-hidden="true" />
        {t('match.dice.roll')}
      </button>

      {aberto && (
        <Modal
          titulo={t('match.dice.title')}
          aoFechar={fechar}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          className="modal-folha"
          rodape={
            <div className="ptd-acoes-folha">
              <button type="button" className="btn-primario" onClick={jogar} disabled={rolando}>
                {t('match.dice.rollAgain')}
              </button>
            </div>
          }
        >
          <div className="ptd-dados" aria-live="polite">
            {rolando || !resultado ? (
              <div className="ptd-dados-par" aria-hidden="true">
                <span className="ptd-dado ptd-dado--rolando">
                  <i className="fas fa-dice-five" />
                </span>
                <span className="ptd-dado ptd-dado--rolando">
                  <i className="fas fa-dice-two" />
                </span>
              </div>
            ) : (
              <div role="img" aria-label={descricao}>
                <div className="ptd-dados-par" aria-hidden="true">
                  <span className="ptd-dado">{resultado.dado1}</span>
                  <span className="ptd-dado">{resultado.dado2}</span>
                  <span className="ptd-dados-soma">= {resultado.soma}</span>
                </div>
                <p className="ptd-dados-parede" aria-hidden="true">
                  <i
                    className={`fas ${SETA_DA_CADEIRA[cadeiraDaParede ?? 0]}`}
                    aria-hidden="true"
                  />
                  {t(`match.dice.wall.${resultado.parede}`)}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
