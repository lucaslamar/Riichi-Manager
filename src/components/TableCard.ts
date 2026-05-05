import { getTableKey } from "../tournament/tableKeys";
import type { Round, Table, TournamentState } from "../tournament/types";
import { escapeHtml, formatScore } from "../utils/format";

// Renderiza uma mesa. O estado completed decide se inputs e botao ficam travados.
export function renderTableCard(
  round: Round,
  table: Table,
  roundIndex: number,
  tableIndex: number,
  tournament: TournamentState,
): string {
  const colorClass = `round-${round.id}`;
  const tableStorageKey = getTableKey(roundIndex, tableIndex);
  const completed = Boolean(tournament.completedTables[tableStorageKey]);
  const savedScores = tournament.tableScores[tableStorageKey];

  return `
    <article class="mesa-box ${colorClass}">
      <header>
        <span>Rodada ${round.id}</span>
        <strong>Mesa ${table.id}</strong>
      </header>
      <div class="seat-list">
        ${table.seats
          .map((seat, seatIndex) => {
            const value = savedScores?.[seatIndex] ?? formatScore(seat.score);

            return `
              <div class="player-row">
                <span class="vento-tag ${seat.wind.toLowerCase()}">${seat.wind}</span>
                <strong class="player-name">${escapeHtml(seat.player)}</strong>
                <input
                  id="score_${roundIndex}_${tableIndex}_${seatIndex}"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  aria-label="Pontuacao de ${escapeHtml(seat.player)}"
                  value="${value}"
                  class="${completed ? "input-locked" : ""}"
                  ${completed ? "disabled" : ""}
                />
              </div>
            `;
          })
          .join("")}
      </div>
      <button
        class="btn-primary save-button ${completed ? "btn-locked" : ""}"
        data-round="${roundIndex}"
        data-table="${tableIndex}"
        type="button"
      >
        <i class="fas ${completed ? "fa-check-circle" : "fa-save"}" aria-hidden="true"></i>
        ${completed ? "Mesa arquivada" : "Guardar mesa"}
      </button>
    </article>
  `;
}
