import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { codigoBase, nomePedraAcessivel, proximaDoraIndicada } from '../../constantes'
import { BotaoToggle } from '../../compartilhado/componentes/Botoes'
import { IndicadoresDora } from '../../compartilhado/componentes/IndicadoresDora'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import { TecladoPedras } from '../../montagem-mao/componentes/TecladoPedras'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

interface PropsOpcoesMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  contextoCenterpiece?: {
    tipoVitoria: 'ron' | 'tsumo'
    ventoRodada: string
    ventoAssento: string
    honba: number
    rodadaNumero?: number
    vencedorNome?: string
    vencedorEhLeste?: boolean
    jogadorRiichi?: boolean
  }
}

/**
 * Controles progressivos de contexto da vitoria.
 *
 * Cada botao apenas altera estado de configuracao. O calculo final continua
 * concentrado no botao Calcular para preservar previsibilidade do fluxo mobile.
 */
const NOME_VENTO_MAO: Record<string, string> = {
  '1': 'Leste',
  '2': 'Sul',
  '3': 'Oeste',
  '4': 'Norte',
}

export default function OpcoesMao({ estado, embutido = false, contextoCenterpiece }: PropsOpcoesMao) {
  const { t } = useI18n()
  const {
    mao,
    atualizarMao,
    configuracao,
    acaoPendente,
    alternarAcao,
    adicionarPedra,
    removerDescarte,
    podeSelecionarPedra,
    maoAberta,
    slotsUsados,
    fluxoOpcoes,
    marcarVitoriaDefinida,
    marcarVentoRodadaDefinido,
    marcarVentoAssentoDefinido,
  } = estado
  const [ajudaDoraAberta, setAjudaDoraAberta] = useState(false)
  const [descartesExpandidos, setDescartesExpandidos] = useState(false)
  const [painelContextualAberto, setPainelContextualAberto] = useState<
    'dora' | 'descartes' | null
  >(null)
  const pedrasFisicasMao = [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]
  const dorasAutomaticasAka = configuracao.akadora
    ? pedrasFisicasMao.filter((pedra) => pedra[0] === '0').length
    : 0
  const contarDorasPorIndicadores = (indicadores: typeof mao.dora) =>
    indicadores.reduce((total, indicador) => {
      const doraReal = proximaDoraIndicada(indicador)
      return (
        total +
        pedrasFisicasMao.filter((pedra) => codigoBase(pedra) === codigoBase(doraReal)).length
      )
    }, 0)
  const dorasPorIndicadores = contarDorasPorIndicadores(mao.dora)
  const dorasAutomaticas = dorasAutomaticasAka + dorasPorIndicadores
  const dorasNaMaoTotal = Math.min(13, dorasAutomaticas + mao.doraManual)
  const ajudaDoraContador =
    dorasAutomaticas === 0
      ? null
      : dorasAutomaticasAka > 0 && dorasPorIndicadores > 0
        ? `Inclui ${dorasAutomaticasAka} aka dora e ${dorasPorIndicadores} por indicadores.`
        : dorasAutomaticasAka > 0
          ? `Inclui ${dorasAutomaticasAka} aka dora da mão.`
          : `Inclui ${dorasPorIndicadores} doras encontradas pelos indicadores.`
  const ajudaDoraContadorVisivel = dorasAutomaticas === 0 ? null : ajudaDoraContador
  const dorasReais = useMemo(
    () =>
      new Set(mao.dora.map((indicador) => codigoBase(proximaDoraIndicada(indicador)))),
    [mao.dora],
  )
  const mapaEsperasVazio = useMemo(() => new Map(), [])
  const rotuloEsperaTeclado = () => ''
  const classeEsperaTeclado = () => ''
  const alternarPainelContextual = (painel: 'dora' | 'descartes') => {
    const tipoAcao = painel === 'descartes' ? 'descarte' : 'dora'
    const fechandoPainel = painelContextualAberto === painel
    setPainelContextualAberto(fechandoPainel ? null : painel)
    if (fechandoPainel) {
      if (acaoPendente?.tipo === tipoAcao) alternarAcao(tipoAcao)
      return
    }
    if (acaoPendente?.tipo !== tipoAcao) alternarAcao(tipoAcao)
    if (painel === 'descartes') {
      setDescartesExpandidos(true)
    }
  }
  const tecladoContextual = (
    <div className="painel-teclado-calculadora painel-teclado-contextual-finalizacao">
      <TecladoPedras
        acaoPendente={acaoPendente}
        configuracao={configuracao}
        dorasReais={dorasReais}
        esperasPorPedra={mapaEsperasVazio}
        filtrarTecladoPorEspera={false}
        furitenBloqueiaRon={false}
        maoCompleta={false}
        podeSelecionarPedra={podeSelecionarPedra}
        rotuloEsperaTeclado={rotuloEsperaTeclado}
        classeEsperaTeclado={classeEsperaTeclado}
        contexto="finalizacao"
        aoAdicionarPedra={adicionarPedra}
      />
    </div>
  )
  const descartesUnicos = mao.descartes.reduce<
    Array<{ chave: string; pedra: (typeof mao.descartes)[number]; quantidade: number }>
  >((lista, pedra) => {
    const chave = codigoBase(pedra)
    const existente = lista.find((item) => item.chave === chave)
    if (existente) existente.quantidade += 1
    else lista.push({ chave, pedra, quantidade: 1 })
    return lista
  }, [])
  const honba = Number.isFinite(mao.honba) ? mao.honba : 0
  const mostrarOpcoesTenpai = slotsUsados >= 13
  const modoCenterpiece = !!contextoCenterpiece
  const mostrarConfiguracaoBasica = modoCenterpiece || mostrarOpcoesTenpai
  const mostrarVentos = !modoCenterpiece && mostrarConfiguracaoBasica && fluxoOpcoes.vitoriaDefinida
  const mostrarEtapaRiichi =
    modoCenterpiece ||
    (mostrarVentos && fluxoOpcoes.ventoRodadaDefinido && fluxoOpcoes.ventoAssentoDefinido)
  const mostrarRiichi = mostrarEtapaRiichi && !maoAberta && !mao.bencao
  const mostrarCondicoes = mostrarEtapaRiichi
  const classeEtapa = (ativa: boolean) =>
    `etapa-opcoes-mao ${ativa ? 'etapa-opcoes-ativa' : 'etapa-opcoes-discreta'}`

  return (
    <div className={embutido ? 'opcoes-mao-embutidas' : 'card'}>
      {!modoCenterpiece && (
        <div id="secao-vitoria" className={`campo-vitoria-mao ${classeEtapa(mostrarConfiguracaoBasica)}`}>
          <span>{t('calculator.victory')}</span>
          <ToggleAgari
            mao={mao}
            atualizarMao={atualizarMao}
            definido={fluxoOpcoes.vitoriaDefinida}
            aoDefinir={marcarVitoriaDefinida}
          />
        </div>
      )}

      <section className={`grupo-opcoes-mao grupo-opcoes-dora ${classeEtapa(mostrarConfiguracaoBasica)}`}>
        <span className="rotulo-bloco-opcoes">{t('calculator.honbaAndDora')}</span>
        <div className="contadores-dora-honba">
          {!modoCenterpiece && (
            <div className="contador-dora-manual contador-honba">
              <span>{t('calculator.honba')}</span>
              <div>
                <button
                  type="button"
                  aria-label={`${t('calculator.honba')} -`}
                  disabled={honba <= 0}
                  onClick={() =>
                    atualizarMao((rascunho) => {
                      const atual = Number.isFinite(rascunho.honba) ? rascunho.honba : 0
                      rascunho.honba = Math.max(0, atual - 1)
                    })
                  }
                >
                  -
                </button>
                <strong>{honba}</strong>
                <button
                  type="button"
                  aria-label={`${t('calculator.honba')} +`}
                  disabled={honba >= 99}
                  onClick={() =>
                    atualizarMao((rascunho) => {
                      const atual = Number.isFinite(rascunho.honba) ? rascunho.honba : 0
                      rascunho.honba = Math.min(99, atual + 1)
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="contador-dora-manual">
            <span className="rotulo-contador-com-ajuda">
              {t('calculator.manualDora')}
              <button
                type="button"
                className="icone-ajuda-dora"
                title="Abre explicação sobre Dora e Ura Dora"
                aria-label={t('calculator.manualDoraHelpTitle')}
                onClick={() => setAjudaDoraAberta(true)}
              >
                i
              </button>
              <button
                type="button"
                className={`btn-expandir-indicadores-dora ${painelContextualAberto === 'dora' ? 'ativo' : ''}`}
                aria-label={t('calculator.doraUraIndicators')}
                aria-expanded={painelContextualAberto === 'dora'}
                onClick={() => alternarPainelContextual('dora')}
              >
                <i className="fas fa-border-all" aria-hidden="true" />
                {mao.dora.length > 0 && (
                  <span className="badge-indicadores-dora">{mao.dora.length}</span>
                )}
              </button>
            </span>
            <div>
              <button
                type="button"
                aria-label={`${t('calculator.manualDora')} -`}
                disabled={mao.doraManual <= 0}
                onClick={() =>
                  atualizarMao((rascunho) => {
                    rascunho.doraManual = Math.max(0, rascunho.doraManual - 1)
                  })
                }
              >
                -
              </button>
              <strong>{dorasNaMaoTotal}</strong>
              <button
                type="button"
                aria-label={`${t('calculator.manualDora')} +`}
                disabled={dorasNaMaoTotal >= 13}
                onClick={() =>
                  atualizarMao((rascunho) => {
                    rascunho.doraManual = Math.min(13, rascunho.doraManual + 1)
                  })
                }
              >
                +
              </button>
            </div>
            {ajudaDoraContadorVisivel && (
              <small className="texto-ajuda-contador-dora">{ajudaDoraContadorVisivel}</small>
            )}
          </div>
        </div>
        {painelContextualAberto === 'dora' && (
          <div className="painel-contextual-finalizacao">
            {tecladoContextual}
            <IndicadoresDora
              mao={mao}
              atualizarMao={atualizarMao}
              tipo="dora"
              aoLimparIndicadores={() =>
                atualizarMao((rascunho) => {
                  rascunho.dora = []
                })
              }
            />
          </div>
        )}
      </section>

      <section className="descartes-finalizacao">
        <div className="linha-opcoes-mao linha-opcoes-indicadores">
          <BotaoToggle
            rotulo={`${t('calculator.discardsFuriten')} (${mao.descartes.length})`}
            ativo={painelContextualAberto === 'descartes'}
            corAtiva="#111827"
            desabilitado={false}
            aoClicar={() => alternarPainelContextual('descartes')}
          />
        </div>
          {painelContextualAberto === 'descartes' && (
            <div className="painel-contextual-finalizacao painel-contextual-descartes">
              {tecladoContextual}
              <div
                className={`grade-descartes-finalizacao ${
                  descartesExpandidos ? 'grade-descartes-expandida' : 'grade-descartes-compacta'
                }`}
              >
                {(descartesExpandidos ? descartesUnicos : descartesUnicos.slice(0, 5)).map(
                  ({ chave, pedra, quantidade }) => (
                    <button
                      key={chave}
                      className="chip-pedra descarte descarte-finalizacao"
                      aria-label={`${nomePedraAcessivel(pedra)} x${quantidade}`}
                      type="button"
                      onClick={() => {
                        const indice = mao.descartes.findIndex(
                          (descarte) => codigoBase(descarte) === chave,
                        )
                        if (indice >= 0) removerDescarte(indice)
                      }}
                    >
                      <PedraSvg pedra={pedra} />
                      {quantidade > 1 && <span className="contador-descarte-finalizacao">x{quantidade}</span>}
                    </button>
                  ),
                )}
                {mao.descartes.length > 0 && (
                  <button
                    className="btn-limpar-grupo-pedras"
                    type="button"
                    aria-label={t('calculator.clearDiscards')}
                    title={t('calculator.clearDiscards')}
                    onClick={() =>
                      atualizarMao((rascunho) => {
                        rascunho.descartes = []
                      })
                    }
                  >
                    <i className="fas fa-trash" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

      {!modoCenterpiece && (
        <section id="secao-ventos" className={`grupo-opcoes-mao grupo-opcoes-ventos ${classeEtapa(mostrarVentos)}`}>
          <span className="rotulo-bloco-opcoes">{t('calculator.winds')}</span>
          <SeletorVentos
            mao={mao}
            atualizarMao={atualizarMao}
            ventoRodadaDefinido={fluxoOpcoes.ventoRodadaDefinido}
            ventoAssentoDefinido={fluxoOpcoes.ventoAssentoDefinido}
            aoDefinirVentoRodada={marcarVentoRodadaDefinido}
            aoDefinirVentoAssento={marcarVentoAssentoDefinido}
          />
        </section>
      )}

      <div
        className={`grupos-opcoes-mao ${
          mostrarEtapaRiichi ? 'grupos-opcoes-ativos' : 'grupos-opcoes-discretos'
        }`}
      >
        {mostrarRiichi && (
          <section id="secao-riichi" className={`grupo-opcoes-mao ${classeEtapa(mostrarRiichi)}`}>
            <span className="rotulo-bloco-opcoes">{t('calculator.riichi')}</span>
            <div className="linha-opcoes-mao">
              <BotaoToggle
                rotulo={t('calculator.riichi')}
                ativo={!!mao.riichi}
                desabilitado={maoAberta}
                corAtiva="#f97316"
                aoClicar={() =>
                  atualizarMao((rascunho) => {
                    if (rascunho.riichi) {
                      rascunho.riichi = null
                      rascunho.uradora = []
                      rascunho.uradoraManual = 0
                    } else {
                      rascunho.riichi = { duplo: false, ippatsu: false }
                      rascunho.bencao = false
                    }
                  })
                }
              />
              <BotaoToggle
                rotulo={t('calculator.doubleRiichi')}
                ativo={!!mao.riichi?.duplo}
                desabilitado={maoAberta}
                corAtiva="#f97316"
                aoClicar={() =>
                  atualizarMao((rascunho) => {
                    if (!rascunho.riichi) return
                    rascunho.riichi = { duplo: !rascunho.riichi.duplo, ippatsu: rascunho.riichi.ippatsu }
                    rascunho.bencao = false
                  })
                }
              />
              <BotaoToggle
                rotulo={t('calculator.ippatsu')}
                ativo={!!mao.riichi?.ippatsu}
                desabilitado={!mao.riichi}
                corAtiva="#f97316"
                aoClicar={() =>
                  atualizarMao((rascunho) => {
                    if (rascunho.riichi) rascunho.riichi.ippatsu = !rascunho.riichi.ippatsu
                  })
                }
              />
            </div>
          </section>
        )}

        <section className={`grupo-opcoes-mao ${classeEtapa(mostrarCondicoes)}`}>
          <span className="rotulo-bloco-opcoes">{t('calculator.specialConditions')}</span>
          <div className="linha-opcoes-mao linha-condicoes-especiais">
            <BotaoToggle
              rotulo={t('calculator.tenhouChiihou')}
              ativo={mao.bencao}
              desabilitado={mao.melds.length > 0}
              aoClicar={() =>
                atualizarMao((rascunho) => {
                  rascunho.bencao = !rascunho.bencao
                  if (rascunho.bencao) {
                    rascunho.riichi = null
                    rascunho.uradora = []
                    rascunho.uradoraManual = 0
                    rascunho.ultimaPedra = false
                    rascunho.kan = false
                  }
                })
              }
            />
            <BotaoToggle
              rotulo={mao.agari === 'ron' ? t('calculator.chankan') : t('calculator.rinshan')}
              ativo={mao.kan}
              desabilitado={false}
              aoClicar={() =>
                atualizarMao((rascunho) => {
                  rascunho.kan = !rascunho.kan
                  if (rascunho.kan) {
                    rascunho.bencao = false
                    rascunho.ultimaPedra = false
                  }
                })
              }
            />
            <BotaoToggle
              rotulo={mao.agari === 'ron' ? t('calculator.houtei') : t('calculator.haitei')}
              ativo={mao.ultimaPedra}
              desabilitado={false}
              aoClicar={() =>
                atualizarMao((rascunho) => {
                  rascunho.ultimaPedra = !rascunho.ultimaPedra
                  if (rascunho.ultimaPedra) {
                    rascunho.bencao = false
                    rascunho.kan = false
                  }
                })
              }
            />
          </div>
        </section>
      </div>
      {ajudaDoraAberta && (
        <div
          className="ajuda-dora-mobile-fundo"
          role="presentation"
          onClick={() => setAjudaDoraAberta(false)}
        >
          <div
            className="ajuda-dora-mobile"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-ajuda-dora"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="ajuda-dora-mobile-cabecalho">
              <strong id="titulo-ajuda-dora">{t('calculator.manualDoraHelpTitle')}</strong>
              <button
                className="btn-icone"
                type="button"
                aria-label={t('actions.close')}
                onClick={() => setAjudaDoraAberta(false)}
              >
                x
              </button>
            </div>
            <p>{t('calculator.manualDoraHelp')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
