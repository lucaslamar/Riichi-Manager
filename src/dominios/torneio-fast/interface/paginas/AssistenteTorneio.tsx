import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import ConfigMesaSheet from '@/dominios/centerpiece/interface/componentes/ConfigMesaSheet'
import { KANJI_VENTO, ORDEM_VENTOS } from '@/dominios/centerpiece/logica/partida'
import { situacaoDaLista, nomesPreenchidos } from '../../logica/blocoNotas'
import { OPCOES_RODADAS, OPCOES_TEMPO_RODADA, VENTOS } from '../../logica/constantes'
import { gerarGrade } from '../../logica/sorteio'
import type { PassoAssistente, RascunhoTorneio } from '../../logica/tipos'
import BlocoNotasJogadores from '../componentes/BlocoNotasJogadores'
import DiagnosticoGrade from '../componentes/DiagnosticoGrade'
import { useTorneios } from '../hooks/useTorneios'

const PASSOS = ['players', 'rules', 'draw', 'review'] as const

const rotuloDuracao = (segundos: number) => {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.round((segundos % 3600) / 60)
  return minutos ? `${horas}h${minutos}` : `${horas}h`
}

/**
 * A barra de baixo sobe junto com o teclado: a altura que o teclado cobre vira a
 * variável --altura-teclado. O campo em edição rola para ficar acima da barra.
 */
function useAlturaTeclado() {
  useEffect(() => {
    const visual = window.visualViewport
    if (!visual) return
    const atualizar = () => {
      const altura = Math.max(0, window.innerHeight - visual.height - visual.offsetTop)
      document.documentElement.style.setProperty('--altura-teclado', `${altura}px`)
      if (altura > 0) {
        document.activeElement?.scrollIntoView({ block: 'center' })
      }
    }
    atualizar()
    visual.addEventListener('resize', atualizar)
    visual.addEventListener('scroll', atualizar)
    return () => {
      visual.removeEventListener('resize', atualizar)
      visual.removeEventListener('scroll', atualizar)
      document.documentElement.style.removeProperty('--altura-teclado')
    }
  }, [])
}

