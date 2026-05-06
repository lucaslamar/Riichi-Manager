import type { Round, TournamentState } from "../tournament/types";
import { renderTableCard } from "./TableCard";

/**
 * Renderiza apenas as mesas da rodada selecionada no timer.
 *
 * @param rounds - Todas as rodadas geradas para o torneio.
 * @param tournament - Estado atual, incluindo a rodada ativa do timer.
 * @returns HTML da grade da rodada ativa.
 */
export function renderRoundGrid(rounds: Round[], tournament: TournamentState): string {
  const activeRoundIndex = tournament.roundTimer.roundIndex;
  const activeRound = rounds[activeRoundIndex] ?? rounds[0];

  if (!activeRound) {
    return "";
  }

  return `
    <section id="tablesContainer" aria-label="Mesas da rodada selecionada">
      <div class="section-title">
        <i class="fas fa-th-large section-icon" aria-hidden="true"></i>
        <div>
          <h2>Mesas da Rodada ${activeRound.id}</h2>
          <p class="section-subtitle">O timer e os acrescimos da tela valem para esta rodada selecionada.</p>
        </div>
      </div>
      <div id="roundsContainer" class="rounds-container">
        ${activeRound.tables
          .map((table, tableIndex) =>
            renderTableCard(activeRound, table, activeRoundIndex, tableIndex, tournament),
          )
          .join("")}
      </div>
    </section>
  `;
}
