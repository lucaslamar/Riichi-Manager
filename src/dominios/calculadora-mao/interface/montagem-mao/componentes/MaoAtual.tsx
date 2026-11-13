import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ReactNode } from 'react'
import type { Acao, CodigoPedra, Mao, Meld } from '../../../logica/mao'
import { ESTILO_MELD, nomePedraAcessivel } from '../../constantes'
import { AcoesConstrutorMao } from './AcoesConstrutorMao'
import { PedraSvg, PedrasMeld } from '../../compartilhado/componentes/PedraSvg'
import { GradePedrasMao, PedraMao } from '../../compartilhado/componentes/PedraMao'
import { ChipMeldMao } from '../../compartilhado/componentes/ChipMeldMao'
import BotaoAjuda from '../../modais/ajuda-secoes/BotaoAjuda'
import BotaoYakus from '../../modais/yakus/BotaoYakus'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'

/** Tablets em retrato: a ⚙ sai do cabeçalho e vai para a barra de ações (responsivo.css). */
const CONSULTA_TABLET_RETRATO = '(min-width: 641px) and (orientation: portrait)'
/** Tablet em qualquer orientação (a partir de 768px, fora do celular deitado). */
const CONSULTA_TABLET = '(min-width: 768px) and (min-height: 561px)'

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
  selecionandoPedraAgari: boolean
  contexto: 'montagem' | 'finalizacao'
  acoesCabecalho?: ReactNode
  aoAbrirRegras?: () => void
  aoAbrirMenuAcoes: () => void
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  aoAdicionarPedraDaMao: (pedra: CodigoPedra) => void
  aoEscolherPedraAgariMao: (indicePedra: number) => void
  aoEscolherPedraAgariMeld: (indiceMeld: number, indicePedra: number) => void
  aoRemoverPedra: (indicePedra: number) => void
  aoRemoverMeld: (indiceMeld: number) => void
  aoLimpar: () => void
  /** Na notação, o "?" dela fica no cabeçalho e o AC do teclado substitui a lixeira. */
  entradaPorNotacao?: boolean
  /** Números da notação ainda sem naipe: aparecem como pedras brancas no fim da mão. */
  pedrasPendentes?: string[]
  /** Toque numa pedra branca: some esse número. */
  aoRemoverPedraPendente?: (posicao: number) => void
  /** Chamadas da notação ainda sem naipe: melds tracejados com os números. */
  meldsPendentes?: { indice: number; tipo: Meld['tipo']; pedras: string[] }[]
  /** Toque num meld pendente: some o grupo inteiro (e a chamada marcada). */
  aoRemoverMeldPendente?: (indice: number) => void
  /** Ron da partida: a pedra descartada espera no fim da mão, já como batida. */
  batidaReservada?: CodigoPedra | null
  /** A batida é a do ron da partida: tocar nela não a tira da mão. */
  batidaFixa?: boolean
}

