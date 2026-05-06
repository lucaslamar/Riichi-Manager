import { isTournamentActive } from "./actions";
import { getTournament, isQuickSetupVisible } from "./state";
import { renderHeader } from "../components/Header";
import { renderHomeMenu } from "../components/HomeMenu";
import { renderQualityPanel } from "../components/QualityPanel";
import { renderRanking } from "../components/RankingTable";
import { renderTimerRodada } from "../components/RoundTimer";
import { renderRoundGrid } from "../components/RoundGrid";
import { renderSetupCard } from "../components/SetupCard";

/**
 * Compoe a pagina a partir dos componentes pequenos e do estado atual.
 *
 * @param app - Elemento raiz onde todo o HTML do aplicativo sera redesenhado.
 */
export function renderApp(app: HTMLDivElement): void {
  const torneio = getTournament();
  const torneioAtivo = isTournamentActive(torneio);
  const configuracaoRapidaVisivel = isQuickSetupVisible();

  app.innerHTML = `
    ${renderHeader()}
    <main class="content-wrapper">
      ${!torneioAtivo && !configuracaoRapidaVisivel ? renderHomeMenu() : ""}
      ${renderSetupCard(torneioAtivo, configuracaoRapidaVisivel)}
      ${renderRanking(torneioAtivo, torneio)}
      ${torneioAtivo ? renderTimerRodada(torneio) : ""}
      ${torneioAtivo && torneio.quality ? renderQualityPanel(torneio.quality) : ""}
      ${torneioAtivo ? renderRoundGrid(torneio.schedule, torneio) : ""}
    </main>
  `;
}
