import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { codigoBase, nomePedraAcessivel } from '../../constantes'
import { BotaoToggle } from '../../compartilhado/componentes/Botoes'
import { IndicadoresDora } from '../../compartilhado/componentes/IndicadoresDora'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

interface PropsOpcoesMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
}

/**
 * Controles progressivos de contexto da vitoria.
 *
 * Cada botao apenas altera estado de configuracao. O calculo final continua
 * concentrado no botao Calcular para preservar previsibilidade do fluxo mobile.
 */
export default function OpcoesMao({ estado, embutido = false }: PropsOpcoesMao) {
  const { t } = useI18n()
  const {
    mao,
    atualizarMao,
    maoAberta,
    slotsUsados,
    fluxoOpcoes,
    marcarVitoriaDefinida,
    marcarVentoRodadaDefinido,
    marcarVentoAssentoDefinido,
  } = estado
  const [ajudaDoraAberta, setAjudaDoraAberta] = useState(false)
  const [descartesExpandidos, setDescartesExpandidos] = useState(false)
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
  const classeEtapa = (ativa: boolean) =>
    `etapa-opcoes-mao ${ativa ? 'etapa-opcoes-ativa' : 'etapa-opcoes-discreta'}`

  return (
    <div className={embutido ? 'opcoes-mao-embutidas' : 'card'}>
      <div className={`campo-vitoria-mao ${classeEtapa(mostrarConfiguracaoBasica)}`}>
        <span>{t('calculator.victory')}</span>
        <ToggleAgari
          mao={mao}
          atualizarMao={atualizarMao}
          definido={fluxoOpcoes.vitoriaDefinida}
          aoDefinir={marcarVitoriaDefinida}
        />
      </div>

      <section className={`grupo-opcoes-mao grupo-opcoes-dora ${classeEtapa(mostrarConfiguracaoBasica)}`}>
        <span className="rotulo-bloco-opcoes">{t('calculator.honbaAndDora')}</span>
        <div className="contadores-dora-honba">
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

          <div className="contador-dora-manual">
            <span className="rotulo-contador-com-ajuda">
              {t('calculator.manualDora')}
              <button
                type="button"
                className="icone-ajuda-dora"
                title={t('calculator.manualDoraHelp')}
                aria-label={t('calculator.manualDoraHelpTitle')}
                onClick={() => setAjudaDoraAberta(true)}
              >
                i
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
              <strong>{mao.doraManual}</strong>
              <button
                type="button"
                aria-label={`${t('calculator.manualDora')} +`}
                disabled={mao.doraManual >= 13}
                onClick={() =>
                  atualizarMao((rascunho) => {
                    rascunho.doraManual = Math.min(13, rascunho.doraManual + 1)
                    if (rascunho.doraManual > 0) {
                      rascunho.dora = []
                      rascunho.uradora = []
                    }
                  })
                }
              >
                +
              </button>
            </div>
          </div>
        </div>
        <IndicadoresDora mao={mao} atualizarMao={atualizarMao} />
      </section>

      {descartesUnicos.length > 0 && (
        <section className="descartes-finalizacao">
          <button
            className="cabecalho-descartes-finalizacao"
            type="button"
            aria-expanded={descartesExpandidos}
            onClick={() => setDescartesExpandidos((expandido) => !expandido)}
          >
            <span>{t('calculator.discardsFuriten')}</span>
            <strong>{mao.descartes.length}</strong>
            <i
              className={`fas ${descartesExpandidos ? 'fa-chevron-up' : 'fa-chevron-down'}`}
              aria-hidden="true"
            />
          </button>
          <div
            className={`grade-descartes-finalizacao ${
              descartesExpandidos ? 'grade-descartes-expandida' : 'grade-descartes-compacta'
            }`}
          >
            {(descartesExpandidos ? descartesUnicos : descartesUnicos.slice(0, 5)).map(
              ({ chave, pedra, quantidade }) => (
                <span
                  key={chave}
                  className="chip-pedra descarte descarte-finalizacao"
                  aria-label={`${nomePedraAcessivel(pedra)} x${quantidade}`}
                >
                  <PedraSvg pedra={pedra} />
                  {quantidade > 1 && <span className="contador-descarte-finalizacao">x{quantidade}</span>}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      <section className={`grupo-opcoes-mao grupo-opcoes-ventos ${classeEtapa(mostrarVentos)}`}>
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

      <div
        className={`grupos-opcoes-mao ${
          mostrarEtapaRiichi ? 'grupos-opcoes-ativos' : 'grupos-opcoes-discretos'
        }`}
      >
        {mostrarRiichi && (
          <section className={`grupo-opcoes-mao ${classeEtapa(mostrarRiichi)}`}>
            <span className="rotulo-bloco-opcoes">{t('calculator.riichi')}</span>
            <div className="linha-opcoes-mao">
              <BotaoToggle
                rotulo={t('calculator.riichi')}
                ativo={mao.riichi !== null}
                desabilitado={maoAberta}
                corAtiva="#f97316"
                aoClicar={() =>
                  atualizarMao((rascunho) => {
                    rascunho.riichi = rascunho.riichi ? null : { duplo: false, ippatsu: false }
                    if (rascunho.riichi) rascunho.bencao = false
                    else rascunho.uradora = []
                  })
                }
              />
              {mao.riichi && (
                <>
                  <BotaoToggle
                    rotulo={t('calculator.ippatsu')}
                    ativo={mao.riichi.ippatsu}
                    desabilitado={false}
                    corAtiva="#f97316"
                    aoClicar={() =>
                      atualizarMao((rascunho) => {
                        if (rascunho.riichi) rascunho.riichi.ippatsu = !rascunho.riichi.ippatsu
                      })
                    }
                  />
                  <BotaoToggle
                    rotulo={t('calculator.doubleRiichi')}
                    ativo={mao.riichi.duplo}
                    desabilitado={false}
                    corAtiva="#f97316"
                    aoClicar={() =>
                      atualizarMao((rascunho) => {
                        if (rascunho.riichi) rascunho.riichi.duplo = !rascunho.riichi.duplo
                      })
                    }
                  />
                </>
              )}
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
