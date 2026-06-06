import type { EstadoCenterpiece } from '../../logica/tipos'
import type { ModalCenterpiece } from '../hooks/useCenterpiece'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

const KANJI_RODADA: Record<string, string> = {
  leste: '東',
  sul: '南',
}

interface PropsPainelCentralMesa {
  estado: EstadoCenterpiece
  podDesfazer: boolean
  aoAbrirModal: (modal: ModalCenterpiece) => void
  aoDesfazer: () => void
  aoReiniciar: () => void
}

export default function PainelCentralMesa({
  estado,
  podDesfazer,
  aoAbrirModal,
  aoDesfazer,
  aoReiniciar,
}: PropsPainelCentralMesa) {
  const { t } = useI18n()

  return (
    <div className="centerpiece-painel-central">
      <div className="painel-rodada-info">
        <span className="painel-rodada-kanji" aria-hidden="true">
          {KANJI_RODADA[estado.rodadaVento]}
        </span>
        <div className="painel-rodada-detalhes">
          <span className="painel-rodada-texto">
            {t(`centerpiece.round.${estado.rodadaVento}`)} {estado.rodadaNumero}
          </span>
          <span className="painel-honba-sticks">
            <span aria-label={t('centerpiece.mesa.honba')}>
              <i className="fas fa-circle-dot" aria-hidden="true" />
              {' '}{estado.honba}
            </span>
            <span aria-label={t('centerpiece.mesa.riichiSticks')}>
              <i className="fas fa-flag" aria-hidden="true" />
              {' '}{estado.riichiSticks}
            </span>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn-primario painel-btn-batida"
        onClick={() => aoAbrirModal('batida')}
        aria-label={t('centerpiece.mesa.registerWin')}
      >
        <i className="fas fa-trophy" aria-hidden="true" />
        {t('centerpiece.mesa.registerWin')}
      </button>

      <div className="painel-acoes-secundarias">
        <button
          type="button"
          className="btn-contorno painel-btn-acao"
          onClick={() => aoAbrirModal('riichi')}
        >
          <i className="fas fa-flag" aria-hidden="true" />
          {t('centerpiece.mesa.riichi')}
        </button>
        <button
          type="button"
          className="btn-contorno painel-btn-acao"
          onClick={() => aoAbrirModal('ryukyoku')}
        >
          <i className="fas fa-equals" aria-hidden="true" />
          {t('centerpiece.mesa.draw')}
        </button>
        <button
          type="button"
          className="btn-contorno painel-btn-acao btn-perigo"
          onClick={() => aoAbrirModal('chombo')}
        >
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          {t('centerpiece.mesa.chombo')}
        </button>
        <button
          type="button"
          className="btn-contorno painel-btn-acao"
          onClick={aoDesfazer}
          disabled={!podDesfazer}
          aria-label={t('centerpiece.mesa.undo')}
        >
          <i className="fas fa-rotate-left" aria-hidden="true" />
          {t('centerpiece.mesa.undo')}
        </button>
        <button
          type="button"
          className="btn-contorno painel-btn-acao"
          onClick={() => {
            if (window.confirm(t('centerpiece.mesa.confirmNewGame'))) aoReiniciar()
          }}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
          {t('centerpiece.mesa.newGame')}
        </button>
      </div>
    </div>
  )
}
