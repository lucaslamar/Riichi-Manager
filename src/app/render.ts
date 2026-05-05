import { isTournamentActive } from "./actions";
import { getTournament } from "./state";
import { renderHeader } from "../components/Header";
import { renderQualityPanel } from "../components/QualityPanel";
import { renderRanking } from "../components/RankingTable";
import { renderRoundGrid } from "../components/RoundGrid";
import { renderSetupCard } from "../components/SetupCard";

// Compoe a pagina a partir de componentes pequenos e do estado atual.
export function renderApp(app: HTMLDivElement): void {
  const tournament = getTournament();
  const active = isTournamentActive(tournament);

  app.innerHTML = `
    ${renderHeader()}
    <main class="content-wrapper">
      ${renderSetupCard(active)}
      ${renderRanking(active, tournament)}
      ${active && tournament.quality ? renderQualityPanel(tournament.quality) : ""}
      ${active ? renderRoundGrid(tournament.schedule, tournament) : ""}
    </main>
  `;
}
