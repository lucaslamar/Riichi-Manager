import type { JogadorCenterpiece } from '../../logica/tipos'
import IndicadorVento from './IndicadorVento'
import { NOME_VENTO } from './ventoVisual'

interface PropsCardJogadorMesa {
  jogador: JogadorCenterpiece
  aoDeclararRiichi?: (jogadorId: string) => void
  aoClicar?: (jogadorId: string) => void
}

export default function CardJogadorMesa({
  jogador,
  aoDeclararRiichi,
  aoClicar,
}: PropsCardJogadorMesa) {
  const ehDealer = jogador.vento === 'leste'
  const podeRiichi = !jogador.riichi && jogador.pontos >= 1000

  return (
    <article
      className={`centerpiece-card-jogador vento-${jogador.vento} ${ehDealer ? 'eh-dealer' : ''} ${jogador.riichi ? 'em-riichi' : ''}${aoClicar ? ' clicavel' : ''}`}
      aria-label={`${jogador.nome}, ${NOME_VENTO[jogador.vento] ?? jogador.vento}, ${jogador.pontos.toLocaleString('pt-BR')} pontos${jogador.riichi ? ', Riichi' : ''}`}
      onClick={aoClicar ? () => aoClicar(jogador.id) : undefined}
      role={aoClicar ? 'button' : undefined}
      tabIndex={aoClicar ? 0 : undefined}
      onKeyDown={aoClicar ? (ev) => { if (ev.key === 'Enter' || ev.key === ' ') aoClicar(jogador.id) } : undefined}
    >
      <IndicadorVento vento={jogador.vento} tamanho="grande" className="card-jogador-vento" />
      <div className="card-jogador-info">
        <span className="card-jogador-nome">{jogador.nome}</span>
        <span className="card-jogador-vento-nome">{NOME_VENTO[jogador.vento]}</span>
        <div className="card-jogador-pontos">
          {jogador.pontos.toLocaleString('pt-BR')}
        </div>
      </div>

      {jogador.riichi ? (
        <div className="card-jogador-riichi" aria-label="Riichi ativo">
          <i className="fas fa-flag" aria-hidden="true" />
          <span>Riichi</span>
        </div>
      ) : aoDeclararRiichi && (
        <button
          type="button"
          className="card-jogador-btn-riichi"
          onClick={(ev) => { ev.stopPropagation(); aoDeclararRiichi(jogador.id) }}
          disabled={!podeRiichi}
          title={jogador.pontos < 1000 ? 'Pontos insuficientes' : undefined}
          aria-label="Declarar Riichi"
        >
          <i className="fas fa-flag" aria-hidden="true" />
          Riichi
        </button>
      )}
    </article>
  )
}