/** Criação do torneio em 4 passos. O rascunho fica salvo se o app fechar no meio. */
export default function AssistenteTorneio({ aoVoltar }: { aoVoltar: () => void }) {
  const { t, numero } = useI18n()
  const { rascunho, iniciarRascunho, mudarRascunho, comecarTorneio } = useTorneios()
  const [regrasAbertas, setRegrasAbertas] = useState(false)
  useAlturaTeclado()

  useEffect(iniciarRascunho, [iniciarRascunho])
  if (!rascunho) return null

  const { passo, linhas, config } = rascunho
  const situacao = situacaoDaLista(linhas)
  const nomes = nomesPreenchidos(linhas)

  const sortear = (base: RascunhoTorneio): RascunhoTorneio['sorteio'] =>
    gerarGrade(nomesPreenchidos(base.linhas), base.rodadas, base.equilibrarVentos)

  const irPara = (proximo: PassoAssistente) => {
    // Ao chegar na revisão sem sorteio (ou depois de mudar algo), sorteia.
    if (proximo === 3 && !rascunho.sorteio) {
      mudarRascunho({ passo: proximo, sorteio: sortear(rascunho) })
    } else {
      mudarRascunho({ passo: proximo })
    }
  }

  const habilitaProximo = passo !== 0 || situacao.valida

  const contador = situacao.repetidos
    ? t('tournament.notes.counterRepeated')
    : situacao.valida
      ? t('tournament.notes.counterReady', {
          players: numero(situacao.total),
          tables: numero(situacao.mesas),
        })
      : t('tournament.notes.counterMissing', {
          players: numero(situacao.total),
          missing: numero(situacao.faltam),
          target: numero(situacao.total + situacao.faltam),
        })

  return (
    <section className="trn-assistente">
      <TituloTela titulo={t('tournament.create.title')} aoVoltar={aoVoltar} />

      <ol className="trn-passos">
        {PASSOS.map((chave, indice) => (
          <li key={chave}>
            <button
              type="button"
              className={`trn-passo${indice === passo ? ' trn-passo--atual' : ''}`}
              aria-current={indice === passo ? 'step' : undefined}
              disabled={indice > passo || (indice > 0 && !situacao.valida)}
              onClick={() => irPara(indice as PassoAssistente)}
            >
              <span aria-hidden="true">{indice + 1}</span> {t(`tournament.create.steps.${chave}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="trn-conteudo-passo">
        {passo === 0 && (
          <BlocoNotasJogadores
            linhas={linhas}
            aoMudar={(novas) => mudarRascunho({ linhas: novas, sorteio: null })}
          />
        )}

        {passo === 1 && (
          <div className="trn-passo-formulario">
            <button type="button" className="ptd-resumo-regras" onClick={() => setRegrasAbertas(true)}>
              <span>
                <strong>{t(`tableConfig.presets.${config.preset}`)}</strong>
                <span className="ptd-apoio">
                  {t('match.setup.rulesSummary', {
                    start: numero(config.pontosPartida),
                    target: numero(config.pontosRetorno),
                    uma: config.uma.slice(0, 2).join('/'),
                  })}
                </span>
              </span>
              <i className="fas fa-wrench" aria-hidden="true" />
              <span className="sr-only">{t('tableConfig.title')}</span>
            </button>

            <fieldset className="trn-conjunto">
              <legend>{t('tournament.create.roundTime')}</legend>
              <div className="ptd-segmentos">
                {OPCOES_TEMPO_RODADA.map((segundos) => (
                  <button
                    key={segundos}
                    type="button"
                    className={`ptd-segmento${rascunho.segundosRodada === segundos ? ' ptd-segmento--ativo' : ''}`}
                    aria-pressed={rascunho.segundosRodada === segundos}
                    onClick={() => mudarRascunho({ segundosRodada: segundos })}
                  >
                    {rotuloDuracao(segundos)}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="ptd-apoio">{t('tournament.create.roundTimeHelp')}</p>
          </div>
        )}

        {passo === 2 && (
          <div className="trn-passo-formulario">
            <p className="ptd-apoio">{t('tournament.create.methodHelp')}</p>
            <label className="cfg-opcao">
              <span>
                <strong>{t('tournament.create.balanceWinds')}</strong>
                <small>{t('tournament.create.balanceWindsHelp')}</small>
              </span>
              <input
                type="checkbox"
                checked={rascunho.equilibrarVentos}
                onChange={(evento) =>
                  mudarRascunho({ equilibrarVentos: evento.target.checked, sorteio: null })
                }
              />
            </label>
            <fieldset className="trn-conjunto">
              <legend>{t('tournament.create.rounds')}</legend>
              <div className="ptd-segmentos">
                {OPCOES_RODADAS.map((rodadas) => (
                  <button
                    key={rodadas}
                    type="button"
                    className={`ptd-segmento${rascunho.rodadas === rodadas ? ' ptd-segmento--ativo' : ''}`}
                    aria-pressed={rascunho.rodadas === rodadas}
                    onClick={() => mudarRascunho({ rodadas, sorteio: null })}
                  >
                    {rodadas}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {passo === 3 && rascunho.sorteio && (
          <div className="trn-passo-formulario">
            <p className="trn-resumo">
              {t('tournament.create.summary', {
                players: numero(nomes.length),
                tables: numero(nomes.length / 4),
                rounds: numero(rascunho.rodadas),
                points: numero(config.pontosPartida),
                time: rotuloDuracao(rascunho.segundosRodada),
              })}
            </p>

            <h3 className="trn-subtitulo">{t('tournament.create.firstRound')}</h3>
            <div className="trn-previa">
              {rascunho.sorteio.rodadas[0].mesas.map((mesa) => (
                <div key={mesa.id} className="trn-previa-mesa">
                  <strong>{t('match.table.number', { number: mesa.id })}</strong>
                  <ul>
                    {mesa.assentos
                      .slice()
                      .sort((a, b) => VENTOS.indexOf(a.vento) - VENTOS.indexOf(b.vento))
                      .map((assento) => (
                        <li key={assento.jogador}>
                          <span aria-hidden="true">
                            {KANJI_VENTO[ORDEM_VENTOS[VENTOS.indexOf(assento.vento)]]}
                          </span>{' '}
                          {assento.jogador}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <DiagnosticoGrade
              qualidade={rascunho.sorteio.qualidade}
              grade={rascunho.sorteio.rodadas}
              nomeDe={(nome) => nome}
              abertoAoIniciar
            />

            <button
              type="button"
              className="btn-contorno ptd-btn-largo"
              onClick={() => mudarRascunho({ sorteio: sortear(rascunho) })}
            >
              <i className="fas fa-shuffle" aria-hidden="true" />
              {t('tournament.create.drawAgain')}
            </button>
          </div>
        )}
      </div>

      <footer className="trn-barra">
        {passo === 0 && (
          <p
            className={`trn-contador${situacao.valida ? ' trn-contador--pronto' : ''}${situacao.repetidos ? ' trn-contador--erro' : ''}`}
            role="status"
          >
            {situacao.valida && <i className="fas fa-check" aria-hidden="true" />} {contador}
          </p>
        )}
        <div className="ptd-acoes-folha">
          {passo > 0 && (
            <button
              type="button"
              className="btn-contorno"
              onClick={() => irPara((passo - 1) as PassoAssistente)}
            >
              {t('actions.back')}
            </button>
          )}
          {passo < 3 ? (
            <button
              type="button"
              className="btn-primario"
              disabled={!habilitaProximo}
              onClick={() => irPara((passo + 1) as PassoAssistente)}
            >
              {t('match.win.next')}
            </button>
          ) : (
            <button type="button" className="btn-primario" onClick={comecarTorneio}>
              {t('tournament.create.start')}
            </button>
          )}
        </div>
      </footer>

      {regrasAbertas && (
        <ConfigMesaSheet
          inicial={config}
          aoFechar={() => setRegrasAbertas(false)}
          aoConcluir={(nova) => {
            mudarRascunho({ config: nova })
            setRegrasAbertas(false)
          }}
        />
      )}
    </section>
  )
}
