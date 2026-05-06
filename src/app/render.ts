import { isTournamentActive } from "./actions";
import { getTournament, isQuickSetupVisible } from "./state";
import { renderHeader } from "../components/Header";
import { renderHomeMenu } from "../components/HomeMenu";
import { renderFastQualityPanel } from "../fast/components/FastQualityPanel";
import { renderFastRanking } from "../fast/components/FastRankingTable";
import { renderTimerRodada } from "../components/RoundTimer";
import { renderFastRoundGrid } from "../fast/components/FastRoundGrid";
import { renderFastSetupCard } from "../fast/components/FastSetupCard";

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
      ${renderFastSetupCard(torneioAtivo, configuracaoRapidaVisivel)}
      ${renderFastRanking(torneioAtivo, torneio)}
      ${torneioAtivo ? renderTimerRodada(torneio) : ""}
      ${torneioAtivo && torneio.quality ? renderFastQualityPanel(torneio.quality) : ""}
      ${torneioAtivo ? renderFastRoundGrid(torneio.schedule, torneio) : ""}
    </main>
  `;
}
