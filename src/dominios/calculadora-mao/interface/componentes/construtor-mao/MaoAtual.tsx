import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ReactNode } from 'react'
import type { Acao, CodigoPedra, Mao, Meld } from '../../../logica/mao'
import { ESTILO_MELD, nomePedraAcessivel } from '../../constantes'
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
  contexto: 'montagem' | 'finalizacao'
  acoesCabecalho?: ReactNode
  aoAbrirMenuAcoes: () => void
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  aoAdicionarPedra: (pedra: CodigoPedra) => void
  aoRemoverPedra: (indicePedra: number) => void
  aoRemoverMeld: (indiceMeld: number) => void
  aoLimpar: () => void
}

function ChipMeld({
  meld,
  indiceMeld,
  indiceAgari,
  aoRemoverMeld,
}: {
  meld: Meld
  indiceMeld: number
  indiceAgari?: number
  aoRemoverMeld: (indiceMeld: number) => void
}) {
  const { t } = useI18n()
  const estilo = ESTILO_MELD[meld.tipo]

  return (
    <button
      className={`chip-meld-mao chip-meld-mao-${meld.tipo}`}
      type="button"
      title={t('calculator.removeMeld', { meld: estilo.rotulo })}
      aria-label={t('calculator.removeMeld', { meld: estilo.rotulo })}
      onClick={() => aoRemoverMeld(indiceMeld)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 5px',
        borderRadius: 7,
        border: `1.5px solid ${estilo.borda}`,
        background: 'transparent',
        boxShadow: 'none',
        fontWeight: 900,
        fontFamily: 'monospace',
        fontSize: '0.78rem',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontSize: '0.58rem',
          fontWeight: 900,
          color: estilo.borda,
          marginRight: 1,
          letterSpacing: 0,
        }}
      >
        {estilo.rotulo}
      </span>
      <PedrasMeld meld={meld} indiceAgari={indiceAgari} />
    </button>
  )
}

