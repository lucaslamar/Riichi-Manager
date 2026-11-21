import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BotaoTelaCheia from '@/compartilhado/interface/componentes/BotaoTelaCheia'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import CalculadoraMaoChinesa from '@/dominios/calculadora-mao-chinesa/interface/CalculadoraMaoChinesa'
import { FAN_MINIMO_MCR } from '@/dominios/calculadora-mao-chinesa/logica/fan-mcr'
import type { Vento as VentoMcr } from '@/dominios/calculadora-mao-chinesa/logica/montagem'
import JogarDados from '@/dominios/centerpiece/interface/componentes/JogarDados'
import MesaQuadrada from '@/dominios/centerpiece/interface/componentes/MesaQuadrada'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import PlacaJogador from '@/dominios/centerpiece/interface/componentes/PlacaJogador'
import { useRelogioVez } from '@/dominios/centerpiece/interface/hooks/useTimerVez'
import {
  CHAVE_VENTO,
  KANJI_VENTO,
  ORDEM_VENTOS,
  ventoDaCadeira,
} from '@/dominios/centerpiece/logica/partida'
import type { EstadoVez } from '@/dominios/centerpiece/logica/vez'
import '@/dominios/centerpiece/interface/partida.css'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  CADEIRAS,
  dealerDaMao,
  desfazerUltimaMao,
  finalizar,
  MAOS_POR_RODADA,
  pontosDaMao,
  registrarMao,
  TOTAL_MAOS,
  totais,
  ventoDaRodada,
  type Cadeira,
  type MaoMcr,
  type PlacarMcr,
} from '../logica/placar'
import ModalBatidaMcr, { maoDaBatida, type BatidaMcr } from './ModalBatidaMcr'
import { nomeDaCadeira } from './nomes'
import { acoesPlacaresMcr } from './usePlacaresMcr'

type Confirmacao = 'desfazer' | 'finalizar' | 'excluir'

const TEXTOS_CONFIRMACAO: Record<Confirmacao, { titulo: string; texto: string; botao: string }> = {
  desfazer: {
    titulo: 'placar.mcr.desfazer',
    texto: 'placar.mcr.confirmarDesfazer',
    botao: 'match.table.undo',
  },
  finalizar: {
    titulo: 'placar.mcr.finalizar',
    texto: 'placar.mcr.confirmarFinalizar',
    botao: 'placar.mcr.finalizar',
  },
  excluir: {
    titulo: 'placar.mcr.excluir',
    texto: 'placar.mcr.confirmarExcluir',
    botao: 'placar.mcr.excluir',
  },
}

/** Vento da mesa (Leste a Norte) no id de pedra do motor MCR (28 a 31). */
const paraVentoMcr = (indice: number) => (28 + indice) as VentoMcr

/**
 * Mesa do placar MCR com a mesma tela da mesa do Riichi: as placas em volta, o
 * centro com a rodada e o timer da vez, Descarte e Tsumo de quem está na vez e a
 * linha Iniciar, Dados, Empate, Histórico e Desfazer. Muda só a regra: 8 pontos
 * obrigatórios, sem honba nem palitos, e o dealer passa a cada mão.
 */
