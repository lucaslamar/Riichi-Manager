import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { JogadorCenterpiece } from '../../logica/tipos'
import IndicadorVento from './IndicadorVento'
import { NOME_VENTO } from './ventoVisual'

interface PropsMenuAcaoJogador {
  jogador: JogadorCenterpiece
  aoGanhouRon: () => void
  aoGanhouTsumo: () => void
  aoDeuChombo: () => void
  aoDeclararRiichi: () => void
  aoFechar: () => void
}

export default function MenuAcaoJogador({
  jogador,
  aoGanhouRon,
  aoGanhouTsumo,
  aoDeuChombo,
  aoDeclararRiichi,
  aoFechar,
}: PropsMenuAcaoJogador) {
  const { t } = useI18n()
  const podeRiichi = !jogador.riichi && jogador.pontos >= 1000

  return (
    <div
      className="centerpiece-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-jogador-titulo"
      onClick={aoFechar}
    >
      <div
        className="centerpiece-menu-jogador"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="menu-jogador-cabecalho">
          <IndicadorVento
            vento={jogador.vento}
            tamanho="grande"
            className="menu-jogador-kanji"
          />
          <div className="menu-jogador-info">
            <strong id="menu-jogador-titulo">{jogador.nome}</strong>
            <span>{NOME_VENTO[jogador.vento]}</span>
            <span>{jogador.pontos.toLocaleString('pt-BR')} pts</span>
          </div>
        </div>

        <div className="menu-jogador-acoes" role="group" aria-label={t('centerpiece.menu.acoes')}>
          <button type="button" className="menu-jogador-acao" onClick={aoGanhouRon}>
            <i className="fas fa-trophy" aria-hidden="true" />
            {t('centerpiece.menu.ganhouRon')}
          </button>
          <button type="button" className="menu-jogador-acao" onClick={aoGanhouTsumo}>
            <i className="fas fa-trophy" aria-hidden="true" />
            {t('centerpiece.menu.ganhouTsumo')}
          </button>
          <button
            type="button"
            className="menu-jogador-acao acao-perigo"
            onClick={aoDeuChombo}
          >
            <i className="fas fa-triangle-exclamation" aria-hidden="true" />
            {t('centerpiece.menu.deuChombo')}
          </button>
          {podeRiichi && (
            <button type="button" className="menu-jogador-acao" onClick={aoDeclararRiichi}>
              <i className="fas fa-flag" aria-hidden="true" />
              {t('centerpiece.menu.declararRiichi')}
            </button>
          )}
        </div>

        <button
          type="button"
          className="menu-jogador-cancelar"
          onClick={aoFechar}
        >
          {t('actions.cancel')}
        </button>
      </div>
    </div>
  )
}
