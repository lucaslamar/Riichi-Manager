import { useCallback, useEffect, useRef, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import type { VentoMao } from '@/dominios/calculadora-mao/logica/mao'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  CADEIRAS,
  calcularResultado,
  declararRiichi,
  desfazer,
  encerrarPorAgariYame,
  finalizarPartida,
  KANJI_VENTO,
  ORDEM_VENTOS,
  registrarAbortivo,
  registrarChombo,
  registrarRon,
  registrarRyukyoku,
  registrarTsumo,
  ventoDaCadeira,
  voltarDoResultado,
  type Cadeira,
  type Partida,
} from '../../logica/partida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'
import CardPartida from '../componentes/CardPartida'
import JogarDados from '../componentes/JogarDados'
import ModalBatida from '../componentes/ModalBatida'
import { iniciarBatida, type EstadoBatida } from '../hooks/estadoBatida'
import {
  MenuJogador,
  ModalConfirmacao,
  ModalDiferenca,
  ModalMaos,
  ModalRyukyoku,
} from '../componentes/ModaisPartida'
import { usePartidas } from '../hooks/usePartidas'
import { useTimerVez } from '../hooks/useTimerVez'

/** Cadeira → lugar na tela. Fixo: não depende do vento. */
const AREA_DA_CADEIRA = ['cp-area-baixo', 'cp-area-direita', 'cp-area-topo', 'cp-area-esquerda']
const DURACAO_AVISO_MS = 2500

const ventoMao = (vento: (typeof ORDEM_VENTOS)[number]) =>
  String(ORDEM_VENTOS.indexOf(vento) + 1) as VentoMao

const contexto = () => ({ id: gerarId(), agora: new Date().toISOString() })

interface PropsPlacar {
  partida: Partida
  aoSair: () => void
  aoTrocarDeMesa: (id: string) => void
  aoFinalizar: () => void
}

