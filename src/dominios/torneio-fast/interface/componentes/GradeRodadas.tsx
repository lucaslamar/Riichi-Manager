import { useState, type CSSProperties } from 'react'
import type { PropsComAtualizacao } from './tipos'
import { PONTUACAO_INICIAL, SEGUNDOS_ACRESCIMO_MESA } from '../../logica/constantes'
import {
  chaveMesa,
  formatarDuracao,
  formatarPontuacao,
  parsePontuacao,
  pontuacaoInicialFormatada,
} from '../../logica/chaves'
import {
  segundosRestantesMesa,
  adicionarCincoMinutosMesa,
  calcularPontosPartida,
} from '../../logica/acoes'

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
  const [pontuacoes, setPontuacoes] = useState<Record<string, string>>({})
  // -1 = "Todas as mesas"; 0+ = índice da rodada específica
  const [abaAtiva, setAbaAtiva] = useState<number>(-1)

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

    atualizarTorneio((torneioAtual) => {
      const classificacao = { ...torneioAtual.classificacao }
      for (const pts of calcularPontosPartida(resultados)) {
        classificacao[pts.jogador] = (classificacao[pts.jogador] ?? 0) + pts.pontos
      }
      const novasMesasConcluidas = { ...torneioAtual.mesasConcluidas, [chave]: true }

      // Verifica se todas as mesas da rodada atual foram concluídas para avançar.
      const rodadaAtual = torneioAtual.grade[indiceRodada]
      const todasConcluidas =
        rodadaAtual?.mesas.every((_, iM) =>
          iM === indiceMesa ? true : Boolean(novasMesasConcluidas[chaveMesa(indiceRodada, iM)]),
        ) ?? false
      const proximaRodada = indiceRodada + 1
      const temProximaRodada = proximaRodada < torneioAtual.grade.length
      const timerAtualizado =
        todasConcluidas && temProximaRodada && torneioAtual.timer.indiceRodada === indiceRodada
          ? { ...torneioAtual.timer, indiceRodada: proximaRodada, rodando: false }
          : torneioAtual.timer

      return {
        ...torneioAtual,
        classificacao,
        mesasConcluidas: novasMesasConcluidas,
        pontuacoesPorMesa: {
          ...torneioAtual.pontuacoesPorMesa,
          [chave]: resultados.map((resultado) => formatarPontuacao(resultado.pontuacao)),
        },
        timer: timerAtualizado,
      }
    })
  }

  const mesasFiltradas = torneio.grade.flatMap((rodada, iRodada) =>
    rodada.mesas.map((mesa, iMesa) => ({ rodada, iRodada, mesa, iMesa })),
  ).filter(({ iRodada }) => abaAtiva === -1 || iRodada === abaAtiva)

  return (
    <section aria-label="Grade de rodadas">
      <div
        style={{
          marginTop: 30,
          marginBottom: 12,
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

      {/* Abas de filtro por rodada */}
      <div className="abas-grade">
        <button
          className={`aba-grade ${abaAtiva === -1 ? 'aba-ativa' : ''}`}
          type="button"
          onClick={() => setAbaAtiva(-1)}
        >
          Todas
        </button>
        {torneio.grade.map((rodada, iRodada) => (
          <button
            key={rodada.id}
            className={`aba-grade ${abaAtiva === iRodada ? 'aba-ativa' : ''}`}
            type="button"
            onClick={() => setAbaAtiva(iRodada)}
          >
            Rodada {rodada.id}
          </button>
        ))}
      </div>

      <div className="grade-rodadas">
        {mesasFiltradas.map(({ rodada, iRodada, mesa, iMesa }) => {
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
                style={{ '--cor-rodada': corRodada } as CSSProperties}
              >
                <header>
                  <span>Rodada {rodada.id}</span>
                  <strong style={{ color: corRodada }}>Mesa {mesa.id}</strong>
                </header>

                {/* Tempo só aparece na rodada ativa; inativas mostram um aviso compacto */}
                {estaRodandoEstaRodada ? (
                  <div className="resumo-tempo-mesa">
                    <span>Tempo</span>
                    <strong>{formatarDuracao(segundosMesa)}</strong>
                    {acrescimos > 0 && (
                      <small style={{ marginLeft: 'auto' }}>+{acrescimos * (SEGUNDOS_ACRESCIMO_MESA / 60)} min</small>
                    )}
                  </div>
                ) : (
                  <p className="aviso-rodada-inativa">
                    Selecione Rodada {rodada.id} no timer para habilitar
                  </p>
                )}

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
                    className={`btn-primario btn-salvar-mesa ${concluida || !estaRodandoEstaRodada ? 'btn-bloqueado' : ''}`}
                    type="button"
                    disabled={concluida || !estaRodandoEstaRodada}
                    onClick={() => handleSalvar(iRodada, iMesa)}
                    title={!estaRodandoEstaRodada ? `Selecione Rodada ${rodada.id} no timer para habilitar` : undefined}
                  >
                    <i className={`fas ${concluida ? 'fa-check-circle' : 'fa-save'}`} />
                    {concluida ? ' Mesa arquivada' : ' Guardar mesa'}
                  </button>
                </div>
              </article>
            )
          })}
      </div>
    </section>
  )
}
