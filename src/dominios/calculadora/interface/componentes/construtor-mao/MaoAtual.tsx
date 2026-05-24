import type { Acao, CodigoPedra, Mao, Meld } from '../../../logica/mao'
import { ESTILO_MELD } from '../../constantes'
import { AcoesConstrutorMao } from './AcoesConstrutorMao'
import { PedraSvg, PedrasMeld } from '../PedraSvg'

interface AcaoMobileAtiva {
  rotulo: string
  cor: string
}

interface PropsMaoAtual {
  mao: Mao
  acaoPendente: Acao | null
  acaoMeldAtiva: Acao | null
  acaoMobileAtiva: AcaoMobileAtiva | null
  totalPedras: number
  slotsUsados: number
  maoEditorGrudado: boolean
  menuAcoesMaoAberto: boolean
  indicesSelecionadosChii: Set<number>
  statusTenpai: string | null
  temEsperaValida: boolean
  temEsperaSemYaku: boolean
  temEsperaFuriten: boolean
  podeChii: boolean
  podePon: boolean
  podeKanAberto: boolean
  podeKanFechado: boolean
  maoInvalida: boolean
  aoAbrirMenuAcoes: () => void
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  aoAdicionarPedra: (pedra: CodigoPedra) => void
  aoRemoverPedra: (indicePedra: number) => void
  aoRemoverMeld: (indiceMeld: number) => void
  aoLimpar: () => void
}

function ChipMeld({ meld, indiceMeld, aoRemoverMeld }: {
  meld: Meld
  indiceMeld: number
  aoRemoverMeld: (indiceMeld: number) => void
}) {
  const estilo = ESTILO_MELD[meld.tipo]
  return (
    <button
      type="button"
      title={`${estilo.rotulo} — clique para remover`}
      onClick={() => aoRemoverMeld(indiceMeld)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        border: `2px solid ${estilo.borda}`,
        background: '#ffffff',
        fontWeight: 900,
        fontFamily: 'monospace',
        fontSize: '0.82rem',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 900,
          color: estilo.borda,
          marginRight: 2,
          letterSpacing: 0,
        }}
      >
        {estilo.rotulo}
      </span>
      <PedrasMeld meld={meld} />
    </button>
  )
}

/**
 * Renderiza a mão em edição, os melds já formados e o menu compacto de ações.
 * O clique nas pedras da mão remove ou alimenta uma ação de meld ativa.
 */
export function MaoAtual({
  mao,
  acaoPendente,
  acaoMeldAtiva,
  acaoMobileAtiva,
  totalPedras,
  slotsUsados,
  maoEditorGrudado,
  menuAcoesMaoAberto,
  indicesSelecionadosChii,
  statusTenpai,
  temEsperaValida,
  temEsperaSemYaku,
  temEsperaFuriten,
  podeChii,
  podePon,
  podeKanAberto,
  podeKanFechado,
  maoInvalida,
  aoAbrirMenuAcoes,
  aoAlternarAcao,
  aoAdicionarPedra,
  aoRemoverPedra,
  aoRemoverMeld,
  aoLimpar,
}: PropsMaoAtual) {
  const clicarPedraDaMao = (indicePedra: number) => {
    if (acaoMeldAtiva) {
      aoAdicionarPedra(mao.pedras[indicePedra])
      return
    }
    aoRemoverPedra(indicePedra)
  }

  return (
    <div className={`mao-editor-fixo ${maoEditorGrudado ? 'grudado' : ''}`}>
      <div className="cabecalho-mao-editor">
        <h3 className="titulo-mao-editor">
          <i className="fas fa-layer-group" style={{ marginRight: 6 }} />
          Mão ({totalPedras} pedras · {slotsUsados}/14 slots)
        </h3>
      </div>

      {acaoMeldAtiva && (
        <button
          className="chip-acao-meld-ativa"
          type="button"
          style={{ borderColor: acaoMobileAtiva?.cor, color: acaoMobileAtiva?.cor }}
          onClick={() => aoAlternarAcao(acaoMeldAtiva.tipo)}
        >
          {acaoMobileAtiva?.rotulo} ativo x
        </button>
      )}

      <div
        className={`pedras-selecionadas ${
          maoInvalida || temEsperaFuriten || temEsperaSemYaku
            ? 'tenpai-alerta'
            : temEsperaValida
              ? 'tenpai-valido'
              : ''
        } ${maoInvalida ? 'mao-invalida' : ''} ${acaoMeldAtiva ? 'modo-meld-ativo' : ''}`}
      >
        {totalPedras > 0 && (
          <button className="btn-limpar-mao" type="button" onClick={aoLimpar}>
            Limpar
          </button>
        )}
        {(maoInvalida || statusTenpai) && (
          <span
            className={`status-tenpai-mao ${
              maoInvalida || temEsperaFuriten
                ? 'furiten'
                : temEsperaValida
                  ? 'valido'
                  : 'sem-yaku'
            }`}
          >
            {maoInvalida ? 'Sem yaku' : statusTenpai}
          </span>
        )}
        {mao.pedras.map((pedra, indicePedra) => (
          <button
            key={indicePedra}
            className={`chip-pedra ${indicePedra === mao.indiceAgari ? 'agari' : ''} ${
              indicesSelecionadosChii.has(indicePedra) ? 'selecionada-meld' : ''
            } ${maoInvalida && indicePedra === mao.indiceAgari ? 'chombo' : ''}`}
            type="button"
            title={
              indicePedra === mao.indiceAgari
                ? 'Pedra de agari — clique para remover'
                : 'Clique para remover'
            }
            onClick={() => clicarPedraDaMao(indicePedra)}
          >
            <PedraSvg pedra={pedra} />
          </button>
        ))}
        {mao.melds.map((meld, indiceMeld) => (
          <ChipMeld
            key={`meld-${indiceMeld}`}
            meld={meld}
            indiceMeld={indiceMeld}
            aoRemoverMeld={aoRemoverMeld}
          />
        ))}
        {totalPedras === 0 && (
          <span style={{ color: '#bbb', fontSize: '0.85rem', alignSelf: 'center' }}>
            Clique nas pedras abaixo para montar a mão
          </span>
        )}
      </div>

      <div className={`menu-acoes-mao-mobile ${menuAcoesMaoAberto ? 'aberto' : ''}`}>
        <button
          className={`btn-contorno btn-menu-acoes-mao ${acaoMobileAtiva ? 'ativo' : ''}`}
          type="button"
          aria-expanded={menuAcoesMaoAberto}
          style={
            acaoMobileAtiva
              ? {
                  borderColor: acaoMobileAtiva.cor,
                  background: acaoMobileAtiva.cor,
                  color: '#ffffff',
                }
              : undefined
          }
          onClick={aoAbrirMenuAcoes}
        >
          {acaoMobileAtiva?.rotulo ?? 'Ações'}
        </button>
        <div className="opcoes-acoes-mao-mobile">
          <AcoesConstrutorMao
            mao={mao}
            acaoPendente={acaoPendente}
            podeChii={podeChii}
            podePon={podePon}
            podeKanAberto={podeKanAberto}
            podeKanFechado={podeKanFechado}
            aoAlternarAcao={aoAlternarAcao}
            compacto
          />
        </div>
      </div>
    </div>
  )
}
