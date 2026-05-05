import type { Round, TournamentState } from "../tournament/types";
import { renderTableCard } from "./TableCard";

export function renderRoundGrid(rounds: Round[], tournament: TournamentState): string {
  return `
    <section id="tablesContainer" aria-label="Grade de rodadas">
      <div class="section-title">
        <i class="fas fa-th-large section-icon" aria-hidden="true"></i>
        <h2>Grade de Rodadas</h2>
      </div>
      <div id="roundsContainer" class="rounds-container">
        ${rounds
          .map((round, roundIndex) =>
            round.tables
              .map((table, tableIndex) =>
                renderTableCard(round, table, roundIndex, tableIndex, tournament),
              )
              .join(""),
          )
          .join("")}
      </div>
    </section>
  `;
}
