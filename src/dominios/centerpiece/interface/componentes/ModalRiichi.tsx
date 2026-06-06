import { useState } from 'react'
import type { EstadoCenterpiece } from '../../logica/tipos'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsModalRiichi {
  estado: EstadoCenterpiece
  aoConfirmar: (jogadorId: string) => void
  aoFechar: () => void
}

const KANJI_VENTO: Record<string, string> = {
  leste: '東', sul: '南', oeste: '西', norte: '北',
}

export default function ModalRiichi({ estado, aoConfirmar, aoFechar }: PropsModalRiichi) {
  const { t } = useI18n()
  const [selecionado, setSelecionado] = useState<string>('')

  const jogadoresPodendo = estado.jogadores.filter((j) => !j.riichi && j.pontos >= 1000)

  return (
    <div className="centerpiece-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-riichi-titulo">
      <div className="centerpiece-modal">
        <div className="modal-cabecalho">
          <h3 id="modal-riichi-titulo">{t('centerpiece.riichi.title')}</h3>
          <button type="button" className="modal-fechar" onClick={aoFechar} aria-label={t('actions.close')}>
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-corpo">
          <p className="modal-label">{t('centerpiece.riichi.player')}</p>
          <div className="modal-lista-jogadores">
            {estado.jogadores.map((j) => {
              const bloqueado = j.riichi || j.pontos < 1000
              return (
                <button
                  key={j.id}
                  type="button"
                  className={`opcao-jogador ${selecionado === j.id ? 'ativa' : ''} ${bloqueado ? 'bloqueada' : ''}`}
                  onClick={() => !bloqueado && setSelecionado(j.id)}
                  disabled={bloqueado}
                  title={j.riichi ? 'Já em riichi' : j.pontos < 1000 ? t('centerpiece.riichi.notEnough') : undefined}
                >
                  <span className={`kanji-vento vento-${j.vento}`}>{KANJI_VENTO[j.vento]}</span>
                  <span>{j.nome}</span>
                  <span className="pontos-jogador">{j.pontos.toLocaleString('pt-BR')}</span>
                  {j.riichi && <span className="badge-riichi">Riichi</span>}
                </button>
              )
            })}
          </div>
          {jogadoresPodendo.length === 0 && (
            <p className="modal-aviso">{t('centerpiece.riichi.notEnough')}</p>
          )}
          <div className="modal-rodape-acoes">
            <button type="button" className="btn-contorno" onClick={aoFechar}>{t('actions.close')}</button>
            <button
              type="button"
              className="btn-primario"
              onClick={() => aoConfirmar(selecionado)}
              disabled={!selecionado}
            >
              {t('centerpiece.riichi.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
