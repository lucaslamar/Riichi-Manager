import { useState, useEffect } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

const TEMPO_PADRAO = 30

export default function TimerMesaGlobal() {
  const { t } = useI18n()
  const [segundos, setSegundos] = useState(TEMPO_PADRAO)
  const [rodando, setRodando] = useState(false)
  const [chave, setChave] = useState(0)

  const esgotado = segundos === 0
  const raio = 15.9
  const circunferencia = 2 * Math.PI * raio
  const progresso = (segundos / TEMPO_PADRAO) * circunferencia
  const classeTempo = segundos <= 5 ? 'urgente' : segundos <= 10 ? 'alerta' : ''

  const aoClicar = () => {
    setSegundos(TEMPO_PADRAO)
    setRodando(true)
    setChave((prev) => prev + 1)
  }

  const pausarRetomar = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    setRodando((rodandoAtual) => !rodandoAtual)
  }

  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) {
          setRodando(false)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [rodando, chave])

  return (
    <div className={`cp-timer${esgotado ? ' cp-timer-esgotado' : ''}${rodando ? ' cp-timer-rodando' : ''}`}>
      <span className="cp-timer-label">{t('centerpiece.timer.label')}</span>
      <div className="cp-timer-controles">
        <button
          type="button"
          className="cp-timer-display"
          onClick={aoClicar}
          aria-label={t('centerpiece.timer.reiniciar')}
          title={t('centerpiece.timer.reiniciar')}
        >
          <svg viewBox="0 0 36 36" className="cp-timer-svg" aria-hidden="true">
            <circle className="cp-timer-trilha" cx="18" cy="18" r={raio} />
            <circle
              className={`cp-timer-progresso${classeTempo ? ` ${classeTempo}` : ''}`}
              cx="18" cy="18" r={raio}
              strokeDasharray={`${progresso} ${circunferencia - progresso}`}
            />
          </svg>
          <span className={`cp-timer-numero${classeTempo ? ` ${classeTempo}` : ''}`} aria-hidden="true">
            {segundos}
          </span>
        </button>
        <button
          type="button"
          className="cp-timer-btn-pausar"
          onClick={pausarRetomar}
          aria-label={rodando ? t('centerpiece.timer.pausar') : t('centerpiece.timer.retomar')}
        >
          <i className={`fas fa-${rodando ? 'pause' : 'play'}`} aria-hidden="true" />
        </button>
      </div>
      {esgotado && (
        <span className="cp-timer-esgotado-msg" role="status" aria-live="assertive">
          {t('centerpiece.timer.esgotado')}
        </span>
      )}
    </div>
  )
}
