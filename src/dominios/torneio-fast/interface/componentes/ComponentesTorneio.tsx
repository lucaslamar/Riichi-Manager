/**
 * @fileoverview Componentes do módulo de torneio.
 *
 * Conceitos React demonstrados:
 * - `useState`: armazena valores que mudam e disparam re-render.
 * - `useEffect`: executa código com efeitos colaterais (ex.: setInterval).
 * - `useCallback`: memoriza funções para não recriar desnecessariamente.
 * - `useRef`: referência mutável que não dispara re-render.
 * - Lifting state up: estado vive no pai e desce via props.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { EstadoTorneio } from '../../logica/tipos'
import { parsearJogadores, validarJogadores } from '../../logica/jogadores'
import { embaralhar } from '../../logica/aleatorio'
import { gerarGrade } from '../../logica/sorteio'
import { rotuloQualidade } from '../../logica/qualidade'
import { criarTimerVazio } from '../../persistencia/armazenamento'
import {
  segundosRestantesBase,
  segundosRestantesMesa,
  alternarTimer,
  resetarTimer,
  selecionarRodadaTimer,
  alterarDuracaoTimer,
  adicionarCincoMinutosGlobal,
  adicionarCincoMinutosMesa,
  sincronizarTimerExpirado,
  calcularPontosPartida,
} from '../../logica/acoes'
import {
  chaveMesa,
  formatarDuracao,
  formatarPontuacao,
  parsePontuacao,
  pontuacaoInicialFormatada,
} from '../../logica/chaves'
import { OPCOES_TIMER, PONTUACAO_INICIAL, SEGUNDOS_ACRESCIMO_MESA } from '../../logica/constantes'

// ─── Tipos de props compartilhados ────────────────────────────────────────────

interface PropsComTorneio {
  torneio: EstadoTorneio
}

interface PropsComAtualizacao extends PropsComTorneio {
  /** Recebe uma função que transforma o estado atual no próximo estado. */
  atualizarTorneio: (fn: (t: EstadoTorneio) => EstadoTorneio) => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DO TORNEIO
// ═══════════════════════════════════════════════════════════════════════════════

interface PropsConfiguracaoTorneio {
  aoIniciar: (torneio: EstadoTorneio) => void
  aoVoltar: () => void
}

/**
 * Card de configuração onde o juiz cola a lista de jogadores.
 *
 * `useState` com string vazia: o valor inicial do textarea.
 * Sempre que `texto` muda, React re-renderiza o componente.
 *
 * @param props - aoIniciar (callback com torneio montado) e aoVoltar.
 */
