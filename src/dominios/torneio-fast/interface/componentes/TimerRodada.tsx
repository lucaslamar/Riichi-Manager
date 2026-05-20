import { useState, useEffect, useRef } from 'react'
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
