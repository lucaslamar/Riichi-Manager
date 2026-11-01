import { useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import {
  ajustarHonba,
  proximoDealer,
  repetirDealer,
  SIMPLES_INICIAL,
  type EstadoSimples,
} from '../../logica/centerpieceSimples'
import { CADEIRAS, CHAVE_VENTO, KANJI_VENTO, ventoDaCadeira } from '../../logica/partida'
import { carregarSimples, salvarSimples } from '../../persistencia/repositorioPartidas'
import JogarDados from '../componentes/JogarDados'
import { ModalConfirmacao } from '../componentes/ModaisPartida'

/** Só o centro da mesa: abre direto, sem jogadores, e lembra o estado se o app fechar. */
export default function CenterpieceSimples({ aoVoltar }: { aoVoltar: () => void }) {
  const { t } = useI18n()
  const [estado, setEstado] = useState<EstadoSimples>(() => carregarSimples(armazenamentoLocal))
  const [confirmando, setConfirmando] = useState(false)

  const mudar = (proximo: EstadoSimples) => {
    setEstado(proximo)
    salvarSimples(armazenamentoLocal, proximo)
  }

  return (
    <section className="smp-tela">
      <TituloTela titulo={t('match.simple.title')} aoVoltar={aoVoltar} />

      <div className="smp-mesa">
        {CADEIRAS.map((cadeira) => {
          const vento = ventoDaCadeira(cadeira, estado.cadeiraDealer)
          return (
            <div
              key={cadeira}
              className={`smp-lado smp-lado--${cadeira}${vento === 'leste' ? ' smp-lado--dealer' : ''}`}
              role="img"
              aria-label={t(CHAVE_VENTO[vento])}
            >
              <span aria-hidden="true">{KANJI_VENTO[vento]}</span>
            </div>
          )
        })}

        <div className="smp-centro">
          <strong className="smp-rodada" aria-live="polite">
            {KANJI_VENTO[estado.rodadaVento]}
            {estado.rodadaNumero}
          </strong>
          <div className="smp-honba">
            <button
              type="button"
              className="ptd-btn-icone"
              aria-label={t('match.simple.honbaMinus')}
              disabled={estado.honba === 0}
              onClick={() => mudar(ajustarHonba(estado, -1))}
            >
              <i className="fas fa-minus" aria-hidden="true" />
            </button>
            <span aria-live="polite">
              <span className="sr-only">{t('calculator.honba')} </span>本{estado.honba}
            </span>
            <button
              type="button"
              className="ptd-btn-icone"
              aria-label={t('match.simple.honbaPlus')}
              onClick={() => mudar(ajustarHonba(estado, 1))}
            >
              <i className="fas fa-plus" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="smp-acoes">
        <button type="button" className="btn-primario" onClick={() => mudar(proximoDealer(estado))}>
          {t('match.simple.nextDealer')}
        </button>
        <button type="button" className="btn-primario" onClick={() => mudar(repetirDealer(estado))}>
          {t('match.simple.repeatDealer')}
        </button>
        <JogarDados cadeiraDealer={estado.cadeiraDealer} className="btn-contorno smp-largo" />
        <button type="button" className="btn-contorno smp-largo" onClick={() => setConfirmando(true)}>
          <i className="fas fa-rotate-left" aria-hidden="true" />
          {t('match.simple.restart')}
        </button>
      </div>

      {confirmando && (
        <ModalConfirmacao
          titulo={t('match.simple.restart')}
          texto={t('match.simple.restartHelp')}
          rotuloConfirmar={t('match.simple.restart')}
          aoFechar={() => setConfirmando(false)}
          aoConfirmar={() => {
            mudar(SIMPLES_INICIAL)
            setConfirmando(false)
          }}
        />
      )}
    </section>
  )
}
