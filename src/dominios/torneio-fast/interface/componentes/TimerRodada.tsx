import { useState, useEffect, useRef, useCallback } from 'react'
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
  sincronizarTimerExpirado,
} from '../../logica/acoes'

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
  const [aberto, setAberto] = useState(true)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!rodando) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setTick((tickAtual) => tickAtual + 1)
      atualizarTorneio(sincronizarTimerExpirado)
    }, 500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [rodando, atualizarTorneio])

  const segundos = segundosRestantesBase(timer)
  const temOpcaoPadrao = OPCOES_TIMER.some((opcao) => opcao.segundos === timer.totalSegundos)

  const handleToggle = useCallback(() => setAberto((a) => !a), [])

  return (
    <section className="card card-timer" aria-label="Timer da rodada">
      <button
        className="cabecalho-secao cabecalho-colapsavel"
        type="button"
        onClick={handleToggle}
        aria-expanded={aberto}
      >
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span className="label-timer-base">Timer base</span>
          <h2 style={{ margin: 0 }}>Rodada {timer.indiceRodada + 1}</h2>
        </div>
        <i className="fas fa-chevron-down icone-chevron" aria-hidden="true" />
      </button>

      <div className={`painel-colapsavel ${aberto ? 'painel-aberto' : ''}`}>
        {/* Display escuro com o tempo */}
        <output className="display-timer" aria-live="polite" style={{ display: 'block', marginBottom: 16 }}>
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
          O timer base vale para todas as mesas. Acréscimos individuais (+5 min) aparecem apenas no
          cartão da mesa correspondente.
        </p>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL DE QUALIDADE DA GRADE
// ═══════════════════════════════════════════════════════════════════════════════
