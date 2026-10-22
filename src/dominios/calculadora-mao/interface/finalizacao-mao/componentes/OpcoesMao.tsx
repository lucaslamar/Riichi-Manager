import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { doraFlamejanteAtiva } from '../../../logica/mao'
import {
  codigoBase,
  ICONE_INDICADOR_DORA,
  nomePedraAcessivel,
  proximaDoraIndicada,
} from '../../constantes'
import { BotaoToggle } from '../../compartilhado/componentes/Botoes'
import { IndicadoresDora } from '../../compartilhado/componentes/IndicadoresDora'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import { TecladoContextual } from '../../compartilhado/componentes/TecladoContextual'
import BotaoAjuda from '../../modais/ajuda-secoes/BotaoAjuda'
import { useAvancoAutomatico } from '../hooks/useAvancoAutomatico'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

interface PropsOpcoesMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  /** Onde renderizar o Furiten quando ele fica junto da mão (celular deitado). */
  destinoFuriten?: HTMLElement | null
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

export default function OpcoesMao({
  estado,
  embutido = false,
  destinoFuriten = null,
}: PropsOpcoesMao) {
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
  const avancar = useAvancoAutomatico()
  const [descartesExpandidos, setDescartesExpandidos] = useState(false)
  const [painelContextualAberto, setPainelContextualAberto] = useState<'dora' | 'descartes' | null>(
    null,
  )
  const pedrasFisicasMao = [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]
  const dorasAutomaticasAka = configuracao.akadora
    ? pedrasFisicasMao.filter((pedra) => pedra[0] === '0').length
    : 0
  const flamejante = doraFlamejanteAtiva(configuracao)
  const contarDorasPorIndicadores = (indicadores: typeof mao.dora) =>
    indicadores.reduce((total, indicador) => {
      const doraReal = proximaDoraIndicada(indicador)
      const hanPorDora = flamejante && indicador[0] === '0' ? 2 : 1
      return (
        total +
        pedrasFisicasMao.filter((pedra) => codigoBase(pedra) === codigoBase(doraReal)).length *
          hanPorDora
      )
    }, 0)
  const dorasPorIndicadores = contarDorasPorIndicadores(mao.dora)
  const dorasAutomaticas = dorasAutomaticasAka + dorasPorIndicadores
  const dorasNaMaoTotal = Math.min(13, dorasAutomaticas + mao.doraManual)
  const dorasReais = useMemo(
    () => new Set(mao.dora.map((indicador) => codigoBase(proximaDoraIndicada(indicador)))),
    [mao.dora],
  )
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
    <TecladoContextual
      acaoPendente={acaoPendente}
      configuracao={configuracao}
      dorasReais={dorasReais}
      podeSelecionarPedra={podeSelecionarPedra}
      aoAdicionarPedra={adicionarPedra}
    />
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
  const mostrarConfiguracaoBasica = mostrarOpcoesTenpai
  const mostrarVentos = mostrarConfiguracaoBasica && fluxoOpcoes.vitoriaDefinida
  const mostrarEtapaRiichi =
    mostrarVentos && fluxoOpcoes.ventoRodadaDefinido && fluxoOpcoes.ventoAssentoDefinido
  const mostrarRiichi = mostrarEtapaRiichi && !maoAberta && !mao.bencao
  const mostrarCondicoes = mostrarEtapaRiichi
  // Calcular inteiro (botão + aviso "Mão pronta…") logo acima da navegação.
  const avancarParaCalcular = () => avancar('secao-calcular', 'base')
  const classeEtapa = (ativa: boolean) =>
    `etapa-opcoes-mao ${ativa ? 'etapa-opcoes-ativa' : 'etapa-opcoes-discreta'}`

  // No layout por assunto do tablet, a Vitória (Tsumo/Ron) sobe para o topo da
  // coluna direita, logo acima de Riichi/Condições, equilibrando as duas colunas
  // (esquerda = Ventos, direita = Vitória + Riichi + Condições). Assim o Descarte
  // pode ocupar o topo (onde a Vitória ficava) — ver a regra `order` em
  // responsivo.css. Nas telas deitadas a partir de 1024px (iPads, Surface e
  // desktop) vale a mesma disposição. No celular ela permanece no topo, largura
  // total.
  // (As faixas espelham os @media de responsivo.css.)
  const tabletPorAssunto = useMediaQuery(
    '(min-width: 768px) and (max-width: 1279px) and (min-height: 600px), (min-width: 1024px) and (orientation: landscape) and (min-height: 701px)',
  )
  const vitoriaNaColunaDireita = tabletPorAssunto && mostrarConfiguracaoBasica

  const campoVitoria = (
    <div
      id="secao-vitoria"
      className={`campo-vitoria-mao ${classeEtapa(mostrarConfiguracaoBasica)}`}
    >
      <span className="rotulo-com-ajuda">
        {t('calculator.victory')}
        <BotaoAjuda topico="vitoria" />
      </span>
      <ToggleAgari
        mao={mao}
        atualizarMao={atualizarMao}
        definido={fluxoOpcoes.vitoriaDefinida}
        aoDefinir={() => {
          marcarVitoriaDefinida()
          avancar('secao-ventos')
        }}
      />
    </div>
  )

  // Furiten logo abaixo da mão: os descartes registrados aqui são os que o app
  // usa para verificar o furiten.
  const secaoFuriten = (
    <section
      className={`descartes-finalizacao${painelContextualAberto === 'descartes' ? ' descartes-expandido' : ''}`}
    >
      <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
        {t('calculator.furiten')}
        <BotaoAjuda topico="furiten" />
      </span>
      <BotaoToggle
        rotulo={`${t('calculator.discards')} (${mao.descartes.length})`}
        ativo={painelContextualAberto === 'descartes'}
        corAtiva="#111827"
        desabilitado={false}
        aoClicar={() => alternarPainelContextual('descartes')}
      />
      {painelContextualAberto === 'descartes' && (
        <div className="editor-descartes-finalizacao">
          {tecladoContextual}
          {/* Sem descartes a grade some, para o teclado ficar logo abaixo do
              botão (vazia, ela ainda ocupava a altura mínima). */}
          {mao.descartes.length > 0 && (
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
                    {quantidade > 1 && (
                      <span className="contador-descarte-finalizacao">x{quantidade}</span>
                    )}
                  </button>
                ),
              )}
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
            </div>
          )}
        </div>
      )}
    </section>
  )

  const secaoHonbaDoras = (
    <section
      className={`grupo-opcoes-mao grupo-opcoes-dora ${classeEtapa(mostrarConfiguracaoBasica)}`}
    >
      <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
        {t('calculator.doraAndHonba')}
        <BotaoAjuda topico="honbaDoras" />
      </span>
      <div className="contadores-dora-honba">
        <div className="contador-dora-manual">
          <span className="rotulo-contador-com-ajuda">
            {t('calculator.manualDora')}
            <button
              type="button"
              className={`btn-expandir-indicadores-dora ${painelContextualAberto === 'dora' ? 'ativo' : ''}`}
              aria-label={t('calculator.doraUraIndicators')}
              aria-expanded={painelContextualAberto === 'dora'}
              aria-pressed={painelContextualAberto === 'dora'}
              onClick={() => alternarPainelContextual('dora')}
            >
              <i className={`fas ${ICONE_INDICADOR_DORA}`} aria-hidden="true" />
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
        </div>

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
  )

  return (
    <div className={embutido ? 'opcoes-mao-embutidas' : 'card'}>
      {/* Celular deitado: o Furiten desce para a coluna da mão, logo abaixo
          das pedras. O portal mantém o mesmo estado (painel de Descartes)
          deste componente. */}
      {destinoFuriten ? createPortal(secaoFuriten, destinoFuriten) : secaoFuriten}

      {secaoHonbaDoras}

      {!vitoriaNaColunaDireita && campoVitoria}

      {/* Em tablets, as opções se agrupam por assunto em duas colunas:
          esquerda = ventos (Seu Vento + Vento da Rodada), direita = Riichi +
          Condições Especiais. No celular/desktop o wrapper é display:contents e
          o layout anterior é preservado. */}
      <div className="colunas-assuntos-finalizacao">
        <section
          id="secao-ventos"
          className={`grupo-opcoes-mao grupo-opcoes-ventos ${classeEtapa(mostrarVentos)}`}
        >
          <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
            {t('calculator.winds')}
            <BotaoAjuda topico="ventos" />
          </span>
          <SeletorVentos
            mao={mao}
            atualizarMao={atualizarMao}
            ventoRodadaDefinido={fluxoOpcoes.ventoRodadaDefinido}
            ventoAssentoDefinido={fluxoOpcoes.ventoAssentoDefinido}
            aoDefinirVentoRodada={() => {
              marcarVentoRodadaDefinido()
              // Sem a seção de Riichi (Tenhou/Chiihou), segue para as Condições.
              avancar(['secao-riichi', 'secao-condicoes'])
            }}
            aoDefinirVentoAssento={() => {
              marcarVentoAssentoDefinido()
              avancar('secao-vento-rodada')
            }}
          />
        </section>

        <div
          className={`grupos-opcoes-mao ${
            mostrarEtapaRiichi ? 'grupos-opcoes-ativos' : 'grupos-opcoes-discretos'
          }`}
        >
          {vitoriaNaColunaDireita && campoVitoria}
          {mostrarRiichi && (
            <section id="secao-riichi" className={`grupo-opcoes-mao ${classeEtapa(mostrarRiichi)}`}>
              <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
                {t('calculator.riichi')}
                <BotaoAjuda topico="riichi" />
              </span>
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
                      rascunho.riichi = {
                        duplo: !rascunho.riichi.duplo,
                        ippatsu: rascunho.riichi.ippatsu,
                      }
                      rascunho.bencao = false
                    })
                  }
                />
                <BotaoToggle
                  rotulo={t('calculator.ippatsu')}
                  ativo={!!mao.riichi?.ippatsu}
                  desabilitado={!mao.riichi}
                  corAtiva="#f97316"
                  aoClicar={() => {
                    if (mao.riichi && !mao.riichi.ippatsu) avancar('secao-condicoes')
                    atualizarMao((rascunho) => {
                      if (rascunho.riichi) rascunho.riichi.ippatsu = !rascunho.riichi.ippatsu
                    })
                  }}
                />
              </div>
            </section>
          )}
          {/* Mão aberta: o Riichi não se aplica. Em vez de a seção sumir, o título
              (com a ajuda) fica e explica o porquê. */}
          {mostrarEtapaRiichi && maoAberta && (
            <section id="secao-riichi" className={`grupo-opcoes-mao ${classeEtapa(true)}`}>
              <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
                {t('calculator.riichi')}
                <BotaoAjuda topico="riichi" />
              </span>
              <p className="aviso-opcao-indisponivel">{t('calculator.riichiClosedHandOnly')}</p>
            </section>
          )}

          <section
            id="secao-condicoes"
            className={`grupo-opcoes-mao ${classeEtapa(mostrarCondicoes)}`}
          >
            <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
              {t('calculator.specialConditions')}
              <BotaoAjuda topico="condicoesEspeciais" />
            </span>
            <div className="linha-opcoes-mao linha-condicoes-especiais">
              {/* Com Chi/Pon/Kan não existe Tenhou/Chiihou: o botão some, em vez
                  de ficar apagado no meio dos outros. */}
              {mao.melds.length === 0 && (
                <BotaoToggle
                  rotulo={t('calculator.tenhouChiihou')}
                  ativo={mao.bencao}
                  desabilitado={false}
                  aoClicar={() => {
                    if (!mao.bencao) avancarParaCalcular()
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
                  }}
                />
              )}
              <BotaoToggle
                rotulo={mao.agari === 'ron' ? t('calculator.chankan') : t('calculator.rinshan')}
                ativo={mao.kan}
                desabilitado={false}
                aoClicar={() => {
                  if (!mao.kan) avancarParaCalcular()
                  atualizarMao((rascunho) => {
                    rascunho.kan = !rascunho.kan
                    if (rascunho.kan) {
                      rascunho.bencao = false
                      rascunho.ultimaPedra = false
                    }
                  })
                }}
              />
              <BotaoToggle
                rotulo={mao.agari === 'ron' ? t('calculator.houtei') : t('calculator.haitei')}
                ativo={mao.ultimaPedra}
                desabilitado={false}
                aoClicar={() => {
                  if (!mao.ultimaPedra) avancarParaCalcular()
                  atualizarMao((rascunho) => {
                    rascunho.ultimaPedra = !rascunho.ultimaPedra
                    if (rascunho.ultimaPedra) {
                      rascunho.bencao = false
                      rascunho.kan = false
                    }
                  })
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
