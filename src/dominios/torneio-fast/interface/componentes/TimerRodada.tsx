import { useState, useCallback } from 'react'
import type { PropsComAtualizacao } from './tipos'
import { OPCOES_TIMER, SEGUNDOS_ACRESCIMO_MESA } from '../../logica/constantes'
import { formatarDuracao } from '../../logica/chaves'
import {
  segundosRestantesBase,
  alternarTimer,
  resetarTimer,
  selecionarRodadaTimer,
  alterarDuracaoTimer,
  adicionarCincoMinutosGlobal,
} from '../../logica/acoes'

/**
 * Cronômetro da rodada com controles de play/pause, reset e acréscimo global.
 *
 * @param props - torneio e atualizarTorneio.
 */
interface PropsTimerRodada extends PropsComAtualizacao {
  agora: number
}

export function TimerRodada({ torneio, atualizarTorneio, agora }: PropsTimerRodada) {
  const { timer } = torneio
  const rodando = timer.rodando
  const [aberto, setAberto] = useState(true)

  const segundos = segundosRestantesBase(timer, agora)
  const temOpcaoPadrao = OPCOES_TIMER.some((opcao) => opcao.segundos === timer.totalSegundos)

  const handleToggle = useCallback(() => setAberto((a) => !a), [])

  return (
    <section className="card-timer-colapsavel" aria-label="Timer da rodada">
      <button
        className="cabecalho-timer-colapsavel"
        type="button"
        onClick={handleToggle}
        aria-expanded={aberto}
      >
        <div className="titulo-timer-colapsavel">
          <span className="label-timer-base">Timer base</span>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
            Rodada {timer.indiceRodada + 1}
          </h2>
        </div>
        {!aberto && (
          <output className="resumo-timer-recolhido" aria-live="polite">
            {formatarDuracao(segundos)}
          </output>
        )}
        <i className="fas fa-chevron-down icone-chevron" aria-hidden="true" />
      </button>

      <div className={`painel-colapsavel ${aberto ? 'painel-aberto' : ''}`}>
        <div className="timer-conteudo">
          {/* Display escuro com o tempo */}
          <output className="display-timer" aria-live="polite">
            {formatarDuracao(segundos)}
          </output>

          {/* Selects lado a lado */}
          <div className="controles-timer">
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
          </div>

          {/* Botão iniciar/pausar full-width */}
          <button
            className="btn-primario btn-timer-iniciar"
            type="button"
            onClick={() => atualizarTorneio(alternarTimer)}
          >
            <i className={`fas ${rodando ? 'fa-pause' : 'fa-play'}`} />
            {rodando ? ' Pausar' : ' Iniciar'}
          </button>

          {/* Dois botões outline lado a lado */}
          <div className="acoes-timer-secundarias">
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
            O timer base vale para todas as mesas. Acréscimos individuais (+5 min) aparecem apenas
            no cartão da mesa correspondente.
          </p>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL DE QUALIDADE DA GRADE
// ═══════════════════════════════════════════════════════════════════════════════
