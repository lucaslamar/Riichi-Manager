import { TABLE_EXTENSION_SECONDS } from "../tournament/constants";
import type { TournamentState } from "../tournament/types";
import { formatarDuracao } from "../utils/format";
import { calcularSegundosRestantes } from "../app/actions";

/**
 * Renderiza o cronometro global da rodada.
 *
 * @param torneio - Estado atual com rodadas e timer persistido.
 * @returns HTML dos controles de tempo ou string vazia quando nao ha torneio ativo.
 */
export function renderTimerRodada(torneio: TournamentState): string {
  if (torneio.schedule.length === 0) {
    return "";
  }

  const timerRodada = torneio.roundTimer;
  const segundosRestantes = calcularSegundosRestantes(timerRodada);
  const textoBotaoPrincipal = timerRodada.isRunning ? "Pausar" : "Iniciar";
  const iconeBotaoPrincipal = timerRodada.isRunning ? "fa-pause" : "fa-play";

  return `
    <section class="card timer-card" aria-label="Timer global da rodada">
      <div class="timer-header">
        <div>
          <span class="timer-kicker">Timer global</span>
          <h2>Rodada ${timerRodada.roundIndex + 1}</h2>
        </div>
        <output class="timer-display" id="roundTimerDisplay" aria-live="polite">
          ${formatarDuracao(segundosRestantes)}
        </output>
      </div>

      <div class="timer-controls">
        <label class="timer-round-picker">
          Rodada
          <select id="roundTimerSelect" aria-label="Escolher rodada do timer">
            ${torneio.schedule
              .map(
                (rodada, indiceRodada) => `
                  <option value="${indiceRodada}" ${indiceRodada === timerRodada.roundIndex ? "selected" : ""}>
                    Rodada ${rodada.id}
                  </option>
                `,
              )
              .join("")}
          </select>
        </label>
        <button class="btn-primary" id="toggleRoundTimerButton" type="button">
          <i class="fas ${iconeBotaoPrincipal}" aria-hidden="true"></i>
          ${textoBotaoPrincipal}
        </button>
        <button class="btn-outline" id="addGlobalTimeButton" type="button">
          <i class="fas fa-plus" aria-hidden="true"></i>
          +${TABLE_EXTENSION_SECONDS / 60} min global
        </button>
        <button class="btn-outline" id="resetRoundTimerButton" type="button">
          <i class="fas fa-rotate-left" aria-hidden="true"></i>
          Resetar timer
        </button>
      </div>

      <p class="timer-help">
        Use o +5 min da mesa quando uma mesa precisar de acrescimo de campeonato; o tempo entra no timer global e fica registrado no cartao da mesa.
      </p>
    </section>
  `;
}
