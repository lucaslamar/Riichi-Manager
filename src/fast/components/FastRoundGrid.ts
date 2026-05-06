import type { Round, TournamentState } from "../../tournament/types";
import { renderFastTableCard } from "./FastTableCard";

/**
 * Renderiza todas as mesas do torneio fast para auditoria de ventos e pessoas.
 *
 * @param rounds - Todas as rodadas geradas para o torneio.
 * @param tournament - Estado atual, incluindo a rodada selecionada no timer.
 * @returns HTML da grade completa do torneio fast.
 */
export function renderFastRoundGrid(rounds: Round[], tournament: TournamentState): string {
  const activeRound = rounds[tournament.roundTimer.roundIndex] ?? rounds[0];

  return `
    <section id="tablesContainer" aria-label="Grade completa de rodadas">
      <div class="section-title">
        <i class="fas fa-th-large section-icon" aria-hidden="true"></i>
        <div>
          <h2>Grade Completa de Rodadas</h2>
          <p class="section-subtitle">
            Todas as mesas ficam visiveis para conferir ventos e jogadores; o timer esta apontando para a Rodada ${activeRound?.id ?? 1}.
          </p>
        </div>
      </div>
      <div id="roundsContainer" class="rounds-container">
        ${rounds
          .map((round, roundIndex) =>
            round.tables
              .map((table, tableIndex) =>
                renderFastTableCard(round, table, roundIndex, tableIndex, tournament),
              )
              .join(""),
          )
          .join("")}
      </div>
    </section>
  `;
}