/**
 * Renderiza a mao em edicao, os melds formados e o menu compacto de acoes.
 *
 * Clique em tile da mao remove a pedra, exceto quando uma acao de meld esta ativa;
 * nesse caso o clique alimenta a acao escolhida. A regra segue no hook principal.
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
  contexto,
  acoesCabecalho,
  aoAbrirMenuAcoes,
  aoAlternarAcao,
  aoAdicionarPedra,
  aoRemoverPedra,
  aoRemoverMeld,
  aoLimpar,
}: PropsMaoAtual) {
  const { t } = useI18n()
  const slotsEstruturais = Math.min(slotsUsados, 14)
  const sufixoFisico =
    totalPedras !== slotsUsados
      ? ` • ${t('calculator.physicalTilesShort', { total: totalPedras })}`
      : ''
  const tituloMao =
    contexto === 'finalizacao'
      ? `${t('calculator.completeHand')} ${slotsEstruturais}/14${sufixoFisico}`
      : `${t('calculator.buildTitle', { total: slotsEstruturais })}${sufixoFisico}`
  const clicarPedraDaMao = (indicePedra: number) => {
    if (acaoMeldAtiva) {
      aoAdicionarPedra(mao.pedras[indicePedra])
      return
    }
    aoRemoverPedra(indicePedra)
  }
  const renderizarPedrasMaoFinalizacao = () =>
    mao.pedras.map((pedra, indicePedra) => {
      const tile = nomePedraAcessivel(pedra)
      const ehAgari = indicePedra === mao.indiceAgari
      const classe = `chip-pedra ${ehAgari ? 'agari' : ''} ${maoInvalida && ehAgari ? 'chombo' : ''}`

      return (
        <span key={indicePedra} className={classe} aria-label={tile}>
          <PedraSvg pedra={pedra} />
        </span>
      )
    })

  return (
    <div className={`mao-editor-fixo ${maoEditorGrudado ? 'grudado' : ''}`}>
      <div className="cabecalho-mao-editor">
        <h3 className="titulo-mao-editor">
          <i className="fas fa-layer-group" style={{ marginRight: 6 }} aria-hidden="true" />
          {tituloMao}
        </h3>
        <div className="acoes-cabecalho-mao">
          {acoesCabecalho}
          {(maoInvalida || statusTenpai) && (
            <span
              className={`status-tenpai-mao status-tenpai-cabecalho ${
                maoInvalida || temEsperaFuriten
                  ? 'furiten'
                  : temEsperaValida
                    ? 'valido'
                    : 'sem-yaku'
              }`}
            >
              {maoInvalida ? t('calculator.noYaku') : statusTenpai}
            </span>
          )}
          {acaoPendente && acaoMobileAtiva && (
            <button
              className="chip-acao-meld-ativa"
              type="button"
              style={{ borderColor: acaoMobileAtiva?.cor, color: acaoMobileAtiva?.cor }}
              onClick={() => aoAlternarAcao(acaoPendente.tipo)}
              aria-label={t('calculator.meldActive', { action: acaoMobileAtiva?.rotulo ?? '' })}
            >
              {acaoMobileAtiva?.rotulo ?? ''}
              <span aria-hidden="true">x</span>
            </button>
          )}
          {contexto === 'montagem' && totalPedras > 0 && (
            <button
              className="btn-limpar-mao-cabecalho"
              type="button"
              onClick={aoLimpar}
              aria-label={t('actions.clear')}
              title={t('actions.clear')}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`pedras-selecionadas ${
          maoInvalida || temEsperaFuriten || temEsperaSemYaku
            ? 'tenpai-alerta'
            : temEsperaValida
              ? 'tenpai-valido'
              : ''
        } ${maoInvalida ? 'mao-invalida' : ''} ${acaoMeldAtiva ? 'modo-meld-ativo' : ''}`}
      >
        {contexto === 'finalizacao' && (
          <>
            <div className="mao-principal-finalizacao">{renderizarPedrasMaoFinalizacao()}</div>
            {mao.melds.length > 0 && (
              <div className="melds-finalizacao-coluna">
                {mao.melds.map((meld, indiceMeld) => (
                  <ChipMeld
                    key={`meld-${indiceMeld}`}
                    meld={meld}
                    indiceMeld={indiceMeld}
                    indiceAgari={
                      mao.agariMeld?.indiceMeld === indiceMeld ? mao.agariMeld.indicePedra : undefined
                    }
                    aoRemoverMeld={aoRemoverMeld}
                  />
                ))}
              </div>
            )}
          </>
        )}
        {contexto !== 'finalizacao' && (
          <>
        {mao.pedras.map((pedra, indicePedra) => {
          const tile = nomePedraAcessivel(pedra)
          const ehAgari = indicePedra === mao.indiceAgari

          const classe = `chip-pedra ${ehAgari ? 'agari' : ''} ${
            indicesSelecionadosChii.has(indicePedra) ? 'selecionada-meld' : ''
          } ${maoInvalida && ehAgari ? 'chombo' : ''}`

          return (
            <button
              key={indicePedra}
              className={classe}
              type="button"
              title={
                ehAgari
                  ? t('calculator.removeWinningTile', { tile })
                  : t('calculator.removeTile', { tile })
              }
              aria-label={
                ehAgari
                  ? t('calculator.removeWinningTile', { tile })
                  : t('calculator.removeTile', { tile })
              }
              onClick={() => clicarPedraDaMao(indicePedra)}
            >
              <PedraSvg pedra={pedra} />
              {ehAgari && <span className="badge-pedra-agari">{t('calculator.winningTile')}</span>}
            </button>
          )
        })}
        {mao.melds.map((meld, indiceMeld) => (
          <ChipMeld
            key={`meld-${indiceMeld}`}
            meld={meld}
            indiceMeld={indiceMeld}
            indiceAgari={
              mao.agariMeld?.indiceMeld === indiceMeld ? mao.agariMeld.indicePedra : undefined
            }
            aoRemoverMeld={aoRemoverMeld}
          />
        ))}
          </>
        )}
        {contexto === 'montagem' && totalPedras === 0 && (
          <span className="estado-vazio-mao">{t('calculator.emptyHand')}</span>
        )}
      </div>

      {contexto === 'montagem' && <div className={`menu-acoes-mao-mobile ${menuAcoesMaoAberto ? 'aberto' : ''}`}>
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
          {acaoMobileAtiva?.rotulo ?? t('calculator.actionsMenu')}
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
      </div>}
    </div>
  )
}
