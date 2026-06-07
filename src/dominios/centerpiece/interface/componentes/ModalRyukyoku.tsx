import { useState } from 'react'
import type { EstadoCenterpiece } from '../../logica/tipos'
import { calcularPagamentosRyukyoku } from '../../logica/aplicarRyukyoku'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import IndicadorVento from './IndicadorVento'
import { NOME_VENTO } from './ventoVisual'

interface PropsModalRyukyoku {
  estado: EstadoCenterpiece
  aoConfirmar: (tenpaiIds: string[]) => void
  aoFechar: () => void
}

export default function ModalRyukyoku({ estado, aoConfirmar, aoFechar }: PropsModalRyukyoku) {
  const { t } = useI18n()
  const [tenpaiIds, setTenpaiIds] = useState<string[]>([])

  const alternarTenpai = (id: string) => {
    setTenpaiIds((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    )
  }

  const { ganhoPorTenpai, perdaPorNoten } = calcularPagamentosRyukyoku(tenpaiIds.length)

  return (
    <div className="centerpiece-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-ryukyoku-titulo">
      <div className="centerpiece-modal">
        <div className="modal-cabecalho">
          <h3 id="modal-ryukyoku-titulo">{t('centerpiece.ryukyoku.title')}</h3>
          <button type="button" className="modal-fechar" onClick={aoFechar} aria-label={t('actions.close')}>
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-corpo">
          <p className="modal-label">{t('centerpiece.ryukyoku.tenpai')}</p>
          <div className="modal-lista-jogadores">
            {estado.jogadores.map((j) => {
              const ehTenpai = tenpaiIds.includes(j.id)
              return (
                <button
                  key={j.id}
                  type="button"
                  className={`opcao-jogador ${ehTenpai ? 'ativa' : ''}`}
                  onClick={() => alternarTenpai(j.id)}
                >
                  <IndicadorVento vento={j.vento} />
                  <span>{j.nome} • {NOME_VENTO[j.vento]}</span>
                  <span className="pontos-jogador">{j.pontos.toLocaleString('pt-BR')}</span>
                  {ehTenpai && <span className="badge-tenpai">Tenpai</span>}
                </button>
              )
            })}
          </div>

          {tenpaiIds.length > 0 && tenpaiIds.length < 4 && (
            <div className="ryukyoku-preview">
              <span>✓ Tenpai: +{ganhoPorTenpai.toLocaleString('pt-BR')} pts</span>
              <span>✗ Noten: -{perdaPorNoten.toLocaleString('pt-BR')} pts</span>
            </div>
          )}
          {(tenpaiIds.length === 0 || tenpaiIds.length === 4) && (
            <p className="modal-info">{t('centerpiece.ryukyoku.noPayment')}</p>
          )}

          <div className="modal-rodape-acoes">
            <button type="button" className="btn-contorno" onClick={aoFechar}>{t('actions.close')}</button>
            <button
              type="button"
              className="btn-primario"
              onClick={() => aoConfirmar(tenpaiIds)}
            >
              {t('centerpiece.ryukyoku.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