export default function PlacarAberto({
  placar,
  aoVoltar,
}: {
  placar: PlacarMcr
  aoVoltar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const [batida, setBatida] = useState<BatidaMcr | null>(null)
  const [maosAbertas, setMaosAbertas] = useState(false)
  const [empateAberto, setEmpateAberto] = useState(false)
  const [confirmando, setConfirmando] = useState<Confirmacao | null>(null)
  const [dadosAbertos, setDadosAbertos] = useState(false)
  const nomes = placar.jogadorIds.map((id) =>
    nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido'), placar.convidados),
  )
  const pontos = totais(placar)
  const indiceMao = placar.maos.length
  const emAndamento = !placar.finalizadoEm
  const dealer = dealerDaMao(indiceMao)
  const indiceRodada = ventoDaRodada(Math.min(indiceMao, TOTAL_MAOS - 1))
  const rodada = ORDEM_VENTOS[indiceRodada]
  const numeroNaRodada = (Math.min(indiceMao, TOTAL_MAOS - 1) % MAOS_POR_RODADA) + 1
  const daVez = placar.vez.cadeira as Cadeira
  const atualizar = (transformar: (atual: PlacarMcr) => PlacarMcr) =>
    acoesPlacaresMcr.atualizar(placar.id, transformar)

  const atualizarVez = useCallback(
    (transformar: (vez: EstadoVez) => EstadoVez) =>
      acoesPlacaresMcr.atualizar(placar.id, (atual) => ({ ...atual, vez: transformar(atual.vez) })),
    [placar.id],
  )
  const relogio = useRelogioVez(
    placar.vez,
    emAndamento ? placar.timerSegundos : 0,
    atualizarVez,
    batida !== null || maosAbertas || empateAberto || confirmando !== null || dadosAbertos,
  )

  const salvarMao = (mao: MaoMcr) => {
    atualizar((atual) => registrarMao(atual, mao))
    setBatida(null)
  }
  const novaBatida = (forma: BatidaMcr['forma']): BatidaMcr => ({
    forma,
    daVez,
    vencedor: forma === 'tsumo' ? daVez : null,
    passo: forma === 'tsumo' ? 'calculo' : 'descarte',
    fan: FAN_MINIMO_MCR,
    calculadora: null,
  })
  const confirmar = (qual: Confirmacao) => {
    if (qual === 'desfazer') atualizar(desfazerUltimaMao)
    if (qual === 'finalizar') atualizar((atual) => finalizar(atual, new Date().toISOString()))
    if (qual === 'excluir') {
      acoesPlacaresMcr.excluir(placar.id)
      aoVoltar()
    }
    setConfirmando(null)
  }

  return (
    // O mesmo invólucro da mesa do Riichi (ptd-modulo), que acerta a altura com a barra inferior.
    <section className="ptd-modulo">
      {/* A mesa continua montada atrás da calculadora, como no Riichi. */}
      <div hidden={!!batida?.calculadora}>
        <section className="mesa-tela">
          {/* Com a calculadora aberta, o título é o dela (fica no mesmo cabeçalho). */}
          {!batida?.calculadora && (
            <TituloTela
              titulo={t('menu.scoreMcr')}
              aoVoltar={aoVoltar}
              acoes={<BotaoTelaCheia />}
            />
          )}

          <div className="mesa-centro-tela">
            <MesaQuadrada
              cadeiraDealer={dealer}
              aoTocarMesa={relogio.ligado ? relogio.tocar : undefined}
              aoTocarDomo={relogio.ligado ? relogio.alternarPausa : undefined}
              rotuloDomo={t(relogio.contando ? 'match.timer.pause' : 'match.timer.resume')}
              domo={
                <>
                  <span className="mesa-domo-rodada" aria-hidden="true">
                    {KANJI_VENTO[rodada]}
                    {numeroNaRodada}
                  </span>
                  <span className="sr-only">
                    {t('match.table.round', {
                      wind: t(CHAVE_VENTO[rodada]),
                      number: numeroNaRodada,
                    })}
                  </span>
                  <span className="mesa-domo-info">
                    {relogio.ligado && placar.vez.comecou && !relogio.contando && (
                      <i className="fas fa-pause" aria-hidden="true" />
                    )}{' '}
                    {t('placar.mcr.maoCurta', { mao: numero(Math.min(indiceMao + 1, TOTAL_MAOS)) })}
                  </span>
                </>
              }
              lado={(cadeira) => ({
                placa: (
                  <PlacaJogador
                    nome={nomes[cadeira]}
                    vento={ventoDaCadeira(cadeira, dealer)}
                    pontos={pontos[cadeira]}
                    emRiichi={false}
                    timer={
                      relogio.ligado && daVez === cadeira
                        ? {
                            segundos: relogio.segundos,
                            fracao: relogio.fracao,
                            esgotado: relogio.esgotado,
                          }
                        : undefined
                    }
                    daVez={daVez === cadeira}
                    aoAbrirMenu={() => undefined}
                    aoSegurar={() => undefined}
                  />
                ),
              })}
            />
          </div>

          <div className="mesa-acoes">
            {emAndamento ? (
              <>
                {indiceMao >= TOTAL_MAOS && (
                  <p className="mesa-aviso" role="status">
                    {t('placar.mcr.partidaCompleta')}
                  </p>
                )}
                <button
                  type="button"
                  className="mesa-btn-principal mesa-btn-descarte"
                  onClick={() => setBatida(novaBatida('ron'))}
                >
                  {t('match.table.discard', { name: nomes[daVez] })}
                </button>
                <button
                  type="button"
                  className="mesa-btn-principal"
                  onClick={() => setBatida(novaBatida('tsumo'))}
                >
                  {t('match.win.tsumoOf', { name: nomes[daVez] })}
                </button>
                <div
                  className={`mesa-linha-acoes${relogio.ligado ? ' mesa-linha-acoes--timer' : ''}`}
                >
                  {relogio.ligado && (
                    <button
                      type="button"
                      className={relogio.contando ? undefined : 'mesa-btn-timer--parado'}
                      onClick={relogio.alternarPausa}
                    >
                      <i
                        className={`fas ${relogio.contando ? 'fa-pause' : 'fa-play'}`}
                        aria-hidden="true"
                      />
                      {t(
                        relogio.contando
                          ? 'match.timer.pauseShort'
                          : placar.vez.comecou
                            ? 'match.timer.resumeShort'
                            : 'match.timer.start',
                      )}
                    </button>
                  )}
                  <JogarDados cadeiraDealer={dealer} aoMudarAberto={setDadosAbertos} />
                  <button type="button" onClick={() => setEmpateAberto(true)}>
                    <i className="fas fa-equals" aria-hidden="true" />
                    {t('placar.mcr.empate')}
                  </button>
                  <button type="button" onClick={() => setMaosAbertas(true)}>
                    <i className="fas fa-file-pen" aria-hidden="true" />
                    {t('match.history.open')}
                  </button>
                  <button
                    type="button"
                    disabled={placar.maos.length === 0}
                    onClick={() => setConfirmando('desfazer')}
                  >
                    <i className="fas fa-rotate-left" aria-hidden="true" />
                    {t('match.table.undo')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mesa-aviso" role="status">
                  {t('placar.mcr.finalizada')}
                </p>
                <div className="mesa-linha-acoes">
                  <button type="button" onClick={() => setMaosAbertas(true)}>
                    <i className="fas fa-file-pen" aria-hidden="true" />
                    {t('match.history.open')}
                  </button>
                  <button type="button" onClick={() => setConfirmando('excluir')}>
                    <i className="fas fa-trash" aria-hidden="true" />
                    {t('placar.mcr.excluir')}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {batida && !batida.calculadora && (
        <ModalBatidaMcr
          batida={batida}
          nomes={nomes}
          pontos={pontos}
          dealer={dealer}
          aoMudar={setBatida}
          aoPassarVez={() => {
            relogio.passarPara(((daVez + 1) % 4) as Cadeira)
            setBatida(null)
          }}
          aoAplicar={() => salvarMao(maoDaBatida(batida))}
          aoFechar={() => setBatida(null)}
        />
      )}

      {/* O CSS das calculadoras conta com elas como filhas diretas do `main`. */}
      {batida?.calculadora &&
        batida.vencedor !== null &&
        createPortal(
          <CalculadoraMaoChinesa
            key={batida.calculadora}
            visivel
            titulo={`${nomes[batida.vencedor]} · ${t(`calculator.${batida.forma}`)}`}
            aoVoltar={() => setBatida({ ...batida, calculadora: null })}
            entradaInicial={batida.calculadora}
            condicoesIniciais={{
              forma: batida.forma,
              ventoRodada: paraVentoMcr(indiceRodada),
              ventoAssento: paraVentoMcr(
                ORDEM_VENTOS.indexOf(ventoDaCadeira(batida.vencedor, dealer)),
              ),
            }}
            aoUsarFan={(fan) =>
              setBatida({ ...batida, fan, calculadora: null, passo: 'confirmacao' })
            }
          />,
          document.querySelector('main.conteudo-principal') ?? document.body,
        )}

      {empateAberto && (
        <ModalConfirmacao
          titulo={t('placar.mcr.empate')}
          texto={t('placar.mcr.empateTexto')}
          rotuloConfirmar={t('placar.mcr.empate')}
          aoConfirmar={() => {
            salvarMao({ tipo: 'empate' })
            setEmpateAberto(false)
          }}
          aoFechar={() => setEmpateAberto(false)}
        />
      )}

      {confirmando && (
        <ModalConfirmacao
          titulo={t(TEXTOS_CONFIRMACAO[confirmando].titulo)}
          texto={t(TEXTOS_CONFIRMACAO[confirmando].texto)}
          rotuloConfirmar={t(TEXTOS_CONFIRMACAO[confirmando].botao)}
          perigo={confirmando === 'excluir'}
          aoConfirmar={() => confirmar(confirmando)}
          aoFechar={() => setConfirmando(null)}
        />
      )}

      {maosAbertas && (
        <Modal
          titulo={t('match.history.open')}
          aoFechar={() => setMaosAbertas(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            emAndamento ? (
              <div className="ptd-acoes-folha">
                <button
                  type="button"
                  className="btn-primario"
                  onClick={() => {
                    setMaosAbertas(false)
                    setConfirmando('finalizar')
                  }}
                >
                  {t('placar.mcr.finalizar')}
                </button>
              </div>
            ) : undefined
          }
        >
          <ol className="placar-mcr__historico">
            {placar.maos.length === 0 && <li>{t('placar.mcr.semMaos')}</li>}
            {placar.maos.map((mao, indice) => {
              const deltas = pontosDaMao(mao)
              return (
                <li key={indice}>
                  <span>
                    {mao.tipo === 'empate'
                      ? t('placar.mcr.historicoEmpate')
                      : mao.forma === 'tsumo'
                        ? t('placar.mcr.historicoTsumo', {
                            nome: nomes[mao.vencedor],
                            fan: numero(mao.fan),
                          })
                        : t('placar.mcr.historicoRon', {
                            nome: nomes[mao.vencedor],
                            descartador: nomes[mao.descartador!],
                            fan: numero(mao.fan),
                          })}
                  </span>
                  {mao.tipo === 'vitoria' && (
                    <span className="placar-mcr__deltas">
                      {CADEIRAS.map((cadeira) => (
                        <span key={cadeira}>
                          {nomes[cadeira]}{' '}
                          {(deltas[cadeira] > 0 ? '+' : '') + numero(deltas[cadeira])}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </Modal>
      )}
    </section>
  )
}
