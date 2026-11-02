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
import { numerosDaParede } from '../../logica/dados'
import { CHAVE_VENTO, KANJI_VENTO, ventoDaCadeira, type Cadeira } from '../../logica/partida'
import { carregarSimples, salvarSimples } from '../../persistencia/repositorioPartidas'
import JogarDados from '../componentes/JogarDados'
import MesaQuadrada from '../componentes/MesaQuadrada'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useModoMesa } from '../hooks/useModoMesa'

/** Só o centro da mesa: abre direto, sem jogadores, e lembra o estado se o app fechar. */
export default function CenterpieceSimples({
  aoVoltar,
  aoAbrirSorteador,
}: {
  aoVoltar: () => void
  aoAbrirSorteador: () => void
}) {
  const { t } = useI18n()
  const { modo, alternar } = useModoMesa()
  const [estado, setEstado] = useState<EstadoSimples>(() => carregarSimples(armazenamentoLocal))
  const [confirmando, setConfirmando] = useState(false)
  // Lado que caiu nos dados; a mão seguinte começa sem destaque.
  const [ladoSorteado, setLadoSorteado] = useState<Cadeira | null>(null)

  const mudar = (proximo: EstadoSimples) => {
    if (proximo.cadeiraDealer !== estado.cadeiraDealer || proximo.rodadaNumero !== estado.rodadaNumero) {
      setLadoSorteado(null)
    }
    setEstado(proximo)
    salvarSimples(armazenamentoLocal, proximo)
  }

  return (
    <section className="mesa-tela mesa-tela--simples">
      <TituloTela titulo={t('match.simple.title')} aoVoltar={aoVoltar} />

      <div className="mesa-centro-tela">
        <MesaQuadrada
          modo={modo}
          cadeiraDealer={estado.cadeiraDealer}
          domo={
            <>
              <span className="mesa-domo-rodada" aria-live="polite">
                {KANJI_VENTO[estado.rodadaVento]}
                {estado.rodadaNumero}
              </span>
              <span className="mesa-domo-info">本{estado.honba}</span>
            </>
          }
          lado={(cadeira) => {
            const vento = ventoDaCadeira(cadeira, estado.cadeiraDealer)
            const numeros = numerosDaParede((cadeira - estado.cadeiraDealer + 4) % 4).join(' · ')
            return {
              placa: (
                <div
                  className={`mesa-placa mesa-placa--simples${vento === 'leste' ? ' mesa-placa--dealer' : ''}${
                    ladoSorteado === cadeira ? ' mesa-placa--sorteada' : ''
                  }`}
                  role="img"
                  aria-label={`${t(CHAVE_VENTO[vento])}: ${numeros}`}
                >
                  <strong className={`mesa-led-vento--${vento}`} aria-hidden="true">
                    {KANJI_VENTO[vento]}
                  </strong>
                  <small aria-hidden="true">{numeros}</small>
                </div>
              ),
            }
          }}
        />
      </div>

      <div className="mesa-acoes">
        <div className="mesa-honba">
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
        <button type="button" className="mesa-btn-principal" onClick={() => mudar(proximoDealer(estado))}>
          {t('match.simple.nextRound')}
        </button>
        <button type="button" className="mesa-btn-secundario" onClick={() => mudar(repetirDealer(estado))}>
          {t('match.simple.honba')}
        </button>
        <JogarDados
          cadeiraDealer={estado.cadeiraDealer}
          className="mesa-btn-secundario"
          aoSortear={setLadoSorteado}
        />
        <button type="button" className="mesa-btn-secundario" onClick={aoAbrirSorteador}>
          <i className="fas fa-shuffle" aria-hidden="true" /> {t('match.simple.windDraw')}
        </button>
        <button type="button" className="mesa-btn-secundario" onClick={() => setConfirmando(true)}>
          <i className="fas fa-rotate-left" aria-hidden="true" /> {t('match.simple.restart')}
        </button>
        <button type="button" className="mesa-alternar-modo" onClick={alternar}>
          {t(modo === 'mesa' ? 'match.table.modeList' : 'match.table.modeTable')}
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
