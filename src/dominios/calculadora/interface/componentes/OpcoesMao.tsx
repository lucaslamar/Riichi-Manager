import { useState } from 'react'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { BotaoToggle } from './Botoes'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

const TEXTO_AJUDA_DORAS_MANUAIS =
  'Ao definir doras manualmente, a calculadora ignora doras, aka doras e ura doras detectadas automaticamente na construção manual da mão, usando somente o valor informado aqui. Os indicadores de dora e aka doras ainda podem aparecer visualmente na mão, mas não alteram o cálculo enquanto este campo estiver ativo.'

interface PropsOpcoesMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
}

/** Controles progressivos de contexto da vitória. */
export default function OpcoesMao({ estado, embutido = false }: PropsOpcoesMao) {
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
        <span>Vitória</span>
        <ToggleAgari
          mao={mao}
          atualizarMao={atualizarMao}
          definido={fluxoOpcoes.vitoriaDefinida}
          aoDefinir={marcarVitoriaDefinida}
        />
      </div>

      <section className={`grupo-opcoes-mao grupo-opcoes-dora ${classeEtapa(mostrarConfiguracaoBasica)}`}>
        <span className="rotulo-bloco-opcoes">Honba e doras</span>
        <div className="contadores-dora-honba">
          <div className="contador-dora-manual contador-honba">
            <span>Honba</span>
            <div>
              <button
                type="button"
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
              Doras na mão
              <button
                type="button"
                className="icone-ajuda-dora"
                title={TEXTO_AJUDA_DORAS_MANUAIS}
                aria-label="Ajuda sobre doras manuais"
                onClick={() => setAjudaDoraAberta(true)}
              >
                ⓘ
              </button>
            </span>
            <div>
              <button
                type="button"
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
      </section>

      <section className={`grupo-opcoes-mao grupo-opcoes-ventos ${classeEtapa(mostrarVentos)}`}>
        <span className="rotulo-bloco-opcoes">Configuração de ventos</span>
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
            <span className="rotulo-bloco-opcoes">Riichi</span>
            <div className="linha-opcoes-mao">
              <BotaoToggle
                rotulo="Riichi"
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
                    rotulo="Ippatsu"
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
                    rotulo="Double Riichi"
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
          <span className="rotulo-bloco-opcoes">Condições especiais</span>
          <div className="linha-opcoes-mao linha-condicoes-especiais">
            <BotaoToggle
              rotulo="Tenhou / Chiihou"
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
              rotulo={mao.agari === 'ron' ? 'Chankan' : 'Rinshan'}
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
              rotulo={mao.agari === 'ron' ? 'Houtei' : 'Haitei'}
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
              <strong id="titulo-ajuda-dora">Doras na mão</strong>
              <button
                className="btn-icone"
                type="button"
                aria-label="Fechar ajuda"
                onClick={() => setAjudaDoraAberta(false)}
              >
                ×
              </button>
            </div>
            <p>{TEXTO_AJUDA_DORAS_MANUAIS}</p>
          </div>
        </div>
      )}
    </div>
  )
}
