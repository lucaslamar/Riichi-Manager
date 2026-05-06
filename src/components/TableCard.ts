import { TABLE_EXTENSION_SECONDS } from "../tournament/constants";
import { getTableKey } from "../tournament/tableKeys";
import type { Round, Table, TournamentState } from "../tournament/types";
import { escapeHtml, formatarDuracao, formatScore } from "../utils/format";
import { calcularSegundosRestantesMesa } from "../app/actions";

/**
 * Renderiza uma mesa com assentos, inputs de pontuacao e controles de acrescimo.
 *
 * @param rodada - Rodada oficial da grade.
 * @param mesa - Mesa que sera exibida.
 * @param indiceRodada - Indice baseado em zero usado nos IDs do DOM.
 * @param indiceMesa - Indice baseado em zero usado nos IDs do DOM.
 * @param torneio - Estado completo usado para saber se a mesa esta arquivada.
 * @returns HTML do cartao da mesa.
 */
export function renderTableCard(
  rodada: Round,
  mesa: Table,
  indiceRodada: number,
  indiceMesa: number,
  torneio: TournamentState,
): string {
  const classeCor = `round-${rodada.id}`;
  const chaveMesa = getTableKey(indiceRodada, indiceMesa);
  const concluida = Boolean(torneio.completedTables[chaveMesa]);
  const pontuacoesSalvas = torneio.tableScores[chaveMesa];
  const totalAcrescimos = torneio.roundTimer.tableExtensions[chaveMesa] ?? 0;
  const minutosExtras = totalAcrescimos * (TABLE_EXTENSION_SECONDS / 60);
  const segundosRestantesMesa = calcularSegundosRestantesMesa(torneio.roundTimer, chaveMesa);

  return `
    <article class="mesa-box ${classeCor}">
      <header>
        <span>Rodada ${rodada.id}</span>
        <strong>Mesa ${mesa.id}</strong>
      </header>
      <div class="table-time-summary">
        <span>Tempo da mesa</span>
        <strong>${formatarDuracao(segundosRestantesMesa)}</strong>
        <small>Acréscimo: +${minutosExtras} min</small>
      </div>
      <div class="seat-list">
        ${mesa.seats
          .map((assento, indiceAssento) => {
            const valor = pontuacoesSalvas?.[indiceAssento] ?? formatScore(assento.score);

            return `
              <div class="player-row">
                <span class="vento-tag ${assento.wind.toLowerCase()}">${assento.wind}</span>
                <strong class="player-name">${escapeHtml(assento.player)}</strong>
                <input
                  id="score_${indiceRodada}_${indiceMesa}_${indiceAssento}"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  aria-label="Pontuacao de ${escapeHtml(assento.player)}"
                  value="${valor}"
                  class="${concluida ? "input-locked" : ""}"
                  ${concluida ? "disabled" : ""}
                />
              </div>
            `;
          })
          .join("")}
      </div>
      <div class="table-actions">
        <button
          class="btn-outline table-time-button"
          data-round="${indiceRodada}"
          data-table="${indiceMesa}"
          type="button"
        >
          <i class="fas fa-clock" aria-hidden="true"></i>
          +${TABLE_EXTENSION_SECONDS / 60} min mesa${totalAcrescimos > 0 ? ` (${totalAcrescimos}x)` : ""}
        </button>
        <button
          class="btn-primary save-button ${concluida ? "btn-locked" : ""}"
          data-round="${indiceRodada}"
          data-table="${indiceMesa}"
          type="button"
        >
          <i class="fas ${concluida ? "fa-check-circle" : "fa-save"}" aria-hidden="true"></i>
          ${concluida ? "Mesa arquivada" : "Guardar mesa"}
        </button>
      </div>
    </article>
  `;
}
