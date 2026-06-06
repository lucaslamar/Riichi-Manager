import type { JogadorCenterpiece } from '../../logica/tipos'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

const KANJI_VENTO: Record<string, string> = {
  leste: '東',
  sul: '南',
  oeste: '西',
  norte: '北',
}

interface PropsCardJogadorMesa {
  jogador: JogadorCenterpiece
}

export default function CardJogadorMesa({ jogador }: PropsCardJogadorMesa) {
  const { t } = useI18n()
  const ehDealer = jogador.vento === 'leste'

  return (
    <article
      className={`centerpiece-card-jogador vento-${jogador.vento} ${ehDealer ? 'eh-dealer' : ''} ${jogador.riichi ? 'em-riichi' : ''}`}
      aria-label={`${jogador.nome}, ${t(`winds.${jogador.vento}`)}, ${jogador.pontos.toLocaleString('pt-BR')} pontos${jogador.riichi ? ', Riichi' : ''}`}
    >
      <div className="card-jogador-vento" aria-hidden="true">
        {KANJI_VENTO[jogador.vento]}
      </div>
      <div className="card-jogador-info">
        <span className="card-jogador-nome">{jogador.nome}</span>
        <span className="card-jogador-vento-nome">{t(`winds.${jogador.vento}`)}</span>
      </div>
      <div className="card-jogador-pontos">
        {jogador.pontos.toLocaleString('pt-BR')}
      </div>
      {jogador.riichi && (
        <div className="card-jogador-riichi" aria-label="Riichi">
          <i className="fas fa-flag" aria-hidden="true" />
          <span>Riichi</span>
        </div>
      )}
    </article>
  )
}
