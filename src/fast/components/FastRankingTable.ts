import type { TournamentState } from "../../tournament/types";
import { escapeHtml } from "../../utils/format";

export function renderFastRanking(active: boolean, tournament: TournamentState): string {
  return `
    <section id="championship" class="card ${active ? "" : "hidden"}" aria-label="Classificacao geral">
      <div class="section-title-container">
        <i class="fas fa-chart-bar section-icon" aria-hidden="true"></i>
        <h2>Classificacao Geral</h2>
      </div>

      <div class="actions ranking-actions">
        <button class="btn-primary export-button" id="exportPdfButton" type="button">
          <i class="fas fa-download" aria-hidden="true"></i>
          Exportar PDF
        </button>
      </div>

      <table id="rankingTable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Jogador</th>
            <th>Pontos PT</th>
          </tr>
        </thead>
        <tbody>
          ${renderFastRankingRows(tournament)}
        </tbody>
      </table>

      <div class="actions ranking-reset">
        <button class="btn-outline danger-button" id="resetButton" type="button">
          <i class="fas fa-undo" aria-hidden="true"></i>
          Reiniciar torneio
        </button>
      </div>
    </section>
  `;
}

function renderFastRankingRows(tournament: TournamentState): string {
  return Object.entries(tournament.classification)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
    .map(
      ([player, points], index) => `
        <tr>
          <td>${index + 1}o</td>
          <td>${escapeHtml(player)}</td>
          <td>${points.toFixed(1)}</td>
        </tr>
      `,
    )
    .join("");
}