export function ConfiguracaoTorneio({ aoIniciar, aoVoltar }: PropsConfiguracaoTorneio) {
  // `texto` é o estado local — só existe neste componente.
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')

  const handleIniciar = useCallback(() => {
    const jogadores = parsearJogadores(texto)
    const mensagemErro = validarJogadores(jogadores)

    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    const embaralhados = embaralhar(jogadores)
    const grade = gerarGrade(embaralhados)

    // Monta o estado inicial do torneio e avisa o pai.
    aoIniciar({
      jogadores: embaralhados,
      grade: grade.rodadas,
      qualidade: grade.qualidade,
      classificacao: Object.fromEntries(embaralhados.map((j) => [j, 0])),
      mesasConcluidas: {},
      pontuacoesPorMesa: {},
      timer: criarTimerVazio(),
    })
  }, [texto, aoIniciar])

  return (
    <section className="card" aria-label="Configurar torneio fast">
      <div className="cabecalho-secao">
        <i className="fas fa-bolt icone-secao" aria-hidden="true" />
        <div>
          <h2>Torneio Fast</h2>
          <p className="subtitulo-secao">Cole ou digite os nomes, um por linha.</p>
        </div>
      </div>

      {/* O valor do textarea é controlado pelo estado `texto` */}
      <textarea
        value={texto}
        onChange={(evento) => {
          setTexto(evento.target.value)
          setErro('')
        }}
        placeholder={
          'Shigeru Akagi\nKaiji Itou\nSaki Miyanaga\nNodoka Haramura\nToyotomi Hidezoshi\nWashizu Iwao\nTetsuya Asada\nKei Shirogane'
        }
        aria-label="Lista de jogadores"
      />

      {/* Renderização condicional: só aparece se `erro` for truthy */}
      {erro && (
        <div
          className="alerta-info"
          style={{
            borderLeftColor: '#ef5350',
            background: '#fff5f5',
            color: '#b71c1c',
            marginBottom: 16,
          }}
        >
          <i className="fas fa-exclamation-circle" /> {erro}
        </div>
      )}

      <div className="acoes">
        <button className="btn-contorno" type="button" onClick={aoVoltar}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        <button className="btn-primario" type="button" onClick={handleIniciar}>
          <i className="fas fa-play" /> Gerar torneio
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RANKING GERAL
// ═══════════════════════════════════════════════════════════════════════════════

interface PropsRanking extends PropsComTorneio {
  aoReiniciar: () => void
  aoExportarPdf: () => void
}

/**
 * Tabela de classificação geral do torneio.
 * Ordena os jogadores por pontos de torneio (PT) a cada re-render.
 *
 * @param props - torneio, aoReiniciar, aoExportarPdf.
 */
export function RankingGeral({ torneio, aoReiniciar, aoExportarPdf }: PropsRanking) {
  // `Object.entries` transforma o objeto em array de [nome, pontos] para poder ordenar.
  const ordenados = Object.entries(torneio.classificacao).sort(([, a], [, b]) => b - a)

  return (
    <section className="card" aria-label="Classificação geral">
      <div className="cabecalho-secao">
        <i className="fas fa-chart-bar icone-secao" aria-hidden="true" />
        <h2>Classificação Geral</h2>
        <button
          className="btn-contorno"
          type="button"
          onClick={aoExportarPdf}
          style={{ marginLeft: 'auto' }}
        >
          <i className="fas fa-download" /> PDF
        </button>
      </div>

      <table id="tabelaRanking">
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Jogador</th>
            <th style={{ textAlign: 'right' }}>PT</th>
          </tr>
        </thead>
        <tbody>
          {/* `.map()` transforma o array em elementos JSX — equivale a um for loop */}
          {ordenados.map(([jogador, pontos], i) => (
            // `key` é obrigatório em listas React para identificar elementos únicos.
            <tr key={jogador}>
              <td>{i + 1}º</td>
              <td>{jogador}</td>
              <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primario)' }}>
                {pontos > 0 ? '+' : ''}
                {pontos.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="acoes" style={{ marginTop: 20 }}>
        <button
          className="btn-contorno btn-perigo"
          type="button"
          onClick={() => {
            if (window.confirm('Reiniciar o torneio? Todos os dados serão perdidos.')) {
              aoReiniciar()
            }
          }}
        >
          <i className="fas fa-undo" /> Reiniciar torneio
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMER DA RODADA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cronômetro da rodada com controles de play/pause, reset e acréscimo global.
 *
 * `useEffect` com setInterval: executa um trecho de código repetidamente.
 * O array de dependências `[rodando]` faz o effect re-executar apenas quando
 * `rodando` muda — sem isso, criaríamos múltiplos intervalos.
 *
 * `useRef`: armazena o ID do intervalo entre renders sem disparar re-render.
 *
 * @param props - torneio e atualizarTorneio.
 */
export function TimerRodada({ torneio, atualizarTorneio }: PropsComAtualizacao) {
  const { timer } = torneio
  const rodando = timer.rodando

  // `useRef` cria uma referência que persiste entre renders mas não causa re-render.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Força re-render a cada 500ms para atualizar o display.
  // `useState` com contador invisível é o padrão para "forçar update" no React.
  const [, setTick] = useState(0)

  // Effect que gerencia o intervalo de atualização.
  useEffect(() => {
    if (!rodando) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Inicia o intervalo quando o timer está rodando.
    intervalRef.current = setInterval(() => {
      setTick((tickAtual) => tickAtual + 1) // força re-render para atualizar o display
      atualizarTorneio(sincronizarTimerExpirado) // para o timer se expirou
    }, 500)

    // Função de limpeza: executada quando o componente desmonta ou rodando muda.
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [rodando, atualizarTorneio])

  const segundos = segundosRestantesBase(timer)
  const temOpcaoPadrao = OPCOES_TIMER.some((opcao) => opcao.segundos === timer.totalSegundos)

  return (
    <section className="card card-timer" aria-label="Timer da rodada">
      <div className="cabecalho-timer">
        <div>
          <span
            style={{
              display: 'block',
              color: '#738295',
              fontSize: '0.78rem',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Timer base
          </span>
          <h2>Rodada {timer.indiceRodada + 1}</h2>
        </div>
        {/* aria-live anuncia mudanças para leitores de tela */}
        <output className="display-timer" aria-live="polite">
          {formatarDuracao(segundos)}
        </output>
      </div>

      <div className="controles-timer">
        {/* Seletor de rodada */}
        <label className="seletor-timer">
          Rodada
          <select
            value={timer.indiceRodada}
            onChange={(evento) =>
              atualizarTorneio((torneioAtual) =>
                selecionarRodadaTimer(torneioAtual, Number(evento.target.value)),
              )
            }
          >
            {torneio.grade.map((rodada, i) => (
              <option key={i} value={i}>
                Rodada {rodada.id}
              </option>
            ))}
          </select>
        </label>

        {/* Seletor de duração */}
        <label className="seletor-timer">
          Duração
          <select
            value={temOpcaoPadrao ? timer.totalSegundos : 'custom'}
            onChange={(evento) => {
              const valorSelecionado = Number(evento.target.value)
              if (!isNaN(valorSelecionado)) {
                atualizarTorneio((torneioAtual) =>
                  alterarDuracaoTimer(torneioAtual, valorSelecionado),
                )
              }
            }}
          >
            {OPCOES_TIMER.map((opcao) => (
              <option key={opcao.segundos} value={opcao.segundos}>
                {opcao.rotulo}
              </option>
            ))}
            {!temOpcaoPadrao && (
              <option value="custom">Atual ({formatarDuracao(timer.totalSegundos)})</option>
            )}
          </select>
        </label>

        <button
          className="btn-primario"
          type="button"
          onClick={() => atualizarTorneio(alternarTimer)}
        >
          <i className={`fas ${rodando ? 'fa-pause' : 'fa-play'}`} />
          {rodando ? ' Pausar' : ' Iniciar'}
        </button>

        <button
          className="btn-contorno"
          type="button"
          onClick={() => atualizarTorneio(adicionarCincoMinutosGlobal)}
        >
          <i className="fas fa-plus" /> +{SEGUNDOS_ACRESCIMO_MESA / 60} min global
        </button>

        <button
          className="btn-contorno"
          type="button"
          onClick={() => atualizarTorneio(resetarTimer)}
        >
          <i className="fas fa-rotate-left" /> Resetar
        </button>
      </div>

      <p className="ajuda-timer">
        O timer base vale para todas as mesas. Acréscimos individuais (+5 min) aparecem apenas no
        cartão da mesa correspondente.
      </p>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL DE QUALIDADE DA GRADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exibe métricas de qualidade do sorteio e permite refazer a grade.
 *
 * @param props - torneio e atualizarTorneio.
 */
export function PainelQualidade({ torneio, atualizarTorneio }: PropsComAtualizacao) {
  const { qualidade } = torneio
  if (!qualidade) return null

  const handleRefazer = () => {
    if (
      !window.confirm(
        'Refazer o sorteio mantendo os mesmos nomes?\nIsso apaga resultados e acréscimos.',
      )
    )
      return

    atualizarTorneio((torneioAtual) => {
      const embaralhados = embaralhar(torneioAtual.jogadores)
      const grade = gerarGrade(embaralhados)
      return {
        ...torneioAtual,
        jogadores: embaralhados,
        grade: grade.rodadas,
        qualidade: grade.qualidade,
        classificacao: Object.fromEntries(embaralhados.map((j) => [j, 0])),
        mesasConcluidas: {},
        pontuacoesPorMesa: {},
        timer: criarTimerVazio(0, torneioAtual.timer.totalSegundos),
      }
    })
  }

  const metricaOponente =
    qualidade.limiteRepetidosPorJogador === null
      ? `${qualidade.maxRepetidosPorJogador}`
      : `${qualidade.maxRepetidosPorJogador}/${qualidade.limiteRepetidosPorJogador}`

  return (
    <section className="card" aria-label="Qualidade da grade">
      <div className="cabecalho-secao">
        <i className="fas fa-clipboard-check icone-secao" aria-hidden="true" />
        <h2>Diagnóstico da Grade</h2>
        <span className="pilula-status">{rotuloQualidade(qualidade)}</span>
      </div>

      {/* `dl` é "description list": lista de termos e definições — semântico para métricas */}
      <dl className="metricas">
        <div>
          <dt>Leste exato</dt>
          <dd>{qualidade.lesteExato ? 'Sim' : 'Não'}</dd>
        </div>
        <div>
          <dt>Max. encontros por par</dt>
          <dd>{qualidade.maxRepeticioesPar}</dd>
        </div>
        <div>
          <dt>Pares 2×</dt>
          <dd>
            {qualidade.quantidadeDuasVezes}/{qualidade.quantidadeIdealRepetidos}
          </dd>
        </div>
        <div>
          <dt>Adversários rep./jogador</dt>
          <dd>{metricaOponente}</dd>
        </div>
        <div>
          <dt>Pares 3×+</dt>
          <dd>{qualidade.quantidadeTresVezesMais}</dd>
        </div>
        <div>
          <dt>Mesas iguais</dt>
          <dd>{qualidade.mesasCompletasRepetidas}</dd>
        </div>
      </dl>

      <div className="acoes-qualidade">
        <p style={{ margin: 0, color: '#607080', fontSize: '0.9rem', fontWeight: 800 }}>
          Nota ruim? Refaça o sorteio com os mesmos jogadores.
        </p>
        <button className="btn-contorno" type="button" onClick={handleRefazer}>
          <i className="fas fa-shuffle" /> Refazer sorteio
        </button>
      </div>

      {qualidade.paresRepetidos.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <h3
            style={{
              margin: '0 0 10px',
              fontSize: '0.9rem',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Pares que se repetiram
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {qualidade.paresRepetidos.map((par) => (
              <span
                key={par.jogadores.join('+')}
                className={`chip-par ${par.vezes >= 3 ? 'perigo' : ''}`}
              >
                {par.jogadores[0]} + {par.jogadores[1]} <strong>{par.vezes}×</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE DE RODADAS E MESAS
// ═══════════════════════════════════════════════════════════════════════════════

/** Cores por rodada (ciclam se houver mais de 4 rodadas). */
const CORES_RODADA = ['#2196f3', '#4caf50', '#ff9800', '#e91e63']

/**
 * Grade completa com todas as mesas de todas as rodadas.
 * Cada mesa tem inputs de pontuação e botões de salvar / acrescentar tempo.
 *
 * Estado LOCAL de pontuações: usamos `useState` aqui porque as pontuações
 * digitadas são temporárias — só viram estado global ao clicar em "Guardar".
 *
 * @param props - torneio e atualizarTorneio.
 */
export function GradeRodadas({ torneio, atualizarTorneio }: PropsComAtualizacao) {
  // Estado local: pontuações digitadas mas ainda não confirmadas.
  // A chave é "rodada_mesa_assento", o valor é o texto do input.
  const [pontuacoes, setPontuacoes] = useState<Record<string, string>>({})

  const getPontuacao = (indiceRodada: number, indiceMesa: number, indiceAssento: number) =>
    pontuacoes[`${indiceRodada}_${indiceMesa}_${indiceAssento}`] ??
    formatarPontuacao(
      torneio.grade[indiceRodada]?.mesas[indiceMesa]?.assentos[indiceAssento]?.pontuacao ??
        PONTUACAO_INICIAL,
    )

  const setPontuacao = (
    indiceRodada: number,
    indiceMesa: number,
    indiceAssento: number,
    valor: string,
  ) =>
    setPontuacoes((anteriores) => ({
      ...anteriores,
      [`${indiceRodada}_${indiceMesa}_${indiceAssento}`]: valor,
    }))

  const handleSalvar = (indiceRodada: number, indiceMesa: number) => {
    const mesa = torneio.grade[indiceRodada]?.mesas[indiceMesa]
    if (!mesa) return

    const chave = chaveMesa(indiceRodada, indiceMesa)
    if (torneio.mesasConcluidas[chave]) return

    // Monta os resultados com as pontuações digitadas.
    const resultados = mesa.assentos.map((assento, indiceAssento) => ({
      jogador: assento.jogador,
      pontuacao: parsePontuacao(
        getPontuacao(indiceRodada, indiceMesa, indiceAssento) || String(PONTUACAO_INICIAL),
      ),
    }))

    const resumo = resultados
      .map((resultado) => `${resultado.jogador}: ${formatarPontuacao(resultado.pontuacao)}`)
      .join('\n')
    if (!window.confirm(`Confirmar resultados da Mesa ${indiceMesa + 1}?\n${resumo}`)) return

    // Atualiza a classificação e marca a mesa como concluída.
    atualizarTorneio((torneioAtual) => {
      const classificacao = { ...torneioAtual.classificacao }
      for (const pts of calcularPontosPartida(resultados)) {
        classificacao[pts.jogador] = (classificacao[pts.jogador] ?? 0) + pts.pontos
      }
      return {
        ...torneioAtual,
        classificacao,
        mesasConcluidas: { ...torneioAtual.mesasConcluidas, [chave]: true },
        pontuacoesPorMesa: {
          ...torneioAtual.pontuacoesPorMesa,
          [chave]: resultados.map((resultado) => formatarPontuacao(resultado.pontuacao)),
        },
      }
    })
  }

  return (
    <section aria-label="Grade de rodadas">
      <div
        style={{
          marginTop: 30,
          marginBottom: 20,
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <i className="fas fa-th-large icone-secao" aria-hidden="true" />
        <div>
          <h2>Grade Completa de Rodadas</h2>
          <p className="subtitulo-secao">
            Rodada ativa no timer: Rodada {torneio.timer.indiceRodada + 1}
          </p>
        </div>
      </div>

      <div className="grade-rodadas">
        {torneio.grade.map((rodada, iRodada) =>
          rodada.mesas.map((mesa, iMesa) => {
            const chave = chaveMesa(iRodada, iMesa)
            const concluida = Boolean(torneio.mesasConcluidas[chave])
            const pontuacoesSalvas = torneio.pontuacoesPorMesa[chave]
            const corRodada = CORES_RODADA[(rodada.id - 1) % CORES_RODADA.length]
            const estaRodandoEstaRodada = iRodada === torneio.timer.indiceRodada
            const acrescimos = torneio.timer.acrescimosPorMesa[chave] ?? 0
            const segundosMesa = segundosRestantesMesa(torneio.timer, iRodada, iMesa)

            return (
              // CSS custom property para colorir dinamicamente a borda e botões.
              <article
                key={chave}
                className="caixa-mesa"
                style={{ '--cor-rodada': corRodada } as React.CSSProperties}
              >
                <header>
                  <span>Rodada {rodada.id}</span>
                  <strong style={{ color: corRodada }}>Mesa {mesa.id}</strong>
                </header>

                {/* Resumo de tempo da mesa */}
                <div
                  className={`resumo-tempo-mesa ${estaRodandoEstaRodada ? '' : 'resumo-tempo-mudo'}`}
                >
                  <span>{estaRodandoEstaRodada ? 'Tempo da mesa' : `Outra rodada`}</span>
                  <strong>
                    {estaRodandoEstaRodada ? formatarDuracao(segundosMesa) : `Rodada ${rodada.id}`}
                  </strong>
                  <small>
                    {estaRodandoEstaRodada
                      ? `Acréscimo: +${acrescimos * (SEGUNDOS_ACRESCIMO_MESA / 60)} min`
                      : `Selecione Rodada ${rodada.id} no timer para acrescentar tempo.`}
                  </small>
                </div>

                {/* Lista de assentos com inputs de pontuação */}
                <div className="lista-assentos">
                  {mesa.assentos.map((assento, iAssento) => {
                    const valorInput =
                      pontuacoesSalvas?.[iAssento] ?? getPontuacao(iRodada, iMesa, iAssento)
                    const classeVento = assento.vento
                      .toLowerCase()
                      .replace('leste', 'leste')
                      .replace('sul', 'sul')
                      .replace('oeste', 'oeste')
                      .replace('norte', 'norte')
                    return (
                      <div className="linha-jogador" key={iAssento}>
                        <span className={`tag-vento vento-${classeVento}`}>{assento.vento}</span>
                        <strong className="nome-jogador">{assento.jogador}</strong>
                        <input
                          className={`input-pontuacao ${concluida ? 'input-bloqueado' : ''}`}
                          inputMode="numeric"
                          value={valorInput}
                          disabled={concluida}
                          aria-label={`Pontuação de ${assento.jogador}`}
                          onFocus={(evento) => {
                            if (evento.target.value === pontuacaoInicialFormatada()) {
                              evento.target.value = ''
                            }
                          }}
                          onBlur={(evento) => {
                            if (!evento.target.value.trim())
                              setPontuacao(iRodada, iMesa, iAssento, pontuacaoInicialFormatada())
                          }}
                          onChange={(evento) =>
                            setPontuacao(
                              iRodada,
                              iMesa,
                              iAssento,
                              evento.target.value.replace(/[^-0-9.,]/g, ''),
                            )
                          }
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Ações da mesa */}
                <div className="acoes-mesa">
                  <button
                    className="btn-contorno btn-tempo-mesa"
                    type="button"
                    disabled={!estaRodandoEstaRodada}
                    onClick={() =>
                      atualizarTorneio((torneioAtual) =>
                        adicionarCincoMinutosMesa(torneioAtual, iRodada, iMesa),
                      )
                    }
                  >
                    <i className="fas fa-clock" /> +{SEGUNDOS_ACRESCIMO_MESA / 60} min mesa
                    {acrescimos > 0 ? ` (${acrescimos}×)` : ''}
                  </button>

                  <button
                    className={`btn-primario btn-salvar-mesa ${concluida ? 'btn-bloqueado' : ''}`}
                    type="button"
                    onClick={() => handleSalvar(iRodada, iMesa)}
                  >
                    <i className={`fas ${concluida ? 'fa-check-circle' : 'fa-save'}`} />
                    {concluida ? ' Mesa arquivada' : ' Guardar mesa'}
                  </button>
                </div>
              </article>
            )
          }),
        )}
      </div>
    </section>
  )
}