function ChipMeld({
  meld,
  indiceMeld,
  indiceAgari,
  selecionandoPedraAgari,
  permitirSelecaoAgariMeld = false,
  selecionarPedraAgariDireto = false,
  aoEscolherPedraAgariMeld,
  aoRemoverMeld,
}: {
  meld: Meld
  indiceMeld: number
  indiceAgari?: number
  selecionandoPedraAgari: boolean
  permitirSelecaoAgariMeld?: boolean
  selecionarPedraAgariDireto?: boolean
  aoEscolherPedraAgariMeld: (indiceMeld: number, indicePedra: number) => void
  aoRemoverMeld: (indiceMeld: number) => void
}) {
  const { t } = useI18n()
  const estilo = ESTILO_MELD[meld.tipo]
  const renderizarPedraSelecionavel = ({
    chave,
    indicePedra,
    pedra,
    virada = false,
    deLado = false,
  }: {
    chave: string | number
    indicePedra: number
    pedra?: CodigoPedra
    virada?: boolean
    deLado?: boolean
  }) => {
    const ehAgari = indiceAgari === indicePedra
    const tile = virada ? t('calculator.hiddenTile') : nomePedraAcessivel(pedra)

    return (
      <button
        key={chave}
        className={`meld-tile seletor-agari-meld ${deLado ? 'de-lado' : ''} ${
          ehAgari ? 'agari' : ''
        }`}
        type="button"
        title={t('calculator.selectWinningTile', { tile })}
        aria-label={t('calculator.selectWinningTile', { tile })}
        onClick={() => aoEscolherPedraAgariMeld(indiceMeld, indicePedra)}
      >
        <PedraSvg pedra={pedra} virada={virada} deLado={deLado} />
      </button>
    )
  }

  if ((selecionandoPedraAgari && permitirSelecaoAgariMeld) || selecionarPedraAgariDireto) {
    const pedrasSelecionaveis =
      meld.tipo === 'kanFechado'
        ? (() => {
            const pedraAka = meld.pedras.find((pedra) => pedra.startsWith('0'))
            const pedrasCentrais = pedraAka
              ? [pedraAka, meld.pedras.find((pedra) => pedra !== pedraAka) ?? meld.pedras[1]]
              : [meld.pedras[1], meld.pedras[2]]

            return [
              renderizarPedraSelecionavel({
                chave: 'back-left',
                indicePedra: 0,
                pedra: meld.pedras[0],
                virada: true,
              }),
              renderizarPedraSelecionavel({
                chave: 'middle-left',
                indicePedra: 1,
                pedra: pedrasCentrais[0],
              }),
              renderizarPedraSelecionavel({
                chave: 'middle-right',
                indicePedra: 2,
                pedra: pedrasCentrais[1],
              }),
              renderizarPedraSelecionavel({
                chave: 'back-right',
                indicePedra: 3,
                pedra: meld.pedras[3],
                virada: true,
              }),
            ]
          })()
        : meld.pedras.map((pedra, indicePedra) =>
            renderizarPedraSelecionavel({
              chave: indicePedra,
              indicePedra,
              pedra,
              deLado: indicePedra === 0,
            }),
          )

    return (
      <span className={`chip-meld-mao chip-meld-mao-${meld.tipo} chip-meld-seletor-agari`}>
        <span className="rotulo-meld-seletor" style={{ color: estilo.borda }}>
          {t(estilo.rotulo)}
        </span>
        <span className="meld-pedras">{pedrasSelecionaveis}</span>
      </span>
    )
  }

  return (
    <ChipMeldMao
      tipo={meld.tipo}
      titulo={t('calculator.removeMeld', { meld: t(estilo.rotulo) })}
      aoClicar={() => aoRemoverMeld(indiceMeld)}
    >
      <PedrasMeld meld={meld} indiceAgari={indiceAgari} />
    </ChipMeldMao>
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
  selecionandoPedraAgari,
  contexto,
  acoesCabecalho,
  aoAbrirRegras,
  aoAbrirMenuAcoes,
  aoAlternarAcao,
  aoAdicionarPedraDaMao,
  aoEscolherPedraAgariMao,
  aoEscolherPedraAgariMeld,
  aoRemoverPedra,
  aoRemoverMeld,
  aoLimpar,
  entradaPorNotacao = false,
  pedrasPendentes = [],
  aoRemoverPedraPendente,
  meldsPendentes = [],
  aoRemoverMeldPendente,
  batidaReservada = null,
  batidaFixa = false,
}: PropsMaoAtual) {
  const { t } = useI18n()
  const tabletRetrato = useMediaQuery(CONSULTA_TABLET_RETRATO)
  // Finalização: no tablet o Limpar vai para as ações do cabeçalho (depois do
  // lápis); no celular continua no canto da mão. Um botão só, em um lugar.
  const limparNoCabecalho = useMediaQuery(CONSULTA_TABLET)
  // A batida reservada já conta: o ron dá a 14ª pedra.
  const slotsEstruturais = Math.min(slotsUsados + (batidaReservada ? 1 : 0), 14)
  const sufixoFisico =
    totalPedras !== slotsUsados
      ? ` • ${t('calculator.physicalTilesShort', { count: totalPedras })}`
      : ''
  const tituloMao =
    contexto === 'finalizacao'
      ? `${t('calculator.completeHand')} ${slotsEstruturais}/14${sufixoFisico}`
      : `${t('calculator.buildTitle', { total: slotsEstruturais })}${sufixoFisico}`
  /** Número ainda sem naipe: pedra branca tracejada (o 0 aparece como 5 vermelho). */
  const renderizarPedraPendente = (numero: string, indice: number) => (
    <button
      // biome-ignore lint/suspicious/noArrayIndexKey: números digitados em ordem
      key={`pendente-${indice}`}
      type="button"
      className={`chip-pedra pedra-mao pedra-pendente-notacao ${numero === '0' ? 'vermelha' : ''}`.trim()}
      aria-label={t('notation.pendingTile', { number: numero === '0' ? '5' : numero })}
      onClick={() => aoRemoverPedraPendente?.(indice)}
    >
      {numero === '0' ? '5' : numero}
    </button>
  )

  const clicarPedraDaMao = (indicePedra: number) => {
    if (contexto === 'finalizacao') {
      aoEscolherPedraAgariMao(indicePedra)
      return
    }
    if (selecionandoPedraAgari) {
      aoEscolherPedraAgariMao(indicePedra)
      return
    }
    if (acaoMeldAtiva) {
      aoAdicionarPedraDaMao(mao.pedras[indicePedra])
      return
    }
    aoRemoverPedra(indicePedra)
  }
  const renderizarPedrasMaoFinalizacao = () =>
    mao.pedras.map((pedra, indicePedra) => {
      const ehAgari = indicePedra === mao.indiceAgari

      return (
        <PedraMao
          key={indicePedra}
          pedra={pedra}
          rotulo={t('calculator.selectWinningTile', { tile: nomePedraAcessivel(pedra) })}
          ehAgari={ehAgari}
          chombo={maoInvalida && ehAgari}
          aoClicar={() => aoEscolherPedraAgariMao(indicePedra)}
        />
      )
    })

  const botaoLimparFinalizacao = (
    <button
      className={`btn-limpar-mao-finalizacao${
        limparNoCabecalho ? ' btn-limpar-mao-finalizacao--cabecalho' : ''
      }`}
      type="button"
      onClick={aoLimpar}
      aria-label={t('actions.clear')}
      title={t('actions.clear')}
    >
      <i className="fas fa-trash" aria-hidden="true" />
    </button>
  )

  return (
    <div className={`mao-editor-fixo ${maoEditorGrudado ? 'grudado' : ''}`}>
      <div className="cabecalho-mao-editor">
        {/* O "?" fica colado no título (MÃO 0/14): do MPSZ ou, no teclado de pedras,
            de como montar a mão. À direita ficam só o chapéu e a engrenagem. */}
        <div className="titulo-mao-linha">
          <h3 className="titulo-mao-editor">
            <i className="fas fa-layer-group" style={{ marginRight: 6 }} aria-hidden="true" />
            {tituloMao}
          </h3>
          {(entradaPorNotacao || contexto === 'montagem') && (
            <BotaoAjuda topico={entradaPorNotacao ? 'notacao' : 'pecas'} className="botao-ajuda-titulo-mao" />
          )}
        </div>
        <div className="acoes-cabecalho-mao">
          {acoesCabecalho}
          {/* No tablet o Limpar da finalização entra depois do lápis. */}
          {contexto === 'finalizacao' && limparNoCabecalho && botaoLimparFinalizacao}
          {contexto === 'montagem' && !tabletRetrato && (
            <BotaoYakus classeBase="btn-configuracao-mao-cabecalho" />
          )}
          {contexto === 'montagem' && aoAbrirRegras && (
            <button
              className={`btn-configuracao-mao-cabecalho ${entradaPorNotacao ? 'em-notacao' : ''}`.trim()}
              type="button"
              onClick={aoAbrirRegras}
              aria-label={t('rulesModal.open')}
              title={t('rulesModal.open')}
            >
              <i className="fas fa-sliders" aria-hidden="true" />
            </button>
          )}
          {/* Na montagem o tenpai já aparece na borda da mão; o balão fica só na finalização. */}
          {contexto !== 'montagem' && (maoInvalida || statusTenpai) && (
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
          {/* No tablet a engrenagem do cabeçalho some (fica na barra de ações),
              então o YAKU entra antes da lixeira, com o tamanho dela. */}
          {contexto === 'montagem' && tabletRetrato && (
            <BotaoYakus classeBase="btn-limpar-mao-cabecalho" />
          )}
          {contexto === 'montagem' && totalPedras > 0 && !entradaPorNotacao && (
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
        } ${maoInvalida ? 'mao-invalida' : ''} ${acaoMeldAtiva ? 'modo-meld-ativo' : ''} ${
          selecionandoPedraAgari ? 'modo-agari-ativo' : ''
        }`}
      >
        {contexto === 'finalizacao' && (
          <>
            <GradePedrasMao className="mao-principal-finalizacao">
              {renderizarPedrasMaoFinalizacao()}
              {/* No celular o Limpar fica no canto da mão, longe do Editar e das Regras do cabeçalho. */}
              {!limparNoCabecalho && botaoLimparFinalizacao}
            </GradePedrasMao>
            {mao.melds.length > 0 && (
              <section
                className="secao-melds-finalizacao"
                aria-labelledby="titulo-melds-finalizacao"
              >
                <h4 id="titulo-melds-finalizacao" className="titulo-melds-finalizacao">
                  CONJUNTOS
                </h4>
                <div className="melds-finalizacao-coluna">
                  {mao.melds.map((meld, indiceMeld) => (
                    <ChipMeld
                      key={`meld-${indiceMeld}`}
                      meld={meld}
                      indiceMeld={indiceMeld}
                      indiceAgari={
                        mao.agariMeld?.indiceMeld === indiceMeld
                          ? mao.agariMeld.indicePedra
                          : undefined
                      }
                      selecionandoPedraAgari={false}
                      permitirSelecaoAgariMeld
                      selecionarPedraAgariDireto
                      aoEscolherPedraAgariMeld={aoEscolherPedraAgariMeld}
                      aoRemoverMeld={aoRemoverMeld}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        {contexto !== 'finalizacao' && (
          <>
            <GradePedrasMao compacta={totalPedras > 14}>
              {mao.pedras.map((pedra, indicePedra) => {
                const tile = nomePedraAcessivel(pedra)
                const ehAgari = indicePedra === mao.indiceAgari

                return (
                  <PedraMao
                    key={indicePedra}
                    pedra={pedra}
                    rotulo={
                      selecionandoPedraAgari
                        ? t('calculator.selectWinningTile', { tile })
                        : ehAgari && batidaFixa
                          ? t('calculator.reservedWinningTile', { tile })
                          : ehAgari
                          ? t('calculator.removeWinningTile', { tile })
                          : t('calculator.removeTile', { tile })
                    }
                    ehAgari={ehAgari}
                    selecionada={indicesSelecionadosChii.has(indicePedra)}
                    chombo={maoInvalida && ehAgari}
                    aoClicar={() => clicarPedraDaMao(indicePedra)}
                  />
                )
              })}
              {pedrasPendentes.map(renderizarPedraPendente)}
              {batidaReservada && (
                <PedraMao
                  pedra={batidaReservada}
                  rotulo={t('calculator.reservedWinningTile', { tile: nomePedraAcessivel(batidaReservada) })}
                  ehAgari
                  aoClicar={() => undefined}
                />
              )}
            </GradePedrasMao>
            {mao.melds.map((meld, indiceMeld) => (
              <ChipMeld
                key={`meld-${indiceMeld}`}
                meld={meld}
                indiceMeld={indiceMeld}
                indiceAgari={
                  mao.agariMeld?.indiceMeld === indiceMeld ? mao.agariMeld.indicePedra : undefined
                }
                selecionandoPedraAgari={selecionandoPedraAgari}
                permitirSelecaoAgariMeld={false}
                selecionarPedraAgariDireto={false}
                aoEscolherPedraAgariMeld={aoEscolherPedraAgariMeld}
                aoRemoverMeld={aoRemoverMeld}
              />
            ))}
            {meldsPendentes.map(({ indice, tipo, pedras }) => (
              <ChipMeldMao
                key={`meld-pendente-${indice}`}
                tipo={tipo}
                pendente
                titulo={t('calculator.removeMeld', { meld: t(ESTILO_MELD[tipo].rotulo) })}
                aoClicar={() => aoRemoverMeldPendente?.(indice)}
              >
                <PedrasMeld meld={{ tipo, pedras }} pendente />
              </ChipMeldMao>
            ))}
          </>
        )}
      </div>

      {contexto === 'montagem' && (
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
                    color: 'var(--cor-sobre-primario, #ffffff)',
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
        </div>
      )}
    </div>
  )
}
