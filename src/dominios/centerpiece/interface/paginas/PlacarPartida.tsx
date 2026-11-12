import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BotaoTelaCheia from '@/compartilhado/interface/componentes/BotaoTelaCheia'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import SeloTorneio from '@/dominios/torneio/interface/componentes/SeloTorneio'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import type { VentoMao } from '@/dominios/calculadora-mao/logica/mao'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeDoAssento } from '../nomeDoAssento'
import { dadosDaPartidaParaMao } from '../../logica/dadosDaPartida'
import { numerosDaParede } from '../../logica/dados'
import { ehQuatroVentos, pedrasNoMuro, ultimoDescarteDaMao } from '../../logica/descartes'
import { chamarPedra, desfazerUltimoDaMesa } from '../../logica/registroPartida'
import {
  cadeirasDaPartida,
  jogadoresNaMesa,
  calcularResultado,
  declararRiichi,
  encerrarPorAgariYame,
  finalizarPartida,
  CHAVE_VENTO,
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
import AdSlot from '@/compartilhado/interface/componentes/AdSlot'
import MesaQuadrada from '../componentes/MesaQuadrada'
import PlacaJogador from '../componentes/PlacaJogador'
import JogarDados from '../componentes/JogarDados'
import ListaResultado from '../componentes/ListaResultado'
import ModalBatida from '../componentes/ModalBatida'
import ModalRio from '../componentes/ModalRio'
import RecursosDaMesa from '../componentes/RecursosDaMesa'
import { ModalAvisoFuriten, ModalChecarFuriten } from '../componentes/ModaisFuriten'
import ModalDescartes, { type DecisaoDescarte } from '../componentes/ModalDescartes'
import {
  iniciarBatida,
  iniciarRonDoDescarte,
  iniciarTsumoDaVez,
  type EstadoBatida,
} from '../hooks/estadoBatida'
import {
  MenuJogador,
  ModalConfirmacao,
  ModalDiferenca,
  ModalMaos,
  ModalRyukyoku,
  ResumoChombo,
} from '../componentes/ModaisPartida'
import { useDescartes } from '../hooks/useDescartes'
import ModalHistoricoAcoes from '../componentes/ModalHistoricoAcoes'
import {
  anotarHistorico,
  anotarPaarenchan,
  historicoDe,
  sequenciaPaarenchan,
} from '../../logica/historicoAcoes'
import { lerYakusLocais, useYakusLocais } from '@/compartilhado/configuracoes/useYakusLocais'
import { usePartidas } from '../hooks/usePartidas'
import { useTimerVez } from '../hooks/useTimerVez'

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
  const { abertas, atualizar: atualizarLista, descartar } = usePartidas()
  const { jogadores } = useJogadores()
  const { yakusLocais } = useYakusLocais()

  const { id, placar, config, vez } = partida
  // Toda mudança passa pelo histórico de ações: o que entrou ou saiu dos eventos vira linha.
  const atualizar = useCallback(
    (transformar: (atual: Partida) => Partida) =>
      atualizarLista(id, (atual) => {
        const agora = new Date().toISOString()
        const depois = anotarHistorico(atual, transformar(atual), agora)
        const locais = lerYakusLocais()
        return locais.ativos.includes('paarenchan')
          ? anotarPaarenchan(atual, depois, locais.paarenchan.variacao, agora)
          : depois
      }),
    [atualizarLista, id],
  )

  // Convidado do clube aparece pelo nome guardado; quem saiu do cadastro, com "—".
  const nomeDe = (cadeira: Cadeira) => nomeDoAssento(jogadores, partida.assentos[cadeira], () => '—')

  const [menuDe, setMenuDe] = useState<Cadeira | null>(null)
  const [rioDe, setRioDe] = useState<Cadeira | null>(null)
  const [diferencaDe, setDiferencaDe] = useState<Cadeira | null>(null)
  const [chomboDe, setChomboDe] = useState<Cadeira | null>(null)
  const [batida, setBatida] = useState<EstadoBatida | null>(null)
  const [ryukyokuAberto, setRyukyokuAberto] = useState(false)
  const [maosAbertas, setMaosAbertas] = useState(false)
  const [dadosAbertos, setDadosAbertos] = useState(false)
  const [descarteRapido, setDescarteRapido] = useState<{ cadeira: Cadeira; expirou: boolean } | null>(null)
  const [checarFuritenDe, setChecarFuritenDe] = useState<Cadeira | null>(null)
  const [avisoFuritenDe, setAvisoFuritenDe] = useState<Cadeira | null>(null)
  const [quatroVentosAberto, setQuatroVentosAberto] = useState(false)
  const [abortando, setAbortando] = useState(false)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  // Avisos empilhados no centro da mesa, cada um somindo no seu tempo.
  const [avisos, setAvisos] = useState<{ id: number; texto: string }[]>([])
  const proximoAviso = useRef(0)
  const temporizadoresAviso = useRef<number[]>([])

  const modalAberta =
    menuDe !== null ||
    rioDe !== null ||
    diferencaDe !== null ||
    chomboDe !== null ||
    batida !== null ||
    ryukyokuAberto ||
    maosAbertas ||
    dadosAbertos ||
    checarFuritenDe !== null ||
    avisoFuritenDe !== null ||
    quatroVentosAberto ||
    abortando ||
    historicoAberto ||
    !!partida.fim

  const timer = useTimerVez(partida, atualizar, modalAberta, descarteRapido !== null)
  const acoesDescartes = useDescartes(atualizar)
  const fecharAvisoFuriten = useCallback(() => setAvisoFuritenDe(null), [])

  // Todo descarte é registrado: é dele que saem a vez, o rio e as pedras do muro.
  const abrirDescarte = () => {
    if (!vez.comecou) timer.tocar()
    setDescarteRapido({ cadeira: vez.cadeira, expirou: false })
  }
  const muro = pedrasNoMuro(partida.registro?.lances ?? [], jogadoresNaMesa(partida))

  // Timer zerou: abre o descarte de quem estourou, uma vez por vez, ou avisa no que já
  // está aberto. O alarme para aqui; fechar pelo X volta ao alarme e ao card piscando.
  const estouroAberto = useRef(false)
  if (vez.restanteMs > 0) estouroAberto.current = false
  useEffect(() => {
    if (!timer.esgotado || modalAberta || estouroAberto.current) return
    estouroAberto.current = true
    setDescarteRapido({ cadeira: vez.cadeira, expirou: true })
  }, [timer.esgotado, modalAberta, vez.cadeira])

  /** Depois do descarte: de quem é a vez agora, e se a mão acabou em ron. */
  const decidirDescarte = (origem: Cadeira, decisao: DecisaoDescarte) => {
    setDescarteRapido(null)
    if (decisao.tipo === 'ron') {
      setBatida(iniciarRonDoDescarte(origem, decisao.cadeiras, decisao.ordem))
    } else if (decisao.tipo === 'chamada') {
      const { cadeira, chamada, ordem } = decisao
      atualizar((atual) => chamarPedra(atual, ordem, { cadeira, tipo: chamada }))
      timer.passarPara(cadeira)
      setDescarteRapido({ cadeira, expirou: false })
    } else {
      timer.passarPara(((origem + 1) % jogadoresNaMesa(partida)) as Cadeira)
      // Ninguém chamou o último descarte: a mão acaba em ryukyoku.
      if (ultimoDescarteDaMao(partida.registro?.lances ?? [], jogadoresNaMesa(partida))) setRyukyokuAberto(true)
    }
  }

  // Troca de vez e tempo esgotado no leitor de tela.
  const nomeDaVez = nomeDe(vez.cadeira)
  const anuncio = !timer.ligado
    ? ''
    : timer.esgotado
      ? t('match.timer.expiredAnnounce', { name: nomeDaVez })
      : vez.comecou
        ? t('match.timer.turnAnnounce', { name: nomeDaVez })
        : ''

  useEffect(() => () => temporizadoresAviso.current.forEach((id) => window.clearTimeout(id)), [])
  const mostrarAviso = (texto: string) => {
    const id = (proximoAviso.current += 1)
    setAvisos((atuais) => [...atuais.slice(-2), { id, texto }])
    temporizadoresAviso.current.push(
      window.setTimeout(() => setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id)), DURACAO_AVISO_MS),
    )
  }

  const aoEscolherNoMenu = (
    cadeira: Cadeira,
    acao: 'vez' | 'ron' | 'tsumo' | 'riichi' | 'chombo' | 'diferenca' | 'descartes' | 'furiten',
  ) => {
    setMenuDe(null)
    if (acao === 'vez') timer.passarPara(cadeira)
    else if (acao === 'riichi') atualizar((atual) => declararRiichi(atual, cadeira, contexto()))
    else if (acao === 'chombo') setChomboDe(cadeira)
    else if (acao === 'descartes') setRioDe(cadeira)
    else if (acao === 'furiten') setChecarFuritenDe(cadeira)
    else if (acao === 'diferenca') setDiferencaDe(cadeira)
    else setBatida(iniciarBatida({ tipo: acao, vencedor: cadeira }))
  }

  const receberCalculo = (resultado: ResultadoCalculoParaCenterpiece) => {
    if (!batida || batida.vencedorAtual === null) return
    const [proximo, ...pendentes] = batida.pendentes ?? []
    setBatida({
      ...batida,
      calculadora: null,
      // Ron de mais de um jogador: segue para o próximo antes de confirmar.
      passo: proximo === undefined ? 'confirmacao' : 'calculo',
      vencedorAtual: proximo ?? null,
      pendentes,
      vencedores: [...batida.vencedores, { cadeira: batida.vencedorAtual, resultado }],
    })
  }

  const aplicarBatida = () => {
    if (!batida) return
    const { vencedores, pagador, tipo, ordemDescarte } = batida
    if (tipo === 'ron' && pagador !== null) {
      atualizar((atual) =>
        registrarRon(
          ordemDescarte === undefined || !vencedores[0]
            ? atual
            : chamarPedra(atual, ordemDescarte, { cadeira: vencedores[0].cadeira, tipo: 'ron' }),
          {
            pagador,
            vencedores: vencedores.map(({ cadeira, resultado }) => ({
              cadeira,
              pontos: resultado.pontosRon ?? 0,
              han: resultado.han,
              fu: resultado.fu,
              yakuman: resultado.yakuman,
              montada: resultado.maoMontada,
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
            montada: resultado.maoMontada,
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

  // Paarenchan ligado: avisa quando falta uma vitória para o Yakuman.
  const sequencia = yakusLocais.ativos.includes('paarenchan')
    ? sequenciaPaarenchan(partida, yakusLocais.paarenchan.variacao)
    : null
  const pertoDoPaarenchan = sequencia && sequencia.quantas >= (yakusLocais.paarenchan.variacao === 3 ? 8 : 7) ? sequencia : null

  const vencedorAtual = batida?.vencedorAtual ?? null
  const vencedorEhDealer = vencedorAtual === placar.cadeiraDealer

  return (
    <>
      {/* A mesa continua montada atrás da calculadora, com o timer pausado. */}
      <div hidden={!!batida?.calculadora}>
        <div className="mesa-tela">
          {batida?.calculadora && vencedorAtual !== null ? (
            <TituloTela
              titulo={`${nomeDe(vencedorAtual)} · ${t(`calculator.${batida.tipo}`)}`}
              aoVoltar={() => setBatida({ ...batida, calculadora: null })}
            />
          ) : (
            <TituloTela
              aoVoltar={aoSair}
              acoes={
                <>
                  <button
                    type="button"
                    className="ptd-btn-historico"
                    aria-label={t('match.history.title')}
                    onClick={() => setHistoricoAberto(true)}
                  >
                    <i className="fas fa-list-ul" aria-hidden="true" />
                  </button>
                  <BotaoTelaCheia />
                </>
              }
              titulo={
                <>
                {partida.vinculoTorneio ? (
                  <SeloTorneio vinculo={partida.vinculoTorneio} />
                ) : (
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
                )}
                <button type="button" className="mesa-abortar" onClick={() => setAbortando(true)}>
                  <i className="fas fa-ban" aria-hidden="true" /> {t('match.table.abort')}
                </button>
                </>
              }
            />
          )}

          <RecursosDaMesa />

          <div className="sr-only" aria-live="polite">
            {anuncio}
          </div>


          <AdSlot />

          <div className="mesa-centro-tela">
            {/* Avisos sobre o centro da mesa, longe dos botões de ação. */}
            <div className="ptd-avisos" role="status" aria-live="polite">
              {avisos.map((aviso) => (
                <p key={aviso.id} className="ptd-aviso ptd-aviso--mesa">
                  {aviso.texto}
                </p>
              ))}
            </div>
            <MesaQuadrada
              cadeiraDealer={placar.cadeiraDealer}
              cadeiras={cadeirasDaPartida(partida)}
              ladoVazio={
                partida.variante === 'sanma' ? (
                  <div className="mesa-painel-sanma" aria-hidden="true">
                    <strong>
                      {KANJI_VENTO[placar.rodadaVento]}
                      {placar.rodadaNumero}
                    </strong>
                    <span>
                      本{placar.honba} · 棒{placar.palitos}
                    </span>
                    <span>{t('sanma.sanma')}</span>
                  </div>
                ) : undefined
              }
              aoTocarDomo={timer.ligado ? timer.alternarPausa : undefined}
              rotuloDomo={`${t(timer.contando ? 'match.timer.pause' : 'match.timer.resume')}. ${t('match.table.wall', { count: muro })}`}
              domo={
                <>
                  <span className="mesa-domo-rodada" aria-hidden="true">
                    {KANJI_VENTO[placar.rodadaVento]}
                    {placar.rodadaNumero}
                  </span>
                  <span className="sr-only">
                    {t('match.table.round', {
                      wind: t(CHAVE_VENTO[placar.rodadaVento]),
                      number: placar.rodadaNumero,
                    })}
                  </span>
                  <span className="mesa-domo-info">
                    {timer.ligado && vez.comecou && !timer.contando && (
                      <i className="fas fa-pause" aria-hidden="true" />
                    )}{' '}
                    本{placar.honba}·棒{placar.palitos}
                  </span>
                  {/* 山 é o muro, como 本 é o honba e 棒 os palitos. */}
                  <span className="mesa-domo-muro" role="img" aria-label={t('match.table.wall', { count: muro })}>
                    山{muro}
                  </span>
                </>
              }
              lado={(cadeira) => ({
                placa: (
                  <PlacaJogador
                    nome={nomeDe(cadeira)}
                    vento={ventoDaCadeira(cadeira, placar.cadeiraDealer, jogadoresNaMesa(partida))}
                    pontos={placar.pontos[cadeira]}
                    emRiichi={placar.riichi.includes(cadeira)}
                    checagem={
                      partida.registro?.maos[cadeira]
                        ? {
                            rotulo: t('match.furiten.iconLabel', { name: nomeDe(cadeira) }),
                            aoTocar: () => setAvisoFuritenDe(cadeira),
                          }
                        : undefined
                    }
                    timer={
                      timer.ligado && vez.cadeira === cadeira
                        ? {
                            segundos: timer.segundos,
                            fracao: timer.fracao,
                            esgotado: timer.esgotado || !!descarteRapido?.expirou,
                          }
                        : undefined
                    }
                    daVez={vez.cadeira === cadeira}
                    aoAbrirMenu={() => setMenuDe(cadeira)}
                    aoSegurar={() => setDiferencaDe(cadeira)}
                  />
                ),
                ranhura: placar.riichi.includes(cadeira) ? (
                  <span className="mesa-palito" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">
                    {numerosDaParede(
                      (cadeira - placar.cadeiraDealer + jogadoresNaMesa(partida)) % jogadoresNaMesa(partida),
                      jogadoresNaMesa(partida),
                    ).join(' · ')}
                  </span>
                ),
              })}
            />
          </div>

          <div className="mesa-acoes">
            {pertoDoPaarenchan && (
              <p className="mesa-aviso mesa-aviso--paarenchan" role="status">
                <i className="fas fa-crown" aria-hidden="true" />{' '}
                {t('localYaku.paarenchan.near', {
                  count: pertoDoPaarenchan.quantas,
                  name: nomeDe(pertoDoPaarenchan.cadeira),
                })}
              </p>
            )}
            {config.abortivos.quatroVentos && partida.variante !== 'sanma' && ehQuatroVentos(partida.registro?.lances ?? []) && (
              <button
                type="button"
                className="mesa-aviso"
                onClick={() => setQuatroVentosAberto(true)}
              >
                {t('match.discards.fourWindsNotice')}
              </button>
            )}
            <button type="button" className="mesa-btn-principal mesa-btn-descarte" onClick={abrirDescarte}>
              {t('match.table.discard', { name: nomeDaVez })}
            </button>
            {/* O ron vem só da pergunta do descarte: aqui fica apenas o tsumo de quem está na vez. */}
            <button
              type="button"
              className="mesa-btn-principal"
              onClick={() => setBatida(iniciarTsumoDaVez(vez.cadeira))}
            >
              {t('match.win.tsumoOf', { name: nomeDaVez })}
            </button>
            {partida.agariYameDisponivel && (
              <button
                type="button"
                className="mesa-btn-secundario"
                onClick={() => atualizar(encerrarPorAgariYame)}
              >
                {t('match.table.agariYame')}
              </button>
            )}
            <div className={`mesa-linha-acoes${timer.ligado ? ' mesa-linha-acoes--timer' : ''}`}>
              {timer.ligado && (
                <button
                  type="button"
                  className={timer.contando ? undefined : 'mesa-btn-timer--parado'}
                  onClick={timer.alternarPausa}
                >
                  <i className={`fas ${timer.contando ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
                  {t(
                    timer.contando
                      ? 'match.timer.pauseShort'
                      : vez.comecou
                        ? 'match.timer.resumeShort'
                        : 'match.timer.start',
                  )}
                </button>
              )}
              <JogarDados
                cadeiraDealer={placar.cadeiraDealer}
                aoMudarAberto={setDadosAbertos}
                jogadores={jogadoresNaMesa(partida)}
              />
              <button type="button" onClick={() => setRyukyokuAberto(true)}>
                <i className="fas fa-equals" aria-hidden="true" />
                {t('match.draw.short')}
              </button>
              <button
                type="button"
                disabled={partida.eventos.length === 0 && !partida.registro?.lances.length}
                onClick={() => {
                  atualizar((atual) => desfazerUltimoDaMesa(atual, Date.now()))
                  mostrarAviso(t('match.table.undone'))
                }}
              >
                <i className="fas fa-rotate-left" aria-hidden="true" />
                {t('match.table.undo')}
              </button>
              <button type="button" onClick={() => setMaosAbertas(true)}>
                <i className="fas fa-list" aria-hidden="true" />
                {t('match.hands.short')}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* O CSS das calculadoras conta com elas como filhas diretas do `main`. */}
      {batida?.calculadora &&
        vencedorAtual !== null &&
        createPortal(
          batida.calculadora === 'hanFu' ? (
            <PaginaCalculadoraHanFu
              aoUsarResultado={receberCalculo}
              initialIsOya={vencedorEhDealer}
              initialAgari={batida.tipo}
              initialHonba={placar.honba}
              basengo={config.regrasCalculo.basengo}
              variante={partida.variante}
            />
          ) : (
            <PaginaCalculadoraMao
              key={batida.calculadora}
              entradaFixa={batida.calculadora}
              aoUsarResultado={receberCalculo}
              contextoCenterpiece={{
                tipoVitoria: batida.tipo,
                ventoRodada: ventoMao(placar.rodadaVento),
                ventoAssento: ventoMao(ventoDaCadeira(vencedorAtual, placar.cadeiraDealer, jogadoresNaMesa(partida))),
                variante: partida.variante,
                honba: placar.honba,
                rodadaNumero: placar.rodadaNumero,
                vencedorEhLeste: vencedorEhDealer,
                vencedorNome: nomeDe(vencedorAtual),
                jogadorRiichi: placar.riichi.includes(vencedorAtual),
                paarenchan: pertoDoPaarenchan?.cadeira === vencedorAtual,
                regras: config.regrasCalculo,
                pedraBatida:
                  batida.tipo === 'ron' && batida.ordemDescarte !== undefined
                    ? partida.registro?.lances.find((lance) => lance.ordem === batida.ordemDescarte)?.pedra
                    : undefined,
                dados: dadosDaPartidaParaMao({
                  lances: partida.registro?.lances ?? [],
                  cadeira: vencedorAtual,
                  tipo: batida.tipo,
                  emRiichi: placar.riichi.includes(vencedorAtual),
                  jogadores: jogadoresNaMesa(partida),
                }),
              }}
            />
          ),
          document.querySelector('main.conteudo-principal') ?? document.body,
        )}

      {batida && !batida.calculadora && (
        <ModalBatida
          partida={partida}
          batida={batida}
          nomeDe={nomeDe}
          aoMudar={setBatida}
          aoAplicar={aplicarBatida}
          aoFechar={() => {
            // Ron do descarte fechado sem registrar: o descarte sai, como no X da pergunta,
            // e a vez continua com quem descartou.
            const { ordemDescarte } = batida
            if (ordemDescarte !== undefined) {
              const lances = partida.registro?.lances.length ?? 0
              acoesDescartes.desfazerUltimos(Math.max(0, lances - ordemDescarte + 1))
            }
            setBatida(null)
          }}
        />
      )}

      {menuDe !== null && (
        <MenuJogador
          partida={partida}
          cadeira={menuDe}
          nome={nomeDe(menuDe)}
          podeReceberVez={vez.cadeira !== menuDe}
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
              : config.chombo.tipo === 'yakumanReverso'
                ? t(chomboDe === placar.cadeiraDealer ? 'match.chombo.yakumanDealerHelp' : 'match.chombo.yakumanHelp')
                : t(chomboDe === placar.cadeiraDealer ? 'match.chombo.dealerHelp' : 'match.chombo.reverseHelp')
          }
          rotuloConfirmar={t('match.chombo.confirm')}
          perigo
          aoFechar={() => setChomboDe(null)}
          aoConfirmar={() => {
            atualizar((atual) => registrarChombo(atual, chomboDe, contexto()))
            setChomboDe(null)
          }}
        >
          <ResumoChombo partida={partida} cadeira={chomboDe} nomeDe={nomeDe} />
        </ModalConfirmacao>
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

      {abortando && (
        <ModalConfirmacao
          titulo={t('match.table.abortTitle')}
          texto={t('match.table.abortHelp')}
          rotuloConfirmar={t('match.table.abortConfirm')}
          perigo
          aoFechar={() => setAbortando(false)}
          aoConfirmar={() => {
            descartar(id)
            aoSair()
          }}
        />
      )}

      {quatroVentosAberto && (
        <ModalConfirmacao
          titulo={t('match.abortive.quatroVentos')}
          texto={t('match.discards.fourWindsNotice')}
          rotuloConfirmar={t('match.discards.fourWindsConfirm')}
          aoFechar={() => setQuatroVentosAberto(false)}
          aoConfirmar={() => {
            atualizar((atual) => registrarAbortivo(atual, 'quatroVentos', contexto()))
            setQuatroVentosAberto(false)
          }}
        />
      )}

      {rioDe !== null && (
        <ModalRio partida={partida} cadeira={rioDe} nomeDe={nomeDe} aoFechar={() => setRioDe(null)} />
      )}

      {descarteRapido !== null && (
        <ModalDescartes
          key={descarteRapido.cadeira}
          expirou={descarteRapido.expirou}
          timer={timer.ligado ? { segundos: timer.segundos, fracao: timer.fracao } : undefined}
          partida={partida}
          cadeira={descarteRapido.cadeira}
          nomeDe={nomeDe}
          acoes={acoesDescartes}
          aoDecidir={(decisao) => decidirDescarte(descarteRapido.cadeira, decisao)}
          aoFechar={() => setDescarteRapido(null)}
        />
      )}

      {checarFuritenDe !== null && (
        <ModalChecarFuriten
          partida={partida}
          cadeira={checarFuritenDe}
          nome={nomeDe(checarFuritenDe)}
          acoes={acoesDescartes}
          aoFechar={() => setChecarFuritenDe(null)}
        />
      )}

      {historicoAberto && (
        <ModalHistoricoAcoes historico={historicoDe(partida)} nomeDe={nomeDe} aoFechar={() => setHistoricoAberto(false)} />
      )}

      {avisoFuritenDe !== null && (
        <ModalAvisoFuriten
          partida={partida}
          cadeira={avisoFuritenDe}
          nomeDe={nomeDe}
          acoes={acoesDescartes}
          aoFechar={fecharAvisoFuriten}
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
  const { t } = useI18n()

  return (
    <section className="card ptd-resultado">
      <h2>{t('match.result.title')}</h2>
      <p className="ptd-apoio">{t(`match.result.reason.${partida.fim}`)}</p>
      <ListaResultado linhas={calcularResultado(partida)} nomeDe={nomeDe} />
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