export default function PlacarPartida({ partida, aoSair, aoTrocarDeMesa, aoFinalizar }: PropsPlacar) {
  const { t, numero } = useI18n()
  const { abertas, atualizar: atualizarLista } = usePartidas()
  const { jogadores } = useJogadores()

  const { id, placar, config, vez } = partida
  const atualizar = useCallback(
    (transformar: (atual: Partida) => Partida) => atualizarLista(id, transformar),
    [atualizarLista, id],
  )

  const nomeDe = (cadeira: Cadeira) => {
    const jogador = jogadores.find((item) => item.id === partida.assentos[cadeira].jogadorId)
    return jogador ? nomeExibido(jogador) : '—'
  }

  const [menuDe, setMenuDe] = useState<Cadeira | null>(null)
  const [diferencaDe, setDiferencaDe] = useState<Cadeira | null>(null)
  const [chomboDe, setChomboDe] = useState<Cadeira | null>(null)
  const [batida, setBatida] = useState<EstadoBatida | null>(null)
  const [ryukyokuAberto, setRyukyokuAberto] = useState(false)
  const [maosAbertas, setMaosAbertas] = useState(false)
  const [dadosAbertos, setDadosAbertos] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizadorAviso = useRef<number | undefined>(undefined)

  const modalAberta =
    menuDe !== null ||
    diferencaDe !== null ||
    chomboDe !== null ||
    batida !== null ||
    ryukyokuAberto ||
    maosAbertas ||
    dadosAbertos ||
    !!partida.fim

  const timer = useTimerVez(partida, atualizar, modalAberta)

  // Troca de vez e tempo esgotado no leitor de tela.
  const nomeDaVez = nomeDe(vez.cadeira)
  const anuncio = !timer.ligado
    ? ''
    : timer.esgotado
      ? t('match.timer.expiredAnnounce', { name: nomeDaVez })
      : vez.comecou
        ? t('match.timer.turnAnnounce', { name: nomeDaVez })
        : ''

  useEffect(() => () => window.clearTimeout(temporizadorAviso.current), [])
  const mostrarAviso = (texto: string) => {
    setAviso(texto)
    window.clearTimeout(temporizadorAviso.current)
    temporizadorAviso.current = window.setTimeout(() => setAviso(null), DURACAO_AVISO_MS)
  }

  const aoEscolherNoMenu = (
    cadeira: Cadeira,
    acao: 'vez' | 'ron' | 'tsumo' | 'riichi' | 'chombo' | 'diferenca',
  ) => {
    setMenuDe(null)
    if (acao === 'vez') timer.passarPara(cadeira)
    else if (acao === 'riichi') atualizar((atual) => declararRiichi(atual, cadeira, contexto()))
    else if (acao === 'chombo') setChomboDe(cadeira)
    else if (acao === 'diferenca') setDiferencaDe(cadeira)
    else setBatida(iniciarBatida({ tipo: acao, vencedor: cadeira }))
  }

  const receberCalculo = (resultado: ResultadoCalculoParaCenterpiece) => {
    if (!batida || batida.vencedorAtual === null) return
    setBatida({
      ...batida,
      calculadora: null,
      passo: 'confirmacao',
      vencedorAtual: null,
      vencedores: [...batida.vencedores, { cadeira: batida.vencedorAtual, resultado }],
    })
  }

  const aplicarBatida = () => {
    if (!batida) return
    const { vencedores, pagador, tipo } = batida
    if (tipo === 'ron' && pagador !== null) {
      atualizar((atual) =>
        registrarRon(
          atual,
          {
            pagador,
            vencedores: vencedores.map(({ cadeira, resultado }) => ({
              cadeira,
              pontos: resultado.pontosRon ?? 0,
              han: resultado.han,
              fu: resultado.fu,
              yakuman: resultado.yakuman,
            })),
          },
          contexto(),
        ),
      )
    } else if (tipo === 'tsumo' && vencedores[0]) {
      const { cadeira, resultado } = vencedores[0]
      atualizar((atual) =>
        registrarTsumo(
          atual,
          {
            vencedor: cadeira,
            pagamentoDealer: resultado.pagamentoDealer ?? 0,
            pagamentoNaoDealer: resultado.pagamentoNaoDealer ?? 0,
            han: resultado.han,
            fu: resultado.fu,
            yakuman: resultado.yakuman,
          },
          contexto(),
        ),
      )
    }
    setBatida(null)
  }

  if (partida.fim) {
    return (
      <ResultadoFinalTela
        partida={partida}
        nomeDe={nomeDe}
        aoFinalizar={() => {
          atualizar((atual) => finalizarPartida(atual, new Date().toISOString()))
          aoFinalizar()
        }}
        aoCorrigir={() => atualizar(voltarDoResultado)}
      />
    )
  }

  const vencedorAtual = batida?.vencedorAtual ?? null
  const vencedorEhDealer = vencedorAtual === placar.cadeiraDealer

  return (
    <>
      {/* A mesa continua montada atrás da calculadora, com o timer pausado. */}
      <div hidden={!!batida?.calculadora}>
        <div className="centerpiece-mesa">
          <TituloTela
            aoVoltar={aoSair}
            titulo={
              <label className="ptd-seletor-mesa">
                <span className="sr-only">{t('match.table.switch')}</span>
                <select value={id} onChange={(evento) => aoTrocarDeMesa(evento.target.value)}>
                  {abertas.map((aberta, indice) => (
                    <option key={aberta.id} value={aberta.id}>
                      {t('match.table.number', { number: indice + 1 })}
                    </option>
                  ))}
                </select>
              </label>
            }
          />

          <div className="sr-only" aria-live="polite">
            {anuncio}
          </div>

          <div className="cp-compass">
            {CADEIRAS.map((cadeira) => (
              <div key={cadeira} className={AREA_DA_CADEIRA[cadeira]}>
                <CardPartida
                  nome={nomeDe(cadeira)}
                  vento={ventoDaCadeira(cadeira, placar.cadeiraDealer)}
                  pontos={placar.pontos[cadeira]}
                  emRiichi={placar.riichi.includes(cadeira)}
                  timer={
                    timer.ligado && vez.cadeira === cadeira
                      ? {
                          segundos: timer.segundos,
                          fracao: timer.fracao,
                          esgotado: timer.esgotado,
                          aoTocar: timer.tocar,
                        }
                      : undefined
                  }
                  aoAbrirMenu={() => setMenuDe(cadeira)}
                  aoSegurar={() => setDiferencaDe(cadeira)}
                />
              </div>
            ))}

            <div className="cp-area-centro">
              <div className="centerpiece-painel-central">
                <div className="ptd-rodada">
                  <strong aria-hidden="true">
                    {KANJI_VENTO[placar.rodadaVento]}
                    {placar.rodadaNumero}
                  </strong>
                  <span className="sr-only">
                    {t('match.table.round', {
                      wind: t(`winds.${{ leste: 'east', sul: 'south', oeste: 'west', norte: 'north' }[placar.rodadaVento]}`),
                      number: placar.rodadaNumero,
                    })}
                  </span>
                  <span>
                    本{placar.honba} · 棒{placar.palitos}
                  </span>
                  {timer.ligado && vez.comecou && (
                    <button
                      type="button"
                      className="ptd-btn-icone"
                      aria-label={t(timer.contando ? 'match.timer.pause' : 'match.timer.resume')}
                      onClick={timer.alternarPausa}
                    >
                      <i className={`fas ${timer.contando ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-primario ptd-btn-largo"
                  onClick={() => setBatida(iniciarBatida())}
                >
                  {t('match.win.title')}
                </button>
                {partida.agariYameDisponivel && (
                  <button
                    type="button"
                    className="btn-contorno ptd-btn-largo"
                    onClick={() => atualizar(encerrarPorAgariYame)}
                  >
                    {t('match.table.agariYame')}
                  </button>
                )}
                <div className="ptd-acoes-mesa">
                  <JogarDados
                    cadeiraDealer={placar.cadeiraDealer}
                    className="btn-contorno"
                    aoMudarAberto={setDadosAbertos}
                  />
                  <button
                    type="button"
                    className="btn-contorno"
                    onClick={() => setRyukyokuAberto(true)}
                  >
                    <i className="fas fa-equals" aria-hidden="true" />
                    {t('match.draw.short')}
                  </button>
                  <button
                    type="button"
                    className="btn-contorno"
                    disabled={partida.eventos.length === 0}
                    onClick={() => {
                      atualizar(desfazer)
                      mostrarAviso(t('match.table.undone'))
                    }}
                  >
                    <i className="fas fa-rotate-left" aria-hidden="true" />
                    {t('match.table.undo')}
                  </button>
                  <button type="button" className="btn-contorno" onClick={() => setMaosAbertas(true)}>
                    <i className="fas fa-list" aria-hidden="true" />
                    {t('match.hands.short')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {aviso && (
            <p className="ptd-aviso" role="status">
              {aviso}
            </p>
          )}
        </div>
      </div>

      {batida?.calculadora === 'hanFu' && vencedorAtual !== null && (
        <div className="ptd-calculadora">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setBatida({ ...batida, calculadora: null })}
          >
            <i className="fas fa-arrow-left" aria-hidden="true" />
            {t('actions.back')}
          </button>
          <p className="ptd-rotulo">
            {nomeDe(vencedorAtual)} · {t(`calculator.${batida.tipo}`)}
          </p>
          <PaginaCalculadoraHanFu
            aoUsarResultado={receberCalculo}
            initialIsOya={vencedorEhDealer}
            initialAgari={batida.tipo}
            initialHonba={placar.honba}
          />
        </div>
      )}

      {batida?.calculadora === 'mao' && vencedorAtual !== null && (
        <PaginaCalculadoraMao
          aoUsarResultado={receberCalculo}
          aoVoltar={() => setBatida({ ...batida, calculadora: null })}
          contextoCenterpiece={{
            tipoVitoria: batida.tipo,
            ventoRodada: ventoMao(placar.rodadaVento),
            ventoAssento: ventoMao(ventoDaCadeira(vencedorAtual, placar.cadeiraDealer)),
            honba: placar.honba,
            rodadaNumero: placar.rodadaNumero,
            vencedorEhLeste: vencedorEhDealer,
            vencedorNome: nomeDe(vencedorAtual),
            jogadorRiichi: placar.riichi.includes(vencedorAtual),
          }}
        />
      )}

      {batida && !batida.calculadora && (
        <ModalBatida
          partida={partida}
          batida={batida}
          nomeDe={nomeDe}
          aoMudar={setBatida}
          aoAplicar={aplicarBatida}
          aoFechar={() => setBatida(null)}
        />
      )}

      {menuDe !== null && (
        <MenuJogador
          partida={partida}
          cadeira={menuDe}
          nome={nomeDe(menuDe)}
          podeReceberVez={timer.ligado && vez.cadeira !== menuDe}
          aoEscolher={(acao) => aoEscolherNoMenu(menuDe, acao)}
          aoFechar={() => setMenuDe(null)}
        />
      )}

      {diferencaDe !== null && (
        <ModalDiferenca
          partida={partida}
          cadeira={diferencaDe}
          nomeDe={nomeDe}
          aoFechar={() => setDiferencaDe(null)}
        />
      )}

      {chomboDe !== null && (
        <ModalConfirmacao
          titulo={t('match.chombo.title', { name: nomeDe(chomboDe) })}
          texto={
            config.chombo.tipo === 'fixo'
              ? t('match.chombo.fixedHelp', { points: numero(config.chombo.valor) })
              : t(chomboDe === placar.cadeiraDealer ? 'match.chombo.dealerHelp' : 'match.chombo.reverseHelp')
          }
          rotuloConfirmar={t('match.chombo.confirm')}
          perigo
          aoFechar={() => setChomboDe(null)}
          aoConfirmar={() => {
            atualizar((atual) => registrarChombo(atual, chomboDe, contexto()))
            setChomboDe(null)
          }}
        />
      )}

      {ryukyokuAberto && (
        <ModalRyukyoku
          partida={partida}
          nomeDe={nomeDe}
          aoFechar={() => setRyukyokuAberto(false)}
          aoConfirmar={(dados) => {
            atualizar((atual) => registrarRyukyoku(atual, dados, contexto()))
            setRyukyokuAberto(false)
          }}
          aoAbortivo={(abortivo) => {
            atualizar((atual) => registrarAbortivo(atual, abortivo, contexto()))
            setRyukyokuAberto(false)
          }}
        />
      )}

      {maosAbertas && (
        <ModalMaos partida={partida} nomeDe={nomeDe} aoFechar={() => setMaosAbertas(false)} />
      )}
    </>
  )
}

/** Colocação, pontos brutos, uma/oka aplicados e pontuação final. */
function ResultadoFinalTela({
  partida,
  nomeDe,
  aoFinalizar,
  aoCorrigir,
}: {
  partida: Partida
  nomeDe: (cadeira: Cadeira) => string
  aoFinalizar: () => void
  aoCorrigir: () => void
}) {
  const { t, numero } = useI18n()
  const decimal = (valor: number) =>
    `${valor > 0 ? '+' : ''}${numero(valor)}`

  return (
    <section className="card ptd-resultado">
      <h2>{t('match.result.title')}</h2>
      <p className="ptd-apoio">{t(`match.result.reason.${partida.fim}`)}</p>
      <ol className="ptd-resultado-lista">
        {calcularResultado(partida).map((linha) => (
          <li key={linha.cadeira}>
            <span className="ptd-resultado-lugar">{t('match.result.place', { place: linha.colocacao })}</span>
            <div className="ptd-resultado-dados">
              <strong>{nomeDe(linha.cadeira)}</strong>
              <span className="ptd-apoio">
                {t('match.result.breakdown', {
                  raw: numero(linha.pontosBrutos),
                  uma: decimal(linha.uma),
                  oka: decimal(linha.oka),
                })}
                {linha.multa > 0 ? ` · ${t('match.result.penalty', { points: numero(linha.multa) })}` : ''}
              </span>
            </div>
            <strong className={linha.final < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
              {decimal(linha.final)}
            </strong>
          </li>
        ))}
      </ol>
      <div className="ptd-acoes-folha">
        <button type="button" className="btn-contorno" onClick={aoCorrigir}>
          {t('match.result.correct')}
        </button>
        <button type="button" className="btn-primario" onClick={aoFinalizar}>
          {t('match.result.finish')}
        </button>
      </div>
    </section>
  )
}
