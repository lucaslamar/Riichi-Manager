import { isTournamentActive } from "./actions";
import { getAppScreen, getTournament } from "./state";
import { renderFeaturePlaceholder } from "../components/FeaturePlaceholder";
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
  const telaAtual = getAppScreen();

  app.innerHTML = `
    ${renderHeader()}
    <main class="content-wrapper">
      ${!torneioAtivo && telaAtual === "home" ? renderHomeMenu() : ""}
      ${!torneioAtivo && telaAtual === "fastSetup" ? renderFastSetupCard(torneioAtivo, true) : ""}
      ${!torneioAtivo ? renderFeaturePlaceholder(telaAtual) : ""}
      ${renderFastRanking(torneioAtivo, torneio)}
      ${torneioAtivo ? renderTimerRodada(torneio) : ""}
      ${torneioAtivo && torneio.quality ? renderFastQualityPanel(torneio.quality) : ""}
      ${torneioAtivo ? renderFastRoundGrid(torneio.schedule, torneio) : ""}
    </main>
  `;
}
